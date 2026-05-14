import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, formatINR, type Booking, type BookingStatus } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Search, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingMgmt,
});

const statusColor: Record<BookingStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Confirmed: "bg-primary/15 text-primary border-primary/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  Completed: "bg-muted text-muted-foreground border-border",
};

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); }
function fmtHour(h: number) { const a=h>=12?"PM":"AM"; const x=h%12===0?12:h%12; return `${x}:00 ${a}`; }

function BookingMgmt() {
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (q && !`${b.customerName} ${b.customerEmail} ${b.turfName}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
  }, [bookings, q, statusFilter]);

  const setStatus = (id: string, status: BookingStatus) => {
    const next = bookings.map((b) => b.id === id ? { ...b, status } : b);
    setBookings(next); store.saveBookings(next);
    toast.success(`Booking ${status.toLowerCase()}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Approve, cancel and review all customer bookings.</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search customer, email or turf…" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-medium">Customer</th>
                  <th className="px-2 py-2 text-left font-medium">Turf</th>
                  <th className="px-2 py-2 text-left font-medium">Date & Time</th>
                  <th className="px-2 py-2 text-left font-medium">Status</th>
                  <th className="px-2 py-2 text-right font-medium">Amount</th>
                  <th className="px-2 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-2 py-3">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground">{b.customerEmail}</div>
                    </td>
                    <td className="px-2 py-3">{b.turfName}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      <div>{fmtDate(b.date)}</div>
                      <div className="text-xs">{fmtHour(b.startHour)} • {b.duration}h</div>
                    </td>
                    <td className="px-2 py-3"><Badge variant="outline" className={statusColor[b.status]}>{b.status}</Badge></td>
                    <td className="px-2 py-3 text-right font-semibold">{formatINR(b.total)}</td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {b.status === "Pending" && (
                          <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "Confirmed")}>
                            <Check className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {b.status !== "Cancelled" && b.status !== "Completed" && (
                          <Button size="sm" variant="outline" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => setStatus(b.id, "Cancelled")}>
                            <X className="mr-1 h-3.5 w-3.5" /> Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
