"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, User, Github } from "lucide-react";
import Settings from "@/components/Settings";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { MODEL_CATALOG } from "@/lib/models";
import { AiModel, ChatMessage, ApiKeys, ChatThread } from "@/lib/types";
import { callGemini, callOpenRouter } from "@/lib/client";
import { AiInput } from "@/components/AIChatBox";
import MarkdownLite from "@/components/MarkdownLite";

export default function Home() {
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>(
    "ai-fiesta:selected-models",
    [
      "gemini-2.5-flash",
      "deepseek-r1",
      "llama-3.3-70b-instruct",
      "moonshot-kimi-k2",
      "qwen-2.5-72b-instruct",
    ]
  );
  const [keys] = useLocalStorage<ApiKeys>("ai-fiesta:keys", {});
  const [threads, setThreads] = useLocalStorage<ChatThread[]>("ai-fiesta:threads", []);
  const [activeId, setActiveId] = useLocalStorage<string | null>("ai-fiesta:active-thread", null);
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>("ai-fiesta:sidebar-open", true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modelsModalOpen, setModelsModalOpen] = useState(false);
  const activeThread = useMemo(() => threads.find(t => t.id === activeId) || null, [threads, activeId]);
  const messages = activeThread?.messages ?? [];
  const [input, setInput] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const selectedModels = useMemo(() => MODEL_CATALOG.filter(m => selectedIds.includes(m.id)), [selectedIds]);
  const anyLoading = loadingIds.length > 0;

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length >= 5 ? prev : [...prev, id]));
  };

  function ensureThread() {
    if (activeThread) return activeThread;
    const t: ChatThread = { id: crypto.randomUUID(), title: "New Chat", messages: [], createdAt: Date.now() };
    setThreads(prev => [t, ...prev]);
    setActiveId(t.id);
    return t;
  }

  async function send(text: string, imageDataUrl?: string) {
    const prompt = text.trim();
    if (!prompt) return;
    if (selectedModels.length === 0) return alert("Select at least one model.");
    const userMsg: ChatMessage = { role: "user", content: prompt, ts: Date.now() };
    const thread = ensureThread();
    const nextHistory = [...(thread.messages ?? []), userMsg];
    // set thread messages and optional title
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, title: thread.title === "New Chat" ? prompt.slice(0, 40) : t.title, messages: nextHistory } : t));
    setInput("");

    // fire all selected models in parallel
    setLoadingIds(selectedModels.map(m => m.id));
    await Promise.allSettled(selectedModels.map(async (m: AiModel) => {
      try {
        let res: any;
        if (m.provider === "gemini") {
          // If user hasn't set a key, rely on server env fallback
          res = await callGemini({ apiKey: keys.gemini || undefined, model: m.model, messages: nextHistory, imageDataUrl });
        } else {
          res = await callOpenRouter({ apiKey: keys.openrouter || undefined, model: m.model, messages: nextHistory });
        }
        const text = res?.text || res?.error || "No response";
        const asst: ChatMessage = { role: "assistant", content: String(text), modelId: m.id, ts: Date.now() };
        // Append to current thread messages to accumulate answers from multiple models
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } catch (e: any) {
        const asst: ChatMessage = { role: "assistant", content: `[${m.label}] Error: ${e?.message || e}`, modelId: m.id, ts: Date.now() };
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } finally {
        setLoadingIds(prev => prev.filter(x => x !== m.id));
      }
    }));
  }

  // group assistant messages by turn for simple compare view
  const pairs = useMemo(() => {
    const rows: { user: ChatMessage; answers: ChatMessage[] }[] = [];
    let currentUser: ChatMessage | null = null;
    for (const m of messages) {
      if (m.role === "user") {
        currentUser = m;
        rows.push({ user: m, answers: [] });
      } else if (m.role === "assistant" && currentUser) {
        rows[rows.length - 1]?.answers.push(m);
      }
    }
    return rows;
  }, [messages]);

  return (
    <div className="min-h-screen w-full bg-black relative text-white">
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #c81e3a 0%, #a51d35 16%, #7d1a2f 32%, #591828 46%, #3c1722 60%, #2a151d 72%, #1f1317 84%, #141013 94%, #0a0a0a 100%), radial-gradient(90% 75% at 50% 50%, rgba(228,42,66,0.06) 0%, rgba(228,42,66,0) 55%), radial-gradient(150% 120% at 8% 8%, rgba(0,0,0,0) 42%, #0b0a0a 82%, #070707 100%), radial-gradient(150% 120% at 92% 92%, rgba(0,0,0,0) 42%, #0b0a0a 82%, #070707 100%), radial-gradient(60% 50% at 50% 60%, rgba(240,60,80,0.06), rgba(0,0,0,0) 60%), #050505" }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)", opacity: 0.95 }}
      />

      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="flex gap-3 lg:gap-4">
          {/* Sidebar */}
          {/* Desktop sidebar */}
          <aside className={`relative hidden lg:flex shrink-0 h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] rounded-lg border border-white/10 bg-white/5 p-3 flex-col transition-[width] duration-300 ${sidebarOpen ? 'w-64' : 'w-14'}`}>
            {/* Collapse/Expand toggle */}
            <button
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-5 z-10 h-6 w-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20"
            >
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className={`flex items-center justify-between mb-2 ${sidebarOpen ? '' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e42a42]" />
                <h2 className="text-sm font-semibold">OpenSource Fiesta</h2>
              </div>
            </div>

            {/* When collapsed, show only a big plus button centered */}
            {sidebarOpen ? (
              <>
                <button
                  onClick={() => {
                    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                    setThreads(prev => [t, ...prev]);
                    setActiveId(t.id);
                  }}
                  className="mb-3 text-sm px-3 py-2 rounded-md bg-[#e42a42] hover:bg-[#cf243a]"
                >
                  + New Chat
                </button>
                <div className="text-xs uppercase tracking-wide opacity-60 mb-2">Chats</div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {threads.length === 0 && <div className="text-xs opacity-60">No chats yet</div>}
                  {threads.map(t => (
                    <button key={t.id} onClick={() => setActiveId(t.id)} className={`w-full text-left px-2 py-2 rounded-md text-sm border ${t.id === activeId ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                      {t.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center pt-6">
                {/* New chat button */}
                <button
                  title="New Chat"
                  onClick={() => {
                    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                    setThreads(prev => [t, ...prev]);
                    setActiveId(t.id);
                  }}
                  className="h-8 w-8 rounded-full bg-[#e42a42] hover:bg-[#cf243a] flex items-center justify-center mb-4 mx-auto shrink-0"
                >
                  <Plus size={14} />
                </button>

                {/* Mini chat boxes list */}
                <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 pt-1 pb-2">
                  {threads.map(t => {
                    const isActive = t.id === activeId;
                    const letter = (t.title || 'Untitled').trim()[0]?.toUpperCase() || 'N';
                    return (
                      <button
                        key={t.id}
                        title={t.title || 'Untitled'}
                        onClick={() => setActiveId(t.id)}
                        className={`h-6 w-6 aspect-square rounded-full flex items-center justify-center transition-colors focus-visible:outline-none mx-auto shrink-0 
                          ${isActive ? 'bg-white/20 ring-1 ring-white/30 ring-offset-1 ring-offset-black' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        <span className="text-[10px] font-semibold leading-none">
                          {letter}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Mobile sidebar drawer */}
          {mobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-zinc-900/90 border-r border-white/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e42a42]" />
                    <h2 className="text-sm font-semibold">OpenSource Fiesta</h2>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="text-xs px-2 py-1 rounded bg-white/10">Close</button>
                </div>
                <button
                  onClick={() => {
                    const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
                    setThreads(prev => [t, ...prev]);
                    setActiveId(t.id);
                    setMobileSidebarOpen(false);
                  }}
                  className="mb-3 text-sm px-3 py-2 w-full rounded-md bg-[#e42a42] hover:bg-[#cf243a]"
                >
                  + New Chat
                </button>
                <div className="text-xs uppercase tracking-wide opacity-60 mb-2">Chats</div>
                <div className="h-[70vh] overflow-y-auto space-y-1 pr-1">
                  {threads.length === 0 && <div className="text-xs opacity-60">No chats yet</div>}
                  {threads.map(t => (
                    <button key={t.id} onClick={() => { setActiveId(t.id); setMobileSidebarOpen(false); }} className={`w-full text-left px-2 py-2 rounded-md text-sm border ${t.id === activeId ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                      {t.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-xs px-2 py-1 rounded bg-white/10 border border-white/15">Menu</button>
                <h1 className="text-lg font-semibold">OpenSource Fiesta</h1>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/byteHumi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-zinc-300 hover:text-white"
                  title="Open Niladri on X"
                >
                  <img
                    src="/image.png"
                    alt="Niladri avatar"
                    className="h-5 w-5 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="opacity-90 hidden sm:inline text-sm">Made by <span className="font-semibold underline decoration-dotted">Niladri</span></span>
                </a>
                <a
                  href="https://github.com/NiladriHazra/Open-Fiesta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#e42a42] text-white border border-white/10 hover:bg-[#cf243a] ml-1"
                  title="Star on GitHub"
                >
                  <Github size={14} />
                  <span className="hidden sm:inline">Star on GitHub</span>
                  <span className="sm:hidden">Star</span>
                </a>
              </div>
            </div>

            {/* Selected models row + Change button */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {selectedModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  className="px-2.5 py-1 text-xs rounded-full bg-[#e42a42] text-white border border-white/10 hover:bg-[#cf243a] flex items-center gap-2"
                  title="Click to toggle"
                >
                  <span className="truncate max-w-[180px]">{m.label}</span>
                  <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-white/30">
                    <span className="h-3 w-3 rounded-full bg-white translate-x-3.5" />
                  </span>
                </button>
              ))}
              {selectedModels.length === 0 && (
                <span className="text-xs text-zinc-400">No models selected</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setModelsModalOpen(true)}
                  className="text-xs px-2.5 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Change models
                </button>
                <Settings />
              </div>
            </div>

            {modelsModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/70" onClick={() => setModelsModalOpen(false)} />
                <div className="relative w-full max-w-2xl mx-auto rounded-lg border border-white/10 bg-zinc-900/95 p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Select up to 5 models</h3>
                    <button onClick={() => setModelsModalOpen(false)} className="text-xs px-2 py-1 rounded bg-white/10">Close</button>
                  </div>
                  <div className="text-xs text-zinc-400 mb-3">Selected: {selectedIds.length}/5</div>
                  <div className="flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto pr-1">
                    {MODEL_CATALOG.map((m) => {
                      const selected = selectedIds.includes(m.id);
                      const disabled = !selected && selectedIds.length >= 5;
                      return (
                        <button
                          key={m.id}
                          onClick={() => !disabled && toggle(m.id)}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors flex items-center justify-between gap-3 min-w-[240px] ${
                            selected
                              ? 'bg-[#e42a42] text-white border-white/10'
                              : disabled
                              ? 'bg-white/5 text-zinc-500 border-white/10 cursor-not-allowed opacity-60'
                              : 'bg-white/5 text-zinc-200 border-white/10 hover:bg-white/10'
                          }`}
                          title={selected ? 'Click to unselect' : disabled ? 'Limit reached' : 'Click to select'}
                        >
                          <span className="truncate pr-1">{m.label}</span>
                          {/* Toggle visual */}
                          <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${selected ? 'bg-white/30' : 'bg-white/10'}`}>
                            <span className={`h-3 w-3 rounded-full bg-white transition-transform ${selected ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setModelsModalOpen(false)} className="px-3 py-1.5 rounded bg-white/10 border border-white/10 text-sm">Close</button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages area */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-2 overflow-x-auto flex-1 overflow-y-auto pb-28">
              {selectedModels.length === 0 ? (
                <div className="p-4 text-zinc-400">Select up to 5 models to compare.</div>
              ) : (
                <div className="min-w-full space-y-3">
                  {/* Header row: model labels */}
                  <div
                    className="grid gap-3 items-end"
                    style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(260px, 1fr))` }}
                  >
                    {selectedModels.map((m) => (
                      <div key={m.id} className="px-1 py-1 border-b border-white/10 flex items-center justify-between">
                        <div className="text-[13px] font-medium opacity-90 truncate pr-2">{m.label}</div>
                        {loadingIds.includes(m.id) && <span className="text-[11px] text-[#e42a42]">Thinking…</span>}
                      </div>
                    ))}
                  </div>

                  {/* Rows: one per user turn, with a cell per model aligned */}
                  {pairs.map((row, i) => (
                    <div key={i} className="space-y-2">
                      {/* Optional: show the user prompt spanning all columns */}
                      <div className="text-sm text-zinc-300">
                        <span className="opacity-60">You:</span> {row.user.content}
                      </div>
                      <div
                        className="grid gap-3 items-stretch"
                        style={{ gridTemplateColumns: `repeat(${selectedModels.length}, minmax(260px, 1fr))` }}
                      >
                        {selectedModels.map((m) => {
                          const ans = row.answers.find((a) => a.modelId === m.id);
                          return (
                            <div key={m.id} className="h-full">
                              <div className="bg-white/5 rounded-md p-3 h-full min-h-[160px] flex ring-1 ring-white/5">
                                <div className="text-sm leading-relaxed w-full">
                                  {ans ? (
                                    <>
                                      <MarkdownLite text={ans.content} />
                                      {(() => {
                                        try {
                                          const txt = String(ans.content || '');
                                          const show = /rate limit|add your own\s+.*api key/i.test(txt);
                                          return show;
                                        } catch { return false; }
                                      })() && (
                                        <div className="mt-2">
                                          <button
                                            onClick={() => window.dispatchEvent(new Event('open-settings'))}
                                            className="text-xs px-2.5 py-1 rounded bg-[#e42a42] text-white border border-white/10 hover:bg-[#cf243a]"
                                          >
                                            Add keys
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : loadingIds.includes(m.id) ? (
                                    <div className="w-full self-stretch animate-pulse space-y-2">
                                      <div className="h-2.5 w-1/3 rounded bg-[#e42a42]/30" />
                                      <div className="h-2 rounded bg-white/10" />
                                      <div className="h-2 rounded bg-white/10 w-5/6" />
                                      <div className="h-2 rounded bg-white/10 w-2/3" />
                                    </div>
                                  ) : (
                                    <span className="opacity-40">No reply yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed bottom input like ChatGPT */}
            <div className="fixed bottom-0 left-0 right-0 z-20 pt-2 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-black/70 to-transparent">
              <div className="max-w-3xl mx-auto px-3">
                <AiInput onSubmit={(text, imageDataUrl) => { setInput(text); send(text, imageDataUrl); }} loading={anyLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
