---
name: Learner-model unlock gating
description: How exam-readiness/mastery unlocks and why hints must not count toward it.
---

Exam-readiness & mastery (the `/dashboard/learner-model` handler) unlock only after `MIN_GRADED` (5) graded ANSWERS — i.e. `correct + incorrect`. Hints are an input to the self-reliance signal, but are NEVER counted toward the unlock threshold, `nextInsightAt`, or confidence.

**Why:** an earlier version gated on `answered + hints >= 5`, which let 1 correct answer + 4 hints unlock a misleading "strong / ~70% ready" from a single graded data point. This model is an exam-prep signal, so it must rest on graded performance, not interaction volume.
**How to apply:** if you touch the learner-model handler, derive the gate, `nextInsightAt`, and confidence from `answered`, not `answered + hints`. `dataPointsCollected` (total interactions) is display-only.
