// Request validation middleware
const { ValidationError } = require('../utils/errorHandler');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return next(new ValidationError('Validation failed'));
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validateRequest
};
