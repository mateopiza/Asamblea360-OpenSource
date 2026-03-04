# Flujos de Negocio — Asamblea360

## Diagrama General: User Journey

```mermaid
journey
    title Ciclo completo de una Asamblea
    section Configuracion Inicial
      Registrar SuperAdmin: 3: SuperAdmin
      Invitar Admin por email: 4: SuperAdmin
      Completar Onboarding: 5: Admin
    section Preparacion
      Crear Copropiedad: 4: Admin
      Registrar Unidades: 4: Admin
      Crear Asamblea: 5: Admin
      Registrar Participantes: 4: Admin
    section Dia de la Asamblea
      Acreditar por QR: 5: Admin
      Verificar Quorum: 4: Admin
      Activar Preguntas: 5: Admin
      Registrar Votos: 5: Participante
    section Resultados
      Ver Resultados en Tiempo Real: 5: Publico
      Finalizar Asamblea: 4: Admin
```

## Diagrama: Flujo de Invitacion y Onboarding

```mermaid
flowchart TD
    A[SuperAdmin abre /usuarios] --> B[Ingresa email + rol + copropiedad]
    B --> C[Click Invitar]
    C --> D[Edge Function invite-user]
    D --> E{Validacion}
    E -->|Token invalido| F[Error 401]
    E -->|No es superadmin| G[Error 403]
    E -->|OK| H[Invita usuario via Auth API]
    H --> I[Inserta rol en user_roles]
    I --> J[Usuario recibe email]
    J --> K[Click en enlace de invitacion]
    K --> L{onboarding_completed?}
    L -->|false| M[Redirige a /onboarding]
    L -->|true| N[Redirige a /dashboard]
    M --> O[Paso 1: Establecer contrasena]
    O --> P[Paso 2: Completar perfil]
    P --> Q[Paso 3: Confirmacion]
    Q --> N
```

## Diagrama: Flujo de Asamblea Completa

```mermaid
flowchart LR
    subgraph Preparacion
        A[Crear Copropiedad] --> B[Registrar Unidades]
        B --> C[Crear Asamblea]
        C --> D[Registrar Participantes]
    end
    subgraph Ejecucion
        D --> E[Acreditacion QR]
        E --> F{Quorum alcanzado?}
        F -->|No| E
        F -->|Si| G[Activar Preguntas]
        G --> H[Votacion]
    end
    subgraph Resultados
        H --> I[Calculo automatico]
        I --> J[Pantalla publica /resultados]
        J --> K[Finalizar Asamblea]
    end
```

## Diagrama: Proceso de Acreditacion QR

```mermaid
flowchart TD
    A[Admin abre /acreditacion] --> B{Metodo}
    B -->|Camara| C[Escanea codigo QR]
    B -->|Manual| D[Ingresa token QR]
    C --> E[RPC acreditar_participante]
    D --> E
    E --> F{Resultado}
    F -->|success| G[Acreditado exitosamente]
    F -->|already| H[Ya estaba acreditado]
    F -->|blocked| I[Participante bloqueado]
    F -->|error| J[Mensaje de error]
```

## Diagrama: Tipos de Calculo de Votacion

```mermaid
flowchart TD
    A[Pregunta de Votacion] --> B{Tipo de Calculo}
    B -->|Mayoria Simple| C[Mas del 50% de votos]
    B -->|Coeficiente| D[Mas del 50% del coeficiente total]
    B -->|Unanimidad| E[100% votan igual]
    C --> F[Opcion ganadora]
    D --> F
    E --> G{Todos iguales?}
    G -->|Si| F
    G -->|No| H[No aprobada]
```

---

## 1. Configuración Inicial

### 1.1 Registro del SuperAdmin
El primer usuario se registra manualmente y se le asigna el rol `superadmin` directamente en la base de datos.

### 1.2 Invitación de Admins
```
SuperAdmin accede a /usuarios
  → Ingresa email + rol (admin/viewer) + copropiedad (opcional)
  → Click "Invitar"
  → Frontend llama a Edge Function invite-user
  → Edge Function:
      1. Valida token JWT del caller
      2. Verifica rol superadmin en user_roles
      3. Llama auth.admin.inviteUserByEmail(email)
      4. Inserta registro en user_roles
  → Usuario recibe email de invitación
  → Click en enlace → llega a la app
  → Detecta onboarding_completed = false → redirige a /onboarding
```

### 1.3 Onboarding (3 pasos)
```
Paso 1: Establecer contraseña
  → supabase.auth.updateUser({ password })

Paso 2: Completar perfil
  → Ingresa nombre completo
  → UPDATE profiles SET full_name, onboarding_completed = true

Paso 3: Confirmación
  → Click "Ir al Dashboard" → navigate('/dashboard')
```

---

## 2. Gestión de Copropiedades

```
Admin → /copropiedades
  → "Nueva" → Dialog con formulario (nombre*, NIT, dirección, email)
  → INSERT INTO copropiedades
  → Listar en tabla con acciones Editar/Eliminar
```

---

## 3. Gestión de Unidades

```
Admin → /unidades
  → "Nueva" → Seleccionar copropiedad + identificador + tipo + propietario + coeficiente
  → INSERT INTO unidades
  → El coeficiente es un valor numérico que representa la participación en la propiedad
```

---

## 4. Flujo Completo de Asamblea

### 4.1 Crear Asamblea
```
Admin → /asambleas → "Nueva"
  → Seleccionar copropiedad
  → Título, fecha de inicio, estado
  → INSERT INTO asambleas (estado: "programada")
```

### 4.2 Registrar Participantes
```
Admin → /participantes → "Nuevo"
  → Seleccionar asamblea + unidad
  → Nombre, email, teléfono
  → INSERT INTO participantes_asamblea
  → Se genera qr_token automáticamente (gen_random_uuid)
```

### 4.3 Acreditación
```
Admin → /acreditacion
  → Tab "Cámara": Escanea QR del participante
  → Tab "Manual": Ingresa token QR manualmente
  → Llama RPC acreditar_participante(qr_token)
  → Retorna:
      success → "Acreditado exitosamente" + nombre
      already → "Ya estaba acreditado"
      blocked → "Participante bloqueado"
      error   → Mensaje de error
```

### 4.4 Crear Preguntas
```
Admin → /preguntas → "Nueva"
  → Seleccionar asamblea
  → Título de la pregunta
  → Tipo de cálculo: mayoría simple | coeficiente | unanimidad
  → Activar/desactivar con switch
```

### 4.5 Votación
Los votos se registran en `registro_votos` con:
- `pregunta_id`: La pregunta votada
- `participante_id`: Quién votó
- `opcion`: La opción elegida (ej: "Sí", "No", "Abstención")

### 4.6 Resultados en Tiempo Real
```
Pantalla pública → /resultados/:asambleaId (sin auth)
  → Muestra: nombre asamblea, copropiedad, estado
  → Quórum: barra de progreso (coeficiente acreditado / total)
  → Por cada pregunta:
      → Gráfica de barras horizontal
      → Porcentajes por opción
      → Indicador de ganador (si aplica)
  → Actualización: Realtime (postgres_changes) + polling cada 5s
```

---

## 5. Delegaciones

```
Registro de poderes de representación
  → Tipo: presencial
  → Estado: pendiente → aprobada | rechazada
  → Documento de soporte (URL)
  → Asociada a participante + asamblea
```

---

## 6. Soporte

```
Tickets de soporte
  → Mensaje del participante
  → Estado: pendiente → en_proceso → resuelto
  → Prioridad: baja | media | alta
  → Respuesta del admin
  → Filtrado por estado
```

---

## 7. Conversaciones WhatsApp (Bot Vera)

```
Historial de mensajes de WhatsApp
  → Roles: user (participante) | assistant (bot Vera)
  → Búsqueda por texto
  → Vista tipo chat con burbujas
  → Límite de visualización: 200 mensajes
```
