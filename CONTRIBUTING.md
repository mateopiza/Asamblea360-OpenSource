# 🤝 Contribuir a VERA

¡Gracias por tu interés en contribuir a VERA! Este documento proporciona guías para contribuir al proyecto.

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor crea un [issue](https://github.com/tu-usuario/vera-asistente/issues) con:

- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si aplica
- Entorno (navegador, versión de n8n, etc.)

### Sugerir Funcionalidades

Para sugerir nuevas funcionalidades:

1. Abre un issue con el label `enhancement`
2. Describe la funcionalidad y su caso de uso
3. Explica por qué sería útil para los usuarios

### Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/mi-feature`)
3. **Commit** tus cambios (`git commit -m 'Agrega mi feature'`)
4. **Push** a tu fork (`git push origin feature/mi-feature`)
5. Abre un **Pull Request**

## 📝 Estándares de Código

### Workflow n8n

- Usa nombres descriptivos para nodos
- Documenta la lógica compleja con notas en n8n
- Exporta el workflow en formato JSON indentado
- Actualiza el `workflow.json` en `src/`

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agrega soporte para múltiples asambleas
fix: corrige validación de OTP
docs: actualiza README con nuevos requisitos
refactor: optimiza queries de base de datos
```

### System Prompt

Cuando modifiques el system prompt:
- Mantén el tono profesional y cálido
- Usa español colombiano natural
- Máximo 80 palabras por respuesta
- No uses markdown ni asteriscos

## 🧪 Testing

Antes de enviar un PR:

1. Testea el flujo completo localmente
2. Verifica que no hayas expuesto credenciales
3. Asegúrate de que los locks de Redis funcionan
4. Verifica el rate limiting

```bash
# Comando para testear flujo básico
curl -X POST http://localhost:5678/webhook/vera/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"key":{"remoteJid":"573001111111@s.whatsapp.net"},"message":{"conversation":"Hola"}}]}'
```

## 🔒 Seguridad

- **NUNCA** commitees credenciales reales
- Usa siempre variables de entorno para secrets
- Valida todas las entradas de usuario
- Reporta vulnerabilidades de seguridad de forma privada

## 💬 Comunidad

- Sé respetuoso y constructivo
- Ayuda a otros contribuidores
- Comparte conocimiento

## 📄 Licencia

Al contribuir, aceptas que tu código será licenciado bajo MIT License.

---

¡Gracias por contribuir a VERA! 🎉
