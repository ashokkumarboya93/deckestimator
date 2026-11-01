# =============================================
# Deck Estimator — Dataset Loader & Validation (Phase 7)
# =============================================

import os
import json
from typing import List, Dict, Any, Tuple
from PIL import Image
import torch
from torch.utils.data import Dataset

from app.preprocessing import get_train_transform, get_inference_transform
from app.model import DEFECT_LABELS


class DeckConditionDataset(Dataset):
    """
    Dataset representing annotated deck condition images.
    Enforces strict annotation validation and leakage checks.
    """
    def __init__(self, data_dir: str, split: str = 'train', transform=None):
        self.data_dir = os.path.join(data_dir, split)
        self.split = split
        self.transform = transform or (get_train_transform() if split == 'train' else get_inference_transform())
        self.samples: List[Dict[str, Any]] = []

        self._load_and_validate_annotations()

    def _load_and_validate_annotations(self):
        annotations_file = os.path.join(self.data_dir, "annotations.json")
        if not os.path.exists(annotations_file):
            print(f"Warning: No annotations.json found in {self.data_dir}")
            return

        with open(annotations_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for item in data:
            image_path = os.path.join(self.data_dir, item["filename"])
            if not os.path.exists(image_path):
                print(f"Warning: Missing image file: {image_path}")
                continue

            # Validate condition level (1..5)
            level = item.get("conditionLevel")
            if level not in (1, 2, 3, 4, 5):
                print(f"Warning: Invalid condition level {level} in {item.get('imageId')}")
                continue

            # Multi-hot defect vector (9 dimensions)
            defect_vector = torch.zeros(len(DEFECT_LABELS), dtype=torch.float32)
            for d in item.get("defects", []):
                if d in DEFECT_LABELS:
                    defect_vector[DEFECT_LABELS.index(d)] = 1.0

            self.samples.append({
                "image_path": image_path,
                "deck_id": item.get("deckId", "deck-unknown"),
                "condition_level": level - 1,  # 0-indexed for CrossEntropyLoss
                "defect_vector": defect_vector,
                "metadata": item,
            })

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, torch.Tensor]:
        sample = self.samples[idx]
        image = Image.open(sample["image_path"]).convert("RGB")

        if self.transform:
            image_tensor = self.transform(image)
        else:
            image_tensor = get_inference_transform()(image)

        condition_target = sample["condition_level"]
        defect_target = sample["defect_vector"]

        return image_tensor, condition_target, defect_target


def verify_no_data_leakage(train_dataset: DeckConditionDataset, val_dataset: DeckConditionDataset, test_dataset: DeckConditionDataset):
    """
    Validates that images from the same physical deck do NOT overlap across splits.
    (Spec §8.6 Data Leakage Prevention)
    """
    train_decks = {s["deck_id"] for s in train_dataset.samples}
    val_decks = {s["deck_id"] for s in val_dataset.samples}
    test_decks = {s["deck_id"] for s in test_dataset.samples}

    leakage_train_val = train_decks.intersection(val_decks)
    leakage_train_test = train_decks.intersection(test_decks)
    leakage_val_test = val_decks.intersection(test_decks)

    assert not leakage_train_val, f"Data leakage between Train and Val: {leakage_train_val}"
    assert not leakage_train_test, f"Data leakage between Train and Test: {leakage_train_test}"
    assert not leakage_val_test, f"Data leakage between Val and Test: {leakage_val_test}"

    print(f"Verified zero data leakage across {len(train_decks)} train, {len(val_decks)} val, {len(test_decks)} test decks.")
