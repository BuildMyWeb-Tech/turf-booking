import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MapPin,
  CalendarRange,
  ClipboardList,
  TrendingUp,
  Trophy,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/turfs", label: "Turf Management", icon: MapPin },
  { to: "/admin/slots", label: "Slot Management", icon: CalendarRange },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp },
];

export function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold leading-none">Turfly</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/"
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
          <div className="flex items-center justify-between rounded-lg bg-sidebar-accent px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">{user?.email}</div>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-primary/20" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="border-b border-border bg-background px-6 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Turfly Admin</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Site</Link>
            </Button>
          </div>
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {items.map((it) => {
              const active = it.exact ? path === it.to : path.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
