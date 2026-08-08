# BITÁCORA DE CAMBIOS — CONSULTORAVIRTUAL

Registro de deployments, decisiones y eventos significativos de la infraestructura.

---

## 2026-08-07 | Deploy Nivel 1 F02 (Diagrama de Valor)

**Timestamp:** 22:57:54 GMT-4 (Chile)  
**Agente:** DELIVERY (Claude)  
**Status:** ✅ EXITOSO

### Resumen
Primera versión funcional de Diagrama de Valor (ValueMap) — Nivel 1 de F02 en Mapea.

**Cambios:**
- Nueva tabla `ValueMap` en schema (`prisma/schema.prisma`)
- Migración segura `20260807220000_nivel1_value_map` (SetNull en reemplazo de procesos raíz)
- Pantallas `/mapas/nuevo` y `/mapas/[id]` con editor visual
- Nueva política de trial: 1 proceso raíz activo y reemplazable (no ilimitado)
- Validación server-side de cupo (nunca confía en cliente)
- Tests de lógica de valor + casos delicados (reemplazo sin 2 raíces activas simultáneas)

**Validación Pre-Deploy:**
- ✅ PM (PMcoordinador): `tsc`, `eslint`, `build`, tests (88 pasan) limpios
- ✅ QA: 2 rondas de validación (migración aplicada en BD real, verificado contra casos delicados)
- ✅ DISEÑADOR-UX: 2 rondas (validó UI, agregó botón "Reemplazar" faltante)

### Detalles Técnicos

**Commit:** `a765029`  
**Hash anterior:** `fa9102d`

```
Deploy Nivel 1 F02: Diagrama de Valor (ValueMap)

Incluye:
- Tabla ValueMap en schema
- Migración segura con SetNull para reemplazar procesos raíz
- Pantallas /mapas/nuevo y /mapas/[id] con editor
- Nueva política de trial: 1 proceso raíz activo y reemplazable
- Validación server-side de cupo (nunca confía en cliente)
- Tests de lógica de valor y casos delicados (reemplazo sin 2 raíces activas)

Validado por: QA (incluidas migraciones en BD real), DISEÑADOR-UX, PM (type/lint/build/tests).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

### Vercel Deployment

| Campo | Valor |
|-------|-------|
| Proyecto | `consultorvirtual` (scope `ia-en-proceso-s-projects`) |
| Deployment ID | `dpl_HwKmKXSb88vXRgKXAvap7CaCGDP1` |
| URL | `https://consultorvirtual-471ch3kus-ia-en-proceso-s-projects.vercel.app` |
| Dominio | `https://mapea.aiprocess.cl` |
| Build Duration | 52 segundos |
| Status | `● Ready` |
| Creado | Fri Aug 07 2026 22:57:22 GMT-4 |

### Health Checks

| Check | Resultado |
|-------|-----------|
| HTTP Status | 200 ✅ |
| HTML Load | Válido, sin errores ✅ |
| Login Page | Desplegada correctamente ✅ |
| Database Connection | Viable (migración aplicada) ✅ |

### Rollback Disponible

- **Versión anterior:** `dpl_4fye6w573-ia-en-proceso-s-projects.vercel.app` (Ready, hace 42 min)
- **Proceso:** `vercel promote` a URL anterior si es necesario
- **SLA rollback:** < 5 minutos

### Próximas Acciones

1. Monitoreo de errores en producción (24h post-deploy)
2. Capacitación de usuarios en nuevas pantallas `/mapas/`
3. Nivel 2 F02 (Metodología y Resultados) — pendiente arquitectura

---

*Registrado por DELIVERY. Coordinación con PMcoordinador completada.*
