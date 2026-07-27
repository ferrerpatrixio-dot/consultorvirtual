# 📊 ANÁLISIS: ¿Incluir Modelo Predicción en Oferta?

**Documento para:** PM + Agente UX  
**Asunto:** ¿Deberían "Modelos de Predicción de Demanda" ser producto de CONSULTORAVIRTUAL?  
**Propuesta por:** Patricio Ferrer  
**Fecha:** 2026-07-27  

---

## 🎯 CONTEXTO

Tenemos un proyecto ML maduro (CEAPSI) que predice ventas/demanda diarias en clínica de psicología.

**Pregunta crítica:** ¿Escalamos esto como PRODUCTO oficial de CONSULTORAVIRTUAL?

---

## 📋 DATOS DEL PROYECTO ACTUAL

### Proyecto: CEAPSI
- **Ubicación:** `C:\Users\ferre\Documentos\APLICACIONES\MODELOS_PREDICCION\CEAPSI`
- **GitHub:** Existe (nombre TBD)
- **Stack:** Python + Streamlit + XGBoost
- **Estado:** MVP funcionando (Nivel 2 de Madurez IA)

### Capacidades Actuales
```
✅ Modelos:
   - XGBoost (mejor accuracy)
   - Random Forest
   - Prophet (series de tiempo)
   - AutoML (FLAML, PyCaret)

✅ Interfaz:
   - Streamlit app con autenticación
   - Gráficos Plotly interactivos
   - Dashboard predicciones

✅ Datos:
   - Series 2022-2026 (4+ años)
   - Segmentación por tipo (Adultos/Infantil/Teleconsulta)
   - Factor de corrección implementado

✅ Producción-ready:
   - Modelos serializados (.pkl)
   - Métricas documentadas
   - Scriptable (Python automation)
```

---

## 🤔 PREGUNTAS PARA PM + UX

### Para PM (Viabilidad Comercial)

**1. DEMANDA DE MERCADO**
- [ ] ¿Cuántas clínicas/negocios en Chile tienen problema de predicción?
- [ ] ¿Cuál es el precio que pagarían por esto? ($1K? $5K? $10K?)
- [ ] ¿Versus competencia (consultoras de data science)?

**2. PACKAGING & OFERTA**
- [ ] ¿Es un producto standalone o add-on a MMA-OD?
- [ ] ¿Niveles de servicio? (Nivel 0→1, 1→2, etc.)
- [ ] ¿Modelo de cobro? (one-time, monthly, per-prediction)

**3. ESTRATEGIA DE GO-TO-MARKET**
- [ ] ¿Enfoque: Clínicas, Retail, Restaurantes, E-commerce?
- [ ] ¿CEAPSI es caso de éxito o cliente conforme?
- [ ] ¿Portfolio/referencia necesaria antes de vender?

**4. RECURSOS & ROADMAP**
- [ ] ¿Quién mantiene modelos? (DEV + Data Scientist?)
- [ ] ¿Cuánto tiempo para Level 3 (AutoML productivo)?
- [ ] ¿Inversión requerida vs ingresos esperados?

---

### Para Agente UX (Experiencia Usuario)

**1. USABILIDAD ACTUAL**
- [ ] ¿La interfaz Streamlit es suficiente o necesita mejora?
- [ ] ¿Falta algo en el dashboard para cliente?
- [ ] ¿Autenticación/seguridad son adecuadas?

**2. ESCALABILIDAD UX**
- [ ] ¿Cómo sería UX para DIFERENTES tipos de negocio?
  - Clínica: predecir pacientes
  - Restaurante: predecir clientes/cobertura
  - E-commerce: predecir conversiones
- [ ] ¿Necesita customización por cliente?

**3. ADOPCIÓN CLIENTE**
- [ ] ¿Qué tan fácil es para usuario no-técnico?
- [ ] ¿Necesita capacitación?
- [ ] ¿Cuál es el "aha moment"?

**4. INTEGRACIÓN CON SITIO WEB**
- [ ] ¿Cómo se presenta en misitioweb?
- [ ] ¿Link directo a app? ¿O embedded?
- [ ] ¿Case study CEAPSI visible?

---

## 📊 ESCALA DE MADUREZ IA (PROPUESTA)

Si entra en oferta, presentar así:

```
NIVEL 0: "Sin IA"
└─ Cliente usa Excel/predicción manual

NIVEL 1: "IA Básica" ($2K)
├─ Prophet (series de tiempo)
├─ Accuracy 70-80%
└─ Dashboard básico

NIVEL 2: "IA Avanzada" ($5K)
├─ XGBoost + Random Forest
├─ Accuracy 85-92%
├─ Features engineered
└─ Dashboards avanzados
└─ [CEAPSI está aquí HOY]

NIVEL 3: "AutoML" ($8K)
├─ FLAML/PyCaret tuning
├─ Accuracy 90-95%
└─ Modelos en producción

NIVEL 4: "IA en Vivo" ($15K)
├─ API tiempo real
├─ Reentrenamiento automático
└─ Cuota de predicciones

NIVEL 5: "Closed-Loop" ($25K/año)
├─ Modelo auto-corrige
├─ Feedback → reentrenamiento
└─ ROI medido y optimizado
```

---

## 💡 OPCIONES DE DECISIÓN

### OPCIÓN A: ✅ INCLUIR COMO PRODUCTO
```
Sí, es buena idea agregar a oferta.
Razones: [PM + UX van a definir]

Pasos:
1. Crear CONSULTORAVIRTUAL/sistemaprediccion/
2. Documentar escala de madurez
3. Publicar en misitioweb
4. Usar CEAPSI como case study
```

### OPCIÓN B: ❌ NO INCLUIR (Por ahora)
```
No, es demasiado especializado / riesgo de mercado.
Razones: [PM + UX van a definir]

Pasos:
1. Mantener CEAPSI como proyecto independiente
2. Validar demanda primero
3. Revisar año que viene
```

### OPCIÓN C: 🟡 PILOTO
```
Sí, pero como piloto limitado.
Razones: [PM + UX van a definir]

Pasos:
1. Ofrecerlo a 3-5 clientes seleccionados
2. Medir adoption + satisfaction
3. Decidir escala/inversión después
```

---

## 📝 MATRIZ DE DECISIÓN

| Criterio | Importancia | Score PM | Score UX | Recomendación |
|----------|-------------|----------|----------|---------------|
| Demanda de mercado | Alta | ? | - | PM evalúa |
| Capacidad técnica | Alta | - | - | DEV dice que sí |
| Escalabilidad UX | Alta | - | ? | UX evalúa |
| ROI esperado | Alta | ? | - | PM evalúa |
| Diferenciador vs competencia | Media | ? | ? | Ambos |
| Tiempo de implementación | Media | ? | - | PM evalúa |
| Mantenimiento/soporte | Media | ? | - | PM evalúa |

---

## 🚀 PRÓXIMOS PASOS

### AHORA (Antes de integrar)
1. **PM:** Hacer análisis comercial (demanda, precio, ROI)
2. **UX:** Revisar usabilidad actual + mejoras necesarias
3. **Ambos:** Decidir entre OPCIÓN A / B / C

### SI DECIDEN "SÍ" (OPCIÓN A o C)
1. Crear estructura en CONSULTORAVIRTUAL/sistemaprediccion/
2. Documentar escala de madurez
3. Publicar en misitioweb
4. Usar CEAPSI como case study

### SI DECIDEN "NO" (OPCIÓN B)
1. Mantener CEAPSI independiente
2. Validar demanda en 6-12 meses
3. Revisar decisión después

---

## 📞 REUNIÓN NECESARIA

**Recomendación:** Convocatoria entre Patricio + PM + UX para alinear:

```
Agenda (30 min):
1. PM: ¿Hay demanda? ¿A qué precio?
2. UX: ¿Usabilidad es suficiente?
3. Ambos: ¿Vale la pena integrar?
4. Patricio: Decisión + autorizaciones

Output: OPCIÓN A / B / C decidida + plan de acción
```

---

## ✅ CHECKLIST PARA DECISIÓN

**PM debe evaluar:**
- [ ] Mercado potencial identificado
- [ ] Precio estimado confirmado
- [ ] ROI calculado
- [ ] Competencia analizada
- [ ] Recomendación clara

**UX debe evaluar:**
- [ ] Usabilidad actual OK? o mejora necesaria
- [ ] Escalabilidad UX para múltiples industrias
- [ ] Integración con misitioweb definida
- [ ] Onboarding cliente viable
- [ ] Recomendación clara

**Ambos deben confirmar:**
- [ ] Valor agregado a CONSULTORAVIRTUAL
- [ ] Diferenciador real vs competencia
- [ ] Tiempo/recursos necesarios
- [ ] Riesgos identificados y mitigados

---

**Una vez PM + UX hayan completado este análisis:**
- Si SÍ → Implemento OPCIÓN 3 (Producto + Cliente)
- Si NO → Dejamos CEAPSI independiente
- Si PILOTO → Hacemos MVP limitado primero

---

*Documento preparado para revisión de PM + Agente UX*  
*Requiere decisión antes de proceder a integración.*
