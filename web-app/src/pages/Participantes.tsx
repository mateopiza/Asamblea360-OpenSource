import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Participante = Database["public"]["Tables"]["participantes_asamblea"]["Row"];

const estadoBadgeColor: Record<string, string> = {
  sin_acreditar: "bg-secondary text-secondary-foreground",
  pendiente_otp: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
  acreditado: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  bloqueado: "bg-destructive/15 text-destructive",
};

export default function Participantes() {
  const [items, setItems] = useState<Participante[]>([]);
  const [asambleas, setAsambleas] = useState<{ id: string; titulo: string }[]>([]);
  const [unidades, setUnidades] = useState<{ id: string; identificador: string | null }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ asamblea_id: "", unidad_id: "", participante_nombre: "", email: "", telefono: "" });
  const [filter, setFilter] = useState("todos");
  const { toast } = useToast();

  const fetchData = async () => {
    const [p, a, u] = await Promise.all([
      supabase.from("participantes_asamblea").select("*").order("created_at", { ascending: false }),
      supabase.from("asambleas").select("id, titulo"),
      supabase.from("unidades").select("id, identificador"),
    ]);
    if (p.data) setItems(p.data);
    if (a.data) setAsambleas(a.data);
    if (u.data) setUnidades(u.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const { error } = await supabase.from("participantes_asamblea").insert(form);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setOpen(false); setForm({ asamblea_id: "", unidad_id: "", participante_nombre: "", email: "", telefono: "" });
    fetchData();
  };

  const filtered = filter === "todos" ? items : items.filter((i) => i.estado_acreditacion === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participantes</h1>
          <p className="text-muted-foreground mt-1">Participantes de asambleas y su estado de acreditación</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nuevo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Participante</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Asamblea *</Label>
                <Select value={form.asamblea_id} onValueChange={(v) => setForm({ ...form, asamblea_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{asambleas.map((a) => <SelectItem key={a.id} value={a.id}>{a.titulo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidad *</Label>
                <Select value={form.unidad_id} onValueChange={(v) => setForm({ ...form, unidad_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.identificador ?? u.id}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Nombre *</Label><Input value={form.participante_nombre} onChange={(e) => setForm({ ...form, participante_nombre: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Crear</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["todos", "sin_acreditar", "pendiente_otp", "acreditado", "bloqueado"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "todos" ? "Todos" : s.replace("_", " ")}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>QR Token</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin participantes</TableCell></TableRow>
              ) : filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.participante_nombre}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.telefono}</TableCell>
                  <TableCell><Badge className={estadoBadgeColor[item.estado_acreditacion] ?? ""}>{item.estado_acreditacion}</Badge></TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[120px]">{item.qr_token?.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => supabase.from("participantes_asamblea").delete().eq("id", item.id).then(() => fetchData())}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
