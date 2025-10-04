// Simple test to check if the server starts properly
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SmartBudget AI Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mode: 'demo'
  });
});

// Simple demo API endpoints
app.get('/api/transactions', (req, res) => {
  res.json({
    success: true,
    message: 'Demo transactions retrieved',
    data: {
      transactions: [
        { id: '1', title: 'Demo Salary', amount: 75000, category: 'Income', date: '2024-11-01', type: 'income' },
        { id: '2', title: 'Demo Food', amount: 450, category: 'Food', date: '2024-11-02', type: 'expense' },
        { id: '3', title: 'Demo Transport', amount: 280, category: 'Travel', date: '2024-11-03', type: 'expense' }
      ],
      total: 3,
      page: 1,
      totalPages: 1
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Demo login successful',
    data: {
      user: {
        id: 'demo-user-123',
        fullName: 'Demo User',
        email: 'demo@smartbudget.ai',
        avatar: '',
        isVerified: true,
        preferences: {
          currency: 'INR',
          language: 'en',
          notifications: true
        },
        stats: {
          totalTransactions: 15,
          totalIncome: 125000,
          totalExpenses: 45000,
          currentStreak: 7
        },
        gamification: {
          level: 3,
          xp: 1250,
          badges: ['early_adopter', 'saver'],
          achievements: ['first_transaction', 'weekly_budget']
        }
      },
      token: 'demo-jwt-token-123456'
    }
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Demo Server running on port ${PORT}`);
  console.log(`🎨 Demo Mode Active - API returning sample data`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  
  // Stop server after 3 seconds for testing
  setTimeout(() => {
    console.log('✅ Server test complete - shutting down');
    server.close();
    process.exit(0);
  }, 3000);
});

export default app;