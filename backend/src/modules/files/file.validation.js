// =============================================
// Deck Estimator — File Validation Rules
// =============================================

const Joi = require('joi');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_IMAGES_PER_DECK = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const deckIdParamSchema = {
  params: Joi.object({
    deckId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'deckId must be a valid 24-character hexadecimal ObjectId',
    }),
  }),
};

const deckImageParamsSchema = {
  params: Joi.object({
    deckId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'deckId must be a valid 24-character hexadecimal ObjectId',
    }),
    imageId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'imageId must be a valid 24-character hexadecimal ObjectId',
    }),
  }),
};

const uploadImageMetadataSchema = {
  body: Joi.object({
    description: Joi.string().trim().max(200).optional().allow(''),
  }),
};

/**
 * Validate image buffer magic numbers / file signatures.
 * Rejects disguised executables, scripts, or corrupt files.
 */
function validateImageBuffer(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF ... WEBP
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return 'image/webp';
  }

  return null;
}

module.exports = {
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_DECK,
  ALLOWED_MIME_TYPES,
  deckIdParamSchema,
  deckImageParamsSchema,
  uploadImageMetadataSchema,
  validateImageBuffer,
};
