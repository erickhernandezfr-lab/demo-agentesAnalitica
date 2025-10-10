'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
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
import { Loader2, PlusCircle } from 'lucide-react';
import { startAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '../ui/checkbox';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting...
        </>
      ) : (
        'Start Analysis'
      )}
    </Button>
  );
}

export function NewAnalysisDialog() {
  const [state, formAction] = useActionState(startAnalysis, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'Success',
        description: state.message,
      });
      formRef.current?.reset();
      closeButtonRef.current?.click();
    }
  }, [state, toast]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form ref={formRef} action={formAction}>
          <DialogHeader>
            <DialogTitle>New Website Analysis</DialogTitle>
            <DialogDescription>
              Enter a URL to start the SEO tagging analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                {state?.errors?.url && (
                  <p className="pt-1 text-xs text-red-500">
                    {state.errors.url[0]}
                  </p>
                )}
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
              <Button type="button" variant="secondary" ref={closeButtonRef}>
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
