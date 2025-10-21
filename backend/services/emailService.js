const nodemailer = require('nodemailer');

// Create Zoho Mail Transporter
const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: process.env.ZOHO_SMTP_PORT,
    secure: true, // SSL
    auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD
    },
    tls: {
        rejectUnauthorized: true
    }
});

// Verify Transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

// Admin Notification Email
async function sendAdminNotification(formData) {
    const { name, email, company, notes, timestamp, ip } = formData;

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.ZOHO_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 New Contact Form Submission - ${company}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .field { margin-bottom: 20px; padding: 15px; background: white; border-left: 4px solid #8b5cf6; border-radius: 4px; }
                    .label { font-weight: bold; color: #6d28d9; margin-bottom: 5px; }
                    .value { color: #333; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .message-box { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Orivanta Labs Website</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">👤 Name</div>
                            <div class="value">${name}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">📧 Email</div>
                            <div class="value"><a href="mailto:${email}">${email}</a></div>
                        </div>
                        
                        <div class="field">
                            <div class="label">🏢 Company</div>
                            <div class="value">${company}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">💬 Message</div>
                            <div class="message-box">${notes.replace(/\n/g, '<br>')}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">🕐 Timestamp</div>
                            <div class="value">${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">🌐 IP Address</div>
                            <div class="value">${ip}</div>
                        </div>
                    </div>
                    <div class="footer">
                        This email was sent from the Orivanta Labs contact form
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Auto-Reply Email
async function sendAutoReply(formData) {
    const { name, email } = formData;

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.ZOHO_EMAIL}>`,
        to: email,
        subject: 'Thanks for reaching out to Orivanta Labs! 🚀',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                    .content { background: #fff; padding: 40px 30px; }
                    .greeting { font-size: 20px; font-weight: bold; color: #6d28d9; margin-bottom: 20px; }
                    .message { margin-bottom: 25px; line-height: 1.8; }
                    .cta { text-align: center; margin: 30px 0; }
                    .cta-button { background: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
                    .cta-button:hover { background: #6d28d9; }
                    .info-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
                    .social-links { margin: 20px 0; }
                    .social-links a { color: #8b5cf6; text-decoration: none; margin: 0 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Orivanta Labs</div>
                        <p style="margin: 0; opacity: 0.9;">AI-Powered Automation Solutions</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hi ${name.split(' ')[0]}! 👋</div>
                        
                        <div class="message">
                            <p>Thank you for reaching out to Orivanta Labs! We've received your message and our team is excited to connect with you.</p>
                            
                            <p>We typically respond within <strong>24 hours</strong> during business days (Monday-Friday, 9 AM - 6 PM IST).</p>
                        </div>
                        
                        <div class="info-box">
                            <strong>📧 What happens next?</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Our team will review your inquiry</li>
                                <li>We'll get back to you with a personalized response</li>
                                <li>If needed, we'll schedule a demo or call</li>
                            </ul>
                        </div>
                        
                        <div class="cta">
                            <a href="https://orivanta.zohobookings.in/#/353437000000039052" class="cta-button">📅 Book a Demo</a>
                        </div>
                        
                        <div class="message">
                            <p>In the meantime, feel free to explore our solutions or schedule a quick call using the button above.</p>
                            
                            <p><strong>Need urgent assistance?</strong><br>
                            Email us directly at <a href="mailto:hello@orivanta.in">hello@orivanta.in</a></p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 0 0 10px 0; font-weight: bold;">Orivanta Labs</p>
                        <p style="margin: 0 0 15px 0; color: #666;">AI Chatbots & Automation for Modern Businesses</p>
                        
                        <div class="social-links">
                            <a href="https://www.orivanta.ai">🌐 Website</a>
                            <a href="mailto:hello@orivanta.in">📧 Email</a>
                        </div>
                        
                        <p style="margin: 20px 0 0 0; color: #999; font-size: 12px;">
                            This is an automated response. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Newsletter Admin Notification
async function sendNewsletterNotification(subscriptionData) {
    const { email, timestamp, ip, source } = subscriptionData;

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.ZOHO_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📬 New Newsletter Subscription - ${email}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .field { margin-bottom: 15px; padding: 12px; background: white; border-left: 4px solid #8b5cf6; border-radius: 4px; }
                    .label { font-weight: bold; color: #6d28d9; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">📬 New Newsletter Subscriber</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <span class="label">Email:</span> ${email}
                        </div>
                        <div class="field">
                            <span class="label">Source:</span> ${source}
                        </div>
                        <div class="field">
                            <span class="label">Time:</span> ${new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </div>
                        <div class="field">
                            <span class="label">IP:</span> ${ip}
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Newsletter Welcome Email
async function sendNewsletterWelcome(subscriptionData) {
    const { email } = subscriptionData;

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.ZOHO_EMAIL}>`,
        to: email,
        subject: 'Welcome to Orivanta Labs Newsletter! 🚀',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #fff; padding: 40px 30px; }
                    .footer { text-align: center; padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Welcome to Orivanta Labs!</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">You're now part of the AI automation revolution</p>
                    </div>
                    <div class="content">
                        <h2 style="color: #6d28d9;">Thank you for subscribing! 🎉</h2>
                        <p>You'll receive:</p>
                        <ul>
                            <li>Latest AI automation insights</li>
                            <li>Product updates and new features</li>
                            <li>Exclusive tips and best practices</li>
                            <li>Special offers and early access</li>
                        </ul>
                        <p>Stay tuned for valuable content delivered straight to your inbox!</p>
                    </div>
                    <div class="footer">
                        <p><strong>Orivanta Labs</strong></p>
                        <p style="color: #666;">AI Chatbots & Automation</p>
                        <p style="font-size: 12px; color: #999;">You can unsubscribe at any time by clicking the link in our emails.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Send job application email with resume attachment
const sendApplicationEmail = async (applicantDetails, resumeFile) => {
    const transporter = createTransporter();
    
    const { name, email, portfolio, jobTitle, message } = applicantDetails;

    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.ZOHO_EMAIL}>`,
        to: process.env.CAREERS_EMAIL, // careers@orivanta.ai
        replyTo: email, // Reply directly to candidate
        subject: `New Job Application: ${jobTitle} - ${name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                    .info-row { margin: 10px 0; }
                    .label { font-weight: bold; color: #1e3a8a; }
                    .message-box { background: white; padding: 15px; border-left: 4px solid #06b6d4; margin: 15px 0; border-radius: 4px; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">New Job Application Received</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${jobTitle}</p>
                    </div>
                    <div class="content">
                        <div class="info-row">
                            <span class="label">Applicant Name:</span> ${name}
                        </div>
                        <div class="info-row">
                            <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
                        </div>
                        <div class="info-row">
                            <span class="label">Portfolio/LinkedIn:</span> ${portfolio || '<em>Not provided</em>'}
                        </div>
                        
                        ${message ? `
                            <div class="message-box">
                                <div class="label" style="margin-bottom: 10px;">Additional Information:</div>
                                <div style="white-space: pre-wrap;">${message}</div>
                            </div>
                        ` : ''}
                        
                        <div class="footer">
                            <strong>📎 Resume attached to this email</strong>
                            <p style="margin: 10px 0 0 0;">You can reply directly to this email to contact the candidate.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: [
            {
                filename: resumeFile.originalname,
                content: resumeFile.buffer,
                contentType: resumeFile.mimetype
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};


// ✅ SINGLE module.exports at the end - EXPORTS ALL 4 FUNCTIONS
module.exports = {
    sendAdminNotification,
    sendAutoReply,
    sendNewsletterNotification,
    sendNewsletterWelcome,
    sendApplicationEmail
};

