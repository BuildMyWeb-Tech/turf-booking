import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { store, formatINR, type Sport, getSportIcon, getSportColor } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import {
  MapPin, Star, Search, Grid3x3, List, SlidersHorizontal, X,
  Heart, Clock, Users, ArrowRight, Filter, ChevronDown, Trophy
} from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";

export const Route = createFileRoute("/turfs/")({
  component: TurfsPage,
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    sport: (s.sport as string) || "all",
  }),
  head: () => ({
    meta: [
      { title: "Browse Turfs — Turfly" },
      { name: "description", content: "Browse turfs by sport, price and location. Real-time availability." },
    ],
  }),
});

type ViewMode = "grid" | "list";
type SortOption = "popular" | "price-asc" | "price-desc" | "rating";

const SPORTS: (Sport | "all")[] = ["all", "Football", "Cricket", "Badminton", "Tennis", "Basketball"];

function TurfsPage() {
  const search = Route.useSearch();
  const allTurfs = useMemo(() => store.getTurfs(), []);
  const { user } = useAuth();

  const [q, setQ] = useState(search.q || "");
  const [sport, setSport] = useState<string>(search.sport || "all");
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [minRating, setMinRating] = useState<number>(0);
  const [sort, setSort] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() =>
    user ? store.getFavorites(user.email) : []
  );

  const filtered = useMemo(() => {
    let result = allTurfs.filter((t) => {
      if (sport !== "all" && t.sport !== sport) return false;
      if (t.pricePerHour > maxPrice) return false;
      if (t.rating < minRating) return false;
      if (q && !`${t.name} ${t.location} ${t.sport}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });

    switch (sort) {
      case "price-asc": result = [...result].sort((a, b) => a.pricePerHour - b.pricePerHour); break;
      case "price-desc": result = [...result].sort((a, b) => b.pricePerHour - a.pricePerHour); break;
      case "rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "popular": result = [...result].sort((a, b) => b.reviews - a.reviews); break;
    }

    return result;
  }, [allTurfs, q, sport, maxPrice, minRating, sort]);

  const toggleFavorite = (turfId: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const isFav = store.toggleFavorite(user.email, turfId);
    setFavorites(prev => isFav ? [...prev, turfId] : prev.filter(id => id !== turfId));
  };

  const hasFilters = q !== "" || sport !== "all" || maxPrice < 2500 || minRating > 0;
  const resetFilters = () => { setQ(""); setSport("all"); setMaxPrice(2500); setMinRating(0); };

  const sortLabels: Record<SortOption, string> = {
    popular: "Most Popular",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    rating: "Highest Rated",
  };

  return (
    <PublicLayout>
      {/* Page header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold md:text-3xl">Browse Turfs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} venue{filtered.length !== 1 ? "s" : ""} available · Mumbai
          </p>

          {/* Sport pills */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SPORTS.map(s => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  sport === s
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {s !== "all" && <span>{getSportIcon(s as Sport)}</span>}
                {s === "all" ? "All Sports" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 lg:grid lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Filter className="h-4 w-4 text-primary" /> Filters
                    </div>
                    {hasFilters && (
                      <button onClick={resetFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <X className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or location" className="pl-8 h-9" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Max price</span>
                      <span className="text-foreground font-bold">{formatINR(maxPrice)}/hr</span>
                    </label>
                    <Slider value={[maxPrice]} onValueChange={v => setMaxPrice(v[0])} min={300} max={2500} step={100} className="mt-1" />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                      <span>₹300</span><span>₹2,500</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min rating</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 3, 4, 4.5].map(r => (
                        <button
                          key={r}
                          onClick={() => setMinRating(r)}
                          className={`rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                            minRating === r ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {r === 0 ? "Any" : `${r}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>
                      <X className="mr-1.5 h-3.5 w-3.5" /> Reset all filters
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick stats */}
              <Card className="border-border/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
                    <Trophy className="h-4 w-4" /> Quick facts
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>Total venues</span><span className="font-medium text-foreground">{allTurfs.length}</span></div>
                    <div className="flex justify-between"><span>Avg price/hr</span><span className="font-medium text-foreground">{allTurfs.length > 0 ? formatINR(Math.round(allTurfs.reduce((s, t) => s + t.pricePerHour, 0) / allTurfs.length)) : "—"}</span></div>
                    <div className="flex justify-between"><span>Top rated</span><span className="font-medium text-foreground">{allTurfs.length > 0 ? Math.max(...allTurfs.map(t => t.rating)) : "—"}/5</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors lg:hidden ${
                    hasFilters ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/60"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters {hasFilters && <Badge className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">!</Badge>}
                </button>

                <span className="text-sm text-muted-foreground hidden sm:block">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortOption)}
                    className="appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm font-medium text-foreground hover:bg-muted/60 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {(Object.entries(sortLabels) as [SortOption, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* View toggle */}
                <div className="flex items-center rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-muted-foreground"}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-muted-foreground"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile filters panel */}
            {filtersOpen && (
              <Card className="mb-4 border-border/50 lg:hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or location" className="pl-8" />
                  </div>
                  <div>
                    <label className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>MAX PRICE</span><span className="text-foreground">{formatINR(maxPrice)}/hr</span>
                    </label>
                    <Slider value={[maxPrice]} onValueChange={v => setMaxPrice(v[0])} min={300} max={2500} step={100} />
                  </div>
                  {hasFilters && (
                    <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>Reset filters</Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Active filter chips */}
            {hasFilters && (
              <div className="mb-4 flex flex-wrap gap-2">
                {q && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    "{q}" <button onClick={() => setQ("")}><X className="h-3 w-3 ml-1" /></button>
                  </span>
                )}
                {sport !== "all" && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {sport} <button onClick={() => setSport("all")}><X className="h-3 w-3 ml-1" /></button>
                  </span>
                )}
                {maxPrice < 2500 && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Under {formatINR(maxPrice)} <button onClick={() => setMaxPrice(2500)}><X className="h-3 w-3 ml-1" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {minRating}+ stars <button onClick={() => setMinRating(0)}><X className="h-3 w-3 ml-1" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results grid */}
            {filtered.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-16 text-center">
                  <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                  <h3 className="font-semibold text-foreground">No venues found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Clear all filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2" : "space-y-3"}>
                {filtered.map((t) => (
                  viewMode === "grid" ? (
                    <Card key={t.id} className="group overflow-hidden border-border/50 p-0 hover-lift">
                      <Link to="/turfs/$turfId" params={{ turfId: t.id }} className="block">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={t.images[0] || t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <Badge className={`absolute left-3 top-3 border text-xs ${getSportColor(t.sport)}`}>
                            {getSportIcon(t.sport)} {t.sport}
                          </Badge>
                          {user && (
                            <button
                              onClick={e => toggleFavorite(t.id, e)}
                              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110"
                            >
                              <Heart className={`h-4 w-4 ${favorites.includes(t.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                            </button>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-foreground">{t.name}</h3>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
                                <MapPin className="h-3 w-3 shrink-0" />{t.location}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-yellow-50 border border-yellow-200 px-2 py-1 text-xs font-medium text-yellow-700">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {t.rating}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.openHour}:00–{t.closeHour}:00</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.capacity}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                            <div>
                              <span className="text-base font-bold">{formatINR(t.pricePerHour)}</span>
                              <span className="text-xs text-muted-foreground">/hr</span>
                            </div>
                            <Button size="sm" className="gap-1">Book <ArrowRight className="h-3 w-3" /></Button>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ) : (
                    <Card key={t.id} className="group overflow-hidden border-border/50 p-0 hover-lift">
                      <Link to="/turfs/$turfId" params={{ turfId: t.id }} className="flex">
                        <div className="relative h-32 w-40 shrink-0 overflow-hidden sm:h-36 sm:w-48">
                          <img src={t.images[0] || t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <CardContent className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                                  <Badge className={`border text-[10px] px-2 py-0 ${getSportColor(t.sport)}`}>
                                    {t.sport}
                                  </Badge>
                                </div>
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />{t.location}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 rounded-lg bg-yellow-50 border border-yellow-200 px-2 py-1 text-xs font-medium text-yellow-700 shrink-0">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {t.rating}
                                <span className="text-muted-foreground">({t.reviews})</span>
                              </div>
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 hidden sm:block">{t.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-base font-bold">{formatINR(t.pricePerHour)}</span>
                              <span className="text-xs text-muted-foreground">/hr</span>
                            </div>
                            <Button size="sm" className="gap-1">Book <ArrowRight className="h-3 w-3" /></Button>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  )
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}
