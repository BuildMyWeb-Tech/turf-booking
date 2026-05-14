import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, isSlotBooked, type Booking } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Ban, Wrench } from "lucide-react";

export const Route = createFileRoute("/admin/slots")({
  component: SlotManagement,
});

function todayPlus(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); }
function fmtHour(h: number) { const a=h>=12?"PM":"AM"; const x=h%12===0?12:h%12; return `${x}:00 ${a}`; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" }); }

function SlotManagement() {
  const turfs = useMemo(() => store.getTurfs(), []);
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [turfId, setTurfId] = useState(turfs[0]?.id ?? "");
  const turf = turfs.find((t) => t.id === turfId);

  const days = Array.from({ length: 7 }).map((_, i) => todayPlus(i));

  const toggleBlock = (date: string, hour: number) => {
    if (!turf) return;
    const existing = isSlotBooked(bookings, turf.id, date, hour);
    if (existing) {
      // unblock if it was a maintenance block
      if (existing.customerName === "Maintenance Block") {
        const next = bookings.filter((b) => b.id !== existing.id);
        setBookings(next); store.saveBookings(next);
        toast.success("Slot unblocked");
      } else {
        toast.error("This slot has a real booking");
      }
      return;
    }
    const block: Booking = {
      id: "blk" + Date.now(),
      turfId: turf.id, turfName: turf.name,
      customerEmail: "system@turfly.app", customerName: "Maintenance Block",
      date, startHour: hour, duration: 1, total: 0, status: "Confirmed", createdAt: new Date().toISOString(),
    };
    const next = [block, ...bookings];
    setBookings(next); store.saveBookings(next);
    toast.success("Slot blocked for maintenance");
  };

  if (!turf) return <div className="p-6">No turfs available.</div>;

  const hours: number[] = [];
  for (let h = turf.openHour; h < turf.closeHour; h++) hours.push(h);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Slot Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visualize bookings and block slots for maintenance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Turf:</span>
          <Select value={turfId} onValueChange={setTurfId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>{turfs.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted border border-border" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Booked</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-warning" /> Maintenance</span>
            <span className="ml-auto text-muted-foreground">Click any free slot to block it for maintenance.</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
                <div className="p-2 text-xs font-semibold text-muted-foreground"></div>
                {days.map((d) => (
                  <div key={d} className="p-2 text-center text-xs font-semibold">{fmtDate(d)}</div>
                ))}
                {hours.map((h) => (
                  <>
                    <div key={`hr-${h}`} className="border-t border-border p-2 text-xs text-muted-foreground">{fmtHour(h)}</div>
                    {days.map((d) => {
                      const booking = isSlotBooked(bookings, turf.id, d, h);
                      const isMaint = booking?.customerName === "Maintenance Block";
                      return (
                        <button
                          key={`${d}-${h}`}
                          onClick={() => toggleBlock(d, h)}
                          className={`m-0.5 h-9 rounded border text-[10px] font-medium transition-all ${
                            isMaint
                              ? "border-warning/40 bg-warning text-warning-foreground"
                              : booking
                              ? "border-primary/40 bg-primary text-primary-foreground"
                              : "border-border bg-muted/30 hover:bg-accent hover:text-accent-foreground"
                          }`}
                          title={booking ? `${booking.customerName}` : "Available"}
                        >
                          {isMaint ? <Wrench className="mx-auto h-3 w-3" /> : booking ? booking.customerName.split(" ")[0] : ""}
                        </button>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const today = todayPlus(0);
              hours.forEach((h) => { if (!isSlotBooked(bookings, turf.id, today, h)) toggleBlock(today, h); });
            }}>
              <Ban className="mr-1.5 h-3.5 w-3.5" /> Mark today as maintenance day
            </Button>
            <Badge variant="outline" className="ml-auto">Slot duration options: 30 min · 1 hr · 2 hr</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
