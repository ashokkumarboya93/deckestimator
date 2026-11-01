// =============================================
// Deck Estimator — Commission Payment Record Model (Phase 9)
// =============================================

const mongoose = require('mongoose');

const commissionPaymentRecordSchema = new mongoose.Schema(
  {
    commissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commission',
      required: [true, 'Commission ID is required'],
      index: true,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
      index: true,
    },
    paymentReference: {
      type: String,
      required: [true, 'Payment reference identifier is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recording user ID is required'],
    },
    notes: {
      type: String,
      trim: true,
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

commissionPaymentRecordSchema.index({ commissionId: 1, paymentReference: 1 }, { unique: true });

module.exports = mongoose.model('CommissionPaymentRecord', commissionPaymentRecordSchema);
