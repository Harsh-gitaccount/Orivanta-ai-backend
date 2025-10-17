const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

// Validation Rules
const newsletterValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

// POST /api/newsletter/subscribe
router.post('/subscribe', newsletterValidation, async (req, res) => {
    try {
        // Validate Input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email address',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }

        const { email } = req.body;
        const timestamp = new Date().toISOString();
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const subscriptionData = {
            email,
            timestamp,
            ip,
            source: req.body.source || 'website'
        };

        // Send Emails
        const results = await Promise.allSettled([
            emailService.sendNewsletterNotification(subscriptionData),
            emailService.sendNewsletterWelcome(subscriptionData)
        ]);

        const adminNotified = results[0].status === 'fulfilled';
        const welcomeSent = results[1].status === 'fulfilled';

        if (!adminNotified) {
            console.error('Newsletter admin notification failed:', results[0].reason);
        }

        if (!welcomeSent) {
            console.error('Newsletter welcome email failed:', results[1].reason);
        }

        // Log subscription
        console.log('📧 Newsletter Subscription:', {
            email,
            timestamp,
            adminNotified,
            welcomeSent
        });

        // Response
        if (adminNotified || welcomeSent) {
            res.status(200).json({
                success: true,
                message: 'Thank you for subscribing! Check your email for confirmation.',
                data: {
                    email,
                    timestamp,
                    subscribed: true
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Email service temporarily unavailable. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again later.'
        });
    }
});

module.exports = router;
