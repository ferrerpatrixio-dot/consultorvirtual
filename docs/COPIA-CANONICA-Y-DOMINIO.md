# 📍 COPIA CANÓNICA Y PUBLICACIÓN EN aiprocess.cl

**Decisión de Patricio Ferrer · 2026-07-27**

---

## ✅ LA COPIA QUE MANDA

```
C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\
```

**Es la única desde la que se commitea y se despliega.**

Remoto: `https://github.com/ferrerpatrixio-dot/APP-PROCESOS.git`

### ⚠️ Las otras dos copias NO se tocan

```
C:\Users\ferre\Proyectos\PROCESOS BPMN\aiprocess\                  ← obsoleta
C:\Users\ferre\Proyectos\PROCESOS BPMN_BACKUP_20260727\aiprocess\  ← respaldo
```

Ambas son clones del **mismo repositorio**, en el mismo commit base.

**El riesgo concreto:** el 2026-07-27 se retiró el claim ISO 27001 en la copia
canónica y el sitio seguía mostrándolo, porque había un servidor de desarrollo
corriendo desde `PROCESOS BPMN\aiprocess`. Un arreglo puede parecer que "no
funcionó" cuando en realidad se está mirando otra copia.

**Peor aún:** si se commitea desde dos copias al mismo remoto, se pisan cambios.

**Acción pendiente de Patricio:** borrar o archivar `PROCESOS BPMN\aiprocess`
una vez confirmado que no hay nada sin commitear ahí. El respaldo puede quedar,
pero fuera de `Proyectos\`.

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

### Decisión pendiente: apex o www

Hay que elegir cuál es la dirección principal y cuál redirige:

| Opción | Principal | Redirige |
|---|---|---|
| A | `aiprocess.cl` | `www` → apex |
| B | `www.aiprocess.cl` | apex → `www` |

Patricio escribió **www.aiprocess.cl**, lo que sugiere la opción B.
**Confirmar antes de configurar**, porque cambiarlo después afecta enlaces
compartidos y posicionamiento.

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
