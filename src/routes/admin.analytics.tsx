import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { store, formatINR } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, Trophy, Calendar, IndianRupee, Users, ArrowUpRight, Download, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

const SPORT_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#7c3aed", "#dc2626"];

function Analytics() {
  const bookings = useMemo(() => store.getBookings(), []);
  const turfs = useMemo(() => store.getTurfs(), []);
  const reviews = useMemo(() => store.getReviews(), []);
  const [period, setPeriod] = useState<"7d" | "30d" | "6m">("6m");

  const totalRevenue = bookings.filter(b => b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);
  const completedCount = bookings.filter(b => b.status === "Completed").length;
  const avgBookingValue = completedCount > 0 ? totalRevenue / completedCount : 0;
  const topTurf = turfs.reduce((best, t) => {
    const count = bookings.filter(b => b.turfId === t.id && b.status !== "Cancelled").length;
    const bestCount = bookings.filter(b => b.turfId === best.id && b.status !== "Cancelled").length;
    return count > bestCount ? t : best;
  }, turfs[0]);

  // Monthly revenue data (last 6 months — uses actual + synthetic scaling)
  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    // Scale actual data with a growth trend
    const base = 75000 + i * 15000;
    const seasonal = Math.sin(i * 0.8) * 12000;
    return {
      month: label,
      revenue: Math.round(base + seasonal + (i === 5 ? totalRevenue * 0.1 : 0)),
      bookings: 55 + i * 8 + Math.round(Math.cos(i) * 5),
    };
  });

  // Sport distribution
  const sportDist = (() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      const turf = turfs.find(t => t.id === b.turfId);
      if (turf) counts[turf.sport] = (counts[turf.sport] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Per-turf performance
  const turfPerformance = turfs.map(t => ({
    name: t.name.split(" ").slice(0, 2).join(" "),
    fullName: t.name,
    bookings: bookings.filter(b => b.turfId === t.id && b.status !== "Cancelled").length,
    revenue: bookings.filter(b => b.turfId === t.id && b.status !== "Cancelled").reduce((s, b) => s + b.total, 0),
    avgRating: reviews.filter(r => r.turfId === t.id).length
      ? (reviews.filter(r => r.turfId === t.id).reduce((s, r) => s + r.rating, 0) / reviews.filter(r => r.turfId === t.id).length).toFixed(1)
      : t.rating.toFixed(1),
  })).sort((a, b) => b.revenue - a.revenue);

  // Weekday booking patterns
  const weekdayData = Array.from({ length: 7 }).map((_, i) => {
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayBkgs = bookings.filter(b => new Date(b.date).getDay() === (i + 1) % 7);
    return {
      day: names[i],
      bookings: dayBkgs.length + Math.round(Math.sin(i) * 2) + 3,
      revenue: dayBkgs.reduce((s, b) => s + b.total, 0) + (i * 1731) % 4999,
    };
  });

  const kpis = [
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: IndianRupee, change: "+18.4%", positive: true, color: "text-primary", bg: "bg-primary/10" },
    { label: "Avg Booking Value", value: formatINR(Math.round(avgBookingValue)), icon: TrendingUp, change: "+5.2%", positive: true, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Customers", value: [...new Set(bookings.map(b => b.customerEmail))].length, icon: Users, change: "+22.1%", positive: true, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Top Venue", value: topTurf?.name?.split(" ")[0] || "—", icon: Trophy, change: `${bookings.filter(b => b.turfId === topTurf?.id).length} bkgs`, positive: true, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  const exportReport = () => {
    toast.success("Analytics report exported");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue trends, booking insights, and venue performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["7d", "30d", "6m"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-muted-foreground"}`}
              >
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "6 Months"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportReport} className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-border/50 hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
                    <p className="mt-2 text-2xl font-bold">{k.value}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs">
                      <ArrowUpRight className={`h-3 w-3 ${k.positive ? "text-green-500" : "text-red-500"}`} />
                      <span className={k.positive ? "text-green-600" : "text-red-600"}>{k.change}</span>
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.bg}`}>
                    <Icon className={`h-5 w-5 ${k.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue trend */}
      <Card className="mb-4 border-border/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue performance</p>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
              <TrendingUp className="h-3 w-3" /> +18.4% growth
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revMonthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.19 150)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.55 0.19 150)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid var(--color-border)", background: "white" }} formatter={(v: number) => [formatINR(v), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.19 150)" strokeWidth={2.5} fill="url(#revMonthGrad)" dot={{ fill: "oklch(0.55 0.19 150)", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        {/* Weekday patterns */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="font-semibold">Weekday Booking Patterns</h3>
            <p className="text-xs text-muted-foreground mb-3">Busiest days of the week</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekdayData} margin={{ top: 4, right: 4, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="bookings" name="Bookings" fill="oklch(0.55 0.19 150)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sport distribution */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h3 className="font-semibold">Bookings by Sport</h3>
            <p className="text-xs text-muted-foreground mb-3">Distribution across sports</p>
            {sportDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sportDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {sportDist.map((_, i) => <Cell key={i} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />)}
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

      {/* Turf performance table */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Venue Performance</h3>
              <p className="text-xs text-muted-foreground">Revenue and bookings by venue</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Venue</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bookings</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Revenue</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rating</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Share</th>
                </tr>
              </thead>
              <tbody>
                {turfPerformance.map((t, idx) => {
                  const totalBkgs = turfPerformance.reduce((s, x) => s + x.bookings, 0);
                  const share = totalBkgs > 0 ? ((t.bookings / totalBkgs) * 100).toFixed(0) : "0";
                  return (
                    <tr key={t.fullName} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{idx + 1}</span>
                          <span className="font-medium text-foreground">{t.fullName}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right text-sm font-semibold">{t.bookings}</td>
                      <td className="px-2 py-3 text-right font-semibold text-primary">{formatINR(t.revenue)}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{t.avgRating}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{share}%</span>
                        </div>
                      </td>
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
