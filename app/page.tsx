"use client";
import { useMemo, useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import SelectedModelsBar from "@/components/SelectedModelsBar";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mergeModels, useCustomModels } from "@/lib/customModels";
import { AiModel, ChatMessage, ApiKeys, ChatThread } from "@/lib/types";
import { callGemini, streamOpenRouter } from "@/lib/client";
import ModelsModal from "@/components/ModelsModal";
import FirstVisitNote from "@/components/FirstVisitNote";
import FixedInputBar from "@/components/FixedInputBar";
import ThreadSidebar from "@/components/ThreadSidebar";
import ChatGrid from "@/components/ChatGrid";

export default function Home() {
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>(
    "ai-fiesta:selected-models",
    [
      "gemini-2.5-flash",
      "llama-3.3-70b-instruct",
      "qwen-2.5-72b-instruct",
      "openai-gpt-oss-20b-free",
      "glm-4.5-air",
    ]
  );
  const [keys] = useLocalStorage<ApiKeys>("ai-fiesta:keys", {});
  const [threads, setThreads] = useLocalStorage<ChatThread[]>("ai-fiesta:threads", []);
  const [activeId, setActiveId] = useLocalStorage<string | null>("ai-fiesta:active-thread", null);
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>("ai-fiesta:sidebar-open", true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modelsModalOpen, setModelsModalOpen] = useState(false);
  const [customModels] = useCustomModels();
  const allModels = useMemo(() => mergeModels(customModels), [customModels]);
  const activeThread = useMemo(() => threads.find(t => t.id === activeId) || null, [threads, activeId]);
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread]);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  // Allow collapsing a model column without unselecting it
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const selectedModels = useMemo(() => allModels.filter(m => selectedIds.includes(m.id)), [selectedIds, allModels]);
  // Build grid template: collapsed => fixed narrow, expanded => normal
  const headerTemplate = useMemo(() => {
    if (selectedModels.length === 0) return "";
    const parts = selectedModels.map(m =>
      collapsedIds.includes(m.id) ? "72px" : "minmax(280px, 1fr)"
    );
    return parts.join(" ");
  }, [selectedModels, collapsedIds]);
  const anyLoading = loadingIds.length > 0;
  const [copiedAllIdx, setCopiedAllIdx] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [firstNoteDismissed, setFirstNoteDismissed] = useLocalStorage<boolean>('ai-fiesta:first-visit-note-dismissed', false);
  const showFirstVisitNote = !firstNoteDismissed && (!keys?.openrouter || !keys?.gemini);

  // Copy helper with fallback when navigator.clipboard is unavailable
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
       
      }
    }
  };

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      const valid = new Set(allModels.map(m => m.id));
      const currentValidCount = prev.filter(x => valid.has(x)).length;
      if (currentValidCount >= 5) return prev;
      return [...prev, id];
    });
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
    // input reset handled within AiInput component

    // fire all selected models in parallel
    setLoadingIds(selectedModels.map(m => m.id));
    await Promise.allSettled(selectedModels.map(async (m: AiModel) => {
      try {
        let res: unknown;
        if (m.provider === "gemini") {
          // If user hasn't set a key, rely on server env fallback
          res = await callGemini({ apiKey: keys.gemini || undefined, model: m.model, messages: nextHistory, imageDataUrl });
        } else {
          // Streaming OpenRouter for smooth typing
          const placeholderTs = Date.now();
          // Insert a placeholder assistant message to update progressively
          const placeholder: ChatMessage = { role: "assistant", content: "", modelId: m.id, ts: placeholderTs };
          setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), placeholder] } : t));

          let buffer = "";
          let flushTimer: number | null = null;
          const flush = () => {
            if (!buffer) return;
            const chunk = buffer;
            buffer = "";
            setThreads(prev => prev.map(t => {
              if (t.id !== thread.id) return t;
              const msgs = (t.messages ?? []).map(msg => {
                if (msg.ts === placeholderTs && msg.modelId === m.id && msg.role === 'assistant') {
                  return { ...msg, content: (msg.content || "") + chunk };
                }
                return msg;
              });
              return { ...t, messages: msgs };
            }));
          };

          await streamOpenRouter({ apiKey: keys.openrouter || undefined, model: m.model, messages: nextHistory }, {
            onToken: (delta) => {
              buffer += delta;
              // micro-batch every ~24ms for smoothness
              if (flushTimer == null) {
                flushTimer = window.setTimeout(() => { flushTimer = null; flush(); }, 24);
              }
            },
            onMeta: (meta) => {
              // attach provider meta once
              setThreads(prev => prev.map(t => {
                if (t.id !== thread.id) return t;
                const msgs = (t.messages ?? []).map(msg => {
                  if (msg.ts === placeholderTs && msg.modelId === m.id && msg.role === 'assistant') {
                    return { ...msg, provider: meta.provider, usedKeyType: meta.usedKeyType } as ChatMessage;
                  }
                  return msg;
                });
                return { ...t, messages: msgs };
              }));
            },
            onError: (err) => {
              // finalize with error text and meta
              if (flushTimer != null) { window.clearTimeout(flushTimer); flushTimer = null; }
              const text = err.error || 'Error';
              setThreads(prev => prev.map(t => {
                if (t.id !== thread.id) return t;
                const msgs = (t.messages ?? []).map(msg => {
                  if (msg.ts === placeholderTs && msg.modelId === m.id && msg.role === 'assistant') {
                    return { ...msg, content: text, code: err.code, provider: err.provider, usedKeyType: err.usedKeyType } as ChatMessage;
                  }
                  return msg;
                });
                return { ...t, messages: msgs };
              }));
            },
            onDone: () => {
              if (flushTimer != null) { window.clearTimeout(flushTimer); flushTimer = null; }
              flush();
            }
          });
          return; // skip the non-stream flow below
        }
        // Non-stream (Gemini) path
        const text = (() => {
          const r = res as { text?: unknown; error?: unknown } | null | undefined;
          const t = r && typeof r === 'object' ? (typeof r.text === 'string' ? r.text : undefined) : undefined;
          const e = r && typeof r === 'object' ? (typeof r.error === 'string' ? r.error : undefined) : undefined;
          return t || e || "No response";
        })();
        const asst: ChatMessage = { role: "assistant", content: String(text).trim(), modelId: m.id, ts: Date.now() };
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, messages: [...(t.messages ?? nextHistory), asst] } : t));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const asst: ChatMessage = { role: "assistant", content: `[${m.label}] Error: ${msg}`.trim(), modelId: m.id, ts: Date.now() };
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

  const onEditUser = (turnIndex: number, newText: string) => {
    if (!activeThread) return;
    setThreads(prev => prev.map(t => {
      if (t.id !== activeThread.id) return t;
      let userIdx = -1;
      const updated = (t.messages ?? []).map(m => {
        if (m.role === 'user') userIdx += 1;
        if (m.role === 'user' && userIdx === turnIndex) {
          return { ...m, content: newText };
        }
        return m;
      });
      // If title was the default deriving from first user message, refresh it
      const title = t.title === 'New Chat' || t.title === (messages[0]?.content?.slice?.(0,40) ?? t.title)
        ? (updated.find(mm => mm.role === 'user')?.content ?? 'New Chat').slice(0,40)
        : t.title;
      return { ...t, messages: updated, title };
    }));
  };

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
          <ThreadSidebar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            threads={threads}
            activeId={activeId}
            onSelectThread={(id) => setActiveId(id)}
            onNewChat={() => {
              const t: ChatThread = { id: crypto.randomUUID(), title: 'New Chat', messages: [], createdAt: Date.now() };
              setThreads(prev => [t, ...prev]);
              setActiveId(t.id);
            }}
            mobileSidebarOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onOpenMobile={() => setMobileSidebarOpen(true)}
          />
          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden">
            {/* Top bar */}
          <HeaderBar
            onOpenMenu={() => setMobileSidebarOpen(true)}
            title="Open Fiesta"
            authorName="Niladri"
            authorImageSrc="/image.png"
            authorLink="https://x.com/byteHumi"
            githubOwner="NiladriHazra"
            githubRepo="Open-Fiesta"
            className=""
          />

            {/* Selected models row + actions */}
            <SelectedModelsBar
              selectedModels={selectedModels}
              onToggle={toggle}
              onOpenModelsModal={() => setModelsModalOpen(true)}
            />

            <ModelsModal
              open={modelsModalOpen}
              onClose={() => setModelsModalOpen(false)}
              selectedIds={selectedIds}
              selectedModels={selectedModels}
              customModels={customModels}
              onToggle={toggle}
            />
            <FirstVisitNote open={showFirstVisitNote} onClose={() => setFirstNoteDismissed(true)} />

            <ChatGrid
              selectedModels={selectedModels}
              headerTemplate={headerTemplate}
              collapsedIds={collapsedIds}
              setCollapsedIds={setCollapsedIds}
              loadingIds={loadingIds}
              pairs={pairs}
              copyToClipboard={copyToClipboard}
              copiedAllIdx={copiedAllIdx}
              setCopiedAllIdx={setCopiedAllIdx}
              copiedKey={copiedKey}
              setCopiedKey={setCopiedKey}
              onEditUser={onEditUser}
            />

            <FixedInputBar onSubmit={send} loading={anyLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
