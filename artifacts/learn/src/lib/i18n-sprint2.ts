/** Sprint 2 — sandbox, leitner, compare, debate, scratchpad content (EN/EL). */

import type { ArgNode } from "@/components/workspace/ArgumentMap";
import type { LeitnerCard } from "@/components/workspace/LeitnerSystem";
import type { CompareTopic } from "@/components/workspace/SideBySideCompare";
import type { useTranslation } from "@/lib/i18n";

type TFn = ReturnType<typeof useTranslation>["t"];

// ─── Sandbox ───
export const SANDBOX_PRESETS = [
  { id: "baseline", demand: 0, supply: 0 },
  { id: "demandSurge", demand: 20, supply: 0 },
  { id: "supplyShock", demand: 0, supply: -15 },
  { id: "recession", demand: -25, supply: 10 },
] as const;

export const SANDBOX_CHALLENGE_TARGET_P = 40;
export const SANDBOX_CHALLENGE_TOLERANCE = 1.5;

export const I18N_SPRINT2_EN: Record<string, string> = {
  // Sandbox
  "workspace.sandbox.title": "Parametric Sandbox",
  "workspace.sandbox.mode": "Interactive Mode",
  "workspace.sandbox.price": "Price",
  "workspace.sandbox.quantity": "Quantity",
  "workspace.sandbox.consumerSurplus": "Consumer Surplus",
  "workspace.sandbox.producerSurplus": "Producer Surplus",
  "workspace.sandbox.demandShock": "Demand Shock",
  "workspace.sandbox.supplyShock": "Supply Shock",
  "workspace.sandbox.presets": "Presets",
  "workspace.sandbox.preset.baseline": "Baseline",
  "workspace.sandbox.preset.demandSurge": "Demand surge",
  "workspace.sandbox.preset.supplyShock": "Supply shock",
  "workspace.sandbox.preset.recession": "Recession",
  "workspace.sandbox.formula.title": "Equilibrium formulas",
  "workspace.sandbox.formula.p": "P* = (100 + ΔD − ΔS) / 2",
  "workspace.sandbox.formula.q": "Q* = P* + ΔS",
  "workspace.sandbox.challenge.title": "Challenge",
  "workspace.sandbox.challenge.prompt":
    "Adjust shocks so P* ≈ {{target}} (±{{tol}})",
  "workspace.sandbox.challenge.success": "✓ Challenge complete! P* = {{p}}",
  "workspace.sandbox.challenge.hint": "Try shifting demand up or supply down.",
  "workspace.sandbox.insight":
    "Increasing demand raises both consumer and producer surplus, expanding total market welfare.",

  // Leitner
  "workspace.leitner.title": "Leitner Box System",
  "workspace.leitner.box": "Box {{n}}",
  "workspace.leitner.due": "due",
  "workspace.leitner.question": "Question",
  "workspace.leitner.answer": "Answer",
  "workspace.leitner.tapFlip": "Tap to flip",
  "workspace.leitner.forgot": "Forgot (To Box 1)",
  "workspace.leitner.remembered": "Remembered (Box {{n}})",
  "workspace.leitner.box1.label": "Every Day",
  "workspace.leitner.box2.label": "Every 3 Days",
  "workspace.leitner.box3.label": "Weekly",
  "workspace.leitner.box4.label": "Bi-Weekly",
  "workspace.leitner.box5.label": "Mastered",
  "workspace.leitner.session": "Session",
  "workspace.leitner.sessionAccuracy": "{{pct}}% accuracy",
  "workspace.leitner.sessionStats": "{{correct}} correct · {{wrong}} missed",

  "workspace.leitner.card.1.front": "Bertrand Paradox",
  "workspace.leitner.card.1.back":
    "2 firms + identical products → price equals MC",
  "workspace.leitner.card.2.front": "Nash Equilibrium",
  "workspace.leitner.card.2.back":
    "No player gains by unilaterally changing strategy",
  "workspace.leitner.card.3.front": "Cournot Model",
  "workspace.leitner.card.3.back": "Firms compete on quantity simultaneously",
  "workspace.leitner.card.4.front": "Deadweight Loss",
  "workspace.leitner.card.4.back":
    "Efficiency loss when equilibrium is not achieved",
  "workspace.leitner.card.5.front": "Best Response (Cournot)",
  "workspace.leitner.card.5.back": "q₁* = (a − c − q₂) / 2b",

  // Compare
  "workspace.compare.pickTopic": "Compare topic",
  "workspace.compare.row.definition": "Definition",
  "workspace.compare.row.mechanism": "Mechanism",
  "workspace.compare.row.example": "Classic Example",
  "workspace.compare.row.mistake": "Common Mistake",
  "workspace.compare.row.exam": "Exam Tip",
  "workspace.compare.row.misconception": "Misconception",
  "workspace.compare.row.resolution": "Resolution",

  "workspace.compare.cournotBertrand.title": "Cournot vs Bertrand",
  "workspace.compare.cournotBertrand.left": "Cournot (Quantity)",
  "workspace.compare.cournotBertrand.right": "Bertrand (Price)",
  "workspace.compare.cournotBertrand.def.l":
    "Firms simultaneously choose output levels; market price is set by total quantity.",
  "workspace.compare.cournotBertrand.def.r":
    "Firms simultaneously choose prices; consumers buy from the cheapest firm.",
  "workspace.compare.cournotBertrand.mech.l":
    "Best-response functions determine q₁*, q₂*; equilibrium yields P > MC.",
  "workspace.compare.cournotBertrand.mech.r":
    "Undercutting continues until P = MC with homogeneous products.",
  "workspace.compare.cournotBertrand.ex.l":
    "Duopoly with P = 100 − Q, MC = 10 → q = 30 each.",
  "workspace.compare.cournotBertrand.ex.r":
    "Two gas stations on same corner with identical prices.",
  "workspace.compare.cournotBertrand.mis.l":
    "Assuming more firms are needed for competitive prices.",
  "workspace.compare.cournotBertrand.mis.r":
    "Thinking Bertrand always applies in real markets.",
  "workspace.compare.cournotBertrand.exam.l":
    "Ask: what variable do firms choose? Draw reaction functions.",
  "workspace.compare.cournotBertrand.exam.r":
    "Ask: what happens with product differentiation?",

  "workspace.compare.anchorFrame.title": "Anchoring vs Framing",
  "workspace.compare.anchorFrame.left": "Anchoring Effect",
  "workspace.compare.anchorFrame.right": "Framing Effect",
  "workspace.compare.anchorFrame.def.l":
    "Relying too heavily on the first piece of information offered.",
  "workspace.compare.anchorFrame.def.r":
    "Reacting differently depending on how information is presented.",
  "workspace.compare.anchorFrame.mech.l":
    "Initial numerical value creates a baseline that limits adjustment.",
  "workspace.compare.anchorFrame.mech.r":
    "Loss aversion makes us risk-seeking for losses, risk-averse for gains.",
  "workspace.compare.anchorFrame.ex.l":
    '"Was Gandhi older or younger than 140 when he died? How old was he?"',
  "workspace.compare.anchorFrame.ex.r":
    '"90% survival rate" vs "10% mortality rate".',
  "workspace.compare.anchorFrame.mis.l":
    "Confusing it with mere reference points in conversation.",
  "workspace.compare.anchorFrame.mis.r":
    "Thinking it only applies to percentages.",
  "workspace.compare.anchorFrame.exam.l":
    "Look for an initial random number influencing a final estimate.",
  "workspace.compare.anchorFrame.exam.r":
    "Look for identical outcomes described in positive vs negative terms.",

  // Debate tree
  "workspace.debate.title": "Debate Tree",
  "workspace.debate.type.claim": "claim",
  "workspace.debate.type.premise": "premise",
  "workspace.debate.type.support": "support",
  "workspace.debate.type.refutation": "refutation",
  "workspace.debate.root":
    "The Bertrand Paradox assumes identical products, causing price to equal MC.",
  "workspace.debate.p1": "Consumers buy only from the cheapest firm.",
  "workspace.debate.p2": "Firms can supply the entire market.",
  "workspace.debate.s1": "Homogeneous goods are perfect substitutes.",
  "workspace.debate.r1": "But brand loyalty exists (differentiation).",
  "workspace.debate.r2": "Firms usually face capacity constraints.",
};

export const I18N_SPRINT2_EL: Record<string, string> = {
  "workspace.sandbox.title": "Parametric Sandbox",
  "workspace.sandbox.mode": "Διαδραστική Λειτουργία",
  "workspace.sandbox.price": "Τιμή",
  "workspace.sandbox.quantity": "Ποσότητα",
  "workspace.sandbox.consumerSurplus": "Consumer Surplus",
  "workspace.sandbox.producerSurplus": "Producer Surplus",
  "workspace.sandbox.demandShock": "Demand Shock",
  "workspace.sandbox.supplyShock": "Supply Shock",
  "workspace.sandbox.presets": "Presets",
  "workspace.sandbox.preset.baseline": "Baseline",
  "workspace.sandbox.preset.demandSurge": "Έκρηξη ζήτησης",
  "workspace.sandbox.preset.supplyShock": "Σοκ προσφοράς",
  "workspace.sandbox.preset.recession": "Ύφεση",
  "workspace.sandbox.formula.title": "Τύποι ισορροπίας",
  "workspace.sandbox.formula.p": "P* = (100 + ΔD − ΔS) / 2",
  "workspace.sandbox.formula.q": "Q* = P* + ΔS",
  "workspace.sandbox.challenge.title": "Πρόκληση",
  "workspace.sandbox.challenge.prompt":
    "Ρύθμισε τα shocks ώστε P* ≈ {{target}} (±{{tol}})",
  "workspace.sandbox.challenge.success": "✓ Ολοκλήρωσες! P* = {{p}}",
  "workspace.sandbox.challenge.hint":
    "Δοκίμασε αύξηση ζήτησης ή μείωση προσφοράς.",
  "workspace.sandbox.insight":
    "Η αύξηση της ζήτησης ανεβάζει consumer και producer surplus, διευρύνοντας το συνολικό welfare.",

  "workspace.leitner.title": "Σύστημα Leitner",
  "workspace.leitner.box": "Κουτί {{n}}",
  "workspace.leitner.due": "due",
  "workspace.leitner.question": "Ερώτηση",
  "workspace.leitner.answer": "Απάντηση",
  "workspace.leitner.tapFlip": "Πάτα για flip",
  "workspace.leitner.forgot": "Ξέχασα (Στο Κουτί 1)",
  "workspace.leitner.remembered": "Θυμήθηκα (Κουτί {{n}})",
  "workspace.leitner.box1.label": "Κάθε μέρα",
  "workspace.leitner.box2.label": "Κάθε 3 μέρες",
  "workspace.leitner.box3.label": "Εβδομαδιαία",
  "workspace.leitner.box4.label": "Διεβδομαδιαία",
  "workspace.leitner.box5.label": "Mastered",
  "workspace.leitner.session": "Συνεδρία",
  "workspace.leitner.sessionAccuracy": "{{pct}}% ακρίβεια",
  "workspace.leitner.sessionStats": "{{correct}} σωστά · {{wrong}} λάθη",

  "workspace.leitner.card.1.front": "Παράδοξο Bertrand",
  "workspace.leitner.card.1.back": "2 επιχειρήσεις + ίδια προϊόντα → τιμή = MC",
  "workspace.leitner.card.2.front": "Ισορροπία Nash",
  "workspace.leitner.card.2.back":
    "Κανείς δεν κερδίζει μονομερώς αλλάζοντας στρατηγική",
  "workspace.leitner.card.3.front": "Μοντέλο Cournot",
  "workspace.leitner.card.3.back": "Ανταγωνισμός στην ποσότητα ταυτόχρονα",
  "workspace.leitner.card.4.front": "Deadweight Loss",
  "workspace.leitner.card.4.back":
    "Απώλεια αποδοτικότητας όταν δεν επιτυγχάνεται ισορροπία",
  "workspace.leitner.card.5.front": "Best Response (Cournot)",
  "workspace.leitner.card.5.back": "q₁* = (a − c − q₂) / 2b",

  "workspace.compare.pickTopic": "Θέμα σύγκρισης",
  "workspace.compare.row.definition": "Ορισμός",
  "workspace.compare.row.mechanism": "Μηχανισμός",
  "workspace.compare.row.example": "Κλασικό Παράδειγμα",
  "workspace.compare.row.mistake": "Συνηθισμένο Λάθος",
  "workspace.compare.row.exam": "Tip Εξέτασης",
  "workspace.compare.row.misconception": "Παρανόηση",
  "workspace.compare.row.resolution": "Επίλυση",

  "workspace.compare.cournotBertrand.title": "Cournot vs Bertrand",
  "workspace.compare.cournotBertrand.left": "Cournot (Ποσότητα)",
  "workspace.compare.cournotBertrand.right": "Bertrand (Τιμή)",
  "workspace.compare.cournotBertrand.def.l":
    "Οι επιχειρήσεις επιλέγουν ταυτόχρονα ποσότητες· η τιμή καθορίζεται από τη συνολική ποσότητα.",
  "workspace.compare.cournotBertrand.def.r":
    "Οι επιχειρήσεις επιλέγουν ταυτόχρονα τιμές· οι καταναλωτές αγοράζουν από τη φθηνότερη.",
  "workspace.compare.cournotBertrand.mech.l":
    "Best-response functions → q₁*, q₂*· η ισορροπία δίνει P > MC.",
  "workspace.compare.cournotBertrand.mech.r":
    "Undercutting μέχρι P = MC με ομοιογενή προϊόντα.",
  "workspace.compare.cournotBertrand.ex.l":
    "Duopoly P = 100 − Q, MC = 10 → q = 30 η καθεμία.",
  "workspace.compare.cournotBertrand.ex.r":
    "Δύο βενzinάδικα στην ίδια γωνία με ίδιες τιμές.",
  "workspace.compare.cournotBertrand.mis.l":
    "Νομίζουν ότι χρειάζονται περισσότερες επιχειρήσεις για competitive τιμές.",
  "workspace.compare.cournotBertrand.mis.r":
    "Νομίζουν ότι ο Bertrand ισχύει πάντα στην πραγματικότητα.",
  "workspace.compare.cournotBertrand.exam.l":
    "Ρώτα: τι μεταβλητή επιλέγουν; Σχεδίασε reaction functions.",
  "workspace.compare.cournotBertrand.exam.r":
    "Ρώτα: τι γίνεται με product differentiation;",

  "workspace.compare.anchorFrame.title": "Anchoring vs Framing",
  "workspace.compare.anchorFrame.left": "Anchoring Effect",
  "workspace.compare.anchorFrame.right": "Framing Effect",
  "workspace.compare.anchorFrame.def.l":
    "Εξάρτηση από την πρώτη πληροφορία που προσφέρεται.",
  "workspace.compare.anchorFrame.def.r":
    "Διαφορετική αντίδραση ανάλογα με τον τρόπο παρουσίασης.",
  "workspace.compare.anchorFrame.mech.l":
    "Η αρχική αριθμητική τιμή δημιουργεί baseline που περιορίζει προσαρμογή.",
  "workspace.compare.anchorFrame.mech.r":
    "Loss aversion → risk-seeking για απώλειες, risk-averse για κέρδη.",
  "workspace.compare.anchorFrame.ex.l":
    "«Ήταν ο Gandhi πάνω ή κάτω από 140 όταν πέθανε; Πόσων ετών ήταν;»",
  "workspace.compare.anchorFrame.ex.r": "«90% επιβίωση» vs «10% θνησιμότητα».",
  "workspace.compare.anchorFrame.mis.l":
    "Σύγχυση με απλές αναφορές στη συζήτηση.",
  "workspace.compare.anchorFrame.mis.r":
    "Νομίζουν ότι ισχύει μόνο για ποσοστά.",
  "workspace.compare.anchorFrame.exam.l":
    "Ψάξε τυχαίο αρχικό νούμερο που επηρεάζει εκτίμηση.",
  "workspace.compare.anchorFrame.exam.r":
    "Ψάξε ίδιο αποτέλεσμα σε θετικούς vs αρνητικούς όρους.",

  "workspace.debate.title": "Debate Tree",
  "workspace.debate.type.claim": "claim",
  "workspace.debate.type.premise": "premise",
  "workspace.debate.type.support": "support",
  "workspace.debate.type.refutation": "refutation",
  "workspace.debate.root":
    "Το Παράδοξο Bertrand υποθέτει ίδια προϊόντα, οδηγώντας την τιμή στο MC.",
  "workspace.debate.p1":
    "Οι καταναλωτές αγοράζουν μόνο από τη φθηνότερη επιχείρηση.",
  "workspace.debate.p2":
    "Οι επιχειρήσεις μπορούν να εξυπηρετήσουν ολόκληρη την αγορά.",
  "workspace.debate.s1": "Τα ομοιογενή αγαθά είναι τέλεια υποκατάστατα.",
  "workspace.debate.r1": "Όμως υπάρχει brand loyalty (differentiation).",
  "workspace.debate.r2": "Συνήθως υπάρχουν περιορισμοί χωρητικότητας.",
};

function buildCompareTopic(
  t: TFn,
  prefix: string,
  leftColor: string,
  rightColor: string,
  mistakeLabelKey: "mistake" | "misconception" = "mistake",
): CompareTopic {
  return {
    title: t(`${prefix}.title`),
    left: {
      title: t(`${prefix}.left`),
      color: leftColor,
      bg: leftColor === "#38bdf8" ? "bg-sky-500/10" : "bg-indigo-500/10",
      border:
        leftColor === "#38bdf8" ? "border-sky-500/30" : "border-indigo-500/35",
    },
    right: {
      title: t(`${prefix}.right`),
      color: rightColor,
      bg: rightColor === "#fbbf24" ? "bg-amber-500/10" : "bg-teal-500/10",
      border:
        rightColor === "#fbbf24" ? "border-amber-500/30" : "border-teal-500/35",
    },
    rows: [
      {
        label: t("workspace.compare.row.definition"),
        left: t(`${prefix}.def.l`),
        right: t(`${prefix}.def.r`),
      },
      {
        label: t("workspace.compare.row.mechanism"),
        left: t(`${prefix}.mech.l`),
        right: t(`${prefix}.mech.r`),
      },
      {
        label: t("workspace.compare.row.example"),
        left: t(`${prefix}.ex.l`),
        right: t(`${prefix}.ex.r`),
      },
      {
        label: t(`workspace.compare.row.${mistakeLabelKey}`),
        left: t(`${prefix}.mis.l`),
        right: t(`${prefix}.mis.r`),
      },
      {
        label: t("workspace.compare.row.exam"),
        left: t(`${prefix}.exam.l`),
        right: t(`${prefix}.exam.r`),
      },
    ],
  };
}

export function getCompareTopics(t: TFn): Record<string, CompareTopic> {
  return {
    cournotBertrand: buildCompareTopic(
      t,
      "workspace.compare.cournotBertrand",
      "#818cf8",
      "#5eead4",
      "misconception",
    ),
    anchorFrame: buildCompareTopic(
      t,
      "workspace.compare.anchorFrame",
      "#38bdf8",
      "#fbbf24",
      "mistake",
    ),
  };
}

export function getLeitnerCards(t: TFn): LeitnerCard[] {
  return [
    {
      id: 1,
      front: t("workspace.leitner.card.1.front"),
      back: t("workspace.leitner.card.1.back"),
      box: 1,
    },
    {
      id: 2,
      front: t("workspace.leitner.card.2.front"),
      back: t("workspace.leitner.card.2.back"),
      box: 2,
    },
    {
      id: 3,
      front: t("workspace.leitner.card.3.front"),
      back: t("workspace.leitner.card.3.back"),
      box: 1,
    },
    {
      id: 4,
      front: t("workspace.leitner.card.4.front"),
      back: t("workspace.leitner.card.4.back"),
      box: 3,
    },
    {
      id: 5,
      front: t("workspace.leitner.card.5.front"),
      back: t("workspace.leitner.card.5.back"),
      box: 2,
    },
  ];
}

export function getDebateTree(t: TFn): ArgNode {
  return {
    id: "root",
    type: "claim",
    text: t("workspace.debate.root"),
    x: 300,
    y: 50,
    expanded: true,
    children: [
      {
        id: "p1",
        type: "premise",
        text: t("workspace.debate.p1"),
        x: 150,
        y: 150,
        expanded: true,
        children: [
          {
            id: "s1",
            type: "support",
            text: t("workspace.debate.s1"),
            x: 50,
            y: 250,
          },
          {
            id: "r1",
            type: "refutation",
            text: t("workspace.debate.r1"),
            x: 250,
            y: 250,
          },
        ],
      },
      {
        id: "p2",
        type: "premise",
        text: t("workspace.debate.p2"),
        x: 450,
        y: 150,
        expanded: true,
        children: [
          {
            id: "r2",
            type: "refutation",
            text: t("workspace.debate.r2"),
            x: 450,
            y: 250,
          },
        ],
      },
    ],
  };
}

export function getLeitnerBoxLabels(t: TFn) {
  return [1, 2, 3, 4, 5].map((id) => t(`workspace.leitner.box${id}.label`));
}

/** Boxes 1–2 treated as "due" for review in demo */
export function isBoxDue(boxId: number) {
  return boxId <= 2;
}
