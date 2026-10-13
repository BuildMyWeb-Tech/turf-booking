import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { store, type Turf, type Sport, formatINR, getSportIcon, getSportColor } from "@/lib/mock-data";
import {
  Plus, Pencil, Trash2, MapPin, Star, Users, Clock, Search,
  ImageIcon, Check, Trophy, AlertTriangle, Upload, X as XIcon
} from "lucide-react";
import { useState, useMemo, useRef, type ChangeEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/turfs")({
  component: TurfManagement,
});

const SPORTS: Sport[] = ["Football", "Cricket", "Badminton", "Tennis", "Basketball"];

const blank: Omit<Turf, "id"> = {
  name: "", sport: "Football", description: "", location: "",
  pricePerHour: 1000, rating: 4.5, reviews: 0,
  image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
  images: ["https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80"],
  amenities: ["Floodlights", "Parking"],
  openHour: 6, closeHour: 23,
  capacity: 14, surface: "Artificial Grass",
};

function TurfManagement() {
  const [turfs, setTurfs] = useState<Turf[]>(() => store.getTurfs());
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editing, setEditing] = useState<Turf | null>(null);
  const [form, setForm] = useState<Omit<Turf, "id">>(blank);
  const [amenityInput, setAmenityInput] = useState("");
  const [search, setSearch] = useState("");
  const [imageTab, setImageTab] = useState<"url" | "upload">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() =>
    turfs.filter(t => `${t.name} ${t.location} ${t.sport}`.toLowerCase().includes(search.toLowerCase())),
    [turfs, search]
  );

  const openCreate = () => { setEditing(null); setForm(blank); setAmenityInput(""); setImageTab("upload"); setOpen(true); };
  const openEdit = (t: Turf) => { setEditing(t); const { id, ...rest } = t; setForm(rest); setAmenityInput(""); setImageTab(rest.image?.startsWith("data:") ? "upload" : "url"); setOpen(true); };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setForm(f => ({ ...f, image: b64, images: [b64, ...(f.images?.slice(1) || [])] }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const save = () => {
    if (!form.name.trim() || !form.location.trim()) { toast.error("Name and location are required"); return; }
    if (form.pricePerHour < 100) { toast.error("Price must be at least ₹100"); return; }
    const normalized = {
      ...form,
      images: form.images?.length ? form.images : [form.image],
    };
    let next: Turf[];
    if (editing) {
      next = turfs.map(t => t.id === editing.id ? { ...editing, ...normalized } : t);
      toast.success("Turf updated successfully");
    } else {
      next = [{ id: "t" + Date.now(), ...normalized }, ...turfs];
      toast.success("New turf added!");
    }
    setTurfs(next);
    store.saveTurfs(next);
    setOpen(false);
  };

  const remove = (id: string) => {
    const next = turfs.filter(t => t.id !== id);
    setTurfs(next);
    store.saveTurfs(next);
    setDeleteConfirm(null);
    toast.success("Turf deleted");
  };

  const addAmenity = () => {
    const a = amenityInput.trim();
    if (!a || form.amenities.includes(a)) return;
    setForm(f => ({ ...f, amenities: [...f.amenities, a] }));
    setAmenityInput("");
  };

  const removeAmenity = (a: string) => {
    setForm(f => ({ ...f, amenities: f.amenities.filter(x => x !== a) }));
  };

  const bookingCounts = useMemo(() => {
    const bkgs = store.getBookings();
    const counts: Record<string, number> = {};
    bkgs.forEach(b => { if (b.status !== "Cancelled") counts[b.turfId] = (counts[b.turfId] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turf Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{turfs.length} venues · manage your sports facilities</p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add New Turf
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venues…" className="pl-8" />
      </div>

      {/* Turf grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(t => (
          <Card key={t.id} className="overflow-hidden border-border/50 hover-lift group">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={t.images?.[0] || t.image}
                alt={t.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <Badge className={`absolute left-3 top-3 border text-xs ${getSportColor(t.sport)}`}>
                {getSportIcon(t.sport)} {t.sport}
              </Badge>
              {t.featured && (
                <Badge className="absolute right-3 top-3 bg-yellow-400/90 text-yellow-900 border-0 text-xs">
                  <Trophy className="mr-1 h-2.5 w-2.5" /> Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
                    <MapPin className="h-3 w-3 shrink-0" />{t.location}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1 shrink-0">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{t.rating}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.capacity} players</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.openHour}:00–{t.closeHour}:00</span>
                <span className="text-primary font-medium">{bookingCounts[t.id] || 0} bookings</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                <div>
                  <span className="text-base font-bold">{formatINR(t.pricePerHour)}</span>
                  <span className="text-xs text-muted-foreground">/hr</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(t)} className="gap-1 h-8">
                    <Pencil className="h-3 w-3" />Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(t.id)}
                    className="gap-1 h-8 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="font-semibold">No venues found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or add a new turf</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Turf" : "Add New Turf"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Turf Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Greenfield Arena" />
            </div>

            <div className="space-y-1.5">
              <Label>Sport *</Label>
              <Select value={form.sport} onValueChange={v => setForm(f => ({ ...f, sport: v as Sport }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPORTS.map(s => <SelectItem key={s} value={s}>{getSportIcon(s)} {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Bandra West, Mumbai" />
            </div>

            <div className="space-y-1.5">
              <Label>Price per hour (₹) *</Label>
              <Input type="number" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: Number(e.target.value) }))} min={100} step={50} />
            </div>

            <div className="space-y-1.5">
              <Label>Surface type</Label>
              <Input value={form.surface || ""} onChange={e => setForm(f => ({ ...f, surface: e.target.value }))} placeholder="e.g. Artificial Grass" />
            </div>

            <div className="space-y-1.5">
              <Label>Max players</Label>
              <Input type="number" value={form.capacity || 14} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} min={2} max={50} />
            </div>

            <div className="space-y-1.5">
              <Label>Open hour (0–23)</Label>
              <Input type="number" value={form.openHour} onChange={e => setForm(f => ({ ...f, openHour: Number(e.target.value) }))} min={0} max={22} />
            </div>

            <div className="space-y-1.5">
              <Label>Close hour (0–23)</Label>
              <Input type="number" value={form.closeHour} onChange={e => setForm(f => ({ ...f, closeHour: Number(e.target.value) }))} min={1} max={23} />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Turf Image</Label>
              {/* Tab switcher */}
              <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
                {(["upload", "url"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setImageTab(t)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${imageTab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
                    {t === "upload" ? "📁 Upload" : "🔗 URL"}
                  </button>
                ))}
              </div>

              {imageTab === "upload" ? (
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 py-6 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Upload className="h-5 w-5" />
                    <span>Click to upload from device <span className="text-xs">(max 5MB)</span></span>
                  </button>
                </div>
              ) : (
                <Input
                  value={form.image.startsWith("data:") ? "" : form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value, images: [e.target.value, ...(f.images?.slice(1) || [])] }))}
                  placeholder="https://images.unsplash.com/..."
                />
              )}

              {/* Preview */}
              {form.image && (
                <div className="relative mt-1 rounded-xl overflow-hidden">
                  <img src={form.image} alt="Preview" className="h-32 w-full object-cover rounded-xl"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: blank.image, images: [blank.image] }))}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    {form.image.startsWith("data:") ? "Local upload" : "URL"}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the venue, its facilities, and what makes it special…"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label>Amenities</Label>
              <div className="flex gap-2">
                <Input
                  value={amenityInput}
                  onChange={e => setAmenityInput(e.target.value)}
                  placeholder="e.g. Floodlights"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addAmenity} className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.amenities.map(a => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                    <Check className="h-3 w-3" /> {a}
                    <button type="button" onClick={() => removeAmenity(a)} className="ml-0.5 text-primary/60 hover:text-primary">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gap-1.5">
              {editing ? <><Pencil className="h-4 w-4" />Update Turf</> : <><Plus className="h-4 w-4" />Add Turf</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete Turf
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This will permanently delete the turf and all associated data. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && remove(deleteConfirm)} className="gap-1.5">
              <Trash2 className="h-4 w-4" /> Delete Turf
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
