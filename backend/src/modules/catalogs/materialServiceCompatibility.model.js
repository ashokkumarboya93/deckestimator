// =============================================
// Deck Estimator — Material-Service Compatibility Model
// =============================================

const mongoose = require('mongoose');

const materialServiceCompatibilitySchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    compatibilityStatus: {
      type: String,
      required: [true, 'Compatibility status is required'],
      enum: ['compatible', 'incompatible', 'requires_review'],
      default: 'compatible',
      index: true,
    },
    compatibilityNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Compatibility notes cannot exceed 1000 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Compound index to guarantee unique relationship pair
materialServiceCompatibilitySchema.index(
  { materialId: 1, serviceId: 1 },
  { unique: true }
);

const MaterialServiceCompatibility = mongoose.model(
  'MaterialServiceCompatibility',
  materialServiceCompatibilitySchema,
  'materialServiceCompatibilities'
);

module.exports = MaterialServiceCompatibility;
