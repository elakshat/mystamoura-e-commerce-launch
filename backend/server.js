/**
 * Mystamoura Backend Server
 * Production-ready Express server for Render deployment
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const paymentRoutes = require('./routes/payment.routes');
const orderRoutes = require('./routes/order.routes');
const contactRoutes = require('./routes/contact.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { validateEnv } = require('./utils/validateEnv');

// Validate required environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// ===================
// Security Middleware
// ===================

// Helmet for security headers
app.use(helmet());

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================
// Health Check
// ===================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mystamoura API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===================
// API Routes
// ===================

app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// ===================
// 404 Handler
// ===================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// ===================
// Error Handler
// ===================

app.use(errorHandler);

// ===================
// Start Server
// ===================

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
