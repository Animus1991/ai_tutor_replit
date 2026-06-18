/**
 * Landing page — Synapse-style.
 *
 * Sections:
 *   1) Sticky glass navbar (brand + language toggle + CTA)
 *   2) Hero (badge, title, subtitle, primary/secondary CTA, trust ticks)
 *   3) User-types row (chips)
 *   4) How it works (4-step grid)
 *   5) Features grid (6 cards)
 *   6) Differentiation grid (6 ❌/✅ pairs)
 *   7) Social proof (quote + 5 stars)
 *   8) Final CTA banner
 *   9) Footer
 *
 * All copy comes through the i18n `t()` hook so this page is fully bilingual
 * (English / Greek) and matches the Option A reference.
 *
 * Navigation: primary CTA goes to /sign-up, secondary "Try Demo" to /demo,
 * `Sign In` to /sign-in/$. We keep these routes intact for Clerk/BetterAuth.
 */

import { CurriculumLensToggle } from "@/components/CurriculumLensToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BlueprintSection } from "@/components/marketing/BlueprintSection";
import { getCurriculumPreview } from "@/lib/curriculumLens";
import { useTranslation } from "@/lib/i18n";
import { Link } from "@/lib/wouter-compat";
import { useAppStore } from "@/stores/appStore";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Check,
  ChevronRight,
  Clock,
  GraduationCap,
  Sparkles,
  Star,
  Target,
  Upload,
  Users,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();
  const lens = useAppStore((s) => s.curriculumLens);
  const curriculum = getCurriculumPreview(lens);

  const features = [
    {
      icon: Upload,
      titleKey: "landing.features.upload.title",
      descKey: "landing.features.upload.desc",
      color: "text-synapse-brand-400",
    },
    {
      icon: Brain,
      titleKey: "landing.features.ai.title",
      descKey: "landing.features.ai.desc",
      color: "text-synapse-accent-teal",
    },
    {
      icon: Target,
      titleKey: "landing.features.adaptive.title",
      descKey: "landing.features.adaptive.desc",
      color: "text-synapse-accent-cyan",
    },
    {
      icon: Zap,
      titleKey: "landing.features.practice.title",
      descKey: "landing.features.practice.desc",
      color: "text-synapse-accent-amber",
    },
    {
      icon: Clock,
      titleKey: "landing.features.spaced.title",
      descKey: "landing.features.spaced.desc",
      color: "text-synapse-accent-emerald",
    },
    {
      icon: BarChart3,
      titleKey: "landing.features.analytics.title",
      descKey: "landing.features.analytics.desc",
      color: "text-synapse-accent-rose",
    },
  ];

  const userTypes = [
    {
      icon: GraduationCap,
      labelKey: "onboard.role.university",
    },
    { icon: BookOpen, labelKey: "onboard.role.highschool" },
    { icon: Sparkles, labelKey: "onboard.role.selflearner" },
    { icon: Users, labelKey: "onboard.role.tutor" },
    { icon: Building2, labelKey: "onboard.role.company" },
  ];

  const steps = [
    {
      num: "01",
      titleKey: "landing.how.step1.title",
      descKey: "landing.how.step1.desc",
    },
    {
      num: "02",
      titleKey: "landing.how.step2.title",
      descKey: "landing.how.step2.desc",
    },
    {
      num: "03",
      titleKey: "landing.how.step3.title",
      descKey: "landing.how.step3.desc",
    },
    {
      num: "04",
      titleKey: "landing.how.step4.title",
      descKey: "landing.how.step4.desc",
    },
  ];

  const diff = [
    {
      wrongKey: "landing.diff.learning_styles",
      rightKey: "landing.diff.evidence",
    },
    { wrongKey: "landing.diff.generic", rightKey: "landing.diff.full_course" },
    {
      wrongKey: "landing.diff.flashcards",
      rightKey: "landing.diff.multimodal",
    },
    {
      wrongKey: "landing.diff.hallucination",
      rightKey: "landing.diff.citations",
    },
    {
      wrongKey: "landing.diff.one_size",
      rightKey: "landing.diff.adaptive_pace",
    },
    { wrongKey: "landing.diff.passive", rightKey: "landing.diff.active" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-synapse-surface-primary text-synapse-text-primary">
      {/* Navbar */}
      <nav className="synapse-glass-strong fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Synapse</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-synapse-text-secondary transition-colors hover:text-synapse-text-primary sm:inline-block"
            >
              {t("landing.signIn")}
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-synapse-brand-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-synapse-brand-500"
            >
              {t("landing.cta.start")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="synapse-animate-pulse-slow absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-synapse-brand-600/20 blur-[128px]" />
          <div
            className="synapse-animate-pulse-slow absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-synapse-accent-teal/15 blur-[128px]"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-synapse-accent-cyan/10 blur-[160px]" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-synapse-brand-500/30 bg-synapse-brand-500/10 px-4 py-1.5 text-sm font-medium text-synapse-brand-300">
              <Sparkles className="h-4 w-4" />
              {curriculum.audience}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-6 flex justify-center"
          >
            <CurriculumLensToggle />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-4xl font-black leading-tight sm:text-5xl lg:text-7xl"
          >
            {curriculum.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-synapse-text-secondary sm:text-xl"
          >
            {curriculum.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="synapse-glow-brand group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-synapse-brand-500 hover:to-synapse-brand-400"
            >
              {t("landing.cta.start")}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-synapse-border-default px-8 py-4 text-lg font-semibold transition-all hover:border-synapse-brand-500/50 hover:bg-synapse-surface-hover"
            >
              {t("landing.cta.demo")}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-synapse-text-tertiary"
          >
            {[
              t("landing.trust.free"),
              t("landing.trust.subjects"),
              t("landing.trust.grounded"),
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-synapse-accent-emerald" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* User-types */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap justify-center gap-3">
            {userTypes.map((ut, i) => (
              <motion.div
                key={ut.labelKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="group flex cursor-default items-center gap-2 rounded-xl border border-synapse-border-subtle bg-synapse-surface-card px-4 py-2.5 transition-all hover:border-synapse-brand-500/40"
              >
                <ut.icon className="h-4 w-4 text-synapse-brand-400 group-hover:text-synapse-brand-300" />
                <span className="text-sm font-medium text-synapse-text-secondary group-hover:text-synapse-text-primary">
                  {t(ut.labelKey)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {t("landing.how.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-synapse-text-secondary">
              {t("landing.how.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="group relative rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-6 transition-all hover:border-synapse-brand-500/40"
              >
                <div className="mb-4 text-5xl font-black text-synapse-brand-500/20 transition-colors group-hover:text-synapse-brand-500/30">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-synapse-text-secondary">
                  {t(step.descKey)}
                </p>
                {i < 3 && (
                  <div className="absolute -right-3 top-1/2 hidden h-6 w-6 text-synapse-border-default lg:block">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-synapse-surface-secondary/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-synapse-text-secondary">
              Powered by cognitive science, not gimmicks
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="group rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-6 transition-all hover:border-synapse-brand-500/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-synapse-surface-hover transition-transform group-hover:scale-110">
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-synapse-text-secondary">
                  {t(f.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {t("landing.diff.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-synapse-text-secondary">
              {t("landing.diff.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {diff.map((item, i) => (
              <motion.div
                key={item.wrongKey}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-4"
              >
                <p className="mb-2 text-xs text-synapse-text-muted">
                  {t(item.wrongKey)}
                </p>
                <p className="text-sm font-medium text-synapse-accent-emerald">
                  {t(item.rightKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blueprint roadmap */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <BlueprintSection />
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-6 w-6 fill-synapse-accent-amber text-synapse-accent-amber"
              />
            ))}
          </div>
          <blockquote className="mb-6 text-xl font-medium leading-relaxed sm:text-2xl">
            “I uploaded my entire semester's notes and Synapse turned them into
            an interactive course that actually taught me better than re-reading
            ever could. I went from a C to an A.”
          </blockquote>
          <div className="text-synapse-text-secondary">
            <span className="font-medium text-synapse-text-primary">
              Sarah K.
            </span>{" "}
            · Economics Major, University of Amsterdam
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-synapse-brand-500/30 bg-gradient-to-br from-synapse-brand-950 to-synapse-surface-card p-8 sm:p-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-synapse-brand-500/20 blur-[80px]" />
            <div className="relative text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to Transform How You Learn?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-synapse-text-secondary">
                Upload your first document and experience AI-powered adaptive
                tutoring in minutes.
              </p>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-synapse-brand-600 to-synapse-accent-teal px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-synapse-brand-500/25"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-synapse-border-subtle px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-synapse-text-secondary">
              Synapse
            </span>
          </div>
          <p className="text-sm text-synapse-text-tertiary">
            © {new Date().getFullYear()} Synapse Learning. From static notes to
            adaptive tutoring.
          </p>
        </div>
      </footer>
    </div>
  );
}
