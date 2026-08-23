# DhanSetu AI Backend - Complete Setup Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Architecture](#backend-architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Endpoints](#api-endpoints)
5. [Database Setup](#database-setup)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Option 1: Demo Mode (No Database Required)
```bash
# Navigate to backend directory
cd backend/backend

# Start server (runs in demo mode automatically)
npm start
# OR
node server.js
# OR double-click
start-backend.bat
```

Backend will run on **http://localhost:5000** with demo data!

### Option 2: With MongoDB (Production)
```bash
# 1. Setup MongoDB Atlas (free)
# 2. Get connection string
# 3. Add to .env file:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartbudget-ai

# 4. Start server
npm start
```

---

## 🏗️ Backend Architecture

### Tech Stack
- **Runtime**: Node.js v22+
- **Framework**: Express.js
- **Database**: MongoDB (optional)
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, JWT, Rate Limiting
- **Validation**: Express-validator

### Project Structure
```
backend/backend/
├── routes/
│   ├── auth.js              # MongoDB authentication
│   ├── auth-demo.js         # Demo authentication (no DB)
│   ├── transactions.js      # MongoDB transactions
│   ├── transactions-demo.js # Demo transactions (no DB)
│   ├── categories.js
│   ├── budgets.js
│   ├── goals.js
│   ├── bills.js
│   ├── analytics.js
│   └── ai.js
├── models/
│   ├── User.js
│   ├── Transaction.js
│   └── Category.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── notFound.js
├── sockets/
│   └── socketHandler.js
├── server.js                # Main server file
├── test-server.js           # Simple test server
├── start-backend.bat        # Windows startup script
├── .env                     # Environment variables
└── package.json
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd backend/backend
npm install
```

### 2. Configure Environment
Edit `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Optional - leave empty for demo mode)
MONGODB_URI=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secrets
JWT_SECRET=smartbudget-super-secret-jwt-key-2024
JWT_REFRESH_SECRET=smartbudget-refresh-token-secret-2024
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Optional Services
OPENAI_API_KEY=      # For AI features
EMAIL_SERVICE=       # For notifications
```

### 3. Start Backend

**Windows:**
```cmd
start-backend.bat
```

**Linux/Mac:**
```bash
npm start
```

**Development mode (with auto-restart):**
```bash
npm run dev
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
POST   /api/auth/logout      - Logout user
POST   /api/auth/change-password - Change password
POST   /api/auth/reset-password  - Reset password
```

### Transactions
```
GET    /api/transactions          - Get all transactions
GET    /api/transactions/:id      - Get single transaction
POST   /api/transactions          - Create transaction
PUT    /api/transactions/:id      - Update transaction
DELETE /api/transactions/:id      - Delete transaction
GET    /api/transactions/stats    - Get statistics
```

### Health Check
```
GET    /health    - Server health status
```

### Example Request (Demo Mode)
```bash
# Login (any email/password works in demo mode)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@smartbudget.ai",
    "password": "demo123"
  }'

# Get transactions
curl http://localhost:5000/api/transactions

# Create transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Groceries",
    "amount": 2500,
    "category": "Food",
    "type": "expense",
    "date": "2024-11-10"
  }'
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended - FREE)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free
   
2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free Shared" tier
   - Select region closest to you
   - Click "Create Cluster"

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Example: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/smartbudget-ai`

4. **Add to .env**
   ```env
   MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/smartbudget-ai
   ```

5. **Restart Backend**
   ```bash
   npm start
   ```

### Local MongoDB (Advanced)

1. **Install MongoDB**
   ```bash
   # Windows (using Chocolatey)
   choco install mongodb

   # Mac (using Homebrew)
   brew install mongodb-community

   # Linux (Ubuntu)
   sudo apt install mongodb
   ```

2. **Start MongoDB**
   ```bash
   mongod --dbpath=/path/to/data
   ```

3. **Update .env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/smartbudget-ai
   ```

---

## 🎯 Features

### Demo Mode Features (No Database)
✅ User authentication (in-memory)  
✅ Transaction CRUD operations  
✅ Real-time Socket.IO updates  
✅ Transaction statistics  
✅ Sample data included  
✅ All API endpoints working  
✅ Perfect for testing frontend  

### Production Mode (With MongoDB)
✅ All demo features  
✅ Persistent data storage  
✅ User profiles with gamification  
✅ Advanced analytics  
✅ AI-powered categorization  
✅ Bill reminders  
✅ Budget tracking  
✅ Goals management  
✅ Email notifications  

---

## 🔒 Security Features

- **Helmet.js**: HTTP headers security
- **CORS**: Configured for frontend only
- **Rate Limiting**: 100 requests per 15 minutes
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcryptjs
- **Input Validation**: express-validator
- **Error Handling**: Comprehensive error middleware

---

## 🔥 Real-Time Features (Socket.IO)

Backend automatically broadcasts events:
- `transaction_added` - New transaction created
- `transaction_updated` - Transaction modified
- `transaction_deleted` - Transaction removed
- `stats_updated` - Statistics changed
- `ai_insight` - AI-generated insights
- `budget_alert` - Budget limit warnings
- `goal_milestone` - Savings goals reached

Frontend auto-updates when these events occur!

---

## 🧪 Testing Backend

### Test Health Endpoint
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5000/health | Select-Object -Expand Content

# Command Prompt/Git Bash
curl http://localhost:5000/health
```

### Test Demo Login
```bash
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Transactions
```bash
curl http://localhost:5000/api/transactions
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
- Check MONGODB_URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username/password
- Leave empty to use demo mode

### CORS Errors
- Ensure frontend is running on http://localhost:5173
- Check FRONTEND_URL in .env
- Verify CORS configuration in server.js

### Module Not Found
```bash
# Reinstall dependencies
cd backend/backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Performance Tips

1. **Demo Mode**: Perfect for development and testing
2. **MongoDB Atlas**: Free tier is sufficient for 100+ users
3. **Rate Limiting**: Protects against abuse
4. **Compression**: Enabled by default
5. **Socket.IO**: Optimized for real-time updates

---

## 🚀 Deployment Options

### Railway (Recommended)
1. Push code to GitHub
2. Connect Railway to repository
3. Add environment variables
4. Deploy automatically

### Render
1. Create account at render.com
2. New Web Service
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Heroku
1. Install Heroku CLI
2. `heroku create smartbudget-api`
3. `git push heroku main`
4. `heroku config:set MONGODB_URI=...`

---

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGODB_URI` | Database connection | No | (demo mode) |
| `FRONTEND_URL` | Frontend URL for CORS | No | localhost:5173 |
| `JWT_SECRET` | JWT signing secret | No | demo-secret |
| `JWT_EXPIRE` | Token expiry | No | 7d |
| `OPENAI_API_KEY` | OpenAI for AI features | No | - |
| `EMAIL_SERVICE` | Email provider | No | - |

---

## 🎓 Next Steps

1. ✅ Start backend (demo mode works out of the box!)
2. ✅ Start frontend (`npm run dev` in main directory)
3. ✅ Test the connection (check dashboard status indicator)
4. ⏳ Setup MongoDB Atlas (when ready for production)
5. ⏳ Add OpenAI API key (for AI features)
6. ⏳ Configure email service (for notifications)
7. ⏳ Deploy to production

---

## 💡 Tips

- **Demo mode is perfect for development** - No database needed!
- Frontend will show "🔗 Live Data" when connected to backend
- Frontend will show "📱 Demo Mode" when backend is offline
- All features work in demo mode except data persistence
- Real-time Socket.IO updates work in both modes

---

## 🆘 Need Help?

**Backend not starting?**
- Check Node.js version (`node --version` should be 18+)
- Run `npm install` in backend/backend directory
- Check if port 5000 is available

**Frontend can't connect?**
- Ensure backend is running on port 5000
- Check `.env` has `VITE_API_URL=http://localhost:5000/api`
- Verify CORS is configured correctly

**Data not persisting?**
- You're in demo mode! Add MongoDB URI to persist data
- Demo mode uses in-memory storage

---

## ✅ Status Check

Backend is working if you see:
```
🚀 Server running on port 5000
🌍 Environment: development
📱 Frontend URL: http://localhost:5173
💾 Database: Demo Mode (No DB)
🎨 Demo Mode Active - API will return sample data

🌟 Backend is ready!
📡 Available endpoints:
   GET  /health - Server health check
   POST /api/auth/login - User login
   POST /api/auth/register - User registration
   GET  /api/transactions - Get transactions
   POST /api/transactions - Create transaction

🔗 Connect your frontend to: http://localhost:5000
```

---

**Happy Coding! 🚀**