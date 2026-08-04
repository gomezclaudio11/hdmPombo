const Joi = require('joi');

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  FRONTEND_URL: Joi.string().uri().required(),
  BCRYPT_ROUNDS: Joi.number().default(12),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development')
}).unknown(true);

const config = (() => {
  const { error, value } = envSchema.validate(process.env, { 
    allowUnknown: true,
    stripUnknown: true 
  });
  
  if (error) {
    console.error('Configuration error:', error.message);
    process.exit(1);
  }
  
  return value;
})();

module.exports = config;