import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
dotenv.config();
const PORT = process.env.PORT || 6000;
// const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI =
  'mongodb+srv://boltadvaithakshaay:VePAL7bDQvIq4oCy@cluster0.yrddta1.mongodb.net/blackbox-ai-firewall?retryWrites=true&w=majority&appName=Cluster0';
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB Atlas using Mongoose
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');

    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

    // Start server only after successful DB connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Blackbox AI Firewall API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

app.listen(PORT, () => {
  console.log(`🚀 Blackbox AI Firewall API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔐 Auth endpoints: http://localhost:${PORT}/api/signup | http://localhost:${PORT}/api/login`
  );
  console.log(`💬 Chat endpoints: http://localhost:${PORT}/api/chat`);
});

export default app;
