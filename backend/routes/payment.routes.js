/**
 * Payment Routes
 * Handles Razorpay order creation and verification
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { validateCreateOrder, validateVerifyPayment } = require('../middleware/validators');

// Create Razorpay order
router.post('/create-order', validateCreateOrder, paymentController.createOrder);

// Verify payment after completion
router.post('/verify', validateVerifyPayment, paymentController.verifyPayment);

// Get payment status
router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
