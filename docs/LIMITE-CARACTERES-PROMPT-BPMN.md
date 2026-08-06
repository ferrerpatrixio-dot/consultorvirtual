# Límite de caracteres del prompt — generador-bpmn (Mapea)

**Fecha:** 2026-08-05
**Autor:** ARQUITECTO IT
**Alcance:** `promptSchema.prompt` en `src/app/(app)/actions.ts` (hoy: `z.string().trim().min(20, ...)`, sin máximo) y el textarea en `NuevoDiagramaIAForm.tsx`.

## 1. Investigación de patrón de UX (herramientas comparables)

- **ChatGPT (web):** no hay un contador visible en el input principal, pero el paste de más de ~5.000 caracteres se convierte automáticamente en archivo adjunto en vez de texto plano — señal implícita de "esto ya es demasiado para un prompt normal".
- **Patrón general de formularios con contador** (USWDS Character Count component, y la práctica más citada en guías de diseño): contador de texto pequeño, alineado a la derecha bajo el campo (no dentro del textarea), formato `X / máximo`. Se mantiene en color neutro la mayor parte del tiempo; cambia a color de advertencia (ámbar/naranja) cerca del límite (patrón común: últimos ~10-20% del máximo) y a color de error (rojo) al llegar o pasar el límite.
- **Comportamiento al límite:** el patrón dominante es **bloquear con `maxLength`** en el textarea (no se puede seguir escribiendo, sin mensaje de error disruptivo) en vez de dejar escribir y luego rechazar en submit. Es la opción de menor fricción: el usuario nunca pierde texto ni ve un error después de escribir de más.
- No encontré información pública específica de Just Flow It, BPMNify, Patchley o BA Copilot sobre límites de caracteres de su input — no publican ese detalle de UI.

## 2. Costo real: prompt largo vs. típico

Base confirmada en `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`: ~USD 0,0065 por llamada con ~1.500 tokens de entrada (Haiku 4.5). De ahí el costo marginal por token de entrada es de fracciones de centavo:

| Prompt | Caracteres | Tokens aprox. (÷4) | Costo entrada aprox. |
|---|---|---|---|
| Típico | 1.000 | 250 | ~USD 0,0011 |
| Propuesto como máximo | 4.000 | 1.000 | ~USD 0,0043 |
| Extremo sin límite | 20.000 | 5.000 | ~USD 0,0217 |

La diferencia entre un prompt típico y uno de 4.000 caracteres es de **décimas de centavo por diagrama** — no justifica por sí sola un límite. El output (`max_tokens: 8000`, JSON estructurado) domina el costo real de la llamada y no cambia mucho con el largo del prompt. **Conclusión: el límite no se justifica por costo, se justifica por UX y por calidad del resultado.**

## 3. Riesgo de "desborde del entregable"

Revisé `src/lib/mermaid-render.ts` y `src/lib/exportar-bpmn.ts`: **no hay ningún límite duro de actores o pasos en el código** — ambos iteran sobre arrays sin tope. No hay nada que "rompa" técnicamente (no crashea, no genera XML inválido) con un diagrama grande. El riesgo real es **degradación de calidad, no falla técnica**:

- **Mermaid:** un flowchart con 40-50+ nodos en carriles por actor se vuelve ilegible en pantalla (mucho scroll, cruces de líneas), aunque renderiza sin error.
- **Exportación BPMN:** ya hay una limitación documentada y aceptada (`exportar-bpmn.ts` líneas 17-33): `bpmn-auto-layout` no dibuja los recuadros de Lane. Con pocos actores/pasos el impacto visual es menor; con un diagrama muy grande, la ausencia de carriles visibles sobre un layout denso hace el resultado bastante más confuso.
- Un prompt de varios miles de caracteres tiende a producir más actores y pasos (más "eventos" narrados = más nodos extraídos), así que el largo del prompt es un proxy razonable — aunque imperfecto — del tamaño del diagrama resultante.

No es un límite técnico "duro" (nada se desborda ni crashea), es un límite de **calidad de entregable**: un prompt corto acotado empuja hacia diagramas del tamaño que el editor y el export ya manejan bien hoy.

## 4. Recomendación

**Máximo: 4.000 caracteres, igual para trial y para plan pago.**

- **Por qué 4.000 y no otro número:** es ~8-10x el prompt típico observado en el placeholder del propio formulario (proceso de 4-5 pasos narrados en un párrafo), suficiente para describir un proceso de negocio real y detallado (10-20 pasos, 3-5 actores) sin abrir la puerta a que alguien pegue un manual completo o un documento entero. Es también el orden de magnitud del umbral que ChatGPT usa para tratar un input como "ya no es un prompt normal" (~5.000 caracteres).
- **Por qué no distinto para trial:** ya está resuelto por una decisión de negocio anterior, no hace falta duplicarla acá. Según `docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md` sección 8, el trial de 3 días ya bloquea la creación de más de **un** diagrama nuevo (solo puede editar el que generó con su primer prompt). Eso ya limita la exposición de costo del trial a una sola llamada — un límite de caracteres más estricto para el trial no reduciría nada que no esté reducido ya, y sí agregaría una inconsistencia de UI sin motivo.
- **Patrón de UI:** contador `X / 4.000` en texto pequeño, alineado a la derecha, debajo del textarea (mismo lugar donde ya vive el texto de ayuda "La IA puede interpretar mal algo ambiguo..." — puede ir en la misma línea o inmediatamente encima). Color neutro (`text-ink-2`, ya usado en el form) hasta ~3.600 caracteres (90%); ámbar de ahí hasta 4.000; al llegar a 4.000, `maxLength={4000}` en el `<textarea>` bloquea que se siga escribiendo — sin mensaje de error, consistente con el patrón dominante encontrado en la investigación.

## Fuentes
- [Character count | U.S. Web Design System (USWDS)](https://designsystem.digital.gov/components/character-count/)
- [Character count design: some guidelines](https://www.breck-mckye.com/blog/2012/05/character-count-design-some-guidelines/)
- [Does ChatGPT have a character limit? Here's how to bypass it](https://www.androidauthority.com/chatgpt-character-limit-3292997/)
- [What Is the Character Limit for ChatGPT?](https://www.howtogeek.com/895929/what-is-the-character-limit-for-chatgpt/)
