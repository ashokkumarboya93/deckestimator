// =============================================
// Deck Estimator — File Service
// =============================================

const Deck = require('../decks/deck.model');
const DeckImage = require('./deckImage.model');
const storageProvider = require('./storageProvider');
const { assertDeckAccess } = require('../decks/deck.service');
const {
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_DECK,
  ALLOWED_MIME_TYPES,
  validateImageBuffer,
} = require('./file.validation');
const { NotFoundError, BadRequestError } = require('../../shared/errors');

/**
 * Upload multiple deck photos with file signature validation and quota enforcement.
 */
async function uploadDeckImages(deckId, files, user, description = '') {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  assertDeckAccess(deck, user);

  if (!files || files.length === 0) {
    throw new BadRequestError('No files were provided for upload.');
  }

  const existingCount = await DeckImage.countDocuments({ deckId });
  if (existingCount + files.length > MAX_IMAGES_PER_DECK) {
    throw new BadRequestError(
      `Maximum limit of ${MAX_IMAGES_PER_DECK} images exceeded. Deck currently has ${existingCount} images, and you attempted to add ${files.length}.`
    );
  }

  const createdImages = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError(
        `File "${file.originalname}" exceeds the 10MB size limit.`
      );
    }

    const detectedMimeType = validateImageBuffer(file.buffer);
    if (!detectedMimeType || !ALLOWED_MIME_TYPES.includes(detectedMimeType)) {
      throw new BadRequestError(
        `File "${file.originalname}" is not a valid JPEG, PNG, or WebP image.`
      );
    }

    const saved = await storageProvider.saveFile(
      file.buffer,
      file.originalname,
      detectedMimeType
    );

    const deckImage = await DeckImage.create({
      deckId,
      ownerId: user.id,
      originalFilename: file.originalname,
      storageKey: saved.storageKey,
      storageProvider: saved.storageProvider,
      mimeType: detectedMimeType,
      fileSize: saved.fileSize,
      imageDescription: description || '',
    });

    createdImages.push(deckImage.toJSON());
  }

  return createdImages;
}

/**
 * Get all images metadata for a deck.
 */
async function getDeckImages(deckId, user) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  assertDeckAccess(deck, user);

  const images = await DeckImage.find({ deckId }).sort({ createdAt: 1 });
  return images.map((img) => img.toJSON());
}

/**
 * Retrieve physical image file for authenticated binary serving.
 */
async function getImageFile(deckId, imageId, user) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  assertDeckAccess(deck, user);

  const image = await DeckImage.findOne({ _id: imageId, deckId });
  if (!image) {
    throw new NotFoundError('Deck image not found.');
  }

  const filePath = storageProvider.getFilePath(image.storageKey);
  if (!filePath) {
    throw new NotFoundError('Image file missing from storage.');
  }

  return { filePath, image: image.toJSON() };
}

/**
 * Delete a specific deck photo from both disk storage and database.
 */
async function deleteDeckImage(deckId, imageId, user) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError('Deck project not found.');
  }

  assertDeckAccess(deck, user);

  const image = await DeckImage.findOne({ _id: imageId, deckId });
  if (!image) {
    throw new NotFoundError('Deck image not found.');
  }

  // Remove physical file from storage
  await storageProvider.deleteFile(image.storageKey);

  // Remove database record
  await DeckImage.findByIdAndDelete(imageId);

  return { message: 'Deck image deleted successfully.' };
}

module.exports = {
  uploadDeckImages,
  getDeckImages,
  getImageFile,
  deleteDeckImage,
};
