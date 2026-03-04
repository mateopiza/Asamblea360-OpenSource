# Arquitectura Técnica — Asamblea360

## Visión General

Asamblea360 es una **Single Page Application (SPA)** construida con React + TypeScript que se conecta a un backend serverless provisto por Lovable Cloud (Supabase).

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  React 18 + Vite + Tailwind + shadcn/ui     │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Pages   │ │Components│ │   Hooks      │ │
│  │ (13 pgs) │ │ (UI+App) │ │ (useAuth,etc)│ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       └─────────────┴──────────────┘         │
│                     │                         │
│           supabase client SDK                │
└─────────────────────┬───────────────────────┘
                      │ HTTPS
┌─────────────────────┴───────────────────────┐
│                  BACKEND                     │
│              Lovable Cloud                   │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │PostgreSQL│ │   Auth   │ │Edge Functions│ │
│  │ (13 tbl) │ │ (JWT+RLS)│ │(invite-user) │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────────────────────┐   │
│  │ Realtime │ │    Row Level Security    │   │
│  │ (votos)  │ │  (policies por tabla)    │   │
│  └──────────┘ └──────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## Patrones de diseño

### 1. Autenticación basada en Context
`useAuth()` provee un React Context global con:
- Estado del usuario (user, session, loading)
- Roles (`superadmin | admin | viewer`)
- Perfil (nombre, avatar, onboarding_completed)
- Funciones helper: `hasRole()`, `isAdmin`, `signOut()`

### 2. Rutas protegidas por composición
```tsx
<ProtectedRoute>   → Requiere auth + onboarding completo
<OnboardingRoute>  → Requiere auth, no valida onboarding
<PublicRoute>      → Redirige si ya autenticado
```

### 3. Acceso a datos directo (sin API REST custom)
Cada página consulta directamente la base de datos usando el SDK de Supabase. La seguridad se delega a **RLS policies** en el servidor.

### 4. Edge Functions para operaciones privilegiadas
Operaciones que requieren el `service_role_key` (como invitar usuarios) se ejecutan en Edge Functions serverless.

### 5. Realtime para proyección pública
La pantalla de resultados usa `supabase.channel()` para recibir cambios en `registro_votos` en tiempo real.

## Design System

Tokens CSS definidos en `src/index.css` con variables HSL:
- Paleta S360T oficial (Azul Primario, Azul Profundo, Verde Acento)
- Tipografía: Montserrat (cuerpo) + Roboto Black (títulos)
- Espaciado base 8px (compatible con Tailwind `gap-2`, `p-4`, etc.)
- Sidebar dark theme separado con tokens `--sidebar-*`

## Componentes UI

Se usa **shadcn/ui** como base, que provee componentes Radix UI con estilos Tailwind. Los componentes están en `src/components/ui/` y se personalizan via CSS variables.

## Base de Datos

Para la documentación completa del esquema de tablas, políticas RLS, funciones y configuración, ver **[docs/BASE_DE_DATOS.md](./BASE_DE_DATOS.md)**.
