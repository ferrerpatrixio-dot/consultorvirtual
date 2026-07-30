# 🪜 ESCALERA DE IA POR MADUREZ

**Armada el 2026-07-29** · Cruza los estados del MMA-OD con los casos de uso de IA
concretos y con el desarrollo típico de cada peldaño.

> **Uso interno.** Es el insumo del cortapalos de venta y de la futura página de
> servicios del sitio. No se publica tal cual: incluye criterios de descarte.
>
> Extiende [`REGLA-HABILITACION-POR-MADUREZ.md`](REGLA-HABILITACION-POR-MADUREZ.md),
> que tiene el principio. Esto es la operación.

---

## 1. La escalera

**No es una línea recta.** El peldaño del medio es una **bifurcación**: se llega
por el eje que esté más fuerte, y son dos rutas, no dos escalones.

```
                        BASE LISTA
                   orden y datos suficientes
                            ▲
                     EN CONSTRUCCIÓN
                   avanzando en ambos ejes
                            ▲
              ┌─────────────┴─────────────┐
       ORDEN SIN DATOS            DATOS SIN ORDEN
    proceso formal, nada        hay datos, proceso
        registrado                  indefinido
              └─────────────┬─────────────┘
                            ▲
                        CIMIENTOS
                   sin orden y sin datos
```

| Peldaño | Qué IA aplica | Desarrollo típico |
|---|---|---|
| **Base lista** | Predictiva | Modelo de predicción — **solo** con persona con nombre |
| **En construcción** | Asistida | Automatizar lo repetitivo · medir · preparar la base |
| **Orden sin datos** | Asistida, acotada | Registro digital de lo que ya está ordenado |
| **Datos sin orden** | Ninguna todavía | Ordenar el proceso primero · limpiar los datos |
| **Cimientos** | **Ninguna** | Definir el proceso y empezar a registrar. **Sin software** |

---

## 2. Los casos de uso, con su peldaño mínimo

Los ocho casos vienen del informe *«Automatización con IA para Pymes en Chile:
Casos de Uso Transversales»*, material de investigación del webinar.

**El menú del webinar está plano y los requisitos no lo son.** Ese cruce es lo
que no hace nadie más: cualquiera arma la lista; ordenarla por *lo que tu estado
permite* es nuestro.

| Caso de uso | Peldaño mínimo | Qué necesita antes | Si se hace antes |
|---|---|---|---|
| **Generación de contenido** | **Cimientos** | Nada | — (ver §3) |
| **Facturas y OCR** | Orden sin datos | Un destino definido para el dato extraído | El dato llega a una planilla que nadie usa |
| **Chatbot / WhatsApp** | Orden sin datos | Que las respuestas sean **las mismas** que da el equipo | Contesta más rápido sobre un proceso roto, y se contradice con la gente |
| **Agendamiento y recordatorios** | En construcción | Proceso definido + la cita registrada digitalmente | No hay a quién recordarle: la agenda está en papel |
| **Cotizaciones y seguimiento** | En construcción | Proceso definido + registro del prospecto | Un CRM vacío que nadie llena |
| **Cobranza escalonada** | En construcción | Registro de quién debe y desde cuándo | Se le cobra a quien ya pagó |
| **Inventario con alertas** | En construcción | Que el stock se registre **al mover**, no al contar | Alertas sobre un stock equivocado: peor que no tener alertas |
| **Reportes consolidados** | **Base lista** | Datos comparables entre fuentes | Consolidar tres planillas que no cuadran produce **un número falso con más autoridad** |

La columna «si se hace antes» es material de venta: no es una negativa, es lo que
va a pasar. Y es verificable después.

**`Datos sin orden` no habilita ningún caso nuevo.** El trabajo ahí es ordenar
primero — es la única ruta que exige retroceder antes de avanzar.

---

## 3. Herramienta personal ≠ automatización de proceso

Distinción que le faltaba a la regla de habilitación y que resuelve el caso
`CIMIENTOS`:

| | Requiere madurez | Por qué |
|---|---|---|
| **Automatización de proceso** | **Sí** | Se monta sobre el proceso: si el proceso está roto, multiplica el desorden |
| **Herramienta personal** | **No** | La usa una persona, no reemplaza un paso del proceso |

«Generación de contenido» es lo segundo: el dueño redacta más rápido y nada del
proceso cambia. Por eso puede proponerse en `CIMIENTOS` **sin romper la regla**.

Y sirve comercialmente: le da algo honesto y útil al cliente que está más abajo,
en vez de mandarlo a la casa con un «todavía no». Pero se nombra por lo que es —
una herramienta, no una solución— para que no crea que ya automatizó algo.

---

## 4. El segundo filtro: la tarea

La escalera filtra **organizaciones**. Falta filtrar **tareas**: una tarea puede
pasar el peldaño y fracasar igual.

Los cuatro criterios del webinar, derivados de *Building Effective Agents*
(Anthropic, diciembre 2024):

1. **¿El resultado se puede verificar?** Si no se puede saber si salió bien, no
   está lista para un agente.
2. **¿El valor justifica el gasto?** Los agentes cuestan más tokens y más
   supervisión.
3. **¿El modelo la ejecuta con fiabilidad hoy?** Probar antes de escalar.
4. **¿El costo del error es manejable?** Si es caro o irreversible: supervisión
   humana, o dejarlo como flujo fijo.

**Los dos filtros son en cadena, y ambos tienen que pasar:**

```
Filtro 1 · la organización  →  el MMA-OD dice QUÉ CLASE de cosas se pueden proponer
Filtro 2 · la tarea         →  estos criterios dicen CUÁL de esas cosas es automatizable hoy
```

El criterio 1 es el **Artículo 3** de la constitución dicho desde el lado de la
tarea, y el criterio 4 es la **regla de la persona con nombre**. No son marcos
prestados: son los propios, aplicados a otra unidad.

---

## 5. Lo que no se propone nunca antes de `Base lista`

**Modelos de predicción.** Ni acotados, ni de prueba, ni «para ir viendo» —
aunque el cliente lo pida y aunque pueda pagarlo. La regla completa y el guion
para decirlo sin perder al cliente están en
[`REGLA-HABILITACION-POR-MADUREZ.md`](REGLA-HABILITACION-POR-MADUREZ.md).

Y el recordatorio de por qué esto se sostiene: **el estado sale del test gratis,
que es un termómetro autodeclarado sin fiabilidad psicométrica**
(`sistemaaiprocess/docs/madurez/modelo-madurez.md` §5.2). Sirve para **orientar
la conversación y descartar**, no para fijar precio ni para prometer un
resultado. El estado se confirma en la Fase 1, con registros a la vista.

---

## 6. Pendiente

- **Precios.** Ninguna fila tiene precio: Fase 2 sigue en «cotizado desde el
  plan». Las tres bandas que propuso el PRODUCT MANAGER no están aprobadas.
- **Versión pública.** Esta tabla, sin criterios de descarte y en lenguaje de
  dueño de PYME, es la base de la página de servicios que resuelve el «¿dónde
  está la IA?» del sitio.

---

*Ver también: [`REGLA-HABILITACION-POR-MADUREZ.md`](REGLA-HABILITACION-POR-MADUREZ.md) ·
[`MODELO-FASES-Y-PRECIOS.md`](MODELO-FASES-Y-PRECIOS.md) ·
`sistemaaiprocess/docs/madurez/modelo-madurez.md` ·
`sistemaaiprocess/docs/madurez/eje-p-personas.md`*
