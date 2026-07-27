# GEO Audit — aiprocess.cl (producción) + evaluación de la skill `geo-audit`

**Fecha:** 2026-07-27 · **Auditor:** agente QA · **Objetivo:** `https://aiprocess.cl` (sirve desde `https://www.aiprocess.cl`)
**Alcance:** solo lectura. 14 fetches. Ningún formulario enviado, nada modificado.
**Metodología:** fases y fórmula de `.agents/skills/geo-audit/SKILL.md` (con las desviaciones documentadas en §2.1).

> **Convención de evidencia:** `[VERIFICADO: cómo]` = medido en esta sesión. `[NO VERIFICADO]` = no se pudo medir; no se rellenó con supuestos.

---

# PARTE 1 — AUDITORÍA DEL SITIO ACTUAL

## 1.1 Ficha

| Campo | Valor |
|---|---|
| Tipo de negocio detectado | **Agencia/Servicios** (consultoría unipersonal) `[VERIFICADO: bio, servicios, sin carrito ni pricing]` |
| Stack | HTML estático + CSS, servido por Vercel `[VERIFICADO: header Server: Vercel, HTML plano vía curl]` |
| Páginas indexables | **1** (la home; todo lo demás son anclas `#`) `[VERIFICADO: sitemap.xml + inventario de href]` |
| Palabras de contenido | ~1.476 `[VERIFICADO: strip de tags sobre el HTML de 41 KB]` |
| Última publicación | build 2026-07-09 `[VERIFICADO: footer + Last-Modified]` |

## 1.2 Puntaje

| Categoría | Puntaje | Peso | Ponderado |
|---|---|---|---|
| AI Citability | 30/100 | 25% | 7,5 |
| Brand Authority | 10/100 | 20% | 2,0 |
| Content E-E-A-T | 25/100 | 20% | 5,0 |
| Technical GEO | 55/100 | 15% | 8,25 |
| Schema & Structured Data | 35/100 | 10% | 3,5 |
| Platform Optimization | 10/100 | 10% | 1,0 |
| **GEO Score** | | | **27/100 — Crítico** |

> ⚠️ **Advertencia obligatoria sobre este número.** Los seis puntajes de categoría son **juicio del auditor, no mediciones**. La skill define los pesos pero **no define cómo se obtiene cada puntaje de 0-100**: no hay rúbrica, ni ítems, ni umbrales. Otro auditor con los mismos datos podría dar 18 o 40 con igual justificación. El 27 es **ordinal, no métrico**: sirve para decir "estamos en el tramo crítico", no para medir progreso mes a mes. Ver §2.3.

## 1.3 Hallazgos críticos

**C1 — Redirección 307 (temporal) en dirección opuesta al canonical.**
`https://aiprocess.cl/` → `307 Temporary Redirect` → `https://www.aiprocess.cl/`, pero **el canonical, el Open Graph, el sitemap y el JSON-LD de la página servida apuntan todos a `https://aiprocess.cl/` (sin www)**. `[VERIFICADO: curl -sI en ambos hosts + head del HTML]`
El host que responde 200 declara que el canónico es un host que redirige. Además el 307 no consolida señales: es un redirect temporal, y le dice al rastreador "vuelve a preguntar". Resultado: la única página del sitio tiene su identidad dividida entre dos hosts.
**Fix:** decidir el host (el plan ya decidió: sin `www`) y hacer `301` desde el perdedor. Hoy la configuración de Vercel hace exactamente lo contrario.

**C2 — Cero contenido en formato pregunta→respuesta extraíble.**
El sitio contiene 6 encabezados en forma de pregunta, pero **todos son preguntas del test de diagnóstico, cuyas "respuestas" son opciones de un quiz y cuyo resultado lo calcula JavaScript**. `[VERIFICADO: los H3 del quiz y el bloque "Tu Plan de Acción Recomendado" están en el HTML como plantilla vacía; el texto del resultado no existe hasta ejecutar JS]`
No hay una sola afirmación autocontenida del tipo "AIProcess es X / cuesta Y / sirve para Z" que un motor pueda cortar y citar. Los H2 son eslóganes (`No te quedes atrás`, `La tecnología solo funciona sobre el orden`), no proposiciones.

**C3 — La entidad "AIProcess" no existe fuera de su propio sitio.**
Búsqueda de `"aiprocess.cl" OR "AIProcess" "Patricio Ferrer" procesos Chile`: **cero resultados de terceros**. El único enlace externo válido es su propio LinkedIn. `[VERIFICADO: WebSearch, 2026-07-27]`
Agravante no trivial: **"Patricio Ferrer" es un nombre ambiguo en el corpus chileno** — la búsqueda devuelve principalmente a *Patricio Smith Ferrer* (Facultad de Medicina UC, proyectos Conicyt) y a varios homónimos con página en Wikipedia. Sin desambiguadores fuertes (institución + rubro + `sameAs`), un modelo tenderá a colapsar la entidad contra el homónimo más documentado.

## 1.4 Hallazgos altos

**A1 — El nombre de la marca está escrito de dos formas en la misma página.** `AIProcess` en `<title>`, JSON-LD y footer-legal; **`AI Process`** (con espacio) en el nombre del footer. `[VERIFICADO: extracción del footer]` Es exactamente la fractura de entidad que el propio plan advierte en §6 (NAP).

**A2 — Datos de contacto personales como datos corporativos.** `email: ferrer.patricio@gmail.com` y `telephone: +56990025264` publicados en el JSON-LD y en el HTML. `[VERIFICADO: head del HTML]` Un Gmail como correo de organización es una señal de entidad débil (y, en paralelo, expone un dato personal en un campo estructurado que los agregadores copian).

**A3 — Sin `llms.txt`.** `404`. `[VERIFICADO: curl]` Severidad real: **baja, no alta** — ver §2.4, donde se corrige la clasificación de la skill.

**A4 — Schema mínimo y sin grafo.** Un solo bloque `ProfessionalService`. `[VERIFICADO: 1 ocurrencia de application/ld+json]` Falta: `@id` (no hay nodos referenciables), `Person` como entidad propia, `WebSite`, `Service`, `FAQPage`. `founder` es un objeto anónimo, así que la trayectoria de 25 años no queda atribuida a ninguna entidad estable.

**A5 — El activo de conversión no es una página.** El test de diagnóstico vive dentro de la home como sección `#diagnostico`. No tiene URL propia, no está en el sitemap, no se puede enlazar ni citar. `/test` → `404`. `[VERIFICADO]`

## 1.5 Hallazgos medios

- **M1 — `lang="es"` en vez de `es-CL`.** `[VERIFICADO]` Se pierde la señal de mercado, que es justo el diferenciador (consultor *en Chile*).
- **M2 — Sitemap con 1 URL y apuntando al host que no responde 200.** `Sitemap: https://aiprocess.cl/sitemap.xml` en un robots.txt servido desde `www`. `[VERIFICADO]`
- **M3 — Sin fechas visibles ni en el contenido ni en el schema.** Solo un `build-20260709` en el pie. No hay `Actualizado:` legible.
- **M4 — Cero citas, fuentes o cifras verificables.** El texto es enteramente asertivo-comercial. Coincide con el hallazgo mejor respaldado del paper GEO (§2.2): agregar fuentes y estadísticas es la palanca de citación más efectiva, y aquí es cero.
- **M5 — Variación en la credencial.** El sitio dice *"Ingeniero Civil UTFSM"*; el plan dice *"ingeniero civil informático UTFSM"*. Dos redacciones de la misma credencial = ruido de entidad.

## 1.6 Hallazgos bajos

- **B1 — `og-image.png` pesa 498 KB** (`capacitacion.jpg` 168 KB, `patricio-ferrer.png` 199 KB). `[VERIFICADO: Content-Length]` Incumple el tope de 200 KB del checklist del plan (ítem 15).
- **B2 — Navegación 100% de anclas**: cero enlaces internos reales, por lo tanto cero estructura de sitio que un rastreador pueda mapear.
- **B3 — Core Web Vitals no medidos.** `[NO VERIFICADO]` — requiere PageSpeed Insights; fuera del alcance de solo-fetch.
- **B4 — Perfil de Empresa en Google, Bing Places, YouTube, Reddit: no medidos.** `[NO VERIFICADO]` — la skill los puntúa (20%+10% del score) sin dar ningún método para medirlos.

## 1.7 Lo que está bien (y conviene no romper en la migración)

1. **HTML estático, contenido íntegro sin ejecutar JS.** `[VERIFICADO: curl devuelve todo el copy]` Es la condición previa a cualquier cita y el sitio nuevo (Next.js) debe conservarla vía Server Components.
2. **`robots.txt` permite a todos los rastreadores, incluidos los de IA.** Coincide con la recomendación del plan §5.5. No tocar.
3. **`alt` descriptivo y real en las 9 imágenes.** `[VERIFICADO]` Mejor que la media.
4. **404 real (código 404, no 200).** `[VERIFICADO]`
5. **HSTS activo, HTTPS limpio.** `[VERIFICADO: Strict-Transport-Security: max-age=63072000]`

---

# PARTE 2 — VEREDICTO SOBRE LA HERRAMIENTA

## 2.1 La skill no es ejecutable como está escrita

La Fase 2 —el corazón del método— delega en cinco subagentes: `geo-ai-visibility`, `geo-platform-analysis`, `geo-technical`, `geo-content`, `geo-schema`.
**Ninguno de los cinco existe en el repositorio.** `[VERIFICADO: .agents/skills/ contiene solo bpmn, bpmn-architect, geo-audit, supabase; grep de los cinco nombres en todo el proyecto solo devuelve el propio SKILL.md]`
La skill es un SKILL.md huérfano: describe una orquestación cuyas piezas no fueron entregadas. Lo que realmente hace un agente al invocarla es improvisar las cinco categorías a mano — que es lo que hice aquí, y por eso §1.2 lleva la advertencia.

## 2.2 La cita del estudio está tergiversada

La skill afirma en su "Key Insight": *"Sites that score high on GEO metrics see 30-115% more visibility in AI-generated responses (Georgia Tech / Princeton / IIT Delhi 2024 study)."*

Verificación:
- **El estudio existe.** *GEO: Generative Engine Optimization*, Aggarwal et al., KDD 2024 (arXiv 2311.09735). Afiliaciones: Princeton, IIT Delhi, Georgia Tech y Allen Institute for AI. `[VERIFICADO: arxiv.org/abs/2311.09735 + dl.acm.org/doi/10.1145/3637528.3671900]`
- **El titular del paper es "up to 40%", no "30-115%".** El abstract dice literalmente que GEO puede subir la visibilidad *hasta un 40%*, y añade el matiz —que la skill omite— de que **la eficacia varía por dominio**. `[VERIFICADO: abstract]`
- **El "115%" es una celda aislada, no un rango.** Corresponde a un sitio en 5ª posición que ganó 115,1% aplicando *una sola* táctica (Cite Sources). En el mismo experimento **el sitio nº1 perdió 30,3%**. `[VERIFICADO: WebSearch sobre el paper]`
- Por lo tanto **el "30-115%" de la skill parece construido tomando el −30,3% de la pérdida y el +115,1% de la ganancia y presentándolos como un rango de beneficio.** Es la lectura menos caritativa posible del dato, y es la que sostiene toda la premisa de la herramienta.

Contraste incómodo: **nuestro propio documento cita el mismo paper mejor que la skill** (SEO-GEO-WEB-NUEVA §5.1: *"agregar estadísticas, citas y fuentes es lo que más sube la visibilidad"* — afirmación cualitativa, sin inflar el número).

## 2.3 El puntaje ponderado da sensación de rigor sin sustento

Los pesos (25/20/20/15/10/10) se presentan sin ninguna derivación: no hay estudio, ni correlación, ni justificación de por qué "Brand Authority" vale el doble que "Schema". Y por debajo del peso no hay rúbrica: la skill nunca dice cómo pasar de una observación ("no hay llms.txt") a un número de categoría.
Consecuencia práctica: **el score no es reproducible ni comparable en el tiempo.** Si el mes que viene alguien vuelve a correrla y da 41, no sabremos si el sitio mejoró o si el auditor estaba de mejor humor. Un score de 3 decimales de precisión aparente sobre entradas que son opiniones es precisamente el tipo de número que Patricio no debería llevar a un cliente.

## 2.4 Recomienda cosas cuyo efecto nadie confirmó — y las clasifica mal

La skill pone **"No llms.txt file present" en severidad Alta ("arreglar en 1 semana")** y lo incluye dentro del 15% de Technical GEO.
Contraste con `C:\SkillsBackup\all-skills\SKILL_seo.md`, que sobre lo mismo dice: adopción ~0,015% de los sitios, **ningún proveedor de IA confirmó leerlo**, trátalo como un añadido especulativo de 5 minutos y no reorganices contenido a su alrededor. Nuestro propio plan es igual de honesto: cita que **Google confirmó en junio 2026 que no lo usa** y lo recomienda igual, pero explicitando la expectativa.
**La skill es la única de las tres fuentes que presenta `llms.txt` como obligación urgente sin ninguna calificación.** Es su fallo más representativo: convierte una convención no confirmada en una alarma.

Mismo patrón en otros ítems: "Brand not recognized as an entity by any AI system" figura como Crítico, pero la skill no da ningún método para determinarlo — ni una consulta, ni un motor, ni un criterio de aprobación.

## 2.5 Sesgo comercial

**No detecté promoción encubierta.** No menciona ningún producto, proveedor, plataforma de pago ni dominio. `[VERIFICADO: lectura completa de las 338 líneas]`
El sesgo que sí tiene es **de categoría, no de marca**: infla la magnitud del beneficio (§2.2), clasifica como urgente lo no confirmado (§2.4) y produce un score bajo que invita a contratar remediación. Es el sesgo estructural de cualquier herramienta de auditoría, no un conflicto de interés concreto.

## 2.6 Qué le falta

1. **Los cinco subagentes.** Sin ellos no es una herramienta, es un índice.
2. **Rúbrica de puntaje.** Ítems observables con puntos asignados, para que dos corridas sean comparables.
3. **Distinción entre lo medible y lo opinable.** Categorías que valen el 30% del score (Brand + Platform) no tienen método de medición. Deberían marcarse como no medidas en vez de estimarse.
4. **Manejo de la ambigüedad de entidad.** Ni se menciona, y en este caso concreto es un hallazgo de primer orden (C3).
5. **Redirects, hosts y consistencia de canonical.** No están en ninguna de las seis categorías. El hallazgo más duro de esta auditoría (C1) lo encontré *a pesar* de la skill, no gracias a ella.
6. **Idioma/mercado.** `hreflang`, `lang`, señales de país: ausentes. Para un negocio local chileno, esto no es un detalle.
7. **Riesgo de migración.** El sitio actual define a AIProcess como "IA para consultas dentales y centros de estética"; el sitio nuevo lo definirá como "recuperar la plata que pierde tu operación PYME". Son **dos entidades distintas**. Ninguna categoría de la skill contempla el costo de contradecir una definición ya indexada.

**Qué haría mejor otra herramienta:** el `SKILL_seo.md` de respaldo, siendo mucho más modesto (no da score, no promete porcentajes), es **más confiable** porque cada afirmación viene calibrada por su grado de evidencia. Para lo puramente técnico, Lighthouse + Rich Results Test + Search Console dan datos reproducibles y gratis, que es exactamente lo que a la skill le falta.

---

# PARTE 3 — LA SKILL vs. NUESTRO PLAN

## 3.1 Lo que la skill encontró y nuestro plan NO vio

| # | Hallazgo | Por qué importa |
|---|---|---|
| 1 | **El 307 www ↔ canonical no-www ya está roto en producción** (C1) | El plan (§2) dice *"Redirect 301 `www` → `aiprocess.cl`"* como si fuera algo por configurar. **La configuración actual va en la dirección contraria y con código temporal.** El ítem 5 del checklist QA verifica `http://www.aiprocess.cl → 301`, es decir, verifica la dirección correcta — pero nadie corrió ese check contra producción. Al desplegar sobre el mismo proyecto de Vercel, esta regla puede sobrevivir a la migración. |
| 2 | **"AI Process" vs "AIProcess" ya está en producción** (A1) | El plan advierte el riesgo en abstracto (§6, NAP). La auditoría lo confirma como defecto real y existente. |
| 3 | **Ambigüedad del nombre "Patricio Ferrer"** (C3) | El plan invierte fuerte en `/patricio-ferrer` y en schema `Person` **asumiendo que definir la entidad basta**. No contempla que hay homónimos mejor documentados compitiendo por el nombre. Refuerza la necesidad de `sameAs` + `alumniOf` + rubro en cada mención — que el plan ya tiene — pero eleva su prioridad de "bueno tener" a "condición de éxito". |
| 4 | **Gmail personal + celular como datos de organización** (A2) | El plan deja `email` y `telephone` como `[[...]]` a completar, sin criterio. La auditoría muestra qué pasa cuando se completa con lo personal. |
| 5 | **`og-image.png` de 498 KB ya en producción** (B1) | El checklist lo cubre (ítem 15) pero como verificación futura; el activo defectuoso ya existe y probablemente se reutilice. |

*(Matiz honesto: 1, 2 y 5 los encontré ejecutando `curl` y comparando contra el checklist del plan, no siguiendo las categorías de la skill. La skill aportó la estructura del informe; no aportó estos hallazgos.)*

## 3.2 Lo que nuestro plan vio y la skill NO

| # | Aporte del plan | Ausente en la skill |
|---|---|---|
| 1 | **Calibración de evidencia** (`[VERIFICADO]` / `[ESTIMADO]`, "ningún volumen está verificado y por eso ninguno se publica") | La skill no tiene ningún mecanismo para distinguir lo medido de lo supuesto. Es su carencia más grave. |
| 2 | **Regla de austeridad: 5 páginas, no 30** | La skill empuja implícitamente a producir más contenido (rastrea hasta 50 páginas, premia el volumen). No tiene concepto de "una página mediocre baja el promedio del dominio". |
| 3 | **Estrategia de keyword con grieta identificada (Sercotec)** | La skill no hace ningún análisis de demanda ni competitivo. Audita el sitio como objeto aislado. |
| 4 | **Frase de entidad única, repetida literal en 6 lugares** | La skill mide "Brand Authority" como presencia en plataformas, pero no tiene el concepto de *consistencia literal* como señal. |
| 5 | **Bloqueos éticos explícitos** (`/casos` bloqueada hasta tener testimonio real; cero cifras inventadas; claims con LEGAL) | La skill no contempla que el remedio pueda ser peor que el problema. Un agente siguiéndola al pie de la letra "arreglaría" la falta de casos de estudio inventándolos. |
| 6 | **Expectativa correcta sobre `llms.txt`** (Google confirmó que no lo usa; hazlo igual, sabiendo eso) | La skill lo marca Alto sin calificar. |
| 7 | **Checklist de 24 ítems con comando de verificación concreto** | La skill tiene "quality gates" de crawling, pero ningún criterio de aprobación verificable. |
| 8 | **SEO local chileno** (Perfil de Empresa sin dirección física, Bing Places por Perplexity, ecosistema Sercotec) | La skill nombra "LocalBusiness schema" y poco más. Cero contexto de mercado. |

## 3.3 Balance

**Nuestro plan es mejor herramienta que la skill.** Es más honesto con la evidencia, más específico al negocio, y contiene guardarraíles éticos que la skill no tiene. La skill aporta dos cosas que el plan no tiene: **una estructura de informe reutilizable** y **el hábito de auditar producción con `curl` en vez de leer el repo** — que es como salieron C1, A1 y B1.

---

## Recomendación operativa

**Adoptar con reservas fuertes, y solo como plantilla de informe.** Concretamente:

1. **No usar el GEO Score frente a clientes.** Ni en propuestas ni en entregables. No es reproducible.
2. **Corregir el SKILL.md antes de volver a usarlo:** reemplazar el "30-115%" por *"hasta 40%, con eficacia variable por dominio (Aggarwal et al., KDD 2024)"*, y bajar `llms.txt` de Alto a Bajo con la calificación de Google.
3. **O escribir los cinco subagentes, o borrar la Fase 2** y reescribir la skill como checklist de un solo agente. Hoy promete una orquestación que no existe.
4. **Fuente de verdad para el sitio nuevo: `SEO-GEO-WEB-NUEVA.md`.** La skill se usa después del despliegue, como formato de reporte de QA.
5. **Añadir al checklist del plan un ítem 25:** *verificar en producción la dirección y el código del redirect de host antes y después de desplegar.*

---

## Apéndice: URLs consultadas

| URL | Código | Nota |
|---|---|---|
| `https://aiprocess.cl/` | 307 → www | redirect temporal |
| `https://www.aiprocess.cl/` | 200 | 41.353 bytes, HTML estático |
| `https://aiprocess.cl/robots.txt` | 200 | permite todo |
| `https://www.aiprocess.cl/robots.txt` | 200 | idéntico |
| `https://www.aiprocess.cl/sitemap.xml` | 200 | 1 URL |
| `/llms.txt` · `/test` · `/preguntas-frecuentes` · `/blog` · `/pagina-no-existe` | 404 | — |
| `assets/og-image.png` · `capacitacion.jpg` · `patricio-ferrer.png` · `index.css` | 200 | 498 / 168 / 199 / 28 KB |
| `https://linkedin.com/in/patricioferrer` | 200 | único enlace externo |
| `arxiv.org/abs/2311.09735` · `dl.acm.org/doi/10.1145/3637528.3671900` | 200 | verificación del estudio |

**No medido:** Core Web Vitals, Perfil de Empresa en Google, Bing Places, presencia en YouTube/Reddit/Wikipedia, validación formal del JSON-LD en el Rich Results Test.

---
*Auditoría de solo lectura. No se modificó ningún archivo del sitio ni del proyecto.*
