# LearnAI

An AI-powered adaptive learning platform. Users upload study notes and the AI generates personalized interactive tutoring lessons. Two core innovations: (1) notes → interactive lesson via AI, (2) gradual auto-discovery of user's learning style through behavior.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/learn run dev` — run the React frontend (port 20579)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite libs (run before leaf typechecks if libs changed)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: Clerk (`@clerk/express` server-side, `@clerk/react` client-side)
- AI: OpenAI via Replit AI Integrations (`@workspace/integrations-openai-ai-server`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + wouter
- Markdown rendering: react-markdown

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/` — Drizzle ORM schema (notes, courses, progress, profiles, conversations, messages)
- `lib/api-client-react/src/generated/` — generated React Query hooks (run codegen to update)
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/` — all Express API route handlers
- `artifacts/learn/src/pages/` — all frontend pages
- `artifacts/learn/src/components/` — UI components (layout, shadcn/ui)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas
- Clerk auth with proxy middleware — cookies, no Bearer tokens
- SSE streaming for AI generation (course steps, hints, explanations, tutor chat)
- AI model: `gpt-5.4` for all generation
- Learning style is inferred automatically from quiz accuracy + hint usage — never asked of the user
- All protected routes use `requireAuth` middleware which extracts `userId` from Clerk session

## Product

- Landing page (public) → sign up → upload notes → create course (select type/difficulty/quiz freq) → AI generates lesson via SSE → interactive lesson player
- Lesson player: step-by-step progress, knowledge checks, code exercises, hint panel, explain panel, AI tutor chat
- Dashboard: XP, streak, recent courses, AI-inferred learning style insights
- Profile: adaptive preferences (quiz frequency, pace, difficulty, course type) + learning style
- Learning style auto-inferred from behavior after 5+ data points (accuracy + hint usage patterns)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — libs must be built first
- `req.params.id` in Express 5 is typed as `string | string[]` — always cast: `req.params["id"] as string`
- API hooks expect `number` for id params (not `string`) — use `Number(id)` or `courseId` directly
- SSE endpoints: always set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- DB schema index must export all schema tables for `@workspace/db` to expose them
- `publishableKeyFromHost` from `@clerk/shared/keys` (not `@clerk/shared`) for the server

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `lib/api-spec/openapi.yaml` for the full API contract
- Clerk proxy middleware lives at `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`
