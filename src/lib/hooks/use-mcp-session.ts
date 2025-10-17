import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  url: z.string().url(),
  pages: z.coerce.number().min(1).max(10),
  device: z.enum(['desktop', 'mobile']),
});

type FormValues = z.infer<typeof formSchema>;

export type SessionData = {
  id: string;
  status: 'Running' | 'Completed' | 'Failed';
  tools: {
    scrapping: 'Running' | 'Completed' | 'Failed' | 'Pending';
    analisis: 'Pending' | 'Running' | 'Completed' | 'Failed';
    guia: 'Pending' | 'Running' | 'Completed' | 'Failed';
    pdf: 'Pending' | 'Running' | 'Completed' | 'Failed';
  };
  logs: string[];
  results?: {
    screenshots: string[];
    jsonData: object;
    recommendations: string[];
  };
};

export function useMcpSession(agentType: string) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startSession = useCallback(
    async (values: FormValues) => {
      setIsPending(true);
      setError(null);
      
      toast({
        title: 'Iniciando Sesión...',
        description: `El agente ${agentType} ha comenzado el análisis.`,
      });

      try {
        const response = await fetch('/api/startAnalysisJob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, agentType }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to start session.' }));
          throw new Error(errorData.message || 'An unknown error occurred.');
        }

        const { jobId } = await response.json();

        const newSession: SessionData = {
          id: jobId,
          status: 'Running',
          tools: {
            scrapping: 'Running',
            analisis: 'Pending',
            guia: 'Pending',
            pdf: 'Pending',
          },
          logs: [`Session started with ID: ${jobId}`],
        };
        setSession(newSession);
        
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast({
          title: 'Error al Iniciar Sesión',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsPending(false);
      }
    },
    [agentType, toast]
  );

  return { session, isPending, error, startSession };
}
