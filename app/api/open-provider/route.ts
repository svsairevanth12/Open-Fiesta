import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = await req.json();
    // Use the provided token or fallback to environment variable
    const apiKey = apiKeyFromBody || process.env.OPEN_PROVIDER_API_KEY || 'tQ14HuL-wtewmt1H';
    const usedKeyType = apiKeyFromBody ? 'user' : (process.env.OPEN_PROVIDER_API_KEY ? 'shared' : 'default');
    
    if (!model) return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });

    // Sanitize and validate messages
    type InMsg = { role?: unknown; content?: unknown };
    type OutMsg = { role: 'user' | 'assistant' | 'system'; content: string };

    const isRole = (r: unknown): r is OutMsg['role'] => r === 'user' || r === 'assistant' || r === 'system';
    const sanitize = (msgs: unknown[]): OutMsg[] =>
      (Array.isArray(msgs) ? (msgs as InMsg[]) : [])
        .map((m) => {
          const role = isRole(m?.role) ? m.role : 'user';
          const content = typeof m?.content === 'string' ? m.content : String(m?.content ?? '');
          return { role, content };
        })
        .filter((m) => isRole(m.role));

    const sanitizedMessages = sanitize((messages as unknown[]) || []);
    
    // Keep last 8 messages to avoid overly long histories
    const trimmedMessages = sanitizedMessages.length > 8 ? sanitizedMessages.slice(-8) : sanitizedMessages;

    // Extract the last user message as the prompt for image generation
    const lastUserMessage = trimmedMessages.filter(msg => msg.role === 'user').pop();
    const prompt = lastUserMessage ? lastUserMessage.content : 'A beautiful image';

    // Handle different model categories
    const isImageModel = ['flux', 'kontext', 'turbo'].includes(model);
    const isAudioModel = model === 'openai-audio';

    if (isImageModel) {
      // For image models, use the image generation endpoint with token authentication
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=${encodeURIComponent(model)}&nologo=true&enhance=true&token=${encodeURIComponent(apiKey)}`;

      // For image generation, we don't need to fetch the image, just return the URL
      // The image will be displayed directly in the chat using the markdown image syntax
      const text = `![Generated Image](${imageUrl})`;
      return Response.json({
        text,
        imageUrl,
        provider: 'open-provider',
        usedKeyType
      });
    }

    // For text and audio models, use the text generation endpoint with token
    const textUrl = `https://text.pollinations.ai/?token=${encodeURIComponent(apiKey)}`;

    // Prepare the request body for Pollinations API
    const requestBody = {
      messages: trimmedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      model: model,
      stream: false,
      // Add voice parameter for audio models
      ...(isAudioModel ? { voice: 'alloy' } : {})
    };

    const timeoutMs = 120000; // 120s timeout
    const aborter = new AbortController();
    const timeoutId = setTimeout(() => aborter.abort(), timeoutMs);

    try {
      const resp = await fetch(textUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Open-Fiesta/1.0',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: aborter.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => 'Unknown error');
        const friendlyError = (() => {
          if (resp.status === 429) {
            return 'Rate limit exceeded. Please try again in a moment.';
          }
          if (resp.status === 503) {
            return 'Service temporarily unavailable. Please try again later.';
          }
          if (resp.status >= 500) {
            return 'Server error occurred. Please try again later.';
          }
          return `Provider returned error [status ${resp.status}]`;
        })();

        if (resp.status === 429) {
          return Response.json({ 
            text: friendlyError, 
            error: errorText, 
            code: 429, 
            provider: 'open-provider', 
            usedKeyType 
          });
        }

        return Response.json({ 
          text: friendlyError, 
          error: errorText, 
          code: resp.status, 
          provider: 'open-provider', 
          usedKeyType 
        }, { status: resp.status });
      }

      // Try to parse JSON response first
      let data;
      const responseText = await resp.text();
      
      try {
        data = JSON.parse(responseText);
      } catch {
        // If not JSON, treat as plain text response
        data = { text: responseText };
      }

      // Extract text from response
      let text = '';
      let audioUrl = null;

      if (typeof data === 'string') {
        text = data;
      } else if (data && typeof data.text === 'string') {
        text = data.text;
      } else if (data && typeof data.content === 'string') {
        text = data.content;
      } else if (data && data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
        text = data.choices[0].message.content;
      } else if (responseText) {
        text = responseText;
      }

      // Check for audio URL in response (for audio models)
      if (isAudioModel && data && data.audio_url) {
        audioUrl = data.audio_url;
        text = `[AUDIO:${audioUrl}]`; // Special format for audio
      } else if (isAudioModel && text && text.includes('http') && (text.includes('.mp3') || text.includes('.wav') || text.includes('.m4a'))) {
        // Extract audio URL from text response
        const urlMatch = text.match(/(https?:\/\/[^\s]+\.(?:mp3|wav|m4a))/i);
        if (urlMatch) {
          audioUrl = urlMatch[1];
          text = `[AUDIO:${audioUrl}]`;
        }
      }

      // Ensure we have some response
      if (!text || text.trim() === '') {
        text = 'No response generated. Please try again with a different prompt.';
      }

      return Response.json({
        text: text.trim(),
        audioUrl,
        raw: data,
        provider: 'open-provider',
        usedKeyType
      });

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return Response.json({ 
          text: 'Request timed out. Please try again with a shorter prompt.', 
          error: 'Timeout', 
          code: 408, 
          provider: 'open-provider', 
          usedKeyType 
        }, { status: 408 });
      }

      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return Response.json({ 
        text: 'Failed to generate response. Please try again.', 
        error: errorMsg, 
        code: 500, 
        provider: 'open-provider', 
        usedKeyType 
      }, { status: 500 });
    }

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message, 
      provider: 'open-provider' 
    }), { status: 500 });
  }
}
