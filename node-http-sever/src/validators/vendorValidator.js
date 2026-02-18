// Vendor Validation Schemas
const Joi = require('joi');

const createVendorSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  contactPerson: Joi.string().optional().max(100),
  email: Joi.string().optional().email(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  category: Joi.string().optional(),
  specialties: Joi.array().items(Joi.string()).optional(),
  rating: Joi.number().optional().min(0).max(5),
  website: Joi.string().optional().uri(),
  active: Joi.boolean().optional(),
  notes: Joi.string().optional().max(1000)
});

const updateVendorSchema = Joi.object({
  name: Joi.string().optional().min(3).max(100),
  contactPerson: Joi.string().optional().max(100),
  email: Joi.string().optional().email(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  category: Joi.string().optional(),
  specialties: Joi.array().items(Joi.string()).optional(),
  rating: Joi.number().optional().min(0).max(5),
  website: Joi.string().optional().uri(),
  active: Joi.boolean().optional(),
  notes: Joi.string().optional().max(1000)
}).min(1);

module.exports = {
  createVendorSchema,
  updateVendorSchema
};
