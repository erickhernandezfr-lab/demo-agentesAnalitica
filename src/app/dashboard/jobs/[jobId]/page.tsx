'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getFirestore } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { app } from '@/lib/firebase';
import type { Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { toast } = useToast();

  const [jobData, loading, error] = useDocumentData(
    doc(getFirestore(app), 'jobs', jobId)
  );

  const job = jobData as Job | undefined;
  
  const [modifiedMarkdown, setModifiedMarkdown] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job?.analyticCoreDraft) {
      setModifiedMarkdown(job.analyticCoreDraft);
    }
  }, [job?.analyticCoreDraft]);

  const handleStageAction = async (stage: 'analyticCore' | 'tagOpsHub') => {
    setIsSubmitting(true);
    let endpoint = '';
    let body: any = { jobId };

    if (stage === 'analyticCore') {
        endpoint = process.env.NEXT_PUBLIC_START_ANALYTIC_CORE_URL || '';
    } else if (stage === 'tagOpsHub') {
        endpoint = process.env.NEXT_PUBLIC_START_TAGOPS_HUB_URL || '';
        body.modifiedMarkdown = modifiedMarkdown;
    }
    
    if (!endpoint) {
        toast({ title: 'Error', description: 'Function URL is not configured.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to start ${stage}`);
        }

        toast({ title: 'Success', description: `${stage} started successfully.` });
    } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="p-8 text-destructive">Error loading job: {error.message}</div>;
  }

  if (!job) {
    return <div className="p-8">Job not found.</div>;
  }
  
  const showAnalyticCore = job.status === 'insight_forge_completed' || job.status.startsWith('analytic_core') || job.status.startsWith('tagops_hub') || job.status === 'failed';
  const showTagOpsHub = job.status === 'analytic_core_completed' || job.status.startsWith('tagops_hub');


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Job Details</h1>
            <p className="text-muted-foreground">Tracking job <code className="bg-muted px-1.5 py-0.5 rounded">{jobId}</code> for <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{job.url}</a></p>
        </div>

        {job.status === 'failed' && (
             <Alert variant="destructive">
                <AlertTitle>Job Failed</AlertTitle>
                <AlertDescription>{job.error || 'An unexpected error occurred.'}</AlertDescription>
            </Alert>
        )}

      {/* Stage 1: Insight Forge */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Forge: Extracción de Datos Estructurales</CardTitle>
          <CardDescription>Scraping website content and structure.</CardDescription>
        </CardHeader>
        <CardContent>
          {job.status === 'insight_forge_pending' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Scraping in progress...</span>
            </div>
          )}
          {job.status !== 'insight_forge_pending' && job.insightForgeOutput && (
             <div className="space-y-4">
                <p className="text-sm text-green-600 font-medium">Insight Forge completed.</p>
                <div>
                    <h4 className="font-semibold">JSON Output</h4>
                    <a href={job.insightForgeOutput.jsonPath.replace("gs://", "https://storage.googleapis.com/")} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{job.insightForgeOutput.jsonPath}</a>
                </div>
                 <div>
                    <h4 className="font-semibold">Images Base Path</h4>
                    <p className="text-sm text-muted-foreground break-all">{job.insightForgeOutput.imagesBasePath}</p>
                </div>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Stage 2: Analytic Core */}
      {showAnalyticCore && (
          <Card>
            <CardHeader>
              <CardTitle>Analytic Core: Generación de Estrategia de Etiquetado</CardTitle>
              <CardDescription>AI-powered analysis to generate a draft tagging strategy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {job.status === 'insight_forge_completed' && (
                    <Button onClick={() => handleStageAction('analyticCore')} disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Iniciando...</> : 'Iniciar Analytic Core'}
                    </Button>
                )}
                 {job.status === 'analytic_core_pending' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating AI analysis... This may take a moment.</span>
                    </div>
                 )}
                 {job.analyticCoreDraft && (
                    <>
                        <Textarea 
                            value={modifiedMarkdown}
                            onChange={(e) => setModifiedMarkdown(e.target.value)}
                            rows={20}
                            className="font-mono"
                            disabled={job.status.startsWith('tagops_hub')}
                        />
                    </>
                 )}
            </CardContent>
          </Card>
      )}

      {/* Stage 3: TagOps Hub */}
      {showTagOpsHub && (
          <Card>
            <CardHeader>
                <CardTitle>TagOps Hub: Creación de la Guía de Implementación</CardTitle>
                <CardDescription>Generate the final, shareable PDF guide.</CardDescription>
            </CardHeader>
            <CardContent>
                {job.status === 'analytic_core_completed' && (
                    <Button onClick={() => handleStageAction('tagOpsHub')} disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generar Guía con TagOps Hub'}
                    </Button>
                )}
                {job.status === 'tagops_hub_pending' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating PDF guide...</span>
                    </div>
                )}
                {job.status === 'tagops_hub_completed' && job.tagOpsHubOutput?.pdfUrl && (
                    <div className="space-y-4">
                        <p className="font-medium text-green-600">¡Tu guía de etiquetado está lista!</p>
                        <Button asChild>
                            <a href={job.tagOpsHubOutput.pdfUrl} target="_blank" rel="noopener noreferrer">
                                Descargar Guía PDF
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
      )}
    </div>
  );
}
