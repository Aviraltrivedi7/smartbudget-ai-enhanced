# SmartBudget AI UI Redesign Notes

## Repository baseline

- Existing app is a React 18 + TypeScript + Vite + Tailwind CSS application with shadcn/ui, Recharts, React Router, Supabase, and Lucide icons.
- Main route is `/`, rendered by `src/pages/Index.tsx`.
- The dashboard is `src/components/Dashboard.tsx`; global navigation is `src/components/Navbar.tsx`.
- The app has many feature views already wired through `Index.tsx`: AI insights, analytics, calendar, budget planner, goals, bill reminders, scanner, voice entry, gamification, and more.
- Transactions are already computed in `Dashboard.tsx` and should remain functional; the redesign should focus on presentation and navigation rather than removing existing capabilities.

## Visual baseline

- Current UI uses a saturated gradient-heavy light dashboard with many rounded cards, animated decorative particles, emoji labels, and a dense grid of feature buttons.
- Current navbar is a sticky translucent header with a small pill-style nav and a single add-expense CTA.
- The existing dashboard has useful data logic for month selection, income, expenses, balance, category chart, trend chart, and recent transactions.
- The current page is visually busy and has inconsistent action hierarchy, which supports the requested full premium redesign.

## Verification note

- Local Vite server runs on port 5173.
- The exposed host was blocked by Vite because `server.allowedHosts` is not configured; add a permissive/explicit allowed host entry only as needed for local visual verification.

## Visual verification pass

The redesigned desktop dashboard rendered successfully through the exposed local host. The graphite sidebar, teal hero panel, mint/sand metric cards, trend/category switcher, spending pulse donut, recent activity list, AI insight card, and shortcut grid all appeared with the intended hierarchy and spacing. The welcome guide overlay still appears for first-time sessions, while the dashboard remains visible beneath it as intended. The application currently shows realistic seeded transaction data in local/demo mode and the chart renders cleanly.

## Interaction checks

- The Trend/Categories segmented control switches chart data successfully.
- The redesigned sidebar navigation reaches the existing Savings Goals feature without breaking its functionality.
- The build passes, and targeted ESLint checks pass for `Dashboard.tsx`, `Navbar.tsx`, and `Index.tsx`.
- Full-repository lint still reports legacy issues in unrelated existing files such as `ui/textarea.tsx`, `hooks/useTransactions.ts`, `lib/api.ts`, and `services/socketService.ts`.

## Feature-screen verification

The Savings Goals page was also rebuilt around the new system: it now uses the same editorial typography, white premium cards, mint/orange/violet stat tones, progress hierarchy, and dark-sidebar shell. The first goal action was tested successfully; adding ₹100 updated both the goal progress and total points in the rendered interface.

## Second preview pass

The live capture now includes the AI Copilot panel with three contextual suggestions: spending guardrail, goal accelerator, and weekly pulse. It also includes a clickable Transaction Rhythm bar chart with selected-day detail and animated bar emphasis. The hero screenshot confirms the premium graphite sidebar, teal hero, mint/sand stat cards, and chart entry point remain visually consistent above the fold.

## Live Copilot chat verification

The dashboard AI Copilot now exposes a Live chat action that routes to the redesigned SmartBudget Copilot workspace. The chat uses the existing transaction context to answer expense questions and supports quick prompts, English/Hinglish switching, typing feedback, context summary cards, and a private-workspace status. Live browser testing confirmed that asking “Where am I spending the most?” returned the current top category and amount breakdown, while “How can I grow my savings?” returned a personalized monthly and weekly savings target.

## Reports and exports verification

The live preview now exposes Reports & Exports in the sidebar. The redesigned screen shows total income, expenses, savings, category-level progress, a smart readout, and three functional actions: Download PDF, Export CSV, and Choose CSV file.

## External AI and report export integration

The backend now supports a server-side `/api/ai/chat` proxy for either OpenAI or Gemini, selected with `LLM_PROVIDER`. API keys remain server-side through `OPENAI_API_KEY` or `GEMINI_API_KEY`. When no provider key is configured, the route safely returns a configuration response and the frontend retains its local transaction-aware fallback.

The Reports & Exports page now generates a real PDF with summary cards, category bars, and smart readout text; exports escaped CSV; and imports CSV rows into local state and Supabase when authenticated. Live browser verification confirmed the Reports & Exports page renders the new action cards and the PDF action shows a successful download toast. Backend smoke tests confirmed health, AI readiness, and safe missing-key behavior.

## Clean visual pass

The visual system was refined to use deep forest green, warm ivory, muted mint, and a restrained terracotta accent. Neon splash gradients, bright blue/purple/pink category accents, oversized corner radii, and high-contrast decorative colours were replaced or globally remapped. Dashboard cards, charts, Copilot surfaces, the splash screen, and legacy feature screens now share the same calmer palette. Live preview verification confirmed the dashboard renders with the new deep-green hero, softer mint/sand metric cards, and reduced visual noise.

Published in commit `ab4efac style: refine premium color system and spacing`.

## Navy and cobalt palette refresh

The dark-green branding was removed from the primary surfaces. The app now uses midnight navy for navigation and anchor cards, cobalt for primary chart/interaction accents, soft lavender for selected states, warm off-white for the canvas, and muted coral for expense emphasis. Live preview verification confirmed the refreshed splash screen, navy sidebar, cobalt hero, and balanced metric cards render without the previous forest-green treatment.

## Contrast and readability pass

Low-opacity secondary text was strengthened on dark hero, insight, sidebar, and chat surfaces. Light cards now use darker slate labels and foreground colours. The month selector now explicitly uses dark ink text on its light surface, with readable cobalt selection and hover states. Savings Goals actions and report controls were also aligned to the same readable palette. Live preview verification confirmed the sidebar, hero, metrics, month selector, and dashboard copy are legible.

## Hidden navigation drawer

The persistent sidebar was replaced by a full-width top bar with a three-dot menu button. The drawer is hidden by default, slides in from the left on click or touch, dims and blurs the page behind it, closes from the X control, outside backdrop, or Escape key, and closes automatically after navigation. Live preview verification confirmed the three-dot trigger, readable drawer links, and clean dismissal back to the dashboard.

## Drawer scroll fix

The drawer navigation now uses a constrained flex column with `min-h-0`, an independent `drawer-scroll` navigation region, a thin visible scrollbar, and a shrink-0 profile/action footer. This keeps all lower navigation options accessible while preserving the bottom account controls.

## Drawer scroll verification

Source: live preview at https://5173-iumfctn7j3tdqrg7f56iq-4c69fc26.sg1.manus.computer/

The navigation drawer was opened through the three-dot trigger and scrolled to its end. The scrollable navigation area moved independently while the profile/sign-out footer remained visible at the bottom, confirming the lower drawer content is no longer clipped.

## Utility controls visibility fix

The drawer utility actions were moved into a dedicated shrink-0 bottom panel, separate from the scrollable workspace/tools list. Live preview verification now shows Notifications, Settings, and Dark mode together above the profile/sign-out card at the bottom of the open drawer.

## Sidebar quick search

The hidden drawer now includes a quick search input with a search icon, clear button, instant filtering across Workspace and Tools, utility-control matching, and a no-results state. Live preview verification: typing `reports` reduced the list to `Reports & exports` and exposed the clear-search control.

## Quick search verification

The live sidebar search was tested with `reports`, filtering the drawer to `Reports & exports`; a nonsense query displayed the `No navigation found` state with a clear-search action; clearing the query restored the full navigation list.

## Command-center sidebar upgrade

The sidebar search is now presented as a command center with a `Command center` label, keyboard hint, `Search anything...` placeholder, quick action cards for Add transaction and Ask AI coach, grouped navigation, and match highlighting. Live preview verification confirmed the richer drawer layout and instant `ai` filtering to AI insights.


## Command-center history and direct overlays

The Command Center now keeps the five most recent unique search terms in `localStorage` under `smartbudget_recent_searches`. Submitting a query with Enter or selecting a filtered navigation result records it, and the empty-search state renders re-applicable history chips with a one-click Clear control. Utility aliases now match more reliably in either direction.

The top-bar Add transaction CTA and the Command Center Add transaction quick action now open a controlled, centered transaction dialog with the existing validated save callback. The dialog supports type, title, amount, category, date, cancel, success toast, and immediate data refresh while keeping the midnight navy/cobalt/lavender palette readable. The Command Center Ask AI coach quick action now opens a prompt overlay with suggested questions, Enter-to-submit, and a full-coach handoff. Submitted prompts open the existing transaction-aware Copilot and retain the secure external-provider/local-fallback behavior.

## Expanded live-preview verification

Source: live preview at https://5173-iumfctn7j3tdqrg7f56iq-4c69fc26.sg1.manus.computer/

The latest preview passed dashboard boot, three-dot drawer open, Ctrl/Cmd+K search focus, Reports search submission, persistent recent-history display, history reapplication, history clearing, Escape dismissal, no-results recovery, and bottom utility visibility. The Add transaction overlay accepted a valid test transaction (`Coffee test`, ₹250, Travel), showed the success toast, closed, and updated report totals from ₹35,000 / 8 transactions to ₹35,250 / 9 transactions. The AI Coach overlay accepted `Where am I spending the most?`, opened the full coach, and returned a transaction-aware local fallback answer because no provider key is configured in the preview environment.

Targeted ESLint passes for all changed files, and `npm run build` passes with only the existing large-chunk and stale browser-data warnings. The connected browser session provided a desktop viewport; the responsive layout remains implemented through the existing mobile-first classes, but a separate mobile viewport driver was not available during this pass.


## Independent sidebar scrolling follow-up

The Command Center drawer’s middle Workspace and Tools region now has explicit dynamic viewport sizing, `overflow-y-auto`, touch momentum scrolling, stable scrollbar space, and a more discoverable navy scrollbar. A small `Swipe or scroll to explore.` cue was added below search. The header/search area and bottom utility/profile panel remain fixed while the middle navigation list scrolls independently. Fresh live-preview verification confirmed the drawer scrollbar is visible and that scrolling down reveals the navigation area without hiding Notifications, Settings, Dark mode, or the profile/sign-out footer.


## Compact utility footer follow-up

The fixed Command Center footer was tightened so Notifications, Settings, Dark mode, and the Guest user profile fit together cleanly in shorter viewports. Utility rows now use smaller icons, tighter padding, compact text, and reduced gaps; the profile card uses a smaller avatar, padding, and separator spacing. Fresh live-preview verification confirmed all four controls remain visible together while the Workspace and Tools list stays independently scrollable.
