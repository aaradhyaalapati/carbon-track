<div align="center">
  <h1>🌿 CarbonTrack</h1>
  <p><b>Carbon Footprint Awareness Platform</b></p>
  <p><i>Understand, track, and reduce your personal carbon footprint — privately, in your browser.</i></p>

[![CI](https://github.com/aaradhyaalapati/carbon-track/actions/workflows/ci.yml/badge.svg)](https://github.com/aaradhyaalapati/carbon-track/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-100%25_Coverage-729B1B?logo=vitest)](https://vitest.dev/)

  <br />

### [🚀 View Live Demo](https://carbontrackx.vercel.app/)

</div>

---

**CarbonTrack** turns a two-minute questionnaire into a personalized climate action plan. It estimates your annual CO₂e, provides a detailed category breakdown, compares your footprint to regional averages and a science-based 1.5 °C target, and ranks the highest-impact changes you can make. It also allows you to set and track a reduction goal over time.

> [!TIP]
> **A dynamic assistant, not a static calculator.** CarbonTrack's deterministic recommendation engine inspects your inputs and emits only the actions relevant to you. For example, it suggests an EV _only_ if you drive a petrol/diesel car and quantifies the saving from your actual mileage!

## ✨ Key Features

- 🌍 **Six-step Calculator:** Tailored form capturing your region, transport, home energy, food, and consumption habits.
- 📊 **Rich Results Dashboard:** Visualize your total footprint, category breakdown (bar + donut), comparison to the regional average and the 1.5 °C target, and your trend over time.
- 🎯 **Smart Recommendations:** A ranked list of actions — powered by **Gemini AI** with a deterministic rules-engine fallback — each with the estimated kg CO₂e it would save specifically _for you_.
- 📈 **Goal Tracking:** Set a reduction target and track your progress across multiple visits.
- 🔒 **Privacy-First:** No accounts, no passwords. Anonymous device IDs and Zod-validated `localStorage` keep your data yours.

## 🏗️ Architecture & Logic

CarbonTrack is built on the modern web stack: **Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · Zod · Recharts · Gemini AI (Vertex AI) · Cloud Firestore.**

> [!NOTE]  
> **Separation of concerns:** All domain logic lives in `src/lib` as pure, framework-free, fully-typed functions. A **Zod schema** acts as the single source of truth for every data shape. The UI imports from `@/lib` and never re-implements a calculation — keeping the logic trivially testable and the components thin.

> [!IMPORTANT]
> **Security by construction:** The backend uses **Application Default Credentials** — no API keys exist anywhere in the codebase. The frontend never touches an external API directly; all AI and database calls flow through server-side route handlers (`/api/insights`, `/api/entries`) which validate input with Zod, enforce per-IP rate limiting, and fall back gracefully to a deterministic rules engine if Gemini is unreachable.

### Evaluation Focus

- **Code Quality**: Strict TypeScript (no `any`), isolated domain logic, Zod validation on every boundary, small typed components, ESLint + Prettier.
- **Security**: Application Default Credentials (zero hardcoded keys), nonce-based **Content-Security-Policy** (`src/middleware.ts`) with `strict-dynamic`, per-IP rate limiting on all API routes, full security headers (`next.config.ts`), and Zod-validated `localStorage` reads.
- **Efficiency**: React Server Components by default, dynamically-imported charts, self-hosted fonts, lazy rate-limit cleanup (no background intervals), backend proxy eliminates redundant external API calls from the browser.
- **Accessibility (WCAG 2.1 AA)**: Labelled inputs, `fieldset`/`legend` groups, `aria-live` regions for both errors (`assertive`) and content updates (`polite`), `aria-busy` loading states, keyboard support, visible focus rings, and skip-to-content link.

## 🧪 Testing

> [!NOTE]
> The `src/lib` logic core boasts **100% statement, branch, function, and line coverage**.

CarbonTrack uses **Vitest** + **Testing Library**. We have over 100 unit tests spanning:

- The entire calculator logic and engine modules.
- Core validation and transformation schemas.
- Form step components and goal tracking UI.

All tests are enforced in CI via `vitest.config.ts`.

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js 20+ installed.

### Installation

```bash
git clone https://github.com/aaradhyaalapati/carbon-track.git
cd carbontrack
npm install
npm run dev
```

Your app should now be running on [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script                  | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Start the development server           |
| `npm run build`         | Build the project for production       |
| `npm start`             | Serve the production build             |
| `npm run test`          | Run the Vitest unit tests              |
| `npm run test:coverage` | Run tests and output a coverage report |
| `npm run lint`          | Run ESLint checks                      |
| `npm run typecheck`     | Run TypeScript type validation         |
| `npm run format`        | Run Prettier formatting                |

## 📁 Project Structure

```text
src/
├── app/               # Next.js App Router (pages: /, /calculator, /dashboard)
├── components/        # React components (ui/, calculator/, charts/, dashboard/, layout/)
├── lib/               # Pure domain logic + Zod schemas + Emission factors
├── test/              # Comprehensive test suites (components/, lib/)
└── middleware.ts      # Per-request CSP nonce implementation
```

## 📚 Documentation

Dive deeper into the inner workings of CarbonTrack:

- [`CLAUDE.md`](./CLAUDE.md) — Architecture & contribution guide
- [`METHODOLOGY.md`](./METHODOLOGY.md) — Emission factors, formulas, and data sources
- [`SECURITY.md`](./SECURITY.md) — Security model & headers configuration

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
