# 📘 SOP — Dossier de Diseño Detallado (entregable al cliente)

**Versión:** 1.0
**Fecha:** 2026-08-02
**Dueño del proceso:** PMcoordinador
**Aplica a:** todo desarrollo de software y todo proyecto de consultoría entregable a cliente

---

## Qué es el dossier

El **Dossier de Diseño Detallado** es el documento único que se entrega al cliente al cierre de un
proyecto. Consolida el aporte de cada agente que tuvo una acción relevante en el desarrollo, de
modo que el cliente reciba **una sola pieza coherente**, no una pila de documentos sueltos.

**No es** un resumen ejecutivo ni un informe de avance. Es el registro completo de qué se diseñó,
por qué, cómo se validó y cómo se opera.

---

## Regla de participación

> **Solo aporta al dossier el agente que tuvo una acción relevante en el proyecto.**

No se pide documentación por completitud burocrática. Si SECURITY no intervino porque el proyecto
no toca datos personales, no hay sección de SECURITY — y el dossier declara explícitamente por qué
no la hay. Un dossier con secciones vacías rellenadas "por si acaso" es ruido que el cliente paga.

El PMcoordinador determina quién participó revisando `BITACORA-CAMBIOS.md` y el historial de tareas
asignadas durante el proyecto.

---

## Responsabilidades

### PMcoordinador — **compila el dossier**

1. **Identifica** qué agentes tuvieron acción relevante en el proyecto
2. **Solicita** a cada uno su aporte, con formato y deadline explícitos (ver plantilla de solicitud abajo)
3. **Consolida** en un documento único, resolviendo contradicciones entre agentes antes de entregar
   (si ARQUITECTO IT dice una cosa y DEV documentó otra, se resuelve **antes** de que lo lea el cliente)
4. **Valida** contra el checklist de calidad
5. **Entrega** el dossier consolidado a DELIVERY

El PM **no escribe** el contenido técnico — lo pide, lo revisa y lo integra.

### QA — **casos de uso y esperables** (insumo base de documentación)

Además de su rol de validación, QA produce dos entregables que son **material base del dossier**:

- **Casos de uso**: cada flujo que el sistema soporta, en lenguaje del negocio — actor, precondición,
  pasos, resultado. Sirven al cliente como documentación funcional, no solo como test interno.
- **Esperables documentados**: qué debe ocurrir en cada caso, incluyendo el comportamiento ante
  errores y casos borde. Es la referencia contra la cual el cliente puede verificar el sistema
  por su cuenta después de la entrega.

Estos dos documentos alimentan directamente la capacitación que hace DELIVERY y la sección funcional
del dossier. QA los escribe pensando en que **los va a leer el cliente**, no solo el equipo.

### DELIVERY — **entrega el dossier al cliente**

Recibe el dossier consolidado del PM, lo complementa con la documentación operativa (guía de usuario,
plan de capacitación, procedimiento de soporte) y lo entrega formalmente al cliente en la sesión de
handoff. Usa los casos de uso y esperables de QA como material de capacitación.

---

## Aportes por agente

| Agente | Qué aporta al dossier | Cuándo aplica |
|---|---|---|
| **ANALISTA DE PROCESOS DE NEGOCIO** | Mapa de procesos (as-is / to-be), procedimientos por actor, reporte de riesgos, reporte de errores de proceso, preguntas pendientes resueltas | Siempre que hubo levantamiento o modelamiento |
| **ARQUITECTO IT** | Arquitectura técnica, stack elegido con justificación, diagrama de componentes, decisiones de diseño y sus trade-offs | Siempre que hubo desarrollo de software |
| **DISEÑADOR-UX** | User journeys, wireframes finales, decisiones de usabilidad, resultados de testing con usuarios, guía de estilo aplicada | Cuando hubo interfaz de usuario |
| **DEV** | Documentación técnica de lo implementado, integraciones y dependencias, configuración y variables de entorno, deuda técnica conocida | Siempre que se escribió código |
| **QA** | **Casos de uso** + **esperables documentados** + plan de testing ejecutado + estado final de bugs | **Siempre** (excepto MVP declarado) |
| **SECURITY** | Auditoría de compliance (Ley 19.628), controles implementados, riesgos residuales aceptados | Cuando el proyecto toca datos personales |
| **DELIVERY** | Guía de usuario, plan de capacitación, procedimiento de soporte, plan de rollback, SLA de recuperación | Siempre que hay go-live |
| **LEGAL** | Términos aplicables, cláusulas de propiedad intelectual, alcance de responsabilidad | Cuando hay contrato o T&C de por medio |
| **PRODUCT MANAGER** | Modelo de negocio o pricing acordado, alcance comprometido vs. entregado | Cuando el proyecto tiene componente comercial |
| **FINANCE** | Costos operativos recurrentes que hereda el cliente (licencias, API por uso, infraestructura) | Cuando la operación tiene costo continuo |

---

## Estructura del dossier

```
DOSSIER DE DISEÑO DETALLADO — [Cliente] · [Proyecto]

1. Resumen ejecutivo
   Qué se construyó, para qué, y en qué estado se entrega.

2. Proceso de negocio
   Mapa as-is · Mapa to-be · Procedimientos por actor
   Riesgos identificados · Errores de proceso detectados y su resolución
   (fuente: ANALISTA DE PROCESOS DE NEGOCIO)

3. Diseño de la solución
   Arquitectura técnica y stack, con justificación
   Diseño de experiencia: journeys y pantallas
   (fuente: ARQUITECTO IT + DISEÑADOR-UX)

4. Implementación
   Qué se construyó, integraciones, configuración
   Deuda técnica conocida y declarada
   (fuente: DEV)

5. Casos de uso y esperables
   Cada flujo soportado, con su resultado esperado
   Comportamiento ante errores y casos borde
   (fuente: QA — material base de capacitación)

6. Validación y calidad
   Plan de testing ejecutado · Estado final de bugs
   Auditoría de compliance y controles (si aplica)
   (fuente: QA + SECURITY)

7. Operación y soporte
   Guía de usuario · Plan de capacitación
   Procedimiento de soporte y escalación · Plan de rollback
   Costos operativos recurrentes
   (fuente: DELIVERY + FINANCE)

8. Alcance y condiciones
   Qué se comprometió vs. qué se entregó
   Términos aplicables, propiedad intelectual
   Fuera de alcance declarado explícitamente
   (fuente: PRODUCT MANAGER + LEGAL)

9. Anexos
   Diagramas en formato fuente · Preguntas pendientes que quedaron abiertas
```

Las secciones cuyo agente no participó **se omiten**, y el resumen ejecutivo declara por qué
(ej: "no se incluye auditoría de compliance porque el sistema no procesa datos personales").

---

## Plantilla: solicitud del PM a un agente

```
[AGENTE], necesito tu aporte para el Dossier de Diseño Detallado de [Cliente] · [Proyecto].

Sección que te corresponde: [nombre de la sección]
Contenido esperado: [lista concreta de lo que debe incluir]
Audiencia: el CLIENTE — escribe para que lo entienda quien va a usar el sistema,
no para el equipo interno.
Deadline: [fecha]
Formato: markdown, en docs/dossiers/[cliente]-[proyecto]/[agente].md

Si algo de tu trabajo quedó como pregunta abierta o supuesto no validado, decláralo —
no lo omitas. El dossier documenta lo que hay, no lo que nos gustaría que hubiera.
```

---

## Checklist de calidad (PM valida antes de pasar a DELIVERY)

- [ ] Todos los agentes con acción relevante aportaron su sección
- [ ] Las secciones ausentes están justificadas en el resumen ejecutivo
- [ ] No hay contradicciones entre secciones de distintos agentes
- [ ] Los casos de uso de QA cubren todos los flujos que el sistema realmente soporta
- [ ] Está escrito en lenguaje del cliente, no en jerga interna
- [ ] Las preguntas pendientes sin resolver están declaradas, no ocultas
- [ ] La deuda técnica conocida está declarada, no ocultada
- [ ] El "fuera de alcance" es explícito (evita reclamos posteriores)
- [ ] LEGAL revisó la sección de alcance y condiciones (si hay contrato de por medio)

---

## Ubicación

Aportes individuales: `docs/dossiers/[cliente]-[proyecto]/[agente].md`
Dossier consolidado: `docs/dossiers/[cliente]-[proyecto]/DOSSIER.md`

---

*Mantenido por: PMcoordinador · Ver también: [MATRIZ_AGENTES.md](../organizacionvirtual/MATRIZ_AGENTES.md) · [EQUIPO.md](../organizacionvirtual/EQUIPO.md)*
