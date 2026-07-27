# 🔍 INFORME QA — WEB NUEVA aiprocess.cl

**Fecha:** 2026-07-27 · **Rama:** `web-nueva` (commit `68e605e`) · **Agente:** QA
**Alcance:** páginas públicas `/` `/test` `/patricio-ferrer` `/preguntas-frecuentes`
`/sercotec-mejorar-procesos` `/privacy` `/terms` `/disclaimer` `/404`
**Fuera de alcance:** grupo `(app)` y `api/` (salvo el hallazgo A-4, que es de indexación).

**Cómo se midió:** `npm run build` + `next start -p 3002` y `curl` sobre el HTML servido;
comparación programática del JSON-LD contra el texto visible; render en iframe a 375 px para
las mediciones de móvil. Todo número de este informe salió de una de esas tres mediciones.
**No se midió** (y por eso no se puntúa): Core Web Vitals reales, Lighthouse, contraste de
color, recorrido completo con teclado, redirección `www`→apex y HTTPS (dependen del despliegue).

**Veredicto: NO APTO PARA PRODUCCIÓN.** Tres bloqueantes (C-1, C-2, C-3) y siete altos.

---

## 🔴 CRÍTICOS — bloquean el despliegue

### C-1 · Las tres páginas legales se canonicalizan a la home

`src/app/privacy/page.tsx` · `src/app/terms/page.tsx` · `src/app/disclaimer/page.tsx`
(ninguna exporta `metadata`) · causa raíz en `src/app/layout.tsx:20`

Ninguna de las tres declara metadata propia, así que heredan del layout raíz
`alternates: { canonical: '/' }`, el `title` y la `description` de la landing. Verificado en el
HTML servido:

```
/privacy    <title>Recupera la plata que tu operación pierde | AIProcess</title>
            <link rel="canonical" href="https://aiprocess.cl"/>
/terms      idéntico
/disclaimer idéntico
```

**Qué rompe:** un canonical que apunta a otra URL es una instrucción explícita a Google de
*no indexar esta página y consolidarla en la home*. Las tres desaparecen del índice. Además
contradice al `sitemap.xml`, que sí las lista (`src/app/sitemap.ts:18-20`): el sitemap dice
"indexa esto" y la página dice "esto es la home". Se pierde la señal de entidad real que el
plan §2 les asigna.

**Cómo se arregla:** exportar `metadata` en cada una, con su propio `title`, `description` y
`alternates: { canonical: '/privacy' }` (resp. `/terms`, `/disclaimer`).

### C-2 · Marcadores `[[ ]]` visibles en la página de la keyword nº1

`src/app/sercotec-mejorar-procesos/page.tsx:129, 134, 140`

Renderizado en el HTML servido, dentro de un recuadro destacado:

```html
<strong>Monto máximo del llamado vigente:</strong>
<span class="font-mono">[[monto — completar con la cifra de las bases oficiales]]</span>
<strong>Porcentaje de cofinanciamiento:</strong>
<span class="font-mono">[[porcentaje — completar con la cifra de las bases oficiales]]</span>
<strong>Fuente y fecha:</strong>
<span class="font-mono">[[bases oficiales de la convocatoria · fecha de verificación]]</span>
```

Incumple el ítem 11 del checklist del plan (`SEO-GEO-WEB-NUEVA.md §7`). Es además la página
señalada como la oportunidad comercial nº1: el visitante que llega buscando el monto del Fondo
Crece ve un marcador de plantilla.

**Cómo se arregla:** completar los tres campos con la cifra, la fuente y la fecha de las bases
oficiales vigentes, **o** borrar el recuadro completo. El resto de la página ya está escrita
para funcionar sin cifras (el propio párrafo siguiente lo explica), así que borrarlo es una
salida válida y no deja hueco.

### C-3 · `llms.txt` publicado con un marcador sin completar

`public/llms.txt:10` → `Actualizado: [[fecha de publicación]]`

Se sirve tal cual en `https://aiprocess.cl/llms.txt`. El archivo existe justamente para que un
modelo lea la definición de entidad sin ambigüedad; entregarle un marcador de plantilla en el
campo de fecha es la señal contraria.

**Cómo se arregla:** reemplazar por la fecha real de publicación.

---

## 🟠 ALTOS

### A-1 · Cifra inventada publicada en `/privacy`

`src/app/privacy/page.tsx:93`

> `Sí compartimos datos agregados anónimos (ej: "40% de empresas chilenas están en CIMIENTOS")`

No existe la muestra que sostenga ese 40 %: no hay clientes y el test no se ha publicado. Va
como ejemplo, pero está entre comillas, con porcentaje y sujeto, en una página indexable — es
exactamente la forma que un motor generativo extrae y cita. Es el mismo tipo de hallazgo que
motivó `REGLA-CLAIMS-PUBLICOS` (checklist: *"¿Hay alguna cifra de resultados? → ¿se puede
probar con un caso documentado? Si no, se borra."*).

**Cómo se arregla:** quitar el número. `(ej: la distribución de niveles de madurez por sector,
sin identificar a ninguna empresa)`.

### A-2 · Afirmación de cumplimiento normativo en primera persona

`src/app/privacy/page.tsx:99` → *"Esta política cumple la Ley 19.628 de Protección de Datos
Personales de Chile."*
`src/components/Footer.tsx:23` → *"Tus datos se tratan conforme a la Ley 19.628"*

Es la misma construcción gramatical que las dos afirmaciones ya retiradas del sitio
("Cumplimiento ISO 27001", "Cumplimiento GDPR"): declarar cumplimiento normativo en primera
persona sin que LEGAL haya verificado el respaldo. La regla vigente no distingue entre normas:
*"Ninguna afirmación de (…) cumplimiento normativo se publica sin que LEGAL verifique el
documento que la respalda."*

**Cómo se arregla:** VB explícito de LEGAL, o reformular sin afirmar el resultado — *"Esta
política se redactó tomando como referencia la Ley 19.628"* / *"Tus datos se tratan buscando
respetar los derechos que reconoce la Ley 19.628"*.

### A-3 · Claims de seguridad, uno sin evidencia y uno sin atribuir

`src/components/Footer.tsx:43-47` y `src/app/privacy/page.tsx:79-81`

| Claim | Estado verificado |
|---|---|
| `IP hasheada con SHA-256 (sin almacenar plano)` | ✅ Real — `src/app/api/maturity/evaluate/route.ts:41` |
| `Conexión HTTPS/TLS encriptada` | ✅ Real si el despliegue es Vercel |
| `Datos encriptados en reposo (Supabase)` | ⚠️ Es capacidad **del proveedor**. En el footer va entre paréntesis, pero en `privacy:80` aparece como *"Encriptación de datos en reposo"* en primera persona, sin atribuir |
| `Auditoría de acceso sin PII` | ❌ Sin evidencia de un control operando. No se encontró un registro de auditoría de acceso al sistema (lo que existe es `ip_hash` en los registros del test, que es otra cosa) |

**Cómo se arregla:** atribuir la encriptación en reposo al proveedor también en `/privacy`, y
borrar "Auditoría de acceso sin PII" hasta que exista el control y alguien pueda mostrarlo.

### A-4 · La URL de LinkedIn del JSON-LD puede no estar verificada

`src/lib/site.ts:44-45`

```ts
/** Perfil de LinkedIn de Patricio. Falta la URL real. */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/patricioferrer/';
```

El comentario dice que falta la URL real y el código publica una. Ese valor se emite en
`sameAs` del nodo `Person` del JSON-LD (`layout.tsx:62`, en **todas** las páginas) y como enlace
en `/patricio-ferrer`. Un `sameAs` apuntando a otra persona con nombre parecido no es un enlace
roto: le enseña al motor que la entidad "Patricio Ferrer de AIProcess" es otra persona, y eso
es difícil de revertir después.

**Cómo se arregla:** abrir la URL, confirmar que es el perfil correcto y borrar el comentario.
Si no es el correcto, corregirla antes del despliegue.

### A-5 · El grupo `(app)` no tiene `robots: { index: false }`

`src/app/(app)/layout.tsx` (no exporta `metadata`)

El plan §2 exige las dos capas: `Disallow` en robots.txt **y** `robots: { index: false }` en el
layout del grupo. Solo está la primera. Un `Disallow` impide rastrear, no impide indexar una URL
que Google descubra por un enlace externo.

**Riesgo real hoy: bajo** — `/dashboard` responde `307` y redirige a `/` (verificado), así que
no hay contenido que indexar. Pero la protección depende de `requireUser()`, no de una
directiva; si mañana una ruta del grupo deja de exigir sesión, queda expuesta sin red.

**Cómo se arregla:** `export const metadata = { robots: { index: false, follow: false } }` en
el layout del grupo. **No se aplicó**: el archivo está fuera del alcance de esta auditoría.

### A-6 · Áreas táctiles bajo el mínimo en la navegación

Medido a 375 px sobre el HTML servido. Entre 16 y 23 elementos interactivos por página quedan
bajo 44×44 px. Los que importan, porque son la navegación de todo el sitio:

| Elemento | Archivo | Alto medido |
|---|---|---|
| Enlaces del nav (`Quién está detrás`, `Preguntas frecuentes`, `Sercotec`) | `src/components/SiteHeader.tsx:25-31` | **17 px** |
| Logo `AIProcess` del header | `src/components/SiteHeader.tsx:16-21` | 28 px |
| CTA `Hacer el test` del header | `src/components/SiteHeader.tsx:34-39` | 36 px |
| Enlaces del footer | `src/components/Footer.tsx:11-35` | 17 px |

Los CTA del cuerpo sí cumplen (56 px, `py-4`). El plan dice explícitamente *"Móvil manda: el
dueño de PYME entra desde el celular"*, y el header es lo primero que toca.

**Cómo se arregla:** padding vertical en los `<li>`/`<a>` del nav y del footer hasta llegar a
44 px de alto de área táctil (`py-3` en los enlaces, `py-2.5` en el CTA del header). No exige
cambiar el tamaño de letra.

### A-7 · El JSON-LD de `Organization` no tiene `logo`, `image` ni `sameAs`

`src/app/layout.tsx:45-55`

El nodo `Organization`/`ProfessionalService` sale sin esas tres propiedades, y las tres tienen
dato real disponible: `public/marca/logo-aiprocess.png`, `public/marca/isotipo.png`, la imagen
OG generada en `/opengraph-image`, y `LINKEDIN_URL`. El plan §4 las pide.

**Por qué importa:** sin `logo` Google no puede armar el panel de conocimiento de la marca, y
sin `sameAs` no hay corroboración externa de la entidad — que el propio plan §5.3 llama *"la
corroboración externa más barata que hay"*. El nodo `Person` sí las lleva; el de la empresa no.

**Cómo se arregla:** agregar `logo`, `image` y `sameAs` con las URLs absolutas de esos assets.
La omisión estaba bien justificada cuando los archivos no existían; ya existen.

---

## 🟡 MEDIOS

### M-1 · ~195 KB de JavaScript comprimido en páginas que son solo texto

Medido con `next start` sumando todos los `<script src="/_next/static/…">` de cada página,
con `Accept-Encoding: gzip`:

| Página | HTML (gzip) | JS (gzip) | JS sin comprimir |
|---|---|---|---|
| `/` | 17,2 KB | **197 KB** | 656 KB |
| `/test` | 7,3 KB | **200 KB** | 665 KB |
| `/privacy` | 7,5 KB | **193 KB** | 642 KB |

`/privacy` es texto estático sin un solo elemento interactivo y arrastra 193 KB de JS. Es el
piso del runtime de React + el router de Next, no código del proyecto: las páginas ya son
Server Components (solo `TestClient.tsx`, `ProcessMap.tsx` y los `error.tsx` llevan
`'use client'`). **No se midió** el impacto en LCP/INP reales; se reporta el peso, no la
conclusión.

**Cómo se arregla:** no hay arreglo barato dentro de Next App Router. Lo accionable es medirlo
en PageSpeed Insights móvil antes de aceptar el despliegue y no agregar más `'use client'`.

### M-2 · Texto bajo 16 px en móvil

A 375 px, entre 35 y 49 elementos de texto por página bajo 16 px: **14 px** (nav del header,
notas al pie de sección, el aviso de fuente y fecha de `/sercotec`) y **12 px** (todo el bloque
de "Protección de datos" y "Seguridad" del footer, `src/components/Footer.tsx:22,42`). En
`/privacy`, `/terms` y `/disclaimer` solo hay 3–10 elementos a 14 px.

12 px en el bloque que explica los derechos del titular de los datos es el peor lugar para
poner el texto más chico del sitio.

**Cómo se arregla:** subir el footer de `text-xs` a `text-sm` y el nav a 16 px. El resto del
texto a 14 px es secundario y admite discusión.

### M-3 · `lastmod` del sitemap cambia en cada despliegue

`src/app/sitemap.ts:24` → `const lastModified = new Date()`

Se evalúa en build, así que las 8 URLs quedan con la fecha del despliegue aunque no se haya
tocado su contenido. Declarar como modificado lo que no cambió hace que el buscador deje de
confiar en el campo para todo el dominio.

**Cómo se arregla:** una fecha fija por página en la tabla `PAGINAS`, actualizada a mano cuando
se edita esa página.

### M-4 · La foto de Patricio se sirve a 800 px para mostrarse a 144 px

`src/app/patricio-ferrer/page.tsx:58-65` — `width={800} height={800}`, sin prop `sizes`,
mostrada a `h-28 w-28` (112 px) en móvil y `sm:h-36 sm:w-36` (144 px) en desktop. Sin `sizes`,
next/image genera el srcset para el ancho declarado, no para el de presentación. Además lleva
`priority`, así que compite con el LCP.

**Cómo se arregla:** `sizes="144px"` (o bajar `width`/`height` a 288 para 2×).

### M-5 · Las páginas legales quedan sin salida hacia el sitio

`src/app/privacy/page.tsx` · `terms` · `disclaimer` — ninguna monta `SiteHeader` ni `Footer`.
El único enlace de salida es `privacy/page.tsx:104-106`, que dice **"← Volver al test"** pero
apunta a `/`. Texto de ancla que no describe el destino, y en una página a la que se llega
desde el flujo del test.

**Cómo se arregla:** montar `SiteHeader` y `Footer` como el resto del sitio, y corregir el
texto del enlace.

### M-6 · Etiquetas huérfanas en el test

`src/app/test/TestClient.tsx:185, 189`

```tsx
<label className="mb-3 block text-sm font-semibold">¿Cuántas personas trabajan?</label>
<div className="space-y-2">{CLASIFICADORES.tamano.map(opt => <button …>)}</div>
```

Es un `<label>` sin `htmlFor` sobre un grupo de `<button>`, no sobre un control de formulario:
no hay asociación accesible entre la pregunta y las opciones. Incumple el ítem 19 del checklist.
El campo `email` (línea 193) sí está bien hecho.

**Cómo se arregla:** `<fieldset>` + `<legend>`, o `role="radiogroup"` con `aria-labelledby`
apuntando al texto de la pregunta.

### M-7 · `alt` genérico en la foto de perfil

`src/app/patricio-ferrer/page.tsx:60` → `alt="Patricio Ferrer"`. Las otras tres fotos del sitio
tienen `alt` descriptivos y buenos (ver "Lo que pasó bien"); esta repite el `H1` que está al
lado. **Cómo se arregla:** describir la imagen, no nombrarla.

---

## 🔵 BAJOS

| # | Dónde | Qué |
|---|---|---|
| B-1 | `src/app/robots.ts:37` | Emite `Host: https://aiprocess.cl`. La directiva `Host` espera un nombre de host sin esquema y ningún buscador vigente la interpreta. Ruido inofensivo; quitarla. |
| B-2 | `src/app/patricio-ferrer/page.tsx:170-174` | Rama muerta que imprime `[[URL del perfil de LinkedIn]]` si `LINKEDIN_URL` fuera vacío. Hoy nunca se ejecuta, pero es un `[[ ]]` a una constante de distancia. |
| B-3 | `/404` | Jerarquía `h1 → h3 h3 h3 h3`: el `h1` de la página va seguido directo por los `h3` del footer, sin `h2`. Afecta a cualquier página sin `h2` propio. |
| B-4 | `src/lib/curated-library.ts:101`, `src/lib/guide.ts:92` | Contienen **"quick wins"**, palabra prohibida. Hoy solo se usan en el back-office `(app)`, así que **no llega al texto público** (verificado sobre el HTML servido), pero está a un import de distancia de la web. |
| B-5 | `public/fotos/analista-datos.webp` (51 KB) | No lo referencia ninguna página pública. O se usa o se borra. |
| B-6 | `/404` | Emite dos `<meta name="robots">` (`noindex` y `noindex, follow`): el automático de Next más el de `not-found.tsx:11`. Coherentes entre sí, redundantes. |

---

## ✅ LO QUE PASÓ BIEN

Verificado, no asumido:

- **FAQPage idéntico al texto visible.** Comparación programática del `acceptedAnswer` contra el
  texto renderizado: **17/17** en `/preguntas-frecuentes` y **4/4** en `/sercotec-mejorar-procesos`.
  Cero diferencias. Es el hallazgo que más se buscaba y no apareció.
- **JSON-LD válido.** Los 6 bloques (4 páginas) parsean sin error. Tipos correctos:
  `Organization`+`ProfessionalService`, `Person`, `Service`, `WebSite`, `FAQPage`.
- **Jerarquía de encabezados limpia.** Un solo `H1` en las 8 páginas públicas y cero saltos de
  nivel dentro del contenido (medido sobre el HTML servido).
- **Títulos y descripciones dentro de límite y únicos** en las 5 páginas de contenido:
  53/56/57/49/52 caracteres de `title`; 139/147/147/145/151 de `description`.
- **Sin desborde horizontal a 375 px** en ninguna de las 9 páginas (`scrollWidth` = 375 exacto).
  La tabla comparativa de la landing está correctamente encerrada en un `overflow-x-auto`.
- **Cero enlaces internos rotos.** Las 13 URLs internas responden 200. Cero referencias a
  `app-procesos.vercel.app` en todo el código y los assets.
- **Cero palabras prohibidas en el texto visible** de las páginas públicas.
- **Cero casos, testimonios, cifras de resultado o certificaciones.** `/patricio-ferrer` incluso
  explicita por qué no los hay y distingue diplomado de magíster.
- **Imágenes:** las 4 en WebP, todas bajo 200 KB (126 / 85 / 65 / 51 KB), servidas por
  `next/image` con `width`/`height`, `blur` placeholder, `priority` en el hero y `loading="lazy"`
  bajo el pliegue. `alt` descriptivo y específico en las dos fotos de la landing.
- **Contenido citable sin JavaScript.** Todo el copy de las 5 páginas de contenido está en el
  HTML inicial; solo `/test` monta un componente cliente. Es la condición del plan §5.6.
- **robots.txt** permite los 11 rastreadores de IA a propósito, bloquea `/api` y el grupo `(app)`,
  y declara el sitemap. **sitemap.xml** lista exactamente las 8 URLs públicas y ninguna interna.
- **404 real** (código 404, no 200), con `noindex` y salida al inicio y al test.
- `lang="es-CL"`, `og:locale=es_CL`, Open Graph completo con imagen 1200×630 generada por código
  en todas las páginas. Favicon (`icon.png`) y `apple-icon.png` presentes.

---

## 📊 PUNTAJE

Solo donde hay medición que lo sostenga. Sin nota global: promediar categorías que se midieron
con métodos distintos daría un número que no significa nada.

| Categoría | Nota | Qué la sostiene |
|---|---|---|
| Datos estructurados | **9/10** | 21/21 FAQ idénticas, 6/6 bloques válidos. Descuenta A-7 (`logo`/`sameAs` ausentes con dato disponible). |
| Veracidad | **5/10** | 4 hallazgos altos (A-1 a A-4) sobre texto público, en un sitio que ya retiró dos claims falsos. Sube mucho al arreglarlos: la estructura de contenido está bien construida. |
| SEO técnico | **6/10** | Base correcta (robots, sitemap, OG, encabezados, títulos), rota por C-1: 3 de 8 páginas se autoexcluyen del índice. |
| Móvil | **6/10** | Cero desborde en 9/9 páginas, pero toda la navegación bajo 44 px y el footer a 12 px. |
| Contenido / GEO | **7/10** | Formato citable y frase de entidad consistente; C-2 y C-3 dejan marcadores de plantilla justo en las dos piezas diseñadas para ser leídas por modelos. |
| Rendimiento | **sin nota** | Se midió peso (M-1), no Core Web Vitals. Sin PageSpeed Insights móvil no hay base para una nota. |

---

## 🎯 ORDEN DE ARREGLO

```
Bloqueante   C-1  metadata propia en las 3 legales          → DEV
             C-2  completar o borrar el recuadro Sercotec   → SEO + Patricio (dato)
             C-3  fecha real en llms.txt                    → DEV

Antes de     A-1  borrar el 40 % de /privacy                → LEGAL
producción   A-2  reformular los claims de Ley 19.628       → LEGAL (VB obligatorio)
             A-3  atribuir/borrar claims de seguridad       → LEGAL + DEV
             A-4  confirmar la URL de LinkedIn              → Patricio (30 segundos)
             A-5  robots:index:false en (app)               → DEV
             A-6  áreas táctiles del header y footer        → UI
             A-7  logo/image/sameAs en Organization         → DEV

Post-deploy  M-1 a M-7, B-1 a B-6                           → backlog
             PageSpeed Insights móvil + Rich Results Test   → QA, día del deploy
```

**Escalación a Patricio:** A-2 y A-3 son decisión de LEGAL sobre texto ya escrito, y A-4 solo
él puede confirmarlo. C-2 necesita el dato de las bases oficiales o la decisión de publicar la
página sin cifras.

---

*Auditoría: agente QA · Corre de nuevo con `docs/qa/SUITE-PRUEBAS-SITIO.md`*
