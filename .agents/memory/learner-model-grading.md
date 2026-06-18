---
name: Graded-answer recording & first-attempt honesty
description: First-attempt dedup, Beta-binomial mastery, mistakes queue, and FSRS scheduling
---

# Graded answers: first-attempt dedup + full attempt history

`submit_answer` in `progress.ts`:

1. Records **every** attempt in `answer_events` (for honest accuracy + calibration).
2. Marks exactly one row per `(user, step)` with `is_first_attempt = true` — enforced by a partial unique index at DB level.
3. Updates `mastery_records` (Beta-binomial) **only** from first attempts.
4. Opens/resolves rows in `mistakes` on wrong/correct first attempts.
5. Upserts `review_schedules` (FSRS-lite) per concept on first attempts.

Retries lower accuracy but never inflate mastery. The lesson player allows re-answering until correct.

**Concurrency:** `SELECT … FOR UPDATE` on `course_progress` + atomic SQL counter increments.

**Do not** remove first-attempt dedup without understanding the honesty invariant documented in README §7.
