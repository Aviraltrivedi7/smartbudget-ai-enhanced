# InsForge live connection

DhanSetu AI can run against an InsForge-hosted Postgres and Auth project when the following public Vite variables are present at build time:

```bash
VITE_INSFORGE_BASE_URL=https://your-project.region.insforge.app
VITE_INSFORGE_ANON_KEY=your-public-anon-key
VITE_DEMO_MODE=false
```

The browser uses `@insforge/sdk` with the project URL and anon key. The project admin API key is never required by the frontend and must not be placed in a `VITE_*` variable or committed to Git. Guest users continue to use the local fixture/cache by design; authenticated users use InsForge Auth and the user-scoped `public.transactions` table.

The live table contains the core transaction fields used by the existing UI: title, amount, category, type, date, description, payment method, tags, location, recurring metadata, AI metadata, currency, status, and timestamps. Row-level security restricts reads and writes to rows whose `user_id` matches the authenticated user.

The hosted Vite site is published at:

```text
https://7b7kn6np.insforge.site
```

React Router fallback is configured in `vercel.json`. AI chat/categorization and receipt scanning remain explicit local/legacy fallbacks until an InsForge edge function is added; the live transaction/auth path does not silently call localhost.
