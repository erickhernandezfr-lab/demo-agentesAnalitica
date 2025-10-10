'use client';

import { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { McpSessionForm } from '@/components/dashboard/mcp-session-form';
import { McpToolCard } from '@/components/dashboard/mcp-tool-card';
import { McpLogsPanel } from '@/components/dashboard/mcp-logs-panel';
import { McpResultsPanel } from '@/components/dashboard/mcp-results-panel';
import { McpGuidePanel } from '@/components/dashboard/mcp-guide-panel';
import { useMcpSession } from '@/lib/hooks/use-mcp-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Page() {
  const { session, isPending, startSession } = useMcpSession('assessment');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePdfDownload = () => {
    // This is a mock function. In a real application, you would generate a PDF.
    const a = document.createElement('a');
    a.href = '/Mock_GuiaTaggeo.pdf';
    a.download = 'Mock_GuiaTaggeo.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: 'Descarga Completa',
      description: 'El documento ha sido generado correctamente.',
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Assessment y Mejoras</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agente MCP: Assessment y Mejoras</h1>
            <p className="text-muted-foreground">Ejecuta y visualiza herramientas MCP para evaluar la estructura, SEO y UX de tu sitio.</p>
          </div>
           <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-muted-foreground">Connected</span>
            </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8">
        <div className="lg:col-span-2">
          <McpSessionForm onSubmit={startSession} isPending={isPending} />
        </div>
        
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Estado del Flujo MCP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <McpToolCard
                        toolName="🕷️ Scrapping"
                        status={session?.tools?.scrapping || 'Not Started'}
                        actionText="Ver Logs"
                        onActionClick={() => setActivePanel('logs')}
                        disabled={!session}
                    />
                    <McpToolCard
                        toolName="🧠 Análisis (Gemini)"
                        status={session?.tools?.analisis || 'Not Started'}
                        actionText="Ver Resultados"
                        onActionClick={() => setActivePanel('results')}
                        disabled={!session}
                    />
                    <McpToolCard
                        toolName="🧭 Guía de Taggeo"
                        status={session?.tools?.guia || 'Not Started'}
                        actionText="Generar"
                        onActionClick={() => setActivePanel('guide')}
                        disabled={!session}
                    />
                    <McpToolCard
                        toolName="📄 Generación de PDF"
                        status={session?.tools?.pdf || 'Not Started'}
                        actionText="Descargar"
                        onActionClick={handlePdfDownload}
                        disabled={!session}
                    />
                </CardContent>
            </Card>
        </div>
      </div>

      {session && (
        <>
            <McpLogsPanel
                open={activePanel === 'logs'}
                onOpenChange={(open) => !open && setActivePanel(null)}
                logs={session.logs}
                screenshots={session.results?.screenshots || []}
            />
            <McpResultsPanel
                open={activePanel === 'results'}
                onOpenChange={(open) => !open && setActivePanel(null)}
                jsonData={session.results?.jsonData || {}}
                aiExplanation={session.results?.recommendations.join('\n') || ''}
            />
            <McpGuidePanel
                open={activePanel === 'guide'}
                onOpenChange={(open) => !open && setActivePanel(null)}
                guide="Aquí se mostrará la guía de taggeo generada."
            />
        </>
      )}
    </div>
  );
}
