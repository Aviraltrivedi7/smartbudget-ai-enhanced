# DhanSetu AI

> **Aapke Paiso Ka Smart Saathi** — a calm, intelligent bridge between today’s money and tomorrow’s goals.

![DhanSetu AI logo](public/dhansetu-logo.png)

DhanSetu AI is a premium personal-finance workspace for tracking transactions, understanding spending patterns, planning budgets, and turning savings goals into consistent action. The experience combines a midnight-navy, cobalt, lavender, warm off-white, and restrained saffron-gold visual system with practical finance workflows, bilingual English/Hindi support, and a transaction-aware AI Coach.

## Product identity

The name **DhanSetu** means a bridge for wealth. DhanSetu AI helps users connect everyday financial decisions with longer-term goals instead of treating budgeting as a spreadsheet-only task. The brand mark combines a setu-style bridge arc, a rupee-inspired upward route, and growth pillars in the product’s navy, cobalt, lavender, and saffron-gold palette.

## What DhanSetu AI includes

| Area | Capability |
| --- | --- |
| Dashboard | Net balance, income, expenses, cash-flow trends, category breakdown, weekly transaction rhythm, recent activity, and AI next-best-move suggestions. |
| Command Center | Three-dot drawer, `Ctrl/Cmd + K` shortcut, navigation search, recent search history, quick actions, notifications, settings, theme toggle, and compact profile footer. |
| Transactions | Add, update, delete, import, export, category-aware tracking, optimistic UI updates, backend synchronization, and local offline recovery. |
| AI Coach | Live transaction-aware chat with English/Hinglish switching, secure backend LLM proxy support, local fallback responses, contextual prompts, and balance/spending/savings questions. |
| Smart planning | Budget Planner with income presets, 50/30/20 starter allocations, current-spend context, Savings Goals, AI Insights, and expandable smart prompts. |
| Reports | CSV export/import and branded monthly PDF reports with income, expenses, savings, category breakdown, and DhanSetu insight summaries. |
| Experience | Responsive mobile layout, splash screen, onboarding guide, PWA metadata, readable contrast, and restrained motion with reduced-motion support. |

## Architecture

The project contains a Vite + React 18 + TypeScript frontend and an Express backend under `backend/backend`. Authenticated users use the backend-first transaction API with JWT authentication. Guest and offline sessions use localStorage as a recovery and fallback path. When `MONGODB_URI` is not configured, the backend runs in demo mode with process-local authenticated demo data; MongoDB mode is the persistent production path.

The backend also provides Socket.IO support, transaction statistics, CORS handling, and a secure `/api/ai/chat` proxy. OpenAI or Gemini credentials remain server-side and are never placed in frontend source or browser-exposed environment variables.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, Lucide, Recharts, Sonner, jsPDF |
| Backend | Node.js, Express, Mongoose, JWT, Socket.IO, Helmet, Morgan, rate limiting |
| Data modes | MongoDB for persistent production data; process-local demo mode and localStorage fallback for development/offline use |
| Quality | ESLint, TypeScript compiler checks, Vite production build, Node syntax checks, backend smoke test |

## Local development

### Prerequisites

Use Node.js 18 or newer, npm, and Git. MongoDB is optional for local development because the backend can run in demo mode without a database URI.

### 1. Clone and install the frontend

```bash
git clone https://github.com/Aviraltrivedi7/smartbudget-ai-enhanced.git
cd smartbudget-ai-enhanced
npm install
cp .env.example .env
```

The safe frontend defaults are:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 2. Start the backend

Open a second terminal:

```bash
cd smartbudget-ai-enhanced/backend/backend
npm install
cp .env.example .env
npm start
```

The backend listens on `http://localhost:5000`. With no `MONGODB_URI`, it starts in demo mode. For persistent data, configure MongoDB and long random JWT/session secrets in the backend `.env` file. Never commit `.env` files or provider credentials.

### 3. Start the frontend

From the repository root:

```bash
npm run dev
```

Open `http://localhost:5173` in a browser. The app can be explored in guest/offline mode, or users can register and sign in through the Express backend.

## Verification commands

Run the frontend checks from the repository root:

```bash
npm run lint:ci
npx tsc --noEmit
npm run build
```

The repository’s historical `npm run lint` command still reports 20 legacy errors in older feature/UI files that are outside the current production-surface gate; `npm run lint:ci` is the passing CI gate for the shipped shell and finance workflows. The backend smoke test expects a backend process on port 5000. With the backend running, execute:

```bash
cd backend/backend
npm run smoke
```

The smoke test covers health, CORS, registration, transaction listing, transaction creation, and transaction statistics. The CI workflow runs equivalent checks automatically for pushes and pull requests.

## Environment and security

Frontend environment variables must contain only safe localhost or public API URLs. Keep `OPENAI_API_KEY`, `GEMINI_API_KEY`, `MONGODB_URI`, JWT secrets, session secrets, and email credentials in the backend environment or deployment secret manager. The secure AI route validates and limits supplied transaction context before forwarding requests to the configured provider.

## CI/CD

GitHub Actions is configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every push to `main` and every pull request runs frontend dependency installation, ESLint, TypeScript validation, the production build, backend syntax checks, and the demo-mode backend smoke test. The workflow does not require MongoDB or external LLM credentials.

For deployment, connect the repository to a hosting provider such as Vercel for the frontend and a Node-compatible service for the backend. Configure the frontend API URLs and backend CORS/secret variables in the provider’s environment settings. Preview URLs should be treated as temporary; production deployments should use fixed frontend and backend domains.

## Repository guide

| Document | Purpose |
| --- | --- |
| [`BACKEND_CONNECTION.md`](BACKEND_CONNECTION.md) | Current frontend/backend contract, demo mode, MongoDB mode, and smoke verification. |
| [`BACKEND_SETUP.md`](BACKEND_SETUP.md) | Backend setup and deployment notes. |
| [`REDESIGN_NOTES.md`](REDESIGN_NOTES.md) | UI redesign history, DhanSetu brand identity, and browser verification notes. |
| [`MOBILE_AND_SMART_FEATURE_NOTES.md`](MOBILE_AND_SMART_FEATURE_NOTES.md) | Mobile layout and smart-feature verification notes. |

## License and contribution

Contributions are welcome. Please keep the premium visual system readable, preserve the backend-first/offline fallback behavior, avoid committing secrets, and run the relevant frontend and backend verification commands before opening a pull request.
