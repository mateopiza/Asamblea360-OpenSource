import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type Delegacion = Database["public"]["Tables"]["delegaciones"]["Row"];

const estadoColor: Record<string, string> = {
  pendiente: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
  aprobada: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  rechazada: "bg-destructive/15 text-destructive",
};

export default function Delegaciones() {
  const [items, setItems] = useState<Delegacion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("delegaciones").select("*").order("created_at", { ascending: false });
      if (data) setItems(data);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delegaciones</h1>
        <p className="text-muted-foreground mt-1">Poderes de representación y delegaciones</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sin delegaciones</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="capitalize">{item.tipo}</TableCell>
                  <TableCell><Badge className={estadoColor[item.estado] ?? ""}>{item.estado}</Badge></TableCell>
                  <TableCell>{item.documento_url ? <a href={item.documento_url} target="_blank" className="text-primary underline">Ver</a> : "—"}</TableCell>
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
