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

## 7. Extensión (2026-08-04): Alcance confirmado — Latinoamérica

Patricio confirmó que el alcance de expansión es **Latinoamérica** (no incluye España). Con eso, la decisión de proveedor de pago (Mercado Pago) no se reabre — sigue siendo la elección correcta, es el único de los dos candidatos evaluados (Stripe vs. Mercado Pago) con presencia real en la región. Lo que sí cambia es la pregunta: no es "¿qué proveedor?", es "¿qué tan pareja es la cobertura de ese proveedor país por país?".

### 7.1 Cobertura de Mercado Pago por país LATAM (Chile, México, Argentina, Colombia, Perú)

Mercado Pago opera con cuenta y checkout propios en 8 países de LATAM: Argentina, Brasil, Chile, Colombia, México, Perú, Uruguay y Ecuador. De los 5 países que pidió Patricio, los 5 están cubiertos operativamente. La pregunta relevante no es "¿funciona?" — técnicamente funciona en los 5 — es **si el método de pago que el usuario espera ver por default en su país está presente**, porque eso es lo que determina si el checkout se siente "conocido y seguro" o "genérico y sospechoso".

| País | Métodos que Checkout Pro sí cubre | Método local "esperado" que falta o es parcial | Lectura de transparencia |
|---|---|---|---|
| **Argentina** | Tarjetas, transferencia, dinero en cuenta MP, cuotas | Ninguno — Argentina es el mercado de origen de Mercado Pago | **Máxima confianza.** Acá MP *es* el método esperado, no una alternativa. |
| **Chile** | Tarjetas de crédito/débito, transferencia bancaria, saldo en cuenta MP | **Webpay** (Transbank) no aparece como opción dentro del checkout de Mercado Pago — son pasarelas competidoras, no integradas entre sí | Riesgo de confianza ya existente en la decisión original (no técnico — las tarjetas sí funcionan), pero real: en Chile el usuario promedio reconoce el logo "Webpay" como sello de "esto es seguro" y no lo va a ver acá. Mitigable con copy claro en el checkout ("aceptamos Visa/Mastercard/Redcompra vía tarjeta"), no con más desarrollo. No reabro la decisión — solo lo dejo documentado porque nadie lo había escrito hasta ahora. |
| **México** | Tarjetas, **SPEI** (transferencia bancaria instantánea 24/7, vía Banxico) y **OXXO Pay** (código para pagar en efectivo en tiendas OXXO) | Ninguno de los métodos "top of mind" mexicanos falta — SPEI y OXXO son exactamente lo que un usuario mexicano espera ver además de tarjeta | Cobertura fuerte en el alta. **Pero:** OXXO es pago en efectivo diferido (el usuario genera un código y paga después, físicamente) — no es compatible con cobro automático recurrente (`preapproval`). Sirve para "probar el producto una vez", no para sostener una suscripción mensual sin fricción. La suscripción recurrente real en México, como en el resto de la región, depende de tarjeta tokenizada. |
| **Colombia** | Tarjetas, **PSE** (transferencia bancaria — el método de pago online más usado en Colombia), **Nequi** y **Daviplata** (billeteras digitales masivas), Efecty/Baloto (efectivo) | Ninguno grande falta — PSE y Nequi son justamente los dos que un usuario colombiano busca primero | Cobertura fuerte en el alta. Mismo matiz que México: PSE/Nequi funcionan bien para el pago inicial, pero el cobro recurrente automático mes a mes es más confiable con tarjeta. |
| **Perú** | Tarjetas, **Yape** (billetera del BCP, +15M usuarios, integrada a Mercado Pago desde 2024), **PagoEfectivo** (red de agentes/efectivo) | Ninguno grande falta — Yape es la billetera dominante en Perú y ya está integrada | Cobertura fuerte. Mismo matiz de recurrencia que México/Colombia: Yape es fuerte para pago puntual/QR, la suscripción automática recae en tarjeta. |

**Patrón que se repite en México, Colombia y Perú (no en Chile ni Argentina):** Mercado Pago cubre muy bien el método de pago *esperado por el usuario para el primer pago o para compras puntuales* (OXXO, PSE/Nequi, Yape) — eso resuelve la "sensación de transparencia" que pidió Patricio. Pero el modelo de negocio de este producto es **suscripción con cobro automático recurrente**, y ese cobro automático depende de tarjeta de crédito/débito tokenizada en los 5 países, sin excepción real. Los métodos locales "de confianza" ayudan a que el usuario decida probar el producto, pero no resuelven el cobro del mes 2 en adelante si el usuario no tiene tarjeta.

**Dato que no tengo y no invento:** no encontré cifras confiables de penetración de tarjeta de crédito/débito por país para poder cuantificar qué tan grande es esa fricción en México/Colombia/Perú frente a Chile/Argentina. Es una hipótesis razonable (LATAM tiene brechas conocidas de bancarización que varían fuerte por país), no un dato verificado — si esto se vuelve relevante para decidir en qué país invertir primero, es investigación de FINANCE/COMERCIAL antes de comprometer presupuesto de adquisición, no algo que yo deba estimar sin base.

### 7.2 GTM específico para México

**Recomendación: no entrar a México en el lanzamiento inicial. Validar primero en Chile, expandir a México después con lo aprendido.**

Razón principal, y no es de pago — es de canal: CONSULTORAVIRTUAL hoy tiene en Chile lo que no tiene en México — dominio (`aiprocess.cl`), cliente piloto real (SSTT Ernesto Andino), y una relación comercial existente que sirve de primer canal de distribución sin costo de adquisición (ver Etapa 1 y 2 del GTM en la sección 5 de este documento). En México, CONSULTORAVIRTUAL parte de cero: sin sitio, sin caso de cliente, sin marca reconocida, sin ningún canal propio. Entrar ahí en paralelo al lanzamiento significaría pagar el costo completo de adquisición (SEO desde cero, contenido desde cero, sin ningún caso de éxito local que mostrar) sobre un producto cuya calidad real de extracción del LLM **todavía no está validada con datos reales de uso** (ver sección 2 — el costo por generación es una estimación, no un dato medido). Validar la propuesta de valor en un mercado donde ya hay canal, y recién después replicar en un mercado nuevo, es la secuencia de menor riesgo.

Esto no descarta México — lo pospone a una decisión deliberada de expansión, no a un lanzamiento simultáneo. Cuando se evalúe entrar, dos notas:

- **Técnicamente no hay bloqueo de pago** — la cobertura de Mercado Pago en México (sección 7.1) es sólida, SPEI y OXXO están.
- **El ángulo de entrada más barato probablemente no es SEO genérico ni ads pagados** — es replicar la Etapa 2 del GTM (consultores independientes vía contenido dirigido) pero en México, apoyándose en que ninguno de los competidores directos encontrados (sección 3) parece estar optimizado para español mexicano ni para métodos de pago mexicanos específicamente — Just Flow It, el más cercano en precio, tiene señales de base brasileña/portugués, no mexicana. Es una hipótesis de oportunidad, no un dato confirmado — validar con un piloto chico antes de invertir presupuesto de adquisición.

### 7.3 ¿Está resuelto "desplegable y escalable sin grandes cambios" en el resto de LATAM?

**Parcialmente. Hay una pieza que NO está resuelta por la arquitectura actual y que ARQUITECTO IT (y probablemente LEGAL) debe revisar antes de asumir que expandir a un país nuevo es solo "agregar un site_id".**

**Lo que sí está resuelto:**
- **Idioma:** correcto no invertir en i18n — con el alcance confirmado como LATAM hispanohablante (Chile, México, Argentina, Colombia, Perú), Next.js sin framework de traducción es la decisión correcta, todo el público objetivo lee español. Diferencias de vocabulario regional (modismos chilenos vs. mexicanos vs. argentinos) son un tema de copy de marketing, no de arquitectura — no bloquea nada técnico.
- **Precio único vs. precio por poder adquisitivo local:** no recomiendo construir un motor de precio dinámico por PPP para esta etapa. Dado el margen operativo (sección 2, ~72-90% en cualquier escenario de uso), el costo no obliga a diferenciar precio por país, y ningún competidor encontrado en la sección 3 localiza precio por país LATAM (todos cobran un número fijo en USD o EUR para toda su base). Recomiendo lo mismo: fijar un precio equivalente a ~USD $10-11 en la moneda local de cada país al momento de lanzar ahí (no un valor calculado hoy con un tipo de cambio que va a estar desactualizado para cuando se lance) — no es una fórmula automática de PPP, es una conversión simple revisada periódicamente. **Excepción a vigilar: Argentina.** Por la volatilidad cambiaria/inflacionaria del peso argentino, un precio fijo en ARS puede quedar desactualizado en semanas, no meses — si se lanza en Argentina, ese precio necesita revisión más frecuente que en el resto de países, o anclarse a una referencia en USD que se recalcule en pesos en cada ciclo de cobro. Esto es una nota para cuando se diseñe el flujo de cobro en Argentina, no un bloqueador de v1 en Chile.

**Lo que NO está confirmado y necesita revisión de ARQUITECTO IT (posiblemente con LEGAL):**
- **Una cuenta de Mercado Pago está atada a un país específico, no es una billetera regional única.** La documentación de Mercado Pago que revisé es explícita en esto: una cuenta chilena no opera como cuenta local en otro país ni mueve dinero directamente entre países. Cada `site_id` (MLC=Chile, MLM=México, MLA=Argentina, MCO=Colombia, MPE=Perú) corresponde a una cuenta de vendedor distinta. **Lo que no logré confirmar con la investigación disponible es si CONSULTORAVIRTUAL (entidad chilena) puede abrir una cuenta vendedor de Mercado Pago México/Colombia/Perú/Argentina sin una entidad legal o RUT/RFC/CUIT/NIT local en ese país**, o si eso exige constituir presencia legal local. Si la segunda opción es la real, "desplegable sin grandes cambios" es falso para cualquier país más allá de Chile — se vuelve una decisión de LEGAL y de inversión, no un cambio de configuración de DEV. **Pido explícitamente que ARQUITECTO IT valide esto contra la documentación oficial de Mercado Pago (onboarding de vendedor internacional) antes de que se asuma que expandir a México es trivial técnicamente** — mi research de esta sesión no llega a ese nivel de certeza y no quiero reportarlo como resuelto sin esa confirmación.
- **Zona gris sobre el alcance "Latinoamérica":** Mercado Pago también opera en Brasil, que es geográficamente LATAM pero de habla portuguesa. La confirmación de Patricio dice "Latinoamérica, no incluye España" — no queda explícito si Brasil está dentro o fuera de ese alcance. Si Brasil llegara a considerarse parte del alcance más adelante, ahí sí se rompe el supuesto "todo es en español" y se necesitaría i18n real, no solo una nueva cuenta de Mercado Pago. Dejo esto como pregunta abierta abajo, no como algo que yo deba asumir en un sentido u otro.

---

## Preguntas que quedan abiertas para Patricio / PMcoordinador

1. ¿Se acepta el precio recomendado (CLP $9.990/mes) o se prefiere validar con los primeros usuarios reales de la Etapa 1 antes de fijarlo en firme?
2. ¿Se ejecuta el lanzamiento en las 3 etapas propuestas, o hay presión de timeline que obliga a saltar directo a apertura pública?
3. ¿Vale la pena adelantar la fase 2 (exportación XML) inmediatamente después del MVP, dado el hallazgo de competencia, en vez de esperar a ver tracción primero?
4. **¿ARQUITECTO IT puede confirmar si abrir una cuenta vendedor de Mercado Pago en México/Colombia/Perú/Argentina requiere entidad legal local, o si CONSULTORAVIRTUAL (entidad chilena) puede operar esas cuentas sin constituirse en cada país?** Esto determina si la expansión LATAM es un cambio de configuración o una decisión de inversión/LEGAL.
5. ¿Se confirma la secuencia "validar en Chile primero, expandir a México después", o hay una razón de negocio (que yo no tengo visibilidad) para entrar a ambos mercados en simultáneo pese al costo de adquisición más alto en México sin canal propio?
6. ¿"Latinoamérica" incluye Brasil? Si sí, hay que replantear el supuesto de "sin i18n porque todo es en español" — Brasil es de habla portuguesa.

---

## 8. Extensión (2026-08-05): Reevaluación de trial gratis con restricción de alcance

**Contexto:** en la sección 1 recomendé "trial gratis: no en v1" porque, en ese momento, no existía límite de uso — un usuario podía generar diagramas sin tope y erosionar margen. Patricio propone ahora un trial de **3 días** con una restricción dura: el usuario puede loguearse y trabajar, pero **no puede crear un diagrama nuevo — solo trabajar sobre uno ya existente**. Corresponde reevaluar con este diseño específico, no repetir el "no" genérico.

### 8.1 ¿La restricción resuelve el riesgo de costo? Sí, y de forma más completa de lo que la pregunta asume

Revisé el código real (`generador-bpmn/src/app/(app)/actions.ts`), no solo el diseño en abstracto. Hallazgo clave: **la única acción de todo el producto que invoca al LLM es `generarDesdePromptAction`, y esa acción siempre crea un diagrama nuevo (`prisma.diagram.create`)**. No existe una acción de "regenerar" o "reprocesar" sobre un diagrama existente. Todas las demás acciones sobre un diagrama ya creado (`agregarActorAction`, `actualizarPasoAction`, `quitarPasoAction`, `actualizarMetaAction`, etc.) son operaciones CRUD puras sobre la base de datos — **cero llamadas al LLM, costo cero**.

Esto significa que "no crear diagrama nuevo" no *reduce* el riesgo de costo — **lo elimina casi por completo**, porque bloquea el único camino de código que cuesta dinero. Un usuario en trial que reciba un diagrama ya generado (por él mismo o precargado) puede editarlo actor por actor, paso por paso, tantas veces como quiera durante los 3 días, sin generar un solo cargo de API adicional.

**Costo real por usuario de trial, con el precio de Haiku 4.5 confirmado por ARQUITECTO IT el 2026-08-04** (`docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`, ~$0,0065 USD por llamada con 1.500 tokens de entrada / 1.000 de salida): si el diagrama de trial se genera con el propio prompt del usuario, el costo es **una sola llamada, ≈USD $0,0065 (≈CLP $6) por usuario de trial, una única vez, para siempre** — no hay forma de repetirla sin crear un diagrama nuevo, que está bloqueado. Si el diagrama es precargado (ver 8.4), el costo es **CLP $0 por usuario de trial** — es una sola generación pagada una vez por CONSULTORAVIRTUAL, reutilizada por todos.

**¿Hace falta además un límite de reintentos/generaciones dentro del único diagrama?** No. No existe ninguna acción en el código actual que dispare una llamada al LLM sobre un diagrama ya creado — construir un límite adicional sería resolver un problema que la arquitectura ya no tiene. La única superficie a vigilar (no es un límite nuevo, es una verificación de implementación) es que quien construya el gating de trial **bloquee el acceso a `generarDesdePromptAction` y a la ruta `/diagramas/nuevo-ia` por completo para usuarios en trial**, no solo la UI del botón "nuevo diagrama" — un bloqueo solo de interfaz (botón oculto/deshabilitado) es trivialmente evitable llamando la Server Action directo. Esto es una nota para DEV al implementar, no una condición nueva de negocio.

### 8.2 ¿3 días es el número correcto? Sí, mantenerlo

El comprador objetivo (sección 4: consultor/analista independiente que factura su propio tiempo) evalúa una herramienta de este tipo en una sola sesión de trabajo real — no es una compra enterprise con comité de aprobación que necesita semanas. El valor de este producto ("documenta y comunica un proceso en minutos") se percibe o no se percibe en los primeros 10-15 minutos de uso. 3 días da margen para que ese momento ocurra sin depender de que el usuario se loguee el mismo día del registro (cubre un fin de semana o una agenda apretada de cliente), pero es corto para que alguien intente usarlo como sustituto gratuito de un diagrama de cliente real de principio a fin — que de todos modos está bloqueado por la restricción de "un solo diagrama, sin crear nuevos" (un proyecto de consultoría real normalmente necesita más de un diagrama: as-is, to-be, variantes por área). No hay evidencia de competencia que sugiera que un trial más largo convierte mejor — Just Flow It y Patchley usan límites por uso (prompts/generaciones), no por tiempo, así que no hay ancla de mercado directa para el número de días; 3 días es una decisión razonable por default y de bajo riesgo de revisar más adelante si los datos de conversión de la Etapa 1 (sección 5) muestran que el problema es otro.

### 8.3 Qué necesita ver el usuario para que el trial convierta y no se fugue

Mínimo indispensable (contenido, no diseño de UI — eso es DISEÑADOR-UX/DEV):

1. **Días restantes de trial, visible de forma persistente** (ej. "Te quedan 2 días de prueba") — sin esto, el trial expira en silencio y el usuario nunca vuelve.
2. **El momento de mayor intención de compra es cuando el usuario intenta crear un segundo diagrama y se lo bloquean.** Ese clic ("+ Nuevo diagrama" → bloqueado) es la señal más fuerte de que el usuario ya vio valor y quiere más — es el lugar correcto para mostrar el mensaje de conversión ("Activa tu plan para crear diagramas ilimitados"), no solo un banner pasivo en el dashboard. Si el bloqueo se siente como un error genérico en vez de una invitación clara a pagar, se pierde el momento de mayor conversión de todo el flujo.
3. **Qué se pierde al no pagar, en términos concretos, no genéricos:** no "activa tu plan" sin contexto, sino algo como "en el plan pago puedes crear diagramas ilimitados por CLP $9.990/mes" — el precio visible en el momento de fricción reduce la sorpresa y la fricción de decisión.

### 8.4 ¿Diagrama precargado o el primero que el propio usuario crea?

**Recomiendo que sea el primer diagrama que el propio usuario crea con su propio prompt, no uno de ejemplo precargado.**

Motivo: la propuesta de valor central de este producto (sección 4 y 5) es "documenta *tu* proceso en minutos" — dirigida a un consultor que quiere ver si la herramienta sirve para *su* trabajo real, no para un ejemplo genérico de una empresa ficticia. Un diagrama precargado deja al usuario evaluando la interfaz de edición, pero nunca prueba la parte que más vale del producto: la extracción por IA de una descripción propia. Eso debilita la señal de conversión — el usuario podría abandonar sin haber visto nunca el "momento mágico" (prompt → diagrama en segundos), que es exactamente lo que Patchley vende como su gancho ("diagrama listo antes de que termine la reunión", citado en sección 3). Dejar generar el primer diagrama con IA y bloquear la creación de un *segundo* es la versión de la restricción que sí deja experimentar el producto completo una vez, y el costo (≈CLP $6, sección 8.1) es irrelevante.

La única razón para preferir un diagrama precargado sería costo — y ya se descartó en 8.1 (la diferencia es de centavos, no de negocio).

**Riesgo de abuso — ¿cuentas nuevas cada 3 días para seguir usando gratis?** Es un riesgo real de *señal de conversión distorsionada* (usuarios que nunca pretendieron pagar inflan el conteo de "trials activos"), pero **no es un riesgo de costo** — a ≈CLP $6 por cuenta nueva, habría que crear miles de cuentas por mes para que sea un número que le importe al margen del negocio, y a ese volumen ya sería un patrón detectable (mismo IP/email/tarjeta) antes de doler económicamente. Mitigación mínima razonable: exigir verificación de email al registrarse (mismo patrón que ya se implementó en `sistemaaiprocess` para el termómetro de madurez, ver memoria `termometro-deployment`) — no bloquea el lanzamiento, es higiene estándar ya conocida por el equipo, no un desarrollo nuevo de alcance.

### 8.5 Recomendación final

**Aceptar la propuesta de Patricio, con un solo ajuste: el diagrama del trial debe ser el que el propio usuario genera con su primer prompt, no uno precargado (sección 8.4).** El resto de la propuesta —3 días, bloqueo de creación de diagramas nuevos, sin límite adicional de reintentos— se acepta tal cual.

**Motivo principal:** la objeción original ("sin límite de generaciones, un usuario puede erosionar margen") no solo queda resuelta por este diseño — queda sobre-resuelta, porque la arquitectura actual no tiene ningún camino de código que permita generar costo de LLM sobre un diagrama ya existente. El riesgo de costo pasa de "hay que controlarlo" a "estructuralmente no existe" en cuanto se bloquea `generarDesdePromptAction` para usuarios en trial. Con eso fuera de la mesa, el trial deja de ser una decisión de margen y pasa a ser una decisión de conversión — y ahí la única corrección que vale la pena hacer es dejar que el usuario pruebe el producto con su propio caso real (8.4), porque es lo que va a decidir si compra, no el límite de alcance en sí.

**Condición de implementación para DEV (no de negocio):** el gating de trial debe bloquear la Server Action `generarDesdePromptAction` y la ruta `/diagramas/nuevo-ia` a nivel de servidor, no solo ocultar el botón en la UI (ver 8.1).
