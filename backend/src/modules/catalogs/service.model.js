// =============================================
// Deck Estimator — Service Model
// =============================================

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters'],
      maxlength: [150, 'Service name cannot exceed 150 characters'],
    },
    serviceCode: {
      type: String,
      required: [true, 'Service code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [3, 'Service code must be at least 3 characters'],
      maxlength: [50, 'Service code cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Associated service category is required'],
      index: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: [
        'cleaning',
        'preparation',
        'repair',
        'staining',
        'painting',
        'coating',
        'sealing',
        'maintenance',
        'other',
      ],
      index: true,
    },
    measurement: {
      unit: {
        type: String,
        required: [true, 'Measurement unit is required'],
        enum: [
          'square_foot',
          'square_meter',
          'linear_foot',
          'linear_meter',
          'hour',
          'day',
          'piece',
          'fixed_job',
        ],
        default: 'square_foot',
      },
    },
    operationalDetails: {
      estimatedDuration: {
        type: Number,
        min: [0, 'Estimated duration must be a non-negative number'],
        default: null,
      },
      durationUnit: {
        type: String,
        enum: ['minute', 'hour', 'day'],
        default: 'hour',
      },
      laborNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Labor notes cannot exceed 1000 characters'],
        default: '',
      },
      requiredEquipment: {
        type: [String],
        default: [],
      },
      preparationInstructions: {
        type: String,
        trim: true,
        maxlength: [1000, 'Preparation instructions cannot exceed 1000 characters'],
        default: '',
      },
      safetyNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Safety notes cannot exceed 1000 characters'],
        default: '',
      },
    },
    serviceImage: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
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

serviceSchema.index({ serviceName: 'text', serviceCode: 'text' });
serviceSchema.index({ categoryId: 1, status: 1 });
serviceSchema.index({ serviceType: 1, status: 1 });

const Service = mongoose.model('Service', serviceSchema, 'services');

module.exports = Service;
