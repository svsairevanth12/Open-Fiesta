// Simple in-memory counter for tracking active Ollama requests
// Note: This is not perfect for serverless environments but works for basic cases
let activeRequests = 0;

export function incrementActiveRequests(): number {
  return ++activeRequests;
}

export function decrementActiveRequests(): number {
  return --activeRequests;
}

export function getActiveRequests(): number {
  return activeRequests;
}

// Reset function for testing purposes
export function resetActiveRequests(): void {
  activeRequests = 0;
}