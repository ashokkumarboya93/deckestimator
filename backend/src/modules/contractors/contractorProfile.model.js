// =============================================
// Deck Estimator — Contractor Profile Model
// =============================================

const mongoose = require('mongoose');
const { VERIFICATION_STATUS } = require('../../shared/constants');

const contractorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters'],
    },
    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    businessPhone: {
      type: String,
      trim: true,
      default: '',
    },
    licenseNumber: {
      type: String,
      required: [true, 'Contractor license number is required'],
      trim: true,
    },
    licenseJurisdiction: {
      type: String,
      trim: true,
      default: '',
    },
    businessAddress: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      zipCode: { type: String, trim: true, default: '' },
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
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
    rejectionReason: {
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

contractorProfileSchema.index({ verificationStatus: 1 });

const ContractorProfile = mongoose.model('ContractorProfile', contractorProfileSchema);

module.exports = ContractorProfile;
