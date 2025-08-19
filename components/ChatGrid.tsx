"use client";
import { useMemo } from "react";
import { Eye, EyeOff, Check, Star } from "lucide-react";
import MarkdownLite from "@/components/MarkdownLite";
import type { AiModel, ChatMessage } from "@/lib/types";

export type ChatGridProps = {
  selectedModels: AiModel[];
  headerTemplate: string;
  collapsedIds: string[];
  setCollapsedIds: (updater: (prev: string[]) => string[]) => void;
  loadingIds: string[];
  pairs: { user: ChatMessage; answers: ChatMessage[] }[];
  copyToClipboard: (text: string) => Promise<void> | void;
  copiedAllIdx: number | null;
  setCopiedAllIdx: (v: number | null) => void;
  copiedKey: string | null;
  setCopiedKey: (v: string | null | ((prev: string | null) => string | null)) => void;
};

export default function ChatGrid({
  selectedModels,
  headerTemplate,
  collapsedIds,
  setCollapsedIds,
  loadingIds,
  pairs,
  copyToClipboard,
  copiedAllIdx,
  setCopiedAllIdx,
  copiedKey,
  setCopiedKey,
}: ChatGridProps) {
  const headerCols = useMemo(() => headerTemplate || `repeat(${selectedModels.length}, minmax(260px, 1fr))`, [headerTemplate, selectedModels.length]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-2 pt-5 overflow-x-auto flex-1 overflow-y-auto pb-28">
      {selectedModels.length === 0 ? (
        <div className="p-4 text-zinc-400">Select up to 5 models to compare.</div>
      ) : (
        <div className="min-w-full space-y-3">
          {/* Header row: model labels */}
          <div
            className="grid gap-3 items-center overflow-visible mt-3 pt-1"
            style={{ gridTemplateColumns: headerCols }}
          >
            {selectedModels.map((m) => {
              const isFree = /(\(|\s)free\)/i.test(m.label);
              const isCollapsed = collapsedIds.includes(m.id);
              return (
                <div key={m.id} className={`px-1 py-4 min-h[56px] min-h-[56px] border-b flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} overflow-visible ${m.good ? 'border-amber-300/40' : 'border-white/10'}`}>
                  {!isCollapsed && (
                    <div className={`text-[13px] leading-normal font-medium pr-2 inline-flex items-center gap-1.5 min-w-0 ${m.good || isFree ? 'opacity-100 text-white' : 'opacity-90'}`}>
                      {m.good && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30 text-[11px] h-6 self-center">
                          <Star size={11} />
                          <span className="hidden sm:inline">Pro</span>
                        </span>
                      )}
                      {isFree && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30 text-[11px] h-6 self-center">
                          <span className="h-2 w-2 rounded-full bg-emerald-300" />
                          <span className="hidden sm:inline">Free</span>
                        </span>
                      )}
                      <span className="truncate" title={m.label}>{m.label}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {loadingIds.includes(m.id) && !isCollapsed && (
                      <span className="text-[11px] text-[#e42a42]">Thinking…</span>
                    )}
                    {isCollapsed ? (
                      <button
                        onClick={() => setCollapsedIds(prev => prev.filter(id => id !== m.id))}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                        title={`Expand ${m.label}`}
                      >
                        <Eye size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setCollapsedIds(prev => prev.includes(m.id) ? prev : [...prev, m.id])}
                        className="text-[11px] px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                        title={`Collapse ${m.label}`}
                      >
                        <EyeOff size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {pairs.map((row, i) => (
            <div key={i} className="space-y-2">
              <div className="text-sm text-zinc-300 flex items-center justify-between gap-2">
                <div>
                  <span className="opacity-60">You:</span> {row.user.content}
                </div>
                <button
                  onClick={() => {
                    const all = selectedModels.filter(m => !collapsedIds.includes(m.id)).map((m) => {
                      const ans = row.answers.find((a) => a.modelId === m.id);
                      const header = m.label;
                      const body = ans?.content ?? '';
                      return `## ${header}\n${body}`;
                    }).join('\n\n');
                    copyToClipboard(all);
                    setCopiedAllIdx(i);
                    window.setTimeout(() => setCopiedAllIdx(null), 1200);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md border shadow-sm transition-all ${
                    copiedAllIdx === i
                      ? 'bg-emerald-500/20 border-emerald-300/40 text-emerald-100 scale-[1.02]'
                      : 'bg-white/10 border-white/15 hover:bg-white/15'
                  }`}
                  title="Copy all model responses for this prompt"
                >
                  {copiedAllIdx === i ? (
                    <span className="inline-flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    'Copy all'
                  )}
                </button>
              </div>
              <div
                className="grid gap-3 items-stretch"
                style={{ gridTemplateColumns: headerCols }}
              >
                {selectedModels.map((m) => {
                  const isFree = /(\(|\s)free\)/i.test(m.label);
                  const ans = row.answers.find((a) => a.modelId === m.id);
                  const isCollapsed = collapsedIds.includes(m.id);
                  return (
                    <div key={m.id} className="h-full">
                      <div
                        className={`group relative rounded-md ${isCollapsed ? 'p-2' : 'p-3'} h-full min-h-[160px] flex overflow-hidden ring-1 ${m.good ? 'bg-gradient-to-b from-amber-400/10 to-white/5 ring-amber-300/30' : isFree ? 'bg-gradient-to-b from-emerald-400/10 to-white/5 ring-emerald-300/30' : 'bg-white/5 ring-white/5'} ${isCollapsed ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (isCollapsed) setCollapsedIds(prev => prev.filter(id => id !== m.id));
                        }}
                        title={isCollapsed ? 'Click to expand' : undefined}
                      >
                        {ans && (
                          <button
                            onClick={() => {
                              copyToClipboard(ans.content);
                              const key = `${i}:${m.id}`;
                              setCopiedKey(key);
                              window.setTimeout(() => setCopiedKey(prev => (typeof prev === 'string' && prev === key ? null : prev)), 1200);
                            }}
                            className={`absolute top-2 right-2 z-10 text-[11px] px-2 py-1 rounded border whitespace-nowrap ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'} transition-all ${
                              copiedKey === `${i}:${m.id}`
                                ? 'bg-emerald-500/20 border-emerald-300/40 text-emerald-100 scale-[1.02]'
                                : 'bg-white/10 border-white/10 hover:bg-white/15'
                            }`}
                            title={`Copy ${m.label} response`}
                          >
                            {copiedKey === `${i}:${m.id}` ? (
                              <span className="inline-flex items-center gap-1">
                                <Check size={12} /> Copied
                              </span>
                            ) : (
                              'Copy'
                            )}
                          </button>
                        )}
                        <div className={`text-sm leading-relaxed w-full pr-8 ${isCollapsed ? 'overflow-hidden max-h-20 opacity-70' : ''}`}>
                          {ans ? (
                            <>
                              <MarkdownLite text={ans.content} />
                              {(() => {
                                try {
                                  const txt = String(ans.content || '');
                                  const show = /add your own\s+(?:openrouter|gemini)\s+api key/i.test(txt);
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
                            <span className="text-zinc-400 text-sm">No response</span>
                          )}
                        </div>
                        {isCollapsed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] px-2 py-1 rounded-full border border-white/10 bg-black/50 inline-flex items-center gap-1">
                              <Eye size={12} /> Expand
                            </span>
                          </div>
                        )}
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
  );
}
