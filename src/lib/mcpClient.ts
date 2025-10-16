import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export async function runMcpTool({
  sessionId,
  tool,
  payload,
}: {
  sessionId: string;
  tool: "GeminiAnalisis" | "GuiaTaggeo";
  payload?: Record<string, any>;
}) {
  if (!functions) {
    throw new Error("Firebase Functions is not initialized. Make sure you are running on the client-side.");
  }
  
  const callMcpToolCallable = httpsCallable(functions, "callMcpTool");

  const result = await callMcpToolCallable({
    sessionId,
    tool,
    payload,
  });

  const responseData = result.data as any;

  if (responseData.status === "error") {
    throw new Error(responseData.data.message || "Unknown error from MCP server");
  }

  return responseData.data;
}
