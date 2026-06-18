/** Demo lesson + Study Workspace economics lesson — full bilingual content. */

export const I18N_DEMO_WORKSPACE_EN: Record<string, string> = {
  // ─── Demo UI chrome ───
  "demo.banner.mode": "Demo Mode",
  "demo.banner.subtitle": "Explore Synapse without login. All data is mock.",
  "demo.banner.playLesson": "Open Lesson Player",
  "demo.banner.signUp": "Create account →",
  "demo.tab.dashboard": "Dashboard",
  "demo.tab.notes": "Notes",
  "demo.tab.lesson": "Lesson Player",
  "demo.tab.visuals": "Visual Lab",
  "demo.sidebar.startFree": "Start free",
  "demo.sidebar.brand": "Synapse",
  "demo.sidebar.demoBadge": "demo",

  "demo.stat.xp": "XP",
  "demo.stat.streak": "Streak",
  "demo.stat.accuracy": "Accuracy",
  "demo.stat.courses": "Courses",
  "demo.stat.xpValue": "2,840",
  "demo.stat.streakValue": "7 days",
  "demo.stat.accuracyValue": "78%",
  "demo.stat.coursesValue": "3 done",

  "demo.dashboard.recentCourses": "Recent Courses",
  "demo.dashboard.examReadiness": "Exam Readiness",
  "demo.dashboard.readinessBadge": "80% exam-ready · Proficient",
  "demo.dashboard.readinessBody":
    "Computed from your observed performance: 78% quiz accuracy, most questions solved without hints, and steady practice volume — signals you are on track for exams.",
  "demo.dashboard.quizAccuracy": "Quiz Accuracy",
  "demo.dashboard.selfReliance": "Self-reliance (no hints)",
  "demo.dashboard.completionRate": "Completion Rate",
  "demo.dashboard.weeklyActivity": "Weekly Activity",
  "demo.dashboard.weekdays": "M|T|W|T|F|S|S",

  "demo.notes.title": "My Notes",
  "demo.notes.upload": "+ Upload Notes",
  "demo.notes.uploadTitle": "Login required",
  "demo.notes.words": "words",
  "demo.notes.coursesGenerated": "{{count}} course(s) generated",
  "demo.notes.openDemo": "Open Demo Lesson",
  "demo.notes.generate": "Generate Lesson",

  "demo.note.1.title": "Introduction to Machine Learning",
  "demo.note.1.subject": "Computer Science",
  "demo.note.1.createdAt": "2 days ago",
  "demo.note.2.title": "Neural Networks & Deep Learning",
  "demo.note.2.subject": "AI",
  "demo.note.2.createdAt": "4 days ago",
  "demo.note.3.title": "Data Structures — Trees & Graphs",
  "demo.note.3.subject": "Algorithms",
  "demo.note.3.createdAt": "1 week ago",
  "demo.note.4.title": "SQL & Database Design",
  "demo.note.4.subject": "Databases",
  "demo.note.4.createdAt": "1 week ago",

  "demo.course.1.title": "Intro to Machine Learning",
  "demo.course.1.type": "theoretical",
  "demo.course.1.difficulty": "beginner",
  "demo.course.2.title": "Neural Nets Deep Dive",
  "demo.course.2.type": "practical",
  "demo.course.2.difficulty": "intermediate",
  "demo.course.3.title": "ML Quiz Blitz",
  "demo.course.3.type": "quiz-heavy",
  "demo.course.3.difficulty": "beginner",

  "demo.lesson.courseTitle": "Introduction to Machine Learning",
  "demo.lesson.stepOf": "Step {{current}} of {{total}} · {{title}}",
  "demo.lesson.hint": "Hint",
  "demo.lesson.deeperExplanation": "Deeper Explanation",
  "demo.lesson.knowledgeCheck": "Knowledge Check",
  "demo.lesson.codeExercise": "Code Exercise",
  "demo.lesson.writeCode": "Write your code:",
  "demo.lesson.codePlaceholder": "# Write your solution here...",
  "demo.lesson.runSubmit": "Run & Submit",
  "demo.lesson.submitted":
    "Submitted! +30 XP — tap Explain to see the solution",
  "demo.lesson.correct": "Correct! +20 XP",
  "demo.lesson.wrong": "Wrong!",
  "demo.lesson.wrongHint": "Use the Hint (💡) or try again.",
  "demo.lesson.tryAgain": "Try again →",
  "demo.lesson.back": "Back",
  "demo.lesson.next": "Next",
  "demo.lesson.complete": "Complete! 🎉",
  "demo.lesson.aiTutor": "AI Tutor",
  "demo.lesson.askPlaceholder": "Ask something…",

  "demo.chat.welcome":
    "Hi! I'm your AI tutor. Ask me anything about the lesson. 🎓",

  // ─── Demo steps (markdown) ───
  "demo.step.1.title": "What is Machine Learning?",
  "demo.step.1.content": `## Machine Learning in a Nutshell

Machine Learning (ML) is a branch of artificial intelligence that enables systems to **learn from data** and improve over time — without being explicitly programmed for every scenario.

### The Classic Definition
> "A computer program is said to learn from experience E with respect to task T and performance measure P, if its performance at T, as measured by P, improves with experience E." — Tom Mitchell, 1997

### Three Core Types of ML

| Type | Description | Example |
|------|-------------|---------|
| **Supervised** | Learns from labeled data | Spam detection |
| **Unsupervised** | Finds hidden patterns | Customer segmentation |
| **Reinforcement** | Learns via reward/penalty | Game-playing AI |

### Why Does ML Matter?
Traditional programming is *explicit*: you write rules. ML is *implicit*: it discovers rules from examples. This makes it powerful for problems too complex to hand-code — like recognizing faces, translating language, or predicting stock prices.`,

  "demo.step.2.title": "Knowledge Check",
  "demo.step.2.question":
    "Which type of machine learning is used when you have labeled training data and want to predict outcomes for new, unseen data?",
  "demo.step.2.option.0": "Unsupervised Learning",
  "demo.step.2.option.1": "Reinforcement Learning",
  "demo.step.2.option.2": "Supervised Learning",
  "demo.step.2.option.3": "Transfer Learning",

  "demo.step.3.title": "How Models Actually Learn",
  "demo.step.3.content": `## The Training Loop

Every ML model learns through a surprisingly simple process called the **training loop**:

\`\`\`
1. Make a prediction on input data
2. Compare prediction to the true answer (calculate "loss")
3. Adjust internal parameters to reduce loss
4. Repeat thousands of times
\`\`\`

### Loss Functions — Measuring Mistakes

The **loss function** quantifies how wrong the model is. A lower loss = better model.

- **Mean Squared Error (MSE)** — for regression (predicting numbers)
- **Cross-Entropy Loss** — for classification (predicting categories)

### Gradient Descent

The algorithm that adjusts parameters is called **gradient descent**. Imagine you're blindfolded on a hilly landscape trying to reach the lowest valley:

- Each step = one parameter update
- The size of each step = **learning rate**
- Too large → overshoot the valley
- Too small → take forever to arrive

> 🔑 **Key insight:** The model never "understands" the data. It just finds parameters that minimize loss on the training set.`,

  "demo.step.4.title": "Code Exercise: Training Loop",
  "demo.step.4.content": `Complete the training loop below. Fill in the blanks to:
1. Calculate the **mean squared error** loss
2. Perform a **gradient descent** update on the weight

\`\`\`python
import numpy as np

# Simple 1D linear regression: y = w * x
x = np.array([1, 2, 3, 4, 5], dtype=float)
y_true = np.array([2, 4, 6, 8, 10], dtype=float)  # y = 2x

w = 0.5  # initial weight guess
lr = 0.01  # learning rate

for epoch in range(100):
    y_pred = w * x

    # TODO: Calculate MSE loss
    loss = ___________________

    # TODO: Calculate gradient dL/dw
    gradient = ___________________

    # TODO: Update weight using gradient descent
    w = ___________________

print(f"Learned weight: {w:.4f}")  # Should be close to 2.0
\`\`\``,
  "demo.step.4.solution": `import numpy as np

x = np.array([1, 2, 3, 4, 5], dtype=float)
y_true = np.array([2, 4, 6, 8, 10], dtype=float)

w = 0.5
lr = 0.01

for epoch in range(100):
    y_pred = w * x
    loss = np.mean((y_pred - y_true) ** 2)
    gradient = 2 * np.mean((y_pred - y_true) * x)
    w = w - lr * gradient

print(f"Learned weight: {w:.4f}")  # → 2.0000`,

  "demo.step.5.title": "Final Check",
  "demo.step.5.question":
    "In gradient descent, what happens if the learning rate is set too high?",
  "demo.step.5.option.0": "The model learns more slowly but more accurately",
  "demo.step.5.option.1": "The model converges to the global minimum faster",
  "demo.step.5.option.2":
    "The model may overshoot the minimum and fail to converge",
  "demo.step.5.option.3": "The loss function stops working",

  "demo.hint.2":
    "💡 Think: which ML type uses **labels** in training data? ||We call it 'supervised' because a 'teacher' provides the correct answer.",
  "demo.hint.4":
    "💡 For MSE: `loss = np.mean((y_pred - y_true) ** 2)`||For gradient: `2 * mean((y_pred - y_true) * x)`||For update: `w = w - lr * gradient`",
  "demo.hint.5":
    "💡 Think what a 'large step' means on a hilly landscape — you might jump over the solution!",
  "demo.hint.default":
    "💡 Re-read the section heading carefully — the answer is hiding there.",

  "demo.explain.1":
    "## Deeper Explanation||ML is essentially **pattern recognition at scale**. ||Instead of writing rules by hand, we let the algorithm discover them from examples.||Imagine learning to recognize cats: nobody defined pixels for you. You saw thousands of photos and your brain built the pattern. ML does the same.",
  "demo.explain.3":
    "## Deeper Explanation||The training loop is the **heart** of every ML system. ||The process repeats millions of times — each iteration the model gets slightly better.||**Analogy:** Learning darts. Each throw = prediction. The target = loss. Feedback on where you hit = gradient. Adjusting aim = weight update.",
  "demo.explain.4":
    "## Solution & Explanation||```python\\nloss = np.mean((y_pred - y_true) ** 2)  # MSE\\ngradient = 2 * np.mean((y_pred - y_true) * x)  # dL/dw\\nw = w - lr * gradient  # GD update\\n```||The gradient tells us **direction & magnitude** of change. We subtract (not add) because we want to move toward the minimum.",
  "demo.explain.default":
    "This section covers foundational principles for more advanced topics. Re-read slowly and note the key takeaways.",

  "demo.chat.default":
    "Good question! In the context of this lesson, ||the answer relates to the principles you just read. ||Want to go deeper on a specific aspect? 🤔",
  "demo.chat.loss":
    "The **loss function** measures how wrong the model is. ||MSE (Mean Squared Error) averages squared errors: `Σ(y_pred - y_true)² / n`. ||Squaring penalizes larger errors disproportionately — that's useful! 📐",
  "demo.chat.gradient":
    "**Gradient descent** is the algorithm that minimizes loss. ||The learning rate (lr) controls step size: ||small lr = slow convergence, large lr = risk of missing the minimum. ||Typical values: 0.001–0.1 depending on the problem. ⚡",
  "demo.chat.supervised":
    "Supervised: we have labels (correct answers) and the model learns X→y. ||Unsupervised: no labels — the model finds hidden structure (e.g. clusters). ||Reinforcement learning is different — it learns via reward/penalty in an interactive environment. 🎮",

  // ─── Study Workspace economics lesson ───
  "workspace.reader.sample": `The Bertrand Paradox states that with just two firms selling identical products and competing on price, the equilibrium price equals marginal cost — the same as perfect competition.

This is "paradoxical" because we expect oligopolies to have market power, yet Bertrand competition eliminates it entirely.

However, product differentiation, capacity constraints, or repeated interaction can restore market power in Bertrand settings.`,

  "workspace.lesson.s0.p1":
    "When a market has only a few firms, each firm's decisions affect the others. The key strategic question is:",
  "workspace.lesson.s0.question": "what variable do firms compete on?",
  "workspace.lesson.s0.cournot.title": "🏭 Cournot",
  "workspace.lesson.s0.cournot.items":
    "Compete on **quantity**|Price set by market|Simultaneous moves",
  "workspace.lesson.s0.bertrand.title": "💰 Bertrand",
  "workspace.lesson.s0.bertrand.items":
    'Compete on **price**|Quantity set by demand|The "Bertrand Paradox"',

  "workspace.lesson.s1.p1":
    "In the Cournot model, each firm chooses its **output level** simultaneously. The market price is then determined by the total quantity via the demand curve.",
  "workspace.lesson.s1.formulaLabel": "Best Response Function",
  "workspace.lesson.s1.scratchpad":
    "Open the **📐 Scratchpad** to substitute values and compute step-by-step.",

  "workspace.lesson.s2.p1":
    "In the Bertrand model, firms simultaneously choose **prices**. Consumers buy from the cheapest firm. With homogeneous products, any firm charging above MC loses all customers.",
  "workspace.lesson.s2.misconception.title": "⚠ Common Misconception",
  "workspace.lesson.s2.misconception.body":
    "Students often think more firms are needed for competitive pricing. The Bertrand Paradox shows that **just two firms** can achieve the competitive outcome.",

  "workspace.lesson.s3.p1":
    "With just two firms selling **identical products**, the Nash equilibrium price equals marginal cost — the same outcome as perfect competition.",
  "workspace.lesson.s3.resolution":
    "**Resolution:** Product differentiation, capacity constraints, or repeated interaction can restore market power in Bertrand settings.",

  "workspace.lesson.s4.prompt":
    "Two firms face demand P = 100 − Q, MC = 10. Find Cournot equilibrium.",
  "workspace.lesson.s4.step1": "Step 1: Profit function",
  "workspace.lesson.s4.step2": "Step 2: FOC → Best response",
  "workspace.lesson.s4.step3": "Step 3: Symmetry → q₁ = q₂ = q",
  "workspace.lesson.s4.result": "✓ Each firm produces 30 units, profit = 900.",

  "workspace.lesson.s5.question":
    "In Bertrand competition with identical products, the equilibrium price is:",
  "workspace.lesson.s5.opt.0": "Above marginal cost",
  "workspace.lesson.s5.opt.1": "Equal to marginal cost",
  "workspace.lesson.s5.opt.2": "Equal to average total cost",
  "workspace.lesson.s5.opt.3": "Zero",

  "workspace.mini.review1": "Review: Supply & Demand",
  "workspace.mini.review2": "Practice: Elasticity",
  "workspace.mini.review3": "Lesson: Welfare Economics",
  "workspace.mini.weak1": "Elasticity Calculations",
  "workspace.mini.weak2": "Welfare Economics",
  "workspace.mini.weak3": "Game Theory",
};

export const I18N_DEMO_WORKSPACE_EL: Record<string, string> = {
  "demo.banner.mode": "Λειτουργία Demo",
  "demo.banner.subtitle":
    "Εξερεύνησε το Synapse χωρίς login. Τα δεδομένα είναι mock.",
  "demo.banner.playLesson": "Άνοιγμα Lesson Player",
  "demo.banner.signUp": "Δημιουργία λογαριασμού →",
  "demo.tab.dashboard": "Πίνακας Ελέγχου",
  "demo.tab.notes": "Σημειώσεις",
  "demo.tab.lesson": "Lesson Player",
  "demo.tab.visuals": "Visual Lab",
  "demo.sidebar.startFree": "Ξεκίνα δωρεάν",
  "demo.sidebar.brand": "Synapse",
  "demo.sidebar.demoBadge": "demo",

  "demo.stat.xp": "XP",
  "demo.stat.streak": "Σερί",
  "demo.stat.accuracy": "Ακρίβεια",
  "demo.stat.courses": "Μαθήματα",
  "demo.stat.xpValue": "2.840",
  "demo.stat.streakValue": "7 ημέρες",
  "demo.stat.accuracyValue": "78%",
  "demo.stat.coursesValue": "3 ολοκληρωμένα",

  "demo.dashboard.recentCourses": "Πρόσφατα Μαθήματα",
  "demo.dashboard.examReadiness": "Ετοιμότητα Εξέτασης",
  "demo.dashboard.readinessBadge": "80% έτοιμος · Proficient",
  "demo.dashboard.readinessBody":
    "Υπολογισμένο από την πραγματική απόδοση: 78% ακρίβεια στα quiz, λύνεις τις περισσότερες ερωτήσεις χωρίς hints, και σταθερός ρυθμός εξάσκησης — δείκτες ότι είσαι σε καλό δρόμο για τις εξετάσεις.",
  "demo.dashboard.quizAccuracy": "Ακρίβεια Quiz",
  "demo.dashboard.selfReliance": "Αυτονομία (χωρίς hints)",
  "demo.dashboard.completionRate": "Ποσοστό Ολοκλήρωσης",
  "demo.dashboard.weeklyActivity": "Εβδομαδιαία Δραστηριότητα",
  "demo.dashboard.weekdays": "Δ|T|T|Π|Π|Σ|Κ",

  "demo.notes.title": "Οι Σημειώσεις μου",
  "demo.notes.upload": "+ Ανέβασμα Σημειώσεων",
  "demo.notes.uploadTitle": "Απαιτείται σύνδεση",
  "demo.notes.words": "λέξεις",
  "demo.notes.coursesGenerated": "{{count}} μάθημα/μαθήματα δημιουργήθηκαν",
  "demo.notes.openDemo": "Άνοιγμα Demo Μαθήματος",
  "demo.notes.generate": "Δημιουργία Μαθήματος",

  "demo.note.1.title": "Εισαγωγή στο Machine Learning",
  "demo.note.1.subject": "Πληροφορική",
  "demo.note.1.createdAt": "πριν 2 ημέρες",
  "demo.note.2.title": "Νευρωνικά Δίκτυα & Deep Learning",
  "demo.note.2.subject": "AI",
  "demo.note.2.createdAt": "πριν 4 ημέρες",
  "demo.note.3.title": "Δομές Δεδομένων — Δέντρα & Γράφοι",
  "demo.note.3.subject": "Αλγόριθμοι",
  "demo.note.3.createdAt": "πριν 1 εβδομάδα",
  "demo.note.4.title": "SQL & Σχεδιασμός Βάσεων",
  "demo.note.4.subject": "Βάσεις Δεδομένων",
  "demo.note.4.createdAt": "πριν 1 εβδομάδα",

  "demo.course.1.title": "Εισαγωγή στο Machine Learning",
  "demo.course.1.type": "θεωρητικό",
  "demo.course.1.difficulty": "αρχάριο",
  "demo.course.2.title": "Νευρωνικά Δίκτυα — Βαθιά Ανάλυση",
  "demo.course.2.type": "πρακτικό",
  "demo.course.2.difficulty": "μεσαίο",
  "demo.course.3.title": "ML Quiz Blitz",
  "demo.course.3.type": "quiz-heavy",
  "demo.course.3.difficulty": "αρχάριο",

  "demo.lesson.courseTitle": "Εισαγωγή στο Machine Learning",
  "demo.lesson.stepOf": "Βήμα {{current}} από {{total}} · {{title}}",
  "demo.lesson.hint": "Hint",
  "demo.lesson.deeperExplanation": "Βαθύτερη Εξήγηση",
  "demo.lesson.knowledgeCheck": "Έλεγχος Γνώσεων",
  "demo.lesson.codeExercise": "Άσκηση Κώδικα",
  "demo.lesson.writeCode": "Γράψε τον κώδικά σου:",
  "demo.lesson.codePlaceholder": "# Γράψε τη λύση σου εδώ...",
  "demo.lesson.runSubmit": "Run & Submit",
  "demo.lesson.submitted": "Υποβλήθηκε! +30 XP — Πάτα Explain για τη λύση",
  "demo.lesson.correct": "Σωστά! +20 XP",
  "demo.lesson.wrong": "Λάθος!",
  "demo.lesson.wrongHint": "Χρησιμοποίησε το Hint (💡) ή δοκίμασε ξανά.",
  "demo.lesson.tryAgain": "Δοκίμασε ξανά →",
  "demo.lesson.back": "Πίσω",
  "demo.lesson.next": "Επόμενο",
  "demo.lesson.complete": "Ολοκλήρωση! 🎉",
  "demo.lesson.aiTutor": "AI Tutor",
  "demo.lesson.askPlaceholder": "Ρώτα κάτι…",

  "demo.chat.welcome":
    "Γεια! Είμαι ο AI tutor σου. Ρώτα με ό,τι θες για το μάθημα. 🎓",

  "demo.step.1.title": "Τι είναι το Machine Learning;",
  "demo.step.1.content": `## Το Machine Learning με λίγα λόγια

Το Machine Learning (ML) είναι κλάδος της τεχνητής νοημοσύνης που επιτρέπει στα συστήματα να **μαθαίνουν από δεδομένα** και να βελτιώνονται με τον χρόνο — χωρίς ρητούς κανόνες για κάθε σενάριο.

### Ο κλασικός ορισμός
> «Ένα πρόγραμμα υπολογιστή μαθαίνει από εμπειρία E σε σχέση με εργασία T και μέτρο απόδοσης P, αν η απόδοσή του στο T, όπως μετριέται από P, βελτιώνεται με την εμπειρία E.» — Tom Mitchell, 1997

### Τρεις βασικοί τύποι ML

| Τύπος | Περιγραφή | Παράδειγμα |
|------|-------------|---------|
| **Επιβλεπόμενο** | Μαθαίνει από labeled δεδομένα | Ανίχνευση spam |
| **Μη-επιβλεπόμενο** | Βρίσκει κρυφά μοτίβα | Τμηματοποίηση πελατών |
| **Ενισχυτική** | Μαθαίνει με reward/penalty | AI σε παιχνίδια |

### Γιατί έχει σημασία;
Η παραδοσιακή προγραμματιστική είναι *ρητή*: γράφεις κανόνες. Το ML είναι *συνεπαγόμενο*: ανακαλύπτει κανόνες από παραδείγματα. Ισχυρό για προβλήματα πολύ πολύπλοκα για hand-coding — αναγνώριση προσώπων, μετάφραση, πρόβλεψη τιμών.`,

  "demo.step.2.title": "Έλεγχος Γνώσεων",
  "demo.step.2.question":
    "Ποιος τύπος machine learning χρησιμοποιείται όταν έχεις labeled δεδομένα εκπαίδευσης και θέλεις να προβλέψεις αποτελέσματα για νέα, άγνωστα δεδομένα;",
  "demo.step.2.option.0": "Μη-επιβλεπόμενη Μάθηση",
  "demo.step.2.option.1": "Ενισχυτική Μάθηση",
  "demo.step.2.option.2": "Επιβλεπόμενη Μάθηση",
  "demo.step.2.option.3": "Transfer Learning",

  "demo.step.3.title": "Πώς μαθαίνουν πραγματικά τα μοντέλα",
  "demo.step.3.content": `## Ο βρόχος εκπαίδευσης

Κάθε μοντέλο ML μαθαίνει μέσα από μια απλή διαδικασία — τον **training loop**:

\`\`\`
1. Κάνε πρόβλεψη στα δεδομένα εισόδου
2. Σύγκρινε με την αληθινή απάντηση (υπολόγισε "loss")
3. Ρύθμισε τις παραμέτρους για μείωση loss
4. Επανάλαβε χιλιάδες φορές
\`\`\`

### Συναρτήσεις Loss — Μέτρηση λαθών

Η **loss function** ποσοτικοποιεί πόσο λάθος είναι το μοντέλο. Χαμηλότερο loss = καλύτερο μοντέλο.

- **Mean Squared Error (MSE)** — για regression (αριθμητικές προβλέψεις)
- **Cross-Entropy Loss** — για classification (κατηγορίες)

### Gradient Descent

Ο αλγόριθμος ρύθμισης παραμέτρων λέγεται **gradient descent**. Φαντάσου ότι είσαι με μάτια δεμένα σε λοφώδες τοπίο και θέλεις το χαμηλότερο σημείο:

- Κάθε βήμα = μία ενημέρωση παραμέτρων
- Μέγεθος βήματος = **learning rate**
- Πολύ μεγάλο → ξεπερνάς το ελάχιστο
- Πολύ μικρό → πολύ αργή σύγκλιση

> 🔑 **Κεντρική ιδέα:** Το μοντέλο δεν «καταλαβαίνει» τα δεδομένα. Βρίσκει παραμέτρους που ελαχιστοποιούν το loss στο training set.`,

  "demo.step.4.title": "Άσκηση Κώδικα: Training Loop",
  "demo.step.4.content": `Συμπλήρωσε τον training loop. Γέμισε τα κενά για να:
1. Υπολογίσεις το **mean squared error** loss
2. Κάνεις **gradient descent** update στο βάρος w

\`\`\`python
import numpy as np

# Απλή γραμμική παλινδρόμηση 1D: y = w * x
x = np.array([1, 2, 3, 4, 5], dtype=float)
y_true = np.array([2, 4, 6, 8, 10], dtype=float)  # y = 2x

w = 0.5  # αρχική εκτίμηση
lr = 0.01  # learning rate

for epoch in range(100):
    y_pred = w * x

    # TODO: Υπολόγισε MSE loss
    loss = ___________________

    # TODO: Υπολόγισε gradient dL/dw
    gradient = ___________________

    # TODO: Ενημέρωσε w με gradient descent
    w = ___________________

print(f"Learned weight: {w:.4f}")  # Πρέπει να είναι κοντά στο 2.0
\`\`\``,
  "demo.step.4.solution": `import numpy as np

x = np.array([1, 2, 3, 4, 5], dtype=float)
y_true = np.array([2, 4, 6, 8, 10], dtype=float)

w = 0.5
lr = 0.01

for epoch in range(100):
    y_pred = w * x
    loss = np.mean((y_pred - y_true) ** 2)
    gradient = 2 * np.mean((y_pred - y_true) * x)
    w = w - lr * gradient

print(f"Learned weight: {w:.4f}")  # → 2.0000`,

  "demo.step.5.title": "Τελικός Έλεγχος",
  "demo.step.5.question":
    "Στο gradient descent, τι συμβαίνει αν το learning rate είναι πολύ υψηλό;",
  "demo.step.5.option.0": "Το μοντέλο μαθαίνει πιο αργά αλλά πιο ακριβώς",
  "demo.step.5.option.1": "Το μοντέλο συγκλίνει πιο γρήγορα στο global minimum",
  "demo.step.5.option.2":
    "Το μοντέλο μπορεί να ξεπεράσει το ελάχιστο και να μην συγκλίνει",
  "demo.step.5.option.3": "Η loss function σταματά να λειτουργεί",

  "demo.hint.2":
    "💡 Σκέψου: ποιος τύπος ML χρησιμοποιεί **ετικέτες** (labels) στα δεδομένα εκπαίδευσης; ||Το λέμε 'supervised' γιατί υπάρχει 'δάσκαλος' που δίνει τη σωστή απάντηση.",
  "demo.hint.4":
    "💡 Για MSE: `loss = np.mean((y_pred - y_true) ** 2)`||Για gradient: `2 * mean((y_pred - y_true) * x)`||Για update: `w = w - lr * gradient`",
  "demo.hint.5":
    "💡 Σκέψου τι σημαίνει 'μεγάλο βήμα' σε λοφώδες τοπίο — μπορεί να πηδήξεις πάνω από τη λύση!",
  "demo.hint.default":
    "💡 Διάβασε ξανά προσεκτικά την κεφαλίδα της ενότητας — η απάντηση κρύβεται εκεί.",

  "demo.explain.1":
    "## Βαθύτερη Εξήγηση||Το Machine Learning είναι ουσιαστικά **αναγνώριση μοτίβων σε κλίμακα**. ||Αντί να γράψουμε κανόνες χειροκίνητα, αφήνουμε τον αλγόριθμο να τους βρει από παραδείγματα.||Φαντάσου πώς έμαθες να αναγνωρίζεις γάτες: κανείς δεν σου εξήγησε pixel-by-pixel. Είδες χιλιάδες φωτογραφίες και ο εγκέφαλός σου δημιούργησε το μοτίβο. Το ML κάνει το ίδιο.",
  "demo.explain.3":
    "## Βαθύτερη Εξήγηση||Ο training loop είναι η **καρδιά** κάθε ML συστήματος. ||Η διαδικασία επαναλαμβάνεται εκατομμύρια φορές — σε κάθε iteration το μοντέλο γίνεται λίγο καλύτερο.||**Αναλογία:** Φαντάσου dart. Κάθε ρίψη = prediction. Ο στόχος = loss. Η ανατροφοδότηση = gradient. Η προσαρμογή στόχευσης = weight update.",
  "demo.explain.4":
    "## Λύση & Εξήγηση||```python\\nloss = np.mean((y_pred - y_true) ** 2)  # MSE\\ngradient = 2 * np.mean((y_pred - y_true) * x)  # dL/dw\\nw = w - lr * gradient  # GD update\\n```||Ο gradient μας λέει **κατεύθυνση & μέγεθος** αλλαγής. Αφαιρούμε (όχι προσθέτουμε) γιατί θέλουμε το ελάχιστο.",
  "demo.explain.default":
    "Αυτή η ενότητα καλύπτει βασικές αρχές για πιο προχωρημένες έννοιες. Ξαναδιάβασέ την αργά και σημείωσε τα key takeaways.",

  "demo.chat.default":
    "Καλή ερώτηση! Στα πλαίσια αυτού του μαθήματος, ||η απάντηση σχετίζεται με τις αρχές που μόλις διαβάσατε. ||Θέλεις να εμβαθύνουμε σε κάποια συγκεκριμένη πτυχή; 🤔",
  "demo.chat.loss":
    "Το **loss function** μετράει πόσο λάθος είναι το μοντέλο. ||Το MSE παίρνει τη μέση τιμή των τετραγώνων σφαλμάτων: `Σ(y_pred - y_true)² / n`. ||Το τετράγωνο ποινάρει μεγαλύτερα σφάλματα δυσανάλογα — χρήσιμο! 📐",
  "demo.chat.gradient":
    "Το **gradient descent** ελαχιστοποιεί το loss. ||Το learning rate (lr) ελέγχει το μέγεθος κάθε βήματος: ||μικρό lr = αργή σύγκλιση, μεγάλο lr = κίνδυνος να χάσουμε το ελάχιστο. ||Τυπικές τιμές: 0.001–0.1. ⚡",
  "demo.chat.supervised":
    "Supervised: έχουμε labels και το μοντέλο μαθαίνει X→y. ||Unsupervised: χωρίς labels — βρίσκει κρυφή δομή (clusters). ||Reinforcement: μαθαίνει με reward/penalty σε interactive περιβάλλον. 🎮",

  "workspace.reader.sample": `Το Παράδοξο Bertrand λέει ότι με μόνο δύο επιχειρήσεις που πουλούν ίδια προϊόντα και ανταγωνίζονται στην τιμή, η ισορροπία ισούται με το οριακό κόστος — όπως στον τέλειο ανταγωνισμό.

Είναι «παράδοξο» γιατί περιμένουμε ολιγοπώλιο να έχει market power, όμως ο ανταγωνισμός Bertrand το εξαλείφει.

Διαφοροποίηση προϊόντος, περιορισμοί χωρητικότητας ή επαναλαμβανόμενη αλληλεπίδραση μπορούν να αποκαταστήσουν market power.`,

  "workspace.lesson.s0.p1":
    "Όταν μια αγορά έχει λίγες επιχειρήσεις, οι αποφάσεις της μίας επηρεάζουν τις άλλες. Το κεντρικό στρατηγικό ερώτημα είναι:",
  "workspace.lesson.s0.question": "σε ποια μεταβλητή ανταγωνίζονται;",
  "workspace.lesson.s0.cournot.title": "🏭 Cournot",
  "workspace.lesson.s0.cournot.items":
    "Ανταγωνισμός στην **ποσότητα**|Η τιμή καθορίζεται από την αγορά|Ταυτόχρονες κινήσεις",
  "workspace.lesson.s0.bertrand.title": "💰 Bertrand",
  "workspace.lesson.s0.bertrand.items":
    "Ανταγωνισμός στην **τιμή**|Η ποσότητα από τη ζήτηση|Το «Παράδοξο Bertrand»",

  "workspace.lesson.s1.p1":
    "Στο μοντέλο Cournot, κάθε επιχείρηση επιλέγει **επίπεδο παραγωγής** ταυτόχρονα. Η τιμή αγοράς καθορίζεται από τη συνολική ποσότητα μέσω της καμπύλης ζήτησης.",
  "workspace.lesson.s1.formulaLabel": "Συνάρτηση Best Response",
  "workspace.lesson.s1.scratchpad":
    "Άνοιξε το **📐 Scratchpad** για αντικατάσταση τιμών και υπολογισμό βήμα-βήμα.",

  "workspace.lesson.s2.p1":
    "Στο μοντέλο Bertrand, οι επιχειρήσεις επιλέγουν **τιμές** ταυτόχρονα. Οι καταναλωτές αγοράζουν από τη φθηνότερη. Με ομοιογενή προϊόντα, τιμή πάνω από MC χάνει όλους τους πελάτες.",
  "workspace.lesson.s2.misconception.title": "⚠ Συνηθισμένη παρανόηση",
  "workspace.lesson.s2.misconception.body":
    "Πολλοί νομίζουν ότι χρειάζονται περισσότερες επιχειρήσεις για ανταγωνιστική τιμολόγηση. Το Παράδοξο Bertrand δείχνει ότι **μόνο δύο** μπορούν να φτάσουν το αποτέλεσμα τέλειου ανταγωνισμού.",

  "workspace.lesson.s3.p1":
    "Με δύο επιχειρήσεις και **ίδια προϊόντα**, η τιμή Nash ισορροπίας ισούται με οριακό κόστος — όπως στον τέλειο ανταγωνισμό.",
  "workspace.lesson.s3.resolution":
    "**Επίλυση:** Διαφοροποίηση, περιορισμοί χωρητικότητας ή επαναλαμβανόμενη αλληλεπίδραση μπορούν να αποκαταστήσουν market power στο Bertrand.",

  "workspace.lesson.s4.prompt":
    "Δύο επιχειρήσεις, ζήτηση P = 100 − Q, MC = 10. Βρες ισορροπία Cournot.",
  "workspace.lesson.s4.step1": "Βήμα 1: Συνάρτηση κέρδους",
  "workspace.lesson.s4.step2": "Βήμα 2: FOC → Best response",
  "workspace.lesson.s4.step3": "Βήμα 3: Συμμετρία → q₁ = q₂ = q",
  "workspace.lesson.s4.result":
    "✓ Κάθε επιχείρηση παράγει 30 μονάδες, κέρδος = 900.",

  "workspace.lesson.s5.question":
    "Στον ανταγωνισμό Bertrand με ίδια προϊόντα, η τιμή ισορροπίας είναι:",
  "workspace.lesson.s5.opt.0": "Πάνω από το οριακό κόστος",
  "workspace.lesson.s5.opt.1": "Ίση με το οριακό κόστος",
  "workspace.lesson.s5.opt.2": "Ίση με το μέσο συνολικό κόστος",
  "workspace.lesson.s5.opt.3": "Μηδέν",

  "workspace.mini.review1": "Επανάληψη: Προσφορά & Ζήτηση",
  "workspace.mini.review2": "Εξάσκηση: Ελαστικότητα",
  "workspace.mini.review3": "Μάθημα: Welfare Economics",
  "workspace.mini.weak1": "Υπολογισμοί Ελαστικότητας",
  "workspace.mini.weak2": "Welfare Economics",
  "workspace.mini.weak3": "Θεωρία Παιγνίων",
};
