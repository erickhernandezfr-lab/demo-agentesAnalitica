
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface McpLogsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: string[];
  screenshots: string[];
}

export function McpLogsPanel({ open, onOpenChange, logs, screenshots }: McpLogsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        <SheetHeader>
          <SheetTitle>Logs del Proceso</SheetTitle>
          <SheetDescription>
            Visualiza los logs y archivos generados durante la sesión.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-semibold">Logs</h4>
            <div className="bg-muted p-2 rounded-lg mt-2 h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <p key={index} className="text-sm font-mono">{`[${index + 1}] ${log}`}</p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Screenshots</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {screenshots.map((src, index) => (
                <div key={index} className="relative">
                  <Image
                    src={src}
                    alt={`Screenshot ${index + 1}`}
                    width={200}
                    height={150}
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
           <div>
            <h4 className="font-semibold">Archivos Generados</h4>
            <div className="flex justify-between items-center mt-2">
                <p className="text-sm">scrapping_results.json</p>
                <Button variant="outline" size="sm">Descargar</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
