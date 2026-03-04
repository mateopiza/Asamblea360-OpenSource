# 📋 Guía de Configuración VERA

Guía completa para configurar todo el ecosistema VERA en tu entorno.

---

## 📁 Componentes del Sistema

```
VERA Ecosistema
├── 🤖 VERA AI (n8n)         - Asistente WhatsApp
├── 🌐 Web App (React)       - Panel de administración
├── 📱 Baileys Gateway       - Conexión WhatsApp
└── 🗄️ Supabase             - Backend y base de datos
```

---

## ✅ Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (para web-app en desarrollo)
- Cuenta en [Groq](https://console.groq.com)
- Cuenta en [Supabase](https://supabase.com)
- Número de WhatsApp dedicado

---

## 🚀 Instalación Paso a Paso

### Paso 1: Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al SQL Editor y ejecuta las migraciones en orden:
   ```
   web-app/supabase/migrations/*.sql
   ```
3. Obtén las credenciales:
   - **Project URL**: Settings → API → Project URL
   - **Anon Key**: Settings → API → Project API keys → `anon`
   - **Service Role Key**: Settings → API → Project API keys → `service_role`

### Paso 2: Configurar Variables de Entorno

```bash
# En la raíz del proyecto
cp .env.example .env
# Edita .env con todas las variables
```

Variables críticas:
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key

# Web App
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key

# Groq
GROQ_API_KEY=gsk_tu-api-key

# URLs
N8N_WEBHOOK_BASE=https://tu-dominio.com/webhook
APP_QR_BASE=https://tu-dominio.com/qr
APP_ACREDITACION_URL=https://tu-dominio.com
```

### Paso 3: Iniciar Backend (Docker)

```bash
# Solo backend (n8n + Baileys + PostgreSQL + Redis)
docker-compose up -d

# O incluyendo web-app
docker-compose --profile web up -d
```

Servicios disponibles:
- n8n: http://localhost:5678
- Baileys: http://localhost:3006
- Web App (si usas profile web): http://localhost:3000

### Paso 4: Configurar n8n

1. Accede a http://localhost:5678
2. Crea tu cuenta de usuario
3. Ve a **Settings** → **Variables** y agrega:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `BAILEYS_URL`
   - `N8N_WEBHOOK_BASE`
   - `APP_QR_BASE`
   - `APP_ACREDITACION_URL`
   - `RESEND_API_KEY`

4. Ve a **Credentials** y crea:
   - **Groq** → API Key de https://console.groq.com/keys
   - **PostgreSQL** → Datos de Supabase
   - **Redis** → Host: `redis`, Port: `6379`

5. Importa el workflow:
   - **Workflows** → **Import**
   - Sube `src/workflow.json`
   - Asigna las credenciales a los nodos correspondientes
   - Activa el workflow

### Paso 5: Configurar Web App (Desarrollo)

```bash
cd web-app
cp .env.example .env
# Edita .env con tus credenciales de Supabase

npm install
npm run dev
```

La web app estará en http://localhost:5173

### Paso 6: Vincular WhatsApp

```bash
# Ver logs de Baileys para escanear QR
docker logs vera-baileys -f
```

Escanea el código QR con WhatsApp del número dedicado:
1. Abre WhatsApp en tu teléfono
2. Configuración → Dispositivos Vinculados
3. Vincular Dispositivo → Escanear QR

---

## 🧪 Testing

### Test de Conectividad

```bash
# Test de webhook VERA
curl -X POST http://localhost:5678/webhook/vera/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"key":{"remoteJid":"573009999999@s.whatsapp.net"},"message":{"conversation":"Hola"}}]}'
```

### Test de Rate Limiting

```bash
for i in {1..12}; do
  curl -s -X POST http://localhost:5678/webhook/vera/whatsapp \
    -H "Content-Type: application/json" \
    -d "{\"messages\":[{\"key\":{\"remoteJid\":\"573001111111@s.whatsapp.net\"},\"message\":{\"conversation\":\"test $i\"}}]}"
  sleep 1
done
```

---

## 🔧 Solución de Problemas

### n8n no inicia

```bash
docker logs vera-n8n
```

Verifica que las variables de entorno estén correctas.

### Baileys no conecta

```bash
docker logs vera-baileys
```

- Asegúrate de escanear el QR
- Verifica que el número no esté en uso en otro lugar
- Elimina el volumen `baileys_auth` para reiniciar sesión:
  ```bash
  docker-compose down
  docker volume rm vera-asistente_baileys_auth
  docker-compose up -d
  ```

### Web App no conecta a Supabase

Verifica en web-app/.env:
- `VITE_SUPABASE_URL` debe ser la URL completa (https://...)
- `VITE_SUPABASE_PUBLISHABLE_KEY` debe ser la key `anon` (no service_role)

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [web-app/README.md](../web-app/README.md) | Docs específicas de la web app |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guía para contribuidores |
| [LICENSE](../LICENSE) | Licencia MIT |

---

## 🎉 ¡Listo!

Tu ecosistema VERA está configurado. Prueba enviar "Hola" al número de WhatsApp configurado y VERA debería responder.

Para soporte, revisa los logs:
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker logs -f vera-n8n
docker logs -f vera-baileys
```
