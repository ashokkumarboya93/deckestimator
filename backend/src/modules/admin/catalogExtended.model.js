// =============================================
// Deck Estimator — Catalog Extended Models
// =============================================
// Provides Products & Finishes, Substrates, and Coverage Rates
// All with mandatory image support and active status tracking.

const mongoose = require('mongoose');

const finishVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { _id: true }
);

const catalogProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    materialCategory: {
      type: String,
      required: true,
      trim: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    productImage: {
      type: String,
      required: [true, 'Product image is required'],
      trim: true,
    },
    finishes: [finishVariantSchema],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
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

const catalogSubstrateSchema = new mongoose.Schema(
  {
    substrateName: {
      type: String,
      required: [true, 'Substrate name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    substrateImage: {
      type: String,
      required: [true, 'Substrate image is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
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

const catalogCoverageRateSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    materialCategory: {
      type: String,
      trim: true,
      default: 'Wood',
    },
    coverageRate: {
      type: Number,
      required: [true, 'Coverage rate number is required'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'Sq. ft.',
    },
    productImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
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

const CatalogProduct = mongoose.model('CatalogProduct', catalogProductSchema, 'catalogProducts');
const CatalogSubstrate = mongoose.model('CatalogSubstrate', catalogSubstrateSchema, 'catalogSubstrates');
const CatalogCoverageRate = mongoose.model('CatalogCoverageRate', catalogCoverageRateSchema, 'catalogCoverageRates');

module.exports = {
  CatalogProduct,
  CatalogSubstrate,
  CatalogCoverageRate,
};

