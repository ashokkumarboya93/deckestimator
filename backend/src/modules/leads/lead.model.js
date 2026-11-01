// =============================================
// Deck Estimator — Lead Model (Phase 8)
// =============================================

const mongoose = require('mongoose');
const { LEAD_STATUS, LEAD_SOURCE } = require('../../shared/constants');

const leadSchema = new mongoose.Schema(
  {
    leadNumber: {
      type: String,
      required: [true, 'Lead number is required'],
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: [true, 'Associated deck project ID is required'],
      index: true,
    },
    estimateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estimate',
      default: null,
      index: true,
    },
    leadSource: {
      type: String,
      enum: Object.values(LEAD_SOURCE),
      default: LEAD_SOURCE.CUSTOMER_ESTIMATOR,
      index: true,
    },
    enquiry: {
      subject: {
        type: String,
        required: [true, 'Enquiry subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters'],
      },
      message: {
        type: String,
        required: [true, 'Enquiry message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters'],
      },
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'any'],
        default: 'any',
      },
      preferredContactTime: {
        type: String,
        trim: true,
        default: 'any',
      },
      additionalNotes: {
        type: String,
        trim: true,
        default: '',
      },
    },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    deckSnapshot: {
      projectName: { type: String, required: true },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      area: { type: Number, default: 0 },
      shape: { type: String, default: '' },
      surfaceMaterial: { type: String, default: '' },
      conditionLevel: { type: Number, default: null },
      conditionLabel: { type: String, default: null },
      photoCount: { type: Number, default: 0 },
    },
    estimateSnapshot: {
      estimateId: { type: mongoose.Schema.Types.ObjectId, default: null },
      estimateReference: { type: String, default: '' },
      estimateVersion: { type: Number, default: null },
      totalAmount: { type: Number, default: null },
      currency: { type: String, default: 'USD' },
    },
    assignedContractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedContractorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractorProfile',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
      index: true,
    },
    closureReason: {
      type: String,
      default: '',
    },
    closedAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    contractorNotes: {
      type: String,
      default: '',
    },
    adminNotes: {
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

leadSchema.index({ customerId: 1, createdAt: -1 });
leadSchema.index({ assignedContractorId: 1, status: 1 });
leadSchema.index({ status: 1, createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;

