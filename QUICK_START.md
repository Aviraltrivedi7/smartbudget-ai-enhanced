# DhanSetu AI - Quick Start Guide

## ⚡ Start Your App (Fastest Way)

### One Command to Rule Them All:
```powershell
.\start-app.ps1
```

That's it! This will:
- ✅ Start backend on http://localhost:5000
- ✅ Start frontend on http://localhost:5173
- ✅ Open your browser automatically

---

## 📱 Access Your Application

Once servers are running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

## 🔐 Test Authentication

### Sign Up (Any email/password works in demo mode):
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Enter:
   - Name: Your Name
   - Email: any@email.com
   - Password: any password (min 6 chars)
4. Click "Create Account"
5. ✅ You're logged in!

### Sign In:
1. Go to http://localhost:5173
2. Click "Sign In"
3. Enter same email/password you used
4. Click "Sign In"
5. ✅ Welcome back!

---

## 🛠️ Alternative Start Methods

### Method 1: Manual (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd backend\backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Method 2: Backend Only
```powershell
.\start-backend.ps1
```

---

## 📚 Documentation

- **BACKEND_SETUP.md** - Complete backend setup guide
- **AUTHENTICATION_FIX_SUMMARY.md** - What was fixed and tested
- **README.md** - Project overview

---

## 🐛 Quick Troubleshooting

### Backend not starting?
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
Stop-Process -Id <PID> -Force
```

### Frontend not starting?
```powershell
# Rebuild project
npm run build
npm run dev
```

### Authentication not working?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser console (F12)
3. Verify backend is running: http://localhost:5000/health
4. Check `.env` file has: `VITE_API_URL=http://localhost:5000/api`

---

## ✅ System Status Check

Run this to verify everything:
```powershell
# Check backend health
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"DhanSetu AI Backend is running!"}
```

---

## 🎯 What's Working Now

| Feature | Status | Description |
|---------|--------|-------------|
| Backend API | ✅ | Demo mode, port 5000 |
| Frontend UI | ✅ | Vite dev server, port 5173 |
| Authentication | ✅ | Sign up, sign in, logout |
| Transactions | ✅ | Add, edit, delete transactions |
| Dashboard | ✅ | Real-time updates |
| Analytics | ✅ | Charts and insights |
| Geo Map | ✅ | Google Maps integration |
| Dark Mode | ✅ | Theme switching |
| Responsive | ✅ | Mobile & desktop |

---

## 🎨 Demo Features

In demo mode (default):
- ✅ No database needed
- ✅ Any email/password works
- ✅ Instant user creation
- ✅ Realistic demo data
- ⚠️ Data resets on restart

---

## 🚀 Ready to Go!

Everything is set up and tested. Just run:

```powershell
.\start-app.ps1
```

Then open http://localhost:5173 in your browser!

---

## 💡 Pro Tips

1. **Keep backend terminal open** - You'll see API logs
2. **Use browser DevTools** (F12) - Check Network tab for API calls
3. **Hot reload works** - Edit code, see changes instantly
4. **Demo mode is safe** - Can't break anything, data resets on restart

---

## 🎉 You're All Set!

Enjoy your DhanSetu AI application.

For detailed docs, check:
- BACKEND_SETUP.md
- AUTHENTICATION_FIX_SUMMARY.md
