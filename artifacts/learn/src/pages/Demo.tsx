import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import {
  Brain, Sparkles, BookOpen, ChevronRight, ChevronLeft, Zap, Target,
  CheckCircle2, XCircle, Lightbulb, MessageSquare, Code, BarChart3,
  FileText, TrendingUp, Trophy, Flame, Star, Play, X, Send, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "notes" | "lesson";

const DEMO_STEPS = [
  {
    id: 1,
    type: "content",
    title: "What is Machine Learning?",
    content: `## Machine Learning in a Nutshell

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
    order: 1,
  },
  {
    id: 2,
    type: "quiz",
    title: "Knowledge Check",
    content: "Which type of machine learning is used when you have labeled training data and want to predict outcomes for new, unseen data?",
    options: ["Unsupervised Learning", "Reinforcement Learning", "Supervised Learning", "Transfer Learning"],
    correctOption: 2,
    order: 2,
  },
  {
    id: 3,
    type: "content",
    title: "How Models Actually Learn",
    content: `## The Training Loop

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
    order: 3,
  },
  {
    id: 4,
    type: "code",
    title: "Code Exercise: Training Loop",
    content: `Complete the training loop below. Fill in the blanks to:
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
    solution: `import numpy as np

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
    order: 4,
  },
  {
    id: 5,
    type: "quiz",
    title: "Final Check",
    content: "In gradient descent, what happens if the learning rate is set too high?",
    options: [
      "The model learns more slowly but more accurately",
      "The model converges to the global minimum faster",
      "The model may overshoot the minimum and fail to converge",
      "The loss function stops working",
    ],
    correctOption: 2,
    order: 5,
  },
];

const DEMO_NOTES = [
  { id: 1, title: "Introduction to Machine Learning", subject: "Computer Science", wordCount: 1240, createdAt: "2 days ago", courses: 2 },
  { id: 2, title: "Neural Networks & Deep Learning", subject: "AI", wordCount: 890, createdAt: "4 days ago", courses: 1 },
  { id: 3, title: "Data Structures — Trees & Graphs", subject: "Algorithms", wordCount: 620, createdAt: "1 week ago", courses: 0 },
  { id: 4, title: "SQL & Database Design", subject: "Databases", wordCount: 1050, createdAt: "1 week ago", courses: 1 },
];

const DEMO_COURSES = [
  { id: 1, title: "Intro to Machine Learning", type: "theoretical", difficulty: "beginner", status: "ready", steps: 12, progress: 75 },
  { id: 2, title: "Neural Nets Deep Dive", type: "practical", difficulty: "intermediate", status: "ready", steps: 8, progress: 37 },
  { id: 3, title: "ML Quiz Blitz", type: "quiz-heavy", difficulty: "beginner", status: "ready", steps: 15, progress: 100 },
];

function DemoBanner({ onEnterLesson }: { onEnterLesson: () => void }) {
  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-primary">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span className="font-medium">Demo Mode</span>
        <span className="text-slate-400">— Εξερευνάς το LearnAI χωρίς login. Τα δεδομένα είναι mock.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="text-primary hover:text-primary" onClick={onEnterLesson}>
          <Play className="h-3.5 w-3.5 mr-1" />
          Δες το Lesson Player
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up">Δημιούργησε λογαριασμό →</Link>
        </Button>
      </div>
    </div>
  );
}

function DemoDashboard({ onGoToLesson }: { onGoToLesson: () => void }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "XP", value: "2,840", color: "text-yellow-400" },
          { icon: Flame, label: "Streak", value: "7 days", color: "text-orange-400" },
          { icon: Target, label: "Accuracy", value: "78%", color: "text-green-400" },
          { icon: Trophy, label: "Courses", value: "3 done", color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <Icon className={cn("h-5 w-5", color)} />
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Recent Courses</h3>
          <div className="space-y-2">
            {DEMO_COURSES.map(c => (
              <button
                key={c.id}
                onClick={c.id === 1 ? onGoToLesson : undefined}
                className="w-full text-left rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors p-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">{c.type} · {c.difficulty}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold text-primary">{c.progress}%</div>
                  <div className="h-1.5 w-16 bg-border rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Readiness */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Exam Readiness</h3>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary text-sm">80% exam-ready · Proficient</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Υπολογισμένο από την πραγματική σου απόδοση: 78% ακρίβεια στα quiz, λύνεις τις περισσότερες ερωτήσεις χωρίς hints, και σταθερός ρυθμός εξάσκησης — δείκτες ότι είσαι σε καλό δρόμο για τις εξετάσεις.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Quiz Accuracy", value: 78 },
              { label: "Self-reliance (no hints)", value: 85 },
              { label: "Completion Rate", value: 92 },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 text-xs">
                <span className="w-40 text-muted-foreground truncate">{label}</span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${value}%` }} />
                </div>
                <span className="w-8 text-right font-medium text-foreground">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity chart placeholder */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Weekly Activity</h3>
        <div className="flex items-end gap-2 h-20">
          {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary/70 rounded-sm" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-muted-foreground">
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoNotes({ onGoToLesson }: { onGoToLesson: () => void }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-foreground">My Notes</h2>
        <Button size="sm" variant="outline" className="opacity-50 cursor-not-allowed" title="Login required">
          + Upload Notes
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {DEMO_NOTES.map(n => (
          <div key={n.id} className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.subject} · {n.createdAt}</div>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{n.wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span>{n.courses} course{n.courses !== 1 ? "s" : ""} generated</span>
            </div>
            <Button
              size="sm"
              variant={n.id === 1 ? "default" : "outline"}
              className="w-full"
              onClick={n.id === 1 ? onGoToLesson : undefined}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {n.id === 1 ? "Open Demo Lesson" : "Generate Lesson"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

type QuizState = "idle" | "correct" | "wrong";
type HintState = { open: boolean; text: string };

function DemoLessonPlayer({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [xpBurst, setXpBurst] = useState<number | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [explain, setExplain] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Γεια! Είμαι ο AI tutor σου. Ρώτα με ό,τι θες για το μάθημα. 🎓" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const step = DEMO_STEPS[currentIndex];
  const totalSteps = DEMO_STEPS.length;
  const completedSteps = currentIndex;

  useEffect(() => {
    setQuizAnswer(null);
    setQuizState("idle");
    setCodeInput("");
    setCodeSubmitted(false);
    setShowHint(false);
    setHint("");
    setShowExplain(false);
    setExplain("");
  }, [currentIndex]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function fireXP(amount: number) {
    setXpBurst(amount);
    setTimeout(() => setXpBurst(null), 1200);
  }

  function handleQuizAnswer(idx: number) {
    if (quizState !== "idle") return;
    setQuizAnswer(idx);
    const s = DEMO_STEPS[currentIndex];
    if (s.type !== "quiz") return;
    if (idx === s.correctOption) {
      setQuizState("correct");
      fireXP(20);
    } else {
      setQuizState("wrong");
    }
  }

  function handleAdvance() {
    if (currentIndex < totalSteps - 1) {
      if (step.type === "content") fireXP(10);
      setCurrentIndex(i => i + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }

  function canAdvance(): boolean {
    if (step.type === "quiz") return quizState === "correct";
    if (step.type === "code") return codeSubmitted;
    return true;
  }

  async function simulateStream(setText: (t: string) => void, chunks: string[]) {
    let acc = "";
    for (const chunk of chunks) {
      await new Promise(r => setTimeout(r, 40));
      acc += chunk;
      setText(acc);
    }
  }

  async function handleHint() {
    if (hint) { setShowHint(v => !v); return; }
    setShowHint(true);
    setLoadingHint(true);
    const hintTexts: Record<number, string[]> = {
      2: ["💡 Σκέψου: ποιος τύπος ML χρησιμοποιεί **ετικέτες** (labels) στα δεδομένα εκπαίδευσης; ", "Το λέμε 'supervised' γιατί υπάρχει 'δάσκαλος' που δίνει τη σωστή απάντηση."],
      4: ["💡 Για MSE: `loss = np.mean((y_pred - y_true) ** 2)`\n\nΓια gradient: `2 * mean((y_pred - y_true) * x)`\n\nΓια update: `w = w - lr * gradient`"],
      5: ["💡 Σκέψου τι σημαίνει 'μεγάλο βήμα' σε ένα λοφώδες τοπίο — μπορεί να πηδήξεις πάνω από τη λύση!"],
    };
    const chunks = hintTexts[step.id] || ["💡 Διάβασε ξανά προσεκτικά την κεφαλίδα της ενότητας — η απάντηση κρύβεται εκεί."];
    await simulateStream(setHint, chunks);
    setLoadingHint(false);
  }

  async function handleExplain() {
    if (explain) { setShowExplain(v => !v); return; }
    setShowExplain(true);
    setLoadingExplain(true);
    const explanations: Record<number, string[]> = {
      1: ["## Βαθύτερη Εξήγηση\n\nΤο Machine Learning είναι ουσιαστικά **αναγνώριση μοτίβων σε κλίμακα**. ", "Αντί να γράψουμε κανόνες χειροκίνητα, αφήνουμε τον αλγόριθμο να τους βρει μόνος του από παραδείγματα.\n\n", "Φαντάσου πώς έμαθες να αναγνωρίζεις γάτες: κανείς δεν σου εξήγησε τον ορισμό pixel-by-pixel. Είδες χιλιάδες φωτογραφίες και ο εγκέφαλός σου δημιούργησε το μοτίβο. Το ML κάνει ακριβώς το ίδιο."],
      3: ["## Βαθύτερη Εξήγηση\n\nΟ training loop είναι η **καρδιά** κάθε ML συστήματος. ", "Η διαδικασία επαναλαμβάνεται εκατομμύρια φορές — σε κάθε iteration το μοντέλο γίνεται λίγο καλύτερο.\n\n", "**Αναλογία:** Φαντάσου ότι μαθαίνεις dart. Κάθε ρίψη = prediction. Ο σκοπός = loss. Η ανατροφοδότηση (πού χτύπησες) = gradient. Η προσαρμογή της στόχευσης = weight update."],
      4: ["## Λύση & Εξήγηση\n\n```python\nloss = np.mean((y_pred - y_true) ** 2)  # MSE\ngradient = 2 * np.mean((y_pred - y_true) * x)  # dL/dw\nw = w - lr * gradient  # GD update\n```\n\n", "Ο gradient μας λέει **κατεύθυνση & μέγεθος** της αλλαγής. Αφαιρούμε (όχι προσθέτουμε) γιατί θέλουμε να κατεβούμε προς το ελάχιστο."],
    };
    const chunks = explanations[step.id] || ["Αυτή η ενότητα καλύπτει βασικές αρχές που χτίζουν τα θεμέλια για πιο προχωρημένες έννοιες. Ξαναδιάβασέ την αργά και σημείωσε τα key takeaways."];
    await simulateStream(setExplain, chunks);
    setLoadingExplain(false);
  }

  async function handleChatSend() {
    const msg = chatInput.trim();
    if (!msg || loadingChat) return;
    setChatInput("");
    setChatMessages(m => [...m, { role: "user", text: msg }]);
    setLoadingChat(true);

    const responses: Record<string, string[]> = {
      default: ["Καλή ερώτηση! Στα πλαίσια αυτού του μαθήματος, ", "η απάντηση σχετίζεται με τις αρχές που μόλις διαβάσαμε. ", "Θέλεις να εμβαθύνουμε σε κάποια συγκεκριμένη πτυχή; 🤔"],
    };
    const lc = msg.toLowerCase();
    let chunks: string[];
    if (lc.includes("loss") || lc.includes("mse")) {
      chunks = ["Το **loss function** μετράει πόσο λάθος είναι το μοντέλο. ", "Το MSE (Mean Squared Error) παίρνει τη μέση τιμή των τετραγώνων των σφαλμάτων: `Σ(y_pred - y_true)² / n`. ", "Το τετράγωνο ποινάρει μεγαλύτερα σφάλματα δυσανάλογα — αυτό είναι χρήσιμο! 📐"];
    } else if (lc.includes("gradient") || lc.includes("learning rate")) {
      chunks = ["Το **gradient descent** είναι ο αλγόριθμος που ελαχιστοποιεί το loss. ", "Το learning rate (lr) ελέγχει το μέγεθος κάθε βήματος: ", "μικρό lr = αργή σύγκλιση, μεγάλο lr = κίνδυνος να χάσουμε το ελάχιστο. ", "Τυπικές τιμές: 0.001–0.1 ανάλογα με το πρόβλημα. ⚡"];
    } else if (lc.includes("supervised") || lc.includes("unsupervised")) {
      chunks = ["Supervised: έχουμε labels (σωστές απαντήσεις) και το μοντέλο μαθαίνει τη σχέση X→y. ", "Unsupervised: δεν έχουμε labels — το μοντέλο βρίσκει κρυφή δομή (π.χ. clusters). ", "Το reinforcement learning είναι διαφορετικό — μαθαίνει μέσω reward/penalty σε interactive environment. 🎮"];
    } else {
      chunks = responses.default;
    }

    let acc = "";
    setChatMessages(m => [...m, { role: "ai", text: "" }]);
    for (const chunk of chunks) {
      await new Promise(r => setTimeout(r, 45));
      acc += chunk;
      setChatMessages(m => [...m.slice(0, -1), { role: "ai", text: acc }]);
    }
    setLoadingChat(false);
  }

  const isLast = currentIndex === totalSteps - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Progress bar + header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">Introduction to Machine Learning</div>
          <div className="text-xs text-muted-foreground">Step {currentIndex + 1} of {totalSteps} · {step.title}</div>
        </div>
        {/* XP Burst */}
        <div className="relative">
          {xpBurst && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-sm animate-bounce pointer-events-none">
              +{xpBurst} XP
            </div>
          )}
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/40 bg-yellow-400/10">
            <Zap className="h-3 w-3 mr-1" />{180 + completedSteps * 20} XP
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className={cn(showHint && "text-yellow-400")} onClick={handleHint}>
            <Lightbulb className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className={cn(showExplain && "text-blue-400")} onClick={handleExplain}>
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className={cn(showChat && "text-primary")} onClick={() => setShowChat(v => !v)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 px-4 py-2 shrink-0 border-b border-border bg-card/50">
        {DEMO_STEPS.map((s, i) => (
          <div key={s.id} className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary/60" : "bg-border"
          )} />
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Hint panel */}
          {showHint && (
            <div className="mb-4 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-4 text-sm text-foreground">
              <div className="font-semibold text-yellow-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4" /> Hint
              </div>
              {loadingHint ? (
                <div className="flex gap-1"><span className="animate-bounce">·</span><span className="animate-bounce delay-100">·</span><span className="animate-bounce delay-200">·</span></div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{hint}</ReactMarkdown></div>
              )}
            </div>
          )}

          {/* Explain panel */}
          {showExplain && (
            <div className="mb-4 rounded-lg border border-blue-400/30 bg-blue-400/5 p-4 text-sm text-foreground">
              <div className="font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Deeper Explanation
              </div>
              {loadingExplain ? (
                <div className="flex gap-1"><span className="animate-bounce">·</span><span className="animate-bounce delay-100">·</span><span className="animate-bounce delay-200">·</span></div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{explain}</ReactMarkdown></div>
              )}
            </div>
          )}

          {/* Step content */}
          <div className="max-w-2xl">
            {step.type === "content" && (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{step.content}</ReactMarkdown>
              </div>
            )}

            {step.type === "quiz" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <Target className="h-4 w-4" /> Knowledge Check
                </div>
                <p className="text-foreground font-medium leading-relaxed">{step.content}</p>
                <div className="space-y-2">
                  {step.options!.map((opt, i) => {
                    const isSelected = quizAnswer === i;
                    const isCorrect = i === step.correctOption;
                    let cls = "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/60";
                    if (quizState !== "idle") {
                      if (isCorrect) cls = "border-green-500 bg-green-500/10";
                      else if (isSelected) cls = "border-red-500 bg-red-500/10";
                      else cls = "border-border bg-muted/20 opacity-50";
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(i)}
                        className={cn("w-full text-left rounded-lg border p-3 text-sm transition-colors flex items-center gap-3", cls)}
                        disabled={quizState !== "idle"}
                      >
                        <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {quizState !== "idle" && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                        {quizState !== "idle" && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {quizState === "correct" && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Σωστά! +20 XP
                  </div>
                )}
                {quizState === "wrong" && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 flex flex-col gap-1">
                    <span className="font-medium flex items-center gap-2"><XCircle className="h-4 w-4" /> Λάθος!</span>
                    <span className="text-xs opacity-80">Χρησιμοποίησε το Hint (💡) ή δοκίμασε ξανά.</span>
                    <button onClick={() => { setQuizState("idle"); setQuizAnswer(null); }} className="text-xs underline mt-1 text-left hover:text-red-300">Δοκίμασε ξανά →</button>
                  </div>
                )}
              </div>
            )}

            {step.type === "code" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <Code className="h-4 w-4" /> Code Exercise
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Γράψε τον κώδικά σου:</div>
                  <textarea
                    className="w-full h-32 rounded-lg border border-border bg-muted/40 p-3 text-sm font-mono text-foreground resize-none focus:outline-none focus:border-primary/50"
                    placeholder="# Γράψε τη λύση σου εδώ..."
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    disabled={codeSubmitted}
                  />
                  {!codeSubmitted ? (
                    <Button size="sm" onClick={() => { setCodeSubmitted(true); fireXP(30); }} disabled={codeInput.trim().length < 10}>
                      <Play className="h-3.5 w-3.5 mr-1.5" /> Run & Submit
                    </Button>
                  ) : (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Submitted! +30 XP — Πάτα Explain για να δεις τη λύση
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8 max-w-2xl">
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Πίσω
            </Button>
            <div className="flex-1" />
            {isLast ? (
              <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
                <Trophy className="h-4 w-4 mr-1.5" /> Ολοκλήρωση! 🎉
              </Button>
            ) : (
              <Button onClick={handleAdvance} disabled={!canAdvance()}>
                Επόμενο <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Tutor Chat sidebar */}
        {showChat && (
          <div className="w-72 border-l border-border flex flex-col bg-card shrink-0">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-primary" /> AI Tutor
              </span>
              <button onClick={() => setShowChat(false)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
              {chatMessages.map((m, i) => (
                <div key={i} className={cn("rounded-lg p-2.5 leading-relaxed", m.role === "ai" ? "bg-muted/60 text-foreground" : "bg-primary/20 text-primary-foreground ml-4")}>
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-0"><ReactMarkdown>{m.text || "…"}</ReactMarkdown></div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="Ρώτα κάτι…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleChatSend(); }}
              />
              <Button size="sm" onClick={handleChatSend} disabled={loadingChat || !chatInput.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "lesson", label: "Lesson Player", icon: Play },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <DemoBanner onEnterLesson={() => setTab("lesson")} />

      {/* Sidebar + main layout */}
      <div className="flex h-[calc(100vh-40px)]">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card flex-col hidden sm:flex shrink-0">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-xs leading-none">LA</span>
            </div>
            <span className="font-semibold tracking-tight text-foreground">LearnAI</span>
            <Badge variant="outline" className="text-[10px] ml-auto border-primary/40 text-primary">demo</Badge>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  tab === id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <Button className="w-full" size="sm" asChild>
              <Link href="/sign-up"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Ξεκίνα δωρεάν</Link>
            </Button>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden border-t border-border bg-card flex z-50">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={cn(
              "flex-1 flex flex-col items-center py-2 text-[10px] gap-0.5 transition-colors",
              tab === id ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          {tab === "dashboard" && <DemoDashboard onGoToLesson={() => setTab("lesson")} />}
          {tab === "notes" && <DemoNotes onGoToLesson={() => setTab("lesson")} />}
          {tab === "lesson" && <DemoLessonPlayer onBack={() => setTab("dashboard")} />}
        </main>
      </div>
    </div>
  );
}
