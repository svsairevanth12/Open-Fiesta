import { NextRequest } from 'next/server';

export const runtime = 'edge';

function sseEncode(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, referer, title } = await req.json();
    const apiKey = apiKeyFromBody || process.env.OPENROUTER_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : (process.env.OPENROUTER_API_KEY ? 'shared' : 'none');
    if (!apiKey) return new Response('Missing OpenRouter API key', { status: 400 });
    if (!model) return new Response('Missing model id', { status: 400 });

    const body = {
      model,
      messages,
      stream: true,
    };

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer || 'http://localhost',
        'X-Title': title || 'Open Source Fiesta',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const headers = new Headers({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => '');
      const code = upstream.status || 500;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(sseEncode({ error: errText || 'Upstream error', code, provider: 'openrouter', usedKeyType })));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(stream, { status: 200, headers });
    }

    const reader = upstream.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = '';

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Send a small meta event
        controller.enqueue(encoder.encode(sseEncode({ provider: 'openrouter', usedKeyType })));

        const push = (): Promise<void> => reader.read().then(({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
          if (done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          // OpenRouter sends SSE lines starting with 'data: '
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(payload);
              // Try OpenAI-style delta
              const delta = json?.choices?.[0]?.delta;
              let text = '';
              if (typeof delta?.content === 'string') {
                text = delta.content;
              } else if (Array.isArray(delta?.content)) {
                text = (delta.content as unknown[]).map((c: unknown) => {
                  if (!c) return '';
                  if (typeof c === 'string') return c;
                  const obj = c as { text?: unknown; content?: unknown; value?: unknown };
                  if (typeof obj.text === 'string') return obj.text;
                  if (typeof obj.content === 'string') return obj.content;
                  if (typeof obj.value === 'string') return obj.value;
                  return '';
                }).filter(Boolean).join('');
              }
              if (text) {
                controller.enqueue(encoder.encode(sseEncode({ delta: text })));
              }
              // forward error-like responses if present
              if (json?.error) {
                controller.enqueue(encoder.encode(sseEncode({ error: json.error?.message || 'error', code: json.error?.code, provider: 'openrouter', usedKeyType })));
              }
            } catch {
              // ignore parse errors
            }
          }
          return push();
        });
        push();
      },
      cancel() {
        try { reader.cancel(); } catch {}
      }
    });

    return new Response(stream, { status: 200, headers });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(message, { status: 500 });
  }
}
