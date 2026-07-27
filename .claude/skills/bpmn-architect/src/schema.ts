import { z } from 'zod';

// Definición de un Nodo BPMN (Una "Caja" o "Círculo")
const BpmnNodeSchema = z.object({
  id: z.string().describe("ID único del nodo (ej: 'node_1')"),
  type: z.enum([
    "START_EVENT", 
    "END_EVENT", 
    "USER_TASK",      // Tarea Humana
    "SERVICE_TASK",   // Tarea Sistema/API
    "GATEWAY_XOR",    // Decisión (Rombo)
    "ERROR_EVENT"     // Manejo de Excepción
  ]).describe("Tipo estándar BPMN 2.0"),
  label: z.string().describe("Nombre de la tarea (Verbo + Objeto, ej: 'Validar Factura')"),
  lane: z.string().describe("El Actor responsable (Swimlane)"),
  visual_meta: z.object({
    color: z.enum(["#28a745", "#dc3545", "#ffc107", "#007bff", "#f8f9fa"]).describe("Color semántico (60-30-10 rule)"),
    icon_ref: z.string().describe("Referencia al archivo de icono local (ej: 'icon_db', 'icon_user', 'icon_api')")
  }),
  technical_meta: z.object({
    retry_strategy: z.string().optional().describe("Si es API, definir estrategia (ej: 'Exp Backoff + Jitter')"),
    is_idempotent: z.boolean().describe("¿Es seguro reintentar esta acción?")
  })
});

// Definición de una Conexión (Flecha)
const BpmnEdgeSchema = z.object({
  from: z.string().describe("ID del nodo origen"),
  to: z.string().describe("ID del nodo destino"),
  label: z.string().optional().describe("Texto sobre la flecha (para decisiones, ej: 'Sí', 'No', '> $500')")
});

// Salida Final del Arquitecto
export const ArchitectSchema = z.object({
  diagram_title: z.string(),
  nodes: z.array(BpmnNodeSchema).describe("Lista de todos los pasos del flujo"),
  edges: z.array(BpmnEdgeSchema).describe("Lista de conexiones lógicas"),
  resilience_summary: z.string().describe("Resumen de la estrategia de errores aplicada globalmente"),
  pending_questions: z.array(z.string()).describe("Preguntas socráticas para el usuario si hay ambigüedad")
});

export type ArchitectOutput = z.infer<typeof ArchitectSchema>;