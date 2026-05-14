import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { store, type Turf, type Sport } from "@/lib/mock-data";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/turfs")({
  component: TurfManagement,
});

const SPORTS: Sport[] = ["Football", "Cricket", "Badminton", "Tennis", "Basketball"];
const blank: Omit<Turf, "id"> = { name: "", sport: "Football", description: "", location: "", pricePerHour: 1000, rating: 4.5, reviews: 0, image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80", amenities: ["Floodlights","Parking"], openHour: 6, closeHour: 23 };

function TurfManagement() {
  const [turfs, setTurfs] = useState<Turf[]>(() => store.getTurfs());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Turf | null>(null);
  const [form, setForm] = useState<Omit<Turf, "id">>(blank);

  const openCreate = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (t: Turf) => { setEditing(t); const { id, ...rest } = t; setForm(rest); setOpen(true); };

  const save = () => {
    if (!form.name || !form.location) { toast.error("Name and location are required"); return; }
    let next: Turf[];
    if (editing) {
      next = turfs.map((t) => t.id === editing.id ? { ...editing, ...form } : t);
      toast.success("Turf updated");
    } else {
      next = [{ id: "t" + Date.now(), ...form }, ...turfs];
      toast.success("Turf added");
    }
    setTurfs(next); store.saveTurfs(next); setOpen(false);
  };

  const remove = (id: string) => {
    const next = turfs.filter((t) => t.id !== id);
    setTurfs(next); store.saveTurfs(next); toast.success("Turf deleted");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turf Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit and configure your venues.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add turf</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit turf" : "Add new turf"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Sport</Label>
                <Select value={form.sport} onValueChange={(v) => setForm({...form, sport: v as Sport})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Price / hour (₹)</Label><Input type="number" value={form.pricePerHour} onChange={(e)=>setForm({...form, pricePerHour: Number(e.target.value)})} /></div>
              <div className="space-y-1.5"><Label>Image URL</Label><Input value={form.image} onChange={(e)=>setForm({...form, image: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Open hour (0-23)</Label><Input type="number" value={form.openHour} onChange={(e)=>setForm({...form, openHour: Number(e.target.value)})} /></div>
              <div className="space-y-1.5"><Label>Close hour (0-23)</Label><Input type="number" value={form.closeHour} onChange={(e)=>setForm({...form, closeHour: Number(e.target.value)})} /></div>
              <div className="sm:col-span-2 space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} /></div>
              <div className="sm:col-span-2 space-y-1.5"><Label>Amenities (comma-separated)</Label><Input value={form.amenities.join(", ")} onChange={(e)=>setForm({...form, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save changes" : "Add turf"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {turfs.map((t) => (
          <Card key={t.id} className="overflow-hidden p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
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
              <div className="mt-3 flex items-center justify-between">
                <div><span className="text-base font-bold">₹{t.pricePerHour.toLocaleString("en-IN")}</span><span className="text-xs text-muted-foreground">/hr</span></div>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="outline" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
