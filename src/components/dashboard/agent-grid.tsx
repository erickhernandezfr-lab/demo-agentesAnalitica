
import { AgentCard } from './agent-card';
import { Puzzle, LineChart, Compass } from 'lucide-react';

export function AgentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AgentCard
        icon={<Puzzle className="h-8 w-8" />}
        title="Assessment y Mejoras"
        description="Evalúa estructura, SEO y UX del sitio."
        status="Ready"
        kpi="Last score: N/A"
        ctaText="Iniciar Evaluación"
        ctaLink="/agent/assessment"
      />
      <AgentCard
        icon={<LineChart className="h-8 w-8" />}
        title="Monitoreo de Rendimiento"
        description="Conecta GA4 y Core Web Vitals para medir performance."
        status="Pending"
        kpi="Last check: Never"
        ctaText="Abrir Panel"
        ctaLink="/agent/monitoring"
      />
      <AgentCard
        icon={<Compass className="h-8 w-8" />}
        title="Auditoría & Recalibración de Taggeo"
        description="Cruza datos de los dos anteriores para auditar y corregir tagging."
        status="Pending"
        kpi="Last audit: Never"
        ctaText="Iniciar Auditoría"
        ctaLink="/agent/audit"
      />
    </div>
  );
}
