import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { store, formatINR, type Booking, type BookingStatus } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookings,
  head: () => ({ meta: [{ title: "My Bookings — Turfly" }] }),
});

const statusColor: Record<BookingStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Confirmed: "bg-primary/15 text-primary border-primary/30",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  Completed: "bg-muted text-muted-foreground border-border",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function fmtHour(h: number) { const a=h>=12?"PM":"AM"; const x=h%12===0?12:h%12; return `${x}:00 ${a}`; }

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());

  const mine = useMemo(() => {
    if (!user) return [];
    return bookings.filter((b) => b.customerEmail === user.email).sort((a,b) => b.date.localeCompare(a.date));
  }, [bookings, user]);

  const cancel = (id: string) => {
    const next = bookings.map((b) => b.id === id ? { ...b, status: "Cancelled" as BookingStatus } : b);
    setBookings(next);
    store.saveBookings(next);
    toast.success("Booking cancelled");
  };

  if (!user) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Sign in to view your bookings</h1>
          <Button asChild className="mt-4"><Link to="/login">Sign in</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const upcoming = mine.filter((b) => b.status === "Confirmed" || b.status === "Pending");
  const past = mine.filter((b) => b.status === "Completed" || b.status === "Cancelled");

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your upcoming games and view your history.</p>

        <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 && (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No upcoming bookings. <Link to="/turfs" className="text-primary underline">Browse turfs</Link></CardContent></Card>
        )}
        <div className="grid gap-3">
          {upcoming.map((b) => <BookingCard key={b.id} b={b} onCancel={() => cancel(b.id)} />)}
        </div>

        <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">History ({past.length})</h2>
        <div className="grid gap-3">
          {past.map((b) => <BookingCard key={b.id} b={b} />)}
        </div>
      </div>
    </PublicLayout>
  );
}

function BookingCard({ b, onCancel }: { b: Booking; onCancel?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{b.turfName}</h3>
            <Badge variant="outline" className={statusColor[b.status]}>{b.status}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmtDate(b.date)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtHour(b.startHour)} • {b.duration}h</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Booking #{b.id.slice(-6)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold">{formatINR(b.total)}</div>
          </div>
          {onCancel && b.status !== "Cancelled" && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="mr-1 h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
