const jwt = require('jsonwebtoken');
const jwtService = require('../jwt.service');
const validationService = require('../validation');

// Original auth middleware (for backwards compatibility)
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({
        message: "No hay token, permiso no valido"
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token no es valido" });
  }
};

// Role checking middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado: tu rol de ${req.user.role} no tiene permiso para esta accion`
      });
    }
    next();
  };
};

// New enhanced auth middleware
const enhancedMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.header('x-auth-token');
      
      if (!token) {
        return res.status(401).json({
          message: 'No authentication token provided',
          error: 'AUTH_001'
        });
      }
      
      const decoded = jwtService.verifyToken(token);
      
      req.user = decoded;
      req.token = token;
      
      next();
    } catch (error) {
      if (error.message === 'Token expired') {
        return res.status(401).json({
          message: 'Authentication token expired',
          error: 'AUTH_002'
        });
      }
      
      console.error('Authentication error:', error.message);
      return res.status(401).json({
        message: 'Invalid authentication token',
        error: 'AUTH_003'
      });
    }
  },

  authorize: (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required',
          error: 'AUTH_004'
        });
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          error: 'AUTH_005',
          userRole: req.user.role,
          requiredRoles: allowedRoles
        });
      }
      
      next();
    };
  },

  validateInput: (schemaName) => {
    return (req, res, next) => {
      try {
        const validatedData = validationService.validate(schemaName, {
          ...req.body,
          ...req.query,
          ...req.params
        });
        
        req.body = validatedData;
        next();
      } catch (error) {
        return res.status(400).json({
          message: 'Input validation failed',
          error: 'VAL_001',
          details: error.message
        });
      }
    };
  }
};

module.exports = {
  auth,
  checkRole,
  ...enhancedMiddleware
};