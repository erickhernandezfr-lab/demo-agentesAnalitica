import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface McpResultsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any; // The full result object from the MCP server
}

export function McpResultsPanel({ open, onOpenChange, result }: McpResultsPanelProps) {
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
          <Accordion type="single" collapsible defaultValue="raw">
            <AccordionItem value="raw">
              <AccordionTrigger>JSON Raw Output</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-muted p-2 rounded-lg mt-2 h-60 overflow-y-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="summary">
              <AccordionTrigger>Explicación IA</AccordionTrigger>
              <AccordionContent>
                <div className="bg-muted p-2 rounded-lg mt-2">
                  <p className="text-sm">
                    {result?.summary || result?.recomendaciones || "Sin explicación disponible"}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
