// =============================================
// Deck Estimator — Estimator Configuration Model
// =============================================
// Manages the input fields and dependencies shown in customer & contractor estimation forms.

const mongoose = require('mongoose');

const estimatorFieldSchema = new mongoose.Schema(
  {
    fieldKey: {
      type: String,
      trim: true,
      index: true,
    },
    fieldName: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
    displayLabel: {
      type: String,
      trim: true,
    },
    fieldType: {
      type: String,
      default: 'number',
    },
    inputType: {
      type: String,
      default: 'Number',
    },
    unit: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    section: {
      type: String,
      default: 'dimensions',
    },
    options: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    minValue: {
      type: Number,
      default: null,
    },
    maxValue: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.fieldKey = ret.fieldKey || ret.fieldName || '';
        ret.label = ret.label || ret.displayLabel || '';
        ret.fieldType = ret.fieldType || ret.inputType || 'text';
        ret.active = ret.active !== undefined ? ret.active : ret.status !== 'inactive';
        delete ret.__v;
        return ret;
      },
    },
  }
);

const estimatorDependencySchema = new mongoose.Schema(
  {
    sourceField: {
      type: String,
      trim: true,
      index: true,
    },
    parentField: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      default: 'equals',
    },
    conditionValue: {
      type: String,
      trim: true,
    },
    value: {
      type: String,
      trim: true,
    },
    targetField: {
      type: String,
      trim: true,
    },
    showField: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      default: 'show',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.sourceField = ret.sourceField || ret.parentField || '';
        ret.targetField = ret.targetField || ret.showField || '';
        ret.conditionValue = ret.conditionValue || ret.value || '';
        ret.active = ret.active !== undefined ? ret.active : ret.status !== 'inactive';
        delete ret.__v;
        return ret;
      },
    },
  }
);

const EstimatorField = mongoose.model('EstimatorField', estimatorFieldSchema, 'estimatorFields');
const EstimatorDependency = mongoose.model('EstimatorDependency', estimatorDependencySchema, 'estimatorDependencies');

module.exports = {
  EstimatorField,
  EstimatorDependency,
};
