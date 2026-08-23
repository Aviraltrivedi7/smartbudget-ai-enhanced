# Mobile and smart feature verification

## Mobile preview

A headless Chromium capture was run at **390 × 844 px**, matching a narrow mobile viewport. The ARTHORA header compresses to the three-dot menu, compact logo/wordmark, and icon-only add button. The hero remains within the viewport with rounded edges, and the onboarding dialog centers cleanly without horizontal overflow. The mobile capture is available at `/home/ubuntu/smartbudget-mobile.png`; it includes the first-run onboarding guide because the preview profile initializes the guide for a fresh user.

## Smart prompts

AI Insights now includes four interactive prompt cards: Spending lens, Savings move, Budget check, and Future view. Each card expands in place with a transaction-aware explanation and can send its prompt into the existing AI Coach handoff. A global Open coach action is also available.

## Budget Planner modal

The Command Center Budget planner item and dashboard Budget planner shortcut are wired to a modal. The modal accepts income input, supports ₹30,000/₹50,000/₹75,000 presets, calculates a 50/30/20 starting split, shows current spend context, persists the confirmed income to `arthora_budget_income`, and offers a handoff to the full planner. The existing Reports & Exports screen remains available for PDF/CSV export and import.
