// =============================================
// Deck Estimator — Platform Setting Model (Phase 10)
// =============================================

const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Key must be at least 3 characters'],
      maxlength: [60, 'Key cannot exceed 60 characters'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Setting category is required'],
      enum: ['GENERAL', 'ESTIMATE', 'UPLOAD', 'NOTIFICATION', 'BUSINESS', 'SECURITY'],
      default: 'GENERAL',
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Setting label is required'],
      trim: true,
      maxlength: [120, 'Label cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    valueType: {
      type: String,
      required: true,
      enum: ['STRING', 'NUMBER', 'BOOLEAN', 'OBJECT', 'ARRAY', 'JSON'],
      default: 'STRING',
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);

