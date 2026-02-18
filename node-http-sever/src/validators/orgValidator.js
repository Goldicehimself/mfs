// Organization Validation Schemas
const Joi = require('joi');

const listInvitesQuerySchema = Joi.object({
  role: Joi.string().valid('facility_manager', 'technician', 'staff', 'vendor', 'finance', 'procurement').optional(),
  createdBy: Joi.string().hex().length(24).optional()
});

const setUserActiveSchema = Joi.object({
  active: Joi.boolean().required()
});

module.exports = {
  listInvitesQuerySchema,
  setUserActiveSchema
};
