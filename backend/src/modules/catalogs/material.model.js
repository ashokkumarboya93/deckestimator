// =============================================
// Deck Estimator — Material Model
// =============================================

const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      minlength: [2, 'Material name must be at least 2 characters'],
      maxlength: [150, 'Material name cannot exceed 150 characters'],
    },
    materialCode: {
      type: String,
      required: [true, 'Material code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [3, 'Material code must be at least 3 characters'],
      maxlength: [50, 'Material code cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaterialCategory',
      required: [true, 'Associated category is required'],
      index: true,
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      enum: [
        'stain',
        'paint',
        'coating',
        'sealer',
        'primer',
        'cleaner',
        'surface_preparation',
        'repair_material',
        'other',
      ],
      index: true,
    },
    brandName: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
      default: '',
    },
    productName: {
      type: String,
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
      default: '',
    },
    productModel: {
      type: String,
      trim: true,
      maxlength: [100, 'Product model cannot exceed 100 characters'],
      default: '',
    },
    productImage: {
      type: String,
      trim: true,
      default: '',
    },
    technicalDocument: {
      type: String,
      trim: true,
      default: '',
    },
    compatibleSurfaces: {
      type: [String],
      enum: ['wood', 'composite', 'other'],
      default: ['wood'],
      index: true,
    },
    specifications: {
      baseType: {
        type: String,
        trim: true,
        default: '',
      },
      applicationMethod: {
        type: String,
        trim: true,
        default: '',
      },
      finishType: {
        type: String,
        trim: true,
        default: '',
      },
      colors: {
        type: [String],
        default: [],
      },
      dryingTime: {
        type: Number,
        min: 0,
        default: null,
      },
      recommendedCoats: {
        type: Number,
        min: 1,
        default: null,
      },
      uvResistance: {
        type: Boolean,
        default: false,
      },
      waterResistance: {
        type: Boolean,
        default: false,
      },
      weatherResistance: {
        type: Boolean,
        default: false,
      },
      additionalSpecifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    measurement: {
      quantityUnit: {
        type: String,
        enum: [
          'gallon',
          'liter',
          'quart',
          'milliliter',
          'kilogram',
          'pound',
          'piece',
          'pack',
          'square_foot',
          'square_meter',
        ],
        default: 'gallon',
      },
    },
    coverage: {
      coverageValue: {
        type: Number,
        min: [0, 'Coverage value must be a non-negative number'],
        default: null,
      },
      coverageAreaUnit: {
        type: String,
        enum: ['square_foot', 'square_meter'],
        default: 'square_foot',
      },
      coverageQuantity: {
        type: Number,
        min: [0, 'Coverage quantity must be non-negative'],
        default: 1,
      },
      coverageQuantityUnit: {
        type: String,
        default: 'gallon',
      },
      coverageNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Coverage notes cannot exceed 500 characters'],
        default: '',
      },
    },
    cost: {
      unitCost: {
        type: Number,
        min: [0, 'Unit cost must be non-negative'],
        default: null,
      },
      currency: {
        type: String,
        trim: true,
        uppercase: true,
        default: 'USD',
      },
      costUnit: {
        type: String,
        default: 'gallon',
      },
      costNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Cost notes cannot exceed 500 characters'],
        default: '',
      },
      costLastUpdatedAt: {
        type: Date,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
    },
    // Atlas collection schema compliance fields
    unit: {
      type: String,
      enum: ['SQ_FT', 'GALLON', 'LITER', 'PIECE', 'UNIT'],
      default: 'GALLON',
    },
    pricePerUnit: {
      type: Number,
      min: 0,
      default: 0,
    },
    coveragePerUnit: {
      type: Number,
      min: 0,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
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

function mapQuantityUnitToAtlasEnum(qUnit) {
  if (!qUnit) return 'GALLON';
  const u = qUnit.toString().toLowerCase();
  if (u.includes('sq') || u.includes('foot') || u.includes('meter')) return 'SQ_FT';
  if (u.includes('liter')) return 'LITER';
  if (u.includes('piece') || u.includes('pack')) return 'PIECE';
  if (u.includes('gallon') || u.includes('quart')) return 'GALLON';
  return 'UNIT';
}

materialSchema.pre('validate', function () {
  this.isActive = this.status === 'active';
  if (this.cost && this.cost.unitCost !== undefined && this.cost.unitCost !== null) {
    this.pricePerUnit = Number(this.cost.unitCost);
  } else if (this.pricePerUnit === undefined) {
    this.pricePerUnit = 0;
  }
  if (this.coverage && this.coverage.coverageValue !== undefined && this.coverage.coverageValue !== null) {
    this.coveragePerUnit = Number(this.coverage.coverageValue);
  }
  if (!this.unit || this.unit === 'GALLON') {
    this.unit = mapQuantityUnitToAtlasEnum(this.measurement?.quantityUnit || this.cost?.costUnit);
  }
});

materialSchema.index({ materialName: 'text', materialCode: 'text', brandName: 'text' });
materialSchema.index({ categoryId: 1, status: 1 });
materialSchema.index({ materialType: 1, status: 1 });

const Material = mongoose.model('Material', materialSchema, 'materials');

module.exports = Material;
