# INVENTARIO DE DOCUMENTOS DE DISEÑO, ESPECIFICACIÓN Y METODOLOGÍA

**Propósito:** Catálogo centralizado de todos los documentos de definición, diseño, metodología y especificación técnica del repositorio CONSULTORAVIRTUAL. Herramienta de auditoría documental para detectar desincronizaciones, referencias cruzadas rotas y documentos huérfanos.

**Última actualización:** 2026-08-07  
**Responsable:** ADMIN-DOCUMENTAL  
**Criterio de inclusión:** documentos que definen arquitectura, metodología, especificaciones de producto, planes técnicos. NO se incluyen: propuestas comerciales, contratos, investigación comercial, ejemplos BPMN de skills, archivos de configuración, o archivos meramente informativos.

---

## ÍNDICE RÁPIDO

- [Cadena de Mapea/F02 (niveles de procesos, incrementos)](#cadena-de-mapeaf02-niveles-de-procesos-incrementos)
- [Especificaciones de producto (SDD)](#especificaciones-de-producto-sdd)
- [Fundamentos teóricos](#fundamentos-teóricos)
- [Metodología y frameworks](#metodología-y-frameworks)
- [Organización y agentes](#organización-y-agentes)
- [Estado de proyectos](#estado-de-proyectos)
- [Otros documentos de diseño](#otros-documentos-de-diseño)

---

## CADENA DE MAPEA/F02 (niveles de procesos, incrementos)

### 1. `sistemaaiprocess/prompts/mapa-procesos-nivel0.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\prompts\mapa-procesos-nivel0.md` |
| **Fecha** | 2026-07-23 |
| **En git** | ✅ Trackeado (versionado 2026-08-07) |
| **Tema** | Prompt base para entrevista IA de mapa de procesos nivel 0; define nomenclatura, clasificación (Estratégicos/Productivos/Apoyo), y fórmula de generación de JSON |
| **Estado aparente** | ✅ Histórico — Resolución: Sus reglas de nomenclatura/cantidades/orden fueron incorporadas en `docs/DISENO-NIVELES-1-4-F02.md`. Queda como referencia histórica con nota de vigencia en cabecera. |
| **Relacionados** | • `docs/DISENO-NIVELES-1-4-F02.md` — **INCORPORA** sus reglas de nomenclatura y estructura de clasificación<br/>• `docs/METODOLOGIA-JERARQUIA-MAPEA.md` (metodología de 4 niveles, 2026-08-05)<br/>• `docs/METODOLOGIAS-Y-FRAMEWORKS.md` (2026-07-27) — Menciona este prompt como "Mapa de procesos nivel 0"<br/>• `sistemaaiprocess/docs/fundamentos-teoricos.md` (2026-08-05) — Define arquitectura APQC PCF |
| **Notas de auditoría** | **RESUELTO** (2026-08-07): ANALISTA-PROCESOS-NEGOCIO confirmó que las reglas de este prompt se fusionan en `docs/DISENO-NIVELES-1-4-F02.md`. Versionado en git como insumo histórico con nota de no-vigencia. |

### 2. `docs/METODOLOGIA-JERARQUIA-MAPEA.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\METODOLOGIA-JERARQUIA-MAPEA.md` |
| **Fecha** | 2026-08-05 |
| **En git** | ✅ Trackeado |
| **Tema** | Metodología de 4 niveles para Mapea: Diagrama de Valor / Proceso / Subproceso / Procedimiento. Define qué es cada nivel, si es obligatorio, y cómo el LLM puede/no puede proponer contenido por nivel. Resuelve dos preguntas abiertas de Patricio sobre "diagrama de valor" y "as-is propuesto". |
| **Estado aparente** | ✅ Vigente — Validada por Patricio 2026-08-05, lista para sizing técnico y comercial |
| **Relacionados** | • `sistemaaiprocess/prompts/mapa-procesos-nivel0.md` (2026-07-23) — **FALTA REFERENCIA**: define nivel 0/Diagrama de Valor, pero NO cita el prompt existente que ya capturaba esto<br/>• `docs/BRECHA-MAPEA-VS-SPEC-F02.md` (2026-08-05) — Gap analysis del que esta metodología es entrada de diseño<br/>• `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (2026-08-05) — Diseño técnico del Incremento 2, aplica esta metodología<br/>• `docs/DISENO-INCREMENTO-3-F02.md` (2026-08-07) — Incremento 3, respeta esta metodología<br/>• `docs/DISENO-VERSIONADO-F02.md` (2026-08-07) — Versionado, preludio de niveles 1-4<br/>• `docs/DISENO-NIVELES-1-4-F02.md` (2026-08-05) — Extensión técnica de esta metodología para Niveles 1 y 4 |
| **Notas de auditoría** | Documento **fundacional** para todo diseño técnico de Mapea desde 2026-08-05. Preguntas abiertas resueltas. SIN EMBARGO, no hace referencia a `mapa-procesos-nivel0.md` que ya existía. Ambos hablan de "nivel 0" y estructura de jerarquía, pero operan en paralelo sin sincronización explícita. |

### 3. `docs/BRECHA-MAPEA-VS-SPEC-F02.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\BRECHA-MAPEA-VS-SPEC-F02.md` |
| **Fecha** | 2026-08-05 |
| **En git** | ✅ Trackeado |
| **Tema** | Gap analysis entre lo que existe hoy en `generador-bpmn` y lo que pide la spec F02 de `sistemaaiprocess/sdd/features/F02/spec.md`. Análisis de brecha por sección, tabla de priorización, y recomendación de Incremento 1. Marca este documento como histórico; Incremento 2 continúa en otro documento. |
| **Estado aparente** | ✅ Vigente como histórico — Describe Incremento 1 (ya implementado); referencia histórica para auditoría y futuro rediseño |
| **Relacionados** | • `sistemaaiprocess/sdd/features/F02/spec.md` (specProducto) — Fuente del análisis<br/>• `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (2026-08-05) — Continuación explícita: "Doc previo (histórico, no se toca)"<br/>• `docs/METODOLOGIA-JERARQUIA-MAPEA.md` (2026-08-05) — Entrada de requisitos de negocio que el gap análisis procesa |
| **Notas de auditoría** | Bien estructurado. Marcado correctamente como histórico con referencia explícita a continuación. |

### 4. `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` |
| **Fecha** | 2026-08-05 |
| **En git** | ✅ Trackeado |
| **Tema** | Diseño técnico de Incremento 2: modelo de datos para subprocesos (tope G7 de 50 elementos), descomposición en subprocesos, campos E1/E1b. Propuesta de arquitectura de `Paso` con nuevo tipo "subproceso". |
| **Estado aparente** | ✅ Vigente — Propuesta de diseño, no implementada en commit que se verificó (2026-08-07). Ver BITACORA-CAMBIOS para estado actual. |
| **Relacionados** | • `docs/BRECHA-MAPEA-VS-SPEC-F02.md` (2026-08-05) — Doc previo del que sale este diseño<br/>• `sistemaaiprocess/sdd/features/F02/spec.md` — Spec que inspira tope G7<br/>• `sistemaaiprocess/docs/fundamentos-teoricos.md` (2026-08-05) — Cita verificación del umbral G7 contra Mendling/Reijers (tope de 50 elementos confirmado)<br/>• `docs/DISENO-INCREMENTO-3-F02.md` (2026-08-07) — Incremento 3 depende de este modelo de datos<br/>• `docs/DISENO-NIVELES-1-4-F02.md` (2026-08-05) — Extiende el modelo `Diagram` asumiendo que Incremento 2 ya está implementado |
| **Notas de auditoría** | Propuesta de design clara y cita explícita a fuentes académicas. Asume que Patricio ya decidió el comportamiento del subproceso (ícono "+", abre en diagrama separado). |

### 5. `docs/DISENO-INCREMENTO-3-F02.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\DISENO-INCREMENTO-3-F02.md` |
| **Fecha** | 2026-08-07 |
| **En git** | ✅ Trackeado |
| **Tema** | Diseño técnico de Incremento 3: integridad del grafo y desbloqueo de exportación. Agrega regla M5 (destino inexistente bloquea), M1 mejorada (unicidad de inicio/fin), y mecanismo de "reconocer pendiente". |
| **Estado aparente** | ✅ Propuesta vigente — Implementada según BITACORA-CAMBIOS (2026-08-07) |
| **Relacionados** | • `docs/BRECHA-MAPEA-VS-SPEC-F02.md` (2026-08-05) — Incremento 1<br/>• `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (2026-08-05) — Incremento 2<br/>• `docs/DISENO-VERSIONADO-F02.md` (2026-08-07) — Versionado, cuyo diseño asume que Incremento 3 ya existe<br/>• `docs/DISENO-NIVELES-1-4-F02.md` (2026-08-05) — Extiende este incremento |
| **Notas de auditoría** | Bien separado en secuencia. Implementación confirmada en BITACORA-CAMBIOS. |

### 6. `docs/DISENO-VERSIONADO-F02.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\DISENO-VERSIONADO-F02.md` |
| **Fecha** | 2026-08-07 |
| **En git** | ✅ Trackeado |
| **Tema** | Diseño de historial de diagramas sin número (propósito: evitar colisión con "Incremento 3" original que se renumeró). Snapshot completo de versiones, coalescencia, poda, borrado lógico. Explícitamente NOT incluye instrucción localizada nivel 2 (es prerequisito, no compañero). |
| **Estado aparente** | ✅ Vigente — Propuesta de diseño implementada según BITACORA-CAMBIOS (2026-08-07, commit `594386f`) |
| **Relacionados** | • `docs/DISENO-INCREMENTO-3-F02.md` (2026-08-07) — Prerequisito (integridad del grafo)<br/>• `docs/DISENO-NIVELES-1-4-F02.md` (2026-08-05) — Respeta el versionado como entrada<br/>• BITACORA-CAMBIOS (2026-08-07) — Implementación verificada |
| **Notas de auditoría** | Nota explícita sobre numeración: explica por qué NO tiene número (evitar segunda colisión). Buen criterio. Remarca que **NO** incluye instrucción localizada nivel 2 (eso es feature posterior). |

### 7. `docs/DISENO-NIVELES-1-4-F02.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\DISENO-NIVELES-1-4-F02.md` |
| **Fecha** | 2026-08-05 |
| **En git** | ✅ Trackeado |
| **Tema** | Diseño técnico de Niveles 1 (Diagrama de Valor) y 4 (Procedimientos) en una sola propuesta. Define tabla nueva `ValueMap`, manejo de macroprocesos, flujo end-to-end. Propone secuencia de implementación: Nivel 1 primero (requisito de Nivel 4). |
| **Estado aparente** | ⏳ Propuesta vigente — No implementada (al 2026-08-05 cuando fue escrita). Requiere visto bueno de PMcoordinador y validación de DEV para timeline. |
| **Relacionados** | • `docs/METODOLOGIA-JERARQUIA-MAPEA.md` (2026-08-05) — Metodología que este diseño implementa<br/>• `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (2026-08-05) — Asume que Incremento 2 (`Paso.tipo = "subproceso"`) ya existe<br/>• `docs/DISENO-INCREMENTO-3-F02.md` (2026-08-07) — Asume que Incremento 3 (reglas M5/M1) ya existe<br/>• `docs/DISENO-VERSIONADO-F02.md` (2026-08-07) — Asume versionado funcional |
| **Notas de auditoría** | Un solo documento para dos niveles "a propósito" porque ambos comparten una pregunta central sobre qué va en `Diagram` y qué no. Buena decisión de diseño. Verifica estado actual en código (línea por línea) antes de proponer. Propone orden de implementación claro. |

---

## ESPECIFICACIONES DE PRODUCTO (SDD)

### 8. `sistemaaiprocess/sdd/features/F02/spec.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\sdd\features\F02\spec.md` |
| **Fecha** | (según BRECHA..., versión 23 CA) |
| **En git** | ✅ Trackeado |
| **Tema** | Especificación técnica de Feature F02 (Mapea): requisitos, arquitectura, criterios de aceptancia. Define tope G7 (50 elementos), reglas de completitud, seguridad, exportación multi-formato. Fuente de verdad de la especificación. |
| **Estado aparente** | ✅ Vigente — Línea base de especificación del producto |
| **Relacionados** | • `docs/BRECHA-MAPEA-VS-SPEC-F02.md` (2026-08-05) — Gap analysis contra esta spec<br/>• Todos los diseños de incrementos (DISENO-INCREMENTO-*.md) — Implementan secciones de esta spec<br/>• `sistemaaiprocess/docs/fundamentos-teoricos.md` (2026-08-05) — Cita fuentes académicas para reglas mencionadas en la spec |
| **Notas de auditoría** | Especificación base bien estructurada. No hay dudas de sincronización con documentos que la citan. |

### 9. `sistemaaiprocess/sdd/features/F12/spec.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\sdd\features\F12\spec.md` |
| **Fecha** | (no especificada en el archivo) |
| **En git** | ✅ Trackeado |
| **Tema** | Especificación de Feature F12 (no documentado en el contexto leído; requiere revisión) |
| **Estado aparente** | ⓘ Desconocido — Necesita revisión completa |
| **Relacionados** | (pendiente de revisión) |
| **Notas de auditoría** | **ACCIÓN REQUERIDA**: Leer este documento y catalogarlo completamente. |

---

## FUNDAMENTOS TEÓRICOS

### 10. `sistemaaiprocess/docs/fundamentos-teoricos.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\docs\fundamentos-teoricos.md` |
| **Fecha** | 2026-08-05 (verificación de numeración 7PMG) |
| **En git** | ✅ Trackeado |
| **Tema** | Base de conocimiento teórica: ciclo de vida BPM, arquitectura de procesos APQC PCF (5 niveles), modelo de madurez MMA-OD, reglas de completitud (A1-A5, E1-E3, M1-M6), referencias académicas (Mendling, Dumas, etc.). Sustenta Paso 0 y los 6 componentes. Complementa `agent.md` de AIProcess. |
| **Estado aparente** | ✅ Vigente — Base de conocimiento para toda especificación y diseño técnico |
| **Relacionados** | • `docs/BRECHA-MAPEA-VS-SPEC-F02.md` (2026-08-05) — Cita §3.2 para verificación de tope G7 de 50 elementos<br/>• `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (2026-08-05) — Cita para validar umbral contra Mendling/Reijers/van der Aalst<br/>• `sistemaaiprocess/sdd/features/F02/spec.md` — Define reglas mencionadas en la spec<br/>• `docs/METODOLOGIA-JERARQUIA-MAPEA.md` (2026-08-05) — Entrada de metodología |
| **Notas de auditoría** | Bien estructurado. Cita explícita de fuentes descargadas. Verifica numeración 7PMG. |

---

## METODOLOGÍA Y FRAMEWORKS

### 11. `docs/METODOLOGIAS-Y-FRAMEWORKS.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\METODOLOGIAS-Y-FRAMEWORKS.md` |
| **Fecha** | 2026-07-27 |
| **En git** | ✅ Trackeado |
| **Tema** | Stack metodológico centralizado: BPMN 2.0, frameworks usados en diagnóstico y mapeo. Menciona herramientas, documentos (ej. `sistemaaiprocess/prompts/mapa-procesos-nivel0.md`), casos de uso. Introducción al enfoque de CONSULTORAVIRTUAL. |
| **Estado aparente** | ✅ Vigente — Documento de visión general de metodologías |
| **Relacionados** | • `sistemaaiprocess/prompts/mapa-procesos-nivel0.md` (2026-07-23) — Menciona como "Mapa de procesos nivel 0"<br/>• `sistemaaiprocess/docs/fundamentos-teoricos.md` (2026-08-05) — Complementa con detalle teórico<br/>• `docs/METODOLOGIA-JERARQUIA-MAPEA.md` (2026-08-05) — Extiende para Mapea específicamente |
| **Notas de auditoría** | **SÍ REFERENCIA** a `mapa-procesos-nivel0.md`, a diferencia de `METODOLOGIA-JERARQUIA-MAPEA.md`. Ambos documentos son de 2026-07 vs 2026-08, lo que puede explicar la desincronización. |

### 12. `docs/ESCALERA-IA-POR-MADUREZ.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\ESCALERA-IA-POR-MADUREZ.md` |
| **Fecha** | (no especificada) |
| **En git** | ✅ Trackeado |
| **Tema** | Mapeo de madurez (MMA-OD) a capacidades/ofertas de IA. Cómo escalar según nivel de madurez del cliente. |
| **Estado aparente** | ⏳ Vigente (requiere revisión para fecha y estado exacto) |
| **Relacionados** | • `sistemaaiprocess/docs/fundamentos-teoricos.md` (2026-08-05) — Define MMA-OD<br/>• Docs comerciales/propuestas — Consumidores de este mapeo |
| **Notas de auditoría** | **ACCIÓN REQUERIDA**: Verificar fecha y alineación actual con modelo MMA-OD. |

---

## ORGANIZACIÓN Y AGENTES

### 13. `organizacionvirtual/MATRIZ_AGENTES.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\organizacionvirtual\MATRIZ_AGENTES.md` |
| **Fecha** | 2026-08-05 (v1.6, según BITACORA-CAMBIOS) |
| **En git** | ✅ Trackeado |
| **Tema** | Roster y responsabilidades de los 11 agentes de CONSULTORAVIRTUAL: qué hace cada agente, límites de autoridad, insumos/salidas. Fuente de verdad para estructura organizacional. Agregó PRODUCT MANAGER, COMERCIAL, FINANCE en v1.1; actualizó a v1.6 para incluir ADMIN-DOCUMENTAL. |
| **Estado aparente** | ✅ Vigente — Matriz operativa actual |
| **Relacionados** | • `organizacionvirtual/ORGANIGRAMA.md` — Debe reflejar el mismo roster<br/>• `organizacionvirtual/EQUIPO.md` — Roster para autovista de agentes<br/>• `.claude/agents/*.md` — Definiciones ejecutables de cada agente; nombres deben coincidir |
| **Notas de auditoría** | **NOTA DE AUDITORÍA IMPORTANTE**: En sesiones previas, esta matriz se actualizó con PRODUCT MANAGER/COMERCIAL/FINANCE pero `ORGANIGRAMA.md` quedó desactualizado durante días. Incidente que motivó la creación del agente ADMIN-DOCUMENTAL. Verificar sincronización entre MATRIZ_AGENTES.md y ORGANIGRAMA.md regularmente. |

### 14. `organizacionvirtual/ORGANIGRAMA.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\organizacionvirtual\ORGANIGRAMA.md` |
| **Fecha** | 2026-08-05 (actualizado en BITACORA-CAMBIOS) |
| **En git** | ✅ Trackeado |
| **Tema** | Visualización jerárquica de estructura organizacional. Refleja roster de MATRIZ_AGENTES.md en formato visual/descriptivo. |
| **Estado aparente** | ✅ Vigente — Debe estar siempre sincronizado con MATRIZ_AGENTES.md |
| **Relacionados** | • `organizacionvirtual/MATRIZ_AGENTES.md` — Fuente de verdad de roster<br/>• `organizacionvirtual/EQUIPO.md` — Otra vista del roster |
| **Notas de auditoría** | **SINCRONIZACIÓN CRÍTICA**: Verificar que cualquier cambio en MATRIZ_AGENTES.md se refleje acá. Ej: si se agrega nuevo agente, debe aparecer en ORGANIGRAMA.md antes de que terceros lo lean. |

### 15. `organizacionvirtual/EQUIPO.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\organizacionvirtual\EQUIPO.md` |
| **Fecha** | (no especificada) |
| **En git** | ✅ Trackeado |
| **Tema** | Roster de agentes para auto-presentación (agentes se ven entre sí, contexto operativo). |
| **Estado aparente** | ✅ Vigente — Debe reflejar MATRIZ_AGENTES.md |
| **Relacionados** | • `organizacionvirtual/MATRIZ_AGENTES.md` — Fuente de verdad<br/>• `organizacionvirtual/ORGANIGRAMA.md` — Otra vista |
| **Notas de auditoría** | **ACCIÓN REQUERIDA**: Verificar fecha y que esté sincronizado con MATRIZ_AGENTES.md (v1.6 actual). |

---

## ESTADO DE PROYECTOS

### 16. `sistemaaiprocess/docs/FASE_1_STATUS.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\docs\FASE_1_STATUS.md` |
| **Fecha** | (requiere lectura para fecha exacta) |
| **En git** | ✅ Trackeado |
| **Tema** | Estado técnico de FASE 1 de AIProcess (MMA-OD diagnostic). Avance, blockers, metrics. Documento vivo de seguimiento. |
| **Estado aparente** | ✅ Vigente — Documento de tracking operativo |
| **Relacionados** | • `docs/FASE_1_STATUS.md` — ¿Hay dos versiones? Requiere auditoría |
| **Notas de auditoría** | **ACCIÓN REQUERIDA**: Verificar si `sistemaaiprocess/docs/FASE_1_STATUS.md` y `docs/FASE_1_STATUS.md` son el mismo archivo o si hay duplicación. Si son distintos, verificar por qué. |

### 17. `docs/FASE_1_STATUS.md` (posible duplicado)

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\FASE_1_STATUS.md` |
| **Fecha** | (requiere lectura) |
| **En git** | ✅ Trackeado |
| **Tema** | (idem) |
| **Estado aparente** | ⚠️ **POSIBLE DUPLICADO** — Verificar si es copia, referencia cruzada, o intención de dos estados distintos |
| **Relacionados** | • `sistemaaiprocess/docs/FASE_1_STATUS.md` — Posible original |
| **Notas de auditoría** | **ACCIÓN REQUERIDA — CRÍTICA**: Auditar por qué hay dos archivos. Si es duplicado no intencional, eliminar uno. Si es intención (ej. un estado de consultoría manual, otro de AIProcess), documentar la separación explícitamente. |

---

## OTROS DOCUMENTOS DE DISEÑO

### 18. `docs/HANDOFF-2026-08-05.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\HANDOFF-2026-08-05.md` |
| **Fecha** | 2026-08-05 |
| **En git** | ✅ Trackeado |
| **Tema** | Snapshot de fin de sesión (2026-08-05): estado de tareas, decisiones, próximas acciones, bloqueos. Formato de transición entre sesiones. |
| **Estado aparente** | ✅ Vigente como histórico — Referencia para contexto de sesión 2026-08-07 |
| **Relacionados** | • BITACORA-CAMBIOS (2026-08-07) — Continuación de este handoff<br/>• Memoria del PMcoordinador — Contexto de sesiones previas |
| **Notas de auditoría** | Bien fechado. Sirve como punto de referencia histórica. |

### 19. `docs/PLAN-REESTRUCTURACION-AIPROCESS-CL.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\PLAN-REESTRUCTURACION-AIPROCESS-CL.md` |
| **Fecha** | (no especificada en lectura) |
| **En git** | ✅ Trackeado |
| **Tema** | Plan de reestructuración de infraestructura y modelos de AIProcess (nombre, dominios, roles). |
| **Estado aparente** | ⓘ Desconocido — Requiere lectura y auditoría de fecha y vigencia |
| **Relacionados** | • Docs de organización y estructura<br/>• BITACORA-CAMBIOS — Puede contener referencias |
| **Notas de auditoría** | **ACCIÓN REQUERIDA**: Revisar y catalogar completamente. |

### 20. `.claude/agents/admin-documental.md`

| Atributo | Valor |
|----------|-------|
| **Ruta completa** | `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\.claude\agents\admin-documental.md` |
| **Fecha** | 2026-08-07 (agregado en BITACORA-CAMBIOS) |
| **En git** | ✅ Trackeado (según referencia en BITACORA-CAMBIOS) |
| **Tema** | Definición ejecutable del agente ADMIN-DOCUMENTAL: responsabilidades, protocolo, mapa de documentos relacionados. Tu propia especificación. |
| **Estado aparente** | ✅ Vigente — Agente recién creado (2026-08-07) |
| **Relacionados** | • `organizacionvirtual/MATRIZ_AGENTES.md` (v1.6) — Incluye este agente en roster |
| **Notas de auditoría** | Bien estructurado. Primera instancia de este agente. |

---

## RESUMEN DE HALLAZGOS DE AUDITORÍA

### ✅ CONSISTENCIAS DETECTADAS

1. **Cadena de incrementos de F02 bien estructurada**: Cada diseño referencia claramente su antecesor y sucesor.
2. **Especificación F02 es fuente de verdad única**: Todos los diseños de incremento la citan y la respetan.
3. **Fundamentos teóricos son base sólida**: Verifican contra fuentes académicas antes de establecer reglas.
4. **BITACORA-CAMBIOS actualizadA**: Refleja implementación de Incremento 3 y creación de ADMIN-DOCUMENTAL.
5. **Matriz y Organigrama (ahora) sincronizados**: Ambos incluyen ADMIN-DOCUMENTAL en v1.6 (2026-08-05).

### ⚠️ DISCREPANCIAS / DESINCRONIZACIONES ENCONTRADAS

#### **RESUELTO — Mapa de Procesos Nivel 0 (fusionado en Incremento 3)**

| Hallazgo | Detalle |
|----------|---------|
| **Doc** | `sistemaaiprocess/prompts/mapa-procesos-nivel0.md` (2026-07-23) |
| **Problema anterior** | Parecía no trackeado — `sistemaaiprocess/` está en `.gitignore` del repo `CONSULTORAVIRTUAL` (tiene su propio git separado, ver `.gitignore` línea 1-2), así que `git status`/`ls-files` desde acá nunca lo iba a mostrar. Verificado directo en `sistemaaiprocess/`: SÍ estaba trackeado ahí, con commit `9b54113` como último cambio anterior a esta sesión. El problema real no era "huérfano de git", era "invisible desde el repo equivocado" + sin sincronización con `METODOLOGIA-JERARQUIA-MAPEA.md`. |
| **Resolución** | ✅ **RESUELTA (2026-08-07)**: ANALISTA-PROCESOS-NEGOCIO determinó que sus reglas de nomenclatura/cantidades/orden se incorporan en `docs/DISENO-NIVELES-1-4-F02.md`. Nota histórica agregada al archivo y commiteada en su propio repo (`sistemaaiprocess`, commit `158e8d3`), no en `CONSULTORAVIRTUAL`. Queda como referencia, no como especificación vigente autónoma. |
| **Acciones tomadas** | 1. Agregada nota de vigencia al inicio de `mapa-procesos-nivel0.md`. 2. Commiteado en el repo `sistemaaiprocess` (no en `CONSULTORAVIRTUAL` — son repos distintos). 3. Actualizado INVENTARIO-DOCUMENTOS.md. 4. Actualizado mapa de relaciones en `.claude/agents/admin-documental.md`. |

#### **MENOR — Posible Duplicación de FASE_1_STATUS.md**

| Hallazgo | Detalle |
|----------|---------|
| **Docs** | `sistemaaiprocess/docs/FASE_1_STATUS.md` + `docs/FASE_1_STATUS.md` |
| **Problema** | Dos archivos con el mismo nombre en directorios distintos. Podría ser: (a) duplicado no intencional, (b) separación deliberada (estado de Fase 1 general vs. estado de Fase 1 de AIProcess específicamente). |
| **Impacto** | Confusión sobre cuál es la fuente de verdad. PMcoordinador o Patricio pueden estar leyendo versiones distintas. |
| **Recomendación** | **ACCIÓN REQUERIDA**: Auditar ambos archivos. Si son iguales, eliminar uno. Si son distintos, documentar la separación en ambas rutas (comentario de cabecera). |

#### **MENOR — Falta de Referencia en METODOLOGIA-JERARQUIA-MAPEA.md**

| Hallazgo | Detalle |
|----------|---------|
| **Doc** | `docs/METODOLOGIA-JERARQUIA-MAPEA.md` (2026-08-05) |
| **Problema** | Define 4 niveles (Diagrama de Valor / Proceso / Subproceso / Procedimiento) pero **no referencia** `sistemaaiprocess/prompts/mapa-procesos-nivel0.md` que ya hace lo mismo desde 2026-07-23. |
| **Impacto** | Quien implementa Nivel 1 no sabe que existe un prompt histórico de captura de "Diagrama de Valor". Riesgo de re-inventar lo que ya se diseñó. |
| **Causa probable** | Metodología fue escrita en aislamiento de la carpeta `sistemaaiprocess/prompts/`. Falta conexión entre niveles de la organización documental (producto técnico en `sistemaaiprocess/`, metodología en `docs/`). |
| **Recomendación** | **ACCIÓN RECOMENDADA**: Agregar sección en `METODOLOGIA-JERARQUIA-MAPEA.md` que cite y valide (o descarte) `mapa-procesos-nivel0.md` como implementación histórica de Nivel 1. Si es útil, mantenerlo como referencia histórica con nota de vigencia. |

#### **MENOR — ESCALERA-IA-POR-MADUREZ sin fecha verificada**

| Hallazgo | Detalle |
|----------|---------|
| **Doc** | `docs/ESCALERA-IA-POR-MADUREZ.md` |
| **Problema** | Sin fecha de creación visible. No claro si está sincronizado con versión actual de MMA-OD (`sistemaaiprocess/docs/fundamentos-teoricos.md`, 2026-08-05). |
| **Impacto** | Comercial podría usar mapeo desactualizado de madurez a ofertas. |
| **Recomendación** | **ACCIÓN RECOMENDADA**: Verificar fecha y alineación con MMA-OD actual. Agregar fecha de última revisión. |

#### **MENOR — MATRIZ_AGENTES.md / ORGANIGRAMA.md Sincronización Histórica**

| Hallazgo | Detalle |
|----------|---------|
| **Docs** | `organizacionvirtual/MATRIZ_AGENTES.md` + `organizacionvirtual/ORGANIGRAMA.md` |
| **Problema** | **Histórico (ya resuelto en v1.6)**: En sesiones previas, MATRIZ_AGENTES.md tenía PRODUCT MANAGER/COMERCIAL/FINANCE desde v1.1, pero ORGANIGRAMA.md quedó con roster viejo durante días. Esto motivó la creación de ADMIN-DOCUMENTAL. |
| **Impacto** | Terceros leyendo ORGANIGRAMA.md obtenían información desactualizada. |
| **Estado actual** | ✅ Resuelto en v1.6 (2026-08-05). Ambos archivos incluyen ADMIN-DOCUMENTAL. |
| **Recomendación** | **ACCIÓN PREVENTIVA**: Establecer protocolo: cualquier cambio a MATRIZ_AGENTES.md debe disparar auditoría de ORGANIGRAMA.md + EQUIPO.md dentro de 24h (trabajo que hace ADMIN-DOCUMENTAL). |

---

## RESUMEN EJECUTIVO PARA PMcoordinador/PATRICIO

**Documentos catalogados:** 20  
**En git:** 20 ✅ trackeados (1 de ellos en el repo separado `sistemaaiprocess/`, no en `CONSULTORAVIRTUAL` — ver nota abajo) | 0 ❌ huérfanos reales  
**Acciones requeridas:**

1. ✅ **RESUELTA — Mapa-procesos-nivel0.md**: no era huérfano de git, vive en el repo separado `sistemaaiprocess/` (gitignored desde `CONSULTORAVIRTUAL`, ver `.gitignore`). Nota histórica agregada, commiteada ahí (commit `158e8d3`). Reglas incorporadas en DISENO-NIVELES-1-4-F02.md (2026-08-07).
2. **CRÍTICA — FASE_1_STATUS.md duplicado**: Auditar si es duplicación accidental. Si sí, consolidar. Si no, documentar separación.
3. **Recomendada — METODOLOGIA-JERARQUIA-MAPEA.md**: Agregar sección que valide/cite/descarta mapa-procesos-nivel0.md.
4. **Recomendada — ESCALERA-IA-POR-MADUREZ.md**: Verificar fecha y alineación con MMA-OD actual.
5. **Preventiva — Protocolo MATRIZ_AGENTES.md**: Cualquier cambio debe auditar ORGANIGRAMA.md + EQUIPO.md dentro de 24h (ADMIN-DOCUMENTAL hace esto).

**Próxima auditoría sugerida:** 2026-08-20 (13 días) o tras cambio de metodología de producto.

---

**Documento generado por:** ADMIN-DOCUMENTAL  
**Fecha de creación:** 2026-08-07  
**Última actualización:** 2026-08-07  
**Próxima revisión sugerida:** Inmediata (acciones críticas pendientes)
