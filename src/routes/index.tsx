import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store, formatINR, getSportIcon, getSportColor } from "@/lib/mock-data";
import {
  Search, MapPin, Star, ArrowRight, Zap, ShieldCheck, Clock,
  Trophy, CheckCircle, Users, Calendar, TrendingUp, Sparkles,
  ChevronRight, PlayCircle, Heart, Target
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Turfly — Book your game in seconds" },
      { name: "description", content: "Browse premium turfs and book instant slots for football, cricket, badminton and more." },
    ],
  }),
});

const SPORTS = [
  { name: "Football", count: 24, gradient: "from-green-500 to-emerald-600" },
  { name: "Cricket", count: 18, gradient: "from-sky-500 to-blue-600" },
  { name: "Badminton", count: 32, gradient: "from-yellow-500 to-orange-500" },
  { name: "Tennis", count: 12, gradient: "from-purple-500 to-violet-600" },
  { name: "Basketball", count: 9, gradient: "from-red-500 to-orange-600" },
];

const STATS = [
  { label: "Premium Venues", value: "6+", icon: MapPin },
  { label: "Happy Players", value: "5,000+", icon: Users },
  { label: "Matches Booked", value: "12,000+", icon: Calendar },
  { label: "Cities Covered", value: "3", icon: Target },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Search, title: "Discover Venues", desc: "Browse our curated collection of premium sports venues near you. Filter by sport, price, and availability." },
  { step: "02", icon: Calendar, title: "Pick Your Slot", desc: "Select your preferred date and time from real-time availability. Choose from 30-min to 2-hour sessions." },
  { step: "03", icon: CheckCircle, title: "Instant Confirmation", desc: "Complete your booking with a simulated payment. Get instant confirmation and join the game!" },
];

const TESTIMONIALS = [
  { name: "Arjun M.", sport: "Football", rating: 5, text: "Booked a Sunday morning slot in under 2 minutes. The pitch was immaculate and the booking process was seamless.", avatar: "AM" },
  { name: "Priya S.", sport: "Badminton", rating: 5, text: "SmashPoint is our weekly destination now. Turfly makes it super easy to plan around everyone's schedule.", avatar: "PS" },
  { name: "Kiran V.", sport: "Cricket", rating: 5, text: "Finally a platform that shows real-time slot availability. No more calling venues and waiting on hold!", avatar: "KV" },
];

function HomePage() {
  const turfs = useMemo(() => store.getTurfs(), []);
  const featured = useMemo(() => {
    const withFeatured = turfs.filter(t => t.featured);
    const pool = withFeatured.length > 0 ? withFeatured : [...turfs].sort((a, b) => b.rating - a.rating);
    return pool.slice(0, 3);
  }, [turfs]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/turfs", search: { q: searchQuery } as never });
  };

  return (
    <PublicLayout>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden gradient-hero min-h-[580px] flex items-center">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(oklch(1 0 0 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center text-white">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15 backdrop-blur-sm px-4 py-1.5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-yellow-300" />
              Real-time slot availability · Instant confirmation
            </Badge>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              Book your next match{" "}
              <span className="relative">
                <span className="relative z-10 text-emerald-300">in 60 seconds</span>
                <span className="absolute -inset-1 rounded-lg bg-emerald-400/20 blur-sm" />
              </span>
            </h1>

            <p className="mt-5 text-pretty text-lg text-white/75 md:text-xl max-w-2xl mx-auto">
              Discover premium turfs near you, check live availability, and lock in your slot instantly.
              Built for players, loved by venue owners.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1"
                  placeholder="Search turfs, sports or locations…"
                />
              </div>
              <Button type="submit" className="rounded-full px-5 gap-1.5 shrink-0">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/65">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified venues</span>
              <span className="w-px h-3 bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-300" /> Instant confirmation</span>
              <span className="w-px h-3 bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-emerald-300" /> 12,000+ matches booked</span>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-12 w-full fill-background">
            <path d="M0,60 L0,30 Q360,0 720,30 Q1080,60 1440,30 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="container mx-auto px-4 -mt-2 pb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-border/50 shadow-sm hover-lift">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── SPORTS ─── */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 rounded-full bg-primary block" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Sports</span>
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Pick your game</h2>
            <p className="mt-1 text-sm text-muted-foreground">We cover all the popular sports across Mumbai</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SPORTS.map((s) => (
            <Link key={s.name} to="/turfs" search={{ sport: s.name } as never} className="group">
              <Card className="overflow-hidden border-border/50 transition-all hover:-translate-y-1 hover:shadow-elevated cursor-pointer">
                <CardContent className="flex flex-col items-center gap-3 p-5">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-2xl">{getSportIcon(s.name as never)}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.count} venues</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED TURFS ─── */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 rounded-full bg-primary block" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Featured</span>
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Top-rated venues</h2>
            <p className="mt-1 text-sm text-muted-foreground">Handpicked for exceptional quality and experience</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
            <Link to="/turfs">View all <ChevronRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <Card key={t.id} className="group overflow-hidden border-border/50 p-0 transition-all hover:-translate-y-1 hover:shadow-elevated">
              <Link to="/turfs/$turfId" params={{ turfId: t.id }}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={t.images[0] || t.image}
                    alt={t.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <Badge className={`absolute left-3 top-3 border text-xs font-medium px-2.5 py-0.5 ${getSportColor(t.sport)}`}>
                    {getSportIcon(t.sport)} {t.sport}
                  </Badge>
                  {t.featured && (
                    <Badge className="absolute right-3 top-3 bg-yellow-400/90 text-yellow-900 border-0 text-xs">
                      <Star className="mr-1 h-2.5 w-2.5 fill-current" /> Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 border border-yellow-200">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {t.rating}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t.capacity} players</span>
                    <span>·</span>
                    <span>{t.surface}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                    <div>
                      <span className="text-lg font-bold text-foreground">{formatINR(t.pricePerHour)}</span>
                      <span className="text-xs text-muted-foreground">/hour</span>
                    </div>
                    <Button size="sm" className="gap-1.5 shadow-sm">
                      Book now <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-1 w-8 rounded-full bg-primary block" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Process</span>
              <span className="h-1 w-8 rounded-full bg-primary block" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">How Turfly works</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">From discovery to confirmation in under 2 minutes</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connector line */}
            <div className="absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden md:block" />

            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {step.slice(-1)}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="h-1 w-8 rounded-full bg-primary block" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Reviews</span>
            <span className="h-1 w-8 rounded-full bg-primary block" />
          </div>
          <h2 className="text-2xl font-bold md:text-3xl">Loved by players</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join thousands who book with Turfly every week</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="border-border/50 hover-lift">
              <CardContent className="p-5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.sport} player</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 md:p-12">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <Badge className="mb-3 border-white/20 bg-white/15 text-white">
                <Trophy className="mr-1.5 h-3 w-3" /> For venue owners
              </Badge>
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                Own a turf? Manage everything in one place.
              </h3>
              <p className="mt-2 text-white/80 text-sm leading-relaxed">
                Add venues, configure slots, approve bookings, and track revenue with our beautiful admin dashboard. Real-time analytics included.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-white" /> Slot management</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-white" /> Revenue analytics</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-white" /> Customer insights</span>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0 gap-2 shadow-lg">
              <Link to="/login">
                <PlayCircle className="h-5 w-5" />
                List your turf
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
