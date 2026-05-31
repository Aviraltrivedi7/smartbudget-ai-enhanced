# SmartBudget AI - Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- (Optional) MongoDB for persistent storage

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   The `.env` file is already configured for demo mode. You can use it as-is or customize it.

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## 🎯 Demo Mode vs Database Mode

### Demo Mode (Default)
- **No MongoDB required** - runs completely in-memory
- Perfect for testing and development
- Data resets on server restart
- All authentication endpoints work with any email/password
- Automatic user creation on first login

### Database Mode (Production)
To enable MongoDB:

1. Install MongoDB locally or use MongoDB Atlas
2. Update `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smartbudget-ai
   # or for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartbudget-ai
   ```
3. Restart the server

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Other Endpoints
- `GET /health` - Server health check
- More endpoints available for categories, budgets, goals, etc.

## 🔧 Testing Backend APIs

### Using PowerShell (Windows):
```powershell
# Test Login
curl -Method POST -Uri "http://localhost:5000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"test123"}'

# Test Register
curl -Method POST -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

### Using curl (Mac/Linux):
```bash
# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

## 🐛 Troubleshooting

### Backend not starting?
1. **Check if port 5000 is already in use:**
   ```powershell
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

2. **Kill existing process if needed:**
   ```powershell
   # Windows
   Stop-Process -Id <PID> -Force
   
   # Mac/Linux
   kill -9 <PID>
   ```

3. **Clear node_modules and reinstall:**
   ```bash
   cd backend/backend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Login/Signup not working?
1. **Verify backend is running:**
   ```powershell
   curl http://localhost:5000/health
   ```

2. **Check frontend .env file:**
   Ensure `VITE_API_URL=http://localhost:5000/api`

3. **Check browser console for errors:**
   Open DevTools (F12) → Console tab

4. **Verify CORS is enabled:**
   Backend has CORS enabled for `http://localhost:5173` by default

### Database connection issues?
1. **For MongoDB Atlas:**
   - Whitelist your IP address in MongoDB Atlas
   - Check connection string format
   - Ensure network access is configured

2. **For local MongoDB:**
   - Ensure MongoDB service is running
   - Default connection: `mongodb://localhost:27017/smartbudget-ai`

## 🔐 Security Notes

### Demo Mode Security
- Demo mode is **NOT secure for production**
- Passwords are stored in plain text in memory
- No email verification
- JWT secret is shared

### Production Recommendations
1. **Change JWT secrets in .env:**
   ```env
   JWT_SECRET=your-super-secret-production-key
   JWT_REFRESH_SECRET=your-refresh-secret-production-key
   ```

2. **Enable MongoDB** for persistent storage

3. **Configure email service** for verification emails

4. **Enable HTTPS** for production deployment

5. **Set up environment variables** on your hosting platform

## 📦 Deployment

### Deploying to Render/Railway/Heroku
1. Set environment variables on platform
2. Ensure `MONGODB_URI` is set
3. Set `FRONTEND_URL` to your deployed frontend URL
4. Deploy from `backend/backend` directory

### Using PM2 (Process Manager)
```bash
cd backend/backend
npm run pm2
```

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review backend console logs
3. Check frontend browser console
4. Ensure both servers are running
5. Verify network connectivity between frontend and backend

---

**Backend is ready! 🎉**

Next step: Start both servers using the helper script:
```powershell
# From project root
.\start-app.ps1
```

Or manually:
1. Terminal 1: `cd backend/backend && npm start`
2. Terminal 2: `npm run dev` (from project root)
