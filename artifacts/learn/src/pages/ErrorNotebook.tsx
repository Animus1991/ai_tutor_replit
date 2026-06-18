import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import { Link } from "@/lib/wouter-compat";
import { useGetErrorNotebook } from "@workspace/api-client-react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ErrorNotebookPage() {
  const { data, isLoading } = useGetErrorNotebook();

  const nb = data as
    | {
        open: Array<{
          id: number;
          courseId: number;
          stepId: number;
          stepTitle?: string | null;
          courseTitle?: string | null;
          conceptTitle?: string | null;
          question?: string | null;
          explanation?: string | null;
          createdAt: string;
        }>;
        resolved: Array<{
          id: number;
          courseId: number;
          stepId: number;
          stepTitle?: string | null;
          courseTitle?: string | null;
          conceptTitle?: string | null;
          question?: string | null;
          explanation?: string | null;
          resolvedAt?: string | null;
        }>;
        total: number;
      }
    | undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="h-8 w-8 text-amber-400" />
          {t("tasks.errorNotebook")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Every wrong first-attempt is recorded with its explanation — your
          personalised error diary.
        </p>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open ({nb?.open.length ?? 0})</TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({nb?.resolved.length ?? 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-4 space-y-3">
          {!nb?.open.length ? (
            <Card className="border-dashed border-border bg-transparent">
              <CardContent className="p-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                No open mistakes — great work!
              </CardContent>
            </Card>
          ) : (
            nb.open.map((m) => (
              <Card key={m.id} className="bg-card border-amber-500/20">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {m.courseTitle}
                      </p>
                      <h3 className="font-medium">
                        {m.question || m.stepTitle || "Quiz question"}
                      </h3>
                      {m.conceptTitle && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {m.conceptTitle}
                        </Badge>
                      )}
                    </div>
                    <Link href={`/courses/${m.courseId}/play?step=${m.stepId}`}>
                      <Button size="sm">{t("common.retry")}</Button>
                    </Link>
                  </div>
                  {m.explanation && (
                    <div className="text-sm bg-white/5 rounded-lg p-3 border-l-2 border-amber-500/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Why it matters
                      </p>
                      {m.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="resolved" className="mt-4 space-y-3">
          {nb?.resolved.map((m) => (
            <Card key={m.id} className="bg-card border-border opacity-80">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {m.question || m.stepTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.courseTitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
