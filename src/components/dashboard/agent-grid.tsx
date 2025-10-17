
import { AgentCard } from './agent-card';
import { Puzzle, LineChart, Compass } from 'lucide-react';

export function AgentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AgentCard
        icon={<Puzzle className="h-8 w-8" />}
        title="Insight Forge"
        description="Paso 1: Recolección de Datos Estructurales del Sitio Web."
        status="Ready"
        kpi="Last score: N/A"
        ctaText="Iniciar Evaluación"
        ctaLink="/agent/assessment"
      />
      <AgentCard
        icon={<LineChart className="h-8 w-8" />}
        title="Analytic Core"
        description="Paso 2: Análisis por IA y Generación de Estrategia."
        status="Pending"
        kpi="Last check: Never"
        ctaText="Abrir Panel"
        ctaLink="/agent/monitoring"
      />
      <AgentCard
        icon={<Compass className="h-8 w-8" />}
        title="TagOps Hub"
        description="Paso 3: Reporte, Entrega y Guía de Implementación."
        status="Pending"
        kpi="Last audit: Never"
        ctaText="Iniciar Auditoría"
        ctaLink="/agent/audit"
      />
    </div>
  );
}
