# =============================================
# Deck Estimator — MobileNetV3 Multi-Task Model (Phase 7)
# =============================================
"""
Implements transfer learning with MobileNetV3-Small featuring a shared
convolutional backbone and two decoupled prediction heads:
1. Condition Severity Head (5-class softmax)
2. Defect Detection Head (9-class multi-label sigmoid)
"""

import os
from typing import Dict, Any, List, Optional
import torch
import torch.nn as nn
from torchvision import models


CONDITION_LEVEL_LABELS = {
    1: "GOOD",
    2: "MILD_WEAR",
    3: "MODERATE_DETERIORATION",
    4: "SEVERE_DETERIORATION",
    5: "SIGNIFICANT_WOOD_DAMAGE",
}

DEFECT_LABELS = [
    "PEELING_COATING",
    "FADING_DISCOLORATION",
    "SURFACE_WEAR",
    "CRACKS",
    "SPLINTERING",
    "DARK_STAINING",
    "VISIBLE_WOOD_DAMAGE",
    "COATING_LOSS",
    "OTHER_VISIBLE_DEFECT",
]


class DeckConditionMobileNet(nn.Module):
    """
    Multi-task convolutional network for deck condition and defect classification.
    """
    def __init__(self, pretrained: bool = True, num_conditions: int = 5, num_defects: int = 9):
        super().__init__()
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        base = models.mobilenet_v3_small(weights=weights)

        # Feature extractor up to adaptive pooling
        self.features = base.features
        self.avgpool = base.avgpool

        # In MobileNetV3-Small, feature output dimension before classifier is 576
        in_features = 576

        # Shared representation projection
        self.shared_proj = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.25),
        )

        # Task A Head: Condition Severity (1..5)
        self.condition_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_conditions),
        )

        # Task B Head: Multi-Label Visible Defects (9 labels)
        self.defect_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_defects),
        )

    def forward(self, x: torch.Tensor):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        shared = self.shared_proj(x)

        condition_logits = self.condition_head(shared)
        defect_logits = self.defect_head(shared)

        return condition_logits, defect_logits


def load_model(weights_path: Optional[str] = None, device: str = 'cpu') -> DeckConditionMobileNet:
    """
    Initializes and loads the model weights if available.
    """
    model = DeckConditionMobileNet(pretrained=(weights_path is None or not os.path.exists(weights_path)))

    if weights_path and os.path.exists(weights_path):
        checkpoint = torch.load(weights_path, map_location=device)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        elif isinstance(checkpoint, dict):
            model.load_state_dict(checkpoint)
        print(f"Loaded trained weights from: {weights_path}")
    else:
        print("Using initialized transfer-learning weights for MobileNetV3.")

    model.to(device)
    model.eval()
    return model


def predict(
    model: DeckConditionMobileNet,
    tensor: torch.Tensor,
    confidence_threshold: float = 0.55,
    device: str = 'cpu'
) -> Dict[str, Any]:
    """
    Runs multi-task inference and applies confidence/uncertainty calibration.
    """
    tensor = tensor.to(device)

    with torch.no_grad():
        cond_logits, defect_logits = model(tensor)

        # 1. Condition Severity Evaluation
        cond_probs = torch.softmax(cond_logits, dim=-1).squeeze(0)
        pred_idx = int(torch.argmax(cond_probs).item())
        condition_level = pred_idx + 1  # 1-indexed (1..5)
        condition_label = CONDITION_LEVEL_LABELS.get(condition_level, "UNKNOWN")
        condition_confidence = float(cond_probs[pred_idx].item())

        # 2. Multi-Label Defect Evaluation
        defect_probs = torch.sigmoid(defect_logits).squeeze(0)
        defects_output: List[Dict[str, Any]] = []

        has_wood_damage_detected = False
        for idx, defect_name in enumerate(DEFECT_LABELS):
            prob = float(defect_probs[idx].item())
            detected = prob >= 0.50
            if detected and defect_name == "VISIBLE_WOOD_DAMAGE":
                has_wood_damage_detected = True
            defects_output.append({
                "label": defect_name,
                "confidence": round(prob, 4),
                "detected": detected,
            })

        # 3. Uncertainty & Manual Review Logic (Spec §10.2)
        manual_review_required = False
        manual_review_reason = None

        if condition_confidence < confidence_threshold:
            manual_review_required = True
            manual_review_reason = (
                f"Condition classification confidence ({condition_confidence:.1%}) is below approved reliability threshold ({confidence_threshold:.0%})."
            )
        elif condition_level == 5:
            manual_review_required = True
            manual_review_reason = (
                "Photographs exhibit potential significant visible wood damage. On-site professional physical inspection recommended to verify board integrity."
            )
        elif has_wood_damage_detected and condition_level in (1, 2):
            manual_review_required = True
            manual_review_reason = (
                "Conflicting predictions: Model flagged visible wood damage while overall condition was scored as mild/good."
            )

        status = "REQUIRES_MANUAL_REVIEW" if manual_review_required else "COMPLETED"

        return {
            "status": status,
            "condition": {
                "level": condition_level,
                "label": condition_label,
                "confidence": round(condition_confidence, 4),
            },
            "defects": defects_output,
            "manualReview": {
                "required": manual_review_required,
                "reason": manual_review_reason,
            },
        }
