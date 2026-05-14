import { Link, useRouterState } from "@tanstack/react-router";
import { Trophy, Calendar, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        path === to ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Turfly</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {link("/", "Home")}
          {link("/turfs", "Browse Turfs")}
          {user && link("/my-bookings", "My Bookings")}
        </nav>

        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
          {user ? (
            <>
              <div className="hidden text-right text-xs sm:block">
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground">{user.role}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-semibold">Turfly</span>
            <span className="text-sm text-muted-foreground">— book your game in seconds</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> 24/7 booking</span>
            <span>© {new Date().getFullYear()} Turfly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
