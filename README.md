# PrajaSetu — Constituency Command Centre (Demo)

**One Constituency. Every Village. Every Issue Accounted For.**

PrajaSetu is an interactive demo of a constituency-level public-service and development tracking platform for an Andhra Pradesh MLA's office. Its core workflow:

> Village problem → Responsible department → Action tracking → Evidence → Verified outcome

**Live demo:** https://harshakusal.github.io/prajasetu-demo/

> ⚠️ **Illustrative demo data — not official constituency records.** “Constituency Demo”, all villages, mandals, staff, issues, projects and figures are fictional. This demo is not affiliated with or approved by any government body, elected representative or political party. Nothing is submitted to any department, no scheme eligibility is determined, and there is no real login.

## Modules
- **Command Centre** — summary cards, schematic village overview, issue-category and resolution-trend charts, urgent issues, project progress, activity feed, *This Week's Field Priorities*, and the **Start MLA Demo** button. All numbers are derived from one seeded dataset.
- **Village 360°** — searchable/filterable village directory with profiles (population, facilities, service indicators, open issues, projects, field visits, local priorities).
- **People's Issues** — full lifecycle `Submitted → Under Review → Referred → In Progress → Awaiting External Action → Resolved → Verified`, with assignment, department, follow-up dates, notes, action updates, evidence placeholders and a timeline. *Verified* is blocked until evidence is attached after resolution.
- **Development Tracker** — project ledger with stages, milestones, delays, evidence and next review. Proposed / awaiting-approval projects are always shown as *Not approved / not funded*.
- **Scheme Assistance** — minimal request records with clear eligibility disclaimers; placeholders for verified official scheme information.
- **Field Operations** — schedule visits, assign staff, tick checklists, link issues, save notes and evidence placeholders.
- **Public Impact Report** — period selector, stage counts, projects by stage, verified actions, village summaries, *resolved ≠ verified* explanation, print-friendly preview (`window.print()`).
- **Guided MLA demo** — 6-step spotlight walkthrough (Next / Back / Exit, keyboard ← → Enter Esc).
- **Settings** — reset demo data, language note, about/disclaimer.

Changes persist in `localStorage`; use **Settings → Reset demo data** to restore the seed. Works offline after first load (fonts are bundled; no runtime network calls).

## Tech
React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · Recharts · React Router (HashRouter for GitHub Pages deep links) · lucide-react icons · @fontsource/inter.

## Local setup
```bash
npm install
npm run dev        # http://localhost:5173/prajasetu-demo/
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```
Requires Node 18+.

## Deploy
Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions). The Vite `base` is `/prajasetu-demo/`; change it in `vite.config.ts` if the repo name differs.

## Project structure
```
src/
  data/       types.ts, seed.ts (deterministic seeded dataset), store.tsx (context, actions, localStorage, derived metrics)
  components/ ui.tsx (cards, badges, stepper, drawer, modal…), Layout.tsx, Walkthrough.tsx
  pages/      CommandCentre, Villages, Issues, Projects, Schemes, Field, Report, Settings
```
