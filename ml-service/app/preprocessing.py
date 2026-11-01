# =============================================
# Deck Estimator — Image Preprocessing (Phase 7)
# =============================================

from PIL import Image
import torch
from torchvision import transforms

INFERENCE_SIZE = (224, 224)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_inference_transform():
    return transforms.Compose([
        transforms.Resize(INFERENCE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def get_train_transform():
    return transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(INFERENCE_SIZE, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def prepare_image_for_inference(image: Image.Image) -> torch.Tensor:
    """
    Converts PIL Image to RGB, applies inference normalization, and adds batch dimension.
    """
    if image.mode != 'RGB':
        image = image.convert('RGB')

    transform = get_inference_transform()
    tensor = transform(image)
    return tensor.unsqueeze(0)  # Shape: (1, 3, 224, 224)
