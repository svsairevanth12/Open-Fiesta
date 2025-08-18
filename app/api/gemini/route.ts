import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = await req.json();
    const apiKey = apiKeyFromBody || process.env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing Gemini API key' }), { status: 400 });
    const allowed = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);
    const requested = typeof model === 'string' ? model : 'gemini-2.5-flash';
    const geminiModel = allowed.has(requested) ? requested : 'gemini-2.5-flash';

    // Convert OpenAI-style messages to Gemini contents
    // Gemini expects: { contents: [{ role, parts: [{ text }] }, ...] }
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content ?? '' }],
    }));

    // If an image data URL is provided, attach it as inline_data to the last user message
    if (imageDataUrl && contents.length > 0) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          try {
            const [meta, base64] = String(imageDataUrl).split(',');
            const mt = /data:(.*?);base64/.exec(meta || '')?.[1] || 'image/png';
            contents[i].parts.push({ inline_data: { mime_type: mt, data: base64 } });
          } catch {}
          break;
        }
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          response_mime_type: 'text/plain',
        },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      const msg = data?.error?.message || data?.error || data;
      const errStr = typeof msg === 'string' ? msg : JSON.stringify(msg);
      if (resp.status === 429) {
        const text = 'This model hit a shared rate limit. Add your own Gemini API key in Settings for higher limits and reliability.';
        return Response.json({ text, error: errStr, code: 429, provider: 'gemini' });
      }
      return new Response(JSON.stringify({ error: errStr, raw: data }), { status: resp.status });
    }

    // Extract text
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') ?? '';
    return Response.json({ text, raw: data });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}
