# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SmartBudget AI is a comprehensive React-based personal finance management application with AI-powered features, bilingual support (English/Hindi), and gamification elements. The application works offline with local data sync and provides real-time financial insights through an intuitive dashboard.

### Key Architecture Components

- **Frontend**: React 18 + TypeScript with Vite build system
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom animations and themes
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: React Query for server state, React Context for global state
- **Authentication**: Supabase Auth with email/password and social login
- **Offline Support**: Local storage with automatic sync when online

## Common Development Commands

### Core Development
```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build
npm run preview

# Code quality checks
npm run lint
```

### Database Operations
```bash
# Setup Supabase (requires Supabase CLI)
supabase db reset

# Run specific migrations (if using Supabase CLI)
supabase db push
```

### Environment Setup
Copy `.env` file and configure Supabase credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Architecture Patterns

### Context-Based State Management
The app uses React Context for global state management with two primary contexts:

1. **AuthContext** (`src/contexts/AuthContext.tsx`): Manages user authentication, session handling, and auth-related operations
2. **LanguageContext** (`src/contexts/LanguageContext.tsx`): Handles bilingual support (English/Hindi) with persistent language preferences

### Component Architecture
- **App-level**: Entry point with splash screen logic and routing setup
- **Page-level**: Main views like `Index.tsx` that orchestrate multiple components
- **Feature-level**: Self-contained components like `Dashboard.tsx`, `AddExpense.tsx`, etc.
- **UI-level**: Reusable shadcn/ui components in `src/components/ui/`

### Data Flow Pattern
- Local-first approach with automatic cloud sync when authenticated
- Transactions stored in `localStorage` with backup to Supabase
- Offline mode with cached data and sync notifications
- Real-time updates through Supabase subscriptions when online

### Internationalization
- Translation system in `src/utils/languages.ts` with comprehensive English/Hindi support
- Category translations, UI text, and dynamic content localization
- Language preference persisted in localStorage

## Key Features and Components

### Core Financial Components
- **Dashboard**: Main financial overview with charts, balances, and quick actions
- **AddExpense**: Transaction entry with form validation and category selection
- **AIFinanceCoach**: AI-powered financial advice and insights
- **SmartBudgetPlanner**: Budget creation and management with AI suggestions
- **SavingsGoals**: Goal setting and progress tracking

### Advanced Features
- **Gamification**: Points, badges, streaks, and challenges system
- **VoiceTransactionEntry**: Speech-to-text transaction logging
- **BillScanner**: OCR-powered receipt scanning
- **CalendarExpenseTracker**: Date-based expense visualization
- **AdvancedAnalytics**: Comprehensive financial reporting and trends

### Authentication Flow
- Modal-based authentication with sign-up/sign-in
- Guest mode with local data storage
- Automatic session management with toast notifications
- Password reset functionality

## Development Guidelines

### Component Development
- Follow TypeScript strict mode patterns
- Use React hooks for state management within components
- Implement proper loading states and error boundaries
- Follow shadcn/ui component patterns for consistency

### Data Management
- Always implement offline-first approach for transactions
- Use the `useTransactions` hook for transaction operations
- Handle both authenticated and guest user scenarios
- Implement proper error handling with user-friendly messages

### Styling Conventions
- Use Tailwind CSS utility classes
- Leverage CSS custom properties for theming
- Implement responsive design with mobile-first approach
- Use gradient backgrounds and animations for enhanced UX

### Testing Strategy
- No formal test suite currently implemented
- Manual testing required for authentication flows
- Test offline/online sync scenarios
- Verify bilingual support across components

### Build and Deployment
- Vite handles bundling and optimization
- Static asset optimization for production builds
- Environment variable configuration for different deployments
- PWA capabilities through Vite configuration

## File Structure Patterns

```
src/
├── components/          # Feature components (20+ financial components)
├── contexts/           # React contexts (Auth, Language)
├── hooks/              # Custom hooks (useTransactions, use-toast)
├── integrations/       # Third-party integrations (Supabase client)
├── lib/                # Utility functions
├── pages/              # Route components (Index, NotFound)
├── utils/              # Helper functions (languages, translations)
└── types/              # TypeScript definitions
```

## Supabase Integration

### Database Schema
Main tables include:
- `profiles` - User profile information
- `transactions` - Financial transactions with categorization
- `categories` - Expense/income categories
- `budgets` - Budget plans and limits
- `savings_goals` - User-defined savings targets
- `bill_reminders` - Recurring bill notifications
- `user_achievements` - Gamification data

### Authentication
- Email/password authentication
- Social login capabilities
- Row Level Security (RLS) policies protect user data
- Session management with automatic refresh

### Real-time Features
- Live transaction updates
- Real-time balance calculations
- Notification system for bill reminders