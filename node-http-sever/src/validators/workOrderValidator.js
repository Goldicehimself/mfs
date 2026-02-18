// Work Order Validation Schemas
const Joi = require('joi');

const createWorkOrderSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(2000),
  asset: Joi.string().required(), // MongoDB ObjectId
  priority: Joi.string().optional().valid('low', 'medium', 'high', 'urgent'),
  maintenanceType: Joi.string().optional().valid('preventive', 'corrective', 'emergency'),
  dueDate: Joi.date().required(),
  estimatedHours: Joi.number().optional().min(0),
  estimatedCost: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(1000),
  location: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const updateWorkOrderSchema = Joi.object({
  title: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional().min(10).max(2000),
  priority: Joi.string().optional().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().optional(),
  estimatedHours: Joi.number().optional().min(0),
  estimatedCost: Joi.number().optional().min(0),
  notes: Joi.string().optional().max(1000),
  location: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string().required().valid('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold'),
  notes: Joi.string().optional().max(1000)
});

const assignSchema = Joi.object({
  assigneeId: Joi.string().required()
});

const commentSchema = Joi.object({
  comment: Joi.string().required().min(1).max(2000)
});

module.exports = {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  updateStatusSchema,
  assignSchema,
  commentSchema
};
