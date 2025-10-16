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

export default function Page() {
  const { session, isPending, startSession } = useMcpSession('assessment');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [geminiAnalysisResult, setGeminiAnalysisResult] = useState<any>(null);
  const [taggingGuideResult, setTaggingGuideResult] = useState<any>(null);

  const handleGeminiAnalysisResult = (result: any) => {
    setGeminiAnalysisResult(result);
    setActivePanel('results');
  };

  const handleTaggingGuideResult = (result: any) => {
    setTaggingGuideResult(result);
    setActivePanel('guide');
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
            <BreadcrumbPage>Entendimiento y tagging</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agente MCP: Entendimiento y tagging</h1>
            <p className="text-muted-foreground">Scrappea + Analiza + Propuesta de taggeo </p>
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
                    {session && (
                      <McpToolCard
                          sessionId={session.id}
                          tool="GeminiAnalisis"
                          onResult={handleGeminiAnalysisResult}
                      />
                    )}
                    {session && (
                      <McpToolCard
                          sessionId={session.id}
                          tool="GuiaTaggeo"
                          onResult={handleTaggingGuideResult}
                      />
                    )}
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
                result={geminiAnalysisResult}
            />
            <McpGuidePanel
                open={activePanel === 'guide'}
                onOpenChange={(open) => !open && setActivePanel(null)}
                result={taggingGuideResult}
            />
        </>
      )}
    </div>
  );
}
