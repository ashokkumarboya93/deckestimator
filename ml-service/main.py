# =============================================
# Deck Estimator — Python FastAPI ML Inference Service (Phase 7)
# =============================================
"""
FastAPI service exposing endpoints for health checks and
computer-vision based deck condition & visible defect analysis.
"""

import io
import os
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from app.image_quality import assess_image_quality
from app.preprocessing import prepare_image_for_inference
from app.model import load_model, predict, DeckConditionMobileNet

app = FastAPI(
    title="Deck Estimator — Condition Analysis API",
    version="1.0.0",
    description="AI-assisted visual condition and visible defect analysis for residential decks."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "deck_condition_mobilenet_v3.pth")
model_instance: Optional[DeckConditionMobileNet] = None


@app.on_event("startup")
def startup_event():
    global model_instance
    try:
        model_instance = load_model(weights_path=MODEL_PATH)
        print("Model initialized successfully.")
    except Exception as e:
        print(f"Warning: Failed to load model weights on startup: {e}")


@app.get("/health")
def health_check():
    """
    Health check endpoint verifying service availability and model readiness.
    """
    return {
        "status": "healthy",
        "service": "deck-condition-analysis",
        "modelLoaded": model_instance is not None,
        "modelVersion": "1.0.0",
        "modelArchitecture": "MobileNetV3-Small (Multi-Task)",
    }


@app.post("/api/v1/analyze")
async def analyze_deck_image(
    file: UploadFile = File(...),
    analysisId: Optional[str] = Form(None),
    deckSurface: Optional[str] = Form("wood"),
):
    """
    Analyzes an uploaded deck photograph:
    1. Assesses optical image quality (blur, exposure, resolution).
    2. If poor, returns UNABLE_TO_ASSESS with manual review recommendation.
    3. Runs multi-task inference for 5-level severity and 9 visible defect labels.
    4. Applies confidence thresholds and returns structured prediction payload.
    """
    global model_instance
    if model_instance is None:
        model_instance = load_model(weights_path=MODEL_PATH)

    # 1. Validate file extension / MIME
    allowed_mimes = {"image/jpeg", "image/png", "image/webp"}
    content_type = file.content_type or ""
    if content_type and content_type not in allowed_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type: {content_type}. Supported formats: JPEG, PNG, WebP."
        )

    # 2. Decode image
    try:
        file_bytes = await file.read()
        image = Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image file: {str(e)}"
        )

    # 3. Image Quality Assessment
    quality_result = assess_image_quality(image)

    # 4. Handle Poor Quality (Spec §6.2 Unable-to-Assess State)
    if quality_result["label"] == "POOR":
        issues_str = "; ".join(quality_result["issues"]) if quality_result["issues"] else "Insufficient visual detail."
        return {
            "analysisId": analysisId,
            "status": "UNABLE_TO_ASSESS",
            "imageQuality": quality_result,
            "condition": None,
            "defects": [],
            "manualReview": {
                "required": True,
                "reason": f"Photograph quality is unsuitable for reliable automated assessment: {issues_str}"
            },
            "model": {
                "name": "MobileNetV3-DeckCondition",
                "version": "1.0.0",
                "datasetVersion": "pilot-v1"
            },
            "limitations": [
                "Assessment could not proceed due to optical blur, inadequate lighting, or insufficient resolution.",
                "Please upload a clearer photograph taken with direct lighting and focused deck surface coverage."
            ]
        }

    # 5. Preprocess and Run Inference
    tensor = prepare_image_for_inference(image)
    prediction = predict(model_instance, tensor)

    # If Fair quality, append caveat limitation
    limitations = [
        "Assessment is based only on visible photograph content.",
        "Structural safety, load-bearing capacity, and hidden rot cannot be determined from photographs."
    ]
    if quality_result["label"] == "FAIR":
        limitations.append("Photograph has minor focus or lighting limitations; results should be verified on-site.")

    return {
        "analysisId": analysisId,
        "status": prediction["status"],
        "imageQuality": quality_result,
        "condition": prediction["condition"],
        "defects": prediction["defects"],
        "manualReview": prediction["manualReview"],
        "model": {
            "name": "MobileNetV3-DeckCondition",
            "version": "1.0.0",
            "datasetVersion": "pilot-v1"
        },
        "limitations": limitations
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
