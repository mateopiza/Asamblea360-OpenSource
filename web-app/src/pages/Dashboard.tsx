import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Vote, QrCode, FileText, HelpCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stats {
  copropiedades: number;
  asambleas: number;
  participantes: number;
  acreditados: number;
  preguntas: number;
  tickets: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ copropiedades: 0, asambleas: 0, participantes: 0, acreditados: 0, preguntas: 0, tickets: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const [cop, asm, par, acr, prg, tkt] = await Promise.all([
        supabase.from("copropiedades").select("id", { count: "exact", head: true }),
        supabase.from("asambleas").select("id", { count: "exact", head: true }),
        supabase.from("participantes_asamblea").select("id", { count: "exact", head: true }),
        supabase.from("participantes_asamblea").select("id", { count: "exact", head: true }).eq("estado_acreditacion", "acreditado"),
        supabase.from("preguntas").select("id", { count: "exact", head: true }),
        supabase.from("soporte_tickets").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
      ]);
      setStats({
        copropiedades: cop.count ?? 0,
        asambleas: asm.count ?? 0,
        participantes: par.count ?? 0,
        acreditados: acr.count ?? 0,
        preguntas: prg.count ?? 0,
        tickets: tkt.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Copropiedades", value: stats.copropiedades, icon: Building2, href: "/copropiedades", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { title: "Asambleas", value: stats.asambleas, icon: FileText, href: "/asambleas", iconBg: "bg-accent", iconColor: "text-accent-foreground" },
    { title: "Participantes", value: stats.participantes, icon: Users, href: "/participantes", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { title: "Acreditados", value: stats.acreditados, icon: QrCode, href: "/acreditacion", iconBg: "bg-[hsl(var(--success))]/10", iconColor: "text-[hsl(var(--success))]" },
    { title: "Preguntas", value: stats.preguntas, icon: Vote, href: "/preguntas", iconBg: "bg-accent", iconColor: "text-accent-foreground" },
    { title: "Tickets Pendientes", value: stats.tickets, icon: HelpCircle, href: "/soporte", iconBg: "bg-[hsl(var(--warning))]/10", iconColor: "text-[hsl(var(--warning))]" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de tu gestión de asambleas</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="group cursor-pointer border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
            onClick={() => navigate(card.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
