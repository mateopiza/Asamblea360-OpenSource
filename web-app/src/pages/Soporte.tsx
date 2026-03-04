import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type Ticket = Database["public"]["Tables"]["soporte_tickets"]["Row"];

const estadoColor: Record<string, string> = {
  pendiente: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
  en_proceso: "bg-primary/15 text-primary",
  resuelto: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
};

export default function Soporte() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("todos");

  const fetchData = async () => {
    const { data } = await supabase.from("soporte_tickets").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filter === "todos" ? items : items.filter((i) => i.estado === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Soporte</h1>
        <p className="text-muted-foreground mt-1">Tickets de soporte de participantes</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["todos", "pendiente", "en_proceso", "resuelto"].map((s) => (
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
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sin tickets</TableCell></TableRow>
              ) : filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[300px] truncate">{item.mensaje}</TableCell>
                  <TableCell><Badge className={estadoColor[item.estado] ?? ""}>{item.estado}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{item.prioridad}</Badge></TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleString("es-CO")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
