const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting map (simple in-memory rate limiting)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10; // Max 10 emails per hour per IP

// Clean up old entries from rate limit map
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

// @route   POST /api/contact
// @desc    Save contact message to database
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

    // Save to database
    const contactMessage = new Contact({
      name: sanitizedName,
      email,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      ipAddress: clientIP,
    });

    await contactMessage.save();
    console.log('✅ Contact message saved to database:', contactMessage._id);

    res.json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('❌ Error saving contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
});

module.exports = router;
