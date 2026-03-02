/**
 * Payment Controller
 * Handles Razorpay payment operations
 */

const crypto = require('crypto');
const razorpay = require('../config/razorpay.config');

/**
 * Create a Razorpay order
 * POST /api/payment/create-order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { orderNumber, amount, currency = 'INR', notes } = req.body;

    // Validate Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway not configured'
      });
    }

    // Amount should be in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency,
      receipt: orderNumber,
      notes: notes || { order_number: orderNumber }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    console.log(`✅ Razorpay order created: ${razorpayOrder.id} for ${orderNumber}`);

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * POST /api/payment/verify
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_number
    } = req.body;

    // Validate Razorpay secret is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Payment verification not configured'
      });
    }

    // Generate expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error(`❌ Payment signature mismatch for order: ${order_number}`);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed - invalid signature'
      });
    }

    console.log(`✅ Payment verified for order: ${order_number}, Payment ID: ${razorpay_payment_id}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order_number,
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    next(error);
  }
};

/**
 * Get payment status from Razorpay
 * GET /api/payment/status/:orderId
 */
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await razorpay.orders.fetch(orderId);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('❌ Get payment status error:', error);
    next(error);
  }
};
