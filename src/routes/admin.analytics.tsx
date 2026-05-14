import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { store, formatINR } from "@/lib/mock-data";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Trophy, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

const COLORS = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)","var(--color-chart-5)"];

function Analytics() {
  const bookings = useMemo(() => store.getBookings(), []);
  const turfs = useMemo(() => store.getTurfs(), []);

  // Monthly revenue (last 6 months — synthetic from existing + scaled)
  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const seed = 80000 + (i * 12000) + Math.round(Math.sin(i*1.3) * 15000);
    return { month: label, revenue: seed, bookings: 60 + i*8 };
  });

  // Bookings by turf
  const byTurf = turfs.map((t) => ({
    name: t.name.split(" ")[0],
    bookings: bookings.filter((b) => b.turfId === t.id && b.status !== "Cancelled").length,
    revenue: bookings.filter((b) => b.turfId === t.id && b.status !== "Cancelled").reduce((s,b) => s + b.total, 0),
  })).sort((a,b)=> b.revenue - a.revenue);

  // Sport split
  const sportSplit = Object.entries(
    bookings.filter((b) => b.status !== "Cancelled").reduce((acc: Record<string, number>, b) => {
      const t = turfs.find((x) => x.id === b.turfId);
      if (t) acc[t.sport] = (acc[t.sport] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const totalRev = monthly.reduce((s,m)=> s+m.revenue, 0);
  const topTurf = byTurf[0];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track performance, identify trends and make data-driven decisions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">6-mo revenue</span><TrendingUp className="h-4 w-4 text-success" /></div>
          <div className="mt-2 text-2xl font-bold">{formatINR(totalRev)}</div>
          <div className="mt-1 text-xs text-success">+18.2% YoY</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Top turf</span><Trophy className="h-4 w-4 text-warning" /></div>
          <div className="mt-2 text-lg font-bold">{topTurf?.name ?? "—"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{topTurf?.bookings ?? 0} bookings • {formatINR(topTurf?.revenue ?? 0)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Avg. monthly bookings</span><Calendar className="h-4 w-4 text-chart-2" /></div>
          <div className="mt-2 text-2xl font-bold">{Math.round(monthly.reduce((s,m)=>s+m.bookings,0)/monthly.length)}</div>
          <div className="mt-1 text-xs text-muted-foreground">across {turfs.length} turfs</div>
        </CardContent></Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="font-semibold">Monthly revenue</h3>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)" }} formatter={(v: number) => formatINR(v)} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold">Sport distribution</h3>
            <p className="text-xs text-muted-foreground">By bookings</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sportSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {sportSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <h3 className="font-semibold">Performance by turf</h3>
          <p className="text-xs text-muted-foreground">Bookings and revenue contribution</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byTurf}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="bookings" fill="var(--color-chart-2)" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="var(--color-primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
