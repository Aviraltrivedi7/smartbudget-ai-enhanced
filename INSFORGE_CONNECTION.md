# InsForge live connection

DhanSetu AI can run against an InsForge-hosted Postgres and Auth project when the following public Vite variables are present at build time:

```bash
VITE_INSFORGE_BASE_URL=https://your-project.region.insforge.app
VITE_INSFORGE_ANON_KEY=your-public-anon-key
VITE_DEMO_MODE=false
```

The browser uses `@insforge/sdk` with the project URL and anon key. The project admin API key is never required by the frontend and must not be placed in a `VITE_*` variable or committed to Git. In live mode, signed-out guests start with an empty workspace; authenticated users use InsForge Auth and the user-scoped `public.transactions` table. Local demo fixtures are reserved for explicit demo mode.

The live table contains the core transaction fields used by the existing UI: title, amount, category, type, date, description, payment method, tags, location, recurring metadata, AI metadata, currency, status, and timestamps. Row-level security restricts reads and writes to rows whose `user_id` matches the authenticated user.

## PWA install path

The application is published as an installable PWA at:

```text
https://7b7kn6np.insforge.site
```

`src/hooks/usePWAInstall.ts` captures `beforeinstallprompt` at module load, before the React splash finishes, so the install CTA can open the browser-native install prompt directly. The prompt includes an iPhone Share → Add to Home Screen guide and a browser-menu fallback when a native prompt is unavailable. A timeout prevents unsupported or blocked browsers from leaving the CTA stuck in a loading state.

The manifest uses the branded `icon-192.png`, `icon-512.png`, Apple touch icon, shortcuts, standalone display mode, and light launch colors. The app shell registers `/sw.js` immediately, and the service worker caches the manifest, icons, Apple touch icon, and splash artwork. The in-app launch screen uses `public/pwa-assets/dhansetu-splash.png` and the same DhanSetu bridge mark as the installed icon.

React Router fallback is configured in `vercel.json`. AI chat/categorization and receipt scanning remain explicit local/legacy fallbacks until an InsForge edge function is added; the live transaction/auth path does not silently call localhost.
