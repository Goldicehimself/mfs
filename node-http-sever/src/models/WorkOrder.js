// Work Order Model
const mongoose = require('mongoose');
const constants = require('../config/constants');

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset is required']
  },
  status: {
    type: String,
    enum: Object.values(constants.WORK_ORDER_STATUS),
    default: constants.WORK_ORDER_STATUS.OPEN
  },
  priority: {
    type: String,
    enum: Object.values(constants.PRIORITY),
    default: constants.PRIORITY.MEDIUM
  },
  maintenanceType: {
    type: String,
    enum: Object.values(constants.MAINTENANCE_TYPE),
    default: constants.MAINTENANCE_TYPE.CORRECTIVE
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startDate: Date,
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completionDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  estimatedCost: Number,
  actualCost: Number,
  notes: String,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [String],
  tags: [String],
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for common searches
workOrderSchema.index({ status: 1, priority: 1 });
workOrderSchema.index({ assignedTo: 1 });
workOrderSchema.index({ asset: 1 });
workOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WorkOrder', workOrderSchema);
