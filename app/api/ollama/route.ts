import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    const { messages, model, baseUrl } = await req.json();
    // For Ollama, we get the base URL from the request body (user settings) or environment or default to localhost
    const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    
    if (process.env.DEBUG_OLLAMA === '1') console.log(`Calling Ollama model: ${model} at ${ollamaUrl}`);
    
    // Convert messages to Ollama format
    const ollamaMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody = {
      model: model,
      messages: ollamaMessages,
      stream: false
    };

    if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama request body:`, JSON.stringify(requestBody, null, 2));
    
    const controller = new AbortController();
    timeoutId = setTimeout(() => {
      if (process.env.DEBUG_OLLAMA === '1') console.log('Ollama request timeout triggered');
      controller.abort();
    }, 45000); // 45 second timeout

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama error response:`, errorText);
      return new Response(JSON.stringify({ 
        error: `Ollama API error: ${response.status} ${response.statusText}`, 
        details: errorText,
        provider: 'ollama',
        code: response.status
      }), { status: 502 });
    }

    const data = await response.json();
    if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama response data:`, JSON.stringify(data, null, 2));
    
    // Extract the response text
    let text = '';
    if (data.message && data.message.content) {
      text = data.message.content;
    } else if (data.response) {
      text = data.response;
    } else {
      text = 'No response from Ollama';
    }

    return Response.json({ text, raw: data });
  } catch (e: unknown) {
    const err = e as Error;
    if (err?.name === 'AbortError') {
      if (process.env.DEBUG_OLLAMA === '1') console.log('Ollama request timed out');
      return new Response(JSON.stringify({ error: 'Ollama request timed out', provider: 'ollama', code: 504 }), { status: 504 });
    }
    const message = err?.message || 'Unknown error';
    if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama error:`, message);
    return new Response(JSON.stringify({ error: message, provider: 'ollama' }), { status: 500 });
  } finally {
    // Always clear the timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}