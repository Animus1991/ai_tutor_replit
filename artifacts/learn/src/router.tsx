import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import {
  BetterSignInPage,
  BetterSignUpPage,
} from "@/components/auth/BetterAuthPages";
import { SignInRoute, SignUpRoute } from "@/components/auth/ClerkPages";
import AppLayout from "@/components/layout/AppLayout";
import { authProvider } from "@/lib/auth";
import { lazyPage } from "@/lib/lazyPage";

// Eager: small shell + auth entry points
import NotFoundPage from "@/pages/not-found";

// Lazy: heavy route chunks (code-split)
const LandingPage = lazyPage(() => import("@/pages/Landing"));
const OnboardingPage = lazyPage(() => import("@/pages/Onboarding"));
const StudyWorkspacePage = lazyPage(() => import("@/pages/StudyWorkspace"));
const LibraryPage = lazyPage(() => import("@/pages/Library"));
const NoteDetailPage = lazyPage(() => import("@/pages/NoteDetail"));
const CreateCoursePage = lazyPage(() => import("@/pages/CreateCourse"));
const CourseDetailPage = lazyPage(() => import("@/pages/CourseDetail"));
const LessonPlayerPage = lazyPage(() => import("@/pages/LessonPlayer"));
const TasksPage = lazyPage(() => import("@/pages/Tasks"));
const AgentPage = lazyPage(() => import("@/pages/Agent"));
const ProgressPage = lazyPage(() => import("@/pages/Progress"));
const AnalyticsPage = lazyPage(() => import("@/pages/Analytics"));
const SettingsPage = lazyPage(() => import("@/pages/Settings"));
const ErrorNotebookPage = lazyPage(() => import("@/pages/ErrorNotebook"));
const ExamPage = lazyPage(() => import("@/pages/Exam"));
const DemoPage = lazyPage(() => import("@/pages/Demo"));

const SignInComponent =
  authProvider === "better-auth" ? BetterSignInPage : SignInRoute;
const SignUpComponent =
  authProvider === "better-auth" ? BetterSignUpPage : SignUpRoute;

export interface RouterContext {
  queryClient: QueryClient;
  isSignedIn: boolean;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
  beforeLoad: ({ context }) => {
    if (context.isSignedIn) throw redirect({ to: "/progress" });
  },
});

const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in/$",
  component: SignInComponent,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-up/$",
  component: SignUpComponent,
});

const authedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authed-layout",
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  beforeLoad: ({ context, location }) => {
    if (!context.isSignedIn) {
      throw redirect({
        to: "/sign-in/$",
        search: { redirect: location.href },
      });
    }
  },
});

const libraryRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/library",
  component: LibraryPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/tasks",
  component: TasksPage,
});

const agentRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/agent",
  component: AgentPage,
});

const progressRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/progress",
  component: ProgressPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

const errorsRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/errors",
  component: ErrorNotebookPage,
});

const examRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/exam",
  component: ExamPage,
});

const noteDetailRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/notes/$id",
  component: NoteDetailPage,
  parseParams: (params) => ({ id: Number(params.id) }),
  stringifyParams: (params) => ({ id: String(params.id) }),
});

const createCourseRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/courses/new",
  component: CreateCoursePage,
});

const courseDetailRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/courses/$id",
  component: CourseDetailPage,
  parseParams: (params) => ({ id: Number(params.id) }),
  stringifyParams: (params) => ({ id: String(params.id) }),
});

const lessonPlayerRoute = createRoute({
  getParentRoute: () => authedLayoutRoute,
  path: "/courses/$id/play",
  component: LessonPlayerPage,
  parseParams: (params) => ({ id: Number(params.id) }),
  stringifyParams: (params) => ({ id: String(params.id) }),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
  beforeLoad: ({ context, location }) => {
    if (!context.isSignedIn) {
      throw redirect({
        to: "/sign-in/$",
        search: { redirect: location.href },
      });
    }
  },
});

const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workspace",
  component: StudyWorkspacePage,
  beforeLoad: ({ context, location }) => {
    if (!context.isSignedIn) {
      throw redirect({
        to: "/sign-in/$",
        search: { redirect: location.href },
      });
    }
  },
});

const legacyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    throw redirect({ to: "/progress" });
  },
});

const legacyNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notes",
  beforeLoad: () => {
    throw redirect({ to: "/library" });
  },
});

const legacyCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  beforeLoad: () => {
    throw redirect({ to: "/library" });
  },
});

const legacyProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: () => {
    throw redirect({ to: "/progress" });
  },
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  demoRoute,
  signInRoute,
  signUpRoute,
  onboardingRoute,
  workspaceRoute,
  authedLayoutRoute.addChildren([
    libraryRoute,
    tasksRoute,
    agentRoute,
    progressRoute,
    analyticsRoute,
    settingsRoute,
    errorsRoute,
    examRoute,
    noteDetailRoute,
    createCourseRoute,
    lessonPlayerRoute,
    courseDetailRoute,
  ]),
  legacyDashboardRoute,
  legacyNotesRoute,
  legacyCoursesRoute,
  legacyProfileRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
    isSignedIn: false,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
