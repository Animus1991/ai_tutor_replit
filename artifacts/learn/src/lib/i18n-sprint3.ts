/** Sprint 3 — Feynman rubric, scratchpad lesson-link, mini dashboard actions. */

import type { WorkspaceTool } from "@/pages/StudyWorkspace.types";

export const I18N_SPRINT3_EN: Record<string, string> = {
  // Feynman rubric
  "workspace.feynman.outline.title": "Suggested outline",
  "workspace.feynman.outline.1": "What is the core idea in one sentence?",
  "workspace.feynman.outline.2": "Why does it matter (mechanism)?",
  "workspace.feynman.outline.3": "Give a concrete example.",
  "workspace.feynman.outline.4": "What is often confused with this?",
  "workspace.feynman.rubric.title": "Clarity rubric",
  "workspace.feynman.rubric.accuracy": "Accuracy",
  "workspace.feynman.rubric.completeness": "Completeness",
  "workspace.feynman.rubric.simplicity": "Simplicity",
  "workspace.feynman.rubric.structure": "Structure",
  "workspace.feynman.gaps.title": "Gaps to fix",
  "workspace.feynman.gap.mapLink": "Review on concept map →",
  "workspace.feynman.gap.accuracy":
    "Missing key terms (Cournot, Bertrand, MC, quantity, price).",
  "workspace.feynman.gap.completeness":
    "Expand the mechanism — very brief so far.",
  "workspace.feynman.gap.simplicity":
    "Try shorter sentences; explain like teaching a beginner.",
  "workspace.feynman.gap.structure": "Add because/example to connect ideas.",

  // Scratchpad
  "workspace.scratchpad.title": "Formula Scratchpad",
  "workspace.scratchpad.addCustom": "Add Custom",
  "workspace.scratchpad.variables": "Variables",
  "workspace.scratchpad.compute": "Compute Step-by-Step",
  "workspace.scratchpad.solution": "Solution",
  "workspace.scratchpad.copy": "Copy",
  "workspace.scratchpad.copied": "Copied",
  "workspace.scratchpad.lessonLink":
    "Linked from lesson step {{step}} — values pre-filled.",
  "workspace.scratchpad.loadLesson": "Load from lesson",
  "workspace.scratchpad.form.f1": "Price Elasticity",
  "workspace.scratchpad.form.f2": "Cournot Best Response",
  "workspace.scratchpad.form.f3": "Consumer Surplus",
  "workspace.scratchpad.form.f4": "Profit Maximisation",
  "workspace.scratchpad.form.custom": "Custom Formula",
  "workspace.scratchpad.err.fill": "⚠ Fill in all variables first.",
  "workspace.scratchpad.err.invalid": "⚠ Invalid numbers.",

  // Mini dashboard
  "workspace.mini.title": "Quick View",
  "workspace.mini.tab.status": "🎯 Status",
  "workspace.mini.tab.weak": "⚠ Weak",
  "workspace.mini.tab.next": "▶ Next",
  "workspace.mini.readiness": "Exam Readiness · {{pct}}%",
  "workspace.mini.concepts": "{{mastered}}/{{total}} concepts",
  "workspace.mini.streak": "Streak",
  "workspace.mini.due": "Due",
  "workspace.mini.weakLabel": "Weak",
  "workspace.mini.noWeak": "No weak spots! 🎉",
  "workspace.mini.run": "Start",
  "workspace.mini.readinessExplain": "Why {{pct}}%?",
  "workspace.mini.readinessBody":
    "Based on quiz accuracy (78%), self-reliance without hints, and steady practice — weighted toward exam-style retrieval.",
  "workspace.mini.band.strong": "Strong",
  "workspace.mini.band.proficient": "Proficient",
  "workspace.mini.band.developing": "Developing",
  "workspace.mini.band.weak": "Weak",

  "workspace.mini.action.review1.tool": "leitner",
  "workspace.mini.action.review2.tool": "scratchpad",
  "workspace.mini.action.review2.step": "4",
  "workspace.mini.action.review3.tool": "concept-map",
  "workspace.mini.action.review3.step": "0",
};

export const I18N_SPRINT3_EL: Record<string, string> = {
  "workspace.feynman.outline.title": "Προτεινόμενο outline",
  "workspace.feynman.outline.1": "Ποια είναι η κεντρική ιδέα σε μία πρόταση;",
  "workspace.feynman.outline.2": "Γιατί έχει σημασία (μηχανισμός);",
  "workspace.feynman.outline.3": "Δώσε συγκεκριμένο παράδειγμα.",
  "workspace.feynman.outline.4": "Τι συχνά συγχέεται με αυτό;",
  "workspace.feynman.rubric.title": "Rubric σαφήνειας",
  "workspace.feynman.rubric.accuracy": "Ακρίβεια",
  "workspace.feynman.rubric.completeness": "Πληρότητα",
  "workspace.feynman.rubric.simplicity": "Απλότητα",
  "workspace.feynman.rubric.structure": "Δομή",
  "workspace.feynman.gaps.title": "Κενά προς διόρθωση",
  "workspace.feynman.gap.mapLink": "Δες στο concept map →",
  "workspace.feynman.gap.accuracy":
    "Λείπουν key terms (Cournot, Bertrand, MC, quantity, price).",
  "workspace.feynman.gap.completeness":
    "Επέκτεινε τον μηχανισμό — πολύ σύντομο ακόμα.",
  "workspace.feynman.gap.simplicity":
    "Κοντότερες προτάσεις· εξήγησε σαν σε αρχάριο.",
  "workspace.feynman.gap.structure":
    "Πρόσθεσε because/example για σύνδεση ιδεών.",

  "workspace.scratchpad.title": "Formula Scratchpad",
  "workspace.scratchpad.addCustom": "Προσθήκη",
  "workspace.scratchpad.variables": "Μεταβλητές",
  "workspace.scratchpad.compute": "Υπολογισμός βήμα-βήμα",
  "workspace.scratchpad.solution": "Λύση",
  "workspace.scratchpad.copy": "Αντιγραφή",
  "workspace.scratchpad.copied": "Αντιγράφηκε",
  "workspace.scratchpad.lessonLink":
    "Συνδεδεμένο από βήμα {{step}} — τιμές pre-filled.",
  "workspace.scratchpad.loadLesson": "Φόρτωση από μάθημα",
  "workspace.scratchpad.form.f1": "Ελαστικότητα Τιμής",
  "workspace.scratchpad.form.f2": "Cournot Best Response",
  "workspace.scratchpad.form.f3": "Consumer Surplus",
  "workspace.scratchpad.form.f4": "Μεγιστοποίηση Κέρδους",
  "workspace.scratchpad.form.custom": "Custom Formula",
  "workspace.scratchpad.err.fill": "⚠ Συμπλήρωσε όλες τις μεταβλητές.",
  "workspace.scratchpad.err.invalid": "⚠ Μη έγκυροι αριθμοί.",

  "workspace.mini.title": "Γρήγορη Εικόνα",
  "workspace.mini.tab.status": "🎯 Κατάσταση",
  "workspace.mini.tab.weak": "⚠ Αδύναμα",
  "workspace.mini.tab.next": "▶ Επόμενο",
  "workspace.mini.readiness": "Ετοιμότητα · {{pct}}%",
  "workspace.mini.concepts": "{{mastered}}/{{total}} έννοιες",
  "workspace.mini.streak": "Σερί",
  "workspace.mini.due": "Due",
  "workspace.mini.weakLabel": "Αδύναμα",
  "workspace.mini.noWeak": "Κανένα αδύναμο σημείο! 🎉",
  "workspace.mini.run": "Έναρξη",
  "workspace.mini.readinessExplain": "Γιατί {{pct}}%;",
  "workspace.mini.readinessBody":
    "Βάσει ακρίβειας quiz (78%), αυτονομίας χωρίς hints και σταθερού ρυθμού — βαρύτητα σε retrieval όπως σε εξέταση.",
  "workspace.mini.band.strong": "Ισχυρό",
  "workspace.mini.band.proficient": "Επαρκές",
  "workspace.mini.band.developing": "Αναπτυσσόμενο",
  "workspace.mini.band.weak": "Αδύναμο",

  "workspace.mini.action.review1.tool": "leitner",
  "workspace.mini.action.review2.tool": "scratchpad",
  "workspace.mini.action.review2.step": "4",
  "workspace.mini.action.review3.tool": "concept-map",
  "workspace.mini.action.review3.step": "0",
};

export interface DashboardActionTarget {
  id: string;
  tool: WorkspaceTool;
  step?: number;
}

export const DASHBOARD_ACTION_TARGETS: DashboardActionTarget[] = [
  { id: "review1", tool: "leitner" },
  { id: "review2", tool: "scratchpad", step: 4 },
  { id: "review3", tool: "concept-map", step: 0 },
];

export const LESSON_SCRATCHPAD_LINK = {
  formulaId: "f2",
  step: 4,
  variables: [
    { symbol: "a", value: "100", unit: "$/u" },
    { symbol: "c", value: "10", unit: "$/u" },
    { symbol: "q₂", value: "30", unit: "u" },
    { symbol: "b", value: "1", unit: "" },
  ],
} as const;
