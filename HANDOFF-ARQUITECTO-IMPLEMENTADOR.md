# 🔀 HANDOFF: ARQUITECTO → IMPLEMENTADOR

**Objetivo:** que un modelo menos capaz (Sonnet barato / Nemotron / local) pueda
ejecutar sin supervisión línea a línea, y que el ARQUITECTO (Opus/Sonnet caro)
revise el resultado en vez de escribirlo.

**Se usa junto con:**
[ADMINISTRADOR-EFICIENCIA-TOKENS.md](ADMINISTRADOR-EFICIENCIA-TOKENS.md) (cuándo
escalar de modelo) y
[ASIGNACION-MODELOS-PENSAMIENTO-AGENTES.md](ASIGNACION-MODELOS-PENSAMIENTO-AGENTES.md)
(modelo base por agente). Este documento no reemplaza esos dos — es la
plantilla que el ARQUITECTO llena para delegar una tarea puntual.

---

## 📋 PLANTILLA

Copiar en cada handoff real (no es un archivo único que se reescribe: uno por
tarea, o una sección por tarea en el archivo de estado del proyecto):

```markdown
# HANDOFF · [nombre corto de la tarea] · [fecha]

## Objetivo
[Una frase, medible. "Cambia X para que Y" — no "mejora X".]

## Inputs
- [Ruta a archivo canónico 1]
- [Ruta a archivo canónico 2]
- [Datos crudos si aplica — capturas, JSON, etc.]

## Outputs esperados
- [Archivo/ruta exacta 1] — [qué debe contener]
- [Archivo/ruta exacta 2] — [qué debe contener]

## Constraints
- [Sección de STANDARDS.md o doc equivalente que aplica]
- [Qué NO tocar — archivos fuera de alcance]

## Criterios de aceptación
- [ ] [Checklist binario — existe / valida / pasa test. Nada de "se ve bien".]
- [ ] [...]

## Contexto mínimo
- [Qué archivos de organizacionvirtual/agentes/ debe leer — solo los relevantes]

## Modelo recomendado para ejecutar esto
[Haiku/Sonnet/Nemotron-local — con la razón, según la matriz de
ADMINISTRADOR-EFICIENCIA-TOKENS.md]
```

---

## 🔄 CICLO

```
1. ARQUITECTO (yo, modelo caro)
   └─ Clasifica la tarea (ver checklist de dificultad abajo)
   └─ Si es delegable: llena el handoff arriba
   └─ Si no es delegable (ambigüedad real, trade-offs, riesgo alto): la hace
      directamente, no delega

2. IMPLEMENTADOR (modelo barato)
   └─ Ejecuta SOLO con el handoff + los inputs listados
   └─ No improvisa fuera de "Constraints"
   └─ Si algo en el handoff es ambiguo, no adivina: lo marca y detiene

3. ARQUITECTO
   └─ Revisa contra "Criterios de aceptación" (binario, no impresión)
   └─ ✅ Aprueba, o ❌ devuelve con feedback puntual (qué criterio falló)

4. Registro
   └─ Se anota en la bitácora del proyecto: tarea, modelo usado, resultado
      (aprobado / devuelto N veces), para alimentar el reporte mensual de
      ADMINISTRADOR-EFICIENCIA-TOKENS.md §MONITOREO
```

---

## 🚦 CHECKLIST DE DIFICULTAD — ¿esto es delegable?

Antes de escribir el handoff, contestar (mismo criterio que
`ADMINISTRADOR-EFICIENCIA-TOKENS.md`, aplicado ANTES de ejecutar, no después):

```
□ ¿La tarea tiene una sola interpretación razonable?
□ ¿El criterio de "terminado" es verificable sin juicio subjetivo?
□ ¿Los inputs están completos (no hay que ir a preguntarle a alguien)?
□ ¿Un error acá es barato de corregir?
□ ¿No requiere leer y conciliar 3+ documentos con posible contradicción entre sí?

5 SÍ → delegable a modelo barato con este handoff
3-4 SÍ → delegable, pero el ARQUITECTO revisa más de cerca
0-2 SÍ → el ARQUITECTO la hace directo, no delega
```

---

## ⚠️ SEÑALES DE ALARMA (de lo que ya se ha visto fallar)

| Síntoma | Causa típica | Ajuste |
|---|---|---|
| Implementador ignora un agente relevante | El handoff no lo listó en "Contexto mínimo" | Listar explícitamente los agent READMEs necesarios |
| Formatos inventados / alucinados | Faltan ejemplos concretos en el handoff | Pegar 1-2 ejemplos reales dentro del handoff, no solo describir el formato |
| El ARQUITECTO termina reescribiendo todo | "Criterios de aceptación" eran vagos | Reescribir como checklist binario antes de delegar de nuevo |
| Se pierde qué se decidió tras un salto de contexto | Nadie actualizó el estado antes del salto | Ver regla de disparo en `docs/BITACORA-CAMBIOS.md` de cada proyecto — actualizar antes de compactar, antes de cambiar de modelo, o pasado ~85% de uso de contexto |

---

*Dueño del documento: PROJECT MANAGER (Coordinador).*
*Versión 1.0 — 2026-07-30.*
