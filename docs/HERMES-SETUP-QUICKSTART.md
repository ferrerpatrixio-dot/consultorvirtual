# 🚀 Hermes Setup Quickstart — CONSULTORAVIRTUAL

**Objetivo:** Configurar Hermes para:
1. Reporte semanal de mercado (PRODUCT MANAGER, cada lunes 9am)
2. Auditorías de codebase (PMcoordinador, cada viernes)
3. Recordatorios de reuniones (Calendar sync + Email notificaciones)

---

## PASO 1: Configurar Email (Gmail)

**Una sola vez:**

```bash
# Abre terminal y ejecuta
hermes gateway setup
```

**En el wizard interactivo:**
- Selecciona "Email" (opción X)
- Gmail SMTP:
  - Email: `ferrer.patricio@gmail.com`
  - App Password: `Acceso.4`
  - SMTP: `smtp.gmail.com:587`
- Guarda y confirma

---

## PASO 2: Configurar Google Calendar

**Necesitas:** JSON de credenciales de Google Calendar API

**Opción A — Service Account (recomendado para apps):**
1. Ve a https://console.cloud.google.com/
2. Crea proyecto: "CONSULTORAVIRTUAL"
3. APIs → Habilita "Google Calendar API"
4. Credenciales → Crea "Service Account"
5. Descarga JSON → Guarda en `~/.config/hermes/google-calendar-sa.json`

**Opción B — OAuth Client (acceso tu cuenta personal):**
1. Console → OAuth Consent Screen
2. Crea "OAuth 2.0 Client ID"
3. Descarga JSON como `~/.config/hermes/google-calendar-oauth.json`

**Una vez tengas credenciales:**

```bash
# Añade MCP de Google Calendar
hermes mcp add google-calendar \
  --credentials ~/.config/hermes/google-calendar-sa.json
```

---

## PASO 3: Activar Hermes Gateway (Servicio de Fondo)

```bash
# Instala como servicio
hermes gateway install

# Inicia el servicio
hermes gateway start

# Verifica que está corriendo
hermes status
```

---

## PASO 4: Crear Cron Jobs Automáticos

### 4A. Reporte Semanal de Mercado (PRODUCT MANAGER)

```bash
hermes cron create
# Interactivo wizard:
# - Nombre: market-weekly-brief
# - Cron: 0 9 * * 1  (lunes 9am)
# - Skill/Prompt: Usa skill market-weekly-brief
# - Notificar: Email a ferrer.patricio@gmail.com
```

O directamente:

```bash
hermes skills list  # Verifica que market-weekly-brief está
hermes cron add market-weekly-brief \
  "0 9 * * 1" \
  --skill market-weekly-brief \
  --notify email:ferrer.patricio@gmail.com
```

### 4B. Auditoría de Codebase (PMcoordinador)

```bash
hermes cron add codebase-audit \
  "0 17 * * 5" \
  --prompt "
    Ejecuta auditoría de CONSULTORAVIRTUAL:
    - git log --oneline | head -20
    - find . -name '*.md' -mtime +30 (archivos desactualizados)
    - Verifica BITACORA-CAMBIOS.md al día
    - Reporta problemas
  " \
  --notify email:ferrer.patricio@gmail.com
```

### 4C. Recordatorios de Reuniones (si tienes Google Calendar configurado)

```bash
hermes cron add meeting-reminder \
  "0 7 * * 1-5" \
  --prompt "
    Usa Google Calendar MCP para listar eventos hoy.
    Para cada reunión con cliente:
    - Nombre cliente
    - Hora
    - Objetivo (si está en descripción)
    Formatea como resumen breve y notifica por email.
  " \
  --model haiku \
  --notify email:ferrer.patricio@gmail.com
```

---

## PASO 5: Verificar Todo Funciona

```bash
# Ver jobs creados
hermes cron list

# Ejecutar uno manualmente para probar
hermes cron run market-weekly-brief

# Ver logs
hermes logs --follow
```

---

## Checklista Post-Setup

- [ ] Gmail configurado en Gateway (`hermes status` → Email ✓)
- [ ] Google Calendar MCP añadido (`hermes mcp list` → google-calendar)
- [ ] Gateway servicio corriendo (`hermes gateway status`)
- [ ] Cron jobs creados (`hermes cron list`)
- [ ] Test de cron job ejecutado manualmente
- [ ] Email de prueba recibido en ferrer.patricio@gmail.com
- [ ] Documentación actualizada en BITACORA-CAMBIOS.md

---

## Comandos Útiles Post-Setup

```bash
# Ver estado general
hermes status

# Ejecutar cron job manual
hermes cron run <job_id>

# Ver últimas ejecuciones
hermes cron runs market-weekly-brief

# Pausar/reanudar job
hermes cron pause market-weekly-brief
hermes cron resume market-weekly-brief

# Ver logs en vivo
hermes logs --follow --grep market-weekly-brief

# Editar configuración
hermes config edit
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Email no funciona | Verifica `hermes auth status` → Gmail ✓ |
| Google Calendar no conecta | Verifica JSON en `~/.config/hermes/` + `hermes mcp test google-calendar` |
| Cron jobs no se ejecutan | Verifica Gateway corriendo: `hermes gateway status` |
| No reciben notificaciones | Verifica mail en spam; test manual: `hermes send email --to ferrer.patricio@gmail.com --text "test"` |

---

## Próximo Paso

Una vez que todo esté configurado, el flujo es completamente automático:

**Cada lunes 9am:**
- PRODUCT MANAGER report genera automáticamente
- Email enviado a ferrer.patricio@gmail.com

**Cada viernes 5pm:**
- Auditoría de codebase se ejecuta
- Reporte enviado a ferrer.patricio@gmail.com

**Cada mañana 7am (lunes-viernes):**
- Recordatorios de reuniones del día (si calendar configurado)

---

*Documento: 2026-07-31*  
*Setup esperado: 30-45 minutos la primera vez*  
*Mantenimiento: 0 minutos (automático después)*
