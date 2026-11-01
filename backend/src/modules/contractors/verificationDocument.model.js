// =============================================
// Deck Estimator — Contractor Verification Document Model
// =============================================

const mongoose = require('mongoose');
const {
  VERIFICATION_DOCUMENT_TYPES,
  VERIFICATION_DOCUMENT_STATUS,
} = require('../../shared/constants');

const verificationDocumentSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractorProfile',
      required: [true, 'Contractor profile ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    documentType: {
      type: String,
      enum: Object.values(VERIFICATION_DOCUMENT_TYPES),
      required: [true, 'Document type is required'],
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    storedFileName: {
      type: String,
      required: [true, 'Stored file name is required'],
      trim: true,
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
      unique: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
    },
    documentStatus: {
      type: String,
      enum: Object.values(VERIFICATION_DOCUMENT_STATUS),
      default: VERIFICATION_DOCUMENT_STATUS.PENDING_REVIEW,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      default: '',
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

verificationDocumentSchema.index({ contractorId: 1, documentType: 1 });

const VerificationDocument = mongoose.model(
  'VerificationDocument',
  verificationDocumentSchema
);

module.exports = VerificationDocument;

