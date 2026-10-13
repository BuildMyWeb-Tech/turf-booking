import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { store, formatINR, formatDate, formatHour, type Booking, type BookingStatus } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import {
  Calendar, MapPin, Clock, X, CheckCircle2, AlertCircle, RotateCcw,
  Trophy, ArrowRight, Receipt, Search, IndianRupee, CreditCard,
  Timer, Ban, BadgeCheck, Sparkles
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookings,
  head: () => ({ meta: [{ title: "My Bookings — Turfly" }] }),
});

type TabType = "upcoming" | "past" | "all";

const STATUS: Record<BookingStatus, {
  label: string; icon: typeof CheckCircle2;
  badge: string; dot: string; accent: string;
}> = {
  Confirmed: {
    label: "Confirmed", icon: BadgeCheck,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500", accent: "border-l-emerald-500",
  },
  Pending: {
    label: "Pending", icon: Timer,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400", accent: "border-l-amber-400",
  },
  Completed: {
    label: "Completed", icon: CheckCircle2,
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400", accent: "border-l-slate-300",
  },
  Cancelled: {
    label: "Cancelled", icon: Ban,
    badge: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400", accent: "border-l-red-400",
  },
};

function MyBookings() {
  const { user } = useAuth();
  const turfs = useMemo(() => store.getTurfs(), []);
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [tab, setTab] = useState<TabType>("upcoming");
  const [search, setSearch] = useState("");

  const mine = useMemo(() => {
    if (!user) return [];
    return bookings
      .filter(b => b.customerEmail === user.email)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, user]);

  const filtered = useMemo(() => {
    let r = mine;
    if (tab === "upcoming") r = r.filter(b => b.status === "Confirmed" || b.status === "Pending");
    else if (tab === "past") r = r.filter(b => b.status === "Completed" || b.status === "Cancelled");
    if (search) r = r.filter(b => b.turfName.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [mine, tab, search]);

  const cancel = (id: string) => {
    const next = bookings.map(b => b.id === id ? { ...b, status: "Cancelled" as BookingStatus } : b);
    setBookings(next);
    store.saveBookings(next);
    toast.success("Booking cancelled");
  };

  if (!user) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Your bookings</h1>
          <p className="mt-2 text-muted-foreground">Sign in to view and manage your upcoming games.</p>
          <Button asChild size="lg" className="mt-6 gap-2">
            <Link to="/login"><ArrowRight className="h-4 w-4" /> Sign in to continue</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const upcoming = mine.filter(b => b.status === "Confirmed" || b.status === "Pending");
  const totalSpent = mine.filter(b => b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);
  const completed = mine.filter(b => b.status === "Completed").length;

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "History", count: mine.filter(b => b.status === "Completed" || b.status === "Cancelled").length },
    { id: "all", label: "All bookings", count: mine.length },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">

          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  <Sparkles className="inline h-3.5 w-3.5 mr-1" />My Account
                </p>
                <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  {user.name} · {mine.length} total session{mine.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button asChild size="sm" className="shrink-0 gap-1.5 mt-1">
                <Link to="/turfs"><MapPin className="h-3.5 w-3.5" /> Book a turf</Link>
              </Button>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total sessions", value: mine.length, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
              { label: "Total spent", value: formatINR(totalSpent), icon: IndianRupee, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Loyalty pts", value: `${user.loyaltyPoints ?? 0} pts`, icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="border-border/50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <div className="text-lg font-bold leading-tight">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Tabs + search ── */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    tab === t.id ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{t.count}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search venue…"
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* ── Booking cards ── */}
          {filtered.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-muted/10">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Calendar className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {tab === "upcoming" ? "No upcoming bookings" : "No bookings found"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tab === "upcoming" ? "Book a turf and get on the field!" : "Try a different filter"}
                </p>
                {tab === "upcoming" && (
                  <Button asChild size="sm" className="mt-5 gap-1.5">
                    <Link to="/turfs"><MapPin className="h-4 w-4" /> Browse turfs</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(b => {
                const turf = turfs.find(t => t.id === b.turfId);
                return (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    turfImage={turf?.images?.[0] || turf?.image}
                    onCancel={() => cancel(b.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

function BookingCard({
  booking: b,
  turfImage,
  onCancel,
}: {
  booking: Booking;
  turfImage?: string;
  onCancel: () => void;
}) {
  const cfg = STATUS[b.status];
  const StatusIcon = cfg.icon;
  const canCancel = b.status === "Confirmed" || b.status === "Pending";

  return (
    <Card className={`overflow-hidden border border-border/60 border-l-4 ${cfg.accent} transition-all hover:shadow-md`}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Turf image */}
          {turfImage && (
            <div className="relative hidden sm:block w-28 shrink-0">
              <img
                src={turfImage}
                alt={b.turfName}
                className="h-full w-full object-cover"
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            </div>
          )}

          {/* Content */}
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              {/* Top row: name + status */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground text-base leading-tight">{b.turfName}</h3>
                <Badge variant="outline" className={`text-xs gap-1 font-medium ${cfg.badge}`}>
                  <StatusIcon className="h-3 w-3" />
                  {cfg.label}
                </Badge>
                {b.discount && b.discount > 0 && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Saved {formatINR(b.discount)}
                  </Badge>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary/70" />
                  {formatDate(b.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary/70" />
                  {formatHour(b.startHour)} · {b.duration}hr
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Receipt className="h-3.5 w-3.5 text-primary/70" />
                  #{b.id.slice(-6).toUpperCase()}
                </span>
                {b.paymentId && (
                  <span className="flex items-center gap-1.5 text-xs">
                    <CreditCard className="h-3.5 w-3.5 text-primary/70" />
                    {b.paymentId.slice(0, 14)}…
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-xs text-muted-foreground/70">
                Booked {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            {/* Right: amount + actions */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-3">
              <div className="text-right">
                <div className="text-xl font-bold tabular-nums">{formatINR(b.total)}</div>
                {b.discount && b.discount > 0 && (
                  <div className="text-xs text-muted-foreground line-through">{formatINR(b.total + b.discount)}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    className="h-8 gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                )}
                {b.status === "Completed" && (
                  <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-xs border-primary/30 text-primary hover:bg-primary/8">
                    <Link to={`/turfs/${b.turfId}` as never}>
                      <RotateCcw className="h-3.5 w-3.5" /> Rebook
                    </Link>
                  </Button>
                )}
                {b.status === "Pending" && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" /> Awaiting
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
