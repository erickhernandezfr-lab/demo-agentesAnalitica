'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';

export function NewAnalysisDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
        agentType: formData.get('agentType'),
        url: formData.get('url'),
        pages: formData.get('pages'),
        device: formData.get('device'),
    };

    const functionUrl = process.env.NEXT_PUBLIC_START_INSIGHT_FORGE_URL;

    if (!functionUrl) {
      toast({
        title: 'Error de Configuración',
        description: 'La URL de la función de inicio no está configurada.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }


    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to start analysis job' }));
        throw new Error(errorData.message || 'Failed to start analysis job');
      }

      const { jobId } = await response.json();
      
      toast({
        title: 'Success',
        description: 'Analysis job started. Redirecting to job details...',
      });

      setIsDialogOpen(false); 
      router.push(`/dashboard/jobs/${jobId}`);

    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Analysis Session</DialogTitle>
            <DialogDescription>
              Provide the details for the new analysis session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent" className="text-right">
                Agent
              </Label>
              <div className="col-span-3">
                <Select name="agentType" defaultValue="insight_forge">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insight_forge">Insight Forge</SelectItem>
                    <SelectItem value="monitoring" disabled>Performance Monitoring</SelectItem>
                    <SelectItem value="audit" disabled>Audit & Recalibration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <div className="col-span-3">
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  required
                  type="url"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pages" className="text-right">
                Pages
              </Label>
              <div className="col-span-3">
                <Input
                  id="pages"
                  name="pages"
                  type="number"
                  defaultValue="1"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Device</Label>
              <div className="col-span-3">
                <RadioGroup name="device" defaultValue="desktop" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="desktop" id="desktop" />
                    <Label htmlFor="desktop">Desktop</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Session'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
