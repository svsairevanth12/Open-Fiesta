"use client";
import { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { ApiKeys } from '@/lib/types';

export default function Settings() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useLocalStorage<ApiKeys>('ai-fiesta:keys', {});
  const [gemini, setGemini] = useState(keys.gemini || '');
  const [openrouter, setOpenrouter] = useState(keys.openrouter || '');

  const save = () => {
    const next = { gemini: gemini.trim() || undefined, openrouter: openrouter.trim() || undefined };
    setKeys(next);
    setOpen(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="text-xs px-2.5 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10">Settings</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-zinc-900 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">API Keys</h2>
              <button onClick={() => setOpen(false)} className="text-sm opacity-75 hover:opacity-100">Close</button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">Keys are stored locally in your browser via localStorage and sent only with your requests. Do not hardcode keys in code.</p>
            <label className="block text-sm mb-1">Gemini API Key</label>
            <input value={gemini} onChange={(e) => setGemini(e.target.value)} placeholder="AIza..." className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 mb-3" />
            <label className="block text-sm mb-1">OpenRouter API Key</label>
            <input value={openrouter} onChange={(e) => setOpenrouter(e.target.value)} placeholder="sk-or-..." className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded bg-white/10 border border-white/10">Close</button>
              <button onClick={save} className="px-3 py-1.5 rounded bg-[#e42a42] hover:bg-[#cf243a]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
