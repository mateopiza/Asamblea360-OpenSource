/**
 * VERA Baileys Gateway
 * Gateway de WhatsApp para VERA usando Baileys
 */

const express = require('express');
const { 
  default: makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5678/webhook/vera/whatsapp';
const AUTH_FOLDER = process.env.AUTH_FOLDER || './auth/vera';

// Asegurar que existe el directorio de auth
if (!fs.existsSync(AUTH_FOLDER)) {
  fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

let sock = null;
let isConnected = false;

// Logger
const logger = pino({ 
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

/**
 * Inicializar conexión de WhatsApp
 */
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();
  
  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    browser: ['VERA', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      logger.info('📱 Escanea el código QR con WhatsApp');
      QRCode.generate(qr, { small: true });
    }
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.info('❌ Conexión cerrada. Reconectando:', shouldReconnect);
      isConnected = false;
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      logger.info('✅ Conectado a WhatsApp');
      isConnected = true;
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Manejar mensajes entrantes
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type === 'notify') {
      for (const msg of m.messages) {
        if (!msg.key.fromMe) {
          await forwardToWebhook(msg);
        }
      }
    }
  });
}

/**
 * Enviar mensaje recibido al webhook de n8n
 */
async function forwardToWebhook(msg) {
  try {
    const payload = {
      messages: [msg],
      timestamp: Date.now()
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logger.error('Error al enviar al webhook:', response.statusText);
    } else {
      logger.info('📤 Mensaje enviado a webhook');
    }
  } catch (error) {
    logger.error('Error al enviar al webhook:', error.message);
  }
}

/**
 * Enviar mensaje de WhatsApp
 */
async function sendMessage(phone, message) {
  if (!isConnected) {
    throw new Error('WhatsApp no está conectado');
  }

  const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: message });
  logger.info(`📨 Mensaje enviado a ${phone}`);
}

// Rutas HTTP
app.get('/', (req, res) => {
  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    service: 'VERA Baileys Gateway',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: isConnected ? 'healthy' : 'unhealthy',
    whatsapp: isConnected ? 'connected' : 'disconnected'
  });
});

// Endpoint para enviar mensajes desde n8n
app.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        error: 'Se requiere phone y message' 
      });
    }

    await sendMessage(phone, message);
    res.json({ success: true, message: 'Mensaje enviado' });
  } catch (error) {
    logger.error('Error al enviar mensaje:', error.message);
    res.status(500).json({ 
      error: 'Error al enviar mensaje',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Baileys Gateway escuchando en puerto ${PORT}`);
  logger.info(`📡 Webhook configurado: ${WEBHOOK_URL}`);
  connectToWhatsApp();
});
