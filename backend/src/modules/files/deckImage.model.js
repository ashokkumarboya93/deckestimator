// =============================================
// Deck Estimator — Deck Image Model
// =============================================

const mongoose = require('mongoose');

const deckImageSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: [true, 'Associated deck is required'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Image owner is required'],
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    storageProvider: {
      type: String,
      default: 'local',
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/webp'],
    },
    fileSize: {
      type: Number,
      required: true,
      max: [10 * 1024 * 1024, 'File size cannot exceed 10MB'],
    },
    imageDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Image description cannot exceed 200 characters'],
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

deckImageSchema.index({ deckId: 1, createdAt: 1 });

const DeckImage = mongoose.model('DeckImage', deckImageSchema);

module.exports = DeckImage;
