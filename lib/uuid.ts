// Safe UUID generator: uses crypto.randomUUID when available, otherwise falls back to a simple v4 implementation
export function safeUUID(): string {
  // Browser crypto.randomUUID
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    try { return (crypto as any).randomUUID(); } catch {}
  }
  // Node 19+ globalThis.crypto
  if (typeof globalThis !== 'undefined') {
    const g: any = globalThis as any;
    if (g.crypto && typeof g.crypto.randomUUID === 'function') {
      try { return g.crypto.randomUUID(); } catch {}
    }
  }
  // Fallback (not cryptographically strong)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
