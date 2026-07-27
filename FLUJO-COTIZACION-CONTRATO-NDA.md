# 📋 FLUJO: Cotización → Contrato → NDA → Firma

**Proceso completo para generar entregables comerciales**  
**Responsable:** Agente COMERCIAL  
**Visa con:** Técnicos + Legal + Financiero + PM  

---

## 🔄 FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENTE INTERESADO EN PROYECTO                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │ PASO 1: COMERCIAL RECOPILA │
            │ - Requerimientos cliente   │
            │ - Alcance inicial          │
            │ - Timeline esperado        │
            │ - Budget aproximado        │
            └────────────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐         ┌────────┐        ┌──────────┐
    │ARQUITECTO│        │ DEV    │        │ QA       │
    │Visa      │        │Visa    │        │Visa      │
    │alcance   │        │costos+ │        │timeline  │
    │técnico   │        │tiempo  │        │testing   │
    └──────┬───┘        └───┬────┘        └────┬─────┘
           │                │                   │
           └────────────────┼───────────────────┘
                            │
                            ▼
            ┌────────────────────────────┐
            │ PASO 2: COMERCIAL PREPARA  │
            │ - COTIZACIÓN               │
            │   * Alcance detallado      │
            │   * Precio desglosado      │
            │   * Timeline               │
            │   * Hitos de pago          │
            └────────────────┬───────────┘
                             │
                             ▼
            ┌────────────────────────────┐
            │ VISA: PRODUCT MANAGER      │
            │ ¿OK financiero?            │
            │ ¿OK revenue?               │
            │ ¿OK oportunidad?           │
            └────────────────┬───────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │ SÍ ✅                                   │ NO ❌
        │                                        │
        ▼                                        ▼
   CONTINÚA                              RECHAZA COTIZACIÓN
                                         Vuelve a PASO 2
        │
        ▼
    ┌─────────────────────────────┐
    │ PASO 3: COMERCIAL + LEGAL   │
    │ - Redactan CONTRATO         │
    │   * Términos técnicos        │
    │   * Condiciones comerciales  │
    │   * Cláusulas de pago       │
    │   * Responsabilidades       │
    │ - Redactan NDA              │
    │   * Confidencialidad        │
    │   * Protección de datos     │
    │   * Propiedad intelectual   │
    └────────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ VISA: SECURITY             │
        │ ¿Cumple Ley 19.628?        │
        │ ¿OK GDPR si aplica?        │
        │ ¿OK ISO 27001 si aplica?   │
        └────────────────┬───────────┘
                         │
        ┌────────────────┴────────────┐
        │ SÍ ✅                       │ NO ❌
        │                             │
        ▼                             ▼
   CONTINÚA                    LEGAL ajusta NDA
                               Vuelve a SECURITY
        │
        ▼
    ┌──────────────────────────────┐
    │ VISA: LEGAL                  │
    │ ¿Contratos OK legalmente?    │
    │ ¿NDA OK legalmente?          │
    │ ¿Términos protegen empresa?  │
    └────────────────┬─────────────┘
                     │
        ┌────────────┴───────────┐
        │ SÍ ✅                  │ NO ❌
        │                        │
        ▼                        ▼
   CONTINÚA                 REVISA + AJUSTA
                            Vuelve a firma
        │
        ▼
    ┌──────────────────────────────┐
    │ VISA: PROJECT MANAGER (YO)   │
    │ ¿Timelines realistas?        │
    │ ¿Recursos disponibles?       │
    │ ¿Equipo puede ejecutar?      │
    └────────────────┬─────────────┘
                     │
        ┌────────────┴───────────┐
        │ SÍ ✅                  │ NO ❌
        │                        │
        ▼                        ▼
   CONTINÚA            RENEGOCIA TIMELINE
                       Vuelve a COMERCIAL
        │
        ▼
    ┌────────────────────────────┐
    │ PASO 4: PROPUESTA FINAL    │
    │ - Consolida:               │
    │   * Cotización             │
    │   * Contrato de Servicios  │
    │   * Acuerdo NDA            │
    │ - Prepara dossier          │
    │ - Correo de presentación   │
    └────────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ PASO 5: PATRICIO FIRMA     │
        │ ✅ Firma contrato          │
        │ ✅ Firma NDA               │
        │ ✅ Envía a cliente         │
        └────────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │ CLIENTE RECIBE + FIRMA     │
            └────────────────┬───────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ PROYECTO INICIA│
                    │ PROJECT MANAGER│
                    │coordina equipo │
                    └────────────────┘
```

---

## 📋 PASO 1: COMERCIAL Recopila

**Responsable:** Agente COMERCIAL

**Fuentes de información:**
- Brief de cliente (reunión inicial)
- Requerimientos detallados
- Conversaciones con Patricio

**Entregables:**
```
□ Documento: "Requerimientos Proyecto [CLIENTE]"
  - Qué quiere cliente
  - Alcance (in-scope vs out-of-scope)
  - Timeline esperado
  - Budget disponible
  - Stakeholders
```

---

## 📊 PASO 2: COMERCIAL Prepara COTIZACIÓN

**Responsable:** Agente COMERCIAL  
**Input de:** ARQUITECTO + DEV + QA

**Arquitectura:**
- ARQUITECTO estima: horas diseño, complejidad, riesgos

**Costos:**
- DEV estima: horas implementación, recursos, herramientas
- COMERCIAL calcula: Precio = (Horas × $$/hora) + Contingency (10-15%)

**Timeline:**
- QA estima: horas testing, sprints, go-live
- COMERCIAL consolidada: Semana inicio → Semana fin

**Entregables:**
```
COTIZACIÓN FORMAL:
┌──────────────────────────────────────┐
│ [CLIENTE] - PROPUESTA COMERCIAL       │
├──────────────────────────────────────┤
│ ALCANCE                              │
│ - Feature 1: descripción             │
│ - Feature 2: descripción             │
│ - Nivel de Madurez: [0-5]            │
│                                      │
│ PRECIO DESGLOSADO                    │
│ - Diseño (ARQUITECTO): $X            │
│ - Implementación (DEV): $Y           │
│ - Testing (QA): $Z                   │
│ - Contingency (10%): $C              │
│ ──────────────────────────────────── │
│ TOTAL: $[TOTAL]                      │
│                                      │
│ TIMELINE                             │
│ - Inicio: [Fecha]                    │
│ - Hito 1: [Fecha]                    │
│ - Hito 2: [Fecha]                    │
│ - Go-live: [Fecha]                   │
│                                      │
│ HITOS DE PAGO                        │
│ - Firma: 50% = $[X]                  │
│ - MVP: 30% = $[Y]                    │
│ - Go-live: 20% = $[Z]                │
└──────────────────────────────────────┘
```

**Visa con PRODUCT MANAGER:**
```
PREGUNTAS:
□ ¿Precio competitivo vs mercado?
□ ¿Margen suficiente (>40%)?
□ ¿Revenue proyecto OK?
□ ¿Oportunidad estratégica?
□ ¿Align con roadmap?

SI "NO" a cualquiera:
→ Vuelve a COMERCIAL, renegocia
```

---

## 📑 PASO 3: COMERCIAL + LEGAL Redactan

### CONTRATO DE SERVICIOS

**Elementos:**
```
1. PARTES
   - CONSULTORAVIRTUAL
   - CLIENTE

2. OBJETO
   - Descripción servicios
   - Alcance detallado (copy de cotización)
   - Nivel de madurez

3. PRECIO Y PAGO
   - Total confirmado
   - Desglose (opcional)
   - Hitos y fechas pago
   - Términos: contado/30 días/60 días

4. RESPONSABILIDADES
   - CONSULTORAVIRTUAL: qué entrega
   - CLIENTE: acceso a datos, feedback, recursos

5. TIMELINE
   - Inicio: [Fecha]
   - Término: [Fecha]
   - Hitos intermedios

6. GARANTÍAS
   - CONSULTORAVIRTUAL: trabajo profesional, cumple estándares
   - Limitaciones de responsabilidad

7. TERMINACIÓN
   - Causas de terminación
   - Indemnización por término anticipado

8. JURISDICCIÓN
   - Ley Chile
   - Juzgados de Santiago o cliente
```

### ACUERDO DE CONFIDENCIALIDAD (NDA)

**Referencia:** `TEMPLATE-NDA-CONFIDENCIALIDAD.md`

**Elementos:**
```
1. INFORMACIÓN CONFIDENCIAL
   - Definición clara
   - Tipos de datos

2. PROTECCIÓN
   - Duración (3 años post-proyecto)
   - Medidas de seguridad
   - Cómo manejar datos

3. LEY 19.628
   - Protección de datos personales
   - Cumplimiento requerimientos

4. PROPIEDAD INTELECTUAL
   - IP preexistente: cada Parte retiene
   - Trabajos derivados: CONSULTORAVIRTUAL propietaria

5. EXCLUSIONES
   - Información pública
   - Requerida por ley

6. REMEDIOS
   - Injunction si hay violación
   - Notificación 48 horas
```

**Visa con SECURITY:**
```
CHECKLIST:
□ ¿Cumple Ley 19.628 Chile?
□ ¿OK protección de datos?
□ ¿Encriptación SHA-256 + salt?
□ ¿Hashing irreversible de IPs?
□ ¿Auditoría de acceso documentada?
□ ¿NO plaintext en logs?

SI "NO" a cualquiera:
→ LEGAL ajusta NDA
→ Vuelve a SECURITY
```

**Visa con LEGAL:**
```
CHECKLIST:
□ ¿Contratos legalmente válidos en Chile?
□ ¿Protegen CONSULTORAVIRTUAL?
□ ¿NDA protege confidencialidad?
□ ¿Cláusulas claras y ejecutables?
□ ¿Jurisdicción correcta?

SI "NO" a cualquiera:
→ LEGAL revisa + ajusta
→ Vuelve a firma
```

**Entregables:**
```
□ Contrato de Servicios (firmable)
□ Acuerdo NDA (firmable)
□ Términos claros
□ Protecciones legales
```

---

## ⏰ PASO 4: COMERCIAL Consolida PROPUESTA FINAL

**Responsable:** Agente COMERCIAL

**Documentos a incluir:**
```
1. COTIZACIÓN (Paso 2)
2. CONTRATO DE SERVICIOS (Paso 3)
3. ACUERDO NDA (Paso 3)
4. EMAIL de presentación (redactado por COMERCIAL)
5. TÉRMINOS Y CONDICIONES (si aplica)
```

**Visa con PROJECT MANAGER (yo):**
```
CHECKLIST:
□ ¿Timelines son realistas?
□ ¿Equipo disponible?
□ ¿Recursos necesarios?
□ ¿Puedo ejecutar en esos tiempos?

SI "NO":
→ COMERCIAL renegocia timeline con cliente
→ Vuelve a Paso 2
```

**Dossier Final:**
```
CARPETA: [CLIENTE] - Propuesta [FECHA]
├─ 01_COTIZACION.pdf
├─ 02_CONTRATO_SERVICIOS.docx
├─ 03_ACUERDO_NDA.docx
├─ 04_EMAIL_PRESENTACION.txt
└─ 05_TERMINOS_CONDICIONES.pdf (si aplica)
```

---

## ✍️ PASO 5: PATRICIO FIRMA

**Responsable:** Patricio Ferrer (CEO)

**Checklist antes de firmar:**
```
□ Cotización aprobada por PRODUCT MANAGER
□ Contrato visa por LEGAL
□ NDA visa por SECURITY + LEGAL
□ Timelines visa por PROJECT MANAGER
□ Precio OK revenue
```

**Firma:**
```
1. PATRICIO firma Contrato de Servicios
2. PATRICIO firma Acuerdo NDA
3. COMERCIAL envía por email a cliente
4. Sigue flujo firma cliente
```

**Email de envío:**
```
Subject: [CLIENTE] - Propuesta Comercial [Fecha]

Estimado [NOMBRE CLIENTE],

Se adjunta propuesta para el proyecto [NOMBRE PROYECTO]:

□ Cotización: $[TOTAL] por [ALCANCE]
□ Timeline: [FECHA INICIO] a [FECHA FIN]
□ Hitos de pago: 50%-30%-20%

Documentos:
1. Contrato de Servicios (firma requerida)
2. Acuerdo de Confidencialidad NDA (firma requerida)
3. Términos y Condiciones

Por favor:
1. Revisar documentos
2. Hacer preguntas si hay
3. Firmar ambos documentos
4. Retornar por email

Disponible para aclaraciones.

Saludos,
Patricio Ferrer
Founder & CEO
CONSULTORAVIRTUAL
```

---

## 🎯 CLIENTE FIRMA

**Flujo cliente:**
```
1. Cliente recibe propuesta
2. Cliente revisa documentos
3. Cliente hace preguntas (a través de COMERCIAL)
4. Cliente firma Contrato + NDA
5. Cliente retorna documentos firmados
```

**COMERCIAL verifica:**
```
□ Ambos documentos firmados
□ Firmas son legibles
□ Fechas completadas
□ Datos correctos
```

---

## 🚀 PROYECTO INICIA

**Una vez firmados ambos documentos:**

```
PROJECT MANAGER (yo):
├─ Coordino equipo técnico
├─ Cronograma primer sprint
├─ Asigno ARQUITECTO → diseño inicial
├─ Reporto progreso semanal a cliente
└─ Ejecuto dentro de timeline firmado
```

---

## 📋 CHECKLIST COMERCIAL

### Antes de PASO 1
- [ ] Requerimientos claros del cliente
- [ ] Alcance definido

### Antes de PASO 2
- [ ] ARQUITECTO estima horas
- [ ] DEV estima costos + horas
- [ ] QA estima horas + timeline

### Antes de PASO 3
- [ ] PRODUCT MANAGER aprueba cotización
- [ ] LEGAL lista para redactar contrato

### Antes de PASO 4
- [ ] SECURITY aprueba NDA
- [ ] LEGAL aprueba Contrato + NDA
- [ ] PROJECT MANAGER aprueba timelines

### Antes de PASO 5
- [ ] Todos los vistos aprobados
- [ ] Dossier completo
- [ ] Patricio listo para firmar

### Después de firma cliente
- [ ] Archivo contrato + NDA firmados
- [ ] Copia a equipo (ARQUITECTO, DEV, QA, PM)
- [ ] Inicia proyecto

---

## 🔐 PUNTOS CRÍTICOS

**DEBE CUMPLIR SIEMPRE:**

1. ✅ NDA va SIEMPRE con Contrato (nunca solo)
2. ✅ LEGAL visa AMBOS documentos
3. ✅ SECURITY visa NDA (Ley 19.628)
4. ✅ PROJECT MANAGER valida timelines
5. ✅ PRODUCT MANAGER valida financiero
6. ✅ PATRICIO firma antes de enviar
7. ✅ Archivo en expediente cliente

---

*Proceso diseñado para proteger empresa + cliente*  
*Responsable de ejecución: Agente COMERCIAL*  
*Coordinador: PROJECT MANAGER (yo)*
