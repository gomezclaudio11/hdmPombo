const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('./config');

const JWT_CONFIG = {
  secret: config.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  expiresIn: '15m',
  refreshExpiresIn: '7d',
  issuer: 'hospital-hygiene-dashboard',
  audience: 'hospital-users'
};

const JWTServices = {
  generateToken(payload) {
    return jwt.sign(
      payload,
      JWT_CONFIG.secret,
      {
        expiresIn: JWT_CONFIG.expiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }
    );
  },
  
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_CONFIG.secret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  }
};

module.exports = JWTServices;