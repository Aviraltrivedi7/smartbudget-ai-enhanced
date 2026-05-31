import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import authDemoRoutes from './routes/auth-demo.js';
import userRoutes from './routes/user.js';
import transactionRoutes from './routes/transactions.js';
import transactionDemoRoutes from './routes/transactions-demo.js';
import categoryRoutes from './routes/categories.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import billRoutes from './routes/bills.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { authenticateToken } from './middleware/auth.js';

// Import socket handlers
import { initializeSocket } from './sockets/socketHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8080",
      process.env.PRODUCTION_URL || "https://smartbudget-ai-enhanced.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MongoDB URI provided. Running in demo mode without database.');
      return false;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Running in demo mode without database.');
    return false;
  }
};

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:8080",
    process.env.PRODUCTION_URL || "https://smartbudget-ai-enhanced.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SmartBudget AI Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Variable to store database connection status
let isDBConnected = false;

// API Routes - use demo routes if MongoDB is not connected
app.use('/api/auth', (req, res, next) => {
  if (isDBConnected) {
    authRoutes(req, res, next);
  } else {
    authDemoRoutes(req, res, next);
  }
});

app.use('/api/transactions', (req, res, next) => {
  if (isDBConnected) {
    authenticateToken(req, res, () => {
      transactionRoutes(req, res, next);
    });
  } else {
    transactionDemoRoutes(req, res, next);
  }
});

// Dynamic request-time routing for authenticated endpoints
const dynamicRoute = (dbRouter, demoFallback = null) => {
  return (req, res, next) => {
    if (isDBConnected) {
      authenticateToken(req, res, () => {
        dbRouter(req, res, next);
      });
    } else {
      res.json({ success: true, message: 'Demo mode - endpoint not available', data: demoFallback });
    }
  };
};

app.use('/api/user', dynamicRoute(userRoutes, null));
app.use('/api/categories', dynamicRoute(categoryRoutes, []));
app.use('/api/budgets', dynamicRoute(budgetRoutes, []));
app.use('/api/goals', dynamicRoute(goalRoutes, []));
app.use('/api/bills', dynamicRoute(billRoutes, []));
app.use('/api/analytics', dynamicRoute(analyticsRoutes, {}));
app.use('/api/ai', dynamicRoute(aiRoutes, null));


// Socket.IO initialization
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('🛑 Process terminated');
    mongoose.connection.close();
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  isDBConnected = await connectDB();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`💾 Database: ${isDBConnected ? process.env.DB_NAME || 'Connected' : 'Demo Mode (No DB)'}`);
    
    if (!isDBConnected) {
      console.log('🎨 Demo Mode Active - API will return sample data');
      console.log('🔧 To use real database, add MONGODB_URI to .env file');
    }
    
    console.log('\n🌟 Backend is ready!');
    console.log('📡 Available endpoints:');
    console.log('   GET  /health - Server health check');
    console.log('   POST /api/auth/login - User login');
    console.log('   POST /api/auth/register - User registration');
    console.log('   GET  /api/transactions - Get transactions');
    console.log('   POST /api/transactions - Create transaction');
    console.log('\n🔗 Connect your frontend to: http://localhost:' + PORT);
  });
};

startServer().catch(console.error);

export default app;