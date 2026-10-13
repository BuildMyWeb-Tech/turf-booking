import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { store, formatINR, type BookingStatus } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import {
  Calendar, IndianRupee, Clock, TrendingUp, Activity, ArrowUpRight,
  ArrowRight, Users, MapPin, Star, CheckCircle, AlertCircle, Zap
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  Confirmed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Cancelled: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  Completed: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

const SPORT_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#7c3aed", "#dc2626"];

function Dashboard() {
  const bookings = useMemo(() => store.getBookings(), []);
  const turfs = useMemo(() => store.getTurfs(), []);

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  const totalRevenue = bookings.filter(b => b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => b.date === today && b.status !== "Cancelled").length;
  const activeSlots = bookings.filter(b => b.date === today && b.status === "Confirmed").reduce((s, b) => s + b.duration, 0);
  const pendingCount = bookings.filter(b => b.status === "Pending").length;
  const monthRevenue = bookings.filter(b => b.createdAt.startsWith(thisMonth) && b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);

  // 7-day revenue trend
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const rev = bookings.filter(b => b.date === iso && b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);
    const count = bookings.filter(b => b.date === iso && b.status !== "Cancelled").length;
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: iso,
      revenue: rev,
      bookings: count,
    };
  });

  // Sport distribution
  const sportData = (() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      const turf = turfs.find(t => t.id === b.turfId);
      if (turf) counts[turf.sport] = (counts[turf.sport] || 0) + 1;
    });
    return Object.entries(counts).map(([sport, value]) => ({ name: sport, value }));
  })();

  // Peak hours
  const hourCounts: Record<number, number> = {};
  bookings.forEach(b => {
    for (let i = 0; i < b.duration; i++) {
      const h = b.startHour + i;
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  });
  const peakData = Object.entries(hourCounts)
    .map(([h, c]) => ({ hour: `${h}:00`, bookings: c, fullHour: parseInt(h) }))
    .sort((a, b) => a.fullHour - b.fullHour);

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  const stats = [
    {
      label: "Total Revenue",
      value: formatINR(totalRevenue),
      icon: IndianRupee,
      change: "+12.4%",
      changePositive: true,
      sub: "All time",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "This Month",
      value: formatINR(monthRevenue),
      icon: TrendingUp,
      change: "+8.1%",
      changePositive: true,
      sub: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      change: `${pendingCount} pending`,
      changePositive: pendingCount === 0,
      sub: "All time",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Active Today",
      value: `${activeSlots}h`,
      icon: Clock,
      change: `${todayBookings} slots`,
      changePositive: true,
      sub: "Live activity",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {store.getUser()?.name?.split(" ")[0] || "Admin"}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Live · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </Badge>
          {pendingCount > 0 && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100">
              <Link to="/admin/bookings">
                <AlertCircle className="h-3.5 w-3.5" /> {pendingCount} pending
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/50 hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground truncate">{s.value}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs">
                      <ArrowUpRight className={`h-3 w-3 ${s.changePositive ? "text-green-500" : "text-yellow-500"}`} />
                      <span className={s.changePositive ? "text-green-600" : "text-yellow-600"}>{s.change}</span>
                      <span className="text-muted-foreground">· {s.sub}</span>
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                <TrendingUp className="h-3 w-3" /> +12.4%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.19 150)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.55 0.19 150)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => v > 0 ? `₹${v/1000}k` : "₹0"} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "white", fontSize: 12 }}
                  formatter={(v: number) => [formatINR(v), "Revenue"]}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.19 150)" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "oklch(0.55 0.19 150)", r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sport distribution pie */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-1">Sport Distribution</h3>
            <p className="text-xs text-muted-foreground mb-3">Bookings by sport type</p>
            {sportData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sportData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sportData.map((_, i) => (
                      <Cell key={i} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second charts row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Peak hours */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="font-semibold">Peak Booking Hours</h3>
            <p className="text-xs text-muted-foreground mb-3">Most-booked time slots</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={peakData} margin={{ top: 4, right: 4, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={1} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="bookings" fill="oklch(0.55 0.19 150)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Turf performance */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Turf Performance</h3>
                <p className="text-xs text-muted-foreground">Bookings per venue</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {turfs.slice(0, 5).map((t, idx) => {
                const count = bookings.filter(b => b.turfId === t.id && b.status !== "Cancelled").length;
                const max = Math.max(...turfs.map(x => bookings.filter(b => b.turfId === x.id && b.status !== "Cancelled").length));
                const pct = max > 0 ? (count / max) * 100 : 0;
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground truncate max-w-[60%]">{t.name}</span>
                      <span className="text-muted-foreground font-semibold">{count} bookings</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%`, opacity: 1 - idx * 0.12 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings table */}
      <Card className="mt-4 border-border/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent Bookings</h3>
              <p className="text-xs text-muted-foreground">Latest reservations across all venues</p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/bookings">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Venue</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(b => {
                  const cfg = STATUS_CONFIG[b.status];
                  return (
                    <tr key={b.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {b.customerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">{b.customerName}</div>
                            <div className="text-[11px] text-muted-foreground">{b.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-sm">{b.turfName}</td>
                      <td className="px-2 py-3 text-xs text-muted-foreground">
                        {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {b.status === "Confirmed" && <CheckCircle className="h-2.5 w-2.5" />}
                          {b.status === "Pending" && <AlertCircle className="h-2.5 w-2.5" />}
                          {b.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right font-semibold text-foreground">{formatINR(b.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
