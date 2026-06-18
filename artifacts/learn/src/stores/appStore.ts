import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "en" | "el";
export type AppTheme = "dark" | "light";
export type CurriculumLens = "theory" | "practice";

interface AppState {
  language: AppLanguage;
  theme: AppTheme;
  curriculumLens: CurriculumLens;
  sidebarCollapsed: boolean;
  setLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setCurriculumLens: (lens: CurriculumLens) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en",
      theme: "dark",
      curriculumLens: "theory",
      sidebarCollapsed: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setCurriculumLens: (curriculumLens) => set({ curriculumLens }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "ai-tutor-app-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        curriculumLens: state.curriculumLens,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
