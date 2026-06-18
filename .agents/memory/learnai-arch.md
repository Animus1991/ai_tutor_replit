---
name: LearnAI architecture
description: Key architectural decisions for the LearnAI adaptive learning platform
---

## Core decisions

- **API contract**: OpenAPI spec in `lib/api-spec/openapi.yaml` → Orval codegen → React Query hooks (`lib/api-client-react`) + Zod schemas (`lib/api-zod`)
- **Auth**: Clerk with proxy middleware. `requireAuth` middleware extracts `userId` from `getAuth(req)`. Cookie-based, no Bearer tokens on client.
- **AI**: `@workspace/integrations-openai-ai-server` wraps OpenAI. Model: `gpt-5.4` for all generation. SSE streaming for: course step generation, hints, explanations, tutor chat.
- **DB**: PostgreSQL + Drizzle ORM. Tables: `notes`, `source_chunks`, `courses`, `lesson_steps`, `concepts`, `concept_edges`, `lesson_step_concepts`, `course_progress`, `activity_log`, `answer_events`, `learning_profiles`, `mastery_records`, `mistakes`, `review_schedules`, `conversations`, `messages`.
- **Learner model**: Behaviour-derived only — no learning-style questionnaires. Adaptive prefs (`quizFrequencyPreference`, etc.) are explicit user choices, not inferred mastery proxies.
- **Phase 2 (Tasks)**: `GET /tasks`, `POST /tasks/:conceptId/review`, `/tasks` page with nav badge. FSRS-lite in `artifacts/api-server/src/lib/fsrs.ts`.
- **Phase 3 (Grounding)**: PDF/image upload via `POST /notes/upload`, chunking + embeddings in `source_chunks`, retrieval in `sourceRetrieval.ts`, grounded generation in `courses.ts`, tutor "not in notes" guard in `openai-routes.ts`.
- **Conversation security**: `conversations.user_id` required; all tutor routes filter by `req.userId`.
- **SSE pattern**: Set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. Each event: `data: ${JSON.stringify(payload)}\n\n`.
- **Frontend routing**: wouter with base path. Clerk inside WouterRouter. Protected routes use `<Show when="signed-in">`.
- **Course generation flow**: POST /api/courses (creates with status=generating) → POST /api/courses/:id/generate-steps (SSE, calls OpenAI, inserts steps, sets status=ready).

**Why SSE over WebSockets**: simpler server-side, one-directional for AI streaming, works well with Express 5.
**Why contract-first**: typed hooks prevent API drift, Zod schemas validate inputs automatically.
