import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store, formatINR } from "@/lib/mock-data";
import { Search, MapPin, Star, ArrowRight, Zap, ShieldCheck, Clock, Trophy } from "lucide-react";
import { useMemo } from "react";

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
  { name: "Football", icon: "⚽", count: 24 },
  { name: "Cricket", icon: "🏏", count: 18 },
  { name: "Badminton", icon: "🏸", count: 32 },
  { name: "Tennis", icon: "🎾", count: 12 },
  { name: "Basketball", icon: "🏀", count: 9 },
];

function HomePage() {
  const turfs = useMemo(() => store.getTurfs().slice(0, 3), []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center text-white">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15">
              <Zap className="mr-1 h-3 w-3" /> Real-time slot availability
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
              Book your next match in <span className="text-primary-glow">60 seconds</span>
            </h1>
            <p className="mt-5 text-pretty text-lg text-white/80 md:text-xl">
              Discover premium turfs near you, see live availability, and lock in your slot instantly. Built for players, loved by owners.
            </p>

            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 shadow-2xl">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Search turfs, sports or locations…"
                />
              </div>
              <Button asChild className="rounded-full">
                <Link to="/turfs">Browse <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-glow" /> Verified turfs</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary-glow" /> Instant confirmation</span>
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary-glow" /> 5,000+ matches played</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Popular sports</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick your game and get on the field.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SPORTS.map((s) => (
            <Link key={s.name} to="/turfs" className="group">
              <Card className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-6">
                  <span className="text-4xl transition-transform group-hover:scale-110">{s.icon}</span>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.count} venues</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured turfs */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Featured turfs</h2>
            <p className="mt-1 text-sm text-muted-foreground">Handpicked venues with top-rated facilities.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/turfs">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {turfs.map((t) => (
            <Card key={t.id} className="group overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-lg">
              <Link to="/turfs/$turfId" params={{ turfId: t.id }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background">{t.sport}</Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {t.location}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                      <Star className="h-3 w-3 fill-current" /> {t.rating}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">{formatINR(t.pricePerHour)}</span>
                      <span className="text-xs text-muted-foreground">/hour</span>
                    </div>
                    <Button size="sm">Book now</Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="overflow-hidden border-0" style={{ background: "var(--gradient-primary)" }}>
          <CardContent className="flex flex-col items-center justify-between gap-6 p-10 text-primary-foreground md:flex-row md:p-12">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">Own a turf? Manage everything in one place.</h3>
              <p className="mt-2 max-w-xl text-primary-foreground/85">Add venues, configure slots, accept bookings and track revenue with a beautiful admin dashboard.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link to="/login">List your turf</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
