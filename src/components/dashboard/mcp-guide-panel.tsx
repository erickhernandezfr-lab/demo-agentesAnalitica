import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface McpGuidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any; // The full result object from the MCP server
}

export function McpGuidePanel({ open, onOpenChange, result }: McpGuidePanelProps) {
  const downloadGuide = () => {
    const filename = "tagging_guide.json";
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

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
            {result?.tagging_guide ? (
              Array.isArray(result.tagging_guide) ? (
                <ul>
                  {result.tagging_guide.map((item: string, index: number) => (
                    <li key={index} className="text-sm mb-1">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{result.tagging_guide}</p>
              )
            ) : (
              <p className="text-sm">Aquí se mostrará la guía de taggeo generada.</p>
            )}
          </div>
          {result?.tagging_guide && (
            <Button onClick={downloadGuide}>Descargar Guía</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
