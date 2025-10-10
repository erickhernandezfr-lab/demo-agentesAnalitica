
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface McpResultsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jsonData: object;
  aiExplanation: string;
}

export function McpResultsPanel({ open, onOpenChange, jsonData, aiExplanation }: McpResultsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        <SheetHeader>
          <SheetTitle>Resultados del Análisis</SheetTitle>
          <SheetDescription>
            Visualiza el resultado del análisis y la explicación generada por IA.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>JSON Raw Output</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-muted p-2 rounded-lg mt-2 h-60 overflow-y-auto text-xs">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div>
            <h4 className="font-semibold">Explicación IA</h4>
            <div className="bg-muted p-2 rounded-lg mt-2">
              <p className="text-sm">{aiExplanation}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
