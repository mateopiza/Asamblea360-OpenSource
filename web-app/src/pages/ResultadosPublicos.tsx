import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { CheckCircle, Vote, Users, TrendingUp } from "lucide-react";

interface OpcionResult {
  opcion: string;
  votos: number;
  coeficiente: number;
}

interface PreguntaResult {
  id: string;
  titulo: string;
  tipo_calculo: string;
  activa: boolean;
  opciones: OpcionResult[];
  total_votos: number;
  total_coeficiente: number;
}

interface QuorumData {
  coeficiente_acreditado: number;
  coeficiente_total: number;
  participantes_acreditados: number;
  participantes_total: number;
}

interface ResultadosData {
  status: string;
  asamblea: {
    id: string;
    titulo: string;
    estado: string;
    fecha_inicio: string | null;
  };
  copropiedad: {
    nombre: string;
    logo_url: string | null;
    direccion: string | null;
  };
  quorum: QuorumData;
  preguntas: PreguntaResult[];
}

const COLORS = [
  "hsl(142, 76%, 46%)",  // green
  "hsl(0, 84%, 60%)",    // red
  "hsl(45, 93%, 58%)",   // yellow
  "hsl(217, 91%, 60%)",  // blue
  "hsl(280, 67%, 55%)",  // purple
  "hsl(25, 95%, 53%)",   // orange
];

const TIPO_CALCULO_LABELS: Record<string, string> = {
  mayoria_simple: "Mayoría Simple",
  coeficiente: "Por Coeficiente",
  unanimidad: "Unanimidad",
};

function determinarGanador(pregunta: PreguntaResult): string | null {
  if (pregunta.total_votos === 0) return null;

  const { tipo_calculo, opciones, total_votos, total_coeficiente } = pregunta;

  if (tipo_calculo === "unanimidad") {
    if (opciones.length === 1 && opciones[0].votos === total_votos) {
      return opciones[0].opcion;
    }
    return null;
  }

  if (tipo_calculo === "coeficiente") {
    const sorted = [...opciones].sort((a, b) => b.coeficiente - a.coeficiente);
    if (sorted.length > 0 && total_coeficiente > 0) {
      const pct = (sorted[0].coeficiente / total_coeficiente) * 100;
      if (pct > 50) return sorted[0].opcion;
    }
    return null;
  }

  // mayoria_simple
  const sorted = [...opciones].sort((a, b) => b.votos - a.votos);
  if (sorted.length > 0) {
    const pct = (sorted[0].votos / total_votos) * 100;
    if (pct > 50) return sorted[0].opcion;
  }
  return null;
}

export default function ResultadosPublicos() {
  const { asambleaId } = useParams<{ asambleaId: string }>();
  const [data, setData] = useState<ResultadosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResultados = useCallback(async () => {
    if (!asambleaId) return;
    const { data: result, error: err } = await supabase.rpc(
      "obtener_resultados_votacion" as any,
      { p_asamblea_id: asambleaId } as any
    );
    if (err) {
      setError(err.message);
    } else {
      const parsed = result as unknown as ResultadosData;
      if (parsed?.status === "error") {
        setError((parsed as any).message);
      } else {
        setData(parsed);
        setError(null);
      }
    }
    setLoading(false);
  }, [asambleaId]);

  useEffect(() => {
    fetchResultados();
    const interval = setInterval(fetchResultados, 5000);

    const channel = supabase
      .channel("resultados-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registro_votos" },
        () => fetchResultados()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchResultados]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,8%)] text-white flex items-center justify-center">
        <div className="space-y-4 w-full max-w-3xl px-6">
          <Skeleton className="h-12 w-2/3 bg-white/10" />
          <Skeleton className="h-6 w-1/3 bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,8%)] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-white/60 text-lg">{error || "No se encontraron datos"}</p>
        </div>
      </div>
    );
  }

  const quorumPct =
    data.quorum.coeficiente_total > 0
      ? (data.quorum.coeficiente_acreditado / data.quorum.coeficiente_total) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[hsl(222,47%,8%)] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {data.asamblea.titulo}
            </h1>
            <p className="text-white/50 text-lg mt-1">
              {data.copropiedad.nombre}
              {data.copropiedad.direccion && ` — ${data.copropiedad.direccion}`}
            </p>
          </div>
          <Badge
            className={`text-sm px-3 py-1 ${
              data.asamblea.estado === "en_curso"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}
          >
            {data.asamblea.estado === "en_curso" ? "EN VIVO" : data.asamblea.estado.toUpperCase()}
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Quorum Card */}
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-blue-400" />
              Quórum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm text-white/70">
              <span>
                {data.quorum.participantes_acreditados} de {data.quorum.participantes_total} participantes acreditados
              </span>
              <span className="font-mono font-bold text-white">
                {quorumPct.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={quorumPct}
              className="h-4 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400"
            />
            <p className="text-xs text-white/40">
              Coeficiente: {Number(data.quorum.coeficiente_acreditado).toFixed(4)} / {Number(data.quorum.coeficiente_total).toFixed(4)}
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        {data.preguntas.length === 0 && (
          <div className="text-center py-16 text-white/40 text-xl">
            No hay preguntas registradas para esta asamblea
          </div>
        )}

        {data.preguntas.map((pregunta) => {
          const ganador = determinarGanador(pregunta);
          const usaCoeficiente = pregunta.tipo_calculo === "coeficiente";

          const chartData = pregunta.opciones.map((op, i) => ({
            name: op.opcion,
            value: usaCoeficiente ? Number(op.coeficiente) : op.votos,
            votos: op.votos,
            coeficiente: Number(op.coeficiente),
            fill: COLORS[i % COLORS.length],
            isGanador: op.opcion === ganador,
          }));

          const totalValue = usaCoeficiente
            ? pregunta.total_coeficiente
            : pregunta.total_votos;

          return (
            <Card
              key={pregunta.id}
              className={`bg-white/5 border-white/10 text-white transition-all duration-500 ${
                pregunta.activa ? "ring-1 ring-green-500/30" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl md:text-2xl leading-tight">
                    {pregunta.titulo}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    {pregunta.activa && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        ACTIVA
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-white/60 border-white/20 text-xs"
                    >
                      {TIPO_CALCULO_LABELS[pregunta.tipo_calculo] || pregunta.tipo_calculo}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pregunta.total_votos === 0 ? (
                  <div className="text-center py-8 text-white/30 text-lg">
                    <Vote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Sin votos registrados
                  </div>
                ) : (
                  <>
                    <div className="w-full" style={{ height: Math.max(chartData.length * 56, 80) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={120}
                            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                            {chartData.map((entry, idx) => (
                              <Cell
                                key={idx}
                                fill={entry.fill}
                                opacity={entry.isGanador ? 1 : 0.6}
                              />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="right"
                              formatter={(val: number) => {
                                if (totalValue === 0) return "0%";
                                const pct = ((val / totalValue) * 100).toFixed(1);
                                return usaCoeficiente
                                  ? `${pct}% (${val.toFixed(2)})`
                                  : `${pct}% (${val})`;
                              }}
                              style={{ fill: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Winner indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <TrendingUp className="h-4 w-4" />
                        {pregunta.total_votos} voto{pregunta.total_votos !== 1 && "s"} emitido{pregunta.total_votos !== 1 && "s"}
                      </div>
                      {ganador ? (
                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                          <CheckCircle className="h-5 w-5" />
                          Aprobada: {ganador}
                        </div>
                      ) : (
                        <div className="text-yellow-400/70 text-sm font-medium">
                          {pregunta.tipo_calculo === "unanimidad"
                            ? "No hay unanimidad"
                            : "Sin mayoría definida"}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-white/20 text-xs">
        Actualización automática en tiempo real · Powered by Vera
      </footer>
    </div>
  );
}
