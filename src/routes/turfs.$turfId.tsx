import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  store, isSlotBooked, formatINR, formatDate, formatHour, getSportColor, getSportIcon,
  type Booking, type Review
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import {
  MapPin, Star, Check, Clock, Calendar as CalIcon, CreditCard, Loader2, CheckCircle2,
  ChevronLeft, ChevronRight, Users, Zap, Heart, Share2, Tag, X, ThumbsUp, MessageSquare,
  ShieldCheck, Smartphone
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/turfs/$turfId")({
  component: TurfDetailPage,
});

// Razorpay type definitions
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void };
  }
}

const RAZORPAY_KEY = "rzp_test_1DP5mmOlF5G5ag";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function todayPlus(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function TurfDetailPage() {
  const { turfId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const turf = useMemo(() => store.getTurfs().find(t => t.id === turfId), [turfId]);
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [reviews, setReviews] = useState<Review[]>(() => store.getReviews());
  const [favorites, setFavorites] = useState<string[]>(() => user ? store.getFavorites(user.email) : []);

  // Gallery
  const [imgIdx, setImgIdx] = useState(0);

  // Booking state
  const [date, setDate] = useState(todayPlus(0));
  const [duration, setDuration] = useState<number>(1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ discount: number; code: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment state
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState<string>("");

  // Review
  const [reviewOpen, setReviewOpen] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myReviewText, setMyReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  if (!turf) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Turf not found</h1>
          <p className="mt-2 text-muted-foreground">The venue you're looking for doesn't exist.</p>
          <Button asChild className="mt-6"><Link to="/turfs">Browse all turfs</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const images = turf.images?.length ? turf.images : [turf.image];
  const turfReviews = reviews.filter(r => r.turfId === turf.id);
  const isFav = favorites.includes(turf.id);

  const hours: number[] = [];
  for (let h = turf.openHour; h < turf.closeHour; h++) hours.push(h);

  const baseTotal = turf.pricePerHour * duration;
  const discount = coupon ? Math.round(baseTotal * coupon.discount / 100) : 0;
  const total = baseTotal - discount;

  const isSlotAvailable = (h: number) => {
    if (h + duration > turf.closeHour) return false;
    for (let i = 0; i < Math.ceil(duration); i++) {
      if (isSlotBooked(bookings, turf.id, date, h + i)) return false;
    }
    return true;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const c = store.validateCoupon(couponCode, baseTotal, turf.sport);
    if (c) {
      setCoupon({ discount: c.discount, code: c.code });
      toast.success(`Coupon applied! ${c.discount}% off`);
    } else {
      toast.error("Invalid or expired coupon code");
    }
    setCouponLoading(false);
  };

  const handleBookClick = () => {
    if (!user) {
      toast.error("Please sign in to book", { description: "Sign in or create an account to continue" });
      navigate({ to: "/login", search: { redirect: `/turfs/${turf.id}` } as never });
      return;
    }
    if (selectedHour == null) {
      toast.error("Pick a slot first");
      return;
    }
    setPayOpen(true);
  };

  const confirmBookingAfterPayment = (paymentId: string) => {
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
      couponCode: coupon?.code,
      discount,
      paymentId,
    };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    store.saveBookings(updated);

    const notif = {
      id: "n" + Date.now(),
      userEmail: user!.email,
      title: "Booking Confirmed! 🎉",
      message: `Your slot at ${turf.name} on ${formatDate(date)} at ${formatHour(selectedHour!)} is confirmed. Payment ID: ${paymentId}`,
      type: "booking" as const,
      read: false,
      createdAt: new Date().toISOString(),
      link: "/my-bookings",
    };
    store.saveNotifications([notif, ...store.getNotifications(user!.email)]);

    setLastPaymentId(paymentId);
    setPaying(false);
    setPayOpen(false);
    setSuccessOpen(true);
    setSelectedHour(null);
    setCoupon(null);
    setCouponCode("");
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Could not load payment gateway. Check your internet connection.");
      setPaying(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: total * 100, // paise
      currency: "INR",
      name: "Turfly",
      description: `${turf.name} · ${formatDate(date)} · ${formatHour(selectedHour!)}`,
      image: "https://i.imgur.com/3g7nmJC.png",
      handler: (response: { razorpay_payment_id: string }) => {
        confirmBookingAfterPayment(response.razorpay_payment_id);
      },
      prefill: {
        name: user?.name ?? "",
        email: user?.email ?? "",
      },
      notes: {
        turf_id: turf.id,
        turf_name: turf.name,
        booking_date: date,
        start_hour: String(selectedHour),
        duration: String(duration),
      },
      theme: { color: "#16a34a" },
      modal: {
        ondismiss: () => {
          setPaying(false);
          toast("Payment cancelled");
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Payment gateway error. Try again.");
      setPaying(false);
    }
  };

  const handleToggleFav = () => {
    if (!user) { toast.error("Sign in to save favorites"); return; }
    const isFavNow = store.toggleFavorite(user.email, turf.id);
    setFavorites(prev => isFavNow ? [...prev, turf.id] : prev.filter(id => id !== turf.id));
    toast.success(isFavNow ? "Added to favorites" : "Removed from favorites");
  };

  const submitReview = async () => {
    if (!user) { toast.error("Sign in to leave a review"); return; }
    if (!myReviewText.trim()) { toast.error("Write a review first"); return; }
    setSubmittingReview(true);
    await new Promise(r => setTimeout(r, 600));
    const newReview: Review = {
      id: "r" + Date.now(),
      turfId: turf.id,
      customerEmail: user.email,
      customerName: user.name,
      rating: myRating,
      text: myReviewText,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    store.saveReviews(updated);
    setReviewOpen(false);
    setMyReviewText("");
    setMyRating(5);
    setSubmittingReview(false);
    toast.success("Review submitted!");
  };

  const avgRating = turfReviews.length
    ? (turfReviews.reduce((s, r) => s + r.rating, 0) / turfReviews.length).toFixed(1)
    : turf.rating.toFixed(1);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/turfs" className="hover:text-primary transition-colors flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> All venues
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{turf.name}</span>
        </div>

        {/* ─── GALLERY ─── */}
        <div className="grid gap-2.5 md:grid-cols-3 mb-6">
          <div className="relative overflow-hidden rounded-xl md:col-span-2 group">
            <img
              src={images[imgIdx]}
              alt={turf.name}
              className="h-64 w-full object-cover md:h-[420px] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="hidden flex-col gap-2.5 md:flex">
            {images.slice(0, 2).map((img, i) => (
              <div
                key={i}
                className="relative flex-1 cursor-pointer overflow-hidden rounded-xl"
                onClick={() => setImgIdx(i)}
              >
                <img src={img} alt="" className={`h-full w-full object-cover transition-all hover:scale-105 ${imgIdx === i ? "ring-2 ring-primary ring-offset-2" : ""}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ─── LEFT COLUMN ─── */}
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={`border text-sm px-3 ${getSportColor(turf.sport)}`}>
                    {getSportIcon(turf.sport)} {turf.sport}
                  </Badge>
                  {turf.featured && (
                    <Badge className="bg-yellow-400/20 text-yellow-700 border-yellow-300">
                      <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" /> Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">{turf.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {turf.location}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {avgRating} <span className="text-muted-foreground">({turfReviews.length || turf.reviews} reviews)</span></span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatHour(turf.openHour)} – {formatHour(turf.closeHour)}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Up to {turf.capacity} players</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleToggleFav}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:scale-110 ${isFav ? "border-red-300 bg-red-50 text-red-500" : "border-border hover:border-red-300"}`}
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                </button>
                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied!"); }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="leading-relaxed text-foreground/85 text-sm">{turf.description}</p>
            </div>

            {/* Surface & capacity */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Surface", value: turf.surface || "Premium", icon: "🏟️" },
                { label: "Capacity", value: `${turf.capacity} players`, icon: "👥" },
                { label: "Opens", value: formatHour(turf.openHour), icon: "🌅" },
                { label: "Closes", value: formatHour(turf.closeHour), icon: "🌙" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-xl border border-border/50 bg-card p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <h2 className="mt-8 text-lg font-semibold">Amenities</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {turf.amenities.map(a => (
                <div key={a} className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-3 py-2.5 text-sm">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {a}
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(Number(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{avgRating}</span>
                    <span className="text-xs text-muted-foreground">· {turfReviews.length || turf.reviews} reviews</span>
                  </div>
                </div>
                {user && (
                  <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)} className="gap-1.5">
                    <MessageSquare className="h-4 w-4" /> Write a review
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {turfReviews.slice(0, 5).map(r => (
                  <Card key={r.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {r.customerName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{r.customerName}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="mt-2.5 text-sm text-foreground/80 leading-relaxed">{r.text}</p>
                      {(r.helpful ?? 0) > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" /> {r.helpful} found this helpful
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {turfReviews.length === 0 && (
                  <Card className="border-dashed border-border">
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      No reviews yet. {user ? "Be the first to review!" : "Sign in to leave a review."}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* ─── BOOKING PANEL ─── */}
          <Card className="h-fit border-border/60 shadow-elevated lg:sticky lg:top-20">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold">{formatINR(turf.pricePerHour)}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                  Available today
                </Badge>
              </div>

              {/* Date selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Date</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0,1,2,3].map(n => {
                    const d = todayPlus(n);
                    const dateObj = new Date(d);
                    return (
                      <button
                        key={d}
                        onClick={() => { setDate(d); setSelectedHour(null); }}
                        className={`rounded-xl border p-2 text-center text-xs transition-all ${
                          date === d
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <div className="font-bold">{n === 0 ? "Today" : dateObj.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                        <div className="mt-0.5 opacity-80">{dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</label>
                <Select value={String(duration)} onValueChange={v => { setDuration(Number(v)); setSelectedHour(null); }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Slot grid */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Slots</label>
                <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                  {hours.map(h => {
                    const available = isSlotAvailable(h);
                    const selected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        disabled={!available}
                        onClick={() => setSelectedHour(h)}
                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                          selected ? "slot-selected" : available ? "slot-available" : "slot-booked"
                        }`}
                      >
                        {formatHour(h)}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-primary bg-primary/20" />Available</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-muted" />Booked</span>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coupon Code</label>
                {coupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{coupon.code} — {coupon.discount}% OFF</span>
                    </div>
                    <button onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-green-600 hover:text-green-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FIRST20"
                      className="h-9 text-sm uppercase"
                      onKeyDown={e => e.key === "Enter" && applyCoupon()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyCoupon}
                      disabled={!couponCode || couponLoading}
                      className="shrink-0"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm border border-border/50">
                <div className="flex justify-between text-muted-foreground">
                  <span>{formatINR(turf.pricePerHour)} × {duration}hr</span>
                  <span>{formatINR(baseTotal)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon.discount}%)</span>
                    <span>−{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleBookClick}
                className="w-full gap-2 shadow-sm"
                size="lg"
                disabled={selectedHour == null}
              >
                {selectedHour == null ? (
                  <><CalIcon className="h-4 w-4" /> Select a time slot</>
                ) : (
                  <><Zap className="h-4 w-4" /> Book {formatHour(selectedHour)} · {formatINR(total)}</>
                )}
              </Button>

              {/* Payment trust badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Secured by Razorpay · Test Mode</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── PAYMENT CONFIRM DIALOG ─── */}
      <Dialog open={payOpen} onOpenChange={v => { if (!paying) setPayOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              Confirm & Pay
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-muted/40 border border-border/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Venue</span><span className="font-semibold">{turf.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{selectedHour != null ? formatHour(selectedHour) : ""} ({duration}h)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Surface</span><span>{turf.surface}</span></div>
              {coupon && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatINR(discount)} ({coupon.discount}%)</span></div>}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="text-primary">{formatINR(total)}</span></div>
            </div>

            {/* Razorpay test info */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-blue-700">Razorpay Test Mode — use test card</span>
              </div>
              <div className="space-y-1 text-xs text-blue-700/80">
                <div>Card: <span className="font-mono font-semibold">4111 1111 1111 1111</span></div>
                <div>Expiry: Any future date · CVV: Any 3 digits</div>
                <div>OTP: <span className="font-mono font-semibold">123456</span></div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying}>Cancel</Button>
            <Button onClick={handleRazorpayPayment} disabled={paying} className="gap-2">
              {paying ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Opening payment…</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Pay {formatINR(total)}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── SUCCESS DIALOG ─── */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm">
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Booking Confirmed! 🎉</h3>
            <p className="mt-2 text-sm text-muted-foreground">See you at <strong>{turf.name}</strong>!</p>
            <div className="mt-4 rounded-xl bg-muted/30 p-3 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount paid</span><span className="font-bold text-primary">{formatINR(total)}</span></div>
              {lastPaymentId && (
                <div className="flex justify-between"><span className="text-muted-foreground">Payment ID</span><span className="font-mono text-xs">{lastPaymentId.slice(0, 16)}…</span></div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSuccessOpen(false)} className="flex-1">Continue browsing</Button>
            <Button asChild className="flex-1 gap-1.5">
              <Link to="/my-bookings"><CalIcon className="h-4 w-4" /> My Bookings</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── REVIEW DIALOG ─── */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Write a Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setMyRating(r)} className="transition-transform hover:scale-110">
                    <Star className={`h-7 w-7 ${r <= myRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Your review</label>
              <Textarea
                value={myReviewText}
                onChange={e => setMyReviewText(e.target.value)}
                placeholder="Share your experience at this venue…"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={submittingReview}>Cancel</Button>
            <Button onClick={submitReview} disabled={submittingReview || !myReviewText.trim()} className="gap-1.5">
              {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Submit</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
