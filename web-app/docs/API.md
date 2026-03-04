# API Reference — Asamblea360

## Edge Functions

### POST `/functions/v1/invite-user`

Invita un nuevo usuario al sistema.

**Autenticación:** Bearer token de un usuario con rol `superadmin`

**Request Body:**
```json
{
  "email": "string (requerido)",
  "role": "admin | viewer (requerido)",
  "copropiedad_id": "uuid | null (opcional)"
}
```

**Response 200:**
```json
{
  "success": true,
  "user_id": "uuid",
  "email": "string"
}
```

**Response 401:**
```json
{ "error": "No autorizado" }
```

**Response 403:**
```json
{ "error": "Solo superadmin puede invitar usuarios" }
```

**Response 400:**
```json
{ "error": "Email y rol son requeridos" }
```

---

## Database Functions (RPC)

### `acreditar_participante(p_qr_token: string)`

Acredita un participante usando su token QR.

**Invocación:**
```typescript
const { data, error } = await supabase.rpc("acreditar_participante", {
  p_qr_token: "token-del-qr"
});
```

**Respuesta:**
```json
{
  "status": "success | already | blocked | error",
  "message": "Descripción del resultado",
  "nombre": "Nombre del participante (si aplica)"
}
```

### `has_role(_user_id: uuid, _role: app_role)`

Verifica si un usuario tiene un rol específico.

```typescript
const { data } = await supabase.rpc("has_role", {
  _user_id: "uuid",
  _role: "superadmin"
});
// data: boolean
```

### `is_admin_or_superadmin(_user_id: uuid)`

Verifica si un usuario es admin o superadmin.

```typescript
const { data } = await supabase.rpc("is_admin_or_superadmin", {
  _user_id: "uuid"
});
// data: boolean
```

---

## Tablas — Operaciones CRUD

Todas las operaciones usan el SDK de Supabase con RLS:

```typescript
import { supabase } from "@/integrations/supabase/client";

// SELECT
const { data } = await supabase
  .from("copropiedades")
  .select("*")
  .order("created_at", { ascending: false });

// INSERT
const { error } = await supabase
  .from("copropiedades")
  .insert({ nombre: "Mi Conjunto" });

// UPDATE
const { error } = await supabase
  .from("copropiedades")
  .update({ nombre: "Nuevo Nombre" })
  .eq("id", "uuid");

// DELETE
const { error } = await supabase
  .from("copropiedades")
  .delete()
  .eq("id", "uuid");

// COUNT
const { count } = await supabase
  .from("copropiedades")
  .select("id", { count: "exact", head: true });
```

---

## Realtime

Suscripción a cambios en `registro_votos`:

```typescript
const channel = supabase
  .channel("resultados-realtime")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "registro_votos" },
    (payload) => {
      // Refrescar resultados
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```
