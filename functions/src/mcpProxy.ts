import * as functions from "firebase-functions";
import fetch from "node-fetch";

interface McpToolRequestData {
  tool: "GeminiAnalisis" | "GuiaTaggeo";
  sessionId: string;
  payload?: Record<string, unknown>;
}

export const callMcpTool = functions.https.onCall(async (data) => {
  const {tool, sessionId, payload} = data.data as McpToolRequestData;

  const response: {
    status: "success" | "raw" | "error";
    tool: "GeminiAnalisis" | "GuiaTaggeo";
    sessionId: string;
    data: object | string | null;
    timestamp: string;
    raw_output?: boolean;
  } = {
    status: "error",
    tool: tool,
    sessionId: sessionId,
    data: null,
    timestamp: new Date().toISOString(),
  };

  try {
    const n8nResponse = await fetch(
      "https://n8n.multiplica.dev/mcp/7852532b-e8a8-495a-a3c3-3832ab0be53d",
      {
        method: "POST",
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
          "User-Agent": "FirebaseFunctionMCPClient/1.0",
        },
        body: JSON.stringify({
          sessionId,
          tool,
          timestamp: new Date().toISOString(),
          ...payload,
        }),
      }
    );

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      response.status = "error";
      response.data = {message: errorText, statusCode: n8nResponse.status};
      return response;
    }

    const contentType = n8nResponse.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await n8nResponse.json();
      response.status = "success";
      response.data = jsonResponse as Record<string, unknown>;
    } else {
      const textResponse = await n8nResponse.text();
      try {
        const jsonResponse = JSON.parse(textResponse);
        response.status = "success";
        response.data = jsonResponse;
      } catch (jsonError) {
        response.status = "raw";
        response.data = textResponse;
        response.raw_output = true;
      }
    }
  } catch (error: unknown) {
    response.status = "error";
    response.data = {
      message: (error instanceof Error) ? error.message : String(error),
    };
  }

  return response;
});
