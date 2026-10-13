import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Trophy, Calendar, LogOut, LayoutDashboard, Menu, X, Bell,
  User, ChevronDown, Home, MapPin, BookOpen, Settings,
  Heart, Phone, Mail, Twitter, Instagram, Youtube, Shield
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { store, timeAgo } from "@/lib/mock-data";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicNav() {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() =>
    user ? store.getNotifications(user.email) : []
  );
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) setNotifications(store.getNotifications(user.email));
  }, [user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = () => {
    if (user) {
      store.markNotificationsRead(user.email);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/turfs", label: "Browse Turfs", icon: MapPin },
    ...(user ? [{ to: "/my-bookings", label: "My Bookings", icon: BookOpen }] : []),
  ];

  const notifColors = {
    booking: "bg-green-100 text-green-600",
    reminder: "bg-blue-100 text-blue-600",
    promo: "bg-orange-100 text-orange-600",
    system: "bg-gray-100 text-gray-600",
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:shadow-elevated transition-all duration-200">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-foreground">Turfly</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase hidden sm:block">Sports Booking</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  path === to
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {label}
                {path === to && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markRead(); }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background hover:bg-muted/60 transition-colors"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground pulse-green">
                      {unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-white shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <span className="font-semibold text-sm">Notifications</span>
                      <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <Link
                            key={n.id}
                            to={n.link || "/"}
                            onClick={() => setNotifOpen(false)}
                            className={`flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0 ${!n.read ? "bg-primary/3" : ""}`}
                          >
                            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${notifColors[n.type]}`}>
                              {n.type === "booking" ? "📅" : n.type === "reminder" ? "⏰" : n.type === "promo" ? "🎁" : "🔔"}
                            </span>
                            <div className="min-w-0">
                              <div className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</div>
                              <div className="text-[11px] text-muted-foreground/70 mt-1">{timeAgo(n.createdAt)}</div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin badge */}
            {user?.role === "admin" && (
              <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-1.5 border-primary/30 text-primary hover:bg-primary/8">
                <Link to="/admin">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin
                </Link>
              </Button>
            )}

            {/* User menu or sign in */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 hover:bg-muted/60 transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {getInitials(user.name)}
                    </div>
                    <div className="hidden text-left sm:block">
                      <div className="text-xs font-semibold text-foreground leading-tight">{user.name.split(" ")[0]}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{user.role}</div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    {(user.loyaltyPoints ?? 0) > 0 && (
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        🏆 {user.loyaltyPoints} points
                      </div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="h-4 w-4" /> My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/turfs" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" /> Favorites
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                          <LayoutDashboard className="h-4 w-4" /> Admin Console
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="gap-1.5 shadow-sm">
                <Link to="/login">
                  <User className="h-3.5 w-3.5" />
                  Sign In
                </Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 md:hidden hover:bg-muted/60 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-border bg-white/95 backdrop-blur-xl md:hidden">
            <nav className="container mx-auto flex flex-col gap-0.5 px-4 py-3">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    path === to ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/8 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin Console
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Click outside to close notifications */}
      {notifOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      )}
    </>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: "Browse Turfs", to: "/turfs" },
      { label: "My Bookings", to: "/my-bookings" },
      { label: "Sign In", to: "/login" },
    ],
    Sports: [
      { label: "Football", to: "/turfs" },
      { label: "Cricket", to: "/turfs" },
      { label: "Badminton", to: "/turfs" },
      { label: "Tennis", to: "/turfs" },
      { label: "Basketball", to: "/turfs" },
    ],
    Support: [
      { label: "Help Center", to: "/" },
      { label: "Contact Us", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms of Service", to: "/" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Trophy className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold">Turfly</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The fastest way to book your favourite sports venue. Real-time availability, instant confirmation.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> support@turfly.in</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +91 80 4567 8901</div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            © {currentYear} Turfly. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              All systems operational
            </span>
            <span>·</span>
            <span>24/7 booking support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
