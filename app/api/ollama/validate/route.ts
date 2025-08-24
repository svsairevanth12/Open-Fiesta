import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { slug, apiKey: ollamaUrlFromBody } = await req.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing model name' }, { status: 400 });
    }

    // For Ollama, we get the base URL from the request body (user settings) or environment or default to localhost
    const ollamaUrl = ollamaUrlFromBody || process.env.OLLAMA_URL || 'http://localhost:11434';

    // Query Ollama models endpoint to check if the model exists
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Avoid caching so users get the freshest availability
      cache: 'no-store',
    });

    if (!res.ok) {
      // Forward status for clarity
      return NextResponse.json({ ok: false, error: 'Ollama connection error', status: res.status }, { status: 200 });
    }

    const data = await res.json();
    const list: Array<{ name: string }> = data?.models || [];
    const found = list.find((m) => m.name === slug);

    return NextResponse.json({ ok: true, exists: !!found });
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}