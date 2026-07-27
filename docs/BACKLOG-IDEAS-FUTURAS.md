# 🧊 BACKLOG DE IDEAS FUTURAS (Congelador)

**Propósito:** Guardar ideas valiosas pero PREMATURAS, para no perderlas ni ejecutarlas antes de tiempo.

**Regla del dueño (Patricio Ferrer):**
> "Al principio todo debe ser al mínimo costo que garantice operación razonablemente robusta, estable y escalable para uso de una PYME en ambiente de producción. Nada de voladores de luces."

---

## 🚦 CÓMO FUNCIONA

Cuando ARQUITECTO o PRODUCT MANAGER proponen algo caro o novedoso:

```
1. NO se rechaza. Se CONGELA aquí.
2. Se anota con su GATILLO DE DESCONGELAMIENTO (condición medible).
3. PM revisa este archivo 1 vez al mes.
4. Si el gatillo se cumplió → pasa a evaluación formal.
5. Si no → sigue congelado. Sin discusión.
```

**Un ítem sin gatillo medible no entra a este backlog.** "Cuando tengamos más clientes" no es un gatillo. "Cuando tengamos 20 clientes activos pagando" sí lo es.

---

## 📋 FORMATO DE ENTRADA

```
### [ID] Nombre de la idea
- **Propuesto por:** AGENTE / fecha
- **Qué es:** 2 líneas máximo
- **Por qué está congelado:** costo, complejidad, o no hay demanda validada
- **Gatillo de descongelamiento:** condición MEDIBLE
- **Costo estimado al descongelar:** US$/mes o CLP one-time
- **Qué hacemos mientras tanto:** la alternativa barata que resuelve el 80%
```

---

## 🧊 IDEAS CONGELADAS

### [F-001] Software modularizador de cotizaciones
- **Propuesto por:** Patricio Ferrer / 2026-07-27
- **Qué es:** una herramienta que arme cotizaciones por módulos en vez de
  redactarlas a mano.
- **Por qué está congelado:** hoy la Fase 1 es un **producto de precio fijo con
  2 tramos**. Existen exactamente 4 documentos y ya están escritos. No hay nada
  que modularizar: sería un generador para elegir entre 4 archivos estáticos.
  Además el cuello de botella real hoy es **0 clientes**, no el tiempo de
  cotizar.
- **Gatillo de descongelamiento:** haber cotizado **≥ 10 Fases 2** a mano
  **y** que el tiempo promedio de armar una cotización supere **2 horas**.
  (La Fase 2 sí es a medida — ahí la modularización tendría sentido, pero
  recién cuando existan patrones observados, no imaginados.)
- **Costo estimado al descongelar:** por evaluar. No se estima ahora.
- **Qué hacemos mientras tanto:** las 4 plantillas del kit de venta con campos
  `[[ ]]` completados a mano en la reunión. Tiempo real: minutos.

**Nota:** esta entrada es el primer caso de prueba de la regla de decisión de
ARQUITECTO. La idea no se rechazó: no cumple el requisito (a) — no existe la
métrica que muestre un límite superado. Cuando exista, se descongela.

---

### [F-002] Interfaz de pago de suscripción
- **Propuesto por:** Patricio Ferrer / 2026-07-27
- **Qué es:** medio de pago recurrente en línea para un modelo de suscripción.
- **Por qué está congelado:** hoy el modelo de ingresos es **por proyecto**
  (Fase 1 precio fijo, Fase 2 cotizada), no por suscripción. No existe todavía
  el producto que se cobraría mensualmente. Integrar pagos antes de tener qué
  cobrar es construir la caja registradora antes que la tienda.
- **Gatillo de descongelamiento:** que exista un **producto de cobro recurrente
  definido y aprobado por PRODUCT MANAGER**, y **≥ 3 clientes** dispuestos a
  contratarlo. Ambas condiciones, no una.
- **Costo estimado al descongelar:** por evaluar. En Chile las opciones a mirar
  incluyen Transbank/Webpay, Flow, Khipu y MercadoPago; el criterio será
  comisión efectiva y si emiten documento tributario. **No investigado aún.**
- **Qué hacemos mientras tanto:** transferencia bancaria y factura. Con el
  volumen actual (0 clientes) es suficiente y no tiene comisión.

**Reparto de responsabilidades cuando se descongele** (los tres, en orden):
1. **PRODUCT MANAGER** — decide *si* hay suscripción, qué incluye y a qué precio.
   Es dueño del modelo de ingresos. **Sin su definición, los otros dos no parten.**
2. **FINANCE / contabilidad** — cómo se concilia la plata, emisión de boleta o
   factura electrónica, reconocimiento del ingreso, y el efecto en el flujo de caja.
3. **ARQUITECTO + DEV** — recién al final, la integración técnica.

**No es de uno o de otro: es secuencial.** El error clásico es partir por el
punto 3 porque es el entretenido.

---

## ✅ IDEAS DESCONGELADAS (histórico)

*(Vacío. Cuando una idea pase a ejecución, se mueve aquí con la fecha y el gatillo que se cumplió.)*

---

## 🚫 IDEAS DESCARTADAS DEFINITIVAMENTE

*(Vacío. Aquí van las que se evaluaron y NO aplican al modelo PYME, con la razón. Evita que alguien las reproponga.)*

---

*Revisión mensual: PM (Coordinador)*
*Última revisión: 2026-07-27*
