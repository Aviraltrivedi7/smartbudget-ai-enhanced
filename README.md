# 💰 SmartBudget AI - Personal Finance Assistant

> **Your intelligent financial companion with advanced AI features and bilingual support (English/Hindi)**

A comprehensive, modern financial management application that helps users track expenses, plan budgets, and achieve financial goals through AI-powered insights and gamification.

## ✨ Features

### 🎯 Core Financial Management
- **Smart Transaction Tracking** - Add expenses via voice, text, or bill scanning
- **AI-Powered Categorization** - Automatic expense categorization with machine learning
- **Budget Planning & Goals** - Set and track savings goals with progress visualization
- **Bill Reminders** - Never miss a payment with smart notifications
- **Multi-Currency Support** - Support for Indian Rupees (₹) and other currencies

### 🤖 AI & Analytics
- **AI Finance Coach** - Personalized financial advice and spending insights
- **Expense Heatmaps** - Visual spending patterns with AI analysis
- **Smart Suggestions** - Predictive budget recommendations
- **Advanced Analytics** - Comprehensive financial reports and trends

### 🎮 Engagement Features
- **Gamification System** - Earn points, badges, and achievements for good financial habits
- **Money Monster** - Fun, interactive savings game
- **Progress Tracking** - Visual progress bars and milestone celebrations
- **Weekly Challenges** - Personalized financial challenges

### 🌍 Accessibility & Experience
- **Bilingual Support** - Complete Hindi (हिंदी) and English localization
- **Voice Commands** - Add transactions using speech recognition
- **Bill Scanner** - OCR-powered receipt scanning
- **Offline Support** - Works offline with local data sync
- **Interactive Onboarding** - Step-by-step welcome guide
- **Dark/Light Theme** - Adaptive UI themes

### 📱 Technical Features
- **Real-time Sync** - Cloud synchronization across devices
- **PWA Support** - Install as a mobile app
- **Responsive Design** - Works on all device sizes
- **Data Export** - Export financial data in multiple formats

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Recharts** - Interactive data visualizations
- **React Query** - Server state management
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Secure data access
- **Authentication** - Email/password and social login
- **Real-time Subscriptions** - Live data updates
- **File Storage** - Receipt and document storage

### Deployment & DevOps
- **Vercel** - Frontend deployment
- **Netlify** - Alternative deployment option
- **GitHub Actions** - CI/CD pipeline
- **ESLint & Prettier** - Code quality tools

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aviraltrivedi7/pocket-pal-financial-ai.git
   cd pocket-pal-financial-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Or use Supabase CLI: `supabase db reset`

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## 🗄️ Database Schema

The app uses a comprehensive PostgreSQL schema with the following main tables:

- **profiles** - User profile information
- **transactions** - Financial transactions with categorization
- **categories** - Expense/income categories
- **budgets** - Budget plans and limits
- **savings_goals** - User-defined savings targets
- **bill_reminders** - Recurring bill notifications
- **user_achievements** - Gamification data
- **user_preferences** - User settings and preferences

All tables include Row Level Security (RLS) policies for data protection.

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 📱 Usage

### For Users
1. **First Time:** Complete the interactive welcome guide
2. **Add Transactions:** Use voice, manual entry, or bill scanning
3. **Set Goals:** Define savings targets and budget limits
4. **Track Progress:** Monitor spending patterns and achievements
5. **Get Insights:** Review AI-powered financial recommendations

### Offline Mode
The app works completely offline with local data storage. Data syncs automatically when online.

### Language Support
Switch between English and Hindi using the language selector in the top-right corner.

## 🎮 Gamification System

- **Points System:** Earn points for logging expenses, staying within budget
- **Achievements:** Unlock badges for financial milestones
- **Streaks:** Maintain daily transaction logging streaks
- **Challenges:** Weekly financial challenges with rewards
- **Leaderboard:** Compare progress with friends (optional)

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── contexts/           # React contexts (Auth, Language)
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
├── lib/                # Utility functions
├── pages/              # Page components
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure Hindi translations for new text

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Supabase** - Backend infrastructure
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library
- **Tailwind CSS** - Styling framework

## 📞 Support

For support, email [your-email@example.com] or open an issue on GitHub.

---

**Made with ❤️ for better financial management**
