import { Link } from "wouter";
import { Brain, Sparkles, BookOpen, ChevronRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200 dark selection:bg-primary/30 selection:text-white">
      {/* Header */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold leading-none tracking-tighter">LA</span>
          </div>
          <span className="font-semibold text-xl tracking-tight text-white">LearnAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-white transition-colors">
            Sign In
          </Link>
          <Button variant="outline" asChild className="border-slate-600 text-slate-200 hover:bg-slate-800">
            <Link href="/demo">Try Demo</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 top-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-[#0a0f18] to-[#0a0f18] -z-10" />
          
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Your personal AI study partner</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Upload your notes.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                Master the material.
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Don't just re-read your notes. LearnAI turns raw material into interactive, adaptive lessons — and scores how exam-ready you actually are from your real performance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Start Learning Free <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white" asChild>
                <Link href="/demo">
                  Try Demo →
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features / Innovations */}
        <section className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">From static notes to interactive lessons</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Upload any study material — biology notes, programming docs, or history lectures. Our AI breaks it down into bite-sized concepts, creates custom diagrams, and generates knowledge checks to ensure you actually understand before moving on.
                </p>
              </div>
              
              <div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Knows how exam-ready you actually are</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  No personality quizzes about how you learn. LearnAI measures your real performance — quiz accuracy, how often you lean on hints, and how much you practice — to score your exam readiness and show you exactly what to fix before test day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-32">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-4xl font-bold text-center text-white mb-16">How it works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#0f1623] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <span className="text-8xl font-black italic">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Upload Material</h3>
                <p className="text-slate-400 relative z-10">
                  Paste your messy lecture notes, code snippets, or textbook summaries. We accept raw text and instantly structure it.
                </p>
              </div>

              <div className="bg-[#0f1623] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <span className="text-8xl font-black italic">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Generates Course</h3>
                <p className="text-slate-400 relative z-10">
                  Within seconds, we build a comprehensive lesson plan complete with theory, practical exercises, and quizzes.
                </p>
              </div>

              <div className="bg-[#0f1623] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <span className="text-8xl font-black italic">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Interactive Study</h3>
                <p className="text-slate-400 relative z-10">
                  Learn through a split-screen interface with a persistent AI tutor ready to explain complex concepts on demand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 border-t border-white/5">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to study smarter?</h2>
            <p className="text-xl text-slate-400 mb-10">
              Join students and professionals who have transformed how they learn.
            </p>
            <Button size="lg" className="h-14 px-8 text-base" asChild>
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} LearnAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}