# Viabilidad Comercial: Generador de Diagramas BPMN desde Prompt

**Autor:** PRODUCT MANAGER
**Fecha:** 2026-08-04
**Para:** PMcoordinador → Patricio Ferrer
**Relacionado:** `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`, `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md`, `BITACORA-CAMBIOS.md` (2026-08-02, 2026-08-04)

---

## Recomendación

**Aceptar con condiciones.**

El producto es técnicamente viable y el costo operativo es irrelevantemente bajo frente a cualquier precio de suscripción razonable — el margen no es el problema. El problema real es de mercado: **ya existen 4-5 competidores directos** haciendo exactamente "prompt → BPMN" (algunos gratis o más baratos), y **al menos tres de ellos ya exportan a `.bpmn` XML real**, algo que este producto pospuso a fase 2. Lanzar hoy es competir con una mano atada — no es motivo para no lanzar, pero sí para lanzar con expectativas correctas y dos condiciones:

1. **No lanzar como autoservicio abierto "para analistas de procesos" en general.** La evidencia interna de CONSULTORAVIRTUAL (`docs/investigacion/REALIDAD-CLIENTE-PYME-CHILE.md`, regla R-1) dice que el techo de gasto en tecnología de una PYME chilena es ≤1 UF (~$41.000 CLP)/mes **para todo su stack**, decidido por el dueño, no por un empleado individual. Un analista que trabaja *dentro* de una PYME no va a pagar una suscripción personal de su bolsillo por una herramienta de trabajo. El comprador real y viable en el corto plazo es otro: consultores independientes/freelance, analistas en empresas más grandes con gasto de herramientas vía tarjeta corporativa, o la propia base de clientes de CONSULTORAVIRTUAL. Ver sección 4.
2. **Reconsiderar el orden de fase 2.** La exportación XML no es un "nice to have" — es lo que ya ofrecen 3 de los 4 competidores directos encontrados. Si el producto se queda 2-3 meses sin ella mientras la competencia la tiene desde el día 1, el diferencial "más barato, sin XML" es débil. No bloquea el lanzamiento de v1 (ya está decidido y el research técnico ya está hecho), pero sí debería ser la primera prioridad post-MVP, no una entre varias.

**Precio recomendado: CLP $9.990/mes** (≈ USD 10,50), plan único, sin tiers, sin trial gratis en v1. Justificación en sección 1.

---

## 1. Modelo de Pricing

### Precio recomendado

| | |
|---|---|
| **Precio** | **CLP $9.990/mes** (plan único, sin tiers) |
| **Trial gratis** | **No en v1** — construirlo requiere límites de uso que hoy no existen (ver Hallazgo de ARQUITECTO/DEV: "sin límite de generaciones por plan, un usuario puede erosionar margen"). Revisar cuando exista contador de uso. |
| **Permanencia** | Mensual, cancelable en cualquier momento, sin multa de salida (coherente con R-12 de `REALIDAD-CLIENTE-PYME-CHILE.md`, aunque ese documento habla de PYME — el principio de "sin trampas de salida" es buena práctica igual para este público). |
| **Límite de uso** | Recomiendo fijar uno antes de abrir venta pública (ver sección 2) — no es un bloqueador del código ya construido, es una condición para el lanzamiento comercial. |

### Por qué CLP $9.990 y no otro número

- **Ancla de competencia directa:** Just Flow It cobra USD 9,99/mes por su plan Pro (IA ilimitada) — el competidor más parecido en propuesta de valor y el más barato de los que ya exportan). BPMNify cobra USD ~29,90/mes pero incluye exportación XML e importación de imágenes. Patchley cobra €15/mes (~USD 16) también con XML. **Sin exportación XML, este producto no puede cobrar al nivel de BPMNify o Patchley** — cobrar CLP $9.990 (≈USD 10,50) lo posiciona a la par de Just Flow It, el competidor más comparable en alcance real (v1 sin XML).
- **No es un problema de costo, es un problema de percepción de valor:** como se ve en la sección 2, el costo de operar por usuario es tan bajo que el precio podría fijarse en casi cualquier número entre CLP $5.000 y $20.000 sin comprometer margen. El límite no lo pone el costo, lo pone lo que el mercado ya paga por lo mismo.
- **No uso CLP $41.000 (1 UF) como ancla** aunque esté documentado como techo de gasto tecnológico PYME — ese techo es para el presupuesto de tecnología de *toda la empresa* (ERP + este + todo lo demás), no el precio de una sola herramienta de nicho. Usarlo como ancla de precio sería sobreestimar cuánto vale este producto específico dentro de ese presupuesto ya copado.

### Sobre pricing por proyecto vs. por cliente (formato estándar de mi rol)

No aplica en este caso — es un SaaS de suscripción de producto propio, no un proyecto de consultoría cotizado por banda. El paralelo con `MODELO-FASES-Y-PRECIOS.md` / `CATALOGO-SERVICIOS.md` (que cotizan proyectos de $350.000-$1.000.000 CLP) no es comparable: ese es trabajo de consultoría por entrega, esto es un producto de software con costo marginal casi cero por uso adicional.

---

## 2. Costo real de operar (estimación, no dato de uso real)

**Aviso explícito:** esto es una estimación con supuestos razonables de tokens, no datos medidos. ARQUITECTO ya señaló este riesgo ("necesita validarse con datos reales de uso en fase de testing interno") y lo confirmo — la cifra siguiente es un techo de referencia para fijar precio, no un número para reportar como costo real hasta que exista telemetría de uso.

**Supuestos por generación de diagrama** (según el diseño de la Fase 2 en `PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`: prompt de sistema podado de `bpmn-architect` + prompt del usuario + JSON estructurado de salida):

- Prompt de sistema: ~2.000 tokens (candidato a prompt caching, ya que es idéntico en cada llamada)
- Prompt del usuario (la descripción del proceso): ~350 tokens
- Output JSON estructurado (actores, pasos, decisiones): ~1.200 tokens

**Modelo:** Claude Sonnet 5 (`claude-sonnet-5`) — es el modelo correcto para esta tarea de extracción estructurada, no Haiku. Justificación: la calidad de extracción de un JSON con semántica de negocio (lanes por actor, gateways de decisión, `pending_questions` cuando el LLM no puede inferir con confianza) es precisamente el riesgo #1 que señaló ARQUITECTO ("prompts ambiguos generan diagramas incorrectos") — usar Haiku para ahorrar céntimos de dólar y degradar la calidad de extracción sería optimizar la variable equivocada.

**Precio de la API de Claude Sonnet 5 (a la fecha):** USD $3,00 / MTok input, USD $15,00 / MTok output (precio estándar). Existe un precio introductorio de USD $2,00 / $10,00 vigente solo hasta 2026-08-31 — **no lo uso como base** porque el lanzamiento de v1 (4,5-5 semanas desde el 2026-08-04) cae justo en el límite o después de esa fecha; usar el precio introductorio subestimaría el costo real al momento de operar en producción.

**Costo por generación (sin prompt caching, caso base):**

```
Input:  2.350 tokens × $3,00 / 1.000.000  = $0,00705 USD
Output: 1.200 tokens × $15,00 / 1.000.000 = $0,01800 USD
Total por generación                       ≈ $0,025 USD  (≈ CLP $24)
```

Con prompt caching activo (si el tráfico es suficientemente frecuente para que el caché de 5 minutos del prompt de sistema se mantenga "caliente" entre usuarios, ya que el prompt de sistema es idéntico para todos), el costo baja a ≈USD $0,020 por generación. La diferencia es marginal para el argumento de negocio — la conclusión no cambia con o sin caché.

**Margen a CLP $9.990/mes:**

| Escenario de uso | Costo API/mes | Comisión Mercado Pago (~4,7% con IVA) | Margen neto |
|---|---|---|---|
| Uso ligero (20 diagramas/mes) | ≈ CLP $475 | ≈ CLP $470 | **≈ CLP $9.045 (≈90%)** |
| Uso intensivo (100 diagramas/mes) | ≈ CLP $2.375 | ≈ CLP $470 | **≈ CLP $7.145 (≈72%)** |

**Conclusión:** el costo operativo no es una restricción de negocio en ningún escenario realista. El margen es saludable incluso en el caso de un usuario que abusa del sistema generando decenas de diagramas al día — aunque justamente por eso sigo recomendando un límite de generaciones por plan antes de abrir venta pública: no por margen, sino porque sin límite un solo usuario con un script puede convertir esto en un vector de costo impredecible (no es un riesgo de negocio hoy, es una higiene operativa mínima antes de exponer el endpoint a tráfico público).

---

## 3. Análisis de Competencia

**Hallazgo principal: no estamos entrando a un espacio vacío.** Existe una categoría activa de "AI text-to-BPMN" con al menos 4 jugadores dedicados exclusivamente a esto, más 2-3 jugadores grandes (SAP Signavio, Visual Paradigm) que lo ofrecen como feature dentro de suites mayores. Esto no invalida el proyecto — valida que el problema es real y que hay demanda pagante — pero cambia la conversación de "primeros en el mercado" a "un jugador más en un mercado ya poblado".

| Competidor | Qué hace | Precio | Exporta XML | Nuestro gap/ventaja |
|---|---|---|---|---|
| **Just Flow It** (justflow.it) | Texto/voz/imagen/PDF → BPMN 2.0, edición conversacional iterativa | Free: 1 prompt IA/día · Pro: **USD $9,99/mes** · Team: USD $14,99/asiento/mes | Sí (BPMN 2.0 export) | El más comparable en precio y alcance. Tiene XML desde ya; nosotros no en v1. Base aparentemente brasileña/LATAM — competencia regional directa. |
| **BPMNify** (bpmn-ai.com) | Genera BPMN 2.0 desde texto, captura desde imagen | Professional: **USD $29,90/mes** (ilimitado + XML + captura de imagen) | Sí | Mucho más caro, pero con más funcionalidad (captura de imagen, XML). No es la referencia de precio para nosotros — es la referencia de "qué se puede llegar a cobrar si se agrega XML e input multimodal". |
| **Patchley** (patchley.com) | Voz/texto → BPMN 2.0, orientado a levantar procesos en vivo durante reuniones/entrevistas | Free: 5 generaciones · Professional: **€15/asiento/mes** (~USD $16) | Sí | Propuesta de valor específica ("diagrama listo antes de que termine la reunión") que se parece mucho al caso de uso real de un consultor de procesos — vale la pena estudiar ese ángulo de producto, no solo el precio. |
| **BA Copilot** | Texto/imagen/Mermaid/pizarra → BPMN 2.0, exporta a PNG/PDF/SVG/BPMN XML/Visio | Freemium (1 diagrama sin login) · plan pago sin precio público confirmado | Sí | Mismo patrón: BPMN 2.0 XML de salida ya incluido. |
| **SAP Signavio** (Text-to-Process) | Texto en lenguaje natural → BPMN dentro de la suite completa de gestión de procesos SAP | Parte de licencia enterprise SAP Signavio — sin precio standalone | Sí (integrado al Process Manager) | No es competencia directa de precio (es un módulo dentro de una suite empresarial cara), pero sí valida el caso de uso a nivel enterprise. No compite por el mismo comprador (PYME/consultor individual). |
| **Visual Paradigm AI BPMN** | Generador de BPMN por IA dentro de Visual Paradigm Desktop | Parte de licencia Visual Paradigm (herramienta de modelado establecida) | Sí | Mismo patrón que Signavio — feature dentro de una herramienta ya instalada, no un SaaS nuevo. |
| **Miro AI / Lucidchart AI** | Generación de diagramas genéricos (no BPMN específico) desde texto, dentro de una suite de whiteboarding/diagramación general | Miro: crédito incluido en planes desde gratis · Lucidchart: desde USD $9/mes | No específicamente BPMN 2.0 | No son competencia BPMN-específica, pero si un analista solo necesita "un diagrama de proceso visualmente claro" (no BPMN 2.0 formal), estas herramientas generalistas ya resuelven eso a precio similar o menor, con marca reconocida. |

**Lo que esto significa para nuestra posición:**

- **El diferencial de "texto libre en español → BPMN con semántica de color 60-30-10" no es único** — es una variación de una categoría ya establecida en inglés. Ningún competidor listado tiene evidencia de estar optimizado para español/LATAM específicamente (aunque Just Flow It parece tener origen brasileño). Si hay un diferencial defendible, es ese: producto en español, con soporte y contexto de mercado chileno/LATAM, integrado al ecosistema de CONSULTORAVIRTUAL — no la tecnología de extracción en sí, que cualquier competidor con acceso a la API de Claude/GPT puede replicar.
- **No encontré datos de tamaño de mercado (TAM/SAM)** de analistas de procesos en Chile o LATAM dispuestos a pagar por una herramienta así. El dato más cercano que encontré fue de una bolsa de empleo (Computrabajo Chile: 2.244 ofertas de "analista de procesos" activas) — eso mide demanda laboral de la profesión, no tamaño de mercado de compradores de una herramienta de software, y no lo uso como proxy de mercado direccionable. Si esta cifra es necesaria para una decisión de inversión mayor, se necesita investigación de mercado dedicada, no la reporto sin esa validación.

---

## 4. Riesgo específico del producto: ¿quién es el comprador real?

Esta es la pregunta que ni ARQUITECTO IT ni DEV podían responder porque no es su dominio, y es la más importante de este documento.

**El público objetivo declarado ("analistas de procesos como usuarios individuales") es una simplificación que no sobrevive el contacto con el mercado chileno/LATAM que CONSULTORAVIRTUAL ya conoce.** La evidencia interna es clara:

- `REALIDAD-CLIENTE-PYME-CHILE.md` (R-1): el gasto en tecnología de una PYME chilena está topado en ≤1 UF (~$41.000 CLP)/mes **para todo el stack**, y esa decisión la toma el dueño, no un empleado. Un analista de procesos que trabaja *dentro* de una PYME no tiene presupuesto propio ni autoridad para contratar una suscripción de software — y tampoco es razonable esperar que pague de su bolsillo una herramienta de trabajo, especialmente en un mercado donde "presupuesto" es la barrera #1 declarada (23%) incluso para gasto de la empresa, no del individuo.
- Esto **no significa que no haya comprador** — significa que el comprador real, al menos en el corto plazo, es uno de estos tres perfiles, no "el analista genérico":
  1. **Consultores/analistas independientes o freelance** que facturan sus propios servicios y sí tienen autoridad y motivo directo para pagar una herramienta que les ahorra tiempo facturable — este es el segmento más parecido al self-serve B2C que el diseño actual (mono-usuario, sin equipos) ya soporta bien.
  2. **Analistas en empresas medianas/grandes** (no PYME) con gasto de herramientas SaaS vía tarjeta corporativa o reembolso — un segmento real pero que CONSULTORAVIRTUAL no ha targeteado históricamente (su ICP documentado es PYME).
  3. **La propia base de clientes/prospectos de CONSULTORAVIRTUAL** — empresas que ya están en proceso de consultoría y para quienes esta herramienta es un complemento del servicio, no una compra independiente. Aquí el comprador es la empresa cliente, vía la relación comercial existente, no un analista suelto buscando una herramienta en Google.
- **Implicación de modelo de venta:** el diseño mono-usuario actual (decisión ya cerrada, correcta de mantener) es compatible con los tres perfiles — ninguno necesita multi-tenant todavía. Pero el mensaje de marketing y el canal de adquisición sí cambian: no es "SEO para 'analista de procesos' genérico esperando que un empleado de PYME lo encuentre y pague de su bolsillo" — es apuntar a consultores independientes y ofrecerlo primero a la cartera existente de CONSULTORAVIRTUAL.

---

## 5. Go-to-Market

Dado que CONSULTORAVIRTUAL ya tiene canal (sitio web en `aiprocess.cl`, cliente piloto SSTT Ernesto Andino, relación con `sistemaaiprocess`), la pregunta no es "cómo conseguimos usuarios de cero" sino "cuál de los canales que ya existen usamos primero".

**Recomendación: lanzamiento en 3 etapas, no simultáneo.**

1. **Etapa 1 — Piloto interno/cliente existente (semana de lanzamiento).** Ofrecer la herramienta primero a SSTT Ernesto Andino u otro cliente de consultoría activo, como parte de la relación existente (no necesariamente gratis, pero sin fricción de descubrimiento). Esto valida la calidad real de extracción del LLM con un caso de uso real de la consultora — el mismo tipo de proceso que ya se mapeó a mano en `apps/generador-diagramas.html` — antes de exponerlo a desconocidos. Es también la forma más barata de conseguir el dato real de "costo por generación" que hoy es una estimación (sección 2).
2. **Etapa 2 — Consultores independientes vía canal existente (mes 1-2 post-lanzamiento).** Promoción dirigida a consultores de procesos independientes (no PYME, no analistas-empleados) vía el sitio web y contenido SEO/GEO específico — coordinación con la responsabilidad de marketing de este mismo rol (sección B de mi definición de agente). El mensaje: "documenta y comunica procesos en minutos, no horas" — dirigido a alguien que factura su tiempo, no a alguien con presupuesto de empleado.
3. **Etapa 3 — Apertura pública amplia (solo después de tener exportación XML o evidencia de que su ausencia no es un bloqueador de conversión).** No recomiendo invertir en adquisición paga o contenido masivo hasta no saber si la falta de exportación XML está matando conversiones frente a competidores que sí la tienen — eso se sabe con datos de la etapa 2, no antes.

**No recomiendo lanzarlo como feature dentro de `sistemaaiprocess`** (el producto hermano de diagnóstico) — son casos de uso distintos (diagnóstico de madurez organizacional vs. generación de diagramas de proceso) y mezclar ambos en el mismo producto diluye el mensaje de los dos. Mantenerlos como productos hermanos separados, como ya está decidido en la arquitectura (`generador-bpmn/` como carpeta independiente), es correcto — coordinar solo el login/Supabase compartido, que ya es la decisión tomada.

---

## 6. Viabilidad Comercial (resumen ejecutivo del formato estándar)

```
Ingresos esperados:     No proyecto una cifra de usuarios sin dato de conversión real —
                        ver Etapa 1 del GTM antes de comprometer un forecast de 3 meses.
Costos de desarrollo:   ~20 días-persona ya validados por DEV (costo hundido, ya en curso).
Costo operativo/mes:    ≈ CLP $475-2.375 por usuario activo (uso ligero-intensivo) — trivial.
Margen bruto esperado:  ≈ 72-90% por usuario a CLP $9.990/mes, en cualquier escenario de uso.
Margen vs. meta:        ✅ OK — el margen unitario no es el riesgo de este proyecto.
Riesgo real:            Adopción/distribución, no costo ni margen. Ver secciones 3 y 4.

Recomendación: Aceptar con condiciones
  1. No vender como autoservicio B2C genérico — apuntar a consultores independientes
     y cartera existente de CONSULTORAVIRTUAL primero (sección 4 y 5).
  2. Fijar un límite de generaciones por plan antes de abrir venta pública (sección 2) —
     no es un bloqueador de v1, es una condición previa a exponer el endpoint a tráfico
     no controlado.
  3. Priorizar exportación XML como el primer ítem de fase 2, no uno más de una lista —
     es lo que ya ofrecen 3 de 4 competidores directos (sección 3).
```

---

## Preguntas que quedan abiertas para Patricio / PMcoordinador

1. ¿Se acepta el precio recomendado (CLP $9.990/mes) o se prefiere validar con los primeros usuarios reales de la Etapa 1 antes de fijarlo en firme?
2. ¿Se ejecuta el lanzamiento en las 3 etapas propuestas, o hay presión de timeline que obliga a saltar directo a apertura pública?
3. ¿Vale la pena adelantar la fase 2 (exportación XML) inmediatamente después del MVP, dado el hallazgo de competencia, en vez de esperar a ver tracción primero?
