import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, isSlotBooked, formatINR, type Booking } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { MapPin, Star, Check, Clock, Calendar as CalIcon, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/turfs/$turfId")({
  component: TurfDetailPage,
});

function todayPlus(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatHour(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${ampm}`;
}

const REVIEWS = [
  { name: "Aditya R.", rating: 5, text: "Excellent surface and well-maintained facilities. Floodlights are top-notch." },
  { name: "Sneha K.", rating: 5, text: "Booking was seamless and the staff was super friendly. Highly recommend." },
  { name: "Manish P.", rating: 4, text: "Great spot for evening matches. Parking can get tight on weekends." },
];

function TurfDetailPage() {
  const { turfId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const turf = useMemo(() => store.getTurfs().find((t) => t.id === turfId), [turfId]);
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());

  const [date, setDate] = useState(todayPlus(0));
  const [duration, setDuration] = useState<number>(1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  if (!turf) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Turf not found</h1>
          <Button asChild className="mt-4"><Link to="/turfs">Browse all turfs</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const hours: number[] = [];
  for (let h = turf.openHour; h < turf.closeHour; h++) hours.push(h);

  const total = turf.pricePerHour * duration;

  const isSlotAvailable = (h: number) => {
    // Check that all hours within `duration` from h are free and within close.
    if (h + duration > turf.closeHour) return false;
    for (let i = 0; i < Math.ceil(duration); i++) {
      if (isSlotBooked(bookings, turf.id, date, h + i)) return false;
    }
    return true;
  };

  const handleBookClick = () => {
    if (!user) {
      toast.error("Please sign in to book", { description: "Use customer@test.com / password" });
      navigate({ to: "/login", search: { redirect: `/turfs/${turf.id}` } });
      return;
    }
    if (selectedHour == null) {
      toast.error("Pick a slot first");
      return;
    }
    setPayOpen(true);
  };

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1300));
    const newBooking: Booking = {
      id: "b" + Date.now(),
      turfId: turf.id,
      turfName: turf.name,
      customerEmail: user!.email,
      customerName: user!.name,
      date,
      startHour: selectedHour!,
      duration,
      total,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    store.saveBookings(updated);
    setPaying(false);
    setPayOpen(false);
    setSuccessOpen(true);
    setSelectedHour(null);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="overflow-hidden rounded-xl md:col-span-2">
            <img src={turf.image} alt={turf.name} className="h-72 w-full object-cover md:h-96" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            <img src={turf.image} alt="" className="h-36 w-full rounded-xl object-cover md:h-[11.5rem]" />
            <img src={turf.image} alt="" className="h-36 w-full rounded-xl object-cover md:h-[11.5rem]" />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <Badge variant="secondary">{turf.sport}</Badge>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">{turf.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {turf.location}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> {turf.rating} ({turf.reviews} reviews)</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatHour(turf.openHour)} – {formatHour(turf.closeHour)}</span>
            </div>

            <p className="mt-6 leading-relaxed text-foreground/80">{turf.description}</p>

            <h2 className="mt-10 text-lg font-semibold">Amenities</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {turf.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {a}
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-lg font-semibold">Reviews</h2>
            <div className="mt-3 space-y-3">
              {REVIEWS.map((r) => (
                <Card key={r.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{r.name}</div>
                      <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking panel */}
          <Card className="h-fit lg:sticky lg:top-20">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold">{formatINR(turf.pricePerHour)}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">Available</Badge>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0,1,2,3].map((n) => {
                    const d = todayPlus(n);
                    return (
                      <button
                        key={d}
                        onClick={() => { setDate(d); setSelectedHour(null); }}
                        className={`rounded-lg border p-2 text-center text-xs transition-colors ${date===d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                      >
                        <div className="font-semibold">{formatDateLabel(d).split(" ")[0]}</div>
                        <div className="mt-0.5 text-[11px] opacity-80">{formatDateLabel(d).split(" ").slice(1).join(" ")}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</label>
                <Select value={String(duration)} onValueChange={(v) => { setDuration(Number(v)); setSelectedHour(null); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available slots</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {hours.map((h) => {
                    const available = isSlotAvailable(h);
                    const selected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        disabled={!available}
                        onClick={() => setSelectedHour(h)}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : available
                            ? "border-border hover:border-primary hover:text-primary"
                            : "cursor-not-allowed border-border/50 bg-muted text-muted-foreground/50 line-through"
                        }`}
                      >
                        {formatHour(h)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Rate</span><span>{formatINR(turf.pricePerHour)}/hr</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Duration</span><span>{duration} hr</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span>{formatINR(total)}</span></div>
              </div>

              <Button onClick={handleBookClick} className="w-full" size="lg" disabled={selectedHour == null}>
                {selectedHour == null ? "Select a slot" : `Book ${formatHour(selectedHour)} • ${formatINR(total)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment modal */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Confirm payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Turf</span><span className="font-medium">{turf.name}</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{formatDateLabel(date)}</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{selectedHour != null ? formatHour(selectedHour) : ""} ({duration}h)</span></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              <CalIcon className="mb-1 inline h-3.5 w-3.5" /> Demo payment — no real card will be charged.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying}>Cancel</Button>
            <Button onClick={handlePay} disabled={paying}>
              {paying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : `Pay ${formatINR(total)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Booking confirmed!</h3>
            <p className="mt-1 text-sm text-muted-foreground">See you at {turf.name} on {formatDateLabel(date)}.</p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>Continue browsing</Button>
            <Button asChild><Link to="/my-bookings">View my bookings</Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
