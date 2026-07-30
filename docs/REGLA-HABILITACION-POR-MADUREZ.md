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

## 🪜 LA VERSIÓN OPERATIVA DE ESTA TABLA

La tabla de arriba dice qué **clase** de cosas se propone en cada estado.
[`ESCALERA-IA-POR-MADUREZ.md`](ESCALERA-IA-POR-MADUREZ.md) la baja a **casos de
uso concretos** —chatbot, agendamiento, OCR, cobranza, reportes, inventario— cada
uno con su peldaño mínimo y con qué pasa si se hace antes.

Trae además dos cosas que a esta regla le faltaban:

1. **Herramienta personal ≠ automatización de proceso.** La segunda requiere
   madurez; la primera no, porque no reemplaza un paso del proceso. Eso permite
   proponerle algo honesto a un cliente en `CIMIENTOS` sin romper la regla.
2. **El segundo filtro.** Esta regla filtra organizaciones; falta filtrar tareas.
   Una tarea puede pasar el peldaño y fracasar igual. Los dos filtros van en
   cadena.

## 📌 CONSECUENCIA COMERCIAL

El MMA-OD deja de ser solo un diagnóstico y pasa a ser **el habilitador de la
oferta**. El test gratis de la Fase 0 ya devuelve el estado del cliente, así
que la calificación empieza antes de la primera reunión.

También significa que un cliente en `CIMIENTOS` **no es un mal cliente**: es un
cliente de otro servicio, y potencialmente de varios proyectos seguidos a medida
que sube. La escala de madurez es el mapa de crecimiento de la cuenta.

---

## 🎯 CÓMO SE ENCUADRA LA OFERTA — ahorro vs. capacidad

**Criterio de Patricio (2026-07-29):**

> Las organizaciones que ven la IA solo como una forma de reducir costos suelen
> aprovecharla de manera limitada. Las que la usan para fortalecer el talento de
> sus equipos mejoran decisiones, aprenden más rápido y descubren nuevas
> oportunidades de negocio.

### Por qué importa acá

La tabla de arriba dice **qué** se puede proponer en cada estado. Este criterio
dice **cómo se justifica**, y cambia el techo del servicio:

| Encuadre | Qué promete | Techo |
|---|---|---|
| **Reducción de costos** | menos gasto, menos retrabajo, menos horas | El ahorro se agota. Cuando ya recortaste, no hay segundo proyecto |
| **Fortalecer el talento** | mejores decisiones, aprendizaje más rápido, oportunidades nuevas | No se agota: cada vuelta del ciclo deja al equipo más capaz |

**Los dos se usan, en este orden.** El ahorro es la **puerta**: un dueño de PYME
no compra «amplificar las capacidades del equipo», compra «recuperar dinero que
estoy perdiendo». Es concreto y medible, y por eso abre la primera reunión. La
capacidad es el **techo**: es la razón por la que hay Fase 2 y por la que la
cuenta sigue después del primer proyecto.

### El método ya encodea esta progresión

*Ordenar → Automatizar → Mejorar* es exactamente el recorrido del criterio:

| Etapa | Qué gana la empresa | Encuadre |
|---|---|---|
| **Ordenar** | deja de perder dinero en retrabajo y errores | ahorro (la puerta) |
| **Automatizar** | su gente deja de hacer trabajo de copiar y pegar | transición |
| **Mejorar** | el equipo decide mejor, aprende más rápido, ve oportunidades | capacidad (el techo) |

Por eso **«Mejorar» no es solo cerrar el ciclo**: es donde el valor cambia de
naturaleza. Y por eso el tercer paso no podía ser «Disfrutar» — eso sugería un
final, cuando es justamente donde empieza lo que no se agota.

### Falta medir el talento que se quiere fortalecer

Si el techo del servicio es la capacidad del equipo, hay que medirla. Hoy el
instrumento mide el **sistema** (orden y datos) y la capacidad de las personas se
averigua conversando — o sea que el criterio decisivo de esta misma regla queda
fuera del modelo.

Propuesta de **eje P · Personas** en
[`sistemaaiprocess/docs/madurez/eje-p-personas.md`](../sistemaaiprocess/docs/madurez/eje-p-personas.md):
cuatro ítems —criterio de uso del resultado, política de uso, exposición de datos
y experiencia de adopción—, y **como habilitador, no como tercer estado**: no
cambia dónde está el cliente, cambia qué se le puede proponer desde ahí.

Con eso se puede decir *«tu proceso y tus datos están listos, tu equipo todavía
no: el primer trabajo es capacitación, no un modelo»*. **No implementado**: el
motor sigue en MMA-OD v1.0 de dos ejes.

### La regla del párrafo anterior es este criterio

Releer la regla de los modelos de predicción: se proponen **solo si existe una
persona identificada con nombre que va a leer y usar el resultado**. Eso *es*
fortalecer el talento, puesto como condición de venta. Un modelo sin esa persona
es gasto en tecnología; con ella, es capacidad instalada.

### ⚠️ Disciplina de lenguaje

«Fortalecer el talento» es abstracto, y en el sitio leería como la jerga de
transformación digital que se eliminó a propósito. **En el copy va siempre
aterrizado a una persona y una tarea concretas:** no «amplificamos las
capacidades de su equipo», sino «tu jefa de operaciones deja de armar el informe
a mano y usa ese tiempo en decidir qué hacer con él».

El criterio es estratégico. El lenguaje sigue siendo concreto.

---

*Ver también: [RESTRICCIONES-CONSOLIDADAS.md](investigacion/RESTRICCIONES-CONSOLIDADAS.md) (R-3) ·
[MODELO-FASES-Y-PRECIOS.md](MODELO-FASES-Y-PRECIOS.md) ·
[GUIA-PRIMERA-ENTREVISTA-CLIENTE.md](comercial/GUIA-PRIMERA-ENTREVISTA-CLIENTE.md)*
