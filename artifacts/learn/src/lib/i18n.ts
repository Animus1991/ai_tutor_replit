/**
 * Synapse i18n
 *
 * Two access patterns coexist:
 *  - `t("nav.library")` — flat dot-keys (preferred, matches Option A reference)
 *  - `t("agent.modes.socratic")` — nested fallback (kept for legacy callers)
 *
 * Locale persistence:
 *  - Initial value reads from localStorage("synapse.lang") → "el" or "en" → default "en".
 *  - `setLocale()` writes back to localStorage and updates <html lang>.
 *  - `useTranslation()` provides a reactive hook for components.
 */

import { useCallback, useSyncExternalStore } from "react";
import {
  I18N_DEMO_WORKSPACE_EL,
  I18N_DEMO_WORKSPACE_EN,
} from "./i18n-demo-workspace";
import { I18N_EXTRA_EL, I18N_EXTRA_EN } from "./i18n-extra";
import { I18N_SPRINT1_EL, I18N_SPRINT1_EN } from "./i18n-sprint1";
import { I18N_SPRINT2_EL, I18N_SPRINT2_EN } from "./i18n-sprint2";
import { I18N_SPRINT3_EL, I18N_SPRINT3_EN } from "./i18n-sprint3";
import {
  I18N_VISUAL_DIAGRAMS_EL,
  I18N_VISUAL_DIAGRAMS_EN,
} from "./i18n-visual-diagrams";

export type Locale = "en" | "el";

const STORAGE_KEY = "synapse.lang";

const EN: Record<string, string> = {
  // Common
  "app.name": "Synapse",
  "app.tagline": "From static notes to adaptive tutoring",
  loading: "Loading…",
  save: "Save",
  cancel: "Cancel",
  continue: "Continue",
  back: "Back",
  next: "Next",
  finish: "Finish",
  close: "Close",
  open: "Open",
  edit: "Edit",
  delete: "Delete",
  add: "Add",
  remove: "Remove",
  search: "Search",
  filter: "Filter",
  sort: "Sort",
  all: "All",
  none: "None",
  or: "or",
  and: "and",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.library": "Library",
  "nav.tasks": "Tasks",
  "nav.agent": "Agent",
  "nav.analytics": "Analytics",
  "nav.progress": "Progress",
  "nav.settings": "Settings",
  "nav.workspace": "Study Workspace",
  "nav.onboarding": "Setup Wizard",

  // Dashboard priority tasks
  "dash.priority.title": "Priority Tasks",
  "dash.priority.viewAll": "View all",
  "dash.priority.allCaughtUp": "All caught up!",
  "dash.priority.needsFixing": "Needs Fixing — Mistakes & Prerequisites",
  "dash.antiPassive.title": "Active Recall Reminder",
  "dash.antiPassive.body":
    "You've been reading for a while without answering questions. Let's test what you remember!",
  "dash.antiPassive.cta": "Take a quick quiz",

  // Course detail
  "course.backToLibrary": "Back to Library",
  "course.start": "Start",
  "course.continue": "Continue",
  "course.review": "Review",
  "course.askAgent": "Ask Agent",
  "course.progress": "Course Progress",
  "course.stepsDone": "steps",
  "course.complete": "complete",
  "course.remaining": "remaining",
  "course.lessons": "steps",
  "course.estimated": "estimated",
  "course.concepts": "Concepts",
  "course.quizFreq": "Quiz Frequency",
  "course.tab.path": "Learning Path",
  "course.tab.map": "Concept Map",
  "course.tab.analytics": "Analytics",
  "course.noSteps": "No lesson steps yet.",
  "course.noConcepts": "Concept map will appear once the course is generated.",
  "course.mastery": "Course Mastery",
  "course.masteryHint": "Based on completed steps and graded answers.",

  // Landing Page
  "landing.hero.title": "From Static Notes to Adaptive Tutoring",
  "landing.hero.subtitle":
    "Upload your notes, PDFs, or slides. The AI builds a personalized interactive tutor-course — then discovers how you actually learn through your behavior, errors, and progress.",
  "landing.cta.start": "Start Learning Now",
  "landing.cta.demo": "See Demo",
  "landing.trust.free": "No credit card required",
  "landing.trust.subjects": "Works with any subject",
  "landing.trust.grounded": "Source-grounded AI",

  "landing.how.title": "How It Works",
  "landing.how.subtitle":
    "Four steps from raw material to mastery — no manual structuring needed.",
  "landing.how.step1.title": "Upload Your Material",
  "landing.how.step1.desc":
    "Drop your notes, PDFs, slides, or paste any content.",
  "landing.how.step2.title": "AI Analyzes & Structures",
  "landing.how.step2.desc":
    "Topics, concepts, prerequisites, gaps — all extracted automatically.",
  "landing.how.step3.title": "Learn Interactively",
  "landing.how.step3.desc":
    "Step-by-step lessons, practice, quizzes, and Socratic tutoring.",
  "landing.how.step4.title": "Adapt & Master",
  "landing.how.step4.desc":
    "The platform discovers how you learn and optimizes your path.",

  "landing.features.title": "Everything You Need to Master Any Subject",
  "landing.features.upload.title": "Upload Anything",
  "landing.features.upload.desc":
    "PDFs, slides, notes, images, code files, lecture transcripts — the AI handles it all.",
  "landing.features.ai.title": "AI Course Generation",
  "landing.features.ai.desc":
    "Automatically extracts topics, concepts, prerequisites, and builds a structured learning path.",
  "landing.features.adaptive.title": "Adaptive Tutoring",
  "landing.features.adaptive.desc":
    "The system learns how you learn — adjusting pace, depth, and practice based on real behavior.",
  "landing.features.practice.title": "Interactive Practice",
  "landing.features.practice.desc":
    "Quizzes, coding challenges, Socratic dialogues, exam simulations, and problem-solving loops.",
  "landing.features.spaced.title": "Spaced Repetition",
  "landing.features.spaced.desc":
    "Scientifically-timed reviews based on your forgetting curve and retention predictions.",
  "landing.features.analytics.title": "Learning Analytics",
  "landing.features.analytics.desc":
    "See mastery maps, weak spots, error patterns, misconceptions, and predicted retention.",

  "landing.diff.title": "Not Just Another AI Chat",
  "landing.diff.subtitle":
    "Synapse does not guess how you learn. It discovers it through your behavior.",
  "landing.diff.learning_styles":
    "❌ Fixed 'learning styles' (visual/auditory)",
  "landing.diff.evidence":
    "✅ Evidence-based adaptive model from real behavior",
  "landing.diff.generic": "❌ Generic AI chat with no structure",
  "landing.diff.full_course":
    "✅ Full interactive course with mastery tracking",
  "landing.diff.flashcards": "❌ Flashcards only or summaries only",
  "landing.diff.multimodal":
    "✅ Lessons, quizzes, practice, Socratic tutoring, exam prep",
  "landing.diff.hallucination": "❌ Hallucinated content without sources",
  "landing.diff.citations": "✅ Source-grounded with citation verification",
  "landing.diff.one_size": "❌ One-size-fits-all pacing",
  "landing.diff.adaptive_pace":
    "✅ Adapts difficulty, depth, and pace to your errors",
  "landing.diff.passive": "❌ Passive reading without recall",
  "landing.diff.active": "✅ Anti-passive learning with active recall prompts",

  // Dashboard
  "dash.welcome.morning": "Good morning!",
  "dash.welcome.afternoon": "Good afternoon!",
  "dash.welcome.evening": "Good evening!",
  "dash.stats.streak": "Day Streak",
  "dash.stats.xp": "Today's XP",
  "dash.stats.reviews": "Reviews Due",
  "dash.stats.concepts": "Concepts Mastered",
  "dash.stats.time": "Study Today",
  "dash.courses.title": "Active Courses",
  "dash.readiness.title": "Exam Readiness",
  "dash.readiness.subtitle":
    "Built from real performance — accuracy, retrieval, and practice volume.",
  "dash.signals.accuracy": "Accuracy",
  "dash.signals.accuracy.desc": "Correct first-attempt rate",
  "dash.signals.reliance": "Self-Reliance",
  "dash.signals.reliance.desc": "Solved without hints",
  "dash.signals.volume": "Practice Volume",
  "dash.signals.volume.desc": "Sessions completed",
  "dash.signals.retrieval": "Retrieval Strength",
  "dash.signals.retrieval.desc": "Recall without prompts",
  "dash.activity.title": "Recent Activity",
  "dash.weak.title": "Weak Areas",
  "dash.almost.title": "Almost There!",
  "dash.almost.subtitle": "1–2 more practice sessions to master:",
  "dash.exam.title": "Upcoming Exam",
  "dash.confidence.title": "Confidence Check",
  "dash.spaced.title": "Spaced Repetition",
  "dash.spaced.desc":
    "Reviews are scheduled based on your personal forgetting curve — not fixed intervals.",

  // Tasks
  "tasks.title": "Tasks",
  "tasks.subtitle": "Reviews, mistakes, and your study plan",
  "tasks.pending": "pending",
  "tasks.done": "done",
  "tasks.xp_available": "XP available",
  "tasks.allCaughtUp": "All caught up!",
  "tasks.examMode": "Exam Simulation",
  "tasks.errorNotebook": "Error Notebook",
  "tasks.studyPlan": "Study Plan",
  "tasks.sessions.title": "Start Session",
  "tasks.sessions.sprint": "Quick Sprint",
  "tasks.sessions.sprint.desc": "Fast review & flashcards",
  "tasks.sessions.focused": "Focused Session",
  "tasks.sessions.focused.desc": "Deep learning & practice",
  "tasks.sessions.deep": "Deep Session",
  "tasks.sessions.deep.desc": "Complex topics & exercises",
  "tasks.sessions.cram": "Exam Cram",
  "tasks.sessions.cram.desc": "Priority exam material",
  "tasks.sessions.review": "Spaced Review",
  "tasks.sessions.review.desc": "Due spaced repetitions",
  "tasks.danger.title": "Danger Zone — Needs Immediate Attention",
  "tasks.filters.all": "All",
  "tasks.filters.learn": "Learn",
  "tasks.filters.review": "Review",
  "tasks.filters.practice": "Practice",
  "tasks.filters.fix": "Fix",
  "tasks.filters.exam": "Exam",
  "tasks.retention.warning": "Retention dropping",

  // Library
  "lib.title": "Library",
  "lib.subtitle": "Your sources and generated courses",
  "lib.upload": "Upload Material",
  "lib.tabs.courses": "Courses",
  "lib.tabs.files": "Files",
  "lib.tabs.sources": "Sources",
  "lib.filters.all": "All",
  "lib.filters.in_progress": "In Progress",
  "lib.filters.generating": "Generating",
  "lib.filters.completed": "Completed",
  "lib.empty.title": "No content yet",
  "lib.empty.desc":
    "Upload your first document and the AI will transform it into an interactive learning course.",
  "lib.source_mode.strict": "🔒 Strict (Notes Only)",
  "lib.source_mode.enriched": "✨ Enriched",
  "lib.source_mode.notes": "📝 Notes",
  "lib.meta.concepts": "concepts",
  "lib.meta.glossary": "terms",
  "lib.meta.exercises": "exercises",

  // Agent
  "agent.title": "Synapse Agent",
  "agent.subtitle": "Source-grounded · Adaptive",
  "agent.placeholder": "Ask anything about your material…",
  "agent.mode.title": "Agent Mode",
  "agent.mode.socratic": "Socratic Tutor",
  "agent.mode.socratic.desc": "Guided questioning",
  "agent.mode.direct": "Direct Explain",
  "agent.mode.direct.desc": "Clear explanations",
  "agent.mode.beginner": "Beginner",
  "agent.mode.beginner.desc": "No prior knowledge",
  "agent.mode.exam_coach": "Exam Coach",
  "agent.mode.exam_coach.desc": "Exam-focused prep",
  "agent.mode.deep_theory": "Deep Theory",
  "agent.mode.deep_theory.desc": "Rigorous analysis",
  "agent.mode.practical": "Practical",
  "agent.mode.practical.desc": "Exercises & code",
  "agent.mode.error_diagnosis": "Error Diagnosis",
  "agent.mode.error_diagnosis.desc": "Find what you got wrong",
  "agent.mode.feynman": "Feynman",
  "agent.mode.feynman.desc": "Explain it back",
  "agent.mode.math": "Math Tutor",
  "agent.mode.memory_coach": "Memory Coach",
  "agent.input.placeholder": "Ask anything about your material…",
  "agent.source_grounded": "Source-grounded",
  "agent.no_answer": "🛡️ Do not give me the answer",
  "agent.attach_context": "📎 Attach source context",
  "agent.quick.explain": "Explain this concept simply",
  "agent.quick.practice": "Give me a practice question",
  "agent.quick.source": "Where does this come from in my notes?",
  "agent.quick.mistakes": "What are common mistakes here?",
  "agent.quick.flashcards": "Create flashcards for this topic",
  "agent.quick.exam": "Simulate an exam question",

  // Settings
  "settings.title": "Learning Preferences",
  "settings.subtitle":
    "Customize how Synapse teaches you. These are UI preferences — the adaptive engine also learns from your behavior over time.",
  "settings.teaching.title": "Teaching Approach",
  "settings.teaching.style": "Teaching style",
  "settings.teaching.style.socratic": "Socratic",
  "settings.teaching.style.direct": "Direct",
  "settings.teaching.style.mixed": "Mixed",
  "settings.teaching.depth": "Explanation depth",
  "settings.teaching.depth.beginner": "Beginner",
  "settings.teaching.depth.intermediate": "Intermediate",
  "settings.teaching.depth.advanced": "Advanced",
  "settings.teaching.depth.expert": "Expert",
  "settings.teaching.feedback": "Feedback tone",
  "settings.teaching.feedback.gentle": "Gentle",
  "settings.teaching.feedback.balanced": "Balanced",
  "settings.teaching.feedback.strict": "Strict",
  "settings.content.title": "Content Balance",
  "settings.content.theory_practice": "Theory vs Practice",
  "settings.content.theory": "More theory",
  "settings.content.practice": "More practice",
  "settings.content.questions": "Question frequency",
  "settings.content.questions.minimal": "Fewer",
  "settings.content.questions.moderate": "Moderate",
  "settings.content.questions.frequent": "Frequent",
  "settings.content.examples": "Example density",
  "settings.content.examples.fewer": "Fewer",
  "settings.content.examples.moderate": "Moderate",
  "settings.content.examples.many": "Many",
  "settings.content.diagrams": "Diagram frequency",
  "settings.content.diagrams.minimal": "Minimal",
  "settings.content.diagrams.moderate": "Moderate",
  "settings.content.diagrams.rich": "Rich",
  "settings.pacing.title": "Pacing & Difficulty",
  "settings.pacing.pace": "Pacing",
  "settings.pacing.pace.slow": "Slow",
  "settings.pacing.pace.moderate": "Moderate",
  "settings.pacing.pace.fast": "Fast",
  "settings.pacing.challenge": "Challenge level",
  "settings.pacing.challenge.low": "Low Stress",
  "settings.pacing.challenge.balanced": "Balanced",
  "settings.pacing.challenge.high": "High Challenge",
  "settings.pacing.lesson": "Lesson length",
  "settings.pacing.lesson.short": "Short (5-10m)",
  "settings.pacing.lesson.medium": "Medium (15-20m)",
  "settings.pacing.lesson.long": "Long (25-40m)",
  "settings.pacing.mastery": "Mastery threshold",
  "settings.source.title": "Source & Content Mode",
  "settings.source.mode": "Source mode",
  "settings.source.mode.strict": "Strict (Notes Only)",
  "settings.source.mode.enriched": "Notes + Enrichment",
  "settings.source.mode.notes_only": "Notes Structure Only",
  "settings.goals.title": "Study Goals",
  "settings.goals.daily": "Daily study goal",
  "settings.goals.exam": "Exam date",
  "settings.interface.title": "Interface",
  "settings.interface.theme": "Theme",
  "settings.interface.theme.dark": "Dark",
  "settings.interface.theme.light": "Light",
  "settings.interface.theme.system": "System",
  "settings.interface.language": "Language",
  "settings.interface.language.en": "English",
  "settings.interface.language.el": "Ελληνικά",
  "settings.color_system.title": "Design & Cognitive Color System",
  "settings.examDate": "Exam date",
  "settings.dailyMinutes": "Daily study time (minutes)",
  "settings.language": "Language",
  "settings.agentMode": "Default agent mode",
  "settings.strictSource": "Strict source-only mode",
  "settings.socratic": "Socratic mode (don't reveal answers immediately)",
  "settings.save": "Save settings",

  // Onboarding
  "onboard.welcome.title": "Welcome to Synapse",
  "onboard.welcome.subtitle":
    "Let's personalize your learning experience. This takes about 60 seconds. The adaptive engine will also learn from your behavior over time.",
  "onboard.welcome.cta": "Let's Go",
  "onboard.role.title": "How will you use Synapse?",
  "onboard.role.subtitle": "This helps us set up the right defaults",
  "onboard.role.university": "University Student",
  "onboard.role.university.desc": "Exam preparation from lecture materials",
  "onboard.role.highschool": "High School Student",
  "onboard.role.highschool.desc": "Structured learning and exam prep",
  "onboard.role.selflearner": "Self-Learner",
  "onboard.role.selflearner.desc": "Learn any subject at your own pace",
  "onboard.role.tutor": "Tutor / Teacher",
  "onboard.role.tutor.desc": "Create interactive lessons for students",
  "onboard.role.company": "Company / Training",
  "onboard.role.company.desc": "Transform documents into training",
  "onboard.goals.title": "What are your goals?",
  "onboard.goals.subtitle": "Select all that apply",
  "onboard.goals.exam": "Pass an upcoming exam",
  "onboard.goals.understand": "Deeply understand material",
  "onboard.goals.review": "Quick review & revision",
  "onboard.goals.practice": "Get more practice problems",
  "onboard.goals.organize": "Organize & structure my notes",
  "onboard.goals.explore": "Explore a new subject",
  "onboard.prefs.title": "Quick Preferences",
  "onboard.prefs.subtitle": "You can change these anytime in settings",
  "onboard.prefs.time": "Daily study goal",
  "onboard.prefs.exam": "Upcoming exam?",
  "onboard.complete.title": "You're All Set! 🎉",
  "onboard.complete.subtitle":
    "Upload your first document to generate an interactive course, or explore the dashboard first.",
  "onboard.complete.cta": "Upload My First Material",
  "onboard.complete.skip": "Skip — explore the demo first",
  "onboard.back": "Back",
  "onboard.continue": "Continue",

  // Workspace Tools
  "workspace.title": "Study Workspace",
  "workspace.tool.map": "Concept Map",
  "workspace.tool.sandbox": "Parametric Sandbox",
  "workspace.tool.leitner": "Leitner Box",
  "workspace.tool.compare": "Side-by-Side Compare",
  "workspace.tool.debate": "Debate Tree",
  "workspace.tool.reader": "Cognitive Reader",
  "workspace.tool.formulas": "Formula Scratchpad",
  "workspace.tool.source": "Source Viewer",
  "workspace.tool.annotations": "Annotations",
  "workspace.tool.memory": "Memory Stack",

  // Analytics Tabs
  "analytics.overview": "Overview",
  "analytics.mastery": "Mastery Map",
  "analytics.behavior": "Behavior",
  "analytics.insights": "AI Insights",
  "analytics.pipeline": "Pipeline",
  "analytics.tools": "Visual Tools",

  "lens.label": "Curriculum lens",
  "lens.theory": "Theory",
  "lens.practice": "Practice",

  "blueprint.eyebrow": "Implementation blueprint",
  "blueprint.title": "Step-by-step build plan",
  "blueprint.subtitle":
    "From upload to adaptive tutoring — what we ship and why.",
  "blueprint.phase1.phase": "Phase 1",
  "blueprint.phase1.title": "Build the spine",
  "blueprint.phase1.body": "Auth, upload, extraction, course outline, Library.",
  "blueprint.phase1.outcome":
    "Upload notes → structured course in under a minute.",
  "blueprint.phase2.phase": "Phase 2",
  "blueprint.phase2.title": "Teach from the source",
  "blueprint.phase2.body":
    "Source-grounded lessons, quizzes, flashcards, Tasks queue.",
  "blueprint.phase2.outcome": "A tutor, not a document viewer.",
  "blueprint.phase3.phase": "Phase 3",
  "blueprint.phase3.title": "Learn the learner",
  "blueprint.phase3.body":
    "Confidence, errors, retention — tune depth and spacing.",
  "blueprint.phase3.outcome": "Behavior-driven personalization.",
  "blueprint.phase4.phase": "Phase 4",
  "blueprint.phase4.title": "Proof and scale",
  "blueprint.phase4.body":
    "Analytics, offline reviews, export, B2B onboarding.",
  "blueprint.phase4.outcome": "Commercially durable product.",
  "blueprint.block.pedagogy.eyebrow": "Learning design",
  "blueprint.block.pedagogy.title": "Evidence-based pedagogy",
  "blueprint.block.pedagogy.summary":
    "Retrieval, spacing, worked examples — not passive summaries.",
  "blueprint.block.pedagogy.items":
    "Retrieval every few steps|Spaced repetition by mastery|Worked examples with fading|Metacognitive calibration|No learning-style myths",
  "blueprint.block.product.eyebrow": "Core product",
  "blueprint.block.product.title": "Five surfaces",
  "blueprint.block.product.summary":
    "Library, Tasks, Agent, Progress, Settings.",
  "blueprint.block.product.items":
    "Library: ingest + citations|Tasks: reviews + weak spots|Agent: Socratic + exam coach|Progress: mastery + calibration|Settings: pace + privacy",
  "blueprint.block.stack.eyebrow": "Our stack",
  "blueprint.block.stack.title": "Synapse monorepo",
  "blueprint.block.stack.summary":
    "React + Express + Postgres/pgvector — modular, source-grounded.",
  "blueprint.block.stack.items":
    "Frontend: React, Vite, TanStack, Synapse tokens|API: Express 5 + Drizzle ORM|DB: PostgreSQL + pgvector|Storage: S3-compatible (MinIO locally)|Auth: Clerk / Better Auth / dev bypass",
  "blueprint.block.pipeline.eyebrow": "AI pipeline",
  "blueprint.block.pipeline.title": "Upload → adapt loop",
  "blueprint.block.pipeline.summary":
    "Diagnose, structure, teach, assess, adapt.",
  "blueprint.block.pipeline.items":
    "Ingest + OCR + chunk + cite|Concept graph with prerequisites|Generate lessons + assessments|Update learner model every interaction|Regenerate tasks from behavior",
  "blueprint.block.mvp.eyebrow": "MVP scope",
  "blueprint.block.mvp.title": "Ship the learning loop first",
  "blueprint.block.mvp.summary":
    "Exam prep from uploaded notes — then breadth.",
  "blueprint.block.mvp.items":
    "upload → course → lesson → quiz → review → adapt|Delay marketplace, live classes, heavy gamification|V1: OCR, editing, heatmaps, offline packs|First wedge: university exam prep",
  "blueprint.block.honesty.eyebrow": "Honesty invariant",
  "blueprint.block.honesty.title": "Behavior-derived readiness",
  "blueprint.block.honesty.summary":
    "Mastery from graded first attempts — never self-report alone.",
  "blueprint.block.honesty.items":
    "First-attempt marker enforced in DB|Confidence vs accuracy calibration|No fake completion % as readiness|Source-grounded vs inferred labels|Deletable, tenant-scoped data",
  "progress.title": "Progress",
  "progress.subtitle": "Exam readiness, mastery map, and learning signals",

  // Common Educational Terms (kept in English with Greek explanations)
  "term.mastery": "Mastery (Κυριαρχία)",
  "term.retention": "Retention (Διατήρηση)",
  "term.spacing": "Spaced Repetition (Διαστηματική Επανάληψη)",
  "term.concept": "Concept (Έννοια)",
  "term.prerequisite": "Prerequisite (Προαπαιτούμενο)",
  "term.misconception": "Misconception (Εσφαλμένη αντίληψη)",
  "term.transfer": "Transfer Ability (Ικανότητα Μεταφοράς)",

  // Common UI
  "common.loading": "Loading…",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.retry": "Retry",
  "common.continue": "Continue",

  // Legacy aliases — kept for backwards-compat with older Settings page
  // that reads `agent.modes.<key>` (singular `agent.mode` is the new form).
  "agent.modes.socratic": "Socratic Tutor",
  "agent.modes.direct": "Direct Explain",
  "agent.modes.beginner": "Beginner",
  "agent.modes.exam_coach": "Exam Coach",
  "agent.modes.deep_theory": "Deep Theory",
  "agent.modes.practical": "Practical",
  "agent.modes.error_diagnosis": "Error Diagnosis",
  "agent.modes.feynman": "Feynman",
  "agent.modes.math": "Math Tutor",
  "agent.modes.memory_coach": "Memory Coach",
};

Object.assign(
  EN,
  I18N_EXTRA_EN,
  I18N_DEMO_WORKSPACE_EN,
  I18N_VISUAL_DIAGRAMS_EN,
  I18N_SPRINT1_EN,
  I18N_SPRINT2_EN,
  I18N_SPRINT3_EN,
);

const EL: Record<string, string> = {
  // Common
  "app.name": "Synapse",
  "app.tagline": "Από στατικές σημειώσεις σε προσαρμοστική διδασκαλία",
  loading: "Φόρτωση…",
  save: "Αποθήκευση",
  cancel: "Ακύρωση",
  continue: "Συνέχεια",
  back: "Πίσω",
  next: "Επόμενο",
  finish: "Τέλος",
  close: "Κλείσιμο",
  open: "Άνοιγμα",
  edit: "Επεξεργασία",
  delete: "Διαγραφή",
  add: "Προσθήκη",
  remove: "Αφαίρεση",
  search: "Αναζήτηση",
  filter: "Φίλτρο",
  sort: "Ταξινόμηση",
  all: "Όλα",
  none: "Κανένα",
  or: "ή",
  and: "και",

  // Navigation
  "nav.dashboard": "Πίνακας Ελέγχου",
  "nav.library": "Βιβλιοθήκη",
  "nav.tasks": "Εργασίες",
  "nav.agent": "AI Βοηθός",
  "nav.analytics": "Αναλυτικά",
  "nav.progress": "Πρόοδος",
  "nav.settings": "Ρυθμίσεις",
  "nav.workspace": "Χώρος Μελέτης",
  "nav.onboarding": "Οδηγός Ρύθμισης",

  "dash.priority.title": "Προτεραιότητες",
  "dash.priority.viewAll": "Όλα",
  "dash.priority.allCaughtUp": "Όλα ενημερωμένα!",
  "dash.priority.needsFixing": "Χρειάζεται Διόρθωση",
  "dash.antiPassive.title": "Υπενθύμιση Ενεργής Ανάκλησης",
  "dash.antiPassive.body":
    "Διαβάζεις εδώ και λίγο χωρίς ερωτήσεις. Ας ελέγξουμε τι θυμάσαι!",
  "dash.antiPassive.cta": "Γρήγορο κουίζ",

  "course.backToLibrary": "Πίσω στη Βιβλιοθήκη",
  "course.start": "Έναρξη",
  "course.continue": "Συνέχεια",
  "course.review": "Επανάληψη",
  "course.askAgent": "Ρώτα τον Agent",
  "course.progress": "Πρόοδος Μαθήματος",
  "course.stepsDone": "βήματα",
  "course.complete": "ολοκληρωμένο",
  "course.remaining": "απομένουν",
  "course.lessons": "βήματα",
  "course.estimated": "εκτιμ.",
  "course.concepts": "Έννοιες",
  "course.quizFreq": "Συχνότητα Κουίζ",
  "course.tab.path": "Διαδρομή",
  "course.tab.map": "Χάρτης Εννοιών",
  "course.tab.analytics": "Αναλυτικά",
  "course.noSteps": "Δεν υπάρχουν βήματα ακόμα.",
  "course.noConcepts": "Ο χάρτης εννοιών θα εμφανιστεί μετά τη δημιουργία.",
  "course.mastery": "Κυριαρχία",
  "course.masteryHint":
    "Βασισμένη σε ολοκληρωμένα βήματα και βαθμολογημένες απαντήσεις.",

  // Landing
  "landing.hero.title": "Από Στατικές Σημειώσεις σε Προσαρμοστική Διδασκαλία",
  "landing.hero.subtitle":
    "Ανεβάστε σημειώσεις, PDF ή διαφάνειες. Η AI δημιουργεί ένα εξατομικευμένο διαδραστικό μάθημα — και ανακαλύπτει πώς μαθαίνετε πραγματικά μέσω της συμπεριφοράς, των λαθών και της προόδου σας.",
  "landing.cta.start": "Ξεκινήστε Τώρα",
  "landing.cta.demo": "Δείτε Demo",
  "landing.trust.free": "Δεν απαιτείται κάρτα",
  "landing.trust.subjects": "Λειτουργεί με κάθε μάθημα",
  "landing.trust.grounded": "AI με πηγές",

  "landing.how.title": "Πώς Λειτουργεί",
  "landing.how.subtitle":
    "Τέσσερα βήματα από το ακατέργαστο υλικό στην κυριαρχία — χωρίς χειροκίνητη οργάνωση.",
  "landing.how.step1.title": "Ανεβάστε το Υλικό σας",
  "landing.how.step1.desc":
    "Αφήστε σημειώσεις, PDF, διαφάνειες ή επικολλήστε περιεχόμενο.",
  "landing.how.step2.title": "Η AI Αναλύει & Δομεί",
  "landing.how.step2.desc":
    "Θέματα, έννοιες, προαπαιτούμενα, κενά — εξάγονται αυτόματα.",
  "landing.how.step3.title": "Μάθετε Διαδραστικά",
  "landing.how.step3.desc":
    "Μαθήματα βήμα-βήμα, εξάσκηση, κουίζ και Σωκρατική διδασκαλία.",
  "landing.how.step4.title": "Προσαρμοστείτε & Κυριαρχήστε",
  "landing.how.step4.desc":
    "Η πλατφόρμα ανακαλύπτει πώς μαθαίνετε και βελτιστοποιεί την πορεία σας.",

  "landing.features.title":
    "Όλα όσα Χρειάζεστε για να Κυριαρχήσετε κάθε Μάθημα",
  "landing.features.upload.title": "Ανεβάστε Οτιδήποτε",
  "landing.features.upload.desc":
    "PDF, διαφάνειες, σημειώσεις, εικόνες, αρχεία κώδικα, μεταγραφές — η AI τα χειρίζεται όλα.",
  "landing.features.ai.title": "AI Δημιουργία Μαθήματος",
  "landing.features.ai.desc":
    "Εξάγει αυτόματα θέματα, έννοιες, προαπαιτούμενα και χτίζει δομημένη διαδρομή μάθησης.",
  "landing.features.adaptive.title": "Προσαρμοστική Διδασκαλία",
  "landing.features.adaptive.desc":
    "Το σύστημα μαθαίνει πώς μαθαίνετε — προσαρμόζοντας ρυθμό, βάθος και εξάσκηση βάσει πραγματικής συμπεριφοράς.",
  "landing.features.practice.title": "Διαδραστική Εξάσκηση",
  "landing.features.practice.desc":
    "Κουίζ, προκλήσεις κώδικα, Σωκρατικοί διάλογοι, προσομοιώσεις εξετάσεων και βρόχοι επίλυσης προβλημάτων.",
  "landing.features.spaced.title": "Διαστηματική Επανάληψη",
  "landing.features.spaced.desc":
    "Επισκοπήσεις με επιστημονικό χρονοδιάγραμμα βάσει της καμπύλης λήθης και προβλέψεων διατήρησης.",
  "landing.features.analytics.title": "Αναλυτικά Μάθησης",
  "landing.features.analytics.desc":
    "Δείτε χάρτες κυριαρχίας, αδύναμα σημεία, μοτίβα λαθών, εσφαλμένες αντιλήψεις και προβλεπόμενη διατήρηση.",

  "landing.diff.title": "Όχι Απλώς Ένα AI Chat",
  "landing.diff.subtitle":
    "Το Synapse δεν μαντεύει πώς μαθαίνετε. Το ανακαλύπτει μέσω της συμπεριφοράς σας.",
  "landing.diff.learning_styles":
    "❌ Σταθερά «στυλ μάθησης» (οπτικό/ακουστικό)",
  "landing.diff.evidence": "✅ Προσαρμοστικό μοντέλο βάσει συμπεριφοράς",
  "landing.diff.generic": "❌ Γενικό AI chat χωρίς δομή",
  "landing.diff.full_course":
    "✅ Πλήρες διαδραστικό μάθημα με παρακολούθηση κυριαρχίας",
  "landing.diff.flashcards": "❌ Μόνο κάρτες ή περιλήψεις",
  "landing.diff.multimodal":
    "✅ Μαθήματα, κουίζ, εξάσκηση, Σωκρατική διδασκαλία, προετοιμασία εξετάσεων",
  "landing.diff.hallucination": "❌ Παραπλανητικό περιεχόμενο χωρίς πηγές",
  "landing.diff.citations": "✅ Βασισμένο σε πηγές με επαλήθευση παραπομπών",
  "landing.diff.one_size": "❌ Ένα μέγεθος για όλους",
  "landing.diff.adaptive_pace":
    "✅ Προσαρμόζει δυσκολία, βάθος και ρυθμό στα λάθη σας",
  "landing.diff.passive": "❌ Παθητική ανάγνωση χωρίς ανάκληση",
  "landing.diff.active": "✅ Ενεργή μάθηση με προτροπές ανάκλησης",

  // Dashboard
  "dash.welcome.morning": "Καλημέρα!",
  "dash.welcome.afternoon": "Καλό απόγευμα!",
  "dash.welcome.evening": "Καλό βράδυ!",
  "dash.stats.streak": "Σερί Ημερών",
  "dash.stats.xp": "Σημερινά XP",
  "dash.stats.reviews": "Επαναλήψεις",
  "dash.stats.concepts": "Κυριαρχημένες Έννοιες",
  "dash.stats.time": "Μελέτη Σήμερα",
  "dash.courses.title": "Ενεργά Μαθήματα",
  "dash.readiness.title": "Ετοιμότητα Εξέτασης",
  "dash.readiness.subtitle":
    "Βασισμένο σε πραγματική απόδοση — ακρίβεια, ανάκληση και όγκο εξάσκησης.",
  "dash.signals.accuracy": "Ακρίβεια",
  "dash.signals.accuracy.desc": "Ποσοστό σωστών προσπαθειών",
  "dash.signals.reliance": "Αυτονομία",
  "dash.signals.reliance.desc": "Επίλυση χωρίς υποδείξεις",
  "dash.signals.volume": "Όγκος Εξάσκησης",
  "dash.signals.volume.desc": "Ολοκληρωμένες συνεδρίες",
  "dash.signals.retrieval": "Ισχύς Ανάκλησης",
  "dash.signals.retrieval.desc": "Ανάκληση χωρίς υποδείξεις",
  "dash.activity.title": "Πρόσφατη Δραστηριότητα",
  "dash.weak.title": "Αδύναμα Σημεία",
  "dash.almost.title": "Σχεδόν Έτοιμα!",
  "dash.almost.subtitle": "1–2 ακόμα συνεδρίες για κυριαρχία:",
  "dash.exam.title": "Επερχόμενη Εξέταση",
  "dash.confidence.title": "Βαθμονόμηση Εμπιστοσύνης",
  "dash.spaced.title": "Διαστηματική Επανάληψη",
  "dash.spaced.desc":
    "Οι επαναλήψεις προγραμματίζονται βάσει της προσωπικής σας καμπύλης λήθης — όχι σταθερού διαστήματος.",

  // Tasks
  "tasks.title": "Εργασίες",
  "tasks.subtitle": "Επαναλήψεις, λάθη και το πλάνο μελέτης",
  "tasks.pending": "εκκρεμεί",
  "tasks.done": "ολοκληρωμένα",
  "tasks.xp_available": "XP διαθέσιμα",
  "tasks.allCaughtUp": "Όλα ενημερωμένα!",
  "tasks.examMode": "Προσομοίωση Εξέτασης",
  "tasks.errorNotebook": "Σημειωματάριο Λαθών",
  "tasks.studyPlan": "Πλάνο Μελέτης",
  "tasks.sessions.title": "Ξεκινήστε Συνεδρία",
  "tasks.sessions.sprint": "Γρήγορο Σπριντ",
  "tasks.sessions.sprint.desc": "Γρήγορη επανάληψη & κάρτες",
  "tasks.sessions.focused": "Εστιασμένη Συνεδρία",
  "tasks.sessions.focused.desc": "Βαθιά μάθηση & εξάσκηση",
  "tasks.sessions.deep": "Βαθιά Συνεδρία",
  "tasks.sessions.deep.desc": "Σύνθετα θέματα & ασκήσεις",
  "tasks.sessions.cram": "Προετοιμασία Εξέτασης",
  "tasks.sessions.cram.desc": "Προτεραιότητα ύλη εξέτασης",
  "tasks.sessions.review": "Διαστηματική Επανάληψη",
  "tasks.sessions.review.desc": "Προγραμματισμένες επαναλήψεις",
  "tasks.danger.title": "Ζώνη Κινδύνου — Άμεση Προσοχή",
  "tasks.filters.all": "Όλα",
  "tasks.filters.learn": "Μάθηση",
  "tasks.filters.review": "Επανάληψη",
  "tasks.filters.practice": "Εξάσκηση",
  "tasks.filters.fix": "Διόρθωση",
  "tasks.filters.exam": "Εξέταση",
  "tasks.retention.warning": "Πτώση διατήρησης",

  // Library
  "lib.title": "Βιβλιοθήκη",
  "lib.subtitle": "Τα υλικά σας και τα μαθήματα που δημιουργήθηκαν",
  "lib.upload": "Ανέβασμα Υλικού",
  "lib.tabs.courses": "Μαθήματα",
  "lib.tabs.files": "Αρχεία",
  "lib.tabs.sources": "Πηγές",
  "lib.filters.all": "Όλα",
  "lib.filters.in_progress": "Σε Εξέλιξη",
  "lib.filters.generating": "Δημιουργία",
  "lib.filters.completed": "Ολοκληρωμένα",
  "lib.empty.title": "Κανένα περιεχόμενο ακόμα",
  "lib.empty.desc":
    "Ανεβάστε το πρώτο σας έγγραφο και η AI θα το μετατρέψει σε διαδραστικό μάθημα.",
  "lib.source_mode.strict": "🔒 Αυστηρό (Μόνο Σημειώσεις)",
  "lib.source_mode.enriched": "✨ Εμπλουτισμένο",
  "lib.source_mode.notes": "📝 Σημειώσεις",
  "lib.meta.concepts": "έννοιες",
  "lib.meta.glossary": "όροι",
  "lib.meta.exercises": "ασκήσεις",

  // Agent
  "agent.title": "AI Βοηθός Synapse",
  "agent.subtitle": "Βασισμένο σε πηγές · Προσαρμοστικό",
  "agent.placeholder": "Ρωτήστε οτιδήποτε για το υλικό σας…",
  "agent.mode.title": "Λειτουργία Βοηθού",
  "agent.mode.socratic": "Σωκρατικός Διδάσκαλος",
  "agent.mode.socratic.desc": "Καθοδηγούμενη αναζήτηση",
  "agent.mode.direct": "Άμεση Εξήγηση",
  "agent.mode.direct.desc": "Σαφείς εξηγήσεις",
  "agent.mode.beginner": "Αρχάριος",
  "agent.mode.beginner.desc": "Χωρίς προηγούμενες γνώσεις",
  "agent.mode.exam_coach": "Προπονητής Εξετάσεων",
  "agent.mode.exam_coach.desc": "Προετοιμασία εξετάσεων",
  "agent.mode.deep_theory": "Βαθιά Θεωρία",
  "agent.mode.deep_theory.desc": "Αυστηρή ανάλυση",
  "agent.mode.practical": "Πρακτικό",
  "agent.mode.practical.desc": "Ασκήσεις & κώδικας",
  "agent.mode.error_diagnosis": "Διάγνωση Λάθους",
  "agent.mode.error_diagnosis.desc": "Βρες τι έκανες λάθος",
  "agent.mode.feynman": "Feynman",
  "agent.mode.feynman.desc": "Εξηγησέ το πίσω",
  "agent.mode.math": "Μαθηματικά",
  "agent.mode.memory_coach": "Μνήμη",
  "agent.input.placeholder": "Ρωτήστε οτιδήποτε για το υλικό σας…",
  "agent.source_grounded": "Βασισμένο σε πηγές",
  "agent.no_answer": "🛡️ Μην μου δώσεις την απάντηση",
  "agent.attach_context": "📎 Επισύναψη πηγαίου πλαισίου",
  "agent.quick.explain": "Εξήγησε απλά αυτή την έννοια",
  "agent.quick.practice": "Δώσε μου μια ερώτηση εξάσκησης",
  "agent.quick.source": "Από πού προέρχεται αυτό στις σημειώσεις μου;",
  "agent.quick.mistakes": "Ποια είναι τα συνηθισμένα λάθη εδώ;",
  "agent.quick.flashcards": "Δημιούργησε κάρτες για αυτό το θέμα",
  "agent.quick.exam": "Προσομοίωσε ερώτηση εξέτασης",

  // Settings
  "settings.title": "Προτιμήσεις Μάθησης",
  "settings.subtitle":
    "Προσαρμόστε πώς σας διδάσκει το Synapse. Αυτές είναι προτιμήσεις UI — η προσαρμοστική μηχανή μαθαίνει επίσης από τη συμπεριφορά σας με την πάροδο του χρόνου.",
  "settings.teaching.title": "Προσέγγιση Διδασκαλίας",
  "settings.teaching.style": "Στυλ διδασκαλίας",
  "settings.teaching.style.socratic": "Σωκρατικό",
  "settings.teaching.style.direct": "Άμεσο",
  "settings.teaching.style.mixed": "Μικτό",
  "settings.teaching.depth": "Βάθος εξήγησης",
  "settings.teaching.depth.beginner": "Αρχάριο",
  "settings.teaching.depth.intermediate": "Μεσαίο",
  "settings.teaching.depth.advanced": "Προχωρημένο",
  "settings.teaching.depth.expert": "Ειδικό",
  "settings.teaching.feedback": "Τόνος ανατροφοδότησης",
  "settings.teaching.feedback.gentle": "Απαλός",
  "settings.teaching.feedback.balanced": "Ισορροπημένος",
  "settings.teaching.feedback.strict": "Αυστηρός",
  "settings.content.title": "Ισορροπία Περιεχομένου",
  "settings.content.theory_practice": "Θεωρία vs Πρακτική",
  "settings.content.theory": "Περισσότερη θεωρία",
  "settings.content.practice": "Περισσότερη πρακτική",
  "settings.content.questions": "Συχνότητα ερωτήσεων",
  "settings.content.questions.minimal": "Λιγότερες",
  "settings.content.questions.moderate": "Μετρίες",
  "settings.content.questions.frequent": "Συχνές",
  "settings.content.examples": "Πυκνότητα παραδειγμάτων",
  "settings.content.examples.fewer": "Λιγότερα",
  "settings.content.examples.moderate": "Μετρίως",
  "settings.content.examples.many": "Πολλά",
  "settings.content.diagrams": "Συχνότητα διαγραμμάτων",
  "settings.content.diagrams.minimal": "Ελάχιστα",
  "settings.content.diagrams.moderate": "Μετρίως",
  "settings.content.diagrams.rich": "Πλούσια",
  "settings.pacing.title": "Ρυθμός & Δυσκολία",
  "settings.pacing.pace": "Ρυθμός",
  "settings.pacing.pace.slow": "Αργός",
  "settings.pacing.pace.moderate": "Μέτριος",
  "settings.pacing.pace.fast": "Γρήγορος",
  "settings.pacing.challenge": "Επίπεδο πρόκλησης",
  "settings.pacing.challenge.low": "Χαμηλό Άγχος",
  "settings.pacing.challenge.balanced": "Ισορροπημένο",
  "settings.pacing.challenge.high": "Υψηλή Πρόκληση",
  "settings.pacing.lesson": "Διάρκεια μαθήματος",
  "settings.pacing.lesson.short": "Σύντομο (5-10λ)",
  "settings.pacing.lesson.medium": "Μεσαίο (15-20λ)",
  "settings.pacing.lesson.long": "Μακρύ (25-40λ)",
  "settings.pacing.mastery": "Κατώφλι κυριαρχίας",
  "settings.source.title": "Λειτουργία Πηγής & Περιεχομένου",
  "settings.source.mode": "Λειτουργία πηγής",
  "settings.source.mode.strict": "Αυστηρό (Μόνο Σημειώσεις)",
  "settings.source.mode.enriched": "Σημειώσεις + Εμπλουτισμός",
  "settings.source.mode.notes_only": "Μόνο Δομή Σημειώσεων",
  "settings.goals.title": "Στόχοι Μάθησης",
  "settings.goals.daily": "Ημερήσιος στόχος μελέτης",
  "settings.goals.exam": "Ημερομηνία εξέτασης",
  "settings.interface.title": "Διεπαφή",
  "settings.interface.theme": "Θέμα",
  "settings.interface.theme.dark": "Σκοτεινό",
  "settings.interface.theme.light": "Φωτεινό",
  "settings.interface.theme.system": "Συστήματος",
  "settings.interface.language": "Γλώσσα",
  "settings.interface.language.en": "English",
  "settings.interface.language.el": "Ελληνικά",
  "settings.color_system.title":
    "Σύστημα Χρωμάτων Σχεδιασμού & Γνωστικής Επιστήμης",
  "settings.examDate": "Ημερομηνία εξέτασης",
  "settings.dailyMinutes": "Καθημερινός χρόνος μελέτης (λεπτά)",
  "settings.language": "Γλώσσα",
  "settings.agentMode": "Προεπιλεγμένος τρόπος agent",
  "settings.strictSource": "Αυστηρή λειτουργία μόνο από πηγές",
  "settings.socratic": "Σωκρατική λειτουργία",
  "settings.save": "Αποθήκευση",

  // Onboarding
  "onboard.welcome.title": "Καλώς ήρθατε στο Synapse",
  "onboard.welcome.subtitle":
    "Ας εξατομικεύσουμε την εμπειρία μάθησής σας. Αυτό παίρνει περίπου 60 δευτερόλεπτα.",
  "onboard.welcome.cta": "Πάμε",
  "onboard.role.title": "Πώς θα χρησιμοποιήσετε το Synapse;",
  "onboard.role.subtitle":
    "Αυτό μας βοηθά να ρυθμίσουμε τις σωστές προεπιλογές",
  "onboard.role.university": "Φοιτητής Πανεπιστημίου",
  "onboard.role.university.desc": "Προετοιμασία εξετάσεων από υλικό διαλέξεων",
  "onboard.role.highschool": "Μαθητής Λυκείου",
  "onboard.role.highschool.desc": "Δομημένη μάθηση και προετοιμασία εξετάσεων",
  "onboard.role.selflearner": "Αυτοδίδακτος",
  "onboard.role.selflearner.desc":
    "Μάθετε οποιοδήποτε μάθημα με τον δικό σας ρυθμό",
  "onboard.role.tutor": "Καθηγητής / Καθοδηγητής",
  "onboard.role.tutor.desc": "Δημιουργήστε διαδραστικά μαθήματα για μαθητές",
  "onboard.role.company": "Εταιρεία / Εκπαίδευση",
  "onboard.role.company.desc": "Μετατρέψτε έγγραφα σε εκπαίδευση",
  "onboard.goals.title": "Ποιοι είναι οι στόχοι σας;",
  "onboard.goals.subtitle": "Επιλέξτε όλα όσα ισχύουν",
  "onboard.goals.exam": "Περάσω επερχόμενη εξέταση",
  "onboard.goals.understand": "Κατανοήσω βαθιά το υλικό",
  "onboard.goals.review": "Γρήγορη επανάληψη & αναθεώρηση",
  "onboard.goals.practice": "Πάρω περισσότερες ασκήσεις",
  "onboard.goals.organize": "Οργανώσω & δομήσω τις σημειώσεις μου",
  "onboard.goals.explore": "Εξερευνήσω νέο μάθημα",
  "onboard.prefs.title": "Γρήγορες Προτιμήσεις",
  "onboard.prefs.subtitle":
    "Μπορείτε να τα αλλάξετε ανά πάσα στιγμή στις ρυθμίσεις",
  "onboard.prefs.time": "Ημερήσιος στόχος μελέτης",
  "onboard.prefs.exam": "Επερχόμενη εξέταση;",
  "onboard.complete.title": "Όλα Έτοιμα! 🎉",
  "onboard.complete.subtitle":
    "Ανεβάστε το πρώτο σας έγγραφο για να δημιουργήσετε διαδραστικό μάθημα, ή εξερευνήστε πρώτα τον πίνακα ελέγχου.",
  "onboard.complete.cta": "Ανέβασμα Πρώτου Υλικού",
  "onboard.complete.skip": "Παράλειψη — εξερεύνηση demo πρώτα",
  "onboard.back": "Πίσω",
  "onboard.continue": "Συνέχεια",

  // Workspace
  "workspace.title": "Χώρος Μελέτης",
  "workspace.tool.map": "Χάρτης Εννοιών",
  "workspace.tool.sandbox": "Παραμετρικό Sandbox",
  "workspace.tool.leitner": "Κουτί Leitner",
  "workspace.tool.compare": "Σύγκριση Πλάι-πλάι",
  "workspace.tool.debate": "Δέντρο Συζήτησης",
  "workspace.tool.reader": "Γνωστικός Αναγνώστης",
  "workspace.tool.formulas": "Σημειωματάριο Φόρμουλων",
  "workspace.tool.source": "Προβολέας Πηγής",
  "workspace.tool.annotations": "Σχολιασμοί",
  "workspace.tool.memory": "Στοίβα Μνήμης",

  // Curriculum lens
  "lens.label": "Φακός προγράμματος",
  "lens.theory": "Θεωρία",
  "lens.practice": "Πρακτική",

  // Implementation blueprint
  "blueprint.eyebrow": "Σχέδιο υλοποίησης",
  "blueprint.title": "Βήμα-βήμα σχέδιο ανάπτυξης",
  "blueprint.subtitle":
    "Από το upload μέχρι την προσαρμοστική διδασκαλία — τι παραδίδουμε και γιατί.",
  "blueprint.phase1.phase": "Φάση 1",
  "blueprint.phase1.title": "Χτίζουμε τη ραχοκοκαλιά",
  "blueprint.phase1.body":
    "Auth, upload, εξαγωγή, περίγραμμα μαθήματος, Βιβλιοθήκη.",
  "blueprint.phase1.outcome":
    "Upload σημειώσεων → δομημένο μάθημα σε λιγότερο από ένα λεπτό.",
  "blueprint.phase2.phase": "Φάση 2",
  "blueprint.phase2.title": "Διδασκαλία από την πηγή",
  "blueprint.phase2.body":
    "Μαθήματα με πηγές, κουίζ, flashcards, ουρά Εργασιών.",
  "blueprint.phase2.outcome": "Tutor, όχι απλός viewer εγγράφων.",
  "blueprint.phase3.phase": "Φάση 3",
  "blueprint.phase3.title": "Μαθαίνουμε τον μαθητή",
  "blueprint.phase3.body":
    "Εμπιστοσύνη, λάθη, διατήρηση — ρυθμίζουμε βάθος και spacing.",
  "blueprint.phase3.outcome": "Εξατομίκευση από συμπεριφορά.",
  "blueprint.phase4.phase": "Φάση 4",
  "blueprint.phase4.title": "Απόδειξη και κλίμακα",
  "blueprint.phase4.body":
    "Analytics, offline reviews, export, B2B onboarding.",
  "blueprint.phase4.outcome": "Εμπορικά βιώσιμο προϊόν.",
  "blueprint.block.pedagogy.eyebrow": "Σχεδιασμός μάθησης",
  "blueprint.block.pedagogy.title": "Παιδαγωγική με τεκμήρια",
  "blueprint.block.pedagogy.summary":
    "Ανάκληση, spacing, worked examples — όχι παθητικές περιλήψεις.",
  "blueprint.block.pedagogy.items":
    "Ανάκληση κάθε λίγα βήματα|Διαστηματική επανάληψη ανά mastery|Worked examples με fading|Μεταγνωστική βαθμονόμηση|Χωρίς μύθους learning styles",
  "blueprint.block.product.eyebrow": "Κύριο προϊόν",
  "blueprint.block.product.title": "Πέντε επιφάνειες",
  "blueprint.block.product.summary":
    "Βιβλιοθήκη, Εργασίες, Agent, Πρόοδος, Ρυθμίσεις.",
  "blueprint.block.product.items":
    "Βιβλιοθήκη: ingest + citations|Εργασίες: reviews + αδύναμα σημεία|Agent: Socratic + exam coach|Πρόοδος: mastery + calibration|Ρυθμίσεις: ρυθμός + privacy",
  "blueprint.block.stack.eyebrow": "Το stack μας",
  "blueprint.block.stack.title": "Synapse monorepo",
  "blueprint.block.stack.summary":
    "React + Express + Postgres/pgvector — modular, source-grounded.",
  "blueprint.block.stack.items":
    "Frontend: React, Vite, TanStack, Synapse tokens|API: Express 5 + Drizzle ORM|DB: PostgreSQL + pgvector|Storage: S3-compatible (MinIO τοπικά)|Auth: Clerk / Better Auth / dev bypass",
  "blueprint.block.pipeline.eyebrow": "AI pipeline",
  "blueprint.block.pipeline.title": "Upload → adapt loop",
  "blueprint.block.pipeline.summary":
    "Διάγνωση, δομή, διδασκαλία, αξιολόγηση, προσαρμογή.",
  "blueprint.block.pipeline.items":
    "Ingest + OCR + chunk + cite|Concept graph με prerequisites|Δημιουργία μαθημάτων + assessments|Ενημέρωση learner model σε κάθε αλληλεπίδραση|Αναδημιουργία tasks από συμπεριφορά",
  "blueprint.block.mvp.eyebrow": "Εύρος MVP",
  "blueprint.block.mvp.title": "Πρώτα το learning loop",
  "blueprint.block.mvp.summary":
    "Προετοιμασία εξετάσεων από uploaded notes — μετά εύρος.",
  "blueprint.block.mvp.items":
    "upload → course → lesson → quiz → review → adapt|Αναβολή marketplace, live classes, heavy gamification|V1: OCR, editing, heatmaps, offline packs|Πρώτο wedge: πανεπιστημιακή εξέταση",
  "blueprint.block.honesty.eyebrow": "Αρχή ειλικρίνειας",
  "blueprint.block.honesty.title": "Ετοιμότητα από συμπεριφορά",
  "blueprint.block.honesty.summary":
    "Mastery από graded first attempts — ποτέ μόνο self-report.",
  "blueprint.block.honesty.items":
    "First-attempt marker enforced στη DB|Confidence vs accuracy calibration|Όχι fake completion % ως readiness|Source-grounded vs inferred labels|Διαγράψιμα, tenant-scoped data",

  // Analytics
  "analytics.overview": "Επισκόπηση",
  "analytics.mastery": "Χάρτης Κυριαρχίας",
  "analytics.behavior": "Συμπεριφορά",
  "analytics.insights": "Πληροφορίες AI",
  "analytics.pipeline": "Αγωγός",
  "analytics.tools": "Οπτικά Εργαλεία",

  // Progress
  "progress.title": "Πρόοδος",
  "progress.subtitle": "Ετοιμότητα εξέτασης, mastery map και σήματα μάθησης",

  // Educational terms
  "term.mastery": "Mastery (Κυριαρχία)",
  "term.retention": "Retention (Διατήρηση)",
  "term.spacing": "Spaced Repetition (Διαστηματική Επανάληψη)",
  "term.concept": "Concept (Έννοια)",
  "term.prerequisite": "Prerequisite (Προαπαιτούμενο)",
  "term.misconception": "Misconception (Εσφαλμένη αντίληψη)",
  "term.transfer": "Transfer Ability (Ικανότητα Μεταφοράς)",

  // Common UI
  "common.loading": "Φόρτωση…",
  "common.save": "Αποθήκευση",
  "common.cancel": "Ακύρωση",
  "common.retry": "Επανάληψη",
  "common.continue": "Συνέχεια",

  // Legacy aliases
  "agent.modes.socratic": "Σωκρατικός Διδάσκαλος",
  "agent.modes.direct": "Άμεση Εξήγηση",
  "agent.modes.beginner": "Αρχάριος",
  "agent.modes.exam_coach": "Προπονητής Εξετάσεων",
  "agent.modes.deep_theory": "Βαθιά Θεωρία",
  "agent.modes.practical": "Πρακτικό",
  "agent.modes.error_diagnosis": "Διάγνωση Λάθους",
  "agent.modes.feynman": "Feynman",
  "agent.modes.math": "Μαθηματικά",
  "agent.modes.memory_coach": "Μνήμη",
};

Object.assign(
  EL,
  I18N_EXTRA_EL,
  I18N_DEMO_WORKSPACE_EL,
  I18N_VISUAL_DIAGRAMS_EL,
  I18N_SPRINT1_EL,
  I18N_SPRINT2_EL,
  I18N_SPRINT3_EL,
);

const DICT: Record<Locale, Record<string, string>> = { en: EN, el: EL };

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "el" || stored === "en") return stored;
  } catch {
    // ignore (SSR / privacy mode)
  }
  return "en";
}

let currentLocale: Locale = readInitialLocale();

const listeners = new Set<() => void>();

function emit() {
  for (const l of Array.from(listeners)) l();
}

export function setLocale(locale: Locale) {
  if (locale !== "en" && locale !== "el") return;
  if (currentLocale === locale) return;
  currentLocale = locale;
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }
  emit();
}

export function getLocale(): Locale {
  return currentLocale;
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Translate a flat dot-key (e.g. `"settings.title"`).
 * Falls back to English, then to the key itself.
 *
 * Supports `{{var}}` interpolation when a `params` object is passed.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = DICT[currentLocale] ?? DICT.en;
  const raw = dict[key] ?? DICT.en[key] ?? key;
  if (!params) return raw;
  return Object.entries(params).reduce(
    (acc, [k, v]) =>
      acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v)),
    raw,
  );
}

/** Sync locale from a user profile field (e.g. `profile.preferredLanguage`). */
export function initLocaleFromProfile(lang?: string | null) {
  if (lang === "el" || lang === "en") setLocale(lang);
}

/** Reactive hook: components re-render when the locale changes. */
export function useTranslation() {
  const language = useSyncExternalStore(
    (cb) => {
      const unsubscribe = subscribeLocale(cb);
      return () => unsubscribe();
    },
    () => currentLocale,
    () => "en" as Locale,
  );
  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      _translateFor(language, key, params),
    [language],
  );
  return { language, setLanguage: setLocale, t: translate };
}

function _translateFor(
  language: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = DICT[language] ?? DICT.en;
  const raw = dict[key] ?? DICT.en[key] ?? key;
  if (!params) return raw;
  return Object.entries(params).reduce(
    (acc, [k, v]) =>
      acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v)),
    raw,
  );
}

// Apply locale to <html lang> at module init (no-op on SSR).
if (typeof document !== "undefined") {
  document.documentElement.lang = currentLocale;
}
