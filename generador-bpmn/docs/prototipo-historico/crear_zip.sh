#!/bin/bash

# Crear directorio de salida
mkdir -p ENTREGA_FINAL

# Copiar archivos principales
cp BPMN_ARQUITECTONICO_RECEPCION_EQUIPOS.pdf ENTREGA_FINAL/
cp BPMN_RECEPCION_EQUIPOS_ARQUITECTONICO.json ENTREGA_FINAL/
cp BPMN_ARQUITECTONICO_VISUAL.html ENTREGA_FINAL/

# Copiar archivos complementarios
cp flujo_recepcion_equipos.bpmn ENTREGA_FINAL/
cp Documento_Recepcion_Equipos.pdf ENTREGA_FINAL/
cp BPMN_Recepcion_Equipos.pdf ENTREGA_FINAL/
cp Comparativa_BPMN_Skills.pdf ENTREGA_FINAL/

# Copiar HTMLs
cp bpmn_profesional.html ENTREGA_FINAL/
cp diagrama_bpmn_profesional.md ENTREGA_FINAL/
cp diagrama_limpio.html ENTREGA_FINAL/
cp flujo_recepcion_equipos_documento.html ENTREGA_FINAL/

# Crear README
cat > ENTREGA_FINAL/README.md << 'READMEEOF'
# 📦 RECEPCIÓN Y VALIDACIÓN DE EQUIPOS - ENTREGA COMPLETA

## 🎯 ARCHIVO PRINCIPAL (START HERE)
- **BPMN_ARQUITECTONICO_RECEPCION_EQUIPOS.pdf** ← ⭐ COMIENZA AQUÍ
  - Diagrama BPMN 2.0 completo
  - Resiliencia integrada
  - Reglas de negocio
  - Preguntas pendientes identificadas

## 🔧 ARCHIVOS EJECUTABLES
- **BPMN_RECEPCION_EQUIPOS_ARQUITECTONICO.json**
  - Estructura JSON lista para implementación
  - Puede importarse en Camunda, Bonita, etc.
  - Incluye metadatos técnicos (retry, idempotencia)

- **flujo_recepcion_equipos.bpmn**
  - Formato BPMN 2.0 XML estándar
  - Compatible con cualquier herramienta BPMN

## 🌐 VERSIONES INTERACTIVAS
- **BPMN_ARQUITECTONICO_VISUAL.html** 
  - Diagrama interactivo en navegador
  - Métricas y análisis integrados

- **bpmn_profesional.html**
  - Versión Mermaid profesional
  - Muy legible y visual

- **diagrama_limpio.html**
  - Diagrama simple sin traslapos

- **diagrama_bpmn_profesional.md**
  - PlantUML Markdown
  - Editable con cualquier editor

## 📊 DOCUMENTACIÓN
- **Documento_Recepcion_Equipos.pdf** (7 páginas)
  - Especificación completa del proceso
  - Criterios de aceptación
  - Tablas de control

- **BPMN_Recepcion_Equipos.pdf**
  - Diagrama visual con metadatos

- **Comparativa_BPMN_Skills.pdf**
  - Análisis BPMN Architect vs PlantUML

## 📋 ESTRUCTURA DEL PROCESO

### Actores:
1. **Distribuidor** - Trae camión con equipos
2. **Guardián** - Valida entrada
3. **Bodeguero/Administrativo** - Verifica y SAP
4. **Supervisor** - Resuelve discrepancias

### Flujos:
- ✅ Camino feliz (todo OK)
- ⚠️ Camino de discrepancias (errores)
- 🔄 Loops (reintentos automáticos)
- 📌 Escaladas (Supervisor → Gerencia)

### Puntos Críticos:
1. ✅ Validación documentación
2. ✅ Verificación cantidades
3. ✅ Verificación modelos
4. ✅ Inspección daños
5. ✅ Pistolaje individual (SAP)
6. ✅ Comparación físico=SAP
7. ✅ Resolución de discrepancias

## 🚀 CÓMO USAR

### Para Visualizar:
```
1. Abre cualquier archivo .html en navegador
2. BPMN_ARQUITECTONICO_VISUAL.html es recomendado
```

### Para Implementar:
```
1. Usa BPMN_RECEPCION_EQUIPOS_ARQUITECTONICO.json
2. Importa en tu herramienta BPMN favorita
3. Implementa según las reglas de negocio
```

### Para Auditoría:
```
1. Revisa BPMN_ARQUITECTONICO_RECEPCION_EQUIPOS.pdf
2. Verifica preguntas pendientes
3. Asegura compliance con reglas
```

## 📝 CARACTERÍSTICAS PRINCIPALES

### Resiliencia Integrada:
- ✅ Exponential Backoff + Jitter para SAP
- ✅ Max 3 reintentos (1s inicial)
- ✅ Validación física obligatoria
- ✅ Supervisor como punto de control

### Reglas Críticas:
- 🔴 NO ingreso masivo en SAP
- 🔴 Pistolaje OBLIGATORIO
- 🔴 Guía firmada = contrato
- 🔴 Una discrepancia = revisión total

### Métricas:
- 27 nodos
- 31 conexiones
- 4 carriles
- 7 decisiones
- 2 loops
- 8 preguntas pendientes

## ❓ PRÓXIMOS PASOS

Revisar y responder las 8 preguntas pendientes:
1. Timeout máximo para reintentos SAP
2. Límite reintentos en loop Pistolaje
3. Log de auditoría separado
4. Auto-resolución del Supervisor
5. Identidad del Gerente + SLA
6. Notificación distribuidor si rechazo
7. Rollback automático SAP
8. Tiempo espera distribuidor

## 📧 CONTACTO
Para preguntas o ajustes, referirse a la sección de preguntas pendientes en el PDF.

---
**Version:** 1.0 | **Status:** Production-Ready | **Formato:** BPMN 2.0
READMEEOF

echo "✅ Archivos preparados en ENTREGA_FINAL/"
ls -lh ENTREGA_FINAL/
