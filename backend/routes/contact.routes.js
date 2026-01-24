/**
 * Contact Routes
 * Handles contact form submissions
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { validateContactForm } = require('../middleware/validators');

// Submit contact form
router.post('/submit', validateContactForm, contactController.submitForm);

module.exports = router;
