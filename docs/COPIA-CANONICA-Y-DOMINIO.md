# 📍 COPIA CANÓNICA Y PUBLICACIÓN EN aiprocess.cl

**Decisión de Patricio Ferrer · 2026-07-27**

---

## ✅ LA COPIA QUE MANDA

```
C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\
```

**Es la única desde la que se commitea y se despliega.**

Remoto: `https://github.com/ferrerpatrixio-dot/APP-PROCESOS.git`

### ✅ Copia duplicada retirada (2026-07-27)

`PROCESOS BPMN\aiprocess` fue **movida fuera de `Proyectos\`** por decisión de
Patricio, tras verificar que no tenía cambios sin commitear ni commits sin subir.

```
Ahora en: C:\Users\ferre\Archivo\aiprocess-copia-obsoleta-20260727\
```

Conserva su historial git completo. No se borró nada.
También se detuvo el servidor de desarrollo que corría desde ahí.

**Por qué se retiró:** el 2026-07-27 se quitó el claim ISO 27001 en la copia
canónica y el sitio seguía mostrándolo, porque el servidor del puerto 3000
servía la copia duplicada. Un arreglo puede parecer que "no funcionó" cuando en
realidad se está mirando otra copia. Peor: commitear desde dos copias al mismo
remoto pisa cambios.

### ⚠️ Queda un respaldo dentro de Proyectos

```
C:\Users\ferre\Proyectos\PROCESOS BPMN_BACKUP_20260727\aiprocess\
```

Es un respaldo declarado, menos riesgoso porque el nombre lo identifica. Aun así
sigue apareciendo en búsquedas de archivos. **Decisión pendiente de Patricio:**
moverlo también a `Archivo\` o dejarlo.

### 🟢 Producción no se tocó

Por instrucción de Patricio, la aplicación actual **permanece publicada en
GitHub y en Vercel** hasta que la nueva web esté lista. Mover la copia local no
afecta el despliegue: el remoto y Vercel siguen exactamente igual.

---

## 🚀 PUBLICACIÓN EN www.aiprocess.cl

Modelo: apuntar el dominio propio a la URL interna que entrega Vercel.

### Secuencia (en este orden, sin saltarse pasos)

```
1. PROBAR  → QA valida en el preview de Vercel, no en local
2. PUSH    → main al remoto; Vercel despliega solo
3. DOMINIO → agregar aiprocess.cl y www.aiprocess.cl en Vercel
4. DNS     → en el registrador del dominio, apuntar según indique Vercel
5. VERIFICAR → HTTPS activo y redirección apex ↔ www funcionando
```

**Regla de la casa (política QA):** ningún despliegue a producción sin VB de QA.
La única excepción son los MVP, y esto ya no lo es: está publicado y tiene
usuarios reales entrando al test.

### 🔧 Pendiente técnico que debe resolverse ANTES del dominio

El código tiene la URL de compartir **hardcodeada** a `app-procesos.vercel.app`
(detectado en la auditoría, `src/app/page.tsx`). Si se conecta el dominio sin
corregir esto, cada persona que comparta su resultado va a difundir la URL de
Vercel en vez de aiprocess.cl.

Va incluido en la **Ola 1** del
[plan de reestructuración](PLAN-REESTRUCTURACION-AIPROCESS-CL.md).

### ✅ Dirección principal: `aiprocess.cl` (sin www)

**Decidido por Patricio, 2026-07-27.**

```
aiprocess.cl          ← PRINCIPAL. La que se imprime, se dicta y se indexa.
www.aiprocess.cl      ← redirige a la principal
```

Ambas funcionan para el visitante; quien escriba `www` termina viendo
`aiprocess.cl` en la barra del navegador.

**Razones:** más corta de imprimir en cotizaciones, NDA y tarjetas, y de dictar
en una reunión. El `www` no aporta nada técnico. Vercel soporta ambas igual.

**Esta dirección es la que va en todo el material impreso del kit de venta.**
Cambiarla más adelante rompe enlaces ya compartidos y el posicionamiento
acumulado, así que se considera decisión firme.

---

## 📊 ESTADO ACTUAL

| | |
|---|---|
| Rama | `main` |
| Commits sin subir | **2** (fix ISO + merge) |
| Claim ISO 27001 | ✅ Retirado y verificado (0 ocurrencias) |
| Push al remoto | ⏳ Pendiente de autorización |
| Dominio conectado | ⏳ Pendiente |

---

*Dueño: PM (Coordinador) · Ejecución: DEV · VB producción: QA*
