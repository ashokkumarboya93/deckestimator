// =============================================
// Deck Estimator — Admin Project Model
// =============================================
// Tracks overall deck projects, contractor assignments,
// progress percentages (0-100%), statuses, and complete audit history.

const mongoose = require('mongoose');

const progressHistorySchema = new mongoose.Schema(
  {
    previousProgress: { type: Number, default: 0 },
    newProgress: { type: Number, required: true },
    previousStatus: { type: String, default: 'pending' },
    newStatus: { type: String, required: true },
    notes: { type: String, trim: true, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      default: null,
    },
    estimateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estimate',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
      default: 'pending',
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    location: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    deckSize: {
      type: String,
      default: '400 sq ft',
    },
    startDate: {
      type: Date,
      default: null,
    },
    expectedCompletionDate: {
      type: Date,
      default: null,
    },
    actualCompletionDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    progressHistory: [progressHistorySchema],
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

projectSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema, 'projects');

