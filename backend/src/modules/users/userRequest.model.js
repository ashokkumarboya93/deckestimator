// =============================================
// Deck Estimator — User Request / Appeal Model
// =============================================

const mongoose = require('mongoose');

const userRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'contractor', 'admin'],
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: ['unblock_account', 'account_reactivation', 'general_inquiry'],
      default: 'unblock_account',
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Appeal message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
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

module.exports = mongoose.model('UserRequest', userRequestSchema);

