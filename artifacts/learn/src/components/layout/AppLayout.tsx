import { LanguageToggle } from "@/components/LanguageToggle";
import { UploadModal } from "@/components/UploadModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@/lib/auth";
import { initLocaleFromProfile, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@/lib/wouter-compat";
import { useGetProfile, useGetTaskCount } from "@workspace/api-client-react";
import {
  BarChart3,
  Bot,
  CheckSquare,
  Layout as LayoutIcon,
  Library,
  LogOut,
  Settings,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  if (!user) return null;
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.primaryEmailAddress?.emailAddress.substring(0, 2).toUpperCase() ||
        "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left outline-none focus-visible:ring-2 ring-primary">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 hidden lg:block">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="w-full flex items-center cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("nav.settings")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/onboarding"
            className="w-full flex items-center cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span>{t("nav.onboarding")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const MOBILE_NAV_COUNT = 5;

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: taskCountData } = useGetTaskCount();
  const { data: profile } = useGetProfile();
  const overdueCount =
    (taskCountData as { count?: number } | undefined)?.count ?? 0;

  useEffect(() => {
    const lang = (profile as { preferredLanguage?: string } | undefined)
      ?.preferredLanguage;
    if (lang) initLocaleFromProfile(lang);
  }, [profile]);

  const isLessonPlayer = /^\/courses\/\d+\/play/.test(location);
  if (isLessonPlayer) {
    return (
      <div className="min-h-screen bg-background text-foreground dark">
        {children}
      </div>
    );
  }

  const navItems = [
    { icon: TrendingUp, label: t("nav.progress"), href: "/progress", badge: 0 },
    {
      icon: BarChart3,
      label: t("nav.analytics"),
      href: "/analytics",
      badge: 0,
    },
    {
      icon: LayoutIcon,
      label: t("nav.workspace"),
      href: "/workspace",
      badge: 0,
    },
    { icon: Library, label: t("nav.library"), href: "/library", badge: 0 },
    {
      icon: CheckSquare,
      label: t("nav.tasks"),
      href: "/tasks",
      badge: overdueCount,
    },
    { icon: Bot, label: t("nav.agent"), href: "/agent", badge: 0 },
    { icon: Settings, label: t("nav.settings"), href: "/settings", badge: 0 },
  ];

  const mobileNavItems = navItems.slice(0, MOBILE_NAV_COUNT);

  function isActive(href: string) {
    return location === href || location.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground dark">
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6">
          <Link
            href="/progress"
            className="flex items-center gap-3 select-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Synapse
            </span>
          </Link>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-primary")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-amber-500 text-[11px] font-bold text-black flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500 text-white font-medium text-sm hover:from-synapse-brand-500 hover:to-synapse-brand-400 transition-all"
          >
            <Upload className="h-4 w-4" />
            {t("lib.upload")}
          </button>
        </div>
        <div className="p-4 border-t border-border mt-auto space-y-3">
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
          <UserMenu />
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center px-4 md:hidden sticky top-0 z-10 justify-between">
          <Link href="/progress" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold">Synapse</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground"
              aria-label={t("lib.upload")}
            >
              <Upload className="h-5 w-5" />
            </button>
            <LanguageToggle />
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 synapse-glass border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[56px]",
                  active ? "text-synapse-brand-400" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate max-w-[56px]">
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="absolute top-1 right-2 min-w-[1rem] h-4 px-1 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
