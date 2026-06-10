<div align="center">
  <h1>🌿 CarbonTrack</h1>
  <p><b>Carbon Footprint Awareness Platform</b></p>
  <p><i>Understand, track, and reduce your personal carbon footprint — privately, in your browser.</i></p>

[![CI](https://github.com/Vishalsomaraju/carbontrack/actions/workflows/ci.yml/badge.svg)](https://github.com/Vishalsomaraju/carbontrack/actions/workflows/ci.yml)
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
- 🎯 **Smart Recommendations:** A ranked list of actions, each with the estimated kg CO₂e it would save specifically _for you_.
- 📈 **Goal Tracking:** Set a reduction target and track your progress across multiple visits.
- 🔒 **Privacy-First:** 100% client-side. No accounts, no servers, and your data never leaves your device!

## 🏗️ Architecture & Logic

CarbonTrack is built on the modern web stack: **Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · Zod · Recharts.**

> [!NOTE]  
> **Separation of concerns:** All domain logic lives in `src/lib` as pure, framework-free, fully-typed functions. A **Zod schema** acts as the single source of truth for every data shape. The UI imports from `@/lib` and never re-implements a calculation — keeping the logic trivially testable and the components thin.

> [!IMPORTANT]
> **Privacy & safety by construction:** There is no backend and no database, meaning there is nothing to breach and no secrets to leak. Persistence relies strictly on `localStorage`, which is treated as untrusted and re-validated on every read.

### Evaluation Focus

- **Code Quality**: Strict TypeScript (no `any`), isolated domain logic, Zod validation, small typed components, ESLint + Prettier.
- **Security**: No backend, nonce-based **Content-Security-Policy (CSP)** (`src/middleware.ts`) with `strict-dynamic`, and full security headers (`next.config.ts`).
- **Efficiency**: React Server Components by default, dynamically-imported charts, self-hosted fonts.
- **Accessibility (WCAG 2.1 AA)**: Labelled inputs, `fieldset`/`legend` groups, `aria-live` error announcements, keyboard support, visible focus rings, chart data-table fallbacks, and motion sensitivity awareness.

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
git clone https://github.com/Vishalsomaraju/carbontrack.git
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
