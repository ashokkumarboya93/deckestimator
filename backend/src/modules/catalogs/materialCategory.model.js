// =============================================
// Deck Estimator — Material Category Model
// =============================================

const mongoose = require('mongoose');

const materialCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    categoryName: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'Display order must be a non-negative number'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
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

materialCategorySchema.pre('validate', function () {
  if (this.name && !this.categoryName) {
    this.categoryName = this.name;
  } else if (!this.name && this.categoryName) {
    this.name = this.categoryName;
  }
  this.isActive = this.status === 'active';
});

materialCategorySchema.index({ name: 'text', description: 'text' });
materialCategorySchema.index({ status: 1, displayOrder: 1 });

const MaterialCategory = mongoose.model(
  'MaterialCategory',
  materialCategorySchema,
  'materialCategories'
);

module.exports = MaterialCategory;
