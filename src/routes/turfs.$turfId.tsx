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
  store, isSlotBooked, formatINR, formatDate, formatHour,
  type Booking, type Review
} from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import {
  MapPin, Star, Check, Clock, Calendar as CalIcon, CreditCard, Loader2, CheckCircle2,
  ChevronLeft, ChevronRight, Users, Zap, Heart, Share2, Tag, X, ThumbsUp, MessageSquare,
  ShieldCheck, Smartphone, Layers, Sunrise, Moon, Trophy, ArrowRight,
  Wifi, Wind, Droplets, Car, Dumbbell, Coffee, Shirt, Camera, Flame, Timer,
  Activity
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/turfs/$turfId")({
  component: TurfDetailPage,
});

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

// Map amenity names to Lucide icons
function getAmenityIcon(amenity: string) {
  const a = amenity.toLowerCase();
  if (a.includes("wifi") || a.includes("internet")) return Wifi;
  if (a.includes("parking") || a.includes("car")) return Car;
  if (a.includes("shower") || a.includes("locker") || a.includes("changing")) return Droplets;
  if (a.includes("gym") || a.includes("equipment") || a.includes("gear")) return Dumbbell;
  if (a.includes("cafeteria") || a.includes("cafe") || a.includes("food") || a.includes("canteen")) return Coffee;
  if (a.includes("jersey") || a.includes("kit") || a.includes("cloth")) return Shirt;
  if (a.includes("ac") || a.includes("air")) return Wind;
  if (a.includes("camera") || a.includes("cctv") || a.includes("security")) return Camera;
  if (a.includes("light") || a.includes("floodlight")) return Flame;
  return Check;
}

function TurfDetailPage() {
  const { turfId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const turf = useMemo(() => store.getTurfs().find(t => t.id === turfId), [turfId]);
  const [bookings, setBookings] = useState<Booking[]>(() => store.getBookings());
  const [reviews, setReviews] = useState<Review[]>(() => store.getReviews());
  const [favorites, setFavorites] = useState<string[]>(() => user ? store.getFavorites(user.email) : []);

  const [imgIdx, setImgIdx] = useState(0);

  const [date, setDate] = useState(todayPlus(0));
  const [duration, setDuration] = useState<number>(1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ discount: number; code: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState<string>("");

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
      title: "Booking Confirmed",
      message: `Your slot at ${turf.name} on ${formatDate(date)} at ${formatHour(selectedHour!)} is confirmed.`,
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
      description: `${turf.name} — ${formatDate(date)} ${formatHour(selectedHour!)}`,
      image: "https://i.imgur.com/3g7nmJC.png",
      handler: (response: { razorpay_payment_id: string }) => {
        confirmBookingAfterPayment(response.razorpay_payment_id);
      },
      prefill: {
        name: user?.name ?? "",
        email: user?.email ?? "",
        contact: "9000000000", // required for UPI & card methods to show
      },
      method: {
        card: true,
        upi: true,
        netbanking: true,
        wallet: true,
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

  const statsCards = [
    { label: "Surface", value: turf.surface || "Premium", icon: Layers },
    { label: "Capacity", value: `${turf.capacity} players`, icon: Users },
    { label: "Opens", value: formatHour(turf.openHour), icon: Sunrise },
    { label: "Closes", value: formatHour(turf.closeHour), icon: Moon },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-6 max-w-7xl">

          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/turfs" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
              <ChevronLeft className="h-4 w-4" /> All venues
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{turf.name}</span>
          </div>

          {/* ─── HERO GALLERY ─── */}
          <div className="relative mb-8 grid gap-2 md:grid-cols-[2fr_1fr] md:grid-rows-2 h-64 md:h-[460px] rounded-2xl overflow-hidden">
            {/* Main image */}
            <div
              className="relative md:row-span-2 overflow-hidden cursor-pointer group bg-muted"
              onClick={() => setImgIdx(0)}
            >
              <img
                src={images[imgIdx]}
                alt={turf.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

              {/* Floating title on mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:hidden">
                <h1 className="text-white text-xl font-bold drop-shadow">{turf.name}</h1>
                <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {turf.location}
                </p>
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 right-4 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-white text-xs font-medium">
                    {imgIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Side thumbnails */}
            {images[1] && (
              <div
                className="hidden md:block overflow-hidden cursor-pointer group bg-muted"
                onClick={() => setImgIdx(1)}
              >
                <img
                  src={images[1]}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgIdx === 1 ? "brightness-110" : "brightness-90 hover:brightness-100"}`}
                />
              </div>
            )}
            {images[2] && (
              <div
                className="hidden md:block overflow-hidden cursor-pointer group bg-muted relative"
                onClick={() => setImgIdx(2)}
              >
                <img
                  src={images[2]}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgIdx === 2 ? "brightness-110" : "brightness-90 hover:brightness-100"}`}
                />
                {images.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="text-white text-sm font-semibold">+{images.length - 3} more</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons top-right */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={handleToggleFav}
                className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm border transition-all hover:scale-110 ${
                  isFav ? "bg-red-500 border-red-400 text-white" : "bg-black/30 border-white/20 text-white hover:bg-red-500/80"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied!"); }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50 transition-all"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* ─── LEFT ─── */}
            <div className="min-w-0">

              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1">
                    <Activity className="h-3 w-3 mr-1" />
                    {turf.sport}
                  </Badge>
                  {turf.featured && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 px-3 py-1">
                      <Trophy className="h-3 w-3" /> Featured Venue
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{turf.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> {turf.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-foreground">{avgRating}</span>
                    <span>({turfReviews.length || turf.reviews} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatHour(turf.openHour)} – {formatHour(turf.closeHour)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Up to {turf.capacity} players
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 relative rounded-2xl border border-border/40 bg-gradient-to-br from-card to-muted/20 p-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <p className="leading-relaxed text-foreground/80 relative">{turf.description}</p>
              </div>

              {/* Stats grid */}
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statsCards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-primary/10" />
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 mb-3">
                      <Icon className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className="text-sm font-bold text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-1 rounded-full bg-primary" />
                  <h2 className="text-lg font-bold">Amenities</h2>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {turf.amenities.map(a => {
                    const Icon = getAmenityIcon(a);
                    return (
                      <div
                        key={a}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-3.5 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-foreground/85">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-5 w-1 rounded-full bg-primary" />
                      <h2 className="text-lg font-bold">Guest Reviews</h2>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold">{avgRating}</span>
                      <span className="text-xs text-muted-foreground">· {turfReviews.length || turf.reviews} reviews</span>
                    </div>
                  </div>
                  {user && (
                    <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)} className="gap-1.5 rounded-xl">
                      <MessageSquare className="h-3.5 w-3.5" /> Write a review
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {turfReviews.slice(0, 5).map(r => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-sm hover:border-border"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary ring-1 ring-primary/10">
                            {r.customerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold leading-tight">{r.customerName}</div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/75 leading-relaxed">{r.text}</p>
                      {(r.helpful ?? 0) > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" /> {r.helpful} found this helpful
                        </div>
                      )}
                    </div>
                  ))}
                  {turfReviews.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/60 py-10 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No reviews yet.</p>
                      {user && <p className="text-xs text-muted-foreground mt-1">Be the first to share your experience!</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── BOOKING PANEL ─── */}
            <div className="lg:sticky lg:top-20 h-fit">
              <div className="rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden">
                {/* Price header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold">{formatINR(turf.pricePerHour)}</div>
                      <div className="text-primary-foreground/70 text-sm">per hour</div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse inline-block" />
                      Available now
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Date selector */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <CalIcon className="h-3.5 w-3.5" /> Select Date
                    </label>
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
                                : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <div className="font-bold">{n === 0 ? "Today" : dateObj.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                            <div className="mt-0.5 text-[10px] opacity-80">{dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" /> Duration
                    </label>
                    <Select value={String(duration)} onValueChange={v => { setDuration(Number(v)); setSelectedHour(null); }}>
                      <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">30 minutes</SelectItem>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Slot grid */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Available Slots
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                      {hours.map(h => {
                        const available = isSlotAvailable(h);
                        const selected = selectedHour === h;
                        return (
                          <button
                            key={h}
                            disabled={!available}
                            onClick={() => setSelectedHour(h)}
                            className={`rounded-xl border px-2 py-2 text-xs font-medium transition-all ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : available
                                ? "border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 text-foreground"
                                : "border-border/30 bg-muted/10 text-muted-foreground/40 cursor-not-allowed line-through"
                            }`}
                          >
                            {formatHour(h)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm border border-primary bg-primary/20" /> Open
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-muted border border-border/50" /> Booked
                      </span>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div>
                    <label className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" /> Coupon Code
                    </label>
                    {coupon ? (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
                            <Tag className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-semibold text-emerald-700">{coupon.code} — {coupon.discount}% OFF</span>
                        </div>
                        <button onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-emerald-500 hover:text-emerald-700 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. FIRST20"
                          className="h-10 text-sm uppercase rounded-xl"
                          onKeyDown={e => e.key === "Enter" && applyCoupon()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={applyCoupon}
                          disabled={!couponCode || couponLoading}
                          className="shrink-0 h-10 rounded-xl px-4"
                        >
                          {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="rounded-xl bg-muted/40 border border-border/40 p-3.5 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{formatINR(turf.pricePerHour)} × {duration}hr</span>
                      <span className="font-medium text-foreground">{formatINR(baseTotal)}</span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({coupon.discount}%)</span>
                        <span>−{formatINR(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border/60 pt-2.5 text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatINR(total)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={handleBookClick}
                    className="w-full gap-2 rounded-xl text-base font-semibold h-12 shadow-sm shadow-primary/20"
                    size="lg"
                    disabled={selectedHour == null}
                  >
                    {selectedHour == null ? (
                      <><Clock className="h-4 w-4" /> Select a time slot</>
                    ) : (
                      <><Zap className="h-4 w-4" /> Book {formatHour(selectedHour)} · {formatINR(total)}</>
                    )}
                  </Button>

                  {/* Trust badges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-2.5 py-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      Secure payment
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-2.5 py-2 text-xs text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      Instant confirm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PAYMENT DIALOG ─── */}
      <Dialog open={payOpen} onOpenChange={v => { if (!paying) setPayOpen(v); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
              </div>
              Confirm Booking
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Booking summary */}
            <div className="rounded-xl bg-muted/40 border border-border/50 overflow-hidden">
              <div className="bg-primary/5 px-4 py-2.5 border-b border-border/40">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Summary</p>
              </div>
              <div className="p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Venue</span>
                  <span className="font-semibold">{turf.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CalIcon className="h-3.5 w-3.5" /> Date</span>
                  <span className="font-medium">{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</span>
                  <span className="font-medium">{selectedHour != null ? formatHour(selectedHour) : ""} ({duration}h)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Surface</span>
                  <span>{turf.surface}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Discount</span>
                    <span>−{formatINR(discount)} ({coupon.discount}%)</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-2.5 text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            {/* Test mode info */}
            <div className="rounded-xl border border-blue-200/70 bg-blue-50/80 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-700">Test Mode — Use these credentials</span>
              </div>
              <div className="space-y-1 text-xs text-blue-700/80 ml-8">
                <div>Card: <span className="font-mono font-bold">4111 1111 1111 1111</span></div>
                <div>Expiry: Any future date &nbsp;·&nbsp; CVV: Any 3 digits</div>
                <div>OTP: <span className="font-mono font-bold">123456</span></div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleRazorpayPayment} disabled={paying} className="gap-2 rounded-xl flex-1">
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
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 ring-4 ring-emerald-100 h-[72px] w-[72px]">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold">Booking Confirmed</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">See you at <strong>{turf.name}</strong>!</p>
            <div className="mt-5 rounded-xl bg-muted/30 border border-border/40 p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount paid</span>
                <span className="font-bold text-primary">{formatINR(total)}</span>
              </div>
              {lastPaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">{lastPaymentId.slice(0, 16)}…</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 pt-0">
            <Button asChild className="w-full gap-1.5 rounded-xl">
              <Link to="/my-bookings"><CalIcon className="h-4 w-4" /> View My Bookings</Link>
            </Button>
            <Button variant="outline" onClick={() => setSuccessOpen(false)} className="w-full rounded-xl gap-1.5">
              <ArrowRight className="h-4 w-4" /> Continue browsing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── REVIEW DIALOG ─── */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="h-[18px] w-[18px] text-primary" />
              </div>
              Write a Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-2.5 block text-sm font-semibold">Your Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setMyRating(r)} className="transition-transform hover:scale-110 active:scale-95">
                    <Star className={`h-8 w-8 ${r <= myRating ? "fill-amber-400 text-amber-400" : "text-border fill-border"}`} />
                  </button>
                ))}
                <span className="ml-2 self-center text-sm text-muted-foreground">{myRating}/5</span>
              </div>
            </div>
            <div>
              <label className="mb-2.5 block text-sm font-semibold">Your experience</label>
              <Textarea
                value={myReviewText}
                onChange={e => setMyReviewText(e.target.value)}
                placeholder="Share what you loved about this venue…"
                className="min-h-[110px] resize-none rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={submittingReview} className="rounded-xl">Cancel</Button>
            <Button onClick={submitReview} disabled={submittingReview || !myReviewText.trim()} className="gap-1.5 rounded-xl">
              {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Submit</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
