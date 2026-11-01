# =============================================
# Deck Estimator — Pilot Dataset Generator (Phase 7)
# =============================================
"""
Generates a deterministic pilot dataset of wood surface patterns representing
the 5 condition levels and 9 defect types to validate the ML training and evaluation
pipeline without inventing or misrepresenting commercial production data.
"""

import os
import json
import random
from PIL import Image, ImageDraw
import numpy as np

LEVEL_DEFAULTS = {
    1: {
        "label": "GOOD",
        "defects": [],
        "base_color": (195, 135, 75),  # Rich amber/cedar
        "noise_level": 5,
    },
    2: {
        "label": "MILD_WEAR",
        "defects": ["FADING_DISCOLORATION", "SURFACE_WEAR"],
        "base_color": (160, 130, 95),  # Weathered/faded
        "noise_level": 12,
    },
    3: {
        "label": "MODERATE_DETERIORATION",
        "defects": ["PEELING_COATING", "FADING_DISCOLORATION", "DARK_STAINING"],
        "base_color": (135, 105, 70),  # Peeling / patchy
        "noise_level": 20,
    },
    4: {
        "label": "SEVERE_DETERIORATION",
        "defects": ["PEELING_COATING", "CRACKS", "COATING_LOSS", "SURFACE_WEAR"],
        "base_color": (110, 85, 55),   # Severely deteriorated
        "noise_level": 30,
    },
    5: {
        "label": "SIGNIFICANT_WOOD_DAMAGE",
        "defects": ["SPLINTERING", "VISIBLE_WOOD_DAMAGE", "CRACKS"],
        "base_color": (85, 65, 45),    # Deep wood fissure damage
        "noise_level": 35,
    },
}


def generate_wood_surface(level: int, seed: int) -> Image.Image:
    """
    Renders a synthesized wooden deck surface reflecting condition severity.
    """
    np.random.seed(seed)
    random.seed(seed)
    cfg = LEVEL_DEFAULTS[level]

    width, height = 320, 320
    base_rgb = cfg["base_color"]

    # Base planks
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    for c in range(3):
        noise = np.random.normal(0, cfg["noise_level"], (height, width))
        arr[:, :, c] = np.clip(base_rgb[c] + noise, 0, 255).astype(np.uint8)

    img = Image.fromarray(arr, 'RGB')
    draw = ImageDraw.Draw(img)

    # Plank seams (horizontal deck boards)
    for y in range(40, height, 70):
        draw.line([(0, y), (width, y)], fill=(35, 25, 15), width=2)

    # Condition-specific defect artifacts
    if level >= 2:
        # Fading bands
        for _ in range(3):
            x1 = random.randint(10, width - 60)
            y1 = random.randint(10, height - 60)
            draw.ellipse([x1, y1, x1 + 50, y1 + 30], fill=(base_rgb[0] + 25, base_rgb[1] + 20, base_rgb[2] + 15))

    if level >= 3:
        # Peeling / flaking patches (darker exposed underlying spots)
        for _ in range(5):
            x = random.randint(20, width - 40)
            y = random.randint(20, height - 40)
            draw.rectangle([x, y, x + random.randint(15, 35), y + random.randint(10, 25)], fill=(60, 45, 30))

    if level >= 4:
        # Surface cracks (jagged lines along grain)
        for _ in range(4):
            start_x = random.randint(30, width - 50)
            start_y = random.randint(20, height - 80)
            points = [(start_x, start_y)]
            for step in range(5):
                points.append((
                    points[-1][0] + random.randint(-4, 4),
                    points[-1][1] + random.randint(8, 16)
                ))
            draw.line(points, fill=(15, 10, 5), width=random.randint(1, 3))

    if level == 5:
        # Deep wood splintering & structural break fissures
        for _ in range(4):
            sx = random.randint(20, width - 60)
            sy = random.randint(20, height - 80)
            fissure = [(sx, sy)]
            for _ in range(7):
                fissure.append((
                    fissure[-1][0] + random.randint(-6, 6),
                    fissure[-1][1] + random.randint(10, 20)
                ))
            draw.line(fissure, fill=(0, 0, 0), width=4)
            # Splinter flakes
            for pt in fissure[1:-1]:
                draw.line([(pt[0], pt[1]), (pt[0] + random.randint(-12, 12), pt[1] + random.randint(-8, 8))], fill=(180, 140, 90), width=2)

    return img


def generate_pilot_dataset(output_dir: str):
    """
    Builds train, val, test splits with deck-isolated annotations.
    """
    splits = {
        "train": {"per_level": 15, "prefix": "deck_train"},
        "val": {"per_level": 5, "prefix": "deck_val"},
        "test": {"per_level": 5, "prefix": "deck_test"},
    }

    print("Generating pilot deck condition dataset...")

    for split_name, cfg in splits.items():
        split_dir = os.path.join(output_dir, split_name)
        os.makedirs(split_dir, exist_ok=True)
        annotations = []

        deck_counter = 1
        for level in range(1, 6):
            level_info = LEVEL_DEFAULTS[level]
            for idx in range(cfg["per_level"]):
                seed = (hash(split_name) % 10000) + (level * 100) + idx
                img = generate_wood_surface(level, seed)

                filename = f"condition_L{level}_{split_name}_{idx:03d}.jpg"
                img_path = os.path.join(split_dir, filename)
                img.save(img_path, format="JPEG", quality=90)

                deck_id = f"{cfg['prefix']}_{deck_counter:03d}"
                deck_counter += 1

                annotations.append({
                    "imageId": f"img-{split_name}-L{level}-{idx:03d}",
                    "filename": filename,
                    "deckId": deck_id,
                    "deckType": "wood",
                    "conditionLevel": level,
                    "conditionLabel": level_info["label"],
                    "defects": level_info["defects"],
                    "imageQuality": "GOOD",
                    "annotationStatus": "APPROVED",
                    "annotatorId": "pilot-generator-001",
                    "reviewerId": "lead-cv-engineer",
                })

        ann_path = os.path.join(split_dir, "annotations.json")
        with open(ann_path, 'w', encoding='utf-8') as f:
            json.dump(annotations, f, indent=2)

        print(f"[OK] Split '{split_name}': {len(annotations)} samples written to {ann_path}")


if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    generate_pilot_dataset(base_dir)
