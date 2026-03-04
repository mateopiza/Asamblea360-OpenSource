import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, CheckCircle, AlertTriangle, XCircle, Camera, Keyboard } from "lucide-react";
import QrScanner from "@/components/QrScanner";

type AcreditacionResult = {
  status: "success" | "already" | "blocked" | "error";
  message: string;
  nombre?: string;
};

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
  already: { icon: AlertTriangle, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10" },
  blocked: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Acreditacion() {
  const [qrToken, setQrToken] = useState("");
  const [result, setResult] = useState<AcreditacionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAcreditar = useCallback(async (token: string) => {
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.rpc("acreditar_participante", { p_qr_token: token.trim() });
    setLoading(false);
    if (error) {
      setResult({ status: "error", message: error.message });
    } else {
      setResult(data as unknown as AcreditacionResult);
    }
  }, []);

  const handleManual = () => {
    handleAcreditar(qrToken);
    setQrToken("");
  };

  const config = result ? statusConfig[result.status] : null;
  const Icon = config?.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Acreditación QR</h1>
        <p className="text-muted-foreground mt-1">Escanea o ingresa el token QR del participante</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> Verificar QR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="camera">
            <TabsList className="w-full">
              <TabsTrigger value="camera" className="flex-1 gap-1"><Camera className="h-4 w-4" /> Cámara</TabsTrigger>
              <TabsTrigger value="manual" className="flex-1 gap-1"><Keyboard className="h-4 w-4" /> Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="camera">
              <QrScanner onScanSuccess={handleAcreditar} />
            </TabsContent>
            <TabsContent value="manual">
              <div className="flex gap-2">
                <Input
                  placeholder="Ingresa token QR..."
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManual()}
                  autoFocus
                />
                <Button onClick={handleManual} disabled={loading}>
                  {loading ? "..." : "Verificar"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {result && config && Icon && (
            <div className={`flex items-center gap-3 rounded-lg p-4 ${config.bg}`}>
              <Icon className={`h-8 w-8 ${config.color}`} />
              <div>
                <p className={`font-semibold ${config.color}`}>{result.message}</p>
                {result.nombre && <p className="text-sm text-muted-foreground">{result.nombre}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
