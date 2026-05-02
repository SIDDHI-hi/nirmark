import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || query.length < 5) {
      return NextResponse.json({ optimized: null });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[Optimize API] GROQ_API_KEY is not set');
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a BIS Standards Search Expert. Rewrite the user query into a concise, highly technical search string for a standards database. Return ONLY the rewritten query. No "Did you mean", no preamble, no quotes, max 15 words.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Optimize API] Groq Error:', errText);
      return NextResponse.json({ error: 'Groq API error' }, { status: 500 });
    }

    const data = await response.json();
    const optimized = data.choices[0]?.message?.content?.trim();

    return NextResponse.json({ optimized });
  } catch (error: any) {
    console.error('[Optimize API] Request error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
