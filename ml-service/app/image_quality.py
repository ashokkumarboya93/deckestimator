# =============================================
# Deck Estimator — Image Quality Assessment Module (Phase 7)
# =============================================
"""
Evaluates uploaded deck photographs to determine whether they meet the
optical and resolution requirements for reliable AI visual condition analysis.
Implements spec §6 Image Quality categories: GOOD, FAIR, POOR.
"""

from typing import Dict, Any, List
from PIL import Image
import numpy as np


def compute_laplacian_variance(gray_array: np.ndarray) -> float:
    """
    Computes variance of the Laplacian using discrete convolution kernel.
    Higher variance corresponds to sharper edge transitions (less blur).
    """
    # 3x3 Laplacian kernel
    kernel = np.array([
        [0, 1, 0],
        [1, -4, 1],
        [0, 1, 0]
    ], dtype=np.float32)

    # Pad array
    padded = np.pad(gray_array.astype(np.float32), 1, mode='edge')
    h, w = gray_array.shape

    # Fast 2D convolution using vectorized slices
    convolved = (
        kernel[0, 1] * padded[:-2, 1:-1] +
        kernel[1, 0] * padded[1:-1, :-2] +
        kernel[1, 1] * padded[1:-1, 1:-1] +
        kernel[1, 2] * padded[1:-1, 2:] +
        kernel[2, 1] * padded[2:, 1:-1]
    )

    return float(np.var(convolved))


def assess_image_quality(image: Image.Image) -> Dict[str, Any]:
    """
    Assesses image focus (blur), brightness, and resolution.
    Returns:
        dict: {
            "label": "GOOD" | "FAIR" | "POOR",
            "confidence": float,
            "blurScore": float,
            "brightness": float,
            "resolution": str,
            "issues": list[str]
        }
    """
    width, height = image.size
    resolution_str = f"{width}x{height}"
    issues: List[str] = []

    # 1. Resolution Check
    is_low_res = width < 300 or height < 300
    is_very_low_res = width < 180 or height < 180

    if is_very_low_res:
        issues.append(f"Image resolution ({resolution_str}) is severely below required minimum (300x300).")
    elif is_low_res:
        issues.append(f"Image resolution ({resolution_str}) is below recommended 300x300.")

    # Convert to grayscale for optical metrics
    gray = image.convert('L')
    gray_arr = np.asarray(gray)

    # 2. Brightness Check (mean pixel value 0..255)
    brightness = float(np.mean(gray_arr))
    if brightness < 30:
        issues.append("Image is severely underexposed (too dark).")
    elif brightness < 60:
        issues.append("Image has low lighting / heavy shadows.")
    elif brightness > 235:
        issues.append("Image is severely overexposed (washed out).")
    elif brightness > 215:
        issues.append("Image has harsh glare or high reflection.")

    # 3. Blur Check (Laplacian Variance)
    blur_score = compute_laplacian_variance(gray_arr)
    if blur_score < 40:
        issues.append(f"Heavy optical blur detected (blur index: {blur_score:.1f}). Surface textures are indistinct.")
    elif blur_score < 110:
        issues.append(f"Moderate motion or focus blur detected (blur index: {blur_score:.1f}).")

    # Determine Quality Category
    if is_very_low_res or blur_score < 40 or brightness < 30 or brightness > 235:
        label = "POOR"
        confidence = 0.95
    elif is_low_res or blur_score < 110 or brightness < 60 or brightness > 215:
        label = "FAIR"
        confidence = 0.85
    else:
        label = "GOOD"
        confidence = 0.96

    return {
        "label": label,
        "confidence": confidence,
        "blurScore": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "resolution": resolution_str,
        "issues": issues,
    }
