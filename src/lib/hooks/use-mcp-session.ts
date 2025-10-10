
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock data and types, replace with your actual Firestore data structures
const formSchema = z.object({
  url: z.string().url(),
  pages: z.coerce.number().min(1).max(10),
  device: z.enum(['desktop', 'mobile']),
});

type SessionData = {
  id: string;
  status: 'Running' | 'Completed' | 'Failed';
  tools: {
    scrapping: 'Running' | 'Completed' | 'Failed';
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
  const { toast } = useToast(); // Initialize useToast

  const startSession = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsPending(true);
      setError(null);
      console.log(`Starting ${agentType} session with values:`, values);
      toast({
        title: 'Iniciando Sesión',
        description: 'La sesión de evaluación ha comenzado.',
      });

      try {
        // MOCKED: Simulate API call to start the session
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newSession: SessionData = {
          id: new Date().toISOString(),
          status: 'Running',
          tools: {
            scrapping: 'Running',
            analisis: 'Pending',
            guia: 'Pending',
            pdf: 'Pending',
          },
          logs: ['Session started...'],
        };
        setSession(newSession);
        setIsPending(false);

        // MOCKED: Simulate Firestore updates
        setTimeout(() => {
          setSession((prev) => prev && { ...prev, tools: { ...prev.tools, scrapping: 'Completed' }, logs: [...prev.logs, 'Scrapping completed.'] });
        }, 2000);

        setTimeout(() => {
          setSession((prev) => prev && { ...prev, tools: { ...prev.tools, analisis: 'Running' }, logs: [...prev.logs, 'Analysis running...'] });
        }, 3000);

        setTimeout(() => {
          setSession((prev) => prev && {
            ...prev,
            status: 'Completed',
            tools: { ...prev.tools, analisis: 'Completed', guia: 'Completed', pdf: 'Completed' },
            logs: [...prev.logs, 'Session completed!'],
            results: {
              screenshots: ['/placeholder.svg', '/placeholder.svg'],
              jsonData: { key: 'value', nested: { array: [1,2,3] } },
              recommendations: ['Improve SEO on page X', 'Optimize image Y'],
            }
          });
          toast({
            title: 'Sesión Completada',
            description: 'La evaluación ha finalizado exitosamente.',
            // Removed: variant: 'success'
          });
        }, 5000);
      } catch (err) {
        setError('Failed to start session.');
        setIsPending(false);
        toast({
          title: 'Error al Iniciar Sesión',
          description: 'Hubo un problema al iniciar la evaluación.',
          variant: 'destructive'
        });
      }
    },
    [agentType, toast]
  );

  return { session, isPending, error, startSession };
}
