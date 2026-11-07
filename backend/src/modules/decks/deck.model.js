// =============================================
// Deck Estimator — Deck Model
// =============================================

const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Deck owner is required'],
      index: true,
    },
    // Project Information
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    projectDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Project description cannot exceed 1000 characters'],
      default: '',
    },
    // Property Location
    propertyAddress: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      zipCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'USA' },
    },
    // Measurements
    measurementUnit: {
      type: String,
      enum: ['ft', 'm'],
      default: 'ft',
    },
    dimensions: {
      length: {
        type: Number,
        min: [0.1, 'Length must be greater than zero'],
        max: [1000, 'Length cannot exceed 1,000 units'],
        default: null,
      },
      width: {
        type: Number,
        min: [0.1, 'Width must be greater than zero'],
        max: [1000, 'Width cannot exceed 1,000 units'],
        default: null,
      },
      area: {
        type: Number,
        min: [0.01, 'Area must be greater than zero'],
        max: [1000000, 'Area cannot exceed 1,000,000 units'],
        default: null,
      },
      isManualArea: {
        type: Boolean,
        default: false,
      },
    },
    // Deck Shape
    deckShape: {
      type: String,
      enum: ['rectangle', 'square', 'l_shaped', 'multi_level', 'custom', 'other'],
      default: 'rectangle',
    },
    // Structure & Features
    structureDetails: {
      levels: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
      },
      height: {
        type: String,
        default: 'ground',
      },
      exactHeightFt: {
        type: Number,
        default: null,
      },
      isAttached: {
        type: Boolean,
        default: true,
      },
      hasRailings: {
        type: Boolean,
        default: false,
      },
      railingLength: {
        type: Number,
        min: 0,
        default: 0,
      },
      railingSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      hasStairs: {
        type: Boolean,
        default: false,
      },
      stairStepCount: {
        type: Number,
        min: 0,
        default: 0,
      },
      stairSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      hasPergola: {
        type: Boolean,
        default: false,
      },
      pergolaSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      hasPrivacyWall: {
        type: Boolean,
        default: false,
      },
      privacyWallSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      hasSiding: {
        type: Boolean,
        default: false,
      },
      sidingSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      hasFascia: {
        type: Boolean,
        default: false,
      },
      fasciaSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      includeJoists: {
        type: Boolean,
        default: false,
      },
      joistsSqft: {
        type: Number,
        min: 0,
        default: 0,
      },
      builtInFeatures: {
        type: [String],
        default: [],
      },
      structureNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Structure notes cannot exceed 500 characters'],
        default: '',
      },
    },
    // Existing Deck Surface Information
    surfaceDetails: {
      material: {
        type: String,
        default: 'wood',
      },
      woodSpecies: {
        type: String,
        default: 'pt_pine',
      },
      coatingStatus: {
        type: String,
        default: 'none',
      },
      previousTreatment: {
        type: String,
        trim: true,
        default: '',
      },
      surfaceDescription: {
        type: String,
        trim: true,
        maxlength: [500, 'Surface description cannot exceed 500 characters'],
        default: '',
      },
    },
    // Visible Conditions (multi-select)
    visibleConditions: {
      type: [String],
      default: [],
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional notes cannot exceed 1000 characters'],
      default: '',
    },
    completionStatus: {
      type: String,
      enum: ['draft', 'complete', 'archived'],
      default: 'draft',
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

// Compound index for owner's decks ordered by creation
deckSchema.index({ ownerId: 1, createdAt: -1 });

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;

