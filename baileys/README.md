# 📱 VERA Baileys Gateway

Gateway de WhatsApp para VERA usando la librería Baileys.

## 🚀 Uso

### Desarrollo Local

```bash
npm install
npm run dev
```

### Con Docker

```bash
docker build -t vera-baileys .
docker run -p 3006:3006 -e WEBHOOK_URL=http://host.docker.internal:5678/webhook/vera/whatsapp vera-baileys
```

## 🔧 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3006 |
| `WEBHOOK_URL` | URL del webhook de n8n | - |
| `AUTH_FOLDER` | Carpeta para sesión de WhatsApp | ./auth/vera |

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Enviar Mensaje
```bash
POST /send
Content-Type: application/json

{
  "phone": "573001234567",
  "message": "Hola desde VERA"
}
```

## 📝 Notas

- La sesión de WhatsApp se guarda en `AUTH_FOLDER`
- Al primer inicio, muestra un código QR para vincular
- El QR también aparece en los logs del contenedor
