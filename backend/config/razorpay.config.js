/**
 * Razorpay Configuration
 * Initializes and exports Razorpay instance
 */

const Razorpay = require('razorpay');

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay credentials not configured. Payment features will not work.');
}

// Create Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

module.exports = razorpay;
