import { runMcpTool } from "@/lib/mcpClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface McpToolCardProps {
  sessionId: string;
  tool: "GeminiAnalisis" | "GuiaTaggeo";
  onResult?: (result: any) => void;
}

export function McpToolCard({ sessionId, tool, onResult }: McpToolCardProps) {
  const [loading, setLoading] = useState(false);

  const label = tool === "GeminiAnalisis" ? "Generar análisis" : "Generar guía";

  async function handleRun() {
    setLoading(true);
    try {
      const result = await runMcpTool({
        sessionId,
        tool: tool,
      });
      if (onResult) {
        onResult(result);
      }
    } catch (e) {
      if (onResult) {
        onResult({ error: (e as Error).message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <CardHeader>
        <CardTitle className="text-lg">{tool === "GeminiAnalisis" ? "Análisis (Gemini)" : "Guía de Taggeo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button disabled={loading} onClick={handleRun}>
          {loading ? "Procesando…" : label}
        </Button>
      </CardContent>
    </Card>
  );
}
