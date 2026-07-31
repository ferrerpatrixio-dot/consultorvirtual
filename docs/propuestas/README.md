# 📁 Sistema de Propuestas — CONSULTORAVIRTUAL

**Carpeta centralizada para gestionar la vida completa de cada cliente: desde primera reunión hasta post-implementación.**

---

## 📊 Estructura

```
/propuestas/
├── README.md (este archivo)
├── TEMPLATE/ (plantilla para nuevos clientes)
│   ├── index.html
│   ├── reunion/
│   │   ├── presentacion.html
│   │   ├── diagnostico.html
│   │   ├── valores.html
│   │   ├── flujo.html
│   │   ├── cotizacion.html
│   │   └── confidencialidad.html
│   └── expediente/
│       ├── contexto.json
│       ├── notas.md
│       ├── seguimiento.md
│       ├── mapa-procesos.md
│       └── herramientas-ia.md
│
├── SSTTErnestoAndino/ (cliente en vivo)
│   ├── index.html (puerta de entrada)
│   ├── reunion/ (documentos para la reunión)
│   └── expediente/ (historial y contexto del cliente)
│
├── [PROXIMO_CLIENTE]/
│   ├── index.html
│   ├── reunion/
│   └── expediente/
│
└── [OTRO_CLIENTE]/
    └── ...
```

---

## 🚀 Cómo Agregar un Nuevo Cliente

### Paso 1: Crear carpeta del cliente
```bash
mkdir -p /propuestas/[NOMBRE_CLIENTE]/reunion
mkdir -p /propuestas/[NOMBRE_CLIENTE]/expediente
```

**Convención de nombres:**
- Para SSTT: `SSTTNombre` (ej: `SSTTErnestoAndino`)
- Para distribuidora: `DistribuidoraNombre` (ej: `DistribuidoraTecnologías`)
- Para pyme general: `NombreEmpresa` (ej: `BerriesEsparta`)

### Paso 2: Copiar estructura desde TEMPLATE

Copiar de `/propuestas/TEMPLATE/` a `/propuestas/[NOMBRE_CLIENTE]/`:
- `index.html` → puerta de entrada
- Carpeta `reunion/` completa (6 HTML)
- Carpeta `expediente/` completa (5 archivos)

### Paso 3: Personalizar index.html

Editar `/propuestas/[NOMBRE_CLIENTE]/index.html`:
- Cambiar nombre cliente en header
- Actualizar contexto inicial (rubro, problema, etc)
- Guardar

### Paso 4: Documentar en expediente/contexto.json

Editar `/propuestas/[NOMBRE_CLIENTE]/expediente/contexto.json`:
- Datos empresa
- Contacto principal
- Problema identificado
- Oportunidades IA

### Paso 5: Actualizar expediente/seguimiento.md

Editar `/propuestas/[NOMBRE_CLIENTE]/expediente/seguimiento.md`:
- Timeline inicial
- Hitos
- Responsables

### Paso 6: Listo

Abrir en navegador:
```
file:///C:/Users/ferre/Proyectos/CONSULTORAVIRTUAL/docs/propuestas/[NOMBRE_CLIENTE]/index.html
```

---

## 📋 Qué Hay en Cada Carpeta

### `/reunion/` — Documentos para llevar a reunión

**Archivos:** 6 HTML listos para imprimir

| Archivo | Para |
|---------|------|
| `presentacion.html` | Primer contacto (qué somos) |
| `diagnostico.html` | Test MMA-OD + casos tipo |
| `valores.html` | Tabla de precios Fase 1 y 2 |
| `flujo.html` | Guión minuto a minuto |
| `cotizacion.html` | Propuesta borrador |
| `confidencialidad.html` | Contrato para firmar |

**Cómo usarlos:**
- Revisar en secuencia antes de reunión
- Imprimir o llevar en tablet
- Actualizar cotización con datos reales

---

### `/expediente/` — Vida completa del cliente

**Archivo:** `contexto.json`
- Datos estructurados del cliente
- Para consultas rápidas y análisis
- Se actualiza post-reunión

**Archivo:** `notas.md`
- Respuestas del test MMA-OD
- Información operativa levantada
- Decisión comercial
- Se llena después de reunión

**Archivo:** `seguimiento.md`
- Timeline de hitos (Fase 1, 2, etc)
- Status actual
- Blockers
- Se actualiza después de cada milestone

**Archivo:** `mapa-procesos.md`
- Diagrama del flujo actual
- Por qué puntos pasa la información
- Riesgos identificados
- Se valida en Fase 1

**Archivo:** `herramientas-ia.md`
- Qué herramientas de Productividad IA aplican
- Costo/plazo/ROI de cada una
- Cómo venderlas
- Se prepara durante Fase 1

---

## 🎯 Estados de un Cliente

| Estado | Ubicación | Documentos Clave | Responsable |
|--------|-----------|------------------|-------------|
| **Pre-Reunión** | Carpeta creada | index.html + reunion/ | Patricio |
| **Post-Reunión** | expediente/notas.md lleno | Todas las notas | Patricio |
| **En Fase 1** | seguimiento.md actualizado | mapa-procesos.md | Arquitecto |
| **En Fase 2** | seguimiento.md en implementación | herramientas-ia.md | Dev + Arquitecto |
| **Post-Implementación** | Carpeta archivada | Seguimiento final | PM |

---

## 📂 Integración con Desarrollo

**Los desarrollos NO van en /propuestas/, van en `/desarrollo/`:**

```
/desarrollo/
├── SSTTErnestoAndino-Dashboard/
├── SSTTErnestoAndino-RecepcionDigital/
├── DistribuidoraTecnologías-InventarioIA/
└── ...
```

**Pero están referenciados desde:**
- Expediente: `seguimiento.md` → links a `/desarrollo/`
- Contexto: `contexto.json` → URLs de proyectos

---

## 🔗 Relación Propuestas ↔ Desarrollo

```
/propuestas/SSTTErnestoAndino/
    ├── index.html (punto de entrada)
    └── expediente/
        └── seguimiento.md
            └── "Desarrollo: /desarrollo/SSTTErnestoAndino-Dashboard"

/desarrollo/SSTTErnestoAndino-Dashboard/
    ├── README.md
    └── "Referencia cliente: /propuestas/SSTTErnestoAndino"
```

**Los agentes pueden:**
- Trabajar en desarrollo sin entrar a propuestas
- Ver contexto del cliente visitando propuestas si necesitan
- Subir avances a `seguimiento.md`

---

## ⚡ Checklist para Nuevo Cliente

### Crear carpeta
- [ ] Crear `/propuestas/[NOMBRE]/`
- [ ] Crear subcarpetas (`reunion/`, `expediente/`)

### Copiar templates
- [ ] Copiar `index.html` del TEMPLATE
- [ ] Copiar 6 HTML de `reunion/`
- [ ] Copiar 5 archivos de `expediente/`

### Personalizar
- [ ] Editar `index.html` con nombre cliente
- [ ] Editar `contexto.json` con datos básicos
- [ ] Editar `seguimiento.md` con timeline inicial
- [ ] Editar `mapa-procesos.md` con descripción del negocio

### Compartir
- [ ] Crear link a `index.html` para Patricio
- [ ] Coordinador agrega a lista de clientes activos
- [ ] Agentes saben dónde encontrar al cliente

---

## 🏷️ Nomenclatura de Carpetas

**Regla:** `[TipoNegocio][Nombre]`

**Ejemplos válidos:**
- `SSTTErnestoAndino` (SSTT = Servicio Técnico)
- `DistribuidoraTecnologías`
- `ClínicaLaEsperanza`
- `EmpresaTrasportes`
- `CaféCostanoMañío`

**Evitar:**
- Espacios: ✗ `SSTT Ernesto Andino` → ✓ `SSTTErnestoAndino`
- Mayúsculas random: ✗ `sStt ErNeStO` → ✓ `SSTTErnestoAndino`
- Caracteres especiales: ✗ `SSTT & Andino` → ✓ `SSTTAndino`

---

## 📞 Referencia Rápida

### Abrir un cliente
```
/docs/propuestas/[NOMBRE]/index.html
```

### Ver documentos de reunión
```
/docs/propuestas/[NOMBRE]/reunion/
```

### Ver historial
```
/docs/propuestas/[NOMBRE]/expediente/seguimiento.md
```

### Ver contexto estructurado
```
/docs/propuestas/[NOMBRE]/expediente/contexto.json
```

### Ver mapa de procesos
```
/docs/propuestas/[NOMBRE]/expediente/mapa-procesos.md
```

### Ver herramientas IA aplicables
```
/docs/propuestas/[NOMBRE]/expediente/herramientas-ia.md
```

---

## 🚨 Errores Comunes

| Error | Cómo evitar |
|-------|-----------|
| Carpetas cliente en diferentes lugares | Siempre `/propuestas/[NOMBRE]/` |
| Nombres con espacios | Usar camelCase: `SSTTErnestoAndino` |
| Copiar HTML sin actualizar links | Verificar que los links relativos funcionan |
| Olvidar llenar `contexto.json` | Checklist: siempre actualizar post-reunión |
| Mezclar desarrollos con propuestas | Desarrollos en `/desarrollo/`, referencias en `/propuestas/` |

---

## 📊 Vista General de Clientes

Para ver todos los clientes actuales:
1. Abrir `/propuestas/`
2. Carpetas = clientes activos
3. En cada `index.html` está el estado actual

---

## 🔄 Flujo Típico de un Cliente

```
1. CREAR
   └─ mkdir /propuestas/[NOMBRE]/
   └─ Copiar estructura desde TEMPLATE

2. PRE-REUNIÓN
   └─ Personalizar index.html y contexto.json
   └─ Patricio revisa documentos de reunión

3. REUNIÓN
   └─ Ejecutar test MMA-OD
   └─ Llenar notas.md
   └─ Obtener decisión (Fase 1 sí/no)

4. CONTRATACIÓN
   └─ Cliente firma contrato
   └─ Actualizar contexto.json con confirmación
   └─ Actualizar seguimiento.md (inicio Fase 1)

5. FASE 1
   └─ Arquitecto + Dev levantan mapa-procesos.md
   └─ Se identifica qué herramientas IA aplican (herramientas-ia.md)
   └─ Se genera propuesta Fase 2

6. FASE 2 (si cliente dice sí)
   └─ Crear carpeta en /desarrollo/[NOMBRE]-[Proyecto]/
   └─ Dev implementa
   └─ Actualizar seguimiento.md cada milestone
   └─ Mantención mensual ($2-5K)

7. CIERRE
   └─ Archivar carpeta (o mover a /propuestas-archivadas/)
```

---

**Última actualización:** 2026-07-30  
**Responsable:** Coordinador (PM)  
**Próxima revisión:** Cuando se agregue el 2º cliente
