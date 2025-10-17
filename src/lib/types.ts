// src/lib/types.ts
import type { Timestamp } from 'firebase/firestore';

export type JobStatus = 
  | 'insight_forge_pending' 
  | 'insight_forge_completed' 
  | 'analytic_core_pending' 
  | 'analytic_core_completed' 
  | 'tagops_hub_pending' 
  | 'tagops_hub_completed' 
  | 'failed';


export interface Job {
  status: JobStatus;
  url: string;
  createdAt: Timestamp;
  agentType: string;
  error?: string;

  // Etapa 1: Insight Forge (Scraping)
  insightForgeOutput?: {
    jsonPath: string;      // Ruta en GCS al all_pages.json
    imagesBasePath: string; // Ruta base a la carpeta de imágenes: jobs/{jobId}/input/
  };

  // Etapa 2: Analytic Core (Análisis de IA)
  analyticCoreDraft?: string; // Borrador en Markdown del análisis, editable por el usuario.

  // Etapa 3: TagOps Hub (Reporte PDF)
  tagOpsHubOutput?: {
    pdfUrl: string;
  };
}
