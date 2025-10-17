import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from '@/lib/firebase'; // This should be the server-side initialized app if available, or a client-side one for this case.

// This is a workaround because the functions SDK is primarily client-side.
// In a real-world scenario, you might use the Firebase Admin SDK here if this was a full backend,
// or call the function via a direct HTTP request.
// For simplicity, we use the client SDK which might need careful environment handling.

// Note: Directly calling a Cloud Function via HTTP from a serverless function (like this API route)
// is often a better pattern as it avoids client SDK complexities on the backend.
// We'll simulate a secure call here.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, pages, device, agentType } = body;

    if (!url || !pages || !device || !agentType) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    // This assumes you have a way to get an auth token if your function is protected.
    // For a public function (allowUnauthenticated), you can call it directly.
    const functionUrl = process.env.START_ANALYSIS_FUNCTION_URL;

    if (!functionUrl) {
      console.error("START_ANALYSIS_FUNCTION_URL environment variable not set.");
      return NextResponse.json({ message: 'Server configuration error: Function URL not set.' }, { status: 500 });
    }

    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // If your function is protected, you'd add an Authorization header here.
            // 'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ url, pages, device, agentType }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error calling Cloud Function:', errorText);
        return NextResponse.json({ message: 'Error from analysis service', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
