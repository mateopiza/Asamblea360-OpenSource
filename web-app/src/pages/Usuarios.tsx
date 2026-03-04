import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Shield, Eye, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserWithRole {
  user_id: string;
  role: string;
  copropiedad_id: string | null;
  profile: { full_name: string | null; avatar_url: string | null; onboarding_completed: boolean } | null;
  email?: string;
}

export default function Usuarios() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("admin");
  const [copropiedadId, setCopropiedadId] = useState<string>("");
  const [copropiedades, setCopropiedades] = useState<{ id: string; nombre: string }[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const isSuperAdmin = hasRole("superadmin");

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchUsers();
    fetchCopropiedades();
  }, [isSuperAdmin]);

  const fetchCopropiedades = async () => {
    const { data } = await supabase.from("copropiedades").select("id, nombre").order("nombre");
    if (data) setCopropiedades(data);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role, copropiedad_id");

    if (rolesData) {
      const userIds = [...new Set(rolesData.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, onboarding_completed")
        .in("user_id", userIds);

      const merged: UserWithRole[] = rolesData.map((r) => ({
        ...r,
        profile: profiles?.find((p) => p.user_id === r.user_id) || null,
      }));
      setUsers(merged);
    }
    setLoadingUsers(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role, copropiedad_id: copropiedadId || null },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Invitación enviada", description: `Se envió invitación a ${email}` });
      setEmail("");
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  const roleIcon = (r: string) => {
    if (r === "superadmin") return <ShieldCheck className="h-4 w-4" />;
    if (r === "admin") return <Shield className="h-4 w-4" />;
    return <Eye className="h-4 w-4" />;
  };

  const roleBadgeVariant = (r: string) => {
    if (r === "superadmin") return "default";
    if (r === "admin") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-1">Invita y administra los usuarios del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitar nuevo usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-40 space-y-1">
              <Label>Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48 space-y-1">
              <Label>Copropiedad (opcional)</Label>
              <Select value={copropiedadId} onValueChange={setCopropiedadId}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {copropiedades.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Invitar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Onboarding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow key={`${u.user_id}-${u.role}-${i}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {u.profile?.full_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span>{u.profile?.full_name ?? "Sin nombre"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(u.role) as any} className="gap-1">
                        {roleIcon(u.role)}
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.profile?.onboarding_completed ? "default" : "outline"}>
                        {u.profile?.onboarding_completed ? "Completo" : "Pendiente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
