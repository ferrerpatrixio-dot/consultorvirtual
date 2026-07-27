# skill-bpmn-architect

Transforma requerimientos de datos en diagramas BPMN 2.0 ejecutables con lógica de resiliencia y semántica visual.

## Instalación

```bash
npx skills add JefferCB1/skill-bpmn-architect
```

## Uso

Esta skill recibe un JSON con Actores, Triggers y Pasos lógicos, y genera un diagrama BPMN 2.0 con:

- Carriles (Swimlanes) por cada Actor
- Nodos: START_EVENT, END_EVENT, USER_TASK, SERVICE_TASK, GATEWAY_XOR, ERROR_EVENT
- Semántica visual (regla 60-30-10): verde (happy path), rojo (errores), ámbar (decisiones), azul (tareas usuario), gris (tareas sistema)
- Estrategia de resiliencia para APIs externas (Exponential Backoff + Jitter)
- Validación de idempotencia

## Output

```json
{
  "diagram_title": "string",
  "nodes": [...],
  "edges": [...],
  "resilience_summary": "string",
  "pending_questions": ["string"]
}
```
