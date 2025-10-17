const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

// Validation Rules
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .escape(),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('company')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters')
        .escape(),
    body('notes')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
        .escape()
];

// POST /api/contact/submit
router.post('/submit', contactValidation, async (req, res) => {
    try {
        // Validate Input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }

        const { name, email, company, notes } = req.body;
        const timestamp = new Date().toISOString();
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const formData = {
            name,
            email,
            company,
            notes,
            timestamp,
            ip
        };

        // Send Emails
        const results = await Promise.allSettled([
            emailService.sendAdminNotification(formData),
            emailService.sendAutoReply(formData)
        ]);

        const adminEmailSuccess = results[0].status === 'fulfilled';
        const autoReplySuccess = results[1].status === 'fulfilled';

        if (!adminEmailSuccess) {
            console.error('Admin email failed:', results[0].reason);
        }

        if (!autoReplySuccess) {
            console.error('Auto-reply failed:', results[1].reason);
        }

        // Log submission
        console.log('📩 Contact Form Submission:', {
            name,
            email,
            company,
            timestamp,
            adminEmailSent: adminEmailSuccess,
            autoReplySent: autoReplySuccess
        });

        // Response
        if (adminEmailSuccess || autoReplySuccess) {
            res.status(200).json({
                success: true,
                message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.',
                data: {
                    timestamp,
                    adminNotified: adminEmailSuccess,
                    confirmationSent: autoReplySuccess
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Email service temporarily unavailable. Please email us directly at hello@orivanta.ai'
            });
        }

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again or email us at hello@orivanta.ai'
        });
    }
});

module.exports = router;
