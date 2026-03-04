import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Unidad = Database["public"]["Tables"]["unidades"]["Row"];
type Copropiedad = Database["public"]["Tables"]["copropiedades"]["Row"];

export default function Unidades() {
  const [items, setItems] = useState<Unidad[]>([]);
  const [copropiedades, setCopropiedades] = useState<Copropiedad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unidad | null>(null);
  const [form, setForm] = useState({ copropiedad_id: "", tipo: "", identificador: "", propietario_nombre: "", coeficiente: "0" });
  const { toast } = useToast();

  const fetchData = async () => {
    const [u, c] = await Promise.all([
      supabase.from("unidades").select("*").order("created_at", { ascending: false }),
      supabase.from("copropiedades").select("*"),
    ]);
    if (u.data) setItems(u.data);
    if (c.data) setCopropiedades(c.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const payload = { ...form, coeficiente: parseFloat(form.coeficiente) || 0 };
    if (editing) {
      const { error } = await supabase.from("unidades").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("unidades").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    setOpen(false); setEditing(null); setForm({ copropiedad_id: "", tipo: "", identificador: "", propietario_nombre: "", coeficiente: "0" });
    fetchData();
  };

  const handleEdit = (item: Unidad) => {
    setEditing(item);
    setForm({ copropiedad_id: item.copropiedad_id, tipo: item.tipo ?? "", identificador: item.identificador ?? "", propietario_nombre: item.propietario_nombre ?? "", coeficiente: String(item.coeficiente) });
    setOpen(true);
  };

  const copName = (id: string) => copropiedades.find((c) => c.id === id)?.nombre ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unidades</h1>
          <p className="text-muted-foreground mt-1">Unidades inmobiliarias por copropiedad</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nueva</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} Unidad</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Copropiedad *</Label>
                <Select value={form.copropiedad_id} onValueChange={(v) => setForm({ ...form, copropiedad_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{copropiedades.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Identificador</Label><Input value={form.identificador} onChange={(e) => setForm({ ...form, identificador: e.target.value })} placeholder="Ej: Apto 101" /></div>
              <div className="space-y-2"><Label>Tipo</Label><Input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Ej: Apartamento" /></div>
              <div className="space-y-2"><Label>Propietario</Label><Input value={form.propietario_nombre} onChange={(e) => setForm({ ...form, propietario_nombre: e.target.value })} /></div>
              <div className="space-y-2"><Label>Coeficiente</Label><Input type="number" step="0.0001" value={form.coeficiente} onChange={(e) => setForm({ ...form, coeficiente: e.target.value })} /></div>
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
                <TableHead>Identificador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Coeficiente</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay unidades registradas</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{copName(item.copropiedad_id)}</TableCell>
                  <TableCell className="font-medium">{item.identificador}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.propietario_nombre}</TableCell>
                  <TableCell>{item.coeficiente}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => supabase.from("unidades").delete().eq("id", item.id).then(() => fetchData())}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
