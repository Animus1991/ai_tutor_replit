# Study Workspace — Tool Enrichment Plan

> Στόχος: κάθε εργαλείο να φτάνει το επίπεδο ποιότητας αντίστοιχων εργαλείων από Notion AI, Khan Academy, Anki, Desmos, Obsidian Canvas, Perusall, RemNote, και επιστημονικά validated learning tools (retrieval practice, dual coding, elaborative interrogation).

---

## 1. Lesson Pane (Left Column)

**Τρέχουσα κατάσταση:** 6 βήματα markdown, navigation, progress bar, κουμπιά Agent.

**Benchmark:** Khan Academy lesson flow, Coursera in-video checks, Brilliant step hints.

### Υποεργαλεία προς προσθήκη

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Inline retrieval cards** | 1-2 ερώτηση ανά βήμα πριν το «Next» | P0 |
| **Source citation popover** | Κλικ σε `[slide 34]` → excerpt από upload | P0 |
| **Step bookmark / flag** | Σήμανση βήματος για επανάληψη | P1 |
| **Reading time estimate** | ~X min ανά βήμα | P2 |
| **Socratic follow-up chips** | «Γιατί;», «Δώσε παράδειγμα», «Σύγκρινε» → Agent | P0 |
| **Mastery delta per step** | +3% / −1% μετά από quiz | P1 |

### Φάσεις υλοποίησης

1. **Phase A:** Inline micro-quiz gate + citation popover (mock source)
2. **Phase B:** Wire mastery delta από learner model API
3. **Phase C:** Adaptive step ordering βάσει weak spots

---

## 2. Concept Map (`DraggableConceptMap`)

**Τρέχουσα κατάσταση:** Drag, zoom, pan, notes, mastery ring, legend.

**Benchmark:** Obsidian Canvas, Kumu, RemNote concept maps, Neo4j Bloom.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Filter by mastery band** | Εμφάνιση μόνο weak/developing | P0 |
| **Path to exam highlight** | Shortest prerequisite path → target concept | P0 |
| **Contrast pair overlay** | Προβολή ζευγών σύγχυσης (Cournot vs Bertrand) | P1 |
| **Auto-layout** | Force-directed reset | P1 |
| **Export PNG / JSON** | Αποθήκευση χάρτη | P2 |
| **Click → mini-lesson** | Sidebar με 3-sentence recap + link to step | P0 |
| **Edge labels** | prerequisite / related / contrasts | P1 |

### Φάσεις

1. **Phase A:** Filter + click-to-recap panel
2. **Phase B:** Path highlight + contrast edges από learner model
3. **Phase C:** Collaborative / sync across devices

---

## 3. Parametric Sandbox (`InteractiveSimulator`)

**Τρέχουσα κατάσταση:** Supply/demand sliders, CS/PS shading, P*/Q*.

**Benchmark:** Desmos, Wolfram Demonstrations, PhET simulations.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Preset scenarios** | Tax, subsidy, price ceiling chips | P0 |
| **Numeric readouts table** | CS, PS, DWL, elasticity at point | P0 |
| **Step recorder** | Καταγραφή 3 τιμών → export ως «experiment log» | P1 |
| **Challenge mode** | «Ρύθμισε shock ώστε P* = 40» | P0 |
| **Model switcher** | Cournot quantity / Bertrand price tabs | P1 |
| **Formula overlay** | Εμφάνιση εξισώσεων που ενημερώνονται live | P0 |

### Φάσεις

1. **Phase A:** Presets + challenge mode + formula overlay
2. **Phase B:** DWL calculation + second model
3. **Phase C:** Custom models από uploaded problem sets

---

## 4. Leitner System (`LeitnerSystem`)

**Τρέχουσα κατάσταση:** 5 boxes, flip cards, correct/wrong advancement.

**Benchmark:** Anki, SuperMemo, RemNote flashcards.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Due count badge** | X cards due today per box | P0 |
| **Cloze / image cards** | Τύποι καρτών πέρα από front/back | P1 |
| **Add from lesson** | «+ Add concept» από τρέχον βήμα | P0 |
| **Session stats** | Accuracy, time, streak | P0 |
| **Leech detection** | Κάρτες που επιστρέφουν συνεχώς στο box 1 | P1 |
| **Audio / TTS** | Ανάγνωση όρου | P2 |

### Φάσεις

1. **Phase A:** Due counts + session stats + add-from-lesson
2. **Phase B:** Cloze cards + leech flag
3. **Phase C:** SM-2 interval algorithm αντί για fixed boxes

---

## 5. Side-by-Side Compare (`SideBySideCompare`)

**Τρέχουσα κατάσταση:** Static Anchoring vs Framing table.

**Benchmark:** Perusall compare, Notion databases side-by-side, Diff tools.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Topic picker** | Cournot vs Bertrand, Monopoly vs PC | P0 |
| **Highlight differences** | Auto-bold diverging cells | P1 |
| **Misconception row** | Dedicated row για common errors | P0 |
| **Exam trap row** | Τι ρωτούν συχνά στις εξετάσεις | P0 |
| **User notes per row** | Inline annotation | P1 |
| **Generate via Agent** | Νέο compare από uploaded notes | P1 |

### Φάσεις

1. **Phase A:** Topic picker (Cournot/Bertrand) + misconception/exam rows
2. **Phase B:** User notes + Agent generation
3. **Phase C:** 3-way compare (e.g. Cournot / Bertrand / Stackelberg)

---

## 6. Study Whiteboard (`StudyWhiteboard`)

**Τρέχουσα κατάσταση:** Pen, shapes, ruler, text, undo, localStorage save.

**Benchmark:** Excalidraw, OneNote, Miro, Notability.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Grid / snap** | Πλέγμα για διαγράμματα | P0 |
| **Formula stencil** | Drag-drop Σ, ∫, fractions | P1 |
| **Attach to step** | Whiteboard per lesson step | P0 |
| **Export PNG** | Λήψη σχεδίου | P1 |
| **Color-blind safe palette** | 4 χρώματα με αντίθεση | P0 |
| **Laser pointer mode** | Προσωρινή έμφαση (live tutoring) | P2 |

### Φάσεις

1. **Phase A:** Grid snap + per-step storage + contrast palette
2. **Phase B:** Export + formula stencils
3. **Phase C:** Sync to cloud + share with tutor

---

## 7. Feynman Check (`FeynmanCheck`)

**Τρέχουσα κατάσταση:** Textarea, API + heuristic, clarity score, gaps.

**Benchmark:** Explain Like I'm 5 workflows, OpenAI tutoring rubrics.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Rubric breakdown** | Accuracy / Completeness / Simplicity / Structure | P0 |
| **Suggested outline** | Bullet template πριν γράψεις | P0 |
| **Compare to source** | Side panel με canonical explanation | P1 |
| **Voice input** | Μιλήστε την εξήγηση | P2 |
| **Revision diff** | Δείξε βελτίωση μεταξύ attempts | P1 |
| **Link weak concepts** | Gaps → concept map nodes | P0 |

### Φάσεις

1. **Phase A:** Rubric breakdown + outline template + gap→map links
2. **Phase B:** Revision diff + source compare
3. **Phase C:** Voice + peer review mode

---

## 8. Study Timer (`StudyTimer`)

**Τρέχουσα κατάσταση:** Pomodoro focus/break.

**Benchmark:** Forest, Focus To-Do, Toggl Track.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Custom intervals** | 25/5, 50/10, exam sprint | P0 |
| **Session goal** | «2 pomodoros on Cournot» | P0 |
| **Distraction log** | Quick tag όταν διακόπτεσαι | P1 |
| **Weekly heatmap** | GitHub-style study grid | P1 |
| **Auto-start break** | Ήχος / notification | P2 |
| **Link to step** | Timer session tied to lesson step | P1 |

### Φάσεις

1. **Phase A:** Custom intervals + session goal
2. **Phase B:** Distraction log + weekly heatmap
3. **Phase C:** Analytics export

---

## 9. Debate Tree (`ArgumentMap`)

**Τρέχουσα κατάσταση:** Static Bertrand paradox argument tree.

**Benchmark:** Argunet, Kialo, philosophical argument mappers.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Expand/collapse nodes** | Interactive tree navigation | P0 |
| **Strength indicator** | Weak / moderate / strong evidence | P1 |
| **Add counterargument** | User-created refutation nodes | P0 |
| **Source link per node** | Citation to lecture | P0 |
| **Agent «steel-man»** | Strongest version of opposing view | P1 |
| **Export outline** | Bullet essay structure | P1 |

### Φάσεις

1. **Phase A:** Collapse + user counterarguments + citations
2. **Phase B:** Strength tags + steel-man Agent
3. **Phase C:** Multi-topic trees from course content

---

## 10. Cognitive Reader (`CognitiveReader`)

**Τρέχουσα κατάσταση:** Bionic typography, complexity heatmap.

**Benchmark:** BeeLine Reader, Spritz, Perusall annotation density.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Line focus mode** | Highlight current line | P0 |
| **Glossary hover** | Ορισμοί on hover (elasticity, MC, …) | P0 |
| **Reading speed estimate** | WPM + time remaining | P1 |
| **Translate selection** | EN↔EL για слож terms | P1 |
| **Chunking markers** | Visual breaks ανά ιδέα | P1 |
| **TTS read-aloud** | Ακρόαση παραγράφου | P2 |

### Φάσεις

1. **Phase A:** Line focus + glossary tooltips
2. **Phase B:** Chunking + reading stats
3. **Phase C:** TTS + bilingual gloss

---

## 11. Formula Scratchpad (`FormulaScratchpad`)

**Τρέχουσα κατάσταση:** Preset formulas, variable substitution, step display.

**Benchmark:** Wolfram Alpha steps, Symbolab, Desmos geometry.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **Step-by-step derivation** | Show algebra transitions | P0 |
| **Unit checker** | Dimensional analysis | P1 |
| **Custom formula builder** | User-defined equations | P1 |
| **Link to lesson step** | Auto-load vars from step 4 | P0 |
| **Error hints** | «Check sign of q₂» | P0 |
| **Graph the function** | Mini plot of best response | P1 |

### Φάσεις

1. **Phase A:** Lesson-linked vars + error hints + derivation steps
2. **Phase B:** Custom formulas + unit check
3. **Phase C:** Mini graph integration

---

## 12. Source Viewer / Annotations (`AnnotationOverlay`)

**Τρέχουσα κατάσταση:** Highlight, comment, pin on sample text.

**Benchmark:** Perusall, Hypothesis, LiquidText, MarginNote.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **PDF upload view** | Real source rendering | P0 |
| **Annotation tags** | definition / example / exam / confusion | P0 |
| **Ask Agent on selection** | Contextual Q&A | P0 |
| **Annotation → flashcard** | One-click Leitner add | P0 |
| **Filter by tag/color** | Sidebar filtering | P1 |
| **Shared annotations** | Study group (future) | P3 |

### Φάσεις

1. **Phase A:** Tags + Agent on selection + flashcard export
2. **Phase B:** PDF viewer + filters
3. **Phase C:** Collaborative annotations

---

## 13. Mini Dashboard (Floating)

**Τρέχουσα κατάσταση:** Readiness ring, weak spots, next actions tabs.

**Benchmark:** Duolingo progress, Brilliant daily goals, Todoist.

### Υποεργαλεία

| Υποεργαλείο | Σκοπός | Προτεραιότητα |
|---|---|---|
| **One-click start action** | Launch tool for next task | P0 |
| **Exam countdown** | Days until exam | P0 |
| **Today's XP progress** | Goal bar | P1 |
| **Snooze weak spot** | Defer concept to tomorrow | P2 |
| **Explain readiness** | Why 58%? breakdown modal | P0 |

### Φάσεις

1. **Phase A:** One-click actions + exam countdown + readiness breakdown
2. **Phase B:** XP goal bar
3. **Phase C:** Predictive «if you study 30min today → 65%»

---

## Cross-Cutting Concerns

### i18n
- Όλα τα νέα strings → `i18n-extra.ts` / domain files
- Domain terms (Cournot, Bertrand) παραμένουν bilingual όπου χρειάζεται

### Contrast & Accessibility
- Παλέτα: `workspaceTokens.ts` (WCAG AA on dark bg)
- Minimum body text 14px effective (125% scale via `.study-workspace`)

### Learner Model Integration
- Κάθε tool πρέπει να διαβάζει `visualAnalytics` / mastery API όπου υπάρχει
- Writes back: quiz results, timer sessions, Feynman scores, Leitner moves

### Suggested Implementation Order (Global)

```
Sprint 1: ✅ Lesson inline retrieval + Concept map filter/path/recap + Source annotation tags
Sprint 2: ✅ Sandbox presets/challenges + Leitner due counts + Compare topic picker + tool content i18n
Sprint 3: Feynman rubric + Scratchpad lesson-link + Mini dashboard actions
Sprint 4: Reader glossary + Debate user nodes + Whiteboard grid/per-step
Sprint 5: PDF source + API wiring + adaptive ordering
```

---

*Τελευταία ενημέρωση: 2026-06-18 — μετά από i18n Visual Lab + concept nodes + contrast/scale pass.*
