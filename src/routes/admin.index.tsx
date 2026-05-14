import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store, formatINR, type BookingStatus } from "@/lib/mock-data";
import { useMemo } from "react";
import { Calendar, IndianRupee, Clock, TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const statusColor: Record<BookingStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Confirmed: "bg-primary/15 text-primary border-primary/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  Completed: "bg-muted text-muted-foreground border-border",
};

function Dashboard() {
  const bookings = useMemo(() => store.getBookings(), []);
  const turfs = useMemo(() => store.getTurfs(), []);

  const today = new Date().toISOString().slice(0, 10);

  const totalRevenue = bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((b) => b.date === today && b.status !== "Cancelled").length;
  const activeSlots = bookings.filter((b) => b.date === today && b.status === "Confirmed").reduce((s,b)=> s+b.duration, 0);

  // Weekly revenue trend (last 7 days)
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const rev = bookings.filter((b) => b.date === iso && b.status !== "Cancelled").reduce((s, b) => s + b.total, 0);
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue: rev };
  });

  // Peak booking hours
  const hourCounts: Record<number, number> = {};
  bookings.forEach((b) => { for (let i = 0; i < b.duration; i++) hourCounts[b.startHour + i] = (hourCounts[b.startHour + i] || 0) + 1; });
  const peakData = Object.entries(hourCounts).map(([h, c]) => ({ hour: `${h}:00`, bookings: c })).sort((a,b)=> parseInt(a.hour) - parseInt(b.hour));

  const recent = [...bookings].sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const stats = [
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: IndianRupee, change: "+12.4%", color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Bookings", value: totalBookings, icon: Calendar, change: "+8.1%", color: "text-chart-2", bg: "bg-chart-2/10" },
    { label: "Today's Bookings", value: todayBookings, icon: Activity, change: `${turfs.length} turfs`, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Active Slots Today", value: activeSlots + "h", icon: Clock, change: "Live", color: "text-chart-4", bg: "bg-chart-4/10" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here's what's happening with your turfs today.</p>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 hidden sm:flex">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="mt-2 text-2xl font-bold">{s.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="h-3 w-3 text-success" /> {s.change}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Revenue trend</h3>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <span className="text-xs font-medium text-success">+12.4% vs last week</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)" }} formatter={(v: number) => formatINR(v)} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold">Peak hours</h3>
            <p className="text-xs text-muted-foreground">Most-booked time slots</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={peakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="bookings" fill="var(--color-primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <h3 className="mb-4 font-semibold">Recent bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-medium">Customer</th>
                  <th className="px-2 py-2 text-left font-medium">Turf</th>
                  <th className="px-2 py-2 text-left font-medium">Date</th>
                  <th className="px-2 py-2 text-left font-medium">Status</th>
                  <th className="px-2 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-2 py-3">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground">{b.customerEmail}</div>
                    </td>
                    <td className="px-2 py-3">{b.turfName}</td>
                    <td className="px-2 py-3 text-muted-foreground">{new Date(b.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</td>
                    <td className="px-2 py-3"><Badge variant="outline" className={statusColor[b.status]}>{b.status}</Badge></td>
                    <td className="px-2 py-3 text-right font-semibold">{formatINR(b.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
