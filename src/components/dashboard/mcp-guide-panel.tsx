
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface McpGuidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: string;
}

export function McpGuidePanel({ open, onOpenChange, guide }: McpGuidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        <SheetHeader>
          <SheetTitle>Guía de Taggeo</SheetTitle>
          <SheetDescription>
            Recomendaciones para mejorar el taggeo de tu sitio.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="bg-muted p-2 rounded-lg mt-2 h-80 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{guide}</p>
          </div>
          <Button>Descargar Guía</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
