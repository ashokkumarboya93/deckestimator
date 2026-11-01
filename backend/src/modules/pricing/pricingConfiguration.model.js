// =============================================
// Deck Estimator — Pricing Configuration Model
// =============================================

const mongoose = require('mongoose');

const pricingConfigurationSchema = new mongoose.Schema(
  {
    configurationName: {
      type: String,
      trim: true,
      maxlength: [150, 'Configuration name cannot exceed 150 characters'],
      default: 'Standard Pricing Configuration',
    },
    minimumJobPrice: {
      type: Number,
      min: [0, 'Minimum job price cannot be negative'],
      default: 0,
      required: true,
    },
    basePricePerSqFt: {
      type: Number,
      min: [0, 'Base price per sq ft cannot be negative'],
      default: 0,
      required: true,
    },
    additionalCoatingPrice: {
      type: Number,
      min: [0, 'Additional coating price cannot be negative'],
      default: 0,
    },
    travelCharge: {
      type: Number,
      min: [0, 'Travel charge cannot be negative'],
      default: 0,
    },
    laborRate: {
      type: Number,
      min: [0, 'Labor rate cannot be negative'],
      default: 0,
    },
    wastePercentage: {
      type: Number,
      min: [0, 'Waste percentage cannot be negative'],
      max: [100, 'Waste percentage cannot exceed 100%'],
      default: 0,
    },
    taxPercentage: {
      type: Number,
      min: [0, 'Tax percentage cannot be negative'],
      max: [100, 'Tax percentage cannot exceed 100%'],
      default: 0,
    },
    taxName: {
      type: String,
      trim: true,
      default: 'Sales Tax',
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
      required: true,
    },
    effectiveUntil: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

pricingConfigurationSchema.index({ isActive: 1, effectiveFrom: -1 });

const PricingConfiguration = mongoose.model(
  'PricingConfiguration',
  pricingConfigurationSchema,
  'pricingConfigurations'
);

module.exports = PricingConfiguration;

