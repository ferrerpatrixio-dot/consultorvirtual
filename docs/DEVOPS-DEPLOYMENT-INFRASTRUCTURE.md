# ⚙️ DEVOPS & DEPLOYMENT - SIMPLE PARA PYME

**Filosofía:** Lo mínimo necesario para operar bien. Sin over-engineering.  
**Principio:** "Si no lo necesitas HOY, no lo hagas HOY"  
**Responsable:** DEV + Project Manager  

---

## 🎯 FILOSOFÍA PYME

```
NO HAGAS:
❌ Microservicios (complejidad innecesaria)
❌ Kubernetes (overkill para esta escala)
❌ 5 ambientes (dev/staging/test/qa/prod)
❌ SLA 99.99% (irrealista para PYME cliente)
❌ Monitoreo robótico (costoso)

HAZLO SIMPLE:
✅ Monolito en Vercel (rápido, barato, escalable)
✅ 1 database Supabase (suficiente para 10K usuarios)
✅ 2 ambientes: dev local + producción
✅ Upstash libre tier (hasta que crezcas)
✅ GitHub + Vercel (sin extras)
```

---

## 🏗️ STACK REAL (Lo que usamos)

### Apps

```
sistemaiprocess → Vercel (Next.js)
misitioweb      → Vercel (Next.js)

Ambos:
├─ Deploy automático desde main
├─ Preview URL para cada PR
└─ Costo: $0-100/mes total
```

### Database

```
Supabase PostgreSQL:
├─ $0 free tier: perfecto para MVP
├─ $25/mes cuando crezcas
├─ Backup diarios automático
├─ Suficiente para 100K proyectos SME
```

### Rate Limiting

```
Upstash Redis:
├─ $0 free tier (10K requests/día)
├─ Cuando: sólo después de tener clientes
└─ Costo: $0-25/mes

Hoy: NO lo necesitas (tráfico: 0)
Mañana: Lo agrega en 5 min
```

### Versionamiento

```
GitHub:
├─ Free tier + privadas = suficiente
├─ CI/CD: más adelante (cuando necesites)
└─ Costo: $0
```

---

## 🚀 DEPLOYMENT SIMPLIFICADO

### Dev → Producción (3 pasos)

```
PASO 1: Commit + Push
├─ Haces cambio local
├─ `git commit -m "Fix X"`
├─ `git push origin main`
└─ Toma: 30 segundos

PASO 2: Vercel Auto-deploy
├─ Vercel detecta push automático
├─ Compila Next.js
├─ Deploy a producción
└─ Toma: 1-2 minutos

PASO 3: Listo
├─ Cliente usa cambio
├─ Sin proceso manual
├─ Sin downtime
└─ Toma: 0 segundos

TOTAL: ~2 minutos de punta a punta
SIN ceremony, SIN burocracia
```

---

## 🔐 SEGURIDAD PYME (No paranoia)

### Secrets

```
NUNCA en código:
❌ .env
❌ Comentarios con claves
❌ Logs con data sensible

DONDE SÍ:
✅ Vercel Settings → Environment Variables
✅ Variables: SUPABASE_URL, UPSTASH_TOKEN, etc.
✅ Auto en GitHub Actions (si lo usas)

Chequeo: `git log --all -S "password"` (busca si hay)
```

### Rate Limiting

```
Hoy: NO necesitas
Mañana: Cuando tengas 50+ requests/día
├─ Activa en Upstash
├─ Limita /api/evaluate a 10/hora
└─ Toma: 5 minutos

Customer Protection: No spam, no abuse
```

### Soft Delete (Ley 19.628)

```
Cuando usuario pide borrar:
├─ NO borras (es ilegal sin certificado)
├─ Marcas: deleted_at = now()
├─ Queries nunca muestran deleted=true
└─ Auditoría mantiene registro

Cumples ley, no pierdes datos, simple.
```

---

## 📊 MONITOREO PYME (Práctico)

### Diariamente (2 min)

```
1. ¿App sigue online?
   └─ Visita app-procesos.vercel.app
   └─ Si carga: ✅ OK

2. ¿Hay errores?
   └─ Vercel: Project → Deployments → Logs
   └─ Si no hay ERROR rojo: ✅ OK

3. ¿Cliente contento?
   └─ Slack/Email?
   └─ Sin quejas: ✅ OK

Toma: 2-3 minutos. Listo.
```

### Semanalmente (10 min)

```
1. Storage OK?
   └─ Supabase Dashboard → Storage
   └─ Si < 100MB usado: ✅ OK (vamos a millones)

2. Costo previsto?
   └─ Vercel usage
   └─ Supabase usage
   └─ Si < $500/mes: ✅ OK

3. Cualquier idea de mejora?
   └─ Anotar para próximas 2 semanas
```

NO necesitas dashboard robótico. Revisión manual = suficiente.
```

---

## 🆘 CUANDO ALGO FALLA

### Si cliente reporta error

```
PASO 1: Reproducer (2 min)
├─ "¿Qué hiciste cuando falló?"
├─ Pruebas lo mismo
└─ Confirmar: "Sí, falla"

PASO 2: Revertir (2 min)
├─ Si fue deploy reciente:
│  └─ Vercel: Rollback a deployment anterior
│  └─ ¿Problema resuelto?
├─ SÍ → Notificar cliente "Fixed"
└─ NO → Ir a PASO 3

PASO 3: Investigar (30 min)
├─ Revisar logs (Vercel)
├─ ¿Database está OK? (Supabase)
├─ ¿API responde?
└─ Encontraste causa?

PASO 4: Fijar y re-deploy
├─ Arregla en código
├─ Commit + push
└─ Vercel auto-deploy

TOTAL: ~40 min (en el peor caso)
TRANSPARENCIA: Cliente sabe qué pasó
```

---

## 💰 COSTOS REALES

### Hoy (MVP, 0 usuarios)

```
Vercel:       $0   (free tier, <100GB transfer)
Supabase:     $0   (free tier)
Upstash:      $0   (free tier)
GitHub:       $0   (free tier)
────────────────────
TOTAL:        $0/mes 🎉
```

### Mañana (10 clientes activos)

```
Vercel:       $20   (hosting + bandwidth)
Supabase:     $25   (pequeño plan pagado)
Upstash:      $0    (aún free tier)
GitHub:       $0    (free suficiente)
────────────────────
TOTAL:        $45/mes ✅ Viable
```

### Futuro (100+ clientes)

```
Vercel:       $50-100
Supabase:     $100-200  (más storage)
Upstash:      $25       (plan pagado)
GitHub:       $21       (si quieres Enterprise)
────────────────────
TOTAL:        $200-350/mes 📈

Pero a esa escala: generas $5K-20K/mes. Total win.
```

---

## 📋 CHECKLIST SIMPLE

### Antes de hacer un cambio

```
□ ¿Committeé .env? (No)
□ ¿Tests pasan? (Si hay)
□ ¿Cambio es importante? (Documentar qué hiciste)
```

### Después de hacer un deploy

```
□ ¿App carga? (Verifica en navegador)
□ ¿Feature funciona? (Testa manualmente)
□ ¿Cliente notificado? (Si es cambio visible)
```

### Si algo falla

```
□ ¿Puedo revertir? (SÍ, en 2 min)
└─ Revertir
□ ¿Qué salió mal? (Investigar)
└─ Arreglar
□ ¿Notificar cliente? (SÍ)
└─ Honesto, sin panic
```

---

## 🎯 MENTALIDAD PYME

**Pregunta antes de agregar complejidad:**

```
"¿Realmente lo necesito AHORA?"

NO: Vercel + Supabase free → Perfecto
SÍ, pero en 3 meses: Agregar cuando llegue
SÍ, es bloqueador → Solo entonces

NO HAGAS:
- "Por si acaso" (engineering)
- "Por best practices" (si no necesitas)
- "Como debe ser" (si funciona hoy)

HAZ:
- Lo mínimo que funciona
- Documentar qué pusiste dónde
- Cuando crece → Scale (Vercel/Supabase lo hacen automático)
```

---

## 📚 DOCUMENTACIÓN (Mínima necesaria)

```
Vercel:    https://vercel.com/docs/deployments
Supabase:  https://supabase.com/docs/guides/database
Next.js:   https://nextjs.org/docs
```

No leas TODO. Solo lo que necesitas HOY.

---

*DevOps PYME = Deploy en 2 min, sin drama.*  
*$0-50/mes mientras creces.*  
*Herramientas manejan escala automáticamente.*  
*Enfócate en cliente, no en infraestructura.*
