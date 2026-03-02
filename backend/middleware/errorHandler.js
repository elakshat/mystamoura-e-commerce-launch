/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Razorpay specific errors
  if (err.error && err.error.description) {
    return res.status(400).json({
      success: false,
      error: err.error.description,
      code: err.error.code
    });
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.array()
    });
  }

  // Database errors
  if (err.code === 'PGRST') {
    return res.status(400).json({
      success: false,
      error: 'Database operation failed'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : message
  });
};

module.exports = errorHandler;
