import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, formatINR, formatDate, formatHour, type Booking, type BookingStatus } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import {
  Search, Check, X, Calendar, Clock, IndianRupee, Filter,
  CheckCircle, AlertCircle, Users, Download, Eye
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingMgmt,
});

const STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; border: string; label: string }> = {
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Pending" },
  Confirmed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Confirmed" },
  Cancelled: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: "Cancelled" },
  Completed: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", label: "Completed" },
};

function BookingMgmt() {
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;
      if (q && !`${b.customerName} ${b.customerEmail} ${b.turfName} ${b.id}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, q, statusFilter, dateFilter]);

  const setStatus = (id: string, status: BookingStatus) => {
    const next = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(next);
    store.saveBookings(next);
    toast.success(`Booking ${status.toLowerCase()}`);
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    confirmed: bookings.filter(b => b.status === "Confirmed").length,
    revenue: bookings.filter(b => b.status !== "Cancelled").reduce((s, b) => s + b.total, 0),
  }), [bookings]);

  const exportCSV = () => {
    const rows = ["ID,Customer,Email,Venue,Date,Time,Duration,Total,Status"];
    filtered.forEach(b => {
      rows.push(`${b.id},${b.customerName},${b.customerEmail},${b.turfName},${b.date},${formatHour(b.startHour)},${b.duration}h,${b.total},${b.status}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bookings.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Approve, cancel and review all customer bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 self-start sm:self-auto">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: stats.pending, icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Revenue", value: formatINR(stats.revenue), icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4.5 w-4.5 ${color}`} />
              </div>
              <div>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-4 border-border/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customer, venue, ID…" className="pl-8 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-40 h-9 text-sm"
            />
            {(q || statusFilter !== "all" || dateFilter) && (
              <Button variant="ghost" size="sm" onClick={() => { setQ(""); setStatusFilter("all"); setDateFilter(""); }} className="gap-1 h-9">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length} results</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {["Booking ID", "Customer", "Venue", "Date & Time", "Duration", "Status", "Amount", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const cfg = STATUS_CONFIG[b.status];
                  return (
                    <tr key={b.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                          #{b.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-sm font-medium">{b.turfName}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                        <div className="text-xs text-muted-foreground">{formatHour(b.startHour)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{b.duration}h</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {b.status === "Confirmed" && <CheckCircle className="h-2.5 w-2.5" />}
                          {b.status === "Pending" && <AlertCircle className="h-2.5 w-2.5" />}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatINR(b.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {b.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => setStatus(b.id, "Confirmed")}
                                className="h-7 gap-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStatus(b.id, "Cancelled")}
                                className="h-7 gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {b.status === "Confirmed" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setStatus(b.id, "Completed")}
                                className="h-7 gap-1 border-primary/30 text-primary hover:bg-primary/8 text-xs"
                              >
                                <CheckCircle className="h-3 w-3" /> Done
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStatus(b.id, "Cancelled")}
                                className="h-7 gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {(b.status === "Completed" || b.status === "Cancelled") && (
                            <span className="text-xs text-muted-foreground px-2">{b.status}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-semibold text-foreground">No bookings found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
