# 🛠️ Herramientas de Apoyo — Productividad IA

**Para:** Equipo de implementación (Arquitecto, Dev, Agentes)  
**Sobre:** Qué herramientas IA se pueden usar para Productividad en este cliente  
**Aplicable:** Mientras se ejecuta Fase 1 y 2

---

## Resumen Ejecutivo

En SSTT Ernesto Andino hay **3 casos de Productividad IA** (sin cambiar proceso) que se pueden implementar **en paralelo o como complemento** a Fase 2:

1. **Asistente de conocimiento:** Consultas sobre procedimientos de reparación
2. **Generador de reportes:** Automatizar informe diario/semanal
3. **Chat de consultas internas:** Técnicos preguntan dudas de reparación

Todos **pagan aparte** (Banda de Productividad: $5-15K) y **no requieren cambio de proceso**.

---

## 1️⃣ ASISTENTE DE CONOCIMIENTO (NotebookLM o Obsidian)

**Caso de uso:** Consultas sobre procedimientos de reparación

**Problema que resuelve:**
- Técnicos nuevos preguntan "¿Cómo se repara un iPhone X?"
- Dueño pierde tiempo explicando lo mismo
- No hay referencia centralizada

**Solución:**
- Base de conocimiento con procedimientos de reparación
- Herramienta: **NotebookLM** (Claude Lee) o **Obsidian** (local)
- Técnicos consultan en natural language: "¿Pasos para cambiar batería en Samsung?"

**Entrada (Knowledge Base):**
- Manual de procedimientos (si existe)
- O crear documento de "recetas" de reparación:
  - Modelo → Falla → Pasos
  - Tiempo estimado
  - Materiales necesarios
  - Cuidados especiales

**Salida:**
- Respuesta en lenguaje natural
- Referencias a pasos específicos

**Inversión:**
- **Tooling:** $0 (NotebookLM es gratis)
- **Preparación:** 2-4 horas (armar documentos)
- **Capacitación:** 30 min (mostrar a técnicos cómo preguntar)
- **Mantención:** Mínima (actualizar si cambian procedimientos)

**Responsable en consultora:**
- Dev o Arquitecto Junior puede armarlo

**Timeline:**
- Armado: 1 semana
- Test: 3 días
- Deploy a técnicos: 1 día

---

## 2️⃣ GENERADOR DE REPORTES DIARIOS (Claude API + Google Sheets)

**Caso de uso:** Automatizar reporte diario/semanal para gerencia

**Problema que resuelve:**
- Gerente pasa tiempo compilando datos
- Reporte manual = errores
- No hay análisis de tendencias

**Solución:**
- Script que **consulta datos del sistema** (si existe)
- **Genera reporte automático** con:
  - Cuántos reparados hoy/semana
  - Tiempo promedio
  - Por modelo
  - Alertas (ej: si hay algo > 7 días)
  - Predicción capacidad para mañana

**Entrada:**
- Datos de recepción/salida (de sistema o CSV)
- Parámetros de análisis (qué KPIs importan)

**Salida:**
- Email automático con reporte
- Formato: Tabla + gráficos
- Frecuencia: Diario 18:00 o Viernes 17:00

**Inversión:**
- **Tooling:** Claude API ($5-50/mes según volumen)
- **Dev:** 1 semana (incluye integración con sistema cliente)
- **Mantención:** Mínima (actualizar si cambian KPIs)

**Responsable en consultora:**
- Dev debe hacer esto

**Timeline:**
- Análisis de datos: 2 días
- Desarrollo: 3-4 días
- Test: 2 días
- Deploy: 1 día

---

## 3️⃣ CHAT INTERNO PARA CONSULTAS (Slack Bot o Microsoft Teams)

**Caso de uso:** Técnicos y gerencia consultan dudas rápidas sin interrumpir

**Problema que resuelve:**
- "Técnico nuevo interrumpe constantemente"
- Dueño pierde concentración
- Chats privados crean silos de información

**Solución:**
- Bot en Slack/Teams que:
  - Consulta base de conocimiento (del caso 1️⃣)
  - Responde preguntas operativas ("¿Cuántos en cola hoy?")
  - Escala a humano si no sabe

**Entrada:**
- Preguntas de técnicos en Slack
- Base de procedimientos + datos operativos

**Salida:**
- Respuesta en <5 segundos
- Opción de "Hablar con [Persona]" si es más complejo

**Inversión:**
- **Tooling:** $0-100/mes (Slack API básico)
- **Dev:** 3-5 días (integración Claude + Slack)
- **Mantención:** Mínima (monitorear preguntas nuevas)

**Responsable en consultora:**
- Dev o Arquitecto Junior

**Timeline:**
- Análisis: 1 día
- Desarrollo: 3 días
- Test: 1 día
- Deploy: 1 día

---

## Propuesta Combinada

### **Opción 1: Mínima** (Solo procedimientos)
- **Herramienta:** NotebookLM (procedimientos reparación)
- **Costo:** $5K
- **Plazo:** 1 semana
- **ROI:** Técnicos nuevos aprenden 50% más rápido

### **Opción 2: Recomendada** (Procedimientos + Reportes)
- **Herramientas:** NotebookLM + Bot de Reportes
- **Costo:** $12K
- **Plazo:** 2 semanas
- **ROI:** Gerente gana 2-3 horas/semana

### **Opción 3: Completa** (Todo)
- **Herramientas:** NotebookLM + Bot de Reportes + Slack Bot
- **Costo:** $15K
- **Plazo:** 3 semanas
- **ROI:** Flujo de comunicación más eficiente + menos interrupciones

---

## Cómo Vender Estas Herramientas

### A Técnicos
> "Van a tener un asistente que responde preguntas de reparación al instante. No necesitan estar interrumpiendo. Aprenden más rápido los nuevos."

### A Gerencia
> "Reporte diario automático. Ya no pasas 1 hora compilando datos. Además, alertas si algo se atrasa. Eso es $X que ganas/semana en tu tiempo."

### A Dueño
> "Reducimos interrupciones. Técnicos consultan bot, no al jefe. Equipo es más autónomo. Reportes más precisos para decisiones."

---

## Integración con Fase 2

**Si cliente contrata Fase 2 (Dashboard/Automatizar):**

- Las herramientas de Productividad **son complementarias**
- Se pueden hacer **en paralelo** durante Fase 2
- El **Dashboard de Fase 2** alimenta algunos datos al Bot de Reportes

**Timeline recomendado:**
1. Semana 1-2: Inicio Fase 2 (Dashboard) + Inicio Productividad (NotebookLM)
2. Semana 3: Bot de Reportes conectado a Dashboard
3. Semana 4+: Slack Bot opcional (si tiempo permite)

---

## Responsables en Consultora

| Herramienta | Arquitecto | Dev | QA | PM |
|---|---|---|---|---|
| **NotebookLM** | Valida estructura | Prepara docs | Prueba UX | Coordina |
| **Bot Reportes** | Diseña lógica | Implementa | Valida datos | Coordina |
| **Slack Bot** | Diseña lógica | Implementa | Valida | Coordina |

---

## Documento de Configuración (llenar en Fase 1)

### Datos del Cliente para Productividad IA

**Procedimientos de reparación:**
- [ ] Documentos existen: Sí / No / Parcial
- [ ] Ubicación: [A llenar]
- [ ] Formatos: PDF / Word / [A llenar]
- [ ] Calidad: [A llenar] (legible, estructurada, etc)

**KPIs para Reportes:**
- Métrica 1: [A llenar]
- Métrica 2: [A llenar]
- Métrica 3: [A llenar]
- Frecuencia: Diario / Semanal / [A llenar]

**Acceso a datos:**
- [ ] Sistema tiene API
- [ ] Puedo acceder con credenciales cliente: Sí / No
- [ ] Datos en Excel/CSV: Sí / No
- [ ] Necesito ETL personalizado: Sí / No

**Comunicación del cliente:**
- [ ] Usa Slack
- [ ] Usa Microsoft Teams
- [ ] Usa WhatsApp
- [ ] Otra: [A llenar]

---

## Versión de Venta Simple

Si cliente pregunta "¿Hay algo rápido y barato que podamos implementar ahora?"

**Respuesta:**
> "Sí. Mientras hacemos el diagnóstico (Fase 1), podemos preparar un asistente de IA para que tus técnicos consulten procedimientos de reparación. Cuesta $5K, se hace en 1 semana, y te ahorra tiempo de capacitación en nuevos técnicos. ¿Te interesa?"

---

**Versión:** 1.0  
**Próxima revisión:** Post-Fase 1 (adaptar según cliente real)  
**Responsable de mantener:** Arquitecto / PM
