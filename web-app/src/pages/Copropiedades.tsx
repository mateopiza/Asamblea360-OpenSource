import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Copropiedad = Database["public"]["Tables"]["copropiedades"]["Row"];

export default function Copropiedades() {
  const [items, setItems] = useState<Copropiedad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Copropiedad | null>(null);
  const [form, setForm] = useState({ nombre: "", nit: "", direccion: "", email_contacto: "" });
  const { toast } = useToast();

  const fetch = async () => {
    const { data } = await supabase.from("copropiedades").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (editing) {
      const { error } = await supabase.from("copropiedades").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("copropiedades").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    setOpen(false);
    setEditing(null);
    setForm({ nombre: "", nit: "", direccion: "", email_contacto: "" });
    fetch();
    toast({ title: editing ? "Actualizado" : "Creado" });
  };

  const handleEdit = (item: Copropiedad) => {
    setEditing(item);
    setForm({ nombre: item.nombre, nit: item.nit ?? "", direccion: item.direccion ?? "", email_contacto: item.email_contacto ?? "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("copropiedades").delete().eq("id", id);
    fetch();
    toast({ title: "Eliminado" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Copropiedades</h1>
          <p className="text-muted-foreground mt-1">Gestiona las copropiedades del sistema</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ nombre: "", nit: "", direccion: "", email_contacto: "" }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nueva</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Nueva"} Copropiedad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="space-y-2"><Label>NIT</Label><Input value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Dirección</Label><Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email Contacto</Label><Input value={form.email_contacto} onChange={(e) => setForm({ ...form, email_contacto: e.target.value })} /></div>
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
                <TableHead>Nombre</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay copropiedades registradas</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
                  <TableCell>{item.nit}</TableCell>
                  <TableCell>{item.direccion}</TableCell>
                  <TableCell>{item.email_contacto}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
