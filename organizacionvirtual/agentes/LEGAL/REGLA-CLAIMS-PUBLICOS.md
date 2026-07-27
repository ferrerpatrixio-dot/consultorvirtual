# ⚖️ LEGAL — REGLA DE CLAIMS PÚBLICOS

**Origen:** hallazgo del 2026-07-27. **Falla de LEGAL.**
**Estado:** vigente y obligatoria.

---

## 🔴 QUÉ PASÓ

El sitio **aiprocess.cl**, en producción, declaraba públicamente:

```
📋 Cumplimiento ISO 27001 (seguridad información)     ← Footer.tsx
Los datos se almacenan conforme a estándares ISO 27001 ← privacy/page.tsx
```

**CONSULTORAVIRTUAL no tiene certificación ISO 27001.**

Estuvo publicado en dos lugares distintos. Lo detectó una auditoría de sitio
hecha por ARQUITECTO/UI-UX, **no LEGAL** — que es a quien le correspondía.

**Por qué es grave:** afirmar una certificación que no se tiene es publicidad
engañosa. En una consultora que vende *confianza en el manejo de datos de
terceros*, es además el peor lugar posible para que aparezca. Si un cliente
lo descubre después de firmar, el daño no es la multa: es el contrato.

---

## ✅ LA REGLA

> **Ninguna afirmación de certificación, acreditación, membresía, premio o
> cumplimiento normativo se publica sin que LEGAL verifique el documento que
> la respalda.**
>
> Si no existe el certificado, la frase no se publica. Sin excepciones,
> sin "es que técnicamente cumplimos", sin "el proveedor lo tiene".

### La distinción que originó el error

```
❌ "Cumplimos ISO 27001"           → afirma que NOSOTROS estamos certificados
✅ "Nuestro proveedor de base de     → atribuye la certificación a quien
    datos mantiene certificación        efectivamente la tiene
    ISO 27001"
```

**Una certificación de tu proveedor no es tuya.** Se puede mencionar, pero
siempre atribuida y nunca en primera persona.

---

## 📋 CHECKLIST — antes de publicar cualquier texto de cara al público

Aplica a: sitio web, cotizaciones, contratos, propuestas, redes, material impreso.

```
□ ¿Hay alguna sigla de norma o certificación? (ISO, SOC, PCI, GDPR, HIPAA…)
     → ¿Existe el certificado a nombre nuestro? Pídelo. Si no aparece, se borra.

□ ¿Hay alguna cifra de resultados? ("ahorramos 30%", "50 clientes")
     → ¿Se puede probar con un caso documentado? Si no, se borra.

□ ¿Hay títulos, grados o membresías?
     → Correctos y verificables. Diplomado ≠ magíster. Curso ≠ certificación.

□ ¿Hay garantías o promesas de resultado?
     → ¿Están respaldadas en el contrato? Si no, se reformulan.

□ ¿Se menciona a un cliente o su caso?
     → ¿Hay autorización escrita? (ver PROGRAMA-CLIENTE-FUNDADOR)
```

---

## 🔁 CUÁNDO SE REVISA

- **Antes de cada despliegue** que toque texto público del sitio.
- **Antes de imprimir** cualquier pieza del kit de venta.
- **Auditoría completa cada 6 meses** de todo el texto público vigente.

**Responsable:** LEGAL. **VB final:** PM antes de producción.

---

## 📌 ESTADO DEL HALLAZGO

| | |
|---|---|
| Footer.tsx | ✅ Claim retirado |
| privacy/page.tsx | ✅ Reescrito, atribuido al proveedor |
| Rama | `fix/retirar-claim-iso-27001` |
| Desplegado a producción | ⏳ Pendiente |

**Pendiente de decisión de Patricio:** el footer también declara *"Cumplimiento
GDPR (servidor EU, Alemania)"*. Tener el servidor en Europa **no equivale** a
cumplir GDPR — eso exige bases de licitud, registro de tratamiento y derechos
del titular. LEGAL debe revisar si esa frase se sostiene o se reformula igual
que la de ISO.

---

*Ver también: [BITACORA-APRENDIZAJE-PROYECTOS.md](../../../BITACORA-APRENDIZAJE-PROYECTOS.md)*
