# Naming: Generador de Diagramas BPMN desde Prompt

**Autor:** PRODUCT MANAGER
**Fecha:** 2026-08-05
**Para:** PMcoordinador → Patricio Ferrer
**Relacionado:** `docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md` (contexto de mercado, competencia y pricing — no se repite acá)

**Contexto de la decisión técnica (2026-08-05):** el producto vivirá en un subdominio de `aiprocess.cl` (ej. `algo.aiprocess.cl`), no en un dominio propio nuevo. Esa decisión ya está tomada por costo/velocidad y no se reabre acá — este documento solo resuelve qué palabra va en `algo`.

---

## Recomendación

**Mapea** (`mapea.aiprocess.cl`).

**Motivo principal:** "mapea" conecta directo con "mapeo de procesos" — el término que el comprador real (consultores/analistas de procesos independientes, según sección 4 de `VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md`) ya usa todos los días para describir su propio trabajo. No es tan literal como "Generador BPMN" (no compite en el buscador diciendo lo mismo que Just Flow It o BPMNify dicen de sí mismos), pero cualquiera del público objetivo entiende en un segundo qué hace sin necesitar una explicación. Es corta, se pronuncia igual en Chile/México/Argentina/Colombia/Perú, y funciona como imperativo/CTA ("mapea tu proceso") en la landing del subdominio. No encontré colisión real con la competencia directa (Just Flow It, BPMNify, Patchley, BA Copilot) ni con ninguna herramienta de diagramación/BPMN establecida — las únicas marcas "Mapea"-adyacentes que aparecen en registros de marca (MAPIR, MAPAL, MAPA) son de rubros sin relación (electrónica, gestión empresarial genérica) y no generan confusión de categoría.

Segunda opción si "Mapea" no convence en la reunión de decisión: **Pauta** — igual de limpia en la búsqueda de colisión, con connotación de estructura/guía en vez de mapeo, pero comunica menos específicamente "proceso" que Mapea.

---

## Candidatos evaluados

Búsqueda realizada: `"<candidato>" BPMN/diagrama/software/app/marca` por cada nombre, más verificación cruzada contra los 4 competidores directos ya identificados.

| # | Candidato | Subdominio propuesto | Qué comunica | Colisión encontrada | Veredicto |
|---|---|---|---|---|---|
| 1 | **Mapea** | `mapea.aiprocess.cl` | "Mapeo de procesos" — el verbo que usa el propio comprador objetivo | Ninguna en software de diagramas/BPMN. Coincidencias de marca (MAPIR, MAPAL, MAPA) en rubros no relacionados (electrónica, gestión genérica) | ✅ Limpio — **recomendado** |
| 2 | **Pauta** | `pauta.aiprocess.cl` | Guía/estructura de un proceso | Ninguna en software de diagramas/BPMN | ✅ Limpio |
| 3 | **Croquis** | `croquis.aiprocess.cl` | Boceto rápido — encaja con "prompt → diagrama en segundos" | Existe una app menor de bocetos a mano ("Croquis", Android, Nextgal) sin relación con procesos de negocio ni BPMN | ✅ Limpio para este rubro (colisión existente es de otra categoría) |
| 4 | **Bosqueja** | `bosqueja.aiprocess.cl` | Imperativo de "bosquejar" — dibujar rápido y sin fricción | Ninguna encontrada | ✅ Limpio, aunque es la marca menos "pronunciable" del grupo (4 sílabas, verbo poco usado como sustantivo) |
| 5 | **Rasgo** | `rasgo.aiprocess.cl` | "De un rasgo" — trazo limpio y directo | Ninguna encontrada | ✅ Limpio, aunque la conexión con "proceso/BPMN" es más débil que Mapea/Pauta |
| 6 | **Trama** | `trama.aiprocess.cl` | El hilo/secuencia de un proceso contado como historia | Ninguna encontrada en software BPMN/diagramas | ✅ Limpio |
| 7 | **Trazo** | ~~`trazo.aiprocess.cl`~~ | Trazo/dibujo de un diagrama | **Colisión directa:** existe `trazo.app`, "collaborative canvas for teams" — herramienta de diagramación/canvas colaborativo, mismo rubro exacto | ❌ Descartado |
| 8 | **Fluxa** | ~~`fluxa.aiprocess.cl`~~ | Flujo de proceso | **Colisión directa:** "Fluxa Process & Knowledge Management" (software de gestión de procesos, adquirida por Emerson) + apps activas "Fluxa" en Google Play/App Store | ❌ Descartado |

### Candidatos descartados en la primera ronda (no llegaron a la tabla final)

- **Procesia** — colisión fuerte: existe una tecnológica española de ciberseguridad/transformación digital llamada Procesia (procesia.com) y una consultora de procesos "ProcesIA Consulting" (procesia.pro) — dos colisiones en el mismo campo semántico.
- **Itera / IteraIA** — colisión fuerte: "Itera Process" es una multinacional de consultoría de procesos y transformación digital con presencia activa en México, España, Colombia y Perú — exactamente la región y el rubro de este lanzamiento.
- **Bitácora** — palabra saturada: múltiples productos de software ya registrados con ese nombre (logística, mantenimiento, ERP), aunque en categorías distintas.
- **Ordena** — colisión: "Ordena App" ya existe como marca activa (ERP/CRM vía WhatsApp).
- **Grafo** — demasiado cerca fonéticamente de "Grafio", app de diagramas/mapas mentales ya establecida, mismo rubro.
- **Diagra** — demasiado literal (cae en el mismo problema que "Generador BPMN" que se pidió evitar) y colisiona con "DiagRA®", software de diagnóstico automotriz con marca registrada.
- **Modelia** — colisión de marca exacta con modelia.ai (generador de modelos de moda con IA); rubro distinto pero mismo nombre exacto activo como SaaS, riesgo de confusión al buscar.

---

## Verificación de colisión con competencia directa

Ninguno de los 6 candidatos limpios (Mapea, Pauta, Croquis, Bosqueja, Rasgo, Trama) se parece fonética ni visualmente a Just Flow It, BPMNify, Patchley o BA Copilot — no hay riesgo de que un usuario los confunda buscando o recordando el nombre. Tampoco aparecieron en las búsquedas cruzadas "`<candidato>` + BPMN" ni "`<candidato>` + diagram" asociados a ninguno de esos cuatro competidores ni a jugadores mayores (SAP Signavio, Visual Paradigm, Miro, Lucidchart).

## Nota metodológica

Esta es una verificación de colisión de marca por búsqueda web (Google-equivalente), no una búsqueda formal en el registro de marcas de INAPI (Chile) ni en registros de otros países LATAM. Es suficiente para descartar el riesgo obvio de confusión de mercado que pidió esta tarea, pero **antes de imprimir el nombre en marketing pagado o de intentar registrar la marca formalmente**, corresponde una búsqueda de disponibilidad en INAPI (marcasonline.cl) — eso es un paso de LEGAL, no de este documento.
