# Authentication strategy

The app supports **three** interchangeable auth providers, picked at startup
from environment variables. Switching providers is a one-line `.env` change
with no code edits anywhere else in the codebase.

| Provider      | When to use                                              | Cost                   | Vendor lock |
|---------------|----------------------------------------------------------|------------------------|-------------|
| `bypass`      | Local dev, Playwright, CI                                | $0                     | None        |
| `better-auth` | Production, EU data residency, self-hosted, scale        | $0 (self-hosted)       | None        |
| `clerk`       | Hosted SaaS demos, Replit deploys, quick MVP             | Free ≤10K MAU, then $$ | High        |

All three plug into the same backend interface (`AuthStrategy`) and the same
frontend hooks (`@/lib/auth`). Components never know which one is active.

## Selecting a provider

### Auto-detection (default)

If `AUTH_PROVIDER` is unset:

1. `DEV_AUTH_BYPASS=true` → `bypass`
2. `BETTER_AUTH_SECRET` non-empty → `better-auth`
3. `CLERK_SECRET_KEY` looks real (not a `REPLACE_ME` placeholder) → `clerk`
4. Otherwise → `bypass` with a loud warning

### Explicit override

Set the env var:

```bash
# Backend
AUTH_PROVIDER=bypass         # or: clerk | better-auth

# Frontend (Vite reads only VITE_* vars)
VITE_AUTH_PROVIDER=bypass    # or: clerk | better-auth
```

**The frontend and backend must agree.** A mismatch (e.g. backend running
Clerk, frontend running Better Auth) will reject all requests with 401.

## Setup per provider

### 1. Bypass (zero config — default in shipped `.env`)

```dotenv
DEV_AUTH_BYPASS=true
VITE_DEV_AUTH_BYPASS=true
```

Every request is treated as a stable mock user (`dev-user-local` / `dev@localhost`).
**Never enable in production.**

### 2. Better Auth (recommended for production)

```dotenv
AUTH_PROVIDER=better-auth
VITE_AUTH_PROVIDER=better-auth

BETTER_AUTH_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
BETTER_AUTH_URL=http://localhost:8080
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:20579,http://localhost:8080
# In production:
# BETTER_AUTH_URL=https://api.example.com
# BETTER_AUTH_TRUSTED_ORIGINS=https://app.example.com
```

Then:

```bash
pnpm db:migrate    # creates auth_user / auth_session / etc.
pnpm run dev
```

- Sign-in/sign-up pages: `/sign-in`, `/sign-up` (custom shadcn/ui forms)
- Data lives in your Postgres (full ownership, GDPR-friendly).
- All sessions are httpOnly cookies, 30 day TTL with rolling refresh.

### 3. Clerk

```dotenv
AUTH_PROVIDER=clerk
VITE_AUTH_PROVIDER=clerk

CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

In Clerk Dashboard → Configure → Domains → add `http://localhost:20579`.
Sign-in/sign-up pages render Clerk's `<SignIn/>` / `<SignUp/>` components.

## Architecture

### Backend

```
artifacts/api-server/src/lib/auth/
├── index.ts                 # selectStrategy() + requireAuth export
├── types.ts                 # AuthStrategy interface, AuthRequest type
└── strategies/
    ├── bypass.ts            # mock dev user
    ├── clerk.ts             # @clerk/express middleware
    └── better-auth.ts       # Drizzle-backed sessions on /api/auth/*
```

All route handlers do:

```ts
import { requireAuth } from "./auth";
router.get("/notes", requireAuth, (req, res) => {
  const userId = req.userId; // always populated, regardless of provider
});
```

### Frontend

```
artifacts/learn/src/lib/
├── auth.tsx                 # useUser/useClerk/useAuth shim, picks provider
├── devAuthProvider.tsx      # bypass mock React context
├── betterAuthClient.ts      # Better Auth React client (signIn, useSession, ...)
└── clerkAppearance.ts       # Clerk theme tokens
```

Components only import from `@/lib/auth`:

```tsx
import { useUser } from "@/lib/auth";
const { user, isSignedIn } = useUser(); // works under any provider
```

## Migration scenarios

### Clerk → Better Auth (e.g. cost optimisation at scale)

1. Set up Better Auth env vars (above).
2. Run migrations (`pnpm db:migrate`).
3. Export Clerk users via [Clerk's user export API](https://clerk.com/docs/users/exporting-users) and seed them into `auth_user` (one-shot script).
4. Optionally implement a "set new password" flow on first login (Clerk does not expose hashed passwords).
5. Flip `AUTH_PROVIDER=better-auth` + `VITE_AUTH_PROVIDER=better-auth` and deploy.

The `userId` columns in your data tables remain the same — you control how
to map Clerk's `user_xxx` IDs to Better Auth IDs during the migration script.

### Local dev → SaaS demo

```bash
# Default (local Postgres + bypass)
pnpm run dev

# Switch to Clerk demo without changing code
AUTH_PROVIDER=clerk CLERK_SECRET_KEY=... pnpm run dev
```

## Tests

- `lib/clerk-config/src/index.test.ts` — 18 tests on key/host resolution
- `artifacts/api-server/src/lib/auth/strategies/bypass.test.ts` — 2 tests
- `artifacts/learn/src/lib/auth.test.tsx` — 2 tests on shim provider selection

## Why three providers instead of just Clerk?

See the detailed analysis in `TECH_STACK_UPGRADES.md` (Auth section). Short
version: Clerk is convenient for MVPs (≤10K MAU free), but at scale it
becomes expensive ($$$ per MAU), requires data residency in the US, and
makes the user table a third-party silo. Better Auth gives the same UX
quality, $0 forever, with full ownership of the data model.
