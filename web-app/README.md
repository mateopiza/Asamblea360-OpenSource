# 🌐 VERA Web App

Aplicación web para gestión integral de asambleas de propiedad horizontal.

## ✨ Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Panel de resumen con estadísticas generales |
| **Copropiedades** | CRUD completo de conjuntos residenciales |
| **Unidades** | Gestión de unidades inmobiliarias con coeficiente |
| **Asambleas** | Creación y administración de asambleas |
| **Participantes** | Registro de participantes con estados de acreditación |
| **Acreditación QR** | Verificación por escaneo de QR o token manual |
| **Preguntas** | Gestión de votaciones con diferentes tipos de cálculo |
| **Resultados Públicos** | Pantalla de proyección en tiempo real |
| **Delegaciones** | Registro de poderes de representación |
| **Soporte** | Sistema de tickets |
| **Usuarios** | Gestión de usuarios y roles |

## 🏗 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **React 18** | Framework de UI |
| **TypeScript** | Tipado estático |
| **Vite** | Bundler y dev server |
| **Tailwind CSS** | Estilos utilitarios |
| **shadcn/ui** | Componentes de UI |
| **Supabase** | Backend, auth y base de datos |
| **React Router v6** | Enrutamiento |
| **TanStack Query** | Cache y sincronización |
| **Recharts** | Gráficas |
| **html5-qrcode** | Escaneo de QR |

## 🚀 Instalación

```bash
cd web-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

## 📋 Variables de Entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-publica
VITE_SUPABASE_PROJECT_ID=tu-project-id
```

## 🗄 Modelo de Datos

### Tablas Principales

- `copropiedades` - Conjuntos residenciales
- `unidades` - Unidades inmobiliarias
- `asambleas` - Eventos de asamblea
- `participantes_asamblea` - Participantes registrados
- `preguntas` - Preguntas de votación
- `registro_votos` - Votos registrados
- `user_roles` - Roles de usuario (superadmin, admin, viewer)

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **SuperAdmin** | Acceso total, gestión de usuarios |
| **Admin** | CRUD en copropiedades, asambleas, participantes |
| **Viewer** | Solo lectura |

## 📁 Estructura

```
web-app/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas de la aplicación
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilidades
│   └── integrations/   # Integración con Supabase
├── supabase/
│   ├── migrations/     # Migraciones SQL
│   └── functions/      # Edge Functions
└── public/             # Assets estáticos
```

## 📝 Licencia

MIT License - Ver [LICENSE](../LICENSE)
