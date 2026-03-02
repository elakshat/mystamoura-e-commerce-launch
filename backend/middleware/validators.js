/**
 * Request Validators
 * Validates incoming request data
 */

const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validate create order request
 */
exports.validateCreateOrder = [
  body('orderNumber')
    .notEmpty()
    .withMessage('Order number is required')
    .isString()
    .trim(),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR'])
    .withMessage('Invalid currency'),
  handleValidation
];

/**
 * Validate verify payment request
 */
exports.validateVerifyPayment = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .isString()
    .trim(),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required')
    .isString()
    .trim(),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
    .isString()
    .trim(),
  body('order_number')
    .notEmpty()
    .withMessage('Order number is required')
    .isString()
    .trim(),
  handleValidation
];

/**
 * Validate create order request (full order)
 */
exports.validateCreateOrderRequest = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a valid number'),
  body('total')
    .isFloat({ min: 0 })
    .withMessage('Total must be a valid number'),
  body('shipping_address')
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('shipping_address.full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('shipping_address.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),
  body('shipping_address.address_line1')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be 5-200 characters'),
  body('shipping_address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('shipping_address.state')
    .notEmpty()
    .withMessage('State is required'),
  body('shipping_address.postal_code')
    .notEmpty()
    .withMessage('Postal code is required')
    .matches(/^\d{6}$/)
    .withMessage('Invalid postal code'),
  body('payment_method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['razorpay', 'cod'])
    .withMessage('Invalid payment method'),
  handleValidation
];

/**
 * Validate contact form
 */
exports.validateContactForm = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .trim()
    .escape(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters')
    .trim()
    .escape(),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be 10-2000 characters')
    .trim(),
  handleValidation
];
