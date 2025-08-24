import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: ollamaUrlFromBody } = await req.json();
    const ollamaUrl = ollamaUrlFromBody || process.env.OLLAMA_URL || 'http://localhost:11434';
    
    if (!ollamaUrl) return new Response(JSON.stringify({ error: 'Missing Ollama URL' }), { status: 400 });
    
    // Convert messages to Ollama format
    const ollamaMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // For Ollama, if model is 'custom', we should use the model name from the configuration
    // Otherwise, use the model name directly
    let ollamaModel = model;
    if (model === 'custom') {
      // Try to get the model name from environment variable or default to llama3
      ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
    }

    const requestBody = {
      model: ollamaModel,
      messages: ollamaMessages,
      stream: false
    };

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: `Ollama API error: ${response.status} ${response.statusText}`, 
        details: errorText 
      }), { status: response.status });
    }

    const data = await response.json();
    
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
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}