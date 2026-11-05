// =============================================
// Deck Estimator — Permissions Policy Model
// =============================================

const mongoose = require('mongoose');

const permissionItemSchema = new mongoose.Schema(
  {
    moduleKey: { type: String, required: true },
    permissionName: { type: String, required: true },
    description: { type: String, default: '' },
    customer: { type: Boolean, default: false },
    contractor: { type: Boolean, default: false },
    admin: { type: Boolean, default: true },
  },
  { _id: true }
);

const permissionsPolicySchema = new mongoose.Schema(
  {
    policyName: {
      type: String,
      default: 'Standard Role Permissions',
    },
    permissions: [permissionItemSchema],
    updatedBy: {
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

module.exports = mongoose.model('PermissionsPolicy', permissionsPolicySchema, 'permissionsPolicies');

