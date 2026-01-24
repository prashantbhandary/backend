const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://electro-phobia.vercel.app',
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Health check route
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
