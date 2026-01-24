/**
 * Order Routes
 * Handles order creation and management
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { validateCreateOrderRequest } = require('../middleware/validators');

// Create a new order
router.post('/create', validateCreateOrderRequest, orderController.createOrder);

// Get order by order number
router.get('/:orderNumber', orderController.getOrder);

// Update order status (admin)
router.put('/:orderNumber/status', orderController.updateOrderStatus);

module.exports = router;
