const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
// Render sits behind a proxy — trust it so rate-limiting & logs see the real client IP
app.set('trust proxy', 1);
const server = http.createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://electrophobia.tech',
  'https://www.electrophobia.tech',
  'https://electro-phobia.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible to routes
app.set('io', io);

// ── Security middleware ───────────────────────────────────────────────
// Sets safe HTTP headers (HSTS, nosniff, frameguard, etc.). CSP is disabled
// here because this is a JSON API (the frontend defines its own CSP), and
// cross-origin resource policy is opened so the frontend can load /uploads images.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Strip out any keys containing "$" or "." to block NoSQL/operator injection
app.use(mongoSanitize());

// Rate limiting — protect against brute-force & abuse (counts real IP via trust proxy)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  max: 600,                         // generous for read-heavy public pages
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,                          // tight: login/register are the brute-force targets
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const experienceRoutes = require('./routes/experiences');
const projectRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blogs');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const adminContactRoutes = require('./routes/contacts');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin/contacts', adminContactRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Health check routes (Railway checks root path)
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'ElectroPhobia API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ElectroPhobia API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on ${HOST}:${PORT}`);
  console.log(`📡 API available at http://${HOST}:${PORT}/api`);
  console.log(`🔌 WebSocket server ready`);
});
