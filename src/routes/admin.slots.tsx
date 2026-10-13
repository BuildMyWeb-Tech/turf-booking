import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, isSlotBooked, formatHour, getSportIcon, type Booking } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Wrench, CheckCircle, Users, Clock, Calendar, Info, X, LockOpen } from "lucide-react";

export const Route = createFileRoute("/admin/slots")({
  component: SlotManagement,
});

function todayPlus(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function SlotManagement() {
  const turfs = useMemo(() => store.getTurfs(), []);
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [turfId, setTurfId] = useState(turfs[0]?.id ?? "");
  const [hoveredSlot, setHoveredSlot] = useState<{ date: string; hour: number } | null>(null);

  const turf = turfs.find(t => t.id === turfId);
  const days = Array.from({ length: 7 }).map((_, i) => todayPlus(i));

  const toggleBlock = (date: string, hour: number) => {
    if (!turf) return;
    const existing = isSlotBooked(bookings, turf.id, date, hour);

    if (existing) {
      if (existing.customerName === "Maintenance Block") {
        const next = bookings.filter(b => b.id !== existing.id);
        setBookings(next);
        store.saveBookings(next);
        toast.success("Maintenance block removed");
      } else {
        toast.error("This slot has a customer booking — cancel it in Bookings");
      }
      return;
    }

    const block: Booking = {
      id: "blk" + Date.now(),
      turfId: turf.id,
      turfName: turf.name,
      customerEmail: "system@turfly.app",
      customerName: "Maintenance Block",
      date,
      startHour: hour,
      duration: 1,
      total: 0,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };
    const next = [block, ...bookings];
    setBookings(next);
    store.saveBookings(next);
    toast.success(`Slot blocked: ${formatHour(hour)} on ${fmtDate(date)}`);
  };

  const blockEntireDay = (date: string) => {
    if (!turf) return;
    const newBlocks: Booking[] = [];
    for (let h = turf.openHour; h < turf.closeHour; h++) {
      if (!isSlotBooked(bookings, turf.id, date, h)) {
        newBlocks.push({
          id: "blk" + Date.now() + h,
          turfId: turf.id,
          turfName: turf.name,
          customerEmail: "system@turfly.app",
          customerName: "Maintenance Block",
          date,
          startHour: h,
          duration: 1,
          total: 0,
          status: "Confirmed",
          createdAt: new Date().toISOString(),
        });
      }
    }
    if (newBlocks.length === 0) { toast.error("All slots already have bookings"); return; }
    const next = [...newBlocks, ...bookings];
    setBookings(next);
    store.saveBookings(next);
    toast.success(`${newBlocks.length} slots blocked for ${fmtDate(date)}`);
  };

  const unblockAll = (date: string) => {
    const next = bookings.filter(b => !(b.turfId === turf?.id && b.date === date && b.customerName === "Maintenance Block"));
    setBookings(next);
    store.saveBookings(next);
    toast.success(`All maintenance blocks cleared for ${fmtDate(date)}`);
  };

  if (!turf) return <div className="p-6 text-muted-foreground">No turfs available.</div>;

  const hours: number[] = [];
  for (let h = turf.openHour; h < turf.closeHour; h++) hours.push(h);

  const getSlotInfo = (date: string, hour: number) => {
    const bkg = isSlotBooked(bookings, turf.id, date, hour);
    if (!bkg) return { type: "available" as const };
    if (bkg.customerName === "Maintenance Block") return { type: "maintenance" as const, booking: bkg };
    return { type: "booked" as const, booking: bkg };
  };

  const getDayStats = (date: string) => {
    const dayBkgs = bookings.filter(b => b.turfId === turf.id && b.date === date);
    const available = hours.filter(h => !isSlotBooked(bookings, turf.id, date, h)).length;
    const booked = dayBkgs.filter(b => b.customerName !== "Maintenance Block" && b.status !== "Cancelled").length;
    const maintenance = dayBkgs.filter(b => b.customerName === "Maintenance Block").length;
    return { available, booked, maintenance };
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Slot Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">View bookings and block slots for maintenance</p>
        </div>
      </div>

      {/* Turf selector */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Venue</label>
        <div className="flex flex-wrap gap-2">
          {turfs.map(t => (
            <button
              key={t.id}
              onClick={() => setTurfId(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                turfId === t.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <span>{getSportIcon(t.sport)}</span>
              <span>{t.name.split(" ").slice(0, 2).join(" ")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 font-medium text-muted-foreground">Legend:</div>
        {[
          { color: "bg-green-100 border-green-300 text-green-700", label: "Available" },
          { color: "bg-blue-100 border-blue-300 text-blue-700", label: "Customer Booking" },
          { color: "bg-orange-100 border-orange-300 text-orange-700", label: "Maintenance" },
        ].map(({ color, label }) => (
          <span key={label} className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${color}`}>
            <span className={`h-2 w-2 rounded-sm ${color.replace("border-", "bg-").split(" ")[0]}`} />
            {label}
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-2">· Click a slot to toggle maintenance block</span>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-8 gap-1.5">
            <div className="flex items-center text-xs font-semibold text-muted-foreground px-2">Time</div>
            {days.map(d => {
              const stats = getDayStats(d);
              const isToday = d === todayPlus(0);
              return (
                <div key={d} className="text-center">
                  <div className={`rounded-xl p-2 ${isToday ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border/50"}`}>
                    <div className={`text-xs font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {fmtDate(d).split(",")[0]}
                      {isToday && <span className="ml-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">Today</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{fmtDate(d).split(",").slice(1).join("")}</div>
                    <div className="mt-1 flex justify-center gap-1 text-[10px]">
                      <span className="text-green-600">{stats.available}a</span>
                      <span className="text-blue-600">{stats.booked}b</span>
                      {stats.maintenance > 0 && <span className="text-orange-600">{stats.maintenance}m</span>}
                    </div>
                  </div>
                  <div className="mt-1 flex justify-center gap-1">
                    <button
                      onClick={() => blockEntireDay(d)}
                      className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      title="Block all slots"
                    >
                      Block all
                    </button>
                    <button
                      onClick={() => unblockAll(d)}
                      className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-colors"
                      title="Clear maintenance"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slot rows */}
          <div className="space-y-1">
            {hours.map(h => (
              <div key={h} className="grid grid-cols-8 gap-1.5 items-center">
                <div className="px-2 text-xs font-medium text-muted-foreground text-right">{formatHour(h)}</div>
                {days.map(d => {
                  const info = getSlotInfo(d, h);
                  const isHovered = hoveredSlot?.date === d && hoveredSlot?.hour === h;

                  return (
                    <button
                      key={d}
                      onClick={() => toggleBlock(d, h)}
                      onMouseEnter={() => setHoveredSlot({ date: d, hour: h })}
                      onMouseLeave={() => setHoveredSlot(null)}
                      className={`group relative h-10 w-full rounded-lg border text-xs font-medium transition-all ${
                        info.type === "available"
                          ? "border-green-200 bg-green-50 text-green-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                          : info.type === "booked"
                          ? "cursor-not-allowed border-blue-200 bg-blue-50 text-blue-600"
                          : "border-orange-200 bg-orange-50 text-orange-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                      }`}
                      title={
                        info.type === "booked"
                          ? `Booked: ${info.booking?.customerName}`
                          : info.type === "maintenance"
                          ? "Click to unblock"
                          : "Click to block for maintenance"
                      }
                    >
                      {info.type === "available" && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Wrench className="mx-auto h-3.5 w-3.5" />
                        </span>
                      )}
                      {info.type === "available" && (
                        <span className="group-hover:hidden text-[10px]">Free</span>
                      )}
                      {info.type === "booked" && (
                        <div className="flex flex-col items-center leading-none">
                          <Users className="h-3 w-3" />
                          <span className="text-[9px] mt-0.5 max-w-full truncate px-1">
                            {info.booking?.customerName?.split(" ")[0]}
                          </span>
                        </div>
                      )}
                      {info.type === "maintenance" && (
                        <div className="flex flex-col items-center leading-none group-hover:hidden">
                          <Wrench className="h-3 w-3" />
                          <span className="text-[9px] mt-0.5">Maint.</span>
                        </div>
                      )}
                      {info.type === "maintenance" && (
                        <span className="hidden group-hover:block">
                          <LockOpen className="mx-auto h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card className="mt-5 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">Weekly Summary for {turf.name}</h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {days.map(d => {
              const stats = getDayStats(d);
              const occupancy = hours.length > 0 ? Math.round(((stats.booked + stats.maintenance) / hours.length) * 100) : 0;
              return (
                <div key={d} className="text-center rounded-lg bg-muted/30 p-2">
                  <div className="text-[11px] font-medium text-foreground">{fmtDate(d).split(",")[0]}</div>
                  <div className="text-xl font-bold text-primary mt-1">{occupancy}%</div>
                  <div className="text-[10px] text-muted-foreground">occupied</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
