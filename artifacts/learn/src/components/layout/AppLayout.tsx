import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { 
  BookOpen, 
  BrainCircuit, 
  LayoutDashboard, 
  Library, 
  LogOut, 
  Settings, 
  User 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  if (!user) return null;
  
  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.primaryEmailAddress?.emailAddress.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left outline-none focus-visible:ring-2 ring-primary">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile & Readiness</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="w-full flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Preferences</span>
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

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  
  // Don't show sidebar in the lesson player to maximize space
  const isLessonPlayer = location.startsWith("/courses/") && location !== "/courses/new";

  if (isLessonPlayer) {
    return <div className="min-h-screen bg-background text-foreground dark">{children}</div>;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Library, label: "My Notes", href: "/notes" },
    { icon: BookOpen, label: "Courses", href: "/courses" },
    { icon: BrainCircuit, label: "Learning Profile", href: "/profile" },
  ];

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground dark">
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3 select-none">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold leading-none tracking-tighter">LA</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">LearnAI</span>
          </Link>
        </div>
        
        <div className="px-4 py-2 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = location === item.href || location.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-border mt-auto">
          <UserMenu />
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 md:hidden sticky top-0 z-10 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <div className="h-7 w-7 rounded border border-primary/20 bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">LA</span>
            </div>
            <span className="font-semibold tracking-tight">LearnAI</span>
          </Link>
          <UserMenu />
        </header>
        
        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}