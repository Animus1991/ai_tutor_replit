/** Visual Lab diagram labels + Study Workspace concept graph — bilingual. */

export const I18N_VISUAL_DIAGRAMS_EN: Record<string, string> = {
  // Source flow pipeline
  "visualLab.source.upload.title": "Upload",
  "visualLab.source.upload.body": "Notes, PDFs, scans",
  "visualLab.source.ocr.title": "OCR / Parse",
  "visualLab.source.ocr.body": "Recover structure",
  "visualLab.source.chunk.title": "Chunk",
  "visualLab.source.chunk.body": "Source-aware segments",
  "visualLab.source.graph.title": "Graph",
  "visualLab.source.graph.body": "Concept links",
  "visualLab.source.tutor.title": "Tutor",
  "visualLab.source.tutor.body": "Lessons + feedback",

  // Exam path timeline
  "visualLab.exam.now.label": "Now",
  "visualLab.exam.now.sub": "Review now",
  "visualLab.exam.2d.label": "2d",
  "visualLab.exam.2d.sub": "Weak spots",
  "visualLab.exam.5d.label": "5d",
  "visualLab.exam.5d.sub": "Timed test",
  "visualLab.exam.8d.label": "8d",
  "visualLab.exam.8d.sub": "Exam sim",
  "visualLab.exam.final.label": "Exam",
  "visualLab.exam.final.sub": "Final recall",
  "visualLab.exam.focus1": "Exam focus increases as the date gets closer.",
  "visualLab.exam.focus2":
    "Weak concepts receive more retrieval and fewer passive explanations.",

  // Formula explorer
  "visualLab.formula.exampleLabel": "Example formula",
  "visualLab.formula.hiddenSteps": "Hidden steps",
  "visualLab.formula.hiddenP1":
    "The system reveals missing algebra, definitions, or substitutions that are often skipped in lectures.",
  "visualLab.formula.hiddenP2":
    "Each symbol should link back to source material and show how it appears in context.",
  "visualLab.formula.symbol.alpha": "Correct evidence",
  "visualLab.formula.symbol.beta": "Incorrect evidence",
  "visualLab.formula.symbol.attempts": "Only gradeable first tries count",
  "visualLab.formula.symbol.gate": "Low evidence should not inflate readiness",
  "visualLab.mastery.label": "Mastery",

  // Source-to-visual mapping tiles
  "visualLab.tile.slides.label": "Lecture slides",
  "visualLab.tile.slides.visual": "Timeline + concept map",
  "visualLab.tile.textbook.label": "PDF textbook",
  "visualLab.tile.textbook.visual": "Hierarchy + formula explorer",
  "visualLab.tile.problemset.label": "Problem set",
  "visualLab.tile.problemset.visual": "Step graph + error patterns",
  "visualLab.tile.codelab.label": "Code lab",
  "visualLab.tile.codelab.visual": "Pipeline + test flow",

  // Demo concept graph (behavioral economics)
  "visualLab.graph.ref": "Reference point",
  "visualLab.graph.loss": "Loss aversion",
  "visualLab.graph.anchor": "Anchoring",
  "visualLab.graph.frame": "Framing",
  "visualLab.graph.choice": "Choice arch.",

  // Study Workspace concept nodes
  "workspace.concept.sd": "Supply & Demand",
  "workspace.concept.ct": "Consumer Theory",
  "workspace.concept.el": "Elasticity",
  "workspace.concept.ms": "Market Structures",
  "workspace.concept.we": "Welfare Econ",
  "workspace.concept.gt": "Game Theory",

  // Draggable concept map chrome
  "workspace.map.title": "Concept Map",
  "workspace.map.hint": "Drag · Scroll to zoom · Click to select",
  "workspace.map.reset": "Reset",
  "workspace.map.mastery": "Mastery",
  "workspace.map.prerequisites": "prerequisites",
  "workspace.map.editNote": "✏️ Edit Note",
  "workspace.map.addNote": "📝 Add Note",
  "workspace.map.noteFor": '📝 Note for "{{label}}"',
  "workspace.map.notePlaceholder": "Type your note about this concept…",
  "workspace.map.legend.strong": "Strong",
  "workspace.map.legend.proficient": "Proficient",
  "workspace.map.legend.developing": "Developing",
  "workspace.map.legend.weak": "Weak",
  "workspace.map.legend.prerequisite": "→ prerequisite",
  "workspace.map.legend.related": "┄ related",
};

export const I18N_VISUAL_DIAGRAMS_EL: Record<string, string> = {
  "visualLab.source.upload.title": "Ανέβασμα",
  "visualLab.source.upload.body": "Σημειώσεις, PDF, σαρώσεις",
  "visualLab.source.ocr.title": "OCR / Ανάλυση",
  "visualLab.source.ocr.body": "Ανάκτηση δομής",
  "visualLab.source.chunk.title": "Τμηματοποίηση",
  "visualLab.source.chunk.body": "Τμήματα με πηγή",
  "visualLab.source.graph.title": "Γράφος",
  "visualLab.source.graph.body": "Σύνδεσμοι εννοιών",
  "visualLab.source.tutor.title": "Tutor",
  "visualLab.source.tutor.body": "Μαθήματα + ανατροφοδότηση",

  "visualLab.exam.now.label": "Τώρα",
  "visualLab.exam.now.sub": "Επανάληψη τώρα",
  "visualLab.exam.2d.label": "2ημ",
  "visualLab.exam.2d.sub": "Αδύναμα σημεία",
  "visualLab.exam.5d.label": "5ημ",
  "visualLab.exam.5d.sub": "Timed test",
  "visualLab.exam.8d.label": "8ημ",
  "visualLab.exam.8d.sub": "Προσομοίωση εξέτασης",
  "visualLab.exam.final.label": "Εξέταση",
  "visualLab.exam.final.sub": "Τελική ανάκληση",
  "visualLab.exam.focus1":
    "Η εστίαση στην εξέταση εντείνεται καθώς πλησιάζει η ημερομηνία.",
  "visualLab.exam.focus2":
    "Οι αδύναμες έννοιες λαμβάνουν περισσότερη ανάκληση και λιγότερες παθητικές εξηγήσεις.",

  "visualLab.formula.exampleLabel": "Παράδειγμα φόρμουλας",
  "visualLab.formula.hiddenSteps": "Κρυφά βήματα",
  "visualLab.formula.hiddenP1":
    "Το σύστημα αποκαλύπτει άλγεβρα, ορισμούς ή αντικαταστάσεις που συχνά παραλείπονται στις διαλέξεις.",
  "visualLab.formula.hiddenP2":
    "Κάθε σύμβολο πρέπει να συνδέεται με το υλικό πηγής και να δείχνει πώς εμφανίζεται στο πλαίσιο.",
  "visualLab.formula.symbol.alpha": "Σωστές αποδείξεις",
  "visualLab.formula.symbol.beta": "Λανθασμένες αποδείξεις",
  "visualLab.formula.symbol.attempts":
    "Μετράνε μόνο οι βαθμολογήσιμες πρώτες προσπάθειες",
  "visualLab.formula.symbol.gate":
    "Χαμηλή απόδειξη δεν πρέπει να φουσκώνει την ετοιμότητα",
  "visualLab.mastery.label": "Mastery",

  "visualLab.tile.slides.label": "Διαφάνειες διαλέξεων",
  "visualLab.tile.slides.visual": "Χρονολόγιο + χάρτης εννοιών",
  "visualLab.tile.textbook.label": "PDF εγχειρίδιο",
  "visualLab.tile.textbook.visual": "Ιεραρχία + εξερευνητής φόρμουλας",
  "visualLab.tile.problemset.label": "Σετ ασκήσεων",
  "visualLab.tile.problemset.visual": "Γράφος βημάτων + μοτίβα λαθών",
  "visualLab.tile.codelab.label": "Εργαστήριο κώδικα",
  "visualLab.tile.codelab.visual": "Pipeline + ροή tests",

  "visualLab.graph.ref": "Σημείο αναφοράς",
  "visualLab.graph.loss": "Αποστροφή απώλειας",
  "visualLab.graph.anchor": "Άγκυρα (Anchoring)",
  "visualLab.graph.frame": "Πλαίσιο (Framing)",
  "visualLab.graph.choice": "Αρχιτ. επιλογών",

  "workspace.concept.sd": "Προσφορά & Ζήτηση",
  "workspace.concept.ct": "Θεωρία Καταναλωτή",
  "workspace.concept.el": "Ελαστικότητα",
  "workspace.concept.ms": "Δομές Αγοράς",
  "workspace.concept.we": "Welfare Econ",
  "workspace.concept.gt": "Θεωρία Παιγνίων",

  "workspace.map.title": "Χάρτης Εννοιών",
  "workspace.map.hint": "Σύρε · Scroll για zoom · Κλικ για επιλογή",
  "workspace.map.reset": "Επαναφορά",
  "workspace.map.mastery": "Mastery",
  "workspace.map.prerequisites": "προαπαιτούμενα",
  "workspace.map.editNote": "✏️ Επεξεργασία Σημείωσης",
  "workspace.map.addNote": "📝 Προσθήκη Σημείωσης",
  "workspace.map.noteFor": "📝 Σημείωση για «{{label}}»",
  "workspace.map.notePlaceholder": "Γράψε σημείωση για αυτή την έννοια…",
  "workspace.map.legend.strong": "Ισχυρό",
  "workspace.map.legend.proficient": "Επαρκές",
  "workspace.map.legend.developing": "Αναπτυσσόμενο",
  "workspace.map.legend.weak": "Αδύναμο",
  "workspace.map.legend.prerequisite": "→ προαπαιτούμενο",
  "workspace.map.legend.related": "┄ σχετικό",
};
