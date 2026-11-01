// =============================================
// Deck Estimator — Estimate Model
// =============================================

const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema(
  {
    estimateNumber: {
      type: String,
      required: [true, 'Estimate number is required'],
      unique: true,
      trim: true,
      minlength: 3,
      index: true,
    },
    estimateName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: 'Deck Restoration Estimate',
    },
    estimateType: {
      type: String,
      required: [true, 'Estimate type is required'],
      enum: ['CUSTOMER', 'CONTRACTOR'],
      default: 'CUSTOMER',
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: [true, 'Associated deck is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required'],
      index: true,
    },
    createdFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    deckDetails: {
      deckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck',
      },
      projectName: {
        type: String,
        default: '',
      },
      areaSqFt: {
        type: Number,
        required: [true, 'Deck area in square feet is required'],
        min: [0, 'Deck area cannot be negative'],
      },
      deckLength: {
        type: Number,
        default: null,
      },
      deckWidth: {
        type: Number,
        default: null,
      },
      deckShape: {
        type: String,
        default: 'rectangular',
      },
      surfaceMaterial: {
        type: String,
        default: 'wood',
      },
      deckCondition: {
        type: String,
        default: null,
      },
      deckType: {
        type: String,
        default: null,
      },
      location: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: '' },
      },
    },
    selectedMaterials: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
          required: true,
        },
        materialCode: {
          type: String,
          default: '',
        },
        materialName: {
          type: String,
          required: true,
        },
        brandName: {
          type: String,
          default: '',
        },
        unit: {
          type: String,
          default: 'gallon',
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        coveragePerUnit: {
          type: Number,
          default: 300,
        },
        baseQuantity: {
          type: Number,
          default: 0,
        },
        wastePercentage: {
          type: Number,
          default: 0,
        },
        wasteQuantity: {
          type: Number,
          default: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        formula: {
          type: String,
          default: '',
        },
      },
    ],
    selectedServices: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
        serviceCode: {
          type: String,
          default: '',
        },
        serviceName: {
          type: String,
          required: true,
        },
        serviceType: {
          type: String,
          default: '',
        },
        unit: {
          type: String,
          default: 'square_foot',
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          default: 0,
        },
        formula: {
          type: String,
          default: '',
        },
      },
    ],
    laborBreakdown: {
      enabled: { type: Boolean, default: false },
      laborRate: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      notes: { type: String, default: '' },
      formula: { type: String, default: '' },
    },
    additionalCharges: {
      items: [
        {
          type: { type: String },
          name: { type: String },
          amount: { type: Number, default: 0 },
          notes: { type: String, default: '' },
        },
      ],
      subtotal: { type: Number, default: 0 },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discountBreakdown: {
      applied: { type: Boolean, default: false },
      policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountPolicy', default: null },
      policyCode: { type: String, default: null },
      policyName: { type: String, default: null },
      discountType: { type: String, default: null },
      discountValue: { type: Number, default: 0 },
      applicability: { type: String, default: 'all' },
      eligibleAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      originalSubtotal: { type: Number, default: 0 },
      discountedSubtotal: { type: Number, default: 0 },
      appliedAt: { type: Date, default: null },
      appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    minimumAdjustment: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumJobPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    preTaxTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total estimate amount is required'],
      min: 0,
    },
    pricingSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Pricing snapshot is required'],
    },
    estimateStatus: {
      type: String,
      required: true,
      enum: ['DRAFT', 'SUBMITTED', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    warnings: [
      {
        materialName: String,
        serviceName: String,
        type: String,
        notes: String,
      },
    ],
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

estimateSchema.pre('validate', function () {
  if (this.ownerId && !this.createdFor) {
    this.createdFor = this.ownerId;
  }
  if (!this.ownerId && this.createdFor) {
    this.ownerId = this.createdFor;
  }
});

estimateSchema.index({ ownerId: 1, createdAt: -1 });
estimateSchema.index({ createdBy: 1, createdAt: -1 });
estimateSchema.index({ deckId: 1, createdAt: -1 });

const Estimate = mongoose.model('Estimate', estimateSchema, 'estimates');

module.exports = Estimate;

