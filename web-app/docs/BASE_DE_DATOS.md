# Base de Datos — Asamblea360

Documentación completa del esquema de base de datos, políticas de seguridad (RLS), funciones, triggers y configuración del backend.

> **Última actualización:** 2026-02-26

---

## Enum `app_role`

```sql
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'viewer');
```

---

## Tablas

### 1. `copropiedades`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| nombre | varchar | No | — |
| nit | varchar | Sí | — |
| direccion | varchar | Sí | — |
| email_contacto | varchar | Sí | — |
| logo_url | varchar | Sí | — |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read copropiedades | SELECT | `true` | — |
| Admins manage copropiedades | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 2. `unidades`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| copropiedad_id | uuid (FK → copropiedades) | No | — |
| identificador | varchar | Sí | — |
| tipo | varchar | Sí | — |
| propietario_nombre | varchar | Sí | — |
| coeficiente | numeric | No | `0` |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read unidades | SELECT | `true` | — |
| Admins manage unidades | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 3. `asambleas`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| copropiedad_id | uuid (FK → copropiedades) | No | — |
| titulo | varchar | No | `'Asamblea'` |
| estado | varchar | No | `'programada'` |
| fecha_inicio | timestamptz | Sí | — |
| fecha_fin | timestamptz | Sí | — |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Valores de `estado`:** `programada`, `en_curso`, `finalizada`

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read asambleas | SELECT | `true` | — |
| Admins manage asambleas | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 4. `participantes_asamblea`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| asamblea_id | uuid (FK → asambleas) | No | — |
| unidad_id | uuid (FK → unidades) | No | — |
| participante_nombre | varchar | No | — |
| email | varchar | Sí | — |
| telefono | varchar | Sí | — |
| qr_token | varchar | Sí | `gen_random_uuid()::text` |
| estado_acreditacion | varchar | No | `'sin_acreditar'` |
| acreditado_en | timestamptz | Sí | — |
| delegado | boolean | Sí | `false` |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Valores de `estado_acreditacion`:** `sin_acreditar`, `pendiente_otp`, `acreditado`, `bloqueado`

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read participantes | SELECT | `true` | — |
| Admins manage participantes | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 5. `preguntas`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| asamblea_id | uuid (FK → asambleas) | No | — |
| titulo | varchar | No | — |
| tipo_calculo | varchar | No | `'mayoria_simple'` |
| activa | boolean | Sí | `false` |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Valores de `tipo_calculo`:** `mayoria_simple`, `coeficiente`, `unanimidad`

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read preguntas | SELECT | `true` | — |
| Admins manage preguntas | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 6. `registro_votos`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| pregunta_id | uuid (FK → preguntas) | No | — |
| participante_id | uuid (FK → participantes_asamblea) | No | — |
| opcion | varchar | No | — |
| fecha_voto | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Admins can read votos | SELECT | `is_admin_or_superadmin(auth.uid())` | — |
| Service can insert votos | INSERT | — | `true` |

⚠️ **Operaciones restringidas:** No hay políticas para UPDATE ni DELETE.

---

### 7. `resultados_pregunta`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| pregunta_id | uuid (FK → preguntas) | No | — |
| resultados | jsonb | Sí | `'{}'::jsonb` |
| updated_at | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Anyone can read resultados | SELECT | `true` | — |
| Admins manage resultados | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 8. `delegaciones`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| asamblea_id | uuid (FK → asambleas) | No | — |
| participante_id | uuid (FK → participantes_asamblea) | No | — |
| delegado_a_id | uuid (FK → participantes_asamblea) | Sí | — |
| tipo | varchar | No | `'presencial'` |
| estado | varchar | No | `'pendiente'` |
| documento_url | varchar | Sí | — |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Valores de `estado`:** `pendiente`, `aprobada`, `rechazada`

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read delegaciones | SELECT | `true` | — |
| Admins manage delegaciones | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 9. `soporte_tickets`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| copropiedad_id | uuid (FK → copropiedades) | Sí | — |
| participante_id | uuid (FK → participantes_asamblea) | Sí | — |
| mensaje | text | No | — |
| estado | varchar | No | `'pendiente'` |
| prioridad | varchar | No | `'media'` |
| respuesta_admin | text | Sí | — |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Valores de `estado`:** `pendiente`, `en_proceso`, `resuelto`

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Authenticated can read tickets | SELECT | `true` | — |
| Anon can insert tickets | INSERT | — | `true` |
| Admins manage tickets | ALL | `is_admin_or_superadmin(auth.uid())` | — |

---

### 10. `conversations_history`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| copropiedad_id | uuid (FK → copropiedades) | Sí | — |
| participante_id | uuid (FK → participantes_asamblea) | Sí | — |
| mensaje_whatsapp | text | No | — |
| rol | varchar | No | `'user'` |
| fecha | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Admins can read conversations | SELECT | `is_admin_or_superadmin(auth.uid())` | — |
| Anon can insert conversations | INSERT | — | `true` |

⚠️ **Operaciones restringidas:** No hay políticas para UPDATE ni DELETE.

---

### 11. `profiles`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| user_id | uuid | No | — |
| full_name | text | Sí | — |
| avatar_url | text | Sí | — |
| onboarding_completed | boolean | No | `false` |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Anyone can view profiles | SELECT | `true` | — |
| Users can insert own profile | INSERT | — | `auth.uid() = user_id` |
| Users can update own profile | UPDATE | `auth.uid() = user_id` | — |

⚠️ **Operaciones restringidas:** No hay política para DELETE.

---

### 12. `user_roles`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| user_id | uuid | No | — |
| role | app_role | No | — |
| copropiedad_id | uuid (FK → copropiedades) | Sí | — |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Users can view own roles | SELECT | `auth.uid() = user_id` | — |
| Superadmins manage all roles | ALL | `has_role(auth.uid(), 'superadmin')` | — |

---

### 13. `audit_logs`

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| id | uuid | No | `gen_random_uuid()` |
| user_id | uuid | Sí | — |
| tabla | varchar | No | — |
| accion | varchar | No | — |
| registro_id | uuid | Sí | — |
| copropiedad_id | uuid (FK → copropiedades) | Sí | — |
| datos_previos | jsonb | Sí | — |
| datos_nuevos | jsonb | Sí | — |
| created_at | timestamptz | No | `now()` |

**Políticas RLS:**

| Política | Comando | USING | WITH CHECK |
|----------|---------|-------|------------|
| Superadmins can read audit logs | SELECT | `has_role(auth.uid(), 'superadmin')` | — |
| Authenticated can insert audit logs | INSERT | — | `true` |

⚠️ **Operaciones restringidas:** No hay políticas para UPDATE ni DELETE.

---

## Funciones de Base de Datos

### `has_role(_user_id, _role)`

Verifica si un usuario tiene un rol específico.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;
```

### `is_admin_or_superadmin(_user_id)`

Verifica si un usuario es admin o superadmin.

```sql
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'superadmin')
  )
$function$;
```

### `acreditar_participante(p_qr_token)`

Acredita un participante dado su token QR. Retorna JSON con status y datos.

```sql
CREATE OR REPLACE FUNCTION public.acreditar_participante(p_qr_token character varying)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_participante RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_participante
  FROM public.participantes_asamblea
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'QR inválido');
  END IF;

  IF v_participante.estado_acreditacion = 'acreditado' THEN
    RETURN jsonb_build_object('status', 'already', 'message', 'Ya acreditado',
      'nombre', v_participante.participante_nombre);
  END IF;

  IF v_participante.estado_acreditacion = 'bloqueado' THEN
    RETURN jsonb_build_object('status', 'blocked', 'message', 'Participante bloqueado');
  END IF;

  UPDATE public.participantes_asamblea
  SET estado_acreditacion = 'acreditado', acreditado_en = now()
  WHERE id = v_participante.id;

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Acreditación exitosa',
    'nombre', v_participante.participante_nombre,
    'unidad_id', v_participante.unidad_id
  );
END;
$function$;
```

### `handle_new_user()`

Función trigger para crear automáticamente un perfil cuando se registra un nuevo usuario.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$function$;
```

### `update_updated_at_column()`

Función trigger para actualizar automáticamente la columna `updated_at`.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
```

---

## Triggers

> ⚠️ **Estado actual:** No hay triggers registrados en la base de datos.
>
> La función `handle_new_user()` existe pero **no está vinculada** a la tabla `auth.users` como trigger.
> Esto significa que los perfiles no se crean automáticamente al registrarse un usuario nuevo.
>
> La función `update_updated_at_column()` tampoco está vinculada a ninguna tabla como trigger.

---

## Storage Buckets

> No hay buckets de almacenamiento configurados actualmente.

---

## Secrets Configurados

Los siguientes secrets están configurados en el proyecto (solo nombres, sin valores):

| Secret | Descripción |
|--------|-------------|
| `SUPABASE_ANON_KEY` | Clave pública (anon) del proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (privilegiada) |
| `SUPABASE_DB_URL` | URL de conexión directa a PostgreSQL |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publicable del proyecto |
| `SUPABASE_URL` | URL base del proyecto |
| `LOVABLE_API_KEY` | Clave de API de Lovable |

---

## Realtime

La tabla `registro_votos` está habilitada para Realtime, usada por la pantalla de resultados públicos (`/resultados/:asambleaId`).

---

## Referencias

- [Arquitectura Técnica](./ARQUITECTURA.md)
- [API y Edge Functions](./API.md)
- [Flujos de Negocio](./FLUJOS.md)
