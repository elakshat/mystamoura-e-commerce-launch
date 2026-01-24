/**
 * Contact Controller
 * Handles contact form submissions
 */

const supabase = require('../config/supabase.config');

/**
 * Submit contact form
 * POST /api/contact/submit
 */
exports.submitForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log(`📧 Contact form received from: ${email}`);

    // If Supabase is configured, optionally save to database
    // You can create a 'contact_messages' table for this
    if (supabase) {
      // Log activity
      await supabase.from('activity_log').insert({
        action: `Contact form submission from ${name}`,
        entity_type: 'contact',
        details: {
          name,
          email,
          subject,
          message: message.substring(0, 200) // Truncate for logging
        }
      });
    }

    // TODO: Send email notification
    // You can integrate with Resend, SendGrid, or any email service

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    next(error);
  }
};
