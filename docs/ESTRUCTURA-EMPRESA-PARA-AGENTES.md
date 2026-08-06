# Estructura de CONSULTORAVIRTUAL en disco — para cualquier agente (Hermes u otro)

**Propósito de este documento:** si un agente de IA distinto (ej. Hermes) recibe una tarea que
toca archivos de esta empresa, debe leer esto primero. **No reorganices, renombres ni muevas
carpetas de esta estructura sin que Patricio lo pida explícitamente** — se definió y ordenó el
2026-08-05 después de que una migración anterior quedó a medio hacer y generó confusión real.

---

## Regla de oro

**CONSULTORAVIRTUAL es la empresa (agencia). Sus productos propios y el trabajo que hace para
terceros (clientes) son cosas distintas y NO se mezclan en la misma carpeta.**

```
C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\
```

Es la ÚNICA carpeta viva de la empresa. Cualquier otra carpeta con nombres parecidos
("PROCESOS BPMN", "aiprocess" fuera de acá, etc.) es un residuo histórico, no la fuente de
verdad — si aparece una duda de "¿dónde está lo real?", es siempre acá.

---

## Mapa de carpetas (nivel 1, no tocar la forma sin permiso)

| Carpeta | Qué es | Quién la toca |
|---|---|---|
| `sistemaaiprocess/` | Producto propio: diagnóstico de madurez de procesos (MMA-OD) | DEV, ARQUITECTO IT |
| `misitioweb/` | Producto propio: sitio web institucional, `aiprocess.cl` | DEV, PRODUCT MANAGER |
| `generador-bpmn/` | Producto propio: "Mapea", generador de diagramas BPMN por IA, en producción en `mapea.aiprocess.cl` | DEV, ARQUITECTO IT |
| `organizacionvirtual/` | Estructura de la agencia: roster de agentes, organigrama, matriz de responsabilidades | Solo PMcoordinador |
| `docs/` | Documentación **de la empresa** (estrategia, decisiones, docs de referencia técnica reutilizables) | Todos los agentes, cada uno en su dominio |
| `docs/propuestas/` | Sistema de gestión de clientes — ver sección propia abajo | PMcoordinador, PRODUCT MANAGER |
| `clientes/` | (si existe) Entregables reales para terceros que no son "propuestas" sino trabajo ya contratado | DEV, según el proyecto |
| `.claude/` | Configuración de agentes de Claude Code para toda la empresa | No tocar sin instrucción explícita de Patricio |

---

## `docs/propuestas/` — cómo funciona (NO improvisar otra estructura)

Ya existe una convención completa y documentada en `docs/propuestas/README.md` — **leerla
entera antes de crear o mover nada acá**. Resumen:

```
docs/propuestas/
├── README.md                    ← la convención completa, fuente de verdad
├── TEMPLATE/                    ← plantilla GENÉRICA y VACÍA, reutilizable para cualquier
│                                   cliente nuevo. NO llenar con datos de un cliente real acá
│                                   — copiar a una carpeta nueva primero (ver Paso 1 del README)
├── [NombreCliente]/             ← un cliente real en vivo (ej. SSTTErnestoAndino)
│   ├── index.html
│   ├── reunion/                 ← 7 HTML para la reunión (presentación, diagnóstico, etc.)
│   └── expediente/               ← notas, seguimiento, contexto — vida completa del cliente
```

**Regla de nomenclatura de cliente:** `[TipoNegocio][Nombre]` sin espacios, ej.
`SSTTErnestoAndino`, `DistribuidoraTecnologías` — el detalle completo está en el README.

**Los desarrollos de Fase 2 (una vez contratados) NO van acá — van en `/desarrollo/[Cliente]-
[Proyecto]/`** (carpeta raíz de la empresa, no dentro de `docs/`).

---

## Acceso directo de escritorio

`Reunion Cliente (Plantilla).lnk` en el escritorio de Windows apunta a
`docs/propuestas/TEMPLATE/index.html` — es la puerta de entrada para armar una reunión nueva.
No borrar ni redirigir a otro archivo sin avisar a Patricio.

---

## Qué NO hacer, nunca, sin confirmar con Patricio primero

- ❌ Renombrar o mover `sistemaaiprocess/`, `misitioweb/`, `generador-bpmn/`,
  `organizacionvirtual/`.
- ❌ Crear una carpeta de cliente nueva sin seguir la convención de `docs/propuestas/README.md`.
- ❌ Llenar `docs/propuestas/TEMPLATE/` con datos de un cliente real — es la plantilla vacía,
  se copia, no se edita in situ.
- ❌ Mezclar código de un producto (`generador-bpmn/`, `sistemaaiprocess/`, etc.) con contenido
  de `docs/propuestas/` o `clientes/` — son cosas distintas.
- ❌ Tocar `PROCESOS BPMN\` (la carpeta vieja fuera de `CONSULTORAVIRTUAL`) — es un residuo
  histórico pendiente de limpieza manual por Patricio, no de uso activo.

Si una tarea que te pidieron parece requerir romper alguna de estas reglas, **pará y
preguntale a Patricio explícitamente** antes de hacerlo — no asumas que la excepción está
justificada.

---

**Última actualización:** 2026-08-05, tras una sesión de reorganización completa. Si esta
estructura cambia en el futuro, quien la cambie debe actualizar este documento en el mismo
commit/sesión — no dejarlo desactualizado (es exactamente el problema que causó la confusión
que se resolvió hoy).
