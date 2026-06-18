/**
 * UploadModal — multi-step material upload flow from Option A.
 * Wired to real navigation: after upload, user goes to /library or /courses/new.
 */

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Code,
  File,
  FileText,
  Image,
  Link2,
  Presentation,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const acceptedFormats = [
  { ext: "PDF", icon: FileText, color: "text-red-400" },
  { ext: "DOCX", icon: File, color: "text-blue-400" },
  { ext: "PPTX", icon: Presentation, color: "text-orange-400" },
  { ext: "TXT/MD", icon: FileText, color: "text-synapse-text-secondary" },
  { ext: "Images", icon: Image, color: "text-synapse-accent-emerald" },
  { ext: "Code", icon: Code, color: "text-synapse-accent-teal" },
];

type SourceMode = "strict" | "enriched" | "notes-only";
type Step = "upload" | "configure" | "processing";

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedContent, setPastedContent] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>("enriched");
  const [step, setStep] = useState<Step>("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFiles([]);
    setPastedContent("");
    setYoutubeUrl("");
    setSourceMode("enriched");
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const hasContent =
    files.length > 0 ||
    pastedContent.trim().length > 0 ||
    youtubeUrl.trim().length > 0;

  const handleProceed = () => {
    setStep("processing");
    // Persist preferences for the create-course flow
    try {
      localStorage.setItem(
        "synapse.upload.v1",
        JSON.stringify({
          sourceMode,
          fileCount: files.length,
          hasPaste: !!pastedContent.trim(),
        }),
      );
    } catch {
      // ignore
    }
    setTimeout(() => {
      handleClose();
      navigate({ to: pastedContent.trim() ? "/courses/new" : "/library" });
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-synapse-border-subtle bg-synapse-surface-secondary"
        >
          <div className="flex items-center justify-between border-b border-synapse-border-subtle p-5">
            <div>
              <h2 className="text-lg font-bold">{t("lib.upload")}</h2>
              <p className="mt-0.5 text-sm text-synapse-text-secondary">
                {step === "upload" && "Drop your files or paste content"}
                {step === "configure" && "Configure your course generation"}
                {step === "processing" && "AI is analyzing your material…"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-synapse-surface-hover"
            >
              <X className="h-5 w-5 text-synapse-text-secondary" />
            </button>
          </div>

          <div className="space-y-5 p-5">
            {step === "upload" && (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                    dragActive
                      ? "border-synapse-brand-500 bg-synapse-brand-500/5"
                      : "border-synapse-border-default hover:border-synapse-brand-500/50 hover:bg-synapse-surface-hover/50",
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.py,.js,.ts,.r,.sql,.jpg,.jpeg,.png,.gif,.webp"
                  />
                  <Upload
                    className={cn(
                      "mx-auto mb-3 h-10 w-10 transition-colors",
                      dragActive
                        ? "text-synapse-brand-400"
                        : "text-synapse-text-muted",
                    )}
                  />
                  <p className="mb-1 text-sm font-medium">
                    {dragActive
                      ? "Drop files here"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-synapse-text-tertiary">
                    PDF, DOCX, PPTX, TXT, MD, Images, Code files, CSV
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {acceptedFormats.map((f) => (
                    <span
                      key={f.ext}
                      className="flex items-center gap-1.5 text-xs text-synapse-text-tertiary"
                    >
                      <f.icon className={cn("h-3.5 w-3.5", f.color)} />
                      {f.ext}
                    </span>
                  ))}
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-synapse-text-tertiary">
                      {files.length} file(s) selected
                    </p>
                    {files.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center gap-3 rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-3"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-synapse-brand-400" />
                        <span className="flex-1 truncate text-sm">
                          {file.name}
                        </span>
                        <span className="text-xs text-synapse-text-muted">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="text-synapse-text-muted hover:text-synapse-accent-rose"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-medium text-synapse-text-tertiary">
                    Or paste content directly
                  </label>
                  <textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="Paste your notes, text, or any learning material here…"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-synapse-border-subtle bg-synapse-surface-input px-4 py-3 text-sm text-foreground placeholder:text-synapse-text-muted focus:border-synapse-brand-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-synapse-text-tertiary">
                    <Link2 className="mr-1 inline h-3.5 w-3.5" />
                    YouTube / Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                    className="w-full rounded-xl border border-synapse-border-subtle bg-synapse-surface-input px-4 py-2.5 text-sm focus:border-synapse-brand-500/50 focus:outline-none"
                  />
                </div>
              </>
            )}

            {step === "configure" && (
              <>
                <div>
                  <label className="mb-3 block text-sm font-medium">
                    Source Mode
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        mode: "strict" as SourceMode,
                        label: t("lib.source_mode.strict"),
                        desc: "Only use content from your uploaded material.",
                        icon: "🔒",
                      },
                      {
                        mode: "enriched" as SourceMode,
                        label: t("lib.source_mode.enriched"),
                        desc: "Notes as primary source + trusted external explanations.",
                        icon: "✨",
                      },
                      {
                        mode: "notes-only" as SourceMode,
                        label: t("lib.source_mode.notes"),
                        desc: "Generate course structure from notes without additions.",
                        icon: "📝",
                      },
                    ].map((s) => (
                      <button
                        key={s.mode}
                        type="button"
                        onClick={() => setSourceMode(s.mode)}
                        className={cn(
                          "w-full rounded-xl border p-4 text-left transition-all",
                          sourceMode === s.mode
                            ? "border-synapse-brand-500/50 bg-synapse-brand-500/10"
                            : "border-synapse-border-subtle hover:border-synapse-brand-500/20",
                        )}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span>{s.icon}</span>
                          <span className="text-sm font-medium">{s.label}</span>
                        </div>
                        <p className="ml-6 text-xs text-synapse-text-secondary">
                          {s.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-hover/50 p-3">
                  <p className="flex items-start gap-2 text-xs text-synapse-text-secondary">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-synapse-brand-400" />
                    The AI will extract topics, concepts, prerequisites, and
                    build a structured adaptive course from your material.
                  </p>
                </div>
              </>
            )}

            {step === "processing" && (
              <div className="py-8 text-center">
                <div className="relative mx-auto mb-6 h-20 w-20">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal" />
                  <div className="absolute inset-1 flex items-center justify-center rounded-xl bg-synapse-surface-secondary">
                    <Sparkles className="synapse-animate-float h-8 w-8 text-synapse-brand-400" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  AI is analyzing your material
                </h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-synapse-text-secondary">
                  Extracting topics, concepts, prerequisites, and building your
                  personalized course…
                </p>
                <div className="mx-auto max-w-xs space-y-3 text-left">
                  {[
                    { label: "Reading document structure", done: true },
                    { label: "Extracting key concepts", done: true },
                    { label: "Mapping prerequisites", done: false },
                    { label: "Generating learning path", done: false },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      {s.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-synapse-accent-emerald" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-synapse-text-muted" />
                      )}
                      <span
                        className={
                          s.done
                            ? "text-foreground"
                            : "text-synapse-text-tertiary"
                        }
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {step !== "processing" && (
            <div className="flex items-center justify-between border-t border-synapse-border-subtle p-5">
              <button
                type="button"
                onClick={
                  step === "configure" ? () => setStep("upload") : handleClose
                }
                className="px-4 py-2 text-sm text-synapse-text-secondary transition-colors hover:text-foreground"
              >
                {step === "configure" ? t("back") : t("cancel")}
              </button>
              <button
                type="button"
                onClick={
                  step === "upload" ? () => setStep("configure") : handleProceed
                }
                disabled={step === "upload" && !hasContent}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
                  step === "upload" && !hasContent
                    ? "cursor-not-allowed bg-synapse-surface-hover text-synapse-text-muted"
                    : "bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500 text-white hover:from-synapse-brand-500 hover:to-synapse-brand-400",
                )}
              >
                {step === "upload" ? t("continue") : "Generate Course"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
