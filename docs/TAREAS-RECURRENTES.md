# 📅 TAREAS RECURRENTES — CONSULTORAVIRTUAL

**Propósito:** Documentar tareas automáticas/rutinarias que deben ejecutarse en cadencia fija.  
**Responsable:** PMcoordinador (yo) verifica al inicio de cada sesión y gatilla las que corresponden.

---

## Tareas Recurrentes Activas

### 1. **REPORTE SEMANAL DE MERCADO** 
**Agente:** PRODUCT MANAGER  
**Frecuencia:** Cada lunes  
**Hora:** 9:00 AM (hora local Patricio)  
**Modelo:** Haiku (economizar tokens)  
**Especificación:** `docs/REPORTE-MERCADO-SEMANAL.md`

**Mi tarea (PMcoordinador):**
- Lunes, al inicio de sesión: "PRODUCT MANAGER, genera reporte semanal de mercado (ver spec en docs/REPORTE-MERCADO-SEMANAL.md)"
- Esperar respuesta
- Revisar calidad (conciso, data-backed, accionable)
- Si OK → reportar a Patricio
- Si hay gaps → pedir correcciones

**Último reporte:** [fecha]  
**Próximo reporte:** [fecha]

---

### 2. AUDITORÍA DE CODEBASE
**Agente:** PMcoordinador (yo)  
**Frecuencia:** 
- **CONTINUA:** Después de cada tarea/cambio de agentes (validar que no haya introducido duplicados, zombies, desactualizaciones)
- **CHECKPOINT:** Cada viernes (revisión sistemática + reporte)

**Checklist (después de cambios + semanal):**
- [ ] No hay carpetas duplicadas
- [ ] No hay archivos desactualizados (>30 días sin cambios)
- [ ] No hay archivos zombie (removidos pero hay referencias)
- [ ] BITACORA-CAMBIOS.md está al día con commits
- [ ] Versiones sincronizadas (CLAUDE.md, MATRIZ_AGENTES.md, etc.)
- [ ] Archivos de agentes no tienen redundancia

**Si encuentro problema:** Reportar a Patricio + corregir inmediatamente  
**Reporte semanal:** Viernes con resumen (todo OK / qué se arregló)

---

### 3. [FUTURO] REVISIÓN DE COMPLIANCE — LEGAL
**Agente:** LEGAL  
**Frecuencia:** Trimestral (inicio de cada trimestre)  
**Scope:**
- Ley 19.628 (protección datos) — ¿se sigue cumpliendo?
- Cambios regulatorios nuevos
- Contratos clientes — validar alineación

---

## Cómo YO (PMcoordinador) las ejecuto

**Al inicio de cada sesión:**

```
1. Leo esta archivo (TAREAS-RECURRENTES.md)
2. Verifico: ¿Cuál tarea corresponde hoy?
3. Si corresponde:
   - Contacto agente con prompt claro
   - Espero respuesta
   - Valido calidad (conciso, data-backed, accionable)
   - Si OK → reporto a Patricio
   - Si hay gaps → corrijo o pido más info
4. Actualizo "Último reporte" en este archivo
```

**Ejemplo de prompt que uso:**
```
PRODUCT MANAGER: Genera reporte semanal de mercado.

Especificación completa: docs/REPORTE-MERCADO-SEMANAL.md

Entrega esperada:
- Formato: markdown (máx 1 página)
- Secciones: Tendencias, Mercado PYME, Competitive gap, Ideas, Bursátil, Geopolítica
- Data-backed (citar fuentes)
- Accionable (cada insight → implicación clara)

¿Listo para generar?
```

---

## Estado Actual

| Tarea | Frecuencia | Último | Próximo | Status |
|-------|-----------|--------|---------|--------|
| Reporte Mercado | Semanal (lunes) | — | 2026-08-04 | 🟢 Activo |
| Auditoría Codebase | Semanal (viernes) | — | 2026-08-01 | 🟢 Activo |
| Revisión Compliance | Trimestral | — | 2026-10-01 | 🟡 Futuro |

---

## Cómo agregar nuevas tareas recurrentes

1. Crear especificación (qué buscar, formato esperado)
2. Definir agente responsable
3. Definir frecuencia clara (semanal lunes? diario? trimestral?)
4. Agregar fila a tabla de arriba
5. PMcoordinador ejecuta desde siguiente ciclo

---

*Última actualización: 2026-07-31*  
*Próxima revisión de tareas: 2026-08-01*
