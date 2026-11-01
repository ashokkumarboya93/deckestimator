# =============================================
# Deck Estimator — Training Pipeline (Phase 7)
# =============================================
"""
Trains MobileNetV3 multi-task deck condition model with early stopping,
checkpoint saving, and zero-data-leakage verification.
"""

import os
import sys
import json
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Ensure ml-service root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.model import DeckConditionMobileNet
from training.dataset import DeckConditionDataset, verify_no_data_leakage


def train_model(
    data_dir: str,
    output_model_path: str,
    epochs: int = 5,
    batch_size: int = 8,
    learning_rate: float = 1e-3,
    device: str = 'cpu'
):
    print(f"Initializing training pipeline on device: {device}")

    # 1. Load Datasets
    train_ds = DeckConditionDataset(data_dir, split='train')
    val_ds = DeckConditionDataset(data_dir, split='val')
    test_ds = DeckConditionDataset(data_dir, split='test')

    print(f"Dataset splits: {len(train_ds)} train, {len(val_ds)} val, {len(test_ds)} test")

    # 2. Strict Data Leakage Check
    verify_no_data_leakage(train_ds, val_ds, test_ds)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    # 3. Model, Loss, Optimizer
    model = DeckConditionMobileNet(pretrained=True)
    model.to(device)

    condition_criterion = nn.CrossEntropyLoss()
    defect_criterion = nn.BCEWithLogitsLoss()

    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)

    best_val_loss = float('inf')
    history = []

    print("\n--- Commencing Multi-Task Training ---")
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for images, cond_targets, defect_targets in train_loader:
            images = images.to(device)
            cond_targets = cond_targets.to(device)
            defect_targets = defect_targets.to(device)

            optimizer.zero_grad()
            cond_logits, defect_logits = model(images)

            loss_cond = condition_criterion(cond_logits, cond_targets)
            loss_defects = defect_criterion(defect_logits, defect_targets)
            total_loss = loss_cond + 1.2 * loss_defects

            total_loss.backward()
            optimizer.step()

            train_loss += total_loss.item() * images.size(0)
            preds = torch.argmax(cond_logits, dim=-1)
            train_correct += (preds == cond_targets).sum().item()
            total_train += images.size(0)

        epoch_train_loss = train_loss / total_train
        epoch_train_acc = train_correct / total_train

        # Validation Step
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for images, cond_targets, defect_targets in val_loader:
                images = images.to(device)
                cond_targets = cond_targets.to(device)
                defect_targets = defect_targets.to(device)

                cond_logits, defect_logits = model(images)
                loss_cond = condition_criterion(cond_logits, cond_targets)
                loss_defects = defect_criterion(defect_logits, defect_targets)
                total_loss = loss_cond + 1.2 * loss_defects

                val_loss += total_loss.item() * images.size(0)
                preds = torch.argmax(cond_logits, dim=-1)
                val_correct += (preds == cond_targets).sum().item()
                total_val += images.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = val_correct / total_val

        print(
            f"Epoch {epoch}/{epochs} | "
            f"Train Loss: {epoch_train_loss:.4f}, Acc: {epoch_train_acc:.1%} | "
            f"Val Loss: {epoch_val_loss:.4f}, Acc: {epoch_val_acc:.1%}"
        )

        history.append({
            "epoch": epoch,
            "trainLoss": round(epoch_train_loss, 4),
            "trainAcc": round(epoch_train_acc, 4),
            "valLoss": round(epoch_val_loss, 4),
            "valAcc": round(epoch_val_acc, 4),
        })

        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
            torch.save(model.state_dict(), output_model_path)
            print(f"  -> Best model saved to: {output_model_path}")

    duration = round(time.time() - start_time, 2)
    print(f"\nTraining completed in {duration}s. Best Val Loss: {best_val_loss:.4f}")

    # 4. Save Training Metadata
    meta_path = os.path.join(os.path.dirname(output_model_path), "training_metadata.json")
    metadata = {
        "modelName": "MobileNetV3-DeckCondition",
        "modelVersion": "1.0.0",
        "architecture": "MobileNetV3-Small (Multi-Task)",
        "datasetVersion": "pilot-v1",
        "trainSamples": len(train_ds),
        "valSamples": len(val_ds),
        "testSamples": len(test_ds),
        "epochs": epochs,
        "batchSize": batch_size,
        "learningRate": learning_rate,
        "bestValLoss": round(best_val_loss, 4),
        "finalValAccuracy": history[-1]["valAcc"] if history else None,
        "durationSeconds": duration,
        "history": history,
    }

    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] Training metadata written to: {meta_path}")


if __name__ == "__main__":
    data_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    model_output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "deck_condition_mobilenet_v3.pth"))
    train_model(data_directory, model_output_path, epochs=5)
