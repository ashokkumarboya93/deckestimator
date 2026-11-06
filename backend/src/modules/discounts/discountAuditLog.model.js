// =============================================
// Deck Estimator — Discount Audit Log Model
// =============================================

const mongoose = require('mongoose');

const discountAuditLogSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contractorName: {
      type: String,
      default: 'All Contractors (Default)',
    },
    previousDiscount: {
      type: Number,
      required: true,
    },
    newDiscount: {
      type: Number,
      required: true,
    },
    discountType: {
      type: String,
      enum: ['default', 'individual'],
      default: 'individual',
    },
    reason: {
      type: String,
      trim: true,
      default: 'Administrative adjustment',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedByName: {
      type: String,
      default: 'Admin User',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

discountAuditLogSchema.index({ contractorId: 1, createdAt: -1 });

module.exports = mongoose.model('DiscountAuditLog', discountAuditLogSchema, 'discountAuditLogs');

