import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Conversation = Database["public"]["Tables"]["conversations_history"]["Row"];

export default function Conversaciones() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("conversations_history").select("*").order("fecha", { ascending: false }).limit(200);
      if (data) setItems(data);
    };
    fetchData();
  }, []);

  const filtered = search ? items.filter((i) => i.mensaje_whatsapp.toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversaciones</h1>
        <p className="text-muted-foreground mt-1">Historial de chats de WhatsApp (bot Vera)</p>
      </div>

      <Input placeholder="Buscar en mensajes..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Card>
        <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Sin conversaciones</p>
          ) : filtered.map((msg) => (
            <div key={msg.id} className={`flex ${msg.rol === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.rol === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                <p>{msg.mensaje_whatsapp}</p>
                <p className={`text-xs mt-1 ${msg.rol === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                  {new Date(msg.fecha).toLocaleString("es-CO")}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
