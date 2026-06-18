import { UploadModal } from "@/components/UploadModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import CoursesPage from "@/pages/Courses";
import NotesPage from "@/pages/Notes";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function LibraryPage() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("lib.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("lib.subtitle")}</p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500 hover:from-synapse-brand-500 hover:to-synapse-brand-400"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t("lib.upload")}
        </Button>
      </div>

      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources">{t("lib.tabs.sources")}</TabsTrigger>
          <TabsTrigger value="courses">{t("lib.tabs.courses")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sources" className="mt-6">
          <NotesPage embedded />
        </TabsContent>
        <TabsContent value="courses" className="mt-6">
          <CoursesPage embedded />
        </TabsContent>
      </Tabs>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
