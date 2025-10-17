import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This API route acts as a secure intermediary to the Google Cloud Function.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, pages, device, agentType } = body;

    if (!url || !pages || !device || !agentType) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    // The Cloud Function URL should be an environment variable.
    // Ensure this is set in your Vercel/deployment environment.
    const functionUrl = process.env.START_INSIGHT_FORGE_URL;

    if (!functionUrl) {
      console.error("START_INSIGHT_FORGE_URL environment variable not set.");
      return NextResponse.json({ message: 'Server configuration error: Function URL not set.' }, { status: 500 });
    }

    // We forward the request to the `startInsightForge` Cloud Function.
    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // If your function is protected, you'd add an Authorization header here.
        },
        body: JSON.stringify({ url, pages, device, agentType }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error calling Cloud Function:', errorText);
        return NextResponse.json({ message: 'Error from analysis service', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    // The Cloud Function returns the jobId, which we pass back to the client.
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
