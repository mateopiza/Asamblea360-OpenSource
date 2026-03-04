import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Pregunta = Database["public"]["Tables"]["preguntas"]["Row"];

export default function Preguntas() {
  const [items, setItems] = useState<Pregunta[]>([]);
  const [asambleas, setAsambleas] = useState<{ id: string; titulo: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ asamblea_id: "", titulo: "", tipo_calculo: "mayoria_simple" });
  const { toast } = useToast();

  const fetchData = async () => {
    const [p, a] = await Promise.all([
      supabase.from("preguntas").select("*").order("created_at", { ascending: false }),
      supabase.from("asambleas").select("id, titulo"),
    ]);
    if (p.data) setItems(p.data);
    if (a.data) setAsambleas(a.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const { error } = await supabase.from("preguntas").insert(form);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setOpen(false); setForm({ asamblea_id: "", titulo: "", tipo_calculo: "mayoria_simple" });
    fetchData();
  };

  const toggleActiva = async (id: string, activa: boolean) => {
    await supabase.from("preguntas").update({ activa: !activa }).eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preguntas</h1>
          <p className="text-muted-foreground mt-1">Gestiona las preguntas de votación</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nueva</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva Pregunta</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Asamblea *</Label>
                <Select value={form.asamblea_id} onValueChange={(v) => setForm({ ...form, asamblea_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{asambleas.map((a) => <SelectItem key={a.id} value={a.id}>{a.titulo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Tipo de cálculo</Label>
                <Select value={form.tipo_calculo} onValueChange={(v) => setForm({ ...form, tipo_calculo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mayoria_simple">Mayoría Simple</SelectItem>
                    <SelectItem value="coeficiente">Por Coeficiente</SelectItem>
                    <SelectItem value="unanimidad">Unanimidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">Crear</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo Cálculo</TableHead>
                <TableHead>Activa</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sin preguntas</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.titulo}</TableCell>
                  <TableCell><Badge variant="outline">{item.tipo_calculo}</Badge></TableCell>
                  <TableCell>
                    <Switch checked={item.activa ?? false} onCheckedChange={() => toggleActiva(item.id, item.activa ?? false)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => supabase.from("preguntas").delete().eq("id", item.id).then(() => fetchData())}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
