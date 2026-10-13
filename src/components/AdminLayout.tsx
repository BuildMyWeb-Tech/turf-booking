import { Link, useRouterState, Outlet, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, MapPin, CalendarRange, ClipboardList, TrendingUp,
  Trophy, ArrowLeft, LogOut, Menu, X, ChevronRight,
  Shield, Mail, Lock, Eye, EyeOff, Loader2
} from "lucide-react";
import { useAuth, isAdminEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/mock-data";
import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, desc: "Overview & analytics" },
  { to: "/admin/turfs", label: "Turf Management", icon: MapPin, desc: "Add & edit venues" },
  { to: "/admin/slots", label: "Slot Calendar", icon: CalendarRange, desc: "Manage availability" },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList, desc: "All reservations" },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp, desc: "Revenue & trends" },
];

function AdminLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Invalid credentials");
      return;
    }
    if (!isAdminEmail(email)) {
      setError("Access denied. Admin privileges required.");
      return;
    }
    toast.success("Welcome to Admin Console!");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Turfly Admin</h1>
          <p className="mt-1 text-white/60">Sign in to access the admin console</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-emerald-300 font-medium">Admin access only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-medium">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-primary focus:bg-white/15"
                  placeholder="turfadmin@gmail.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-primary focus:bg-white/15"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-white/40 hover:text-white/80"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2 h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <><Shield className="h-4 w-4" /> Sign in to Admin</>
              )}
            </Button>
          </form>

          {/* Quick fill hint */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Admin Credentials</p>
            <button
              type="button"
              onClick={() => { setEmail("turfadmin@gmail.com"); setPassword("TurfAdmin@123"); }}
              className="w-full text-left rounded-lg px-3 py-2 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/80">Turf Admin</div>
                  <div className="text-xs text-white/40">turfadmin@gmail.com</div>
                </div>
                <span className="text-[10px] bg-white/10 text-white/50 px-2 py-1 rounded group-hover:bg-white/20">
                  Click to fill
                </span>
              </div>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Not an admin?{" "}
          <Link to="/" className="text-white/70 hover:text-white font-medium underline underline-offset-4">
            Go to main site
          </Link>
        </p>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingCount = useMemo(() => store.getBookings().filter(b => b.status === "Pending").length, []);
  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // Show admin login form if not authenticated as admin
  if (!user || user.role !== "admin") {
    return <AdminLoginForm />;
  }

  const NavItem = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const active = item.exact ? path === item.to : path.startsWith(item.to);
    const Icon = item.icon;
    return (
      <Link
        to={item.to}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
      >
        <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform ${active ? "" : "group-hover:scale-110"}`} />
        <span className="flex-1">{item.label}</span>
        {item.to === "/admin/bookings" && pendingCount > 0 && (
          <Badge className="h-5 min-w-5 justify-center rounded-full bg-yellow-400/20 text-yellow-300 border-yellow-400/30 text-[10px] px-1.5">
            {pendingCount}
          </Badge>
        )}
        {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Trophy className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold leading-none text-sidebar-foreground">Turfly</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-medium">Admin Console</div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <div className="mb-2 px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Navigation
        </div>
        {NAV_ITEMS.map(item => <NavItem key={item.to} item={item} />)}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </Link>

        {/* User info */}
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {user ? getInitials(user.name) : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name}</div>
            <div className="truncate text-[10px] text-sidebar-foreground/50">{user?.email}</div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:flex flex-col border-r border-sidebar-border sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden min-w-0">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/95 backdrop-blur-md px-4 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted/60 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-sm">Admin Console</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
            <Link to="/"><ArrowLeft className="h-3 w-3" />Site</Link>
          </Button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
