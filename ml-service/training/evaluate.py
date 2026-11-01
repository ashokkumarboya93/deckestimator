# =============================================
# Deck Estimator — Evaluation Pipeline (Phase 7)
# =============================================
"""
Evaluates the trained MobileNetV3 multi-task model on the held-out test split.
Calculates per-class precision, recall, F1, confusion matrix, and defect metrics.
"""

import os
import sys
import json
import torch
import numpy as np
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.model import (
    load_model,
    CONDITION_LEVEL_LABELS,
    DEFECT_LABELS,
)
from training.dataset import DeckConditionDataset


def evaluate_model(
    data_dir: str,
    weights_path: str,
    output_report_path: str,
    device: str = 'cpu'
):
    print("Running comprehensive evaluation on held-out test split...")
    test_ds = DeckConditionDataset(data_dir, split='test')
    test_loader = DataLoader(test_ds, batch_size=8, shuffle=False)

    model = load_model(weights_path=weights_path, device=device)
    model.eval()

    all_cond_true = []
    all_cond_pred = []
    all_cond_probs = []

    all_defect_true = []
    all_defect_pred = []
    all_defect_probs = []

    with torch.no_grad():
        for images, cond_targets, defect_targets in test_loader:
            images = images.to(device)
            cond_logits, defect_logits = model(images)

            # Condition
            cond_probs = torch.softmax(cond_logits, dim=-1)
            cond_preds = torch.argmax(cond_probs, dim=-1)

            all_cond_true.extend(cond_targets.cpu().numpy().tolist())
            all_cond_pred.extend(cond_preds.cpu().numpy().tolist())
            all_cond_probs.extend(cond_probs.cpu().numpy().tolist())

            # Defects
            defect_probs = torch.sigmoid(defect_logits)
            defect_preds = (defect_probs >= 0.50).float()

            all_defect_true.extend(defect_targets.cpu().numpy().tolist())
            all_defect_pred.extend(defect_preds.cpu().numpy().tolist())
            all_defect_probs.extend(defect_probs.cpu().numpy().tolist())

    # 1. Condition Level Evaluation
    cond_target_names = [f"Level {k} ({CONDITION_LEVEL_LABELS[k]})" for k in range(1, 6)]
    unique_classes = sorted(list(set(all_cond_true)))

    # Per-class metrics
    p, r, f1, sup = precision_recall_fscore_support(
        all_cond_true, all_cond_pred, labels=list(range(5)), zero_division=0
    )

    per_class_condition = {}
    for idx in range(5):
        lvl = idx + 1
        per_class_condition[f"Level_{lvl}_{CONDITION_LEVEL_LABELS[lvl]}"] = {
            "precision": round(float(p[idx]), 4),
            "recall": round(float(r[idx]), 4),
            "f1": round(float(f1[idx]), 4),
            "support": int(sup[idx]),
        }

    conf_mat = confusion_matrix(all_cond_true, all_cond_pred, labels=list(range(5))).tolist()

    total_samples = len(all_cond_true)
    accuracy = float(np.mean(np.array(all_cond_true) == np.array(all_cond_pred)))

    # 2. Defect Evaluation
    all_defect_true_arr = np.array(all_defect_true)
    all_defect_pred_arr = np.array(all_defect_pred)

    per_defect_metrics = {}
    for idx, d_name in enumerate(DEFECT_LABELS):
        dp, dr, df, dsup = precision_recall_fscore_support(
            all_defect_true_arr[:, idx], all_defect_pred_arr[:, idx], average='binary', zero_division=0
        )
        per_defect_metrics[d_name] = {
            "precision": round(float(dp), 4),
            "recall": round(float(dr), 4),
            "f1": round(float(df), 4),
            "support": int(np.sum(all_defect_true_arr[:, idx])),
        }

    # 3. Confidence & Uncertainty Stats
    all_max_cond_probs = [max(p_row) for p_row in all_cond_probs]
    mean_confidence = float(np.mean(all_max_cond_probs))
    low_confidence_count = sum(1 for c in all_max_cond_probs if c < 0.55)

    report = {
        "evaluationDataset": "pilot-v1 (Held-out Test Split)",
        "testSamples": total_samples,
        "overallConditionAccuracy": round(accuracy, 4),
        "meanConditionConfidence": round(mean_confidence, 4),
        "lowConfidenceCount": low_confidence_count,
        "manualReviewFlagRate": round(low_confidence_count / max(total_samples, 1), 4),
        "conditionPerClassMetrics": per_class_condition,
        "confusionMatrix": conf_mat,
        "defectMetrics": per_defect_metrics,
        "modelDetails": {
            "name": "MobileNetV3-DeckCondition",
            "version": "1.0.0",
            "architecture": "MobileNetV3-Small (Multi-Task)",
            "weightsPath": weights_path,
        },
    }

    os.makedirs(os.path.dirname(output_report_path), exist_ok=True)
    with open(output_report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"[OK] Evaluation report written to: {output_report_path}")
    print(f"Overall Test Accuracy: {accuracy:.1%}, Mean Confidence: {mean_confidence:.1%}")

    return report


if __name__ == "__main__":
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    weights = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "deck_condition_mobilenet_v3.pth"))
    report_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "evaluation_report.json"))
    evaluate_model(data_dir, weights, report_file)
