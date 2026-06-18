import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initLocaleFromProfile, t } from "@/lib/i18n";
import {
  useCreateOpenaiConversation,
  useGetProfile,
  useListCourses,
} from "@workspace/api-client-react";
import { Bot, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const AGENT_MODES = [
  "socratic",
  "direct",
  "beginner",
  "exam_coach",
  "deep_theory",
  "practical",
  "error_diagnosis",
  "feynman",
  "math",
  "memory_coach",
] as const;

export default function AgentPage() {
  const { data: profile } = useGetProfile();
  const { data: courses } = useListCourses();
  const createConvo = useCreateOpenaiConversation();

  const [mode, setMode] = useState<string>("socratic");
  const [courseId, setCourseId] = useState<string>("none");
  const [convoId, setConvoId] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const p = profile as
    | { agentMode?: string; preferredLanguage?: string }
    | undefined;
  const courseList = courses as
    | Array<{ id: number; title: string }>
    | undefined;

  useEffect(() => {
    if (p?.preferredLanguage) initLocaleFromProfile(p.preferredLanguage);
    if (p?.agentMode) setMode(p.agentMode);
  }, [p?.agentMode, p?.preferredLanguage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ensureConversation() {
    if (convoId) return convoId;
    const c = await createConvo.mutateAsync({
      data: {
        title: "Agent Session",
        courseId: courseId !== "none" ? Number(courseId) : undefined,
      } as never,
    });
    const id = (c as { id: number }).id;
    setConvoId(id);
    return id;
  }

  async function handleSend() {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);
    let aiText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const id = await ensureConversation();
      const response = await fetch(`/api/openai/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: userMsg, mode }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data:"))) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.content) {
              aiText += event.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: aiText,
                };
                return updated;
              });
            }
          } catch {
            /* skip */
          }
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] max-h-[800px]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          {t("agent.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("agent.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENT_MODES.map((m) => (
              <SelectItem key={m} value={m}>
                {t(`agent.modes.${m}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Course context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No course context</SelectItem>
            {courseList?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 flex flex-col bg-card border-border min-h-0">
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-12">
                {t("agent.placeholder")}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] ${m.role === "user" ? "bg-primary/10" : "bg-white/5"}`}
                >
                  <ReactMarkdown>
                    {m.content ||
                      (isStreaming && i === messages.length - 1 ? "▋" : "")}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("agent.placeholder")}
              rows={2}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
