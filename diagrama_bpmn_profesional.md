# 📦 Diagrama BPMN - Recepción de Equipos

## Flujo Completo con Swimlanes

```plantuml
@startuml
left to right direction

' DEFINE ROLES/POOLS
rectangle "🚚 DISTRIBUIDOR" as dist_pool #E8F4F8 {
  mxgraph.bpmn.event.start "Inicio" as start
  rectangle "Llega con\ncamión" as llega
  rectangle "Presenta\ndocumentación" as presenta
  rectangle "Recibe guía\nfirmada" as recibe
  rectangle "Se retira\ncon copia" as retira
  mxgraph.bpmn.event.end "Fin OK" as end_dist
}

rectangle "👤 GUARDIÁN" as guardian_pool #F3E5F5 {
  rectangle "Registra\nentrada" as registra_entrada
  mxgraph.bpmn.gateway2.exclusive "¿Documentación\nválida?" as valida_docs
  rectangle "❌ RECHAZA\nentrada" as rechaza_entrada
  mxgraph.bpmn.event.end "Rechazado" as end_rechaza
}

rectangle "📦 BODEGUERO/ADMINISTRATIVO" as bodeguero_pool #E8F5E9 {
  rectangle "Traslada cajas\na bodega" as traslada
  rectangle "Abre cajas\ny verifica" as abre_cajas
  mxgraph.bpmn.gateway2.exclusive "¿Cantidades\ncorrectas?" as valida_cantidad
  mxgraph.bpmn.gateway2.exclusive "¿Modelos\ncorrectos?" as valida_modelos
  rectangle "Inspecciona\ndaños físicos" as inspecciona_daños
  mxgraph.bpmn.gateway2.exclusive "¿Daños\ncríticos?" as valida_daños
  rectangle "Firma guía\nde entrega" as firma_guia
  rectangle "Ingresa a SAP\nPreparación" as prepara_sap
  rectangle "Pistola/Escanea\ncada caja" as pistola
  mxgraph.bpmn.gateway2.exclusive "¿Físico\n= SAP?" as valida_sap
  rectangle "Ingresa serie\nconfirmada" as ingresa_sap
  mxgraph.bpmn.gateway2.exclusive "¿Más\ncajas?" as mas_cajas
  mxgraph.bpmn.event.end "Fin OK" as end_bodega
}

rectangle "⚠️ SUPERVISOR" as supervisor_pool #FFF3E0 {
  rectangle "Registra\ndiscrepancia" as reg_discrepancia
  rectangle "Revisa caso\ny documentación" as revisa_caso
  mxgraph.bpmn.gateway2.exclusive "¿Se puede\nresolver?" as resolvible
  rectangle "📌 Escalado\na Gerencia" as escalada
  mxgraph.bpmn.event.end "Escalado" as end_escalada
}

' FLUJO DISTRIBUIDOR
start --> llega
llega --> presenta

' COMUNICACIÓN: DISTRIBUIDOR -> GUARDIÁN
presenta ..> registra_entrada : "Documentación"

' FLUJO GUARDIÁN
registra_entrada --> valida_docs

' DECISIÓN: ¿VÁLIDO?
valida_docs --> rechaza_entrada : "NO"
rechaza_entrada --> end_rechaza

valida_docs --> traslada : "SÍ"

' FLUJO BODEGUERO - VERIFICACIÓN
traslada --> abre_cajas
abre_cajas --> valida_cantidad

' DECISIÓN: ¿CANTIDADES?
valida_cantidad --> reg_discrepancia : "NO"
valida_cantidad --> valida_modelos : "SÍ"

' DECISIÓN: ¿MODELOS?
valida_modelos --> reg_discrepancia : "NO"
valida_modelos --> inspecciona_daños : "SÍ"

' DECISIÓN: ¿DAÑOS?
inspecciona_daños --> valida_daños
valida_daños --> reg_discrepancia : "SÍ"
valida_daños --> firma_guia : "NO"

' COMUNICACIÓN: BODEGUERO -> DISTRIBUIDOR
firma_guia ..> recibe : "Entrega guía"
recibe --> retira
retira --> end_dist

' FLUJO BODEGUERO - INGRESO SAP
firma_guia --> prepara_sap
prepara_sap --> pistola

' DECISIÓN: ¿FÍSICO = SAP?
pistola --> valida_sap
valida_sap --> pistola : "NO (Reintenta)"
valida_sap --> ingresa_sap : "SÍ"

' DECISIÓN: ¿MÁS CAJAS?
ingresa_sap --> mas_cajas
mas_cajas --> pistola : "SÍ (Repetir)"
mas_cajas --> end_bodega : "NO"

' FLUJO SUPERVISOR - DISCREPANCIAS
reg_discrepancia --> revisa_caso
revisa_caso --> resolvible

' DECISIÓN: ¿RESOLVIBLE?
resolvible --> abre_cajas : "SÍ (Reintentar)"
resolvible --> escalada : "NO"
escalada --> end_escalada

@enduml
```

---

## 📋 Descripción del Diagrama

### Flujo Principal ✅
1. **DISTRIBUIDOR** llega con camión y presenta documentación
2. **GUARDIÁN** valida la entrada
   - Si es válida → Autoriza acceso a bodega
   - Si no es válida → Rechaza entrega
3. **BODEGUERO/ADMINISTRATIVO** realiza verificaciones en cascada:
   - Traslada cajas a bodega
   - Verifica cantidades vs guía
   - Verifica modelos de equipos
   - Inspecciona daños físicos
   - Firma la guía de entrega
4. **BODEGUERO/ADMINISTRATIVO** ingresa a SAP:
   - Pistola/escanea cada caja
   - Compara físico con SAP
   - Ingresa series confirmadas
   - Repite para todas las cajas
5. **DISTRIBUIDOR** recibe guía firmada y se retira

### Flujo de Discrepancias ⚠️
Cuando se detecta un error en cualquier validación:
1. Se registra la discrepancia
2. **SUPERVISOR** revisa el caso
3. Si es resolvible → Reintentar verificación
4. Si no es resolvible → Escalar a Gerencia

---

## 🎯 Puntos de Control Críticos

| # | Punto de Control | Decisión | Acción SI | Acción NO |
|---|------------------|----------|-----------|-----------|
| 1 | Documentación válida | Guardián | Autoriza | Rechaza |
| 2 | Cantidades correctas | Bodeguero | Continúa | Discrepancia |
| 3 | Modelos correctos | Bodeguero | Continúa | Discrepancia |
| 4 | Sin daños críticos | Bodeguero | Firma | Discrepancia |
| 5 | Físico = SAP | Bodeguero | Ingresa | Reintenta |
| 6 | Más cajas | Bodeguero | Loop | Fin |

---

## 📊 Leyenda de Símbolos

- **⭕ Círculos**: Inicio (verde) y Fin (según resultado)
- **📦 Rectángulos**: Actividades/tareas a realizar
- **◇ Diamantes**: Puntos de decisión (SÍ/NO)
- **→ Flechas sólidas**: Flujo de secuencia
- **⇢ Flechas punteadas**: Comunicación entre roles
- **Colores por rol**: Cada swimlane tiene su color identificador

---

## ✨ Características

✅ **Swimlanes claros** - Separación por rol  
✅ **Decisiones binarias** - SÍ/NO en cada compuerta  
✅ **Loops integrados** - Reintentos automáticos  
✅ **Escaladas definidas** - Supervisor → Gerencia  
✅ **Sin traslapos** - Diagrama limpio y legible  

---

**Versión**: 1.0 | **Formato**: BPMN 2.0 | **Generado con PlantUML**