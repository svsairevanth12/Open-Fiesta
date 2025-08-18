import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, referer, title } = await req.json();
    const apiKey = apiKeyFromBody || process.env.OPENROUTER_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing OpenRouter API key' }), { status: 400 });
    if (!model) return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });

    const sanitize = (msgs: any[]) =>
      (Array.isArray(msgs) ? msgs : [])
        .map((m: any) => ({ role: m?.role, content: typeof m?.content === 'string' ? m.content : String(m?.content ?? '') }))
        .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'system');
    // Keep last 8 messages to avoid overly long histories for picky providers
    const trimmed = (arr: any[]) => (arr.length > 8 ? arr.slice(-8) : arr);
    const makeBody = (msgs: any) => ({ model, messages: trimmed(sanitize(msgs)) });
    const requestInit = (bodyObj: any) => ({
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer || 'http://localhost',
        'X-Title': title || 'Open Source Fiesta',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj),
    });

    // First attempt
    let resp = await fetch('https://openrouter.ai/api/v1/chat/completions', requestInit(makeBody(messages)) as any);

    let data = await resp.json();
    if (!resp.ok) {
      const err = (data?.error?.message || data?.error || data);
      const errStr = typeof err === 'string' ? err : JSON.stringify(err);
      if (resp.status === 429) {
        // Convert to a friendly guidance text while preserving raw error
        const text = 'This model hit a shared rate limit. Add your own OpenRouter API key in Settings for higher limits and reliability.';
        return Response.json({ text, error: errStr, code: 429, provider: 'openrouter' });
      }
      // Special-case retry for Sarvam: try with only the last user message
      if (typeof model === 'string' && /sarvam/i.test(model)) {
        const lastUser = Array.isArray(messages) ? [...messages].reverse().find((m: any) => m?.role === 'user' && (typeof m?.content === 'string' || m?.content)) : null;
        if (lastUser) {
          const simpleMsgs = [{ role: 'user', content: typeof lastUser.content === 'string' ? lastUser.content : String(lastUser.content) }];
          resp = await fetch('https://openrouter.ai/api/v1/chat/completions', requestInit(makeBody(simpleMsgs)) as any);
          data = await resp.json();
          if (resp.ok) {
            // continue to normalization below using new data
          } else {
            const err2 = (data?.error?.message || data?.error || data);
            const errStr2 = typeof err2 === 'string' ? err2 : JSON.stringify(err2);
            const friendly2 = `Provider returned error for ${model} (after retry): ${errStr2} [status ${resp.status}]`;
            return new Response(JSON.stringify({ error: errStr2, text: friendly2, code: resp.status }), { status: resp.status });
          }
        } else {
          const friendly = `Provider returned error for ${model}: ${errStr} [status ${resp.status}]`;
          return new Response(JSON.stringify({ error: errStr, text: friendly, code: resp.status }), { status: resp.status });
        }
      } else {
        // Return structured JSON but also a user-friendly text to render in UI
        const friendly = `Provider returned error${model ? ` for ${model}` : ''}: ${errStr} [status ${resp.status}]`;
        return new Response(JSON.stringify({ error: errStr, text: friendly, code: resp.status }), { status: resp.status });
      }
    }

    // Normalize content to a plain string
    const choice = data?.choices?.[0] || {};
    const msg = choice?.message || {};
    let content: any = msg?.content;
    let text = '';
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      // Array of content blocks (e.g., {type:'text', text:'...'}, {type:'reasoning', ...})
      text = content
        .map((c: any) => {
          if (!c) return '';
          if (typeof c === 'string') return c;
          if (typeof c.text === 'string') return c.text;
          if (typeof c.content === 'string') return c.content;
          if (typeof c.value === 'string') return c.value;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    } else if (content && typeof content === 'object') {
      // Some providers nest text inside content.text
      if (typeof content.text === 'string') {
        text = content.text;
      } else {
        text = JSON.stringify(content);
      }
    }

    // DeepSeek-style reasoning tags often include <think> ... </think>
    const stripReasoning = (s: string) =>
      s
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<\|?thought_(start|end)\|>/gi, '')
        .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
        .trim();

    if (!text) {
      // Additional fallbacks seen across some providers
      const alt = choice?.content || msg?.response_text || msg?.result || (data as any)?.output_text;
      if (typeof alt === 'string') text = alt;
      else if (Array.isArray(alt)) {
        text = alt.map((c: any) => (typeof c?.text === 'string' ? c.text : typeof c?.content === 'string' ? c.content : typeof c === 'string' ? c : '')).filter(Boolean).join('\n');
      }
    }

    if (text) {
      const stripped = stripReasoning(text);
      text = stripped || text; // avoid stripping to empty
    }

    if (!text) {
      text = 'No response from provider.';
    }

    return Response.json({ text, raw: data });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}
