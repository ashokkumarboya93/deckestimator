// =============================================
// Deck Estimator — Estimator Configuration Model
// =============================================
// Manages the input fields and dependencies shown in customer & contractor estimation forms.

const mongoose = require('mongoose');

const estimatorFieldSchema = new mongoose.Schema(
  {
    fieldName: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
      unique: true,
    },
    displayLabel: {
      type: String,
      required: [true, 'Display label is required'],
      trim: true,
    },
    inputType: {
      type: String,
      enum: ['Number', 'Dropdown', 'Text', 'Checkbox', 'Radio'],
      default: 'Number',
    },
    unit: {
      type: String,
      enum: ['ft', 'in', 'sq ft', 'count', 'none'],
      default: 'ft',
    },
    required: {
      type: Boolean,
      default: true,
    },
    section: {
      type: String,
      enum: ['Dimensions', 'Materials', 'Components', 'Surface', 'Other'],
      default: 'Dimensions',
    },
    options: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
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

const estimatorDependencySchema = new mongoose.Schema(
  {
    parentField: {
      type: String,
      required: [true, 'Parent field name is required'],
      trim: true,
      index: true,
    },
    condition: {
      type: String,
      enum: ['equals', 'not_equals', 'contains'],
      default: 'equals',
    },
    value: {
      type: String,
      required: [true, 'Condition matching value is required'],
      trim: true,
    },
    showField: {
      type: String,
      required: [true, 'Target field to show is required'],
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

const EstimatorField = mongoose.model('EstimatorField', estimatorFieldSchema, 'estimatorFields');
const EstimatorDependency = mongoose.model('EstimatorDependency', estimatorDependencySchema, 'estimatorDependencies');

module.exports = {
  EstimatorField,
  EstimatorDependency,
};

