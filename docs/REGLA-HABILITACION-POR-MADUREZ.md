# 🚦 REGLA DE HABILITACIÓN POR MADUREZ

**Decisión de Patricio Ferrer · 2026-07-27**
**Para:** ARQUITECTO y PRODUCT MANAGER, antes de proponer cualquier servicio

---

## 🎯 EL PROBLEMA QUE RESUELVE

**R-3** prohíbe proponer soluciones que exijan que el cliente tenga, contrate o
asigne personal técnico. Es la barrera #1 documentada: 75% de las PYMEs reporta
obstáculos por falta de personal experto.

Pero los **modelos de predicción** sí requieren, del lado del cliente, alguien
con perfil analítico mínimo: que entienda qué significa el resultado, que note
cuando el modelo se degrada, y que actúe sobre él.

Eso no es una contradicción. Es que **no todos los servicios aplican a todos los
clientes.** Sin una regla escrita, cualquier agente va a terminar proponiéndole
un modelo predictivo a un cliente que apenas sale de Excel — y ese proyecto
fracasa por diseño, no por ejecución.

---

## 📊 LOS CINCO ESTADOS DEL MMA-OD

Verificados en el motor (`scripts/madurez/motor.mjs`):

```
CIMIENTOS          sin orden y sin datos
ORDEN_SIN_DATOS    procesos formales, pero nada registrado
DATOS_SIN_ORDEN    hay datos, pero el proceso no está definido
EN_CONSTRUCCION    avanzando en ambos ejes
BASE_LISTA         orden y datos suficientes
```

---

## 🚦 QUÉ SE PUEDE PROPONER EN CADA ESTADO

| Estado | Se propone | **NO** se propone |
|---|---|---|
| **CIMIENTOS** | Ordenar el proceso. Empezar a registrar. | Automatizar · Predecir · Dashboards |
| **ORDEN_SIN_DATOS** | Registrar lo que ya está ordenado. Automatizar lo repetitivo. | Predecir (no hay historia que aprender) |
| **DATOS_SIN_ORDEN** | Ordenar el proceso primero. Limpiar los datos. | Predecir sobre datos de un proceso inestable |
| **EN_CONSTRUCCION** | Automatizar. Medir. Preparar la base. | Predecir, salvo caso acotado y con analista identificado |
| **BASE_LISTA** | **Aquí sí:** modelos de predicción | — |

---

## ⚡ LA REGLA

> **Los modelos de predicción solo se proponen a clientes en `BASE_LISTA`,
> y solo si existe una persona identificada con nombre que va a leer y usar
> el resultado.**
>
> Si no hay esa persona, no se propone — aunque el cliente lo pida y aunque
> pueda pagarlo.

**R-3 sigue vigente para toda la oferta base.** Esta regla no la debilita: la
acota. El servicio predictivo es la única excepción, y está condicionada al
estado de madurez, no a la voluntad del cliente.

### Por qué la persona con nombre

Un modelo sin alguien que lo lea es un gasto que se degrada solo. A los meses
predice mal, nadie lo nota, y el cliente concluye que "la IA no funciona".
Ese fracaso es nuestro aunque el modelo haya estado bien construido.

---

## ✅ CÓMO SE VERIFICA

**En la entrevista inicial** (Bloque E de la guía) ya se pregunta si hay alguien
técnico. Si la conversación deriva hacia predicción, hay que llegar a un nombre:

```
"¿Quién en tu equipo va a mirar ese número todas las semanas
 y decidir algo con él?"
```

Si la respuesta es "yo lo veo", "alguien vemos" o "lo contratamos después",
**no está habilitado.** Se propone lo del estado en que está.

---

## 💬 CÓMO SE DICE SIN PERDER AL CLIENTE

No es un "no". Es un "todavía no, y este es el camino":

> "Predecir tu demanda se puede hacer, pero necesita dos cosas que hoy no
> tienes: historia registrada de manera pareja, y alguien acá que mire el
> resultado y decida con él. Si ordenamos el proceso y empezamos a registrar,
> en unos meses estás en condiciones. Hacerlo ahora sería venderte algo que
> no te va a servir."

**Esto refuerza el posicionamiento en vez de debilitarlo:** eres el que le dice
que no está listo, no el que le vende lo que sea.

---

## 📌 CONSECUENCIA COMERCIAL

El MMA-OD deja de ser solo un diagnóstico y pasa a ser **el habilitador de la
oferta**. El test gratis de la Fase 0 ya devuelve el estado del cliente, así
que la calificación empieza antes de la primera reunión.

También significa que un cliente en `CIMIENTOS` **no es un mal cliente**: es un
cliente de otro servicio, y potencialmente de varios proyectos seguidos a medida
que sube. La escala de madurez es el mapa de crecimiento de la cuenta.

---

*Ver también: [RESTRICCIONES-CONSOLIDADAS.md](investigacion/RESTRICCIONES-CONSOLIDADAS.md) (R-3) ·
[MODELO-FASES-Y-PRECIOS.md](MODELO-FASES-Y-PRECIOS.md) ·
[GUIA-PRIMERA-ENTREVISTA-CLIENTE.md](comercial/GUIA-PRIMERA-ENTREVISTA-CLIENTE.md)*
