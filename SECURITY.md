# Security

CarbonTrack is designed to have the smallest reasonable attack surface.

## Security model

- **Zero hardcoded credentials.** The backend authenticates to Google Cloud services
  (Vertex AI, Firestore) via **Application Default Credentials (ADC)** — the Cloud Run
  service account's identity. There is no `GEMINI_API_KEY`, no database password, no
  secret string anywhere in the codebase. The `.env.example` contains only a project ID
  and region.
- **Backend proxy pattern.** The browser never contacts an external API directly. All AI
  and database calls flow through the app's own Next.js route handlers (`/api/insights`,
  `/api/entries`), which validate input with Zod before forwarding. This eliminates
  client-side key exposure and provides a single enforcement point for rate limiting and
  input sanitisation.
- **Per-IP rate limiting.** Every API route enforces a sliding-window request cap
  (`src/lib/rate-limit.ts`) — 10/min for insights (Gemini), 20/min for entries
  (Firestore) — returning `429 Too Many Requests` with a `Retry-After` header.
- **Graceful degradation.** If Gemini is unavailable, the insights API falls back to a
  deterministic rules engine (`src/lib/tips-engine.ts`). The frontend renders the same
  UI regardless of source.
- **`localStorage` is treated as untrusted.** Everything read back from the browser is
  parsed and validated against a Zod schema (`src/lib/storage.ts`); malformed, tampered, or
  wrong-shaped data fails closed (returns `null`/empty) and never throws into the UI. Access
  is guarded so it is safe during SSR and in private-browsing / storage-disabled contexts.
- **Input validation on every boundary.** All user input — form data, API request bodies,
  and query parameters — is validated and range-bounded by Zod schemas before use.
- **No raw HTML injection.** The app does not use `dangerouslySetInnerHTML` with user input.

## HTTP security headers

The `Content-Security-Policy` is set per request in `src/middleware.ts`; the remaining
headers are set in `next.config.ts` for every route.

- `Content-Security-Policy` — `default-src 'self'`; `script-src` uses a fresh per-request
  **nonce** plus `'strict-dynamic'`, so only Next.js's own nonce-carrying scripts execute
  and host-based allowlisting is disabled (no `'unsafe-inline'` for scripts). Setting a
  nonce requires dynamic rendering, so pages render on demand (`force-dynamic`). Styles
  allow `'unsafe-inline'` (a low-risk sink that Next/Tailwind require); `object-src 'none'`;
  `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`. In development only,
  `'unsafe-eval'` and `ws:` are added for React Fast Refresh and HMR.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation, and browsing-topics disabled
- `Strict-Transport-Security` — HSTS with preload (HTTPS enforced by the host)
- `X-XSS-Protection: 1; mode=block`

Verify with [securityheaders.com](https://securityheaders.com) and the
[Mozilla Observatory](https://observatory.mozilla.org) after deployment.

## Dependencies

- Lockfile committed; CI installs with `npm ci`.
- Keep the dependency footprint minimal — each dependency is attack surface and bundle weight.
- Recommended: enable **Dependabot** (or `npm audit` in CI) and a secret scanner
  (e.g. **gitleaks**) on the repository.

## Reporting a vulnerability

Open a private security advisory on the GitHub repository, or contact the maintainer
directly. Please do not file public issues for security reports.
