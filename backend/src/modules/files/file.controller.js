// =============================================
// Deck Estimator — File Controller
// =============================================

const fileService = require('./file.service');

async function uploadImages(req, res, next) {
  try {
    const images = await fileService.uploadDeckImages(
      req.params.deckId,
      req.files,
      req.user,
      req.body?.description
    );
    res.status(201).json({
      success: true,
      data: { images },
    });
  } catch (error) {
    next(error);
  }
}

async function getDeckImages(req, res, next) {
  try {
    const images = await fileService.getDeckImages(req.params.deckId, req.user);
    res.status(200).json({
      success: true,
      data: { images },
    });
  } catch (error) {
    next(error);
  }
}

async function serveImage(req, res, next) {
  try {
    const { filePath, image } = await fileService.getImageFile(
      req.params.deckId,
      req.params.imageId,
      req.user
    );

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}

async function deleteImage(req, res, next) {
  try {
    const result = await fileService.deleteDeckImage(
      req.params.deckId,
      req.params.imageId,
      req.user
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadImages,
  getDeckImages,
  serveImage,
  deleteImage,
};

