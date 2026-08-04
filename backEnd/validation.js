const Joi = require('joi');

const userValidationSchemas = {
  register: Joi.object({
    nombre: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/).required(),
    email: Joi.string()
      .email()
      .max(255).required(),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres.',
        'string.max': 'La contraseña no puede superar los 128 caracteres.',
        'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número.',
        'any.required': 'La contraseña es obligatoria.'
      }),
    codigoInvitacion: Joi.string().valid('agenteObservador').optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  observation: Joi.object({
    observador: Joi.string().min(2).max(100).required(),
    sector: Joi.string().min(2).max(100).required(),
    turno: Joi.string().min(2).max(50).required(),
    profesional: Joi.string().min(2).max(100).required(),
    momento: Joi.string().pattern(/^[1-5]$/).required(),
    accion: Joi.string().min(1).max(100).required()
  })
};

const validationService = {
  validate(schemaName, data) {
    const schema = userValidationSchemas[schemaName];
    if (!schema) {
      throw new Error(`Unknown validation schema: ${schemaName}`);
    }
    
    const { error, value } = schema.validate(data, {
      allowUnknown: false,
      stripUnknown: true
    });
    
    if (error) {
      throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
    }
    
    return value;
  }
};

module.exports = validationService;