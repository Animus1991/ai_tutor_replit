---
name: Graded-answer recording & retry behavior
description: Why submit_answer records every attempt (no first-attempt dedup) and the UX constraint that forces it
---

# Graded answers: record every attempt, do NOT dedup to "first attempt"

`submit_answer` increments the `course_progress` accuracy aggregate AND inserts one
`answer_events` row per attempt, atomically in a single DB transaction. It does NOT
dedup to a learner's first attempt per step.

**Why:**
1. The lesson player renders **no "Next"/skip button on question steps** (the Continue
   button is gated `stepType !== "question"`). A wrong answer locks the UI; the only way
   forward is to re-answer the same question (component state resets on reload, and the
   step isn't in `completedStepIds` until answered correctly). So first-attempt dedup
   would **permanently strand** a learner on any question they first got wrong.
2. Counting every attempt is the *honest* behavior, not a lie: each wrong retry adds an
   `incorrect`, which **lowers** accuracy. Retry-until-correct therefore cannot inflate
   readiness here. The only real inflation vector is an accidental double-submit of a
   correct answer — already mitigated client-side (button disabled while submitting/after
   submit).

**How to apply:**
- If you ever add first-attempt dedup or change retry semantics, you MUST first add
  forward navigation (Next/skip) for question steps, or learners get stuck.
- Keep the aggregate update + `answer_events` insert in the same transaction so the model
  never has an increment without its matching calibration event (and vice-versa).
- `submit_answer` requires `confidence` (returns 400 if missing/invalid) and validates
  course ownership (`course.userId === req.userId`) + `step.courseId === courseId` before
  grading — these guard against cross-course metric poisoning.
