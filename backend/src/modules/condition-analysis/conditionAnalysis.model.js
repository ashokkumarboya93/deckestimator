// =============================================
// Deck Estimator — Deck Condition Analysis Model (Phase 7)
// =============================================

const mongoose = require('mongoose');

const conditionAnalysisSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: [true, 'Associated deck is required'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requesting user ID is required'],
      index: true,
    },
    imageReferences: [
      {
        imageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DeckImage',
          required: true,
        },
        storageKey: {
          type: String,
          required: true,
        },
        originalFilename: {
          type: String,
          default: '',
        },
        mimeType: {
          type: String,
          default: 'image/jpeg',
        },
      },
    ],
    analysisStatus: {
      type: String,
      enum: [
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'REQUIRES_MANUAL_REVIEW',
        'UNABLE_TO_ASSESS',
        'FAILED',
      ],
      default: 'PENDING',
      index: true,
    },
    conditionLevel: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: null,
    },
    conditionLabel: {
      type: String,
      enum: [
        'GOOD',
        'MILD_WEAR',
        'MODERATE_DETERIORATION',
        'SEVERE_DETERIORATION',
        'SIGNIFICANT_WOOD_DAMAGE',
        null,
      ],
      default: null,
    },
    conditionConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    imageQuality: {
      label: {
        type: String,
        enum: ['GOOD', 'FAIR', 'POOR'],
        default: 'GOOD',
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1.0,
      },
      blurScore: {
        type: Number,
        default: null,
      },
      brightness: {
        type: Number,
        default: null,
      },
      resolution: {
        type: String,
        default: null,
      },
    },
    defects: [
      {
        label: {
          type: String,
          required: true,
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 0,
        },
        detected: {
          type: Boolean,
          default: false,
        },
      },
    ],
    manualReview: {
      required: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: null,
      },
      reviewStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'RESOLVED'],
        default: 'NONE',
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      reviewNotes: {
        type: String,
        default: '',
      },
    },
    model: {
      name: {
        type: String,
        default: 'MobileNetV3-DeckCondition',
      },
      version: {
        type: String,
        default: '1.0.0',
      },
      datasetVersion: {
        type: String,
        default: 'pilot-v1',
      },
    },
    limitations: {
      type: [String],
      default: [
        'Assessment is based only on visible image content.',
        'Structural safety cannot be determined from this photograph.',
      ],
    },
    inferenceDurationMs: {
      type: Number,
      default: null,
    },
    analysisStartedAt: {
      type: Date,
      default: null,
    },
    analysisCompletedAt: {
      type: Date,
      default: null,
    },
    errorCode: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'deckConditionAnalyses',
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

conditionAnalysisSchema.index({ deckId: 1, createdAt: -1 });
conditionAnalysisSchema.index({ ownerId: 1, analysisStatus: 1 });

const ConditionAnalysis = mongoose.model('ConditionAnalysis', conditionAnalysisSchema);

module.exports = ConditionAnalysis;
