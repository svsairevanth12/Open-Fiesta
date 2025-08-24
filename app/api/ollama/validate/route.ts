import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, apiKey: ollamaUrlFromBody } = body;
    
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing model name' }, { status: 400 });
    }

    // For Ollama, we get the base URL from the request body (user settings) or environment or default to localhost
    const ollamaUrl = ollamaUrlFromBody || process.env.OLLAMA_URL || 'http://localhost:11434';

    // First, test basic connectivity to the Ollama instance
    const pingController = new AbortController();
    const pingTimeoutId = setTimeout(() => pingController.abort(), 5000); // 5 second timeout for ping
    
    try {
      let pingResponse;
      try {
        pingResponse = await fetch(`${ollamaUrl}/`, {
          method: 'GET',
          signal: pingController.signal,
        });
        clearTimeout(pingTimeoutId);
        console.log(`Ollama ping response status: ${pingResponse.status}`);
      } catch (pingError) {
        clearTimeout(pingTimeoutId);
        console.log(`Ollama ping failed:`, pingError);
        return NextResponse.json({ 
          ok: false, 
          error: 'Cannot connect to Ollama instance', 
          details: pingError instanceof Error ? pingError.message : 'Unknown connection error'
        }, { status: 200 });
      }
      
      // Query Ollama models endpoint to check if the model exists
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${ollamaUrl}/api/tags`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Avoid caching so users get the freshest availability
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Ollama API response status: ${res.status}`);
      
      if (!res.ok) {
        // Try to get error details
        let errorDetails = '';
        try {
          const errorText = await res.text();
          errorDetails = ` (${res.status}: ${errorText})`;
          console.log(`Ollama API error details: ${errorText}`);
        } catch (e) {
          errorDetails = ` (HTTP ${res.status})`;
          console.log(`Failed to read error details: ${e}`);
        }
        return NextResponse.json({ 
          ok: false, 
          error: `Ollama connection error${errorDetails}`, 
          status: res.status 
        }, { status: 200 });
      }

      const textData = await res.text();
      console.log(`Ollama API response text:`, textData.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(textData);
      } catch (parseError) {
        console.log(`Failed to parse JSON:`, parseError);
        return NextResponse.json({ 
          ok: false, 
          error: 'Invalid JSON response from Ollama API', 
          details: textData.substring(0, 200) 
        }, { status: 200 });
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
      
      console.log(`Parsed model list:`, modelList);
      const found = modelList.find((m) => m && typeof m.name === 'string' && m.name === slug);
      console.log(`Found model:`, found);
      
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
      // Note: timeoutId is already cleared in the successful path above
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      console.log(`Fetch error: ${errorMessage}`);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          ok: false, 
          error: 'Connection timeout - Ollama instance not responding', 
          details: 'Request timed out after 10 seconds' 
        }, { status: 200 });
      }
      
      return NextResponse.json({ 
        ok: false, 
        error: `Failed to connect to Ollama instance`, 
        details: errorMessage 
      }, { status: 200 });
    }
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Unknown error';
    console.log(`General error: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}