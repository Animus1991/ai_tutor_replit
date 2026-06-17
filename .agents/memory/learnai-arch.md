---
name: LearnAI architecture
description: Key architectural decisions for the LearnAI adaptive learning platform
---

## Core decisions

- **API contract**: OpenAPI spec in `lib/api-spec/openapi.yaml` → Orval codegen → React Query hooks (`lib/api-client-react`) + Zod schemas (`lib/api-zod`)
- **Auth**: Clerk with proxy middleware. `requireAuth` middleware extracts `userId` from `getAuth(req)`. Cookie-based, no Bearer tokens on client.
- **AI**: `@workspace/integrations-openai-ai-server` wraps OpenAI. Model: `gpt-5.4` for all generation. SSE streaming for: course step generation, hints, explanations, tutor chat.
- **DB**: PostgreSQL + Drizzle ORM. Tables: `notes`, `courses`, `lesson_steps`, `course_progress`, `activity_log`, `learning_profiles`, `conversations`, `messages`.
- **Learning style**: Auto-inferred from behavior (quiz accuracy + hint usage rate) after 5+ data points. Never asked of the user. Stored in `learning_profiles.ai_inferred_style`.
- **SSE pattern**: Set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. Each event: `data: ${JSON.stringify(payload)}\n\n`.
- **Frontend routing**: wouter with base path. Clerk inside WouterRouter. Protected routes use `<Show when="signed-in">`.
- **Course generation flow**: POST /api/courses (creates with status=generating) → POST /api/courses/:id/generate-steps (SSE, calls OpenAI, inserts steps, sets status=ready).

**Why SSE over WebSockets**: simpler server-side, one-directional for AI streaming, works well with Express 5.
**Why contract-first**: typed hooks prevent API drift, Zod schemas validate inputs automatically.
