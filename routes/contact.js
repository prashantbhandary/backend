const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting map (simple in-memory rate limiting)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 3; // Max 3 emails per hour per IP

// Clean up old entries from rate limit map
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'electrophobiatech@gmail.com',
    pass: process.env.EMAIL_PASS, // App password from Gmail
  },
});

// @route   POST /api/contact
// @desc    Send contact email
// @access  Public (with rate limiting)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Length validation
    if (name.length > 100 || email.length > 100 || subject.length > 200 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Input too long',
      });
    }

    // Sanitize inputs (basic XSS prevention)
    const sanitize = (str) => str.replace(/[<>]/g, '');
    const sanitizedName = sanitize(name);
    const sanitizedSubject = sanitize(subject);
    const sanitizedMessage = sanitize(message);

    // Rate limiting
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (rateLimitMap.has(clientIP)) {
      const data = rateLimitMap.get(clientIP);
      if (now - data.firstRequest < RATE_LIMIT_WINDOW) {
        if (data.count >= MAX_REQUESTS) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
          });
        }
        data.count++;
      } else {
        rateLimitMap.set(clientIP, { firstRequest: now, count: 1 });
      }
    } else {
      rateLimitMap.set(clientIP, { firstRequest: now, count: 1 });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'electrophobiatech@gmail.com',
      to: 'electrophobiatech@gmail.com',
      subject: `Contact Form: ${sanitizedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22C0B3; border-bottom: 2px solid #22C0B3; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>From:</strong> ${sanitizedName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
          </div>
          
          <div style="padding: 20px; background-color: #ffffff; border-left: 4px solid #22C0B3;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <p style="margin: 0; color: #888; font-size: 12px;">
              Reply directly to: <a href="mailto:${email}" style="color: #22C0B3;">${email}</a>
            </p>
          </div>
        </div>
      `,
      replyTo: email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER || 'electrophobiatech@gmail.com',
      to: email,
      subject: 'Thank you for contacting ElectroPhobia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22C0B3; border-bottom: 2px solid #22C0B3; padding-bottom: 10px;">
            Thank You for Reaching Out!
          </h2>
          
          <p style="color: #666; line-height: 1.6;">Hi ${sanitizedName},</p>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for contacting ElectroPhobia. We've received your message and will get back to you as soon as possible.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message:</h3>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${sanitizedSubject}</p>
            <p style="color: #666; margin: 10px 0; white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            <strong>ElectroPhobia Team</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    res.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
