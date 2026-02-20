// User Validation Schemas
const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(50),
  role: Joi.string().valid('admin', 'facility_manager', 'technician', 'staff', 'vendor', 'finance', 'procurement', 'user'),
  orgCode: Joi.string().alphanum().min(6).max(12).empty(''),
  inviteCode: Joi.string().alphanum().min(8).max(12).empty(''),
  phone: Joi.string().optional(),
  department: Joi.string().optional()
}).xor('orgCode', 'inviteCode');

const registerOrgSchema = Joi.object({
  organizationName: Joi.string().required().min(2).max(100),
  industry: Joi.string().optional().max(100),
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(50)
});

const inviteSchema = Joi.object({
  role: Joi.string().required().valid('facility_manager', 'technician', 'staff', 'vendor', 'finance', 'procurement'),
  expiresAt: Joi.date().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  orgCode: Joi.string().alphanum().min(6).max(12).required(),
  rememberMe: Joi.boolean().optional()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  orgCode: Joi.string().alphanum().min(6).max(12).required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().min(20).required(),
  orgCode: Joi.string().alphanum().min(6).max(12).required(),
  password: Joi.string().required().min(6).max(50)
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().optional().min(2).max(50),
  lastName: Joi.string().optional().min(2).max(50),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  avatar: Joi.string().optional(),
  role: Joi.string().optional().valid('admin', 'facility_manager', 'technician', 'staff', 'vendor', 'finance', 'procurement', 'user'),
  active: Joi.boolean().optional()
}).min(1);

module.exports = {
  registerSchema,
  registerOrgSchema,
  inviteSchema,
  loginSchema,
  updateUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
