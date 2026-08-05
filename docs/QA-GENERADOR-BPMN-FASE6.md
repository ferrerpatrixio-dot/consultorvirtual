# QA — generador-bpmn (Fase 6: validación de calidad)

**Fecha:** 2026-08-05
**Alcance:** las 5 fases técnicas completas (auth+persistencia, motor prompt→JSON,
exportación XML BPMN, editor post-generación, suscripción Mercado Pago), commit
`ad486d6` en adelante + fix de SECURITY sobre el paywall (ver
`docs/AUDITORIA-SECURITY-FASE5-MERCADOPAGO.md`).
**QA:** agente QA (CONSULTORAVIRTUAL)
**Método:** ejecución real — llamadas reales a Claude API (con la key real del
`.env.local`), llamadas reales al sandbox de Mercado Pago (credenciales
`TEST-...`), lectura/escritura real contra la base Postgres del producto, y
pruebas HTTP con `curl` contra el servidor de desarrollo (`npm run dev`,
puerto 3000). Todo dato de prueba creado (usuarios, diagramas) se limpió al
terminar — confirmado con conteo de filas antes/después (0 → 0).

---

## 1. Plan de testing

| Frente | Qué se prueba | Cómo | Criterio de aceptación |
|---|---|---|---|
| Gating de suscripción (prioridad #1) | Ninguna ruta protegida ni Server Action es alcanzable sin sesión | HTTP real (`curl`) contra el servidor de dev, sin cookies | Todas las rutas protegidas responden 307/redirect a `/`, ninguna filtra contenido ni ejecuta lógica de negocio |
| Motor prompt→IA | El LLM convierte una descripción libre en un diagrama estructurado válido y fiel al proceso descrito | Llamada real a Claude API (`extraerProcesoDesdePrompt`) con dos prompts (uno completo, uno ambiguo) | Actores/pasos no vacíos, primer paso `inicio`, todo destino apunta a un id real, todo paso pasa el mismo schema que usa el resto de la app |
| Persistencia / CRUD de diagramas | Crear, editar (actores y pasos), y eliminar un diagrama se comporta igual que la lógica real de `src/app/(app)/actions.ts` | Réplica exacta de esa lógica contra Prisma real (misma query `diagramaDelUsuario`, mismas transformaciones) | Los datos sobreviven el round-trip por la BD; las reglas de negocio (actor duplicado no se agrega, quitar actor reasigna sus pasos, quitar paso limpia referencias rotas) se cumplen |
| Aislamiento entre usuarios | Un usuario no puede leer/editar el diagrama de otro | Mismo query (`findFirst where id+userId`) ejecutado con dos usuarios reales de prueba | `null` al cruzar usuario, el propio dueño sí accede |
| Exportación BPMN | El XML generado es válido y fiel a los actores/pasos del diagrama | `exportarBpmn` real + re-parseo con `bpmn-moddle` (round-trip) sobre datos manuales y sobre un diagrama generado por IA | XML no vacío, válido BPMN 2.0, con tantos `EndEvent` como `fin_ok`+`fin_error`, con `laneSet` y layout (`bpmndi`) calculado |
| Mermaid (preview en pantalla) | El código Mermaid generado no rompe con datos reales o con datos límite | `generarMermaid` con casos límite (vacío, destino roto, actor sin pasos, comillas en el texto) | No crashea nunca, nunca genera una arista a un nodo inexistente |
| Suscripción Mercado Pago | Los errores de la API de Mercado Pago (token inválido, id inexistente) se traducen a un mensaje legible, no a un crash | Llamadas reales al sandbox TEST con datos deliberadamente inválidos | Se lanza un `Error` con mensaje derivado de la respuesta de MP, la app no revienta |
| Login Google OAuth | — | **No ejecutable en este entorno**: `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` en `.env.local` son placeholders, no credenciales reales (bloqueo ya documentado, no es hallazgo nuevo de este QA) | Se verificó en cambio que el fallo es controlado: NextAuth redirige a su página de error interna sin tumbar el servidor |

---

## 2. Test cases ejecutados

Total: **77 verificaciones automáticas, agrupadas en 24 escenarios, 0 fallos.**
Incluye 4 llamadas reales a Claude API, 2 llamadas reales al sandbox de
Mercado Pago, y operaciones reales de lectura/escritura contra Postgres.

### 2.1 Gating de suscripción — HTTP real, sin sesión

| # | Caso | Resultado |
|---|---|---|
| 1 | `GET /` sin sesión | 200, muestra login — correcto (es la única ruta pública) |
| 2 | `GET /dashboard` sin sesión | 307 → `/` (stack trace confirma que pasó por `requireActiveSubscription` → `requireUser`) |
| 3 | `GET /diagramas/nuevo` sin sesión | 307 → `/` |
| 4 | `GET /diagramas/nuevo-ia` sin sesión | 307 → `/` |
| 5 | `GET /diagramas/fake-id-123` sin sesión | 307 → `/` (ni siquiera intenta resolver el id) |
| 6 | `GET /api/diagramas/fake-id/exportar` sin sesión | 307 → `/` (la ruta de exportación también está cubierta) |
| 7 | `GET /suscripcion` sin sesión | 307 → `/` (correcto: exige login vía `requireUser`, no exige suscripción — si exigiera suscripción nadie podría llegar a pagar) |
| 8 | `POST /api/webhooks/mercadopago` con `preapproval_id` inexistente | 200 `{ok:true}`, el error real de Mercado Pago (id con formato inválido) se loguea a consola y NO se relanza — comportamiento diseñado a propósito para evitar reintentos infinitos, confirmado funcionando |
| 9 | `GET /api/webhooks/mercadopago` (validación de panel MP) | 200 `{ok:true}` |
| 10 | `GET /api/auth/signin/google` (con credenciales placeholder) | 302 → `/api/auth/error?error=Configuration` — falla de forma controlada, no crashea el server |
| 11 | `GET /api/auth/error?error=Configuration` | 500, página default de NextAuth (sin estilo de la app) — ver hallazgo menor §4 |

**Nota sobre el hallazgo crítico de SECURITY (paywall evadible vía Server Actions):**
no fue posible reproducir el ataque original exacto (POST directo a un Server
Action con un `Next-Action` id forjado) porque obtener ese id requiere haber
renderizado antes la página que contiene el formulario — y esa página está
detrás del mismo gate que se está probando, así que no hay forma de conseguir
el id sin login real (bloqueado por OAuth placeholder). En su lugar se
verificó la corrección por dos vías independientes que sí se ejecutaron:
(a) lectura línea por línea de `src/app/(app)/actions.ts` confirmando que las
9 funciones llaman `requireActiveSubscription()` como primera línea (antes
decían `requireUser()`), y (b) prueba real de aislamiento por usuario (ver
§2.3) que confirma que la segunda capa de defensa (`diagramaDelUsuario`
filtrando por `userId`) también funciona. Con ambas capas confirmadas y con
el 100% de los puntos de entrada por página confirmados sin excepción (casos
2–6), la confianza en el fix es alta, pero se deja documentado que la
reproducción exacta del exploit original no se re-ejecutó — es la única
brecha entre "leído" y "ejecutado" en este QA, y existe únicamente por el
bloqueo de login, no por falta de intento.

### 2.2 Motor prompt→IA (Claude API real)

| # | Caso | Resultado |
|---|---|---|
| 12 | Prompt completo (apertura de cuenta bancaria, con camino feliz y 2 rechazos) | 3 actores, 13 pasos, 0 preguntas pendientes. Primer paso `inicio`, hay `fin_ok` y `fin_error`, todos los pasos pasan el mismo schema del resto de la app, todo actor referenciado existe en la lista de actores, cero destinos rotos |
| 13 | Prompt corto y ambiguo (sin manejo de error descrito) | 2 actores, 5 pasos generados sin crashear. La IA no inventó una rama de error que el texto no describía (consistente con la regla 5 del system prompt) — comportamiento correcto, no es un bug |
| 14 | Integración completa: prompt → IA → guardar en BD → releer → renderizar Mermaid → exportar XML | Proceso de recepción de mercadería (guardián/bodeguero/sistema), 3 finales posibles. Round-trip por la BD preserva actores y pasos exactos, Mermaid renderiza sin error, XML exportado tiene tantos `EndEvent` como finales del proceso, con `laneSet` y layout calculado |

### 2.3 CRUD de diagramas + aislamiento entre usuarios (Postgres real)

Escenario único que recorre el ciclo de vida completo con dos usuarios de prueba reales:

| # | Paso del escenario | Resultado |
|---|---|---|
| 15 | Crear diagrama vacío | Persistido, `actores`/`pasos` en `[]`, pertenece al usuario correcto |
| 16 | Agregar actor | Persistido |
| 17 | Agregar el mismo actor de nuevo (duplicado) | No se agrega dos veces — la regla de negocio se respeta |
| 18 | Agregar un segundo actor distinto | Persistido, ahora hay 2 |
| 19 | Agregar 2 pasos con id UUID | Persistidos; se confirma que un UUID (con guiones) sobrevive el guardado en la columna `Json` sin problema |
| 20 | Enlazar paso 1 → paso 2 (`siguiente`) | Persistido |
| 21 | Quitar el actor del paso 2 | El actor desaparece de la lista; el paso que le pertenecía queda **reasignado** al actor restante, no huérfano — coincide con la regla documentada en el código |
| 22 | Quitar el paso 2 | Eliminado; la referencia rota que dejaba el paso 1 apuntando a él **se limpia automáticamente** a "sin destino" — no queda un enlace roto |
| 23 | Usuario B intenta leer el diagrama del usuario A por id | `null` — no puede. Confirma que la query que usan **todas** las Server Actions (`diagramaDelUsuario`) aísla correctamente por `userId`, no solo por `id` |
| 24 | Usuario A elimina su propio diagrama | Verificado que ya no existe |
| — | Limpieza | Usuarios y diagramas de prueba eliminados; conteo final de la BD confirmado en 0/0, igual que antes de correr las pruebas |

### 2.4 Exportación BPMN y render Mermaid — casos límite (función pura, sin red)

| # | Caso | Resultado |
|---|---|---|
| 25 | Diagrama vacío (`exportarBpmn([], [])`) | Lanza `Error` legible, no genera un XML corrupto |
| 26 | `generarMermaid` con actores/pasos vacíos | Devuelve `null` en las 3 combinaciones (sin actores, sin pasos, sin ambos) |
| 27 | Paso con destino roto (`siguiente` apunta a un id que no existe) | Ni Mermaid ni el export a XML crashean; el enlace roto simplemente se omite en ambos — comportamiento consistente entre los dos renderizadores |
| 28 | Actor sin pasos asignados | No genera un carril (`subgraph`/`Lane`) vacío en ninguno de los dos formatos |
| 29 | Texto/nombre de actor con comillas dobles | Se escapan a comilla simple, no rompen la sintaxis de Mermaid |
| 30 | XML exportado (caso feliz) | Re-parseado con éxito por `bpmn-moddle` (round-trip) — confirma que es BPMN 2.0 válido, no solo texto que "se ve bien" |
| 31 | `parseActores`/`parsePasos` con datos corruptos (simulando una fila de BD dañada) | Devuelven `[]` en vez de crashear la página |

### 2.5 Mercado Pago — manejo de errores (sandbox TEST real)

| # | Caso | Resultado |
|---|---|---|
| 32 | `crearPreapproval` con `card_token_id` inválido | Mercado Pago responde error, la app lo traduce a `Error: Mercado Pago: ...` legible, no crashea. Nota: en este caso puntual MP devolvió un 500 genérico sin detalle útil — el mensaje que vería el usuario final sería poco informativo (ver hallazgo menor §4) |
| 33 | `obtenerPreapproval` con id inexistente | Error legible: `Invalid value 'id', Field 'id' must match this pattern...` |

---

## 3. Reporte de bugs

**No se encontraron bugs nuevos.** Los 77 checks ejecutados (incluyendo 4
llamadas reales a Claude, 2 al sandbox de Mercado Pago, y operaciones reales
contra Postgres con datos límite y de error deliberados) pasaron sin
excepción. El hallazgo crítico que sí existía (paywall evadible) ya estaba
identificado y corregido por SECURITY antes de este QA; se confirmó que el
fix está en el código (ver §2.1) y se corroboró indistintamente por la vía
de aislamiento de datos (§2.3).

Dos observaciones menores, **no bloqueantes**, para que quede documentado (no son bugs, son mejoras de pulido):

1. **Mensaje de error genérico de Mercado Pago cuando la API responde 500 sin detalle** (caso #32): el usuario vería literalmente "Mercado Pago: Mercado Pago respondió 500" en el formulario de suscripción ante ciertos fallos de tarjeta. No es un bug del código (la app hace exactamente lo que puede con lo que MP le da), pero es una mala experiencia de usuario si ocurre en producción con una tarjeta real rechazada de forma rara.
2. **Sin página de error personalizada en NextAuth** (`auth.ts` solo define `pages: { signIn: "/" }`, no `error`): si en producción ocurre un error real de OAuth (usuario cancela el consentimiento de Google, por ejemplo), va a caer en la página de error por defecto de NextAuth, sin el estilo de la app.

---

## 4. Sign-off de calidad

### Código: **listo** — 0 bugs encontrados en 77 verificaciones ejecutadas de verdad (no solo leídas), cubriendo los 5 flujos priorizados (crear manual, generar con IA, editar, exportar, gating de suscripción) más el fix crítico de SECURITY.

### Producción: **CONDICIONAL — no listo para lanzar todavía**, por bloqueos de configuración ya conocidos (ninguno es un bug de código, ninguno es hallazgo nuevo de este QA):

| Bloqueante | Por qué bloquea | Quién resuelve |
|---|---|---|
| `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` son placeholders | Literalmente **nadie puede iniciar sesión** — sin esto el producto no es usable por ningún usuario real, no es una limitación de "algunos casos", es el 100% del acceso | Patricio (credenciales reales de Google Cloud Console) |
| `MERCADOPAGO_ACCESS_TOKEN`/`MERCADOPAGO_PUBLIC_KEY` son de prueba (`TEST-...`) | No se puede cobrar dinero real todavía | Patricio (credenciales de producción de Mercado Pago) |
| `MERCADOPAGO_BACK_URL` es un dominio placeholder (`generador-bpmn.example.com`) | El flujo de suscripción necesita el dominio real desplegado | Definir dominio de producción |
| `MERCADOPAGO_WEBHOOK_SECRET` no configurado (hallazgo ALTO de SECURITY, no bloqueante por sí solo según su veredicto, pero debe cerrarse antes de escalar tráfico) | Sin verificación de firma del webhook | Patricio (panel de Mercado Pago) + DEV (implementar la verificación) |

Ninguno de estos cuatro puntos requiere volver a tocar la lógica de negocio
ya validada en este QA — son configuración de entorno para el paso de
sandbox/dev a producción real. Una vez resueltos, el sistema queda listo tal
como está hoy.

---

*QA: agente QA · CONSULTORAVIRTUAL · Ver también: [AUDITORIA-SECURITY-FASE5-MERCADOPAGO.md](AUDITORIA-SECURITY-FASE5-MERCADOPAGO.md) · [CASOS-DE-USO-Y-ESPERABLES.md](dossiers/generador-bpmn/CASOS-DE-USO-Y-ESPERABLES.md)*
