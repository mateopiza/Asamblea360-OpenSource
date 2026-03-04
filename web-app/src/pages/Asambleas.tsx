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
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Asamblea = Database["public"]["Tables"]["asambleas"]["Row"];
type Copropiedad = Database["public"]["Tables"]["copropiedades"]["Row"];

const estadoBadge: Record<string, string> = {
  programada: "bg-secondary text-secondary-foreground",
  en_curso: "bg-primary text-primary-foreground",
  finalizada: "bg-muted text-muted-foreground",
};

export default function Asambleas() {
  const [items, setItems] = useState<Asamblea[]>([]);
  const [copropiedades, setCopropiedades] = useState<Copropiedad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asamblea | null>(null);
  const [form, setForm] = useState({ copropiedad_id: "", titulo: "", fecha_inicio: "", estado: "programada" });
  const { toast } = useToast();

  const fetchData = async () => {
    const [a, c] = await Promise.all([
      supabase.from("asambleas").select("*").order("created_at", { ascending: false }),
      supabase.from("copropiedades").select("*"),
    ]);
    if (a.data) setItems(a.data);
    if (c.data) setCopropiedades(c.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const payload = { ...form, fecha_inicio: form.fecha_inicio || null };
    if (editing) {
      const { error } = await supabase.from("asambleas").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("asambleas").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    setOpen(false); setEditing(null); setForm({ copropiedad_id: "", titulo: "", fecha_inicio: "", estado: "programada" });
    fetchData();
  };

  const handleEdit = (item: Asamblea) => {
    setEditing(item);
    setForm({ copropiedad_id: item.copropiedad_id, titulo: item.titulo, fecha_inicio: item.fecha_inicio?.slice(0, 16) ?? "", estado: item.estado });
    setOpen(true);
  };

  const copName = (id: string) => copropiedades.find((c) => c.id === id)?.nombre ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asambleas</h1>
          <p className="text-muted-foreground mt-1">Gestiona las asambleas programadas</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nueva</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} Asamblea</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Copropiedad *</Label>
                <Select value={form.copropiedad_id} onValueChange={(v) => setForm({ ...form, copropiedad_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{copropiedades.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Fecha Inicio</Label><Input type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="en_curso">En curso</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Guardar" : "Crear"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Copropiedad</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay asambleas</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{copName(item.copropiedad_id)}</TableCell>
                  <TableCell className="font-medium">{item.titulo}</TableCell>
                  <TableCell>{item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleString("es-CO") : "—"}</TableCell>
                  <TableCell><Badge className={estadoBadge[item.estado] ?? ""}>{item.estado}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => supabase.from("asambleas").delete().eq("id", item.id).then(() => fetchData())}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
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
