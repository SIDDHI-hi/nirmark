import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log(`[API] Forwarding query to FastAPI: "${query}"`);

    const response = await fetch('http://localhost:8000/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] FastAPI Error: ${errorText}`);
      return NextResponse.json({ error: 'Inference server error' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`[API] Connection error: ${error.message}`);
    return NextResponse.json({ error: 'Failed to connect to inference server' }, { status: 500 });
  }
}
