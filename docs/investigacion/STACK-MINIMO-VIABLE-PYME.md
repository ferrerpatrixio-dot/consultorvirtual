# STACK MÍNIMO VIABLE — CONSULTORAVIRTUAL

**Agente:** ARQUITECTO
**Fecha investigación:** 2026-07-27
**Mandato:** "Mínimo costo que garantice operación razonablemente robusta, estable y escalable para una PYME en producción. Nada de voladores de luces."

**Hallazgo que cambia el diseño:** el plan Hobby (gratis) de Vercel es **para uso personal, no comercial**. CONSULTORAVIRTUAL es una empresa que factura → operar en Hobby es violación de ToS y riesgo de suspensión sin aviso. Por eso el Nivel 0 **no es $0**: es $20/mes.

---

## 1. STACK NIVEL 0 (0–5 clientes)

| Componente | Producto | Plan | US$/mes |
|---|---|---|---|
| Hosting app web | Vercel | Pro (1 seat) | **20** [VERIFICADO: vercel.com/pricing, 2026-07-27] |
| Base de datos + Auth | Supabase | Free | **0** [VERIFICADO: supabase.com/pricing, 2026-07-27] |
| Autenticación | Supabase Auth (incluido) | Free | **0** |
| Email transaccional | Resend | Free (3.000/mes, 100/día, 1 dominio) | **0** [VERIFICADO: resend.com/pricing, 2026-07-27] |
| Cache / rate limit | **NINGUNO** — rate limit en memoria del serverless + límite por columna en Postgres | — | **0** |
| Automatización cliente | n8n self-hosted **solo si un cliente lo paga**; si no, nada | — | **0** |
| Repositorio + CI | GitHub Free (repos privados, Actions 2.000 min/mes) | Free | **0** |
| Backup DB | GitHub Actions cron → `pg_dump` → artifact privado | Free | **0** |
| **TOTAL** | | | **US$ 20/mes** |

### Qué límite se rompe PRIMERO (en orden real)

| # | Límite | Umbral duro | Señal observable | Qué hacer |
|---|---|---|---|---|
| 1 | **Resend: 100 emails/día** | 100/día | email de aviso Resend / bounce | Pasar a Brevo Free (300/día, $0) o Resend Pro $20 |
| 2 | **Supabase Free: 500 MB DB** | 500 MB | Dashboard → Database size | Supabase Pro $25 |
| 3 | **Supabase Free: sin backups gestionados** | desde el día 1 | — | Mitigado con `pg_dump` diario (obligatorio, ver §6) |
| 4 | **Supabase Free: pausa a los 7 días sin actividad** | 7 días inactividad | proyecto "Paused" | Con clientes reales no ocurre; si ocurre = no hay clientes |
| 5 | Supabase Free: 5 GB egress/mes | 5 GB | Dashboard → Usage | Supabase Pro |
| 6 | Vercel Pro: 1 TB transfer, 10M edge requests | muy lejos | Vercel Usage | No pasa a esta escala |

**Nota:** el límite de emails llega antes que el de base de datos. Presupuestar el cambio de proveedor de email antes que el de DB.

### Variante US$ 0 (evaluada y descartada)
Cloudflare Workers Free (100k req/día, assets estáticos ilimitados, uso comercial permitido) + D1 Free (5 GB, 5M filas leídas/día) = **$0/mes real y legal** [VERIFICADO: developers.cloudflare.com, 2026-07-27].
**Descartada porque:** el código actual es Next.js sobre Vercel; migrar a OpenNext/Workers cuesta días de DEV y D1 (SQLite) no tiene RLS de Postgres ni Auth integrado — habría que agregar Auth.js + esquema propio. Cambiar $20/mes por semanas de trabajo y menos garantías es exactamente el "volador de luces" que el mandato prohíbe.
**Reevaluar solo si:** el gasto Vercel supera $60/mes sin que crezcan los ingresos.

---

## 2. STACK NIVEL 1 (5–20 clientes)

| Componente | Cambio | US$/mes |
|---|---|---|
| Vercel | Pro, 1 seat, sin cambios | 20 |
| Supabase | Free → **Pro** | 25 [VERIFICADO: 2026-07-27] |
| Email | Resend Free → **Brevo Free (300/día)** o Resend Pro | 0 – 20 |
| Cache/rate limit | Sigue sin Upstash | 0 |
| **TOTAL** | | **US$ 45 – 65/mes** |

**Qué compra el salto a Supabase Pro (esto es lo que se paga, no "más GB"):**
- Backups diarios gestionados con 7 días de retención
- Sin pausa por inactividad
- 8 GB DB, 100.000 MAU, 250 GB egress

**Gatillos medibles de migración a Nivel 1 (cualquiera de los tres):**
1. DB > **350 MB** (70% de 500 MB) en el dashboard de Supabase, dos semanas seguidas.
2. Egress > **3,5 GB/mes**.
3. Un cliente firmó contrato con SLA o cláusula de recuperación de datos → Pro es obligatorio ese mismo día.

**Email:** Brevo Free da 300/día contra los 100/día de Resend, y el límite es compartido entre marketing y transaccional [VERIFICADO: búsqueda, 2026-07-27]. Si el volumen es sólo transaccional y supera 300/día, Amazon SES a **$0,10 por 1.000 emails** es 10–20× más barato que cualquier plan fijo [VERIFICADO: aws.amazon.com/ses/pricing, 2026-07-27]; el costo es la configuración de DKIM/SPF y salir del sandbox. Con <20 clientes no se justifica.

---

## 3. STACK NIVEL 2 (20–50 clientes)

| Componente | Cambio | US$/mes |
|---|---|---|
| Vercel | Pro, 1–2 seats | 20 – 40 |
| Supabase | Pro + compute/storage extra | 25 – 45 |
| Email | Amazon SES (à la carte) o Brevo Starter $9 | 5 – 15 |
| Cache / rate limit | **Upstash Redis pay-as-you-go** (recién ahora) | 0 – 5 |
| Automatización cliente | **n8n self-hosted en VPS Hetzner CX22 (€4,49/mes) + Coolify** | ~5 |
| **TOTAL** | | **US$ 55 – 110/mes** |

- Hetzner CX22 = **€4,49/mes** desde el ajuste de precios de abril 2026 [VERIFICADO: hetzner.com / docs.hetzner.com price-adjustment, 2026-07-27]. ≈ US$5.
- Coolify: open source, self-hosted, gratis [ESTIMADO — no verificado en 2 intentos].
- Upstash Redis free: 500.000 comandos/mes, 256 MB [VERIFICADO: upstash.com/pricing/redis, 2026-07-27]. Pay-as-you-go $0,20 / 100k comandos.

**Gatillos medibles:**

| Cambio | Gatillo |
|---|---|
| Agregar Upstash | Rate limiting por IP en memoria deja de servir porque hay >1 instancia serverless concurrente Y se detectó abuso real en logs (no "por si acaso") |
| VPS + n8n | Un cliente paga por automatización recurrente cuyo costo en Make/Zapier supera **$20/mes**, o se necesita ejecución >5 min |
| 2º seat Vercel | Entra una segunda persona con acceso a deploy |
| Compute Supabase | p95 de query > 500 ms sostenido una semana |

**Automatización — comparación (elegir por costo real del cliente, no por gusto):**

| Producto | Free | Primer pago | Cuándo usarlo |
|---|---|---|---|
| Make | 1.000 créditos/mes | Core $9/mes, 10.000 créditos | **Default hasta 10.000 ops/mes.** Cero mantención |
| Zapier | 100 tareas/mes | Pro ~$19,99/mes (anual) | Nunca — Make hace lo mismo más barato |
| n8n Cloud | — | Starter €20/mes, 2.500 ejecuciones | Nunca — si vale €20, el self-hosted vale $5 |
| n8n self-hosted | Gratis (Community, FairCode) | VPS ~$5/mes | Cuando Make >$20/mes o hay datos que no pueden salir a un SaaS |

[VERIFICADO: make.com/pricing, zapier.com/pricing, n8n.io/pricing — 2026-07-27]

**Base de datos — por qué Supabase y no Neon ni D1:** Neon Free da 0,5 GB y suspende compute al agotar el mes; su Launch es pay-as-you-go sin techo predecible [VERIFICADO: neon.com/pricing, 2026-07-27]. Neon no trae Auth, Storage ni RLS-con-JWT integrados: elegirlo obliga a sumar Auth.js + storage aparte = más piezas por el mismo dinero. D1 no tiene RLS ni Postgres. **Supabase gana por bundle, no por precio.**

---

## 4. LISTA NEGRA — PROHIBIDO en esta etapa

| # | Tecnología | Por qué está prohibida | Alternativa barata que resuelve el 90% |
|---|---|---|---|
| 1 | **Kubernetes / Docker Swarm** | Requiere un rol full-time que no existe. Resuelve orquestación de decenas de nodos; hay 1 app | Vercel (0 nodos que administrar) o 1 VPS + Coolify |
| 2 | **Microservicios** | Multiplica deploys, logs y modos de falla. La causa nº1 de bugs a esta escala es el deploy, no el monolito | Monolito Next.js con módulos separados por carpeta |
| 3 | **Data warehouse (BigQuery/Snowflake/Redshift)** | Se justifica sobre ~100 GB. Aquí hay <1 GB | Query SQL directa sobre Postgres + vista materializada |
| 4 | **Multi-región** | Clientes en un solo país y huso horario. Duplica costo y agrega consistencia eventual | 1 región (us-east) + CDN gratis de Vercel/Cloudflare |
| 5 | **Fine-tuning de LLM propio** | Costo de entrenamiento + evaluación + reentrenamiento por drift, sin dataset propio suficiente | Prompt + few-shot + RAG sobre pgvector en el mismo Postgres |
| 6 | **Kafka / RabbitMQ / SQS dedicado** | Infra permanente para un throughput de decenas de mensajes/día | Tabla `jobs` en Postgres + pg_cron, o Supabase Queues |
| 7 | **Observabilidad paga (Datadog / New Relic)** | Parte en ~$15/host/mes y escala con logs; superaría el costo de todo el stack | Vercel Logs + Supabase Logs + UptimeRobot free + Sentry free (5.000 eventos/mes) |
| 8 | **CDN pago (Fastly / CloudFront)** | Vercel y Cloudflare ya incluyen CDN sin costo extra | El CDN que ya viene incluido |
| 9 | **Service mesh (Istio / Linkerd)** | Sin microservicios no hay malla que gestionar | N/A — no aplica |
| 10 | **GraphQL** | Agrega gateway, schema, resolvers y caché a un frontend que consume su propio backend | Route handlers de Next.js + cliente Supabase tipado |
| 11 | **Monorepo con Nx / Bazel / Turborepo remoto** | Build system que hay que mantener; los builds actuales duran <2 min | Repos separados por app, o carpetas en uno solo |
| 12 | **Staging / QA / UAT como ambientes permanentes** | 3× costo y 3× drift de configuración | Preview deployments de Vercel por PR (gratis, efímeros) |
| 13 | **Terraform / Pulumi (IaC)** | Escribir y mantener HCL para ~5 recursos que se tocan 2 veces al año | Configuración por dashboard + un `SETUP.md` con los pasos |
| 14 | **Upstash / Redis antes de tener tráfico** | Componente nuevo, secret nuevo, modo de falla nuevo, para 0 req/día | Rate limit en memoria + columna `last_request_at` en Postgres |

---

## 5. REGLA DE DECISIÓN

> **Ningún componente nuevo entra al stack a menos que ARQUITECTO pegue, en el PR o en el documento de decisión: (a) la métrica del dashboard —con nombre, valor medido y fecha— que muestra que un límite del stack actual ya se superó o está sobre el 70%, o el ticket de un cliente que paga describiendo la falla concreta que causó; (b) el costo mensual del componente y a quién se le factura; y (c) el nombre de la persona que lo revierte y en cuántos minutos. Si falta cualquiera de los tres, o si la justificación contiene las palabras "escalabilidad futura", "buenas prácticas", "por si acaso", "estándar de la industria" o "cuando crezcamos", la respuesta es NO y no se vuelve a discutir hasta que exista la métrica.**

---

## 6. ROBUSTEZ MÍNIMA INNEGOCIABLE

Esto se paga aunque el stack sea barato. Es lo que separa "barato" de "irresponsable".

| # | Requisito | Especificación exacta | Cómo se verifica que está cumplido |
|---|---|---|---|
| 1 | **Backup de base de datos** | Nivel 0: GitHub Action diaria 03:00 CLT con `pg_dump` comprimido, retención 30 días. Nivel 1+: además backups diarios de Supabase Pro (7 días) | Abrir la pestaña Actions de GitHub: última corrida verde ≤26 h. Descargar el dump más reciente y verificar que pesa >0 y abre con `gunzip -t` |
| 2 | **Restore probado** | Restaurar el último backup en un proyecto Supabase temporal, **una vez por trimestre** | Existe una entrada en `docs/BITACORA-RESTORE.md` con fecha, duración y nº de filas de la tabla principal, con menos de 90 días de antigüedad |
| 3 | **HTTPS + HSTS** | TLS en todos los dominios, redirección 301 desde http, HSTS activo | `curl -sI http://<dominio>` devuelve 301 a https; `curl -sI https://<dominio>` incluye `strict-transport-security` |
| 4 | **Secrets fuera del repo** | Todo secreto en Vercel Environment Variables. `.env*` en `.gitignore`. Ningún secreto en logs | `git log --all -p -- .env` sin resultados; `gitleaks detect` en el pre-push hook con salida limpia |
| 5 | **Rollback** | Volver a la versión anterior en **≤5 minutos** sin tocar código, vía Vercel → Deployments → Promote to Production | Se ejecuta un rollback de prueba en cada release mayor y se anota el tiempo real. Si tarda >5 min, el procedimiento está incumplido |
| 6 | **Migraciones reversibles** | Toda migración SQL versionada en el repo, con su `down`. Nunca `DROP COLUMN` en el mismo deploy que quita su uso (dos deploys) | Cada archivo en `supabase/migrations/` tiene un par de reversión, y el PR de una migración destructiva referencia el PR previo que dejó de usar la columna |
| 7 | **RLS en base de datos** | RLS habilitado en **todas** las tablas con datos de cliente. Deny-by-default. `service_role` nunca expuesta al navegador | Query: tablas del esquema `public` con `rowsecurity = false` → debe devolver 0 filas. Además, Supabase Advisors sin alertas de seguridad |
| 8 | **Monitoreo de disponibilidad** | UptimeRobot free: check HTTP cada 5 min sobre un endpoint `/api/health` que consulte la DB, con alerta a email | El endpoint responde 200 con `{"db":"ok"}`. Existe al menos una alerta recibida en una caída de prueba provocada |
| 9 | **Monitoreo de errores** | Sentry free (5.000 eventos/mes) capturando excepciones de servidor y cliente | Se lanza un error de prueba en producción y aparece en Sentry en <2 min |
| 10 | **Logs con retención** | Vercel Logs + Supabase Logs. Ningún log con RUT, email completo, token ni contraseña | `grep -riE "password|token|rut|@" ` sobre las sentencias de logging del repo, revisado en cada PR |
| 11 | **Auditoría y soft delete (Ley 19.628)** | `deleted_at` en tablas con datos personales; ninguna query muestra registros borrados; tabla de auditoría con quién/cuándo | Test automatizado que borra un registro y verifica que no aparece en la API pero sí en la tabla de auditoría |
| 12 | **Dependencias** | Dependabot activo. Vulnerabilidades críticas parcheadas en ≤7 días | Pestaña Security del repo: 0 alertas críticas o altas abiertas con más de 7 días |
| 13 | **Techo de gasto** | Spend limit configurado en Vercel y Supabase. Alerta al 50% del presupuesto del nivel | Captura del límite configurado en `docs/`. Vercel Pro trae tope por defecto de $200 — bajarlo al presupuesto real del nivel |
| 14 | **Acceso** | 2FA obligatorio en GitHub, Vercel y Supabase. Ningún secreto compartido por WhatsApp/email | Cada cuenta muestra 2FA activo en su panel de seguridad |

**Puntos 1, 4, 5, 7 y 13 son bloqueantes: sin ellos no se sube nada a producción, sin importar el cliente ni la fecha.**

---

*Documento de arquitectura. Cualquier cambio a esta lista requiere aplicar la Regla de Decisión (§5).*
