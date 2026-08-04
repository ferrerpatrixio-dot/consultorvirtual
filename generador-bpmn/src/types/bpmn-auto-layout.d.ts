// bpmn-auto-layout no publica archivos .d.ts (ver node_modules/bpmn-auto-layout/dist,
// solo hay index.js/index.cjs). Declaración mínima ambiente con la única
// función que usa src/lib/exportar-bpmn.ts. Ver docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md
// Hallazgo 2.
declare module "bpmn-auto-layout" {
  /** Toma BPMN 2.0 XML sin bpmndi:BPMNDiagram y devuelve el XML con el
   * diagrama (layout) calculado automáticamente. */
  export function layoutProcess(xml: string): Promise<string>;
}
