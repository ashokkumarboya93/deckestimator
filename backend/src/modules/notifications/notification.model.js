const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ['customer', 'contractor', 'all', 'specific'],
      required: true,
      default: 'all',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    recipientSnapshot: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      role: { type: String, default: '' },
    },
    targetRole: {
      type: String,
      enum: ['customer', 'contractor', 'all', 'admin'],
      default: 'all',
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['GENERAL', 'URGENT', 'PROMOTION', 'SYSTEM'],
      default: 'GENERAL',
    },
    notificationType: {
      type: String,
      default: 'SYSTEM',
    },
    channels: {
      type: [String],
      default: ['IN_APP'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sentByName: {
      type: String,
      default: 'System Administrator',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Notification', notificationSchema, 'notifications');
