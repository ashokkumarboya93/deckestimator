// =============================================
// Deck Estimator — Discount Request Model
// =============================================

const mongoose = require('mongoose');

const discountRequestSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    contactName: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    requestType: {
      type: String,
      trim: true,
      default: 'Request Higher Wholesale Discount (Tier Upgrade)',
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description is required for discount request'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    approvedDiscountPct: {
      type: Number,
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
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

discountRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('DiscountRequest', discountRequestSchema);

