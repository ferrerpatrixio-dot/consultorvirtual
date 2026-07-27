# 🔧 PLAN DE REESTRUCTURACIÓN — aiprocess.cl

**Fecha:** 2026-07-27
**Autor:** ARQUITECTO + UI/UX
**Fuente de verdad comercial:** [MODELO-FASES-Y-PRECIOS.md](MODELO-FASES-Y-PRECIOS.md)
**Estado:** propuesta — no se tocó código

> Auditoría hecha sobre el código, no sobre la documentación. Donde código y doc
> difieren, este plan describe el código.

---

## 1. QUÉ HAY HOY

### Rutas públicas (las únicas que ve un cliente)

| Ruta | Archivo | Qué comunica hoy |
|---|---|---|
| `/` | `src/app/page.tsx` (269 líneas, un solo componente cliente) | **Es el test, no una landing.** Pantalla 1: titular + 4 checkboxes de consentimiento + botón "Comenzar test". No hay propuesta de valor, ni problema, ni proceso, ni oferta, ni CTA a conversación. |
| `/terms`, `/privacy`, `/disclaimer` | páginas legales | Correcto, no se toca. |
| `/api/maturity/evaluate` | POST público | Evalúa y persiste el lead en Supabase (`leads`). Rate limit 10/h/IP, validación de email. |

### Los 4 pasos de `/`

1. **`inicio`** — H1 "La tecnología solo funciona sobre el orden" + "Evalúa la madurez de tus procesos en **2 minutos**". El 70% del espacio visible lo ocupan casillas de consentimiento. El botón está deshabilitado hasta marcar dos.
2. **`clasificadores`** — tamaño (4 tramos), rubro (4), **email marcado "(opcional)"**.
3. **`preguntas`** — 8 preguntas, una por pantalla, 5 opciones cada una.
4. **`resultado`** — cuadrante Orden x/5 · Datos x/5 + título + diagnóstico (2 líneas). CTAs: **"Compartir en LinkedIn"** y **"Hacer de nuevo"**. Fin del embudo.

### Rutas privadas `(app)/` — herramienta interna, no sitio público

`/dashboard`, `/nuevo`, `/proyectos/[id]`, `/actividad`. Detrás de `requireUser()`.
Sirven para que Patricio cargue un cliente y genere la **"Guía para la primera
reunión"** (`src/lib/deliverables.ts`, `guide.ts`, `curated-library.ts`).
**Es el back-office de la Fase 0 y ya existe.** No es parte de la reestructuración.

### Footer (`src/components/Footer.tsx`)

Tres columnas de compliance y seguridad: Ley 19.628, GDPR, **ISO 27001**, ARCO,
TLS, hash SHA-256, "datos en Supabase, hosting en Vercel". Es lo más pesado del
sitio y no menciona qué se vende, quién es Patricio, ni cómo contactarlo — salvo
un `mailto:` a una casilla Gmail personal.

### Documentos de diseño

- `docs/landing-spec.md` — describe **11 preguntas** y un clasificador "proceso" que la landing nunca pide. Desactualizado.
- `design-system/LANDING.md` / `MASTER.md` — paleta, tipografía, componentes. **Vigentes y suficientes. No se tocan.**

### El resumen incómodo

El sitio hoy es un test de madurez con un footer legal. **No vende nada, no pide
una reunión y no dice que exista una Fase 1.** No hay promesa falsa publicada
(bueno), pero tampoco hay embudo (malo): el visitante termina compartiendo en
LinkedIn y se va.

---

## 2. BRECHAS

| Qué dice el sitio | Qué debe decir | Regla o doc que lo exige | Severidad |
|---|---|---|---|
| Email "(opcional)" en el paso de clasificadores | Email y nombre **obligatorios** antes de ver el resultado. Sin lead, la Fase 0 no produce nada. | MODELO §Fase 0 = "captura + reunión" | **Alta** |
| El resultado termina en "Compartir en LinkedIn" / "Hacer de nuevo" | El resultado termina en **"Agendar la reunión gratis de 1 hora"** | MODELO §Fase 0: test **+ 1ª entrevista** | **Alta** |
| No existe ninguna mención de que haya un servicio pagado después | Debe decir que después de la reunión existe un trabajo pagado (BPMN + riesgos + plan), **sin precio** | MODELO §"Lo que NO es gratis" | **Alta** |
| Share de LinkedIn apunta a `app-procesos.vercel.app` (hardcodeado, `page.tsx:129`) | `aiprocess.cl` | Dominio en producción | **Alta** |
| Footer declara **"Cumplimiento ISO 27001"** | Quitar. No hay certificación; es una afirmación verificable y falsa. | Riesgo legal / SECURITY | **Alta** |
| `ESTRUCTURA-SITIO-WEB-FINAL.md` §3 y §6: "Diagnóstico gratis (1 semana)", "mapeamos procesos, medimos dinero perdido" | Fase 0 gratis = 15 min de test + 1 h de reunión. El mapeo es Fase 1 **pagada**. | MODELO §133 (corrección explícita) | **Alta** — no está en el código; **prohibido implementarlo** |
| `ESTRUCTURA-SITIO-WEB-FINAL.md` §3/§7/§8: "pagas 20-30% del ahorro", "si no recuperas, no pagas", casos con cifras en dólares | Precio fijo por tramo, cobrado por adelantado, **no publicado en el sitio** | MODELO §Precio por tramo · §Fase 1 producto empaquetado | **Alta** — no está en el código; **prohibido implementarlo** |
| Contacto = `mailto:ferrer.patricio@gmail.com` | Casilla del dominio + link a agenda | Credibilidad ante PYME | Media |
| "Evalúa la madurez en **2 minutos**" | 15 min es la promesa del modelo; el test real toma 3-5. Alinear a "5 minutos" y decir 15 solo si se agrega contenido. | MODELO §Fase 0 duración | Media |
| Consentimientos ocupan la primera pantalla completa | Mover al paso donde se pide el email, que es donde el dato se entrega | Conversión / UX | Media |
| Sin sección de quién es Patricio | Bloque breve de credibilidad con LinkedIn | POSICIONAMIENTO §Credibilidad subtle | Media |
| `docs/landing-spec.md` dice 11 preguntas + clasificador "proceso" | 8 preguntas + 2 clasificadores | Código real | Baja |
| Campo `proceso` se persiste siempre `null` (nunca se pide en el front) | Pedirlo o dejar de escribirlo | Higiene de datos | Baja |
| Sin metadatos/OG para el share que el propio sitio promueve | `title`/`description`/`og:image` | — | Baja |

---

## 3. EL TEST MMA-OD

### Qué es hoy, en el código

| | Realidad (`src/app/page.tsx` + `api/maturity/evaluate`) |
|---|---|
| Preguntas | **8** — `o1..o4` (orden) + `d1..d4` (datos), 5 opciones cada una |
| Clasificadores | **2** — tamaño (1-5 / 6-20 / 21-50 / 50+), rubro. `proceso` no se pide. |
| Duración real | 3-5 min (la copy dice 2; los docs dicen 5 y 15 — los tres están mal) |
| Motor | Eslabón más débil: `min(o1..o4)`, `min(d1..d4)` → cuadrante de 5 estados |
| Output al usuario | Dos números /5 + etiqueta + diagnóstico de 2 líneas |
| Persistencia | Tabla `leads` con respuestas, cuadrante, 4 consentimientos, hash de IP |
| Captura de lead | **Email opcional** · empresa nunca se pide (el campo existe en la API y en la tabla) |

**Los "8+8 / 15 min" de ESTRATEGIA y los "7 / 5 min" de METODOLOGIAS no
corresponden a nada implementado.** El código manda: son 8.

### Qué debe ser como Fase 0

Tres funciones, en este orden de importancia:

1. **Capturar el lead.** Hoy es la única que falla, y es la que paga la cuenta.
2. **Entregar el cuadrante.** Ya funciona bien.
3. **Enganchar hacia la reunión.** Hoy no existe.

### Veredicto: **sirve como está. No se rehace.**

El motor, las preguntas y el cuadrante son buenos: el lenguaje es operacional
(nada de BPMN ni jerga), la regla del eslabón más débil es defendible, y el
resultado ya le dice al dueño algo que reconoce. Rehacerlo sería gastar plata en
lo único que está bien.

Lo que falta son **tres cambios quirúrgicos en el mismo archivo**:

- Email + nombre de empresa **obligatorios** antes de calcular el resultado.
- El resultado abre con una frase que conecta el cuadrante con la reunión
  (ej. estado `CIMIENTOS` → "Antes de automatizar nada hay que ordenar. En una
  hora le mostramos por dónde parte eso en su empresa.").
- CTA primario = agendar. LinkedIn baja a secundario.

Los 15 minutos del modelo se cumplen contando la lectura del resultado y el
formulario. Si se quiere honestidad literal, la copy dice "5 minutos" y el
modelo se corrige — **no se agregan preguntas para llenar el reloj**.

---

## 4. ESTRUCTURA PROPUESTA

Una sola página, `/`, con el test embebido donde hoy está. **No se crean rutas
nuevas ni un sitio institucional aparte.** El precio no aparece en ningún lado.

| # | Sección | Objetivo | CTA |
|---|---|---|---|
| 1 | **Hero** — "La tecnología solo funciona sobre el orden" (se conserva) + subtítulo que nombra el destinatario: *"Vea en 5 minutos si su operación está lista para automatizar algo — y qué le falta si no."* | Que el dueño sepa en 3 segundos qué gana | **"Empezar el test →"** (scroll al test) |
| 2 | **El problema, en su idioma** — 3 tarjetas cortas: el que sabe hacerlo se fue de vacaciones · el mismo dato escrito tres veces · "¿cómo va mi pedido?" se responde llamando a alguien. Sin cifras inventadas. | Reconocimiento | — (baja al test) |
| 3 | **El test** (pasos actuales: clasificadores → 8 preguntas) con el email y la empresa **obligatorios** y los consentimientos junto al email | Capturar el lead | "Ver resultado →" |
| 4 | **Resultado** — cuadrante + diagnóstico + una línea que nombra el paso siguiente | Convertir | **"Agendar la reunión (1 hora, gratis)"** · secundario: compartir |
| 5 | **Qué pasa después** — tres bloques honestos: ① este test, gratis, ya lo hizo ② una hora de conversación, gratis, para acotar **un** proceso ③ si decide seguir, un trabajo acotado de 1-2 semanas que le deja un mapa de su proceso, los riesgos y un plan — **eso se cotiza en la reunión** | Fijar que hay algo pagado, sin espantar ni publicar cifras | "Agendar la reunión" |
| 6 | **Quién** — Patricio, foto chica, 25 años optimizando operaciones, títulos en una línea, link a LinkedIn | Confianza | LinkedIn |
| 7 | **Footer** — legal + contacto del dominio + compliance **sin ISO 27001** | Cumplir sin gritar | — |

**Recorrido:** hero → problema → test gratis → resultado → reunión gratis → (en
la reunión) Fase 1 pagada.
**El sitio vende la conversación.** El precio se entrega en la reunión, con la
plantilla de dos columnas que exige R-15.

Palabras prohibidas en todo el copy: transformación digital, sinergia,
escalabilidad, innovación. Se suman las de POSICIONAMIENTO: soluciones IA,
mejora continua, consultoría empresarial, y jerga (BPMN, RPA) fuera del hero.

---

## 5. PLAN DE EJECUCIÓN POR OLAS

### Ola 1 — lo que hace perder plata hoy · **1,5 días**

Cada lead que entra sin email es un lead perdido para siempre, y cada resultado
que termina en LinkedIn es una reunión que no se agendó.

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | Email + empresa obligatorios en `clasificadores` (bloquear "Siguiente"); consentimientos movidos a ese paso; CTA primario del resultado = agendar (link externo de agenda); LinkedIn a secundario; URL del share → `aiprocess.cl`; "2 minutos" → "5 minutos" |
| `src/app/api/maturity/evaluate/route.ts` | `email` y `empresa` pasan a requeridos (400 si faltan) |
| `src/components/Footer.tsx` | Eliminar la línea ISO 27001; cambiar el mailto a la casilla del dominio |

**Desplegable sin romper producción:** sí. Son cambios de un componente cliente
y una validación de entrada. La tabla `leads` no cambia (`email`/`empresa` ya
existen y son nullable). **Dependencia bloqueante: la URL de agenda y la casilla
de correo del dominio deben existir antes del deploy.**

### Ola 2 — el sitio dice qué se vende · **2 días**

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | Secciones 2 (problema), 5 (qué pasa después) y 6 (quién), antes y después del bloque de test. Extraer el bloque a componentes en `src/components/` si `page.tsx` pasa de ~400 líneas — no antes. |
| `src/app/layout.tsx` | `metadata`: title, description, OG |

**Desplegable sin romper producción:** sí, es contenido aditivo. El test no se toca.

### Ola 3 — higiene · **0,5 días**

| Archivo | Cambio |
|---|---|
| `docs/landing-spec.md` | Corregir a 8 preguntas + 2 clasificadores; quitar `proceso` |
| `ESTRUCTURA-SITIO-WEB-FINAL.md` | Marcar como **OBSOLETO** apuntando a MODELO-FASES-Y-PRECIOS.md. No reescribir: el modelo de "% del ahorro" ya no existe. |
| `docs/ESTRATEGIA_AGENCIA_CONSULTORA.md`, `docs/METODOLOGIAS-Y-FRAMEWORKS.md` | Unificar el conteo del test en **8 preguntas** |
| `src/app/page.tsx` / API | Decidir `proceso`: pedirlo en el test o dejar de escribir la columna |

**Total: 4 días.** No hay rediseño, no cambia el framework, no cambia el sistema
de diseño, no se agrega una sola dependencia.

---

## 6. RIESGOS

### Lo que se puede romper

- **`page.tsx` es un único componente cliente de 269 líneas con 6 `useState`.**
  Todo el embudo vive ahí. Un error de estado en Ola 1 rompe el test completo,
  que es el activo principal. Probar los 4 pasos en móvil y desktop antes de
  publicar.
- **Hacer `email` requerido en la API rompe cualquier cliente que hoy postee sin
  él.** Solo la landing consume ese endpoint, pero verificar que no haya scripts
  de prueba o formularios embebidos en circulación antes de mergear.
- **Se va a perder volumen de tests completados** al exigir email. Es
  deliberado: un test anónimo no vale nada para la Fase 0. Medir la caída, no
  revertir por reflejo.

### Lo que depende de datos existentes

- **Tabla `leads` en Supabase — no tocar el esquema.** Los cambios de Ola 1
  usan columnas que ya existen. Cualquier migración es una decisión aparte.
- **`consent_*` y `consent_fecha`** respaldan el cumplimiento de la Ley 19.628.
  Mover los checkboxes de pantalla es aceptable; **eliminar cualquiera de los
  dos obligatorios, o dejar de persistir la fecha, no lo es.**
- **`ip_hash` depende de `LEAD_IP_SALT`.** Cambiar esa variable invalida la
  deduplicación de leads históricos.
- **Rate limit vía Upstash** con degradación silenciosa si Redis no responde.
  Está bien; no rediseñarlo en estas olas.

### Lo que NO se debe tocar

- El motor MMA-OD (`evaluarMaturez`), las 8 preguntas y sus textos, y la regla
  del eslabón más débil. Cambiarlos invalida la comparación con los leads ya
  capturados y la `huella` versionada `MMA-OD-1.0`.
- `design-system/MASTER.md` y `LANDING.md`.
- Todo lo que está bajo `src/app/(app)/` — es el back-office de Patricio y ya
  produce la guía de la primera reunión. Sirve tal cual para la Fase 0.
- Las páginas legales `/terms`, `/privacy`, `/disclaimer`.
- El stack: Next.js, Supabase, Vercel, Upstash. Se queda.

### Escalación a Patricio antes de la Ola 1

1. ~~**URL de agenda**~~ — ✅ **RESUELTO (Patricio, 2026-07-27): agenda manual.**
   No se contrata Calendly ni herramienta de agendamiento: sin clientes todavía,
   sería costo y complejidad sin uso.

   **Reemplazo en la Ola 1 — el CTA no lleva a un calendario, captura y avisa:**
   ```
   Botón "Quiero la reunión gratis (1 hora)"
        ↓
   Pide SOLO teléfono + franja horaria preferida
   (el email y la empresa ya se capturaron antes del resultado)
        ↓
   Guarda en la tabla `leads` y notifica a Patricio
        ↓
   Patricio llama y coordina por WhatsApp
   ```
   **Ventaja:** cero costo, cero dependencia nueva, y hablas con el prospecto
   antes de la reunión — que con este segmento convierte mejor que un
   calendario frío.

   **Gatillo para automatizar** (va al backlog como idea congelada): más de
   **5 solicitudes de reunión por semana**. Antes de eso, el teléfono gana.
2. **Casilla del dominio** — `contacto@aiprocess.cl` o similar, para sacar el
   Gmail personal del footer.
3. **Confirmar la duración pública del test:** "5 minutos" (real) vs. los "15
   minutos" del modelo. Recomiendo 5 y corregir el modelo.

---

*Dueño: ARQUITECTO. Ejecución: DEV. VB antes de producción: QA.*
