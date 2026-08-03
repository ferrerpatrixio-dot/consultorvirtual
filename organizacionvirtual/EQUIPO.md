# 👥 EQUIPO CONSULTORAVIRTUAL — Roster de Agentes

**Actualizado:** 2026-08-02
**Propósito:** Que cada agente sepa quién más existe, qué hace y cuándo llamarlo.

> **Regla base:** los agentes conversan entre sí para coordinar, pero **el PMcoordinador siempre
> se entera**. Ningún agente ejecuta un cambio sin que PM lo sepa. Ver protocolo completo en
> [MATRIZ_AGENTES.md](MATRIZ_AGENTES.md).

---

## Cómo invocar a otro agente

Todos los agentes están definidos en `.claude/agents/` y se invocan con la herramienta Agent
usando el `name` del frontmatter (columna "Invocar como" abajo).

---

## Roster completo

| Agente | Invocar como | Para qué lo llamas |
|---|---|---|
| **PMcoordinador** | *(es el coordinador principal, `.claude/CLAUDE.md`)* | Orquesta a todos. Toda coordinación pasa por él. Escala a Patricio lo crítico. |
| **ARQUITECTO IT** | `arquitecto-it` | Elegir stack tecnológico y herramientas; viabilidad técnica de UI, motor, BBDD y backend. |
| **ANALISTA DE PROCESOS DE NEGOCIO** | `analista-procesos-negocio` | Transformar un prompt/levantamiento en mapa de procesos, procedimientos, reporte de riesgos y errores de proceso. |
| **DISEÑADOR-UX** | `diseñador-ux` | Usabilidad, flujos de usuario, journey del cliente, wireframes, testing de usabilidad. |
| **DEV** | `dev` | Implementar software (productos propios y de cliente); validar factibilidad y timeline de lo que propone ARQUITECTO IT. |
| **QA** | `qa` | Test cases, validación de flujos, reporte de bugs, **VB obligatorio antes de producción**. |
| **SECURITY** | `security` | Compliance Ley 19.628, protección de datos, auditoría de acceso, riesgos de seguridad. |
| **DELIVERY** | `delivery` | Deploy a producción, rollback, infraestructura, backup/recovery, capacitación de usuarios. |
| **LEGAL** | `legal` | Contratos, NDA, términos y condiciones, compliance normativo, solvencia de clientes. |
| **FINANCE** | `financiero-contable` | Flujo de caja, forecast, runway, costos (incluido costo de LLM por uso), alertas de tesorería. |
| **PRODUCT MANAGER** | `product-manager` | Pricing, modelo de negocio, viabilidad comercial, investigación de mercado y competencia. |
| **COMERCIAL** | `comercial` | Generar oportunidades, armar propuestas, negociar y cerrar contratos. |

---

## Quién entra en qué momento (desarrollo de software)

**El desarrollo de software es una línea de trabajo formal de la consultora** — productos propios
que se monetizan y soluciones a medida para clientes. Este es el flujo típico:

```
1. LEVANTAMIENTO      ANALISTA-PROCESOS-NEGOCIO  → mapa de proceso + riesgos + errores
                      (con LEGAL si hay NDA / datos sensibles del cliente)
                              ↓
2. DISEÑO             ARQUITECTO-IT (stack) ⟷ DISEÑADOR-UX (journey e interfaz)
                      SECURITY valida compliance del diseño
                      PRODUCT MANAGER valida viabilidad comercial y pricing
                      FINANCE estima costo operativo (LLM por uso, infraestructura)
                              ↓
3. VALIDACIÓN         DEV confirma factibilidad y timeline del diseño
                      PM consolida y escala a Patricio lo que exceda su autoridad
                              ↓
4. IMPLEMENTACIÓN     DEV construye · QA escribe test cases en paralelo
                      SECURITY audita código con datos personales
                              ↓
5. TESTING            QA valida y da (o niega) sign-off
                      QA produce casos de uso + esperables (para el cliente)
                              ↓
6. DOSSIER            PM solicita a cada agente con acción relevante su aporte
                      PM consolida el Dossier de Diseño Detallado
                              ↓
7. GO-LIVE            DELIVERY deploya, capacita y ENTREGA EL DOSSIER · DEV en standby
                              ↓
8. COMERCIALIZACIÓN   PRODUCT MANAGER fija precio final · COMERCIAL vende
                      LEGAL cierra contrato/T&C · FINANCE registra ingreso
```

**Sobre el dossier (fase 6):** es el documento único que recibe el cliente al cierre. Lo compila el
**PM** pidiendo su aporte a cada agente que tuvo **acción relevante** (no se pide documentación por
completitud burocrática), y lo entrega **DELIVERY** en el handoff. Los **casos de uso y esperables
de QA** son su material base. Protocolo completo: [`docs/SOP-DOSSIER-DISENO-DETALLADO.md`](../docs/SOP-DOSSIER-DISENO-DETALLADO.md).

**Documenta mientras trabajas, no al final.** Si sabes que tu aporte irá al dossier, deja el rastro
a medida que avanzas — reconstruir decisiones tres semanas después es cómo se pierden los porqués.

**Nadie espera su turno en silencio.** Si FINANCE ve que el costo de API por usuario destruye el
margen, lo dice en la fase de diseño, no cuando ya está construido. Si LEGAL ve un problema de
T&C para un SaaS de suscripción, lo levanta antes de que DEV construya el flujo de pago.

---

## Escalación

| Nivel | Quién decide |
|---|---|
| **1** | El agente decide solo (dentro de su dominio) |
| **2** | PM decide con el agente (scope, timeline, riesgo, descuento <20%) |
| **3** | **Patricio Ferrer** decide (presupuesto >$5K o >20%, cambio de producto/cliente, precio y modelo de negocio, runway crítica, instancia legal) |

Detalle completo en [MATRIZ_AGENTES.md](MATRIZ_AGENTES.md).
