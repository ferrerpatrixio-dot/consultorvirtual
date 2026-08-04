// bpmn-moddle (v10) es ESM-only y no publica tipos para su export raíz "."
// (solo para el subpath "bpmn-moddle/types", que no usamos). Declaración
// mínima ambiente con la única superficie que usa src/lib/exportar-bpmn.ts:
// create() para construir el árbol semántico BPMN 2.0, toXML()/fromXML()
// para serializar/parsear. Ver docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md
// Hallazgo 2.
declare module "bpmn-moddle" {
  export type ModdleElement = {
    $type: string;
    id?: string;
    name?: string;
    incoming?: ModdleElement[];
    outgoing?: ModdleElement[];
    [key: string]: unknown;
  };

  export interface ModdleInstance {
    create(type: string, attrs?: Record<string, unknown>): ModdleElement;
    toXML(
      element: ModdleElement,
      options?: { format?: boolean },
    ): Promise<{ xml: string }>;
    fromXML(
      xml: string,
    ): Promise<{
      rootElement: ModdleElement;
      warnings: unknown[];
    }>;
  }

  export const BpmnModdle: new () => ModdleInstance;
}
