# 🔎 SEO + GEO — WEB NUEVA aiprocess.cl

**Fecha:** 2026-07-27 · **Rama:** `web-nueva` · **Dominio canónico:** `https://aiprocess.cl` (sin www)
**Para:** agente UI (implementa) y QA (verifica). **Este documento no cambia el mensaje**, solo lo hace encontrable.

> ⚠️ **Sobre los volúmenes de búsqueda:** no se contrató ninguna herramienta de keywords.
> **Ningún volumen está verificado y por eso ninguno se publica en este documento.**
> Lo que sí se verificó es la *oferta* que ya rankea por cada término (quién compite).
> Los volúmenes reales se leerán en Google Search Console a los 60-90 días de publicar.

---

## 1️⃣ KEYWORDS REALES (Chile)

### Principio: el dueño no busca la categoría, busca el síntoma

El dueño de PYME **no escribe "optimización de procesos"** — eso lo escribe un gerente de operaciones
de empresa grande. Él escribe el problema o el instrumento que le da plata (Sercotec).

### 🟢 ALCANZABLES AHORA — donde se juega el primer año

| # | Término | Intención | Estado |
|---|---|---|---|
| 1 | `sercotec crece 2026 en qué se puede gastar` | Instrumento — alta intención | `[VERIFICADO: existe oferta de contenido — sercotec.cl, lofwork.cl, denegocios.cl; volumen no verificado]` |
| 2 | `asesoría para postular a sercotec` | Instrumento — alta intención | `[VERIFICADO: quieropostular.cl y franciscoteayuda.cl compiten; volumen no verificado]` |
| 3 | `sercotec sirve para mejorar procesos` | Instrumento + problema | `[ESTIMADO]` |
| 4 | `cómo ordenar los procesos de mi empresa` | Síntoma | `[ESTIMADO]` |
| 5 | `mi empresa depende de una sola persona qué hago` | Síntoma (tarjeta 1 del mensaje) | `[ESTIMADO]` |
| 6 | `cómo saber cuánta plata pierdo en mi empresa` | Síntoma — nuestro mensaje literal | `[ESTIMADO]` |
| 7 | `cómo dejar de trabajar con planillas excel empresa` | Síntoma (tarjeta 2) | `[ESTIMADO]` |
| 8 | `diagnóstico de procesos gratis pyme chile` | Nuestra Fase 0 | `[ESTIMADO]` |
| 9 | `levantamiento de procesos precio chile` | Comercial, cola media | `[VERIFICADO: compiten backspace.cl, stcon.cl, bizpartners.cl, ecofractales.cl; volumen no verificado]` |
| 10 | `patricio ferrer procesos` / `aiprocess` | Marca — obligatorio ganarla | `[ESTIMADO]` |

**Por qué Sercotec encabeza la lista:** es el único término donde el dueño de PYME chilena
busca **con dinero en la mano y sin saber a quién contratar**. Ningún competidor de procesos
está atacando ese ángulo — los que rankean son gestores de postulación, no consultores de operación.
Es la grieta.

### 🟡 ASPIRACIONALES — año 2, no ahora

| Término | Por qué no ahora |
|---|---|
| `software para pymes chile` | `[VERIFICADO: SERP tomada por Bsale, Laudus, ERP SICO, ComparaSoftware, Capterra]`. Son productos con presupuesto de marketing. Además **no vendemos software** — atraeríamos tráfico equivocado. |
| `levantamiento de procesos` / `bpmn chile` | `[VERIFICADO: ≥5 consultoras establecidas ocupan la página 1]`. Sin autoridad de dominio es perder el año. |
| `consultoría de procesos chile` | Genérico, competido, y además es la palabra que el mensaje **rechaza** ("no somos la consultora típica"). |
| `automatización de procesos` | Competido y ambiguo (atrae buscadores de RPA/software). |

### 🚫 Términos que NO se persiguen, aunque tengan volumen

`transformación digital`, `industria 4.0`, `innovación pyme`, `sinergia`, `escalabilidad`.
Están en la lista prohibida del mensaje **y** traen al visitante equivocado.

---

## 2️⃣ ARQUITECTURA DE URLs Y PÁGINAS

### Regla de austeridad
**5 páginas de contenido, no 30.** Cada página que se agrega hay que escribirla bien y mantenerla.
Una página mediocre baja el promedio de todo el dominio.

| URL | Qué es | Por qué existe | Cuándo |
|---|---|---|---|
| `/` | Landing comercial (las 9 secciones del mensaje) | Marca + término síntoma principal | Lanzamiento |
| `/test` | Test MMA-OD, 8 preguntas | Captura `diagnóstico gratis pyme` y es el CTA de todo el sitio | Lanzamiento |
| `/patricio-ferrer` | Página de persona: trayectoria, formación, enfoque | **Es una página de GEO, no de SEO.** Sin ella el modelo no puede afirmar quién está detrás | Lanzamiento |
| `/preguntas-frecuentes` | FAQ ampliada (las 6 del mensaje + 8 más) | **El activo GEO nº1.** Formato pregunta-respuesta = formato citable | Lanzamiento |
| `/sercotec-mejorar-procesos` | Guía: qué financia Crece, qué no, y cómo se prepara una postulación | Es la keyword alcanzable nº1 y nadie la ataca desde procesos | Lanzamiento |
| `/privacy` `/terms` `/disclaimer` | Legales (ya existen) | Señal de entidad real. Indexables, prioridad baja | Ya existen |
| `/casos` | Casos reales | **NO se crea hasta tener el primer testimonio.** Una página vacía o inventada quema el dominio | Bloqueada |
| `/guias/[slug]` | 3 artículos-síntoma | Fase 2, solo si hay cadencia real de escritura | Mes 4+ |

**Los 3 artículos de `/guias/` cuando llegue el momento** (ya elegidos, no inventar otros):
`/guias/todo-en-la-cabeza-de-una-persona` · `/guias/tres-excel-que-no-cuadran` · `/guias/cerrar-el-mes-con-horas-extra`

### ⛔ Lo que debe quedar FUERA del índice

| Ruta | Acción |
|---|---|
| `/dashboard` `/nuevo` `/proyectos/*` `/actividad` (grupo `(app)`) | `Disallow` en robots.txt **y** `robots: { index: false }` en el layout del grupo. Hoy son rutas internas sin protección de indexación |
| `/api/*` | `Disallow` |
| `/test/resultado/*` (si se crea) | `noindex` — es resultado personal, dato del titular |

### Decisiones de URL
- **Sin `www`.** Redirect 301 permanente `www.aiprocess.cl` → `aiprocess.cl`.
- **Sin barra final.** Elegir una forma y redirigir la otra (Next.js: `trailingSlash: false`).
- URLs en **español, minúsculas, con guiones, sin tildes ni ñ**.
- Nunca cambiar una URL publicada sin 301.

---

## 3️⃣ METADATA POR PÁGINA

> Regla: el `<title>` es lo que el modelo y el buscador leen primero. Debe contener el problema, no la categoría.
> Un solo `<h1>` por página. Los `H2` bajan en orden lógico, sin saltar a `H3` sin `H2`.

### `/` — Landing

| Campo | Valor |
|---|---|
| `title` (53) | `Recupera la plata que tu operación pierde \| AIProcess` |
| `description` (139) | `Tu operación pierde plata todos los meses y no aparece en el balance. Test gratis de 5 minutos para ver en qué estado está. PYMEs en Chile.` |
| `H1` | `Tu operación está perdiendo plata todos los meses. El problema es que no aparece en ninguna parte.` |
| `H2` | 1. `¿Algo de esto te suena?` · 2. `Cuatro etapas. Partimos midiendo, no vendiendo.` · 3. `Entiendo dónde estás parado.` · 4. `Quién está detrás` · 5. `Qué pasa si me escribes` · 6. `Preguntas frecuentes` · 7. `Empieza por saber dónde estás` |

### `/test`

| Campo | Valor |
|---|---|
| `title` (56) | `Test gratis: en qué estado está tu operación \| AIProcess` |
| `description` (146) | `Ocho preguntas, cinco minutos, sin costo. Al final sabes en qué estado está la operación de tu empresa. No pedimos tarjeta ni te llama un vendedor.` |
| `H1` | `En qué estado está tu operación` |
| `H2` | 1. `Cómo funciona el test` · 2. `Qué recibes al terminar` · 3. `Qué hacemos con tus datos` |

### `/patricio-ferrer`

| Campo | Valor |
|---|---|
| `title` (57) | `Patricio Ferrer — procesos y operaciones PYME \| AIProcess` |
| `description` (150) | `Ingeniero civil informático UTFSM. 25 años en operaciones reales: ordenar procesos e implementar tecnología para que la gente trabaje mejor. Chile.` |
| `H1` | `Patricio Ferrer` |
| `H2` | 1. `Formación` · 2. `25 años en operaciones reales` · 3. `Cómo trabajo` · 4. `Dónde encontrarme` |

### `/preguntas-frecuentes`

| Campo | Valor |
|---|---|
| `title` (49) | `Preguntas frecuentes: mejorar procesos en tu PYME` |
| `description` (147) | `Cuánto cuesta, si hay que cambiar de sistemas, cuánto tiempo te quita y si se puede financiar con Sercotec. Respuestas directas, sin letra chica.` |
| `H1` | `Preguntas frecuentes` |
| `H2` | Cada pregunta es un `H2` literal, en primera persona del cliente. Respuesta inmediata debajo, en `<p>`, **autocontenida** |

### `/sercotec-mejorar-procesos`

| Campo | Valor |
|---|---|
| `title` (52) | `Sercotec: financiar la mejora de procesos de tu PYME` |
| `description` (152) | `Qué financia el Fondo Crece, qué gastos son rendibles y en qué orden conviene hacer las cosas para no perder la postulación. Explicado sin tecnicismos.` |
| `H1` | `Cómo usar Sercotec para financiar la mejora de tus procesos` |
| `H2` | 1. `Qué financia el Fondo Crece` · 2. `Qué NO es rendible` · 3. `El error de orden que deja gastos afuera` · 4. `Qué te van a pedir` · 5. `Preguntas frecuentes sobre Sercotec` |

> ⚠️ En `/sercotec-mejorar-procesos`: **cada cifra lleva su fuente y su fecha**, y una línea que diga
> que las bases cambian por región y por convocatoria. Ver `RESTRICCIONES-CONSOLIDADAS.md`.
> Una cifra sin respaldo aquí es riesgo legal, no solo mal SEO.

### Comunes a todas las páginas
`lang="es-CL"` en `<html>` (hoy es `es`) · `canonical` absoluto y autorreferente · Open Graph completo ·
`og:locale = es_CL` · una sola imagen OG de 1200×630 sirve para todo el sitio al inicio.

---

## 4️⃣ DATOS ESTRUCTURADOS (JSON-LD)

**Qué se implementa y por qué:**

| Tipo | Dónde | Para qué |
|---|---|---|
| `ProfessionalService` (subtipo de LocalBusiness) + `Organization` | `/` (en el layout) | Define la entidad "AIProcess". Es lo que enlaza el sitio con el Perfil de Empresa en Google |
| `Person` | `/patricio-ferrer` y referenciada desde `/` | Define quién responde. **Sin esto los modelos no atribuyen la experiencia a nadie** |
| `FAQPage` | `/preguntas-frecuentes` y `/sercotec-mejorar-procesos` | Formato que los motores generativos extraen casi literal |
| `Service` | `/` | Describe qué se ofrece **sin publicar precio** (`offers` se omite deliberadamente) |
| `WebSite` | layout | Nombre del sitio y idioma |

> ⚠️ Todo `[[ ]]` es un dato que **no se inventa**. Si al publicar no existe, se borra la propiedad
> completa — un campo vacío o falso es peor que ausente.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://aiprocess.cl/#organizacion",
      "name": "AIProcess",
      "url": "https://aiprocess.cl",
      "logo": "https://aiprocess.cl/[[ruta-del-logo]].png",
      "image": "https://aiprocess.cl/[[ruta-imagen-og]].jpg",
      "description": "Ayudamos a dueños de PYME en Chile a encontrar y recuperar la plata que su operación pierde cada mes, midiendo y arreglando un proceso a la vez.",
      "founder": { "@id": "https://aiprocess.cl/#patricio-ferrer" },
      "areaServed": { "@type": "Country", "name": "Chile" },
      "knowsLanguage": "es-CL",
      "priceRange": "[[omitir esta propiedad — el sitio no publica precios]]",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CL",
        "addressRegion": "[[región]]",
        "addressLocality": "[[comuna]]"
      },
      "email": "[[correo de contacto público]]",
      "telephone": "[[+56 9 XXXXXXXX — omitir la propiedad si no se quiere publicar]]",
      "vatID": "[[RUT — omitir si no se publica]]",
      "sameAs": [
        "[[URL LinkedIn de la empresa — omitir si no existe]]"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://aiprocess.cl/#patricio-ferrer",
      "name": "Patricio Ferrer",
      "url": "https://aiprocess.cl/patricio-ferrer",
      "jobTitle": "Consultor en procesos y operaciones",
      "worksFor": { "@id": "https://aiprocess.cl/#organizacion" },
      "alumniOf": [
        { "@type": "CollegeOrUniversity", "name": "Universidad Técnica Federico Santa María" },
        { "@type": "CollegeOrUniversity", "name": "Universidad de Chile" },
        { "@type": "CollegeOrUniversity", "name": "Pontificia Universidad Católica de Chile" },
        { "@type": "CollegeOrUniversity", "name": "Universidad del Desarrollo" }
      ],
      "knowsAbout": [
        "optimización de procesos", "modelamiento BPMN", "operaciones PYME",
        "implementación de tecnología", "gestión de la eficiencia operacional"
      ],
      "nationality": { "@type": "Country", "name": "Chile" },
      "sameAs": [ "[[URL completa del perfil de LinkedIn]]" ]
    },
    {
      "@type": "Service",
      "@id": "https://aiprocess.cl/#servicio",
      "name": "Diagnóstico y mejora de procesos para PYME",
      "provider": { "@id": "https://aiprocess.cl/#organizacion" },
      "areaServed": { "@type": "Country", "name": "Chile" },
      "audience": { "@type": "BusinessAudience", "name": "Pequeñas y medianas empresas en Chile" },
      "description": "Cuatro etapas: diagnóstico de cómo funciona hoy la operación, visualización del proceso y del costo mensual de cada punto de traba, ejecución sobre el proceso que más devuelve, y medición para que no se vuelva a caer.",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Etapas",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Test de madurez operacional (8 preguntas, sin costo)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Conversación inicial de una hora (sin costo)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Mapeo del proceso actual, riesgos y plan de implementación" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Implementación de la solución acordada" } }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://aiprocess.cl/#sitio",
      "url": "https://aiprocess.cl",
      "name": "AIProcess",
      "inLanguage": "es-CL",
      "publisher": { "@id": "https://aiprocess.cl/#organizacion" }
    }
  ]
}
```

**`FAQPage` — solo en `/preguntas-frecuentes` y en la sección FAQ de `/sercotec-mejorar-procesos`.**
El texto de `acceptedAnswer` debe ser **idéntico al visible en pantalla**. Marcar preguntas que no están
en la página es motivo de acción manual de Google.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://aiprocess.cl/preguntas-frecuentes#faq",
  "inLanguage": "es-CL",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El test y la primera conversación no cuestan nada. Si después decides avanzar, te paso el valor en la reunión, con el alcance ya conversado. No cotizo a ciegas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Tengo que cambiar mis sistemas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Tu software contable no se toca — lo eligió tu contador y funciona. Trabajo con lo que ya tienes."
      }
    }
  ]
}
```
*(replicar el patrón con las 6 preguntas del mensaje + las que se agreguen)*

---

## 5️⃣ GEO — SER CITADO POR LOS MODELOS

> **Qué es esto en una frase:** que cuando un dueño de PYME le pregunte a ChatGPT
> *"¿quién me ayuda a ordenar los procesos de mi empresa en Chile?"*, el modelo responda
> con una frase que salió de aiprocess.cl y ponga el link.

### 5.1 Formato: escribir para que se pueda extraer

El motor generativo no lee la página, lee **fragmentos**. Un fragmento se cita si se sostiene solo.

| Regla | Qué significa en la práctica |
|---|---|
| **Pregunta como encabezado, respuesta inmediata debajo** | El `H2` es la pregunta literal del cliente. El primer párrafo la responde entera, en ≤2 frases. Ningún "antes de responder, contexto:" |
| **Afirmaciones autocontenidas** | ❌ *"Como vimos arriba, esto se paga."* → ✅ *"El mapeo del proceso actual tiene costo; el test y la primera conversación no."* Sin pronombres que apunten fuera del párrafo |
| **Sujeto explícito, no "nosotros"** | ❌ *"Trabajamos con PYMEs."* → ✅ *"AIProcess trabaja con PYMEs en Chile."* El modelo tiene que poder cortar la frase y que siga significando algo |
| **Un dato = una fuente + una fecha** | Toda cifra (Sercotec, plazos, topes) va con `Fuente: bases oficiales Crece 2026 · verificado julio 2026`. La investigación KDD 2024 (Princeton/Georgia Tech/IIT Delhi) mide que agregar estadísticas, citas y fuentes es lo que más sube la visibilidad en respuestas generadas |
| **Frases cortas** | Una frase que no cabe en una respuesta de chat no se cita. Techo práctico: 25 palabras |
| **TL;DR arriba** | Cada página larga (`/sercotec-...`, `/guias/*`) abre con un recuadro de 2-3 frases que resume la respuesta completa |
| **Fecha visible** | `Actualizado: [fecha]` en texto plano, no solo en metadatos. Los modelos prefieren lo fechado |

### 5.2 Definición de entidad — que no quede ambiguo

Hoy es imposible que un modelo responda bien "qué es AIProcess", porque no existe en ninguna parte
una frase que lo diga. Hay que escribirla **una vez** y repetirla **idéntica** en todos lados:

```
AIProcess es una consultora chilena de optimización de procesos para pequeñas y medianas
empresas, dirigida por Patricio Ferrer, ingeniero civil informático de la Universidad Técnica
Federico Santa María. Trabaja midiendo cuánta plata pierde la operación de una empresa cada
mes y arreglando primero el proceso que más devuelve.
```

**Dónde va esa frase, sin variaciones:** `/patricio-ferrer` · `schema:description` de `Organization` ·
`llms.txt` · biografía de LinkedIn de la empresa · biografía de LinkedIn de Patricio ·
descripción del Perfil de Empresa en Google · pie de cualquier artículo.

> **La consistencia literal es la señal.** Tres redacciones distintas de lo mismo le enseñan al
> modelo que no está seguro de qué somos. Una sola redacción repetida seis veces es una entidad.

### 5.3 Señales de autoridad — solo lo verificable

| Señal | Estado | Acción |
|---|---|---|
| Formación (UTFSM, U. de Chile, PUC, UDD) | Real | Publicar en `/patricio-ferrer` **con el nombre completo de cada institución**, no siglas sueltas |
| 25 años en operaciones | Real | Redactar concreto: rubros y tipo de trabajo, sin nombrar clientes sin permiso |
| LinkedIn | Existe | Enlazar bidireccional: sitio → LinkedIn y LinkedIn → aiprocess.cl. Es la corroboración externa más barata que hay |
| Casos con cifras | **No existen** | **No se publica ninguno.** Una cifra inventada que un modelo cite es un pasivo permanente |
| Certificaciones | Sin respaldo confirmado | Ver `REGLA-CLAIMS-PUBLICOS` (LEGAL) antes de publicar cualquiera |

### 5.4 `llms.txt` — sí, pero con expectativa correcta

**Google confirmó en junio 2026 que no usa `llms.txt` y que no ayuda ni perjudica el ranking.**
`[VERIFICADO: actualización de la documentación de Google Search Central, junio 2026]`

**Recomendación: crearlo igual.** Cuesta 20 minutos, no tiene riesgo, y sí lo consultan otros
consumidores (asistentes que recuperan en vivo). Es, sobre todo, el lugar donde queda escrita
la definición de entidad en un formato que un modelo lee sin ambigüedad.

`https://aiprocess.cl/llms.txt`:

```
# AIProcess

> AIProcess es una consultora chilena de optimización de procesos para pequeñas y medianas
> empresas, dirigida por Patricio Ferrer, ingeniero civil informático de la Universidad Técnica
> Federico Santa María. Trabaja midiendo cuánta plata pierde la operación de una empresa cada
> mes y arreglando primero el proceso que más devuelve.

Atiende a dueños de PYME en Chile. El trabajo parte con una medición, no con una propuesta.
No vende software ni licencias, y no reemplaza el software contable que la empresa ya usa.
Actualizado: [[fecha de publicación]]

## Páginas
- [Inicio](https://aiprocess.cl/): el problema que resolvemos y las cuatro etapas del trabajo.
- [Test de madurez operacional](https://aiprocess.cl/test): 8 preguntas, 5 minutos, sin costo.
- [Patricio Ferrer](https://aiprocess.cl/patricio-ferrer): formación y trayectoria.
- [Preguntas frecuentes](https://aiprocess.cl/preguntas-frecuentes): costo, plazos, alcance.
- [Sercotec y mejora de procesos](https://aiprocess.cl/sercotec-mejorar-procesos): qué financia el Fondo Crece.

## Legal
- [Privacidad](https://aiprocess.cl/privacy) — tratamiento de datos personales, Ley 19.628.
- [Términos](https://aiprocess.cl/terms)
- [Descargo](https://aiprocess.cl/disclaimer)
```

### 5.5 `robots.txt` — **recomendación: permitir todos los rastreadores de IA**

**Razón, explícita:** un sitio sin autoridad de dominio no tiene tráfico que proteger — tiene
visibilidad que ganar. Bloquear a GPTBot o ClaudeBot solo tiene sentido para un medio que vende
publicidad o suscripciones y pierde plata cuando el modelo responde en su lugar. **Nosotros
ganamos exactamente cuando el modelo responde en nuestro lugar y nos nombra.** Bloquearlos sería
pagar el costo de la GEO sin cobrar el beneficio.

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /nuevo
Disallow: /proyectos/
Disallow: /actividad

# Rastreadores de IA — permitidos a propósito.
# El objetivo del sitio es ser citado por estos motores.
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: meta-externalagent
Allow: /
Disallow: /api/

Sitemap: https://aiprocess.cl/sitemap.xml
```

**La única excepción:** `Bytespider` (ByteDance) tiene historial documentado de ignorar `robots.txt`
y de consumir ancho de banda desproporcionado. Si aparece en los logs de Vercel, se bloquea por
WAF, no por `robots.txt` — a un bot que no obedece el archivo no se le pide por el archivo.

### 5.6 Errores que impiden ser citado

| Error | Por qué mata la cita | Cómo se evita aquí |
|---|---|---|
| **Texto que solo existe después de ejecutar JS** | Varios rastreadores de IA no ejecutan JavaScript: leen HTML y se van | Landing, FAQ, `/patricio-ferrer` y `/sercotec-...` como **Server Components**. Nada de contenido que aparezca solo al hacer clic o al hacer scroll |
| **Contenido dentro de imágenes** | Un cuadro comparativo hecho en Figma y exportado a PNG es invisible | La tabla "consultora típica vs acá" va como `<table>` real |
| **Acordeón de FAQ que no renderiza el texto** | Si la respuesta no está en el HTML, no existe | Acordeón con las respuestas presentes en el DOM y ocultas por CSS, no montadas condicionalmente |
| **Afirmación sin respaldo** | El modelo la descarta o, peor, la cita y queda expuesta | Toda cifra con fuente y fecha. Cero casos inventados |
| **Cargar el hero como imagen con el titular adentro** | El `H1` deja de existir | El titular es texto |
| **Cifras en el sitio que contradicen los documentos internos** | Incoherencia entre fuentes = el modelo no confía en ninguna | Antes de publicar, contrastar contra `MODELO-FASES-Y-PRECIOS.md` |

### 5.7 Cómo se mide la GEO (gratis)

Una vez al mes, preguntar literalmente en ChatGPT, Claude, Perplexity y Google AI Overviews:
`consultor para ordenar procesos pyme chile` · `quién es Patricio Ferrer AIProcess` ·
`cómo saber cuánta plata pierde mi empresa` · `sercotec sirve para consultoría de procesos`.
Anotar si aparecemos, con qué frase y con qué link. Es una planilla, no una herramienta.

---

## 6️⃣ SEO LOCAL

| Acción | Costo | Detalle |
|---|---|---|
| **Perfil de Empresa en Google** | Gratis | `[VERIFICADO: Google permite perfiles sin dirección física para negocios que atienden en terreno — "empresa de servicio en áreas"]`. Se configura **ocultando la dirección** y declarando el área de servicio (comunas/región donde Patricio efectivamente va). Verificación por video-llamada si no hay local |
| **Categoría del perfil** | Gratis | Primaria: *Consultor de negocios*. Secundarias: *Consultor* / *Servicio de consultoría empresarial*. La categoría pesa más que las palabras clave en la descripción |
| **Descripción del perfil** | Gratis | La frase de entidad de la sección 5.2, **literal** |
| **Publicaciones del perfil** | Gratis | Una publicación al mes reciclando una FAQ. Mantiene el perfil activo sin trabajo nuevo |
| **Reseñas** | Gratis | Pedirlas solo a clientes reales de Fase 1 en adelante. **Nunca comprar ni intercambiar.** Es la señal local con más peso y la más fácil de arruinar |
| **NAP consistente** | Gratis | Nombre, dirección y teléfono **idénticos** en el perfil de Google, LinkedIn, el pie del sitio y el JSON-LD. Una variación ("AI Process" vs "AIProcess") divide la entidad en dos |
| **Bing Places** | Gratis | Importa el perfil de Google en un paso. Importa porque Perplexity y Copilot se apoyan en el índice de Bing |
| **Señales de localidad en el texto** | Gratis | Nombrar comunas y regiones donde se trabaja **solo si es cierto**. Nada de "atendemos todo Chile" si no es así |
| **Menciones** | Gratis | Directorios de PYME chilenas, cámaras de comercio locales, gremios del rubro. Cantidad no importa: importa que el nombre y la URL estén exactos |
| **Sercotec / Agentes Operadores** | Gratis | Estar visible como proveedor de asistencia técnica en el ecosistema Sercotec es la mención más relevante del mercado objetivo. Verificar con LEGAL antes de figurar en cualquier registro |

---

## 7️⃣ CHECKLIST TÉCNICO PRE-PRODUCCIÓN

Para QA. Ningún ítem se marca sin ejecutar la verificación.

| # | Ítem | Cómo se verifica |
|---|---|---|
| 1 | `sitemap.xml` existe, lista solo páginas indexables | Abrir `aiprocess.cl/sitemap.xml`. Que **no** aparezcan `/dashboard`, `/nuevo`, `/proyectos/*`, `/actividad`, `/api/*` |
| 2 | `robots.txt` existe y coincide con la sección 5.5 | Abrir `aiprocess.cl/robots.txt`. Probar cada ruta en el probador de robots.txt de Search Console |
| 3 | Rutas internas fuera del índice | `curl -s https://aiprocess.cl/dashboard \| grep -i noindex` → debe encontrar la etiqueta |
| 4 | `canonical` autorreferente y absoluto en cada página | Ver código fuente: `<link rel="canonical" href="https://aiprocess.cl/...">`. Sin `www`, sin barra final, sin parámetros |
| 5 | `www` y HTTP redirigen 301 | `curl -sI http://www.aiprocess.cl` → `301` con `Location: https://aiprocess.cl/` |
| 6 | Un solo `<h1>` por página, jerarquía sin saltos | `curl -s <url> \| grep -o '<h[1-6]'` y revisar el orden. Cero `H3` sin `H2` previo |
| 7 | `title` ≤60 y `description` ≤155 caracteres, únicos por página | Contar. Ninguna descripción repetida entre páginas |
| 8 | Open Graph completo | Pegar la URL en el depurador de enlaces de LinkedIn (gratis). Debe mostrar título, descripción e imagen 1200×630 |
| 9 | JSON-LD sin errores | Prueba de resultados enriquecidos de Google + Validador de Schema Markup (schema.org). Cero errores; advertencias documentadas |
| 10 | FAQ del schema idéntica a la visible | Comparar texto a texto. Cualquier diferencia se corrige antes de publicar |
| 11 | Ningún `[[ ]]` quedó en producción | `curl -s <cada url> \| grep '\[\['` → sin resultados |
| 12 | Contenido presente sin JavaScript | `curl -s https://aiprocess.cl \| grep "perdiendo plata"`. Si no aparece el copy del hero y de las FAQ, el contenido depende de JS y no es citable |
| 13 | Favicon en todos los formatos | Abrir en Chrome, Safari y móvil. `/favicon.ico` + `apple-touch-icon` + manifest |
| 14 | Velocidad | PageSpeed Insights (gratis) en móvil. LCP <2,5 s · CLS <0,1 · INP <200 ms. **Móvil manda**: el dueño de PYME entra desde el celular |
| 15 | Peso de imágenes | Ninguna imagen >200 KB. Formato WebP o AVIF, con `width`/`height` declarados para no mover el layout |
| 16 | `alt` en todas las imágenes | Lighthouse (accesibilidad) o WAVE. `alt` descriptivo; `alt=""` solo en decorativas |
| 17 | Contraste y foco de teclado | Lighthouse ≥90 en accesibilidad. Recorrer todo el sitio solo con `Tab`: el foco tiene que verse siempre |
| 18 | `lang="es-CL"` en `<html>` | Ver código fuente. Hoy dice `es` |
| 19 | Formularios con `<label>` asociado | Inspeccionar el test y el formulario de contacto. Cada campo con `label for` o `aria-label` |
| 20 | HTTPS válido y sin contenido mixto | Consola del navegador sin advertencias de contenido mixto |
| 21 | Página 404 propia, con salida | Visitar `aiprocess.cl/no-existe`. Debe devolver 404 real (no 200) y ofrecer volver al inicio o al test |
| 22 | Ninguna palabra prohibida en el HTML | `curl -s <url> \| grep -iE "transformación digital\|sinergia\|escalabilidad\|innovación"` → sin resultados |
| 23 | Ningún precio publicado | `curl -s <url> \| grep -E "\\$[0-9]"` → sin resultados en páginas públicas |
| 24 | Propiedad dada de alta en las consolas | Google Search Console y Bing Webmaster Tools verificados, sitemap enviado en ambos, **el día del despliegue** |

---

## 📌 ORDEN DE EJECUCIÓN

```
Lanzamiento   → /  ·  /test  ·  /patricio-ferrer  ·  /preguntas-frecuentes
                robots.txt · sitemap.xml · JSON-LD · llms.txt
                Search Console + Bing Webmaster el mismo día

Semana 1-2    → Perfil de Empresa en Google (verificación por video)
                LinkedIn ↔ sitio, con la frase de entidad idéntica
                Bing Places importado

Semana 3-4    → /sercotec-mejorar-procesos (la keyword alcanzable nº1)

Mes 2+        → Planilla mensual de citas en ChatGPT/Claude/Perplexity
                Primeros datos reales de Search Console → recién ahí se ajustan keywords

Bloqueado     → /casos (hasta el primer testimonio real)
                /guias/* (hasta tener cadencia de escritura)
```

---

*Dueño del documento: agente SEO/GEO · Implementa: agente UI · Verifica: QA*
*Los volúmenes de búsqueda se completan con datos de Search Console a los 90 días.*
