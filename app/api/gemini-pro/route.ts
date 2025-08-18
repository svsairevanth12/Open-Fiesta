import { NextRequest } from 'next/server';

// Dedicated endpoint for Gemini 2.5 Pro
export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey: apiKeyFromBody, imageDataUrl } = await req.json();
    const apiKey = apiKeyFromBody || process.env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing Gemini API key' }), { status: 400 });
    const geminiModel = 'gemini-2.5-pro';

    // Convert OpenAI-style messages to Gemini contents
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content ?? '' }],
    }));

    // Attach image to last user message if provided
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

    // Normalize response to plain text
    const cand = data?.candidates?.[0];
    const parts = cand?.content?.parts ?? [];
    let text = '';
    if (Array.isArray(parts)) {
      const collected = parts
        .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        .filter(Boolean);
      text = collected.join('\n');
    }
    if (!text && Array.isArray(parts) && parts.length) {
      // If no simple text, try to stringify meaningful structure
      text = parts
        .map((p: any) => {
          if (typeof p?.text === 'string') return p.text;
          if (p?.inline_data) return '[inline data]';
          const s = JSON.stringify(p);
          return typeof s === 'string' ? s : '';
        })
        .filter(Boolean)
        .join('\n');
    }
    if (!text) {
      const finish = cand?.finishReason || data?.finishReason;
      const blockReason = data?.promptFeedback?.blockReason || cand?.safetyRatings?.[0]?.category;
      const blocked = finish && String(finish).toLowerCase().includes('safety');
      if (blocked || blockReason) {
        text = `Gemini Pro blocked the content due to safety settings${blockReason ? ` (reason: ${blockReason})` : ''}. Try rephrasing your prompt.`;
      }
    }
    if (!text) {
      // Final fallback: compact stringify of candidate to avoid empty response
      const compact = (() => {
        try { return JSON.stringify(cand); } catch { return ''; }
      })();
      const hint = 'Gemini Pro returned an empty message. This can happen on shared quota. Try again, rephrase, or add your own Gemini API key in Settings.';
      text = compact || hint;
    }
    return Response.json({ text, raw: data });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}
