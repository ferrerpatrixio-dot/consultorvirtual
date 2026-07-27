# 🔒 RESTRICCIONES CONSOLIDADAS — Cliente PYME × Stack

**Fecha:** 2026-07-27
**Fuentes:** [REALIDAD-CLIENTE-PYME-CHILE.md](REALIDAD-CLIENTE-PYME-CHILE.md) (15 reglas duras) × [STACK-MINIMO-VIABLE-PYME.md](STACK-MINIMO-VIABLE-PYME.md) (stack + lista negra)

**Para:** ARQUITECTO y PRODUCT MANAGER. Léelo antes de proponer cualquier cosa.

---

## ✅ EL COSTO NO ES EL PROBLEMA

| | Valor |
|---|---|
| Techo permitido (R-1) | 1 UF = $41.000 CLP ≈ **US$43 / cliente / mes** |
| Stack Nivel 0 real | **US$20 / mes TOTAL** (no por cliente) |
| A 5 clientes | US$4 / cliente / mes = **0,1 UF** |
| Holgura | **10× bajo el techo** |

**Conclusión:** dejen de optimizar infraestructura. Ya está resuelta y sobra margen.
Las restricciones que de verdad matan proyectos son operacionales, no de costo.

---

## ⛔ CORRECCIÓN R-2 (2026-07-27) — LEER ANTES DE COTIZAR

R-2 topeaba el precio en **$1.200.000** ("Kit Digital Sercotec") y la asesoría en
**$450.000**. La verificación con bases oficiales **no encontró respaldo para
ninguna de las dos cifras**.

Verificado (Crece 2026, O'Higgins): subsidio total **$5.000.000**,
tope **$1.000.000** para asistencia técnica y asesoría en gestión.

→ **R-2 no se aplica en su forma actual.** El techo real es más alto de lo que
se creía. Antes de cotizar, bajar las bases de la región del cliente.
Detalle en [SERCOTEC-MECANICA-Y-CALENDARIO.md](SERCOTEC-MECANICA-Y-CALENDARIO.md).

**Además:** las compras solo son rendibles si son posteriores a la firma del
contrato con el Agente Operador ⇒ **la Fase 1 debe ser siempre particular.**

---

## 🚨 LAS 4 RESTRICCIONES QUE SÍ MUERDEN

Ordenadas por probabilidad de hundir un proyecto:

### 1. R-3 — Cero personal técnico del lado del cliente
Barrera #1 declarada (75% reporta obstáculos por falta de personal experto).
→ **Si tu diseño necesita que alguien del cliente "administre" algo, está muerto.**

> **Única excepción (2026-07-27):** los **modelos de predicción**, que sí exigen
> un perfil analítico mínimo del lado del cliente. Solo se proponen a clientes
> en estado `BASE_LISTA` y con una persona identificada por nombre que va a leer
> el resultado. Ver [REGLA-HABILITACION-POR-MADUREZ.md](../REGLA-HABILITACION-POR-MADUREZ.md).
> R-3 sigue vigente sin cambios para toda la oferta base.

### 2. R-6 — Prohibido reemplazar el software contable/DTE
Nubox, Defontana, Bsale, Softland: los eligió **el contador**, no el dueño. Tocarlos activa un veto externo que no controlas.
→ Se **integra o convive**. Nunca se reemplaza.

### 3. R-13 — Debe sobrevivir a internet inestable
Crítico fuera de la Región Metropolitana.
→ Degradar a modo básico o correr en celular con datos móviles.

### 4. R-4 — Usuario nuevo operando solo en ≤ 2 horas
Sueldo micro $407.000, 48% sin contrato ⇒ **rotación alta**: vas a re-capacitar seguido.
→ Doc ≤ 5 páginas o video ≤ 10 min.

---

## ⚠️ GAPS ABIERTOS — el stack todavía no responde a esto

Estos son trabajo pendiente real, no ideas para congelar:

| # | Gap | Choque | Dueño |
|---|---|---|---|
| **G-1** | **Integración con software contable chileno.** El stack nunca evaluó Nubox / Defontana / Bsale (¿tienen API? ¿costo? ¿o es export CSV?). Sin esto, R-6 es inaplicable. | R-6 vs Stack | ARQUITECTO |
| **G-2** | **Sin historia offline.** Nivel 0 es web-only en Vercel. No hay PWA, ni caché local, ni degradación. | R-13 vs Stack | ARQUITECTO |
| **G-3** | **Margen sin validar.** R-2 topea el ingreso en **$1.200.000 CLP** por proyecto (ancla: Kit Digital Sercotec) y R-11 lo topea en **6 semanas**. ¿Sobrevive el margen mínimo de POLITICA_FINANCIERA? | R-2 × R-11 vs política | PRODUCT MANAGER |
| **G-4** | **Resend 100 emails/día** es el primer límite que se rompe — antes que la base de datos. | Stack interno | ARQUITECTO |

**G-3 es el crítico.** Si el margen no da a $1.200.000 / 6 semanas, el modelo de negocio no cierra y todo lo demás es decoración.

---

## 📅 VENTANA COMERCIAL — accionable hoy

**R-8:** prohibido cerrar ventas, kick-offs o cobros grandes en **enero–abril**
(vacaciones ene-feb · gastos escolares y permiso de circulación mar · Operación Renta abr).

Ciclo comercial útil: **mayo–noviembre**.

> Hoy es **julio 2026**: estamos dentro de la ventana buena, quedan ~5 meses.
> La prospección del PRODUCT MANAGER debe ejecutarse **ahora**, no en verano.

---

## 🎯 LAS DOS REGLAS QUE GOBIERNAN TODO

**ARQUITECTO — antes de agregar cualquier componente:**
> Pega en el PR: (a) la métrica con nombre, valor y fecha que muestra un límite superado o sobre 70%, **o** el ticket de un cliente que paga describiendo la falla concreta; (b) el costo mensual y a quién se factura; (c) quién lo revierte y en cuántos minutos.
> Si la justificación dice *"escalabilidad futura"*, *"buenas prácticas"*, *"por si acaso"*, *"estándar de la industria"* o *"cuando crezcamos"* → **NO**, y no se rediscute hasta que exista la métrica.

**PRODUCT MANAGER — antes de aprobar cualquier oferta:**
> Toda propuesta lleva (R-7) **una** métrica de ahorro con payback ≤ 3 meses, y (R-15) una **columna "mitad de precio"** con alcance reducido pero funcional. Si tiene una sola columna, se devuelve.

---

## 🧊 QUÉ HACER CON LO QUE NO ENTRA

Nada se rechaza: se congela en [BACKLOG-IDEAS-FUTURAS.md](../BACKLOG-IDEAS-FUTURAS.md) con **gatillo medible**.
La lista negra completa (14 tecnologías con su alternativa barata) está en el documento de stack.

---

*Revisión: PM (Coordinador), mensual.*
