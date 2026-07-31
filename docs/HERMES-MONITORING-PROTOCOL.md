# 📊 Protocolo de Monitoreo — Hermes Cron Jobs

**Propósito:** PMcoordinador monitorea ejecución de cron jobs sin guardar contenido en git.

---

## 🔄 Flujo de Ejecución

```
Lunes 9:00 AM
    ↓
Hermes ejecuta: market-weekly-brief
    ↓
Skill genera reporte en docs/reportes/mercado-YYYY-MM-DD.md
    ↓
Hermes envía EMAIL → ferrer.patricio@gmail.com
    ↓
Hermes guarda LOG (status, timestamp, NO contenido)
    ↓
PMcoordinador chequea: hermes cron runs market-weekly-brief
```

**Nota crítica:** Solo yo veo status. Patricio recibe email. Nada en git.

---

## 📋 Cómo Yo (PMcoordinador) Verifico Ejecución

### Opción 1 — Ver logs de cron

```bash
# Últimas 5 ejecuciones del job
hermes cron runs market-weekly-brief --limit 5

# Ver logs completos
cat ~/.local/hermes/cron/market-weekly-brief.log

# Ver solo status (último)
tail -1 ~/.local/hermes/cron/market-weekly-brief.log
```

### Opción 2 — Chequear en tiempo real (mientras se ejecuta)

```bash
# Ver logs en vivo
hermes logs --follow --grep market-weekly-brief

# Resultado esperado:
# [2026-08-04 09:00:00] MARKET-BRIEF: ✅ Ejecutado | Enviado a ferrer.patricio@gmail.com | Archivo: docs/reportes/mercado-2026-08-04.md
```

### Opción 3 — Ver próxima ejecución programada

```bash
hermes cron list
# Mostrará: Next run: 2026-08-11T09:00:00 (si última fue exitosa)
```

---

## ✅ Status Esperado (Lunes Post-Ejecución)

**Si tuvo ÉXITO:**
```
✅ [2026-08-04 09:05:00] MARKET-BRIEF: ✅ Ejecutado | Enviado a ferrer.patricio@gmail.com
   Archivo generado: docs/reportes/mercado-2026-08-04.md
   Email enviado a: ferrer.patricio@gmail.com
   Próxima ejecución: 2026-08-11 09:00
```

**Si tuvo ERROR:**
```
❌ [2026-08-04 09:05:00] MARKET-BRIEF: ❌ Error en ejecución
   Error: [descripción técnica]
   Próximo retry: [timestamp]
   Contactar a: Patricio para debuggear
```

---

## 📅 Protocolo Operacional (Yo)

**Cada lunes después de 9:05 AM:**

```bash
# 1. Chequeo status
hermes cron runs market-weekly-brief --limit 1

# 2. Si ✅ Exitoso:
#    → Log en archivo
#    → No hacer nada más (Patricio ya tiene email)
#    → Siguiente lunes: repetir

# 3. Si ❌ Error:
#    → Leo error en log
#    → Intento fix (ej: skill rota, network issue, etc.)
#    → Ejecuto manualmente si es crítico:
#       hermes cron run market-weekly-brief
#    → Documento en BITACORA-CAMBIOS.md
#    → Reporto a Patricio si es crítico
```

---

## 📝 Qué NO Guardamos en Git

❌ Contenido del reporte (docs/reportes/mercado-*.md)  
❌ Logs de Hermes (~/.local/hermes/cron/*)  
❌ Email enviados  
❌ Archivos temporales  

**Solo guardamos en git:**
✅ Documentación (este archivo)  
✅ Specs del cron job  
✅ Skills definitions (.yaml)  
✅ BITACORA-CAMBIOS.md (eventos críticos, NO contenido)

---

## 🚨 Alertas Críticas

Si veo en logs:
- ❌ 3 ejecuciones fallidas seguidas → Escalada a Patricio
- ❌ Email delivery failed → Revisar config Gmail
- ❌ Skill not found → Repositorio de skills corrupto

---

## 🔐 Privacidad / Seguridad

- Yo (PMcoordinador) veo: timestamp, status (✅/❌), destinatario
- Yo NO veo: contenido del reporte (está solo en email de Patricio)
- Terceros NO ven: logs (privados en ~/.local/hermes/)
- Git NO sabe: nada del contenido ni ejecuciones

---

*Versión: 1.0*  
*Última actualización: 2026-07-31*  
*Próxima revisión: 2026-08-11 (post-primer-reporte)*
