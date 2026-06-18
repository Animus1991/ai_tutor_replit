/** Extended translations — merged into main i18n dictionaries at runtime. */

export const I18N_EXTRA_EN: Record<string, string> = {
  "lang.english": "English",
  "lang.greek": "Ελληνικά",
  "lang.toggle": "Toggle language",
  "landing.signIn": "Sign In",

  // Curriculum lens — theory
  "lens.theory.headline": "Upload notes. Build an exam-ready tutor-course.",
  "lens.theory.subheadline":
    "Synapse turns lecture material, readings, and past papers into a source-grounded learning path that checks understanding, repairs misconceptions, and schedules recall.",
  "lens.theory.audience":
    "Theory-heavy subjects, exam revision, concept-first learning",
  "lens.theory.promise": "From static notes to adaptive tutoring.",
  "lens.theory.step1.title": "Ingest",
  "lens.theory.step1.body":
    "PDFs, slides, scans, transcripts, and textbook excerpts.",
  "lens.theory.step2.title": "Analyze",
  "lens.theory.step2.body":
    "Topics, prerequisites, definitions, and gaps are extracted with citations.",
  "lens.theory.step3.title": "Teach",
  "lens.theory.step3.body":
    "Guided lessons with recall loops, examples, and Socratic prompts.",
  "lens.theory.step4.title": "Adapt",
  "lens.theory.step4.body":
    "Mastery, confidence, and error patterns reshape the next lesson.",
  "lens.theory.lessonFormat":
    "Source-grounded explanation with citations|Retrieval checks every few steps|Side-by-side concept comparisons|Error repair with counterexamples|Spaced review scheduling",
  "lens.theory.sampleTopic":
    "Behavioral Economics — anchoring, framing, loss aversion",

  // Curriculum lens — practice
  "lens.practice.headline":
    "Turn a notebook into a guided practice environment.",
  "lens.practice.subheadline":
    "Synapse converts code, worked problems, and lab screenshots into stepwise practice with hints, tests, debugging, and mastery updates.",
  "lens.practice.audience":
    "Programming, statistics, math labs, data analysis, problem sets",
  "lens.practice.promise": "From broken code to working understanding.",
  "lens.practice.step1.title": "Inspect",
  "lens.practice.step1.body":
    "Upload notebooks, code, datasets, or problem-set scans.",
  "lens.practice.step2.title": "Diagnose",
  "lens.practice.step2.body":
    "The system finds bugs, missing steps, and prerequisite gaps.",
  "lens.practice.step3.title": "Practice",
  "lens.practice.step3.body":
    "Split-screen exercises with run tests, hints, and solutions.",
  "lens.practice.step4.title": "Verify",
  "lens.practice.step4.body":
    "First-attempt grading updates mastery and retry queues.",
  "lens.practice.lessonFormat":
    "Code-first split-screen layout|Run tests and instant feedback|Step-by-step debugging guidance|Formula scratchpad and worked examples|Transfer problems in new contexts",
  "lens.practice.sampleTopic":
    "Linear Regression — data cleaning, fit, residuals, interpretation",

  // Visual tools hub
  "visual.tools.eyebrow": "Advanced visual learning tools",
  "visual.tools.title":
    "Patterns, graphs, and emphatic colors that make learning visible",
  "visual.tools.subtitle":
    "Every visual is driven by the learner model. Interactive diagrams turn passive reading into active manipulation.",
  "visual.tools.leitner.label": "Leitner Box",
  "visual.tools.leitner.desc": "5-box spaced repetition",
  "visual.tools.heatmap.label": "Mastery Heatmap",
  "visual.tools.heatmap.desc": "Concept × day matrix",
  "visual.tools.sankey.label": "Knowledge Flow",
  "visual.tools.sankey.desc": "Upload → mastery pipeline",
  "visual.tools.timeline.label": "Learning Timeline",
  "visual.tools.timeline.desc": "Events and mastery delta",
  "visual.tools.colorcode.label": "Color System",
  "visual.tools.colorcode.desc": "Cognitive load palette",
  "visual.tools.treemap.label": "Concept Treemap",
  "visual.tools.treemap.desc": "Area = weight, color = mastery",
  "visual.tools.compare.label": "Side-by-Side",
  "visual.tools.compare.desc": "Structured concept comparison",
  "visual.tools.waterfall.label": "Mastery Waterfall",
  "visual.tools.waterfall.desc": "Step-by-step gain/loss",
  "visual.tools.radar.label": "Skill Radar",
  "visual.tools.radar.desc": "Multi-axis learner profile",
  "visual.tools.feynman.label": "Feynman Check",
  "visual.tools.feynman.desc": "Explain simply, find gaps",
  "visual.tools.errorlog.label": "Error Notebook",
  "visual.tools.errorlog.desc": "Persistent mistake log",
  "visual.tools.errorlog.body":
    "Your persistent mistake log with root-cause analysis lives in the Error Notebook.",
  "visual.tools.errorlog.cta": "Open Error Notebook →",
  "visual.tools.pomodoro.label": "Study Timer",
  "visual.tools.pomodoro.desc": "Pomodoro sessions",
  "visual.demoBadge": "demo preview",

  // Visual component labels
  "visual.sankey.title": "Knowledge Flow — Upload to Mastery",
  "visual.sankey.subtitle":
    "Full pipeline with error diagnosis, prerequisite repair, and retry loops.",
  "visual.heatmap.title": "Mastery Evolution Matrix",
  "visual.treemap.title": "Exam Importance vs Mastery (Treemap)",
  "visual.treemap.subtitle":
    "Size = importance for exam. Color = current mastery level.",
  "visual.timeline.title": "Learning Timeline",
  "visual.radar.title": "Skill Radar — Learner Profile",
  "visual.waterfall.title": "Mastery Waterfall",
  "visual.colorcode.title": "Cognitive Load Color System",
  "visual.feynman.title": "Feynman Technique Check",
  "visual.feynman.placeholder":
    "Explain the concept in your own words, as if teaching a beginner…",
  "visual.feynman.analyzing": "Analyzing…",
  "visual.feynman.score": "Clarity score",
  "visual.feynman.gaps": "Gaps to fix",
  "visual.timer.title": "Study Timer",
  "visual.timer.focus": "Focus",
  "visual.timer.break": "Break",
  "visual.timer.start": "Start",
  "visual.timer.pause": "Pause",
  "visual.timer.reset": "Reset",

  // Visual lab
  "visualLab.eyebrow": "Visual learning layer",
  "visualLab.title":
    "Diagrams, graphs, and shapes that make the tutor easier to understand",
  "visualLab.subtitle":
    "The AI turns uploads into visual explanations when content benefits from structure, comparison, timelines, or review maps.",
  "visualLab.currentMode": "Current mode",
  "visualLab.principles.title": "Visualization principles",
  "visualLab.principles.items":
    "Use diagrams when structure matters, not as decoration.|Use shapes for dependency, sequence, comparison, or uncertainty.|Use graphs for mastery, retention, and progress through time.|Tie visual choice to content type and observed behavior — not learning styles.",
  "visualLab.mapping.title": "Source-to-visual mapping",
  "visualLab.mode.source.title": "Source Flow",
  "visualLab.mode.source.subtitle": "Upload → parse → tutor pipeline",
  "visualLab.mode.source.hint":
    "Shows how raw material becomes structured, cited lessons.",
  "visualLab.mode.concept.title": "Concept Graph",
  "visualLab.mode.concept.subtitle": "Prerequisites and contrasts",
  "visualLab.mode.concept.hint":
    "Nodes encode concepts; edges encode dependency or confusion pairs.",
  "visualLab.mode.mastery.title": "Mastery Ring",
  "visualLab.mode.mastery.subtitle": "Readiness at a glance",
  "visualLab.mode.mastery.hint":
    "Strong vs weak regions guide the next study step.",
  "visualLab.mode.retention.title": "Retention Curve",
  "visualLab.mode.retention.subtitle": "Forgetting vs spaced review",
  "visualLab.mode.retention.hint":
    "Shows why spaced recall flattens the forgetting curve.",
  "visualLab.mode.exam.title": "Exam Path",
  "visualLab.mode.exam.subtitle": "Timeline to exam day",
  "visualLab.mode.exam.hint": "Focus intensifies as the exam date approaches.",
  "visualLab.mode.formula.title": "Formula Explorer",
  "visualLab.mode.formula.subtitle": "Symbol breakdown",
  "visualLab.mode.formula.hint":
    "Each symbol should be clickable and source-grounded.",

  // Workspace chrome
  "workspace.tool.feynman": "Feynman",
  "workspace.tool.timer": "Timer",
  "workspace.tool.whiteboard": "Whiteboard",
  "workspace.tool.map.short": "Map",
  "workspace.tool.sandbox.short": "Sandbox",
  "workspace.tool.leitner.short": "Leitner",
  "workspace.tool.compare.short": "Compare",
  "workspace.tool.debate.short": "Debate",
  "workspace.tool.reader.short": "Reader",
  "workspace.tool.formulas.short": "Formulas",
  "workspace.tool.source.short": "Source",
  "workspace.ui.close": "Close workspace",
  "workspace.ui.agent": "Agent",
  "workspace.ui.toggleLayout": "Toggle layout",
  "workspace.ui.previous": "← Previous",
  "workspace.ui.next": "Next",
  "workspace.ui.expandSidebar": "Expand sidebar",
  "workspace.ui.collapseSidebar": "Collapse sidebar",
  "workspace.ui.selectStep": "Select a step to begin.",
  "workspace.course.title": "Market Structures",
  "workspace.course.subject": "Microeconomics",
  "workspace.lesson.explainDiff": "💡 Explain Differently",
  "workspace.lesson.testMe": "🧪 Test Me",
  "workspace.lesson.source": "📖 Source: Lecture Notes, slides 34-41",
  "workspace.lesson.type.core": "Core Concept",
  "workspace.lesson.type.deep": "Deep Dive",
  "workspace.lesson.type.insight": "Key Insight",
  "workspace.lesson.type.practice": "Practice",
  "workspace.lesson.type.quiz": "Quiz",
  "workspace.step.0.title": "Two Models of Oligopoly",
  "workspace.step.1.title": "Cournot: Quantity Competition",
  "workspace.step.2.title": "Bertrand: Price Competition",
  "workspace.step.3.title": "The Bertrand Paradox",
  "workspace.step.4.title": "Worked Example",
  "workspace.step.5.title": "Knowledge Check",

  // Whiteboard
  "whiteboard.title": "Study Whiteboard",
  "whiteboard.subtitle":
    "Sketch notes, diagrams, and formulas while you learn.",
  "whiteboard.tool.pen": "Pen",
  "whiteboard.tool.marker": "Marker",
  "whiteboard.tool.highlighter": "Highlighter",
  "whiteboard.tool.eraser": "Eraser",
  "whiteboard.tool.line": "Line",
  "whiteboard.tool.rect": "Rectangle",
  "whiteboard.tool.ellipse": "Ellipse",
  "whiteboard.tool.arrow": "Arrow",
  "whiteboard.tool.ruler": "Ruler",
  "whiteboard.tool.text": "Text",
  "whiteboard.undo": "Undo",
  "whiteboard.redo": "Redo",
  "whiteboard.clear": "Clear",
  "whiteboard.save": "Save",
  "whiteboard.strokeWidth": "Stroke",
  "whiteboard.color": "Color",
  "whiteboard.textPrompt": "Enter text:",
  "whiteboard.saved": "Whiteboard saved locally.",
};

export const I18N_EXTRA_EL: Record<string, string> = {
  "lang.english": "English",
  "lang.greek": "Ελληνικά",
  "lang.toggle": "Αλλαγή γλώσσας",
  "landing.signIn": "Σύνδεση",

  "lens.theory.headline":
    "Ανέβασε σημειώσεις. Φτιάξε μάθημα έτοιμο για εξέταση.",
  "lens.theory.subheadline":
    "Το Synapse μετατρέπει διαλέξεις, readings και παλιά θέματα σε διαδρομή μάθησης με πηγές, που ελέγχει κατανόηση, διορθώνει παρανοήσεις και προγραμματίζει ανάκληση.",
  "lens.theory.audience":
    "Θεωρητικά μαθήματα, επανάληψη εξετάσεων, μάθηση έννοιων πρώτα",
  "lens.theory.promise": "Από στατικές σημειώσεις σε προσαρμοστική διδασκαλία.",
  "lens.theory.step1.title": "Εισαγωγή",
  "lens.theory.step1.body":
    "PDF, διαφάνειες, σαρώσεις, μεταγραφές και αποσπάσματα βιβλίων.",
  "lens.theory.step2.title": "Ανάλυση",
  "lens.theory.step2.body":
    "Θέματα, προαπαιτούμενα, ορισμοί και κενά εξάγονται με παραπομπές.",
  "lens.theory.step3.title": "Διδασκαλία",
  "lens.theory.step3.body":
    "Καθοδηγούμενα μαθήματα με βρόχους ανάκλησης, παραδείγματα και Σωκρατικές ερωτήσεις.",
  "lens.theory.step4.title": "Προσαρμογή",
  "lens.theory.step4.body":
    "Mastery, εμπιστοσύνη και μοτίβα λαθών αναδιαμορφώνουν το επόμενο μάθημα.",
  "lens.theory.lessonFormat":
    "Εξήγηση με πηγές και παραπομπές|Έλεγχοι ανάκλησης κάθε λίγα βήματα|Συγκρίσεις εννοιών πλάι-πλάι|Διόρθωση λαθών με αντεπιχειρήματα|Προγραμματισμένη διαστηματική επανάληψη",
  "lens.theory.sampleTopic":
    "Behavioral Economics — anchoring, framing, loss aversion",

  "lens.practice.headline":
    "Μετέτρεψε ένα notebook σε περιβάλλον καθοδηγούμενης εξάσκησης.",
  "lens.practice.subheadline":
    "Το Synapse μετατρέπει κώδικα, ασκήσεις και screenshots εργαστηρίου σε βήμα-βήμα εξάσκηση με hints, tests, debugging και ενημέρωση mastery.",
  "lens.practice.audience":
    "Προγραμματισμός, στατιστική, math labs, ανάλυση δεδομένων, problem sets",
  "lens.practice.promise": "Από σπασμένο κώδικα σε κατανόηση που δουλεύει.",
  "lens.practice.step1.title": "Έλεγχος",
  "lens.practice.step1.body":
    "Ανέβασμα notebooks, κώδικα, datasets ή σαρώσεων ασκήσεων.",
  "lens.practice.step2.title": "Διάγνωση",
  "lens.practice.step2.body":
    "Το σύστημα βρίσκει bugs, ελλείποντα βήματα και κενά prerequisites.",
  "lens.practice.step3.title": "Εξάσκηση",
  "lens.practice.step3.body":
    "Ασκήσεις split-screen με run tests, hints και λύσεις.",
  "lens.practice.step4.title": "Επαλήθευση",
  "lens.practice.step4.body":
    "Βαθμολόγηση first attempt ενημερώνει mastery και ουρές επανάληψης.",
  "lens.practice.lessonFormat":
    "Διάταξη split-screen με κώδικα πρώτα|Run tests και άμεση ανατροφοδότηση|Καθοδήγηση debugging βήμα-βήμα|Formula scratchpad και worked examples|Προβλήματα transfer σε νέο πλαίσιο",
  "lens.practice.sampleTopic":
    "Linear Regression — καθαρισμός δεδομένων, fit, residuals, ερμηνεία",

  "visual.tools.eyebrow": "Προηγμένα οπτικά εργαλεία μάθησης",
  "visual.tools.title":
    "Μοτίβα, γραφήματα και έντονα χρώματα που κάνουν τη μάθηση ορατή",
  "visual.tools.subtitle":
    "Κάθε οπτικό τροφοδοτείται από το learner model. Τα διαδραστικά διαγράμματα μετατρέπουν την παθητική ανάγνωση σε ενεργή χειραγώγηση.",
  "visual.tools.leitner.label": "Κουτί Leitner",
  "visual.tools.leitner.desc": "5 κουτιά διαστηματικής επανάληψης",
  "visual.tools.heatmap.label": "Heatmap Κυριαρχίας",
  "visual.tools.heatmap.desc": "Πίνακας έννοια × ημέρα",
  "visual.tools.sankey.label": "Ροή Γνώσης",
  "visual.tools.sankey.desc": "Upload → mastery pipeline",
  "visual.tools.timeline.label": "Χρονολόγιο Μάθησης",
  "visual.tools.timeline.desc": "Γεγονότα και delta mastery",
  "visual.tools.colorcode.label": "Σύστημα Χρωμάτων",
  "visual.tools.colorcode.desc": "Παλέτα γνωστικού φορτίου",
  "visual.tools.treemap.label": "Concept Treemap",
  "visual.tools.treemap.desc": "Εμβαδόν = βάρος, χρώμα = mastery",
  "visual.tools.compare.label": "Πλάι-πλάι",
  "visual.tools.compare.desc": "Δομημένη σύγκριση εννοιών",
  "visual.tools.waterfall.label": "Mastery Waterfall",
  "visual.tools.waterfall.desc": "Κέρδη/απώλειες βήμα-βήμα",
  "visual.tools.radar.label": "Skill Radar",
  "visual.tools.radar.desc": "Πολυ-άξονο προφίλ μαθητή",
  "visual.tools.feynman.label": "Feynman Check",
  "visual.tools.feynman.desc": "Εξήγησε απλά, βρες κενά",
  "visual.tools.errorlog.label": "Σημειωματάριο Λαθών",
  "visual.tools.errorlog.desc": "Μόνιμο αρχείο λαθών",
  "visual.tools.errorlog.body":
    "Το μόνιμο αρχείο λαθών σας με ανάλυση root-cause βρίσκεται στο Σημειωματάριο Λαθών.",
  "visual.tools.errorlog.cta": "Άνοιγμα Σημειωματάριου Λαθών →",
  "visual.tools.pomodoro.label": "Χρονόμετρο Μελέτης",
  "visual.tools.pomodoro.desc": "Συνεδρίες Pomodoro",
  "visual.demoBadge": "προεπισκόπηση demo",

  "visual.sankey.title": "Ροή Γνώσης — Από Upload σε Mastery",
  "visual.sankey.subtitle":
    "Πλήρης αγωγός με διάγνωση λάθους, επισκευή prerequisites και βρόχους επανάληψης.",
  "visual.heatmap.title": "Πίνακας Εξέλιξης Mastery",
  "visual.treemap.title": "Σημασία Εξέτασης vs Mastery (Treemap)",
  "visual.treemap.subtitle":
    "Μέγεθος = σημασία για εξέταση. Χρώμα = τρέχον mastery.",
  "visual.timeline.title": "Χρονολόγιο Μάθησης",
  "visual.radar.title": "Skill Radar — Προφίλ Μαθητή",
  "visual.waterfall.title": "Mastery Waterfall",
  "visual.colorcode.title": "Σύστημα Χρωμάτων Γνωστικού Φορτίου",
  "visual.feynman.title": "Έλεγχος Τεχνικής Feynman",
  "visual.feynman.placeholder":
    "Εξήγησε την έννοια με δικά σου λόγια, σαν να διδάσκεις αρχάριο…",
  "visual.feynman.analyzing": "Ανάλυση…",
  "visual.feynman.score": "Βαθμός σαφήνειας",
  "visual.feynman.gaps": "Κενά προς διόρθωση",
  "visual.timer.title": "Χρονόμετρο Μελέτης",
  "visual.timer.focus": "Εστίαση",
  "visual.timer.break": "Διάλειμμα",
  "visual.timer.start": "Έναρξη",
  "visual.timer.pause": "Παύση",
  "visual.timer.reset": "Επαναφορά",

  "visualLab.eyebrow": "Οπτικό επίπεδο μάθησης",
  "visualLab.title":
    "Διαγράμματα, γραφήματα και σχήματα που κάνουν τον tutor κατανοητό",
  "visualLab.subtitle":
    "Η AI μετατρέπει uploads σε οπτικές εξηγήσεις όταν το περιεχόμενο ωφελείται από δομή, σύγκριση, χρονολόγια ή χάρτες επανάληψης.",
  "visualLab.currentMode": "Τρέχουσα λειτουργία",
  "visualLab.principles.title": "Αρχές οπτικοποίησης",
  "visualLab.principles.items":
    "Χρησιμοποιήστε διαγράμματα όταν η δομή έχει σημασία, όχι ως διακόσμηση.|Χρησιμοποιήστε σχήματα για εξάρτηση, ακολουθία, σύγκριση ή αβεβαιότητα.|Χρησιμοποιήστε γραφήματα για mastery, διατήρηση και πρόοδο στο χρόνο.|Συνδέστε την οπτική επιλογή με τύπο περιεχομένου και συμπεριφορά — όχι learning styles.",
  "visualLab.mapping.title": "Αντιστοίχιση πηγής → οπτικό",
  "visualLab.mode.source.title": "Ροή Πηγής",
  "visualLab.mode.source.subtitle": "Upload → parse → tutor pipeline",
  "visualLab.mode.source.hint":
    "Δείχνει πώς το ακατέργαστο υλικό γίνεται δομημένα μαθήματα με πηγές.",
  "visualLab.mode.concept.title": "Γράφος Εννοιών",
  "visualLab.mode.concept.subtitle": "Προαπαιτούμενα και αντιθέσεις",
  "visualLab.mode.concept.hint":
    "Κόμβοι = έννοιες· ακμές = εξάρτηση ή ζεύγη σύγχυσης.",
  "visualLab.mode.mastery.title": "Δακτύλιος Mastery",
  "visualLab.mode.mastery.subtitle": "Ετοιμότητα με μια ματιά",
  "visualLab.mode.mastery.hint":
    "Ισχυρές vs αδύναμες περιοχές καθοδηγούν το επόμενο βήμα.",
  "visualLab.mode.retention.title": "Καμπύλη Διατήρησης",
  "visualLab.mode.retention.subtitle": "Λήθη vs διαστηματική επανάληψη",
  "visualLab.mode.retention.hint":
    "Δείχνει γιατί η διαστηματική ανάκληση ισοπεδώνει την καμπύλη λήθης.",
  "visualLab.mode.exam.title": "Διαδρομή Εξέτασης",
  "visualLab.mode.exam.subtitle": "Χρονολόγιο μέχρι την εξέταση",
  "visualLab.mode.exam.hint":
    "Η εστίαση εντείνεται καθώς πλησιάζει η ημερομηνία.",
  "visualLab.mode.formula.title": "Εξερευνητής Φόρμουλας",
  "visualLab.mode.formula.subtitle": "Ανάλυση συμβόλων",
  "visualLab.mode.formula.hint": "Κάθε σύμβολο πρέπει να είναι κλικ με πηγή.",

  "workspace.tool.feynman": "Feynman",
  "workspace.tool.timer": "Χρονόμετρο",
  "workspace.tool.whiteboard": "Πίνακας",
  "workspace.tool.map.short": "Χάρτης",
  "workspace.tool.sandbox.short": "Sandbox",
  "workspace.tool.leitner.short": "Leitner",
  "workspace.tool.compare.short": "Σύγκριση",
  "workspace.tool.debate.short": "Συζήτηση",
  "workspace.tool.reader.short": "Αναγνώστης",
  "workspace.tool.formulas.short": "Φόρμουλες",
  "workspace.tool.source.short": "Πηγή",
  "workspace.ui.close": "Κλείσιμο χώρου μελέτης",
  "workspace.ui.agent": "Agent",
  "workspace.ui.toggleLayout": "Εναλλαγή διάταξης",
  "workspace.ui.previous": "← Προηγούμενο",
  "workspace.ui.next": "Επόμενο",
  "workspace.ui.expandSidebar": "Επέκταση πλευρικής στήλης",
  "workspace.ui.collapseSidebar": "Σύμπτυξη πλευρικής στήλης",
  "workspace.ui.selectStep": "Επιλέξτε ένα βήμα για να ξεκινήσετε.",
  "workspace.course.title": "Δομές Αγοράς",
  "workspace.course.subject": "Μικροοικονομία",
  "workspace.lesson.explainDiff": "💡 Εξήγησε Διαφορετικά",
  "workspace.lesson.testMe": "🧪 Δοκίμασέ με",
  "workspace.lesson.source": "📖 Πηγή: Σημειώσεις Διαλέξεων, διαφάνειες 34-41",
  "workspace.lesson.type.core": "Βασική Έννοια",
  "workspace.lesson.type.deep": "Βαθιά Ανάλυση",
  "workspace.lesson.type.insight": "Κεντρική Ιδέα",
  "workspace.lesson.type.practice": "Εξάσκηση",
  "workspace.lesson.type.quiz": "Κουίζ",
  "workspace.step.0.title": "Δύο Μοντέλα Ολιγοπωλίου",
  "workspace.step.1.title": "Cournot: Ανταγωνισμός Ποσότητας",
  "workspace.step.2.title": "Bertrand: Ανταγωνισμός Τιμής",
  "workspace.step.3.title": "Το Παράδοξο Bertrand",
  "workspace.step.4.title": "Λυμένη Άσκηση",
  "workspace.step.5.title": "Έλεγχος Γνώσεων",

  "whiteboard.title": "Πίνακας Μελέτης",
  "whiteboard.subtitle":
    "Σχεδίασε σημειώσεις, διαγράμματα και φόρμουλες ενώ μαθαίνεις.",
  "whiteboard.tool.pen": "Στυλό",
  "whiteboard.tool.marker": "Μαρκαδόρος",
  "whiteboard.tool.highlighter": "Πινέλο",
  "whiteboard.tool.eraser": "Γόμα",
  "whiteboard.tool.line": "Γραμμή",
  "whiteboard.tool.rect": "Ορθογώνιο",
  "whiteboard.tool.ellipse": "Έλλειψη",
  "whiteboard.tool.arrow": "Βέλος",
  "whiteboard.tool.ruler": "Χάρακας",
  "whiteboard.tool.text": "Κείμενο",
  "whiteboard.undo": "Αναίρεση",
  "whiteboard.redo": "Επανάληψη",
  "whiteboard.clear": "Καθαρισμός",
  "whiteboard.save": "Αποθήκευση",
  "whiteboard.strokeWidth": "Πάχος",
  "whiteboard.color": "Χρώμα",
  "whiteboard.textPrompt": "Εισάγετε κείμενο:",
  "whiteboard.saved": "Ο πίνακας αποθηκεύτηκε τοπικά.",
};
