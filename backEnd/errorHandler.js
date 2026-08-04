// Error Handling Middleware
const errorHandler = {
  // Global error handler
  globalErrorHandler: (err, req, res, next) => {
    console.error(err.stack);
    
    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        error: 'VAL_001',
        details: Object.values(err.errors).map(val => val.message)
      });
    }
    
    // MongoDB validation errors
    if (err.name === 'MongoError' && err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        message: `Duplicate value for field: ${field}`, 
        error: 'MONGO_001'
      });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid authentication token',
        error: 'JWT_001'
      });
    }
    
    // JWT expired errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Authentication token expired',
        error: 'JWT_002'
      });
    }
    
    // Default error
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.statusCode || 500).json({
      message: err.message || 'Internal server error',
      error: err.errorCode || 'SERVER_001',
      ...(isDevelopment && { stack: err.stack })
    });
  },

  // Route-specific error handler
  routeErrorHandler: (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    error.errorCode = 'ROUTE_001';
    next(error);
  }
};

module.exports = errorHandler;