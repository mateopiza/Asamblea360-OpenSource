import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Cuenta creada", description: "Revisa tu email para confirmar tu cuenta." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(213,48%,18%)] text-primary-foreground shadow-xl">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Asamblea<span className="text-primary">360</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Soluciones 360 Technology
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              Gestión integral de asambleas de propiedad horizontal
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{isSignUp ? "Crear cuenta" : "Iniciar sesión"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Ingresa tus datos para registrarte" : "Ingresa tus credenciales para acceder"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Tu nombre completo" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
              </Button>
            </form>
            <div className="mt-5 text-center text-sm">
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60">
          © 2026 Soluciones 360 Technology. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
