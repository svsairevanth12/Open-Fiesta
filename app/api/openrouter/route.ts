import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, referer, title } = await req.json();
    const apiKey = apiKeyFromBody || process.env.OPENROUTER_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing OpenRouter API key' }), { status: 400 });
    if (!model) return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer || 'http://localhost',
        'X-Title': title || 'AI Fiesta',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      const err = (data?.error?.message || data?.error || data);
      const errStr = typeof err === 'string' ? err : JSON.stringify(err);
      if (resp.status === 429) {
        // Convert to a friendly guidance text while preserving raw error
        const text = 'This model hit a shared rate limit. Add your own OpenRouter API key in Settings for higher limits and reliability.';
        return Response.json({ text, error: errStr, code: 429, provider: 'openrouter' });
      }
      return new Response(JSON.stringify({ error: errStr }), { status: resp.status });
    }

    // Normalize content to a plain string
    let content: any = data?.choices?.[0]?.message?.content;
    let text = '';
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      // Some providers may return an array of content blocks
      text = content
        .map((c: any) => {
          if (typeof c === 'string') return c;
          if (typeof c?.text === 'string') return c.text;
          if (typeof c?.content === 'string') return c.content;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    } else if (content && typeof content === 'object') {
      // Fallback stringify if unexpected object shape
      text = JSON.stringify(content);
    }

    return Response.json({ text, raw: data });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}
