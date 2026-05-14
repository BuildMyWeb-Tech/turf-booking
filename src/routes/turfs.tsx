import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { store, formatINR, type Sport } from "@/lib/mock-data";
import { MapPin, Star, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/turfs")({
  component: TurfsPage,
  head: () => ({
    meta: [
      { title: "Browse Turfs — Turfly" },
      { name: "description", content: "Browse turfs by sport, price and location. Real-time availability." },
    ],
  }),
});

function TurfsPage() {
  const allTurfs = useMemo(() => store.getTurfs(), []);
  const [q, setQ] = useState("");
  const [sport, setSport] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const filtered = allTurfs.filter((t) => {
    if (sport !== "all" && t.sport !== sport) return false;
    if (t.pricePerHour > maxPrice) return false;
    if (q && !`${t.name} ${t.location}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const sports: (Sport | "all")[] = ["all", "Football", "Cricket", "Badminton", "Tennis", "Basketball"];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Turfs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} venues match your filters</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters */}
          <Card className="h-fit lg:sticky lg:top-20">
            <CardContent className="space-y-6 p-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or location" className="pl-8" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sport</label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sports.map((s) => (
                      <SelectItem key={s} value={s}>{s === "all" ? "All sports" : s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Max price</span>
                  <span className="text-foreground">{formatINR(maxPrice)}</span>
                </label>
                <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={300} max={2500} step={100} />
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setQ(""); setSport("all"); setMaxPrice(2500); }}>
                Reset filters
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((t) => (
              <Card key={t.id} className="group overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <Link to="/turfs/$turfId" params={{ turfId: t.id }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background">{t.sport}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{t.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" /> {t.location}
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
                      <Button size="sm">Book</Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-16 text-center text-muted-foreground">No turfs match your filters.</CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
