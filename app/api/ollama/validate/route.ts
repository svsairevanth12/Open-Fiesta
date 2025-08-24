import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, baseUrl } = body;
    
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing model name' }, { status: 400 });
    }

    // For Ollama, we get the base URL from the request body (user settings) or environment or default to localhost
    const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';

    // First, test basic connectivity to the Ollama instance
    let pingTimeoutId: NodeJS.Timeout | null = null;
    const pingController = new AbortController();
    
    try {
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Testing connectivity to Ollama at: ${ollamaUrl}`);
      
      pingTimeoutId = setTimeout(() => {
        if (process.env.DEBUG_OLLAMA === '1') console.log('Ollama ping timeout triggered');
        pingController.abort();
      }, 15000); // 15 seconds for debugging

      const pingResponse = await fetch(`${ollamaUrl}/`, {
        method: 'GET',
        signal: pingController.signal,
      });
      
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama ping response status: ${pingResponse.status}`);
      
      if (!pingResponse.ok) {
        const errorText = await pingResponse.text();
        if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama ping error response: ${errorText}`);
        return NextResponse.json({ 
          ok: false, 
          error: 'Cannot connect to Ollama instance', 
          details: `Ollama returned HTTP ${pingResponse.status}: ${errorText || pingResponse.statusText}`
        }, { status: 502 });
      }
    } catch (pingError) {
      const err = pingError as Error;
      if (err?.name === 'AbortError') {
        if (process.env.DEBUG_OLLAMA === '1') console.log('Ollama ping timed out');
        return NextResponse.json({ 
          ok: false, 
          error: 'Cannot connect to Ollama instance', 
          details: 'Connection timeout - Ollama instance not responding. Check network connectivity and Ollama configuration.'
        }, { status: 504 });
      }
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama ping failed:`, err);
      return NextResponse.json({ 
        ok: false, 
        error: 'Cannot connect to Ollama instance', 
        details: err instanceof Error ? err.message : 'Unknown connection error'
      }, { status: 502 });
    } finally {
      // Always clear the ping timeout
      if (pingTimeoutId) {
        clearTimeout(pingTimeoutId);
      }
    }
      
    // Query Ollama models endpoint to check if the model exists
    let timeoutId: NodeJS.Timeout | null = null;
    const controller = new AbortController();
    
    try {
      timeoutId = setTimeout(() => {
        if (process.env.DEBUG_OLLAMA === '1') console.log('Ollama models fetch timeout triggered');
        controller.abort();
      }, 15000); // 15 seconds for debugging
      
      const res = await fetch(`${ollamaUrl}/api/tags`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Avoid caching so users get the freshest availability
        cache: 'no-store',
        signal: controller.signal,
      });
      
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama API response status: ${res.status}`);
      
      if (!res.ok) {
        // Try to get error details
        let errorDetails = '';
        try {
          const errorText = await res.text();
          errorDetails = ` (${res.status}: ${errorText})`;
          if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama API error details: ${errorText}`);
        } catch (e) {
          errorDetails = ` (HTTP ${res.status})`;
          if (process.env.DEBUG_OLLAMA === '1') console.log(`Failed to read error details: ${e}`);
        }
        return NextResponse.json({ 
          ok: false, 
          error: `Ollama connection error${errorDetails}`, 
          status: res.status 
        }, { status: 502 });
      }

      const textData = await res.text();
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama API response text:`, textData.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(textData);
      } catch (parseError) {
        if (process.env.DEBUG_OLLAMA === '1') console.log(`Failed to parse JSON:`, parseError);
        return NextResponse.json({ 
          ok: false, 
          error: 'Invalid JSON response from Ollama API', 
          details: textData.substring(0, 200) 
        }, { status: 502 });
      }
      
      // Handle different response formats
      let modelList: Array<{ name: string }> = [];
      if (Array.isArray(data)) {
        modelList = data;
      } else if (data && typeof data === 'object') {
        // Check for models array in different possible locations
        if (Array.isArray(data.models)) {
          modelList = data.models;
        } else if (Array.isArray((data as any).data)) {
          modelList = (data as any).data;
        }
      }
      
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Parsed model list:`, modelList);
      const found = modelList.find((m) => m && typeof m.name === 'string' && m.name === slug);
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Found model:`, found);
      
      // Prepare response with available models for better UX
      const response: { ok: true; exists: boolean; availableModels?: string[] } = { ok: true, exists: !!found };
      
      // If model not found, provide list of available models
      if (!found && modelList.length > 0) {
        response.availableModels = modelList
          .map(m => m.name)
          .filter((name): name is string => typeof name === 'string')
          .slice(0, 10); // Limit to first 10 models
      }

      return NextResponse.json(response);
    } catch (fetchError: unknown) {
      const err = fetchError as Error;
      if (err?.name === 'AbortError') {
        return NextResponse.json({ 
          ok: false, 
          error: 'Connection timeout - Ollama instance not responding', 
          details: 'Request timed out after 15 seconds. Check network connectivity and Ollama configuration.'
        }, { status: 504 });
      }
      
      const errorMessage = err?.message || 'Unknown error';
      if (process.env.DEBUG_OLLAMA === '1') console.log(`Fetch error: ${errorMessage}`);
      
      return NextResponse.json({ 
        ok: false, 
        error: `Failed to connect to Ollama instance`, 
        details: errorMessage 
      }, { status: 502 });
    } finally {
      // Always clear the timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Unknown error';
    if (process.env.DEBUG_OLLAMA === '1') console.log(`General error: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}