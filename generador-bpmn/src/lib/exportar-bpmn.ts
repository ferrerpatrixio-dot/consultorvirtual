import { BpmnModdle, type ModdleElement } from "bpmn-moddle";
import { layoutProcess } from "bpmn-auto-layout";
import type { Paso, TipoPaso } from "@/lib/diagramas";

// Fase 3: exportación a .bpmn XML real (BPMN 2.0). Mismo modelo de datos
// que generarMermaid() (mermaid-render.ts) — actor/tipo/texto/siguiente* —
// pero acá el destino es un árbol semántico BPMN construido con
// bpmn-moddle y serializado con moddle.toXML(); bpmn-auto-layout calcula el
// bpmndi:BPMNDiagram (coordenadas/waypoints) a partir de ese XML sin
// layout. Ver docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md Hallazgo 2 y
// docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md sección "Actualización
// 2026-08-04" para el research y la decisión de alcance.
//
// Decisión ya tomada por PM (no reabrir): fin_ok/fin_error son EndEvent
// simples, sin errorEventDefinition.
//
// LIMITACIÓN CONFIRMADA EN SPIKE (no documentada antes de este spike):
// bpmn-auto-layout (v1.3.0, la última estable — hay un 2.0.0-alpha pero no
// es apto para producción) no calcula layout para bpmn:Lane en absoluto
// (no hay ninguna referencia a "laneSet"/"Lane" en su código de layout,
// solo una mención al tamaño default de una Lane que nunca se usa). El XML
// resultante conserva el <bpmn:laneSet> con el flowNodeRef correcto de
// cada actor (dato semántico intacto, útil si otra herramienta lo
// reconstruye), pero bpmn-auto-layout no genera un bpmndi:BPMNShape para
// cada Lane — al abrir el archivo en Camunda Modeler o bpmn.io, los nodos
// se van a ver todos en el canvas (con sus conexiones correctas) pero SIN
// los recuadros divisorios de carril visibles. Intentar simular esos
// recuadros a mano (bounding box por actor sobre las coordenadas ya
// calculadas) no funciona: el layout de bpmn-auto-layout posiciona los
// nodos por profundidad en el grafo, no por carril, así que los rangos de
// X/Y de actores distintos se solapan — dibujar cajas ahí produciría
// carriles visualmente rotos, no reales. Ver detalle en el reporte de DEV
// del spike (2026-08-04).
//
// RS-3 / RS-4 (spec F02 §7, CA-22) — verificado en el código de las
// dependencias, no asumido:
// - RS-3 (escapar todo string del modelo al exportar): moddle-xml (la
//   librería que serializa con moddle.toXML(), dependencia de bpmn-moddle)
//   escapa automáticamente TODO valor de atributo string vía
//   `escapeAttr()` al construir cada `bpmn:*Attribute` (ver
//   node_modules/moddle-xml/dist/index.js, ElementSerializer.addAttribute,
//   línea ~1619). Por eso los `name` de actividad/lane (p.texto, actor)
//   NO se escapan a mano acá: hacerlo produciría doble escape ("&" →
//   "&amp;" → "&amp;amp;"), corrompiendo el texto real del proceso. Un
//   nombre con `<script>` o comillas queda como texto plano en el XML,
//   nunca como marcado.
// - RS-4 (XXE / expansión de entidades): bpmn-auto-layout vuelve a
//   parsear el XML semántico con bpmn-moddle (mismo moddle-xml). Su
//   parser (`saxen`) no implementa DOCTYPE ni ENTITY externas en
//   absoluto: solo decodifica las 5 entidades XML estándar (amp, lt, gt,
//   quot, apos) más referencias numéricas de carácter, con una tabla fija
//   en código (ver node_modules/saxen/dist/*.js, ENTITY_MAPPING) — no hay
//   resolución de archivos ni de red. No hace falta configurar nada para
//   desactivar XXE: la librería nunca tuvo esa capacidad.

const TIPO_A_ELEMENTO: Record<TipoPaso, string> = {
  inicio: "bpmn:StartEvent",
  tarea: "bpmn:UserTask",
  sistema: "bpmn:ServiceTask",
  decision: "bpmn:ExclusiveGateway",
  fin_ok: "bpmn:EndEvent",
  fin_error: "bpmn:EndEvent",
  // Incremento 2 de F02 (docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md
  // §4.1): CallActivity, NO SubProcess embebido — SubProcess sería la
  // representación inline que Patricio descartó explícitamente (el
  // subproceso se abre como diagrama separado, no colapsado en el mismo
  // lienzo). CallActivity es la referencia a un proceso reutilizable
  // definido aparte, que es la semántica real de la decisión de producto.
  subproceso: "bpmn:CallActivity",
};

/**
 * Genera el XML BPMN 2.0 completo (semántica + layout) a partir de
 * actores + pasos, con el mismo modelo de datos que el resto de la app.
 * Lanza un Error legible si no hay suficiente data para exportar — el
 * caller (route handler) es responsable de mostrarlo al usuario.
 *
 * `diagramId` es opcional por compatibilidad hacia atrás (tests/llamadas
 * existentes); si no se pasa, el id de proceso cae al literal histórico
 * "Process_1". Se necesita el id real para que `calledElement` de un
 * `CallActivity` (§4.1 del diseño) pueda resolver contra el `bpmn:Process`
 * del diagrama hijo cuando ese archivo se abre junto al de este diagrama.
 */
export async function exportarBpmn(
  actores: string[],
  pasos: Paso[],
  diagramId?: string,
): Promise<string> {
  if (pasos.length === 0 || actores.length === 0) {
    throw new Error("El diagrama no tiene actores o pasos suficientes para exportar.");
  }

  const moddle = new BpmnModdle();

  // Ids de paso pueden ser UUID (crypto.randomUUID(), ver agregarPasoAction
  // en (app)/actions.ts): empiezan con dígito y tienen guiones, lo que no
  // es un xsd:ID/NCName válido en XML. Se mapea cada paso a un id BPMN
  // seguro, igual que mermaid-render.ts hace con los ids de nodo Mermaid.
  const nodoPorPaso = new Map<string, ModdleElement>();
  pasos.forEach((p, idx) => {
    nodoPorPaso.set(
      p.id,
      moddle.create(TIPO_A_ELEMENTO[p.tipo], {
        id: `Elem_${idx}`,
        name: p.texto || "(sin texto)",
        // calledElement: el proceso al que este CallActivity llama. Es un
        // QName; el estándar no exige que ese Process esté en el mismo
        // documento (§4.2 del diseño) — queda como referencia colgante si
        // se abre este archivo solo, pero es BPMN válido.
        ...(p.tipo === "subproceso" && p.subprocesoDiagramId
          ? { calledElement: `Process_${p.subprocesoDiagramId}` }
          : {}),
      }),
    );
  });

  // incoming/outgoing no se derivan solos de sourceRef/targetRef al
  // construir el árbol a mano: hay que asignarlos explícitamente en cada
  // FlowNode para que se serialicen como <bpmn:incoming>/<bpmn:outgoing> —
  // sin esto, bpmn-auto-layout no dibuja ninguna conexión (confirmado en
  // el spike: 0 bpmndi:BPMNEdge sin este paso).
  const incomingPorPaso = new Map<string, ModdleElement[]>(pasos.map((p) => [p.id, []]));
  const outgoingPorPaso = new Map<string, ModdleElement[]>(pasos.map((p) => [p.id, []]));

  const flows: ModdleElement[] = [];
  let flowSeq = 0;
  function crearFlow(origenId: string, destinoId: string, etiqueta?: string) {
    const origen = nodoPorPaso.get(origenId);
    const destino = nodoPorPaso.get(destinoId);
    if (!origen || !destino) return; // destino roto/inexistente: se omite, igual que generarMermaid
    const flow = moddle.create("bpmn:SequenceFlow", {
      id: `Flow_${flowSeq++}`,
      sourceRef: origen,
      targetRef: destino,
      name: etiqueta,
    });
    outgoingPorPaso.get(origenId)!.push(flow);
    incomingPorPaso.get(destinoId)!.push(flow);
    flows.push(flow);
  }

  pasos.forEach((p) => {
    if (p.tipo === "decision") {
      if (p.siguienteSi) crearFlow(p.id, p.siguienteSi, "Sí");
      if (p.siguienteNo) crearFlow(p.id, p.siguienteNo, "No");
    } else if (p.tipo !== "fin_ok" && p.tipo !== "fin_error" && p.siguiente) {
      crearFlow(p.id, p.siguiente);
    }
  });

  pasos.forEach((p) => {
    const nodo = nodoPorPaso.get(p.id)!;
    nodo.incoming = incomingPorPaso.get(p.id)!;
    nodo.outgoing = outgoingPorPaso.get(p.id)!;
  });

  // Actores → Lane dentro de un único Process (no pools separados — evita
  // la limitación documentada de bpmn-auto-layout con múltiples
  // participant). Actores sin pasos asignados no generan Lane, igual que
  // generarMermaid() no genera subgraph para un actor sin pasos.
  const lanes: ModdleElement[] = [];
  actores.forEach((actor, idx) => {
    const nodosDelActor = pasos.filter((p) => p.actor === actor).map((p) => nodoPorPaso.get(p.id)!);
    if (nodosDelActor.length === 0) return;
    lanes.push(
      moddle.create("bpmn:Lane", {
        id: `Lane_${idx}`,
        name: actor,
        flowNodeRef: nodosDelActor,
      }),
    );
  });

  const proceso = moddle.create("bpmn:Process", {
    id: diagramId ? `Process_${diagramId}` : "Process_1",
    isExecutable: false,
    flowElements: [...nodoPorPaso.values(), ...flows],
    laneSets: lanes.length > 0 ? [moddle.create("bpmn:LaneSet", { id: "LaneSet_1", lanes })] : [],
  });

  const definitions = moddle.create("bpmn:Definitions", {
    id: "Definitions_1",
    targetNamespace: "http://bpmn.io/schema/bpmn",
    rootElements: [proceso],
  });

  const { xml: xmlSemantico } = await moddle.toXML(definitions, { format: true });

  // bpmn-auto-layout calcula el bpmndi:BPMNDiagram (posiciones/waypoints)
  // a partir del XML semántico sin layout.
  return layoutProcess(xmlSemantico);
}
