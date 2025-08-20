"use client";
import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Check,
  Loader2,
  Copy as CopyIcon,
  Pencil,
  Save,
  X,
  Star,
} from "lucide-react";
import MarkdownLite from "./MarkdownLite";
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
  setCopiedKey: (
    v: string | null | ((prev: string | null) => string | null)
  ) => void;
  onEditUser: (turnIndex: number, newText: string) => void;
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
  onEditUser,
}: ChatGridProps) {
  const headerCols = useMemo(
    () =>
      headerTemplate || `repeat(${selectedModels.length}, minmax(260px, 1fr))`,
    [headerTemplate, selectedModels.length]
  );
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<string>("");

  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-2 pt-2 overflow-x-auto flex-1 overflow-y-auto pb-28">
      {selectedModels.length === 0 ? (
        <div className="p-4 text-zinc-400">
          Select up to 5 models to compare.
        </div>
      ) : (
        <div className="min-w-full space-y-3">
          {/* Header row: model labels */}
          <div
            className="grid gap-3 items-center overflow-visible mt-0 sticky top-0 z-20 bg-black/40 backdrop-blur-sm border-b border-white/10 -mx-2 px-2 py-1 shadow-[0_1px_0_rgba(0,0,0,0.4)]"
            style={{ gridTemplateColumns: headerCols }}
          >
            {selectedModels.map((m) => {
              const isFree = /(\(|\s)free\)/i.test(m.label);
              const isCollapsed = collapsedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`px-1 py-2 min-h-[40px] border-b flex items-center ${
                    isCollapsed ? "justify-center" : "justify-between"
                  } overflow-visible ${
                    m.good ? "border-amber-300/40" : "border-white/10"
                  }`}
                >
                  {!isCollapsed && (
                    <div
                      className={`text-[13px] leading-normal font-medium pr-2 inline-flex items-center gap-1.5 min-w-0 ${
                        m.good || isFree
                          ? "opacity-100 text-white"
                          : "opacity-90"
                      }`}
                    >
                      {m.good && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30 text-[11px] h-6 self-center">
                          <Star size={11} />
                          <span
                            className="hidden sm:inline text-xs px-2 py-0.5 rounded-full border"
                            style={{
                              background: "var(--badge-pro-background)",
                              color: "var(--badge-pro-text)",
                              borderColor: "var(--badge-pro-border)",
                            }}
                          >
                            Pro
                          </span>
                        </span>
                      )}
                      {isFree && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30 text-[11px] h-6 self-center">
                          <span className="h-2 w-2 rounded-full bg-emerald-300" />
                          <span
                            className="hidden sm:inline text-xs px-2 py-0.5 rounded-full border"
                            style={{
                              background: "var(--badge-free-background)",
                              color: "var(--badge-free-text)",
                              borderColor: "var(--badge-free-border)",
                            }}
                          >
                            Free
                          </span>
                        </span>
                      )}
                      <span className="truncate" title={m.label}>
                        {m.label}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <button
                        onClick={() =>
                          setCollapsedIds((prev) =>
                            prev.filter((id) => id !== m.id)
                          )
                        }
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                        title={`Expand ${m.label}`}
                      >
                        <Eye size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setCollapsedIds((prev) =>
                            prev.includes(m.id) ? prev : [...prev, m.id]
                          )
                        }
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
            <div key={i} className="space-y-3">
              {/* Prompt callout */}
              <div className="relative flex items-start justify-between gap-3 px-3 py-2 rounded-lg ring-1 ring-rose-300/20 bg-gradient-to-r from-rose-500/10 to-transparent">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md bg-gradient-to-b from-rose-400/60 to-rose-500/40" />
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium bg-rose-500/20 text-rose-100 ring-1 ring-rose-300/30 shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                    You
                  </span>
                  <div className="min-w-0 flex-1">
                    {editingIdx === i ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            onEditUser(i, draft.trim());
                            setEditingIdx(null);
                            setDraft("");
                          }}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 hover:bg-white/20"
                          title="Save"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingIdx(null);
                            setDraft("");
                          }}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-[13.5px] sm:text-sm text-zinc-100 leading-relaxed truncate drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]"
                        title={row.user.content}
                      >
                        {row.user.content}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {editingIdx !== i && (
                    <button
                      onClick={() => {
                        setEditingIdx(i);
                        setDraft(row.user.content);
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                      title="Edit prompt"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const all = selectedModels
                        .filter((m) => !collapsedIds.includes(m.id))
                        .map((m) => {
                          const ans = row.answers.find(
                            (a) => a.modelId === m.id
                          );
                          const header = m.label;
                          const body = ans?.content ?? "";
                          return `## ${header}\n${body}`;
                        })
                        .join("\n\n");
                      copyToClipboard(all);
                      setCopiedAllIdx(i);
                      window.setTimeout(() => setCopiedAllIdx(null), 1200);
                    }}
                    className={`h-7 w-7 inline-flex items-center justify-center rounded-md border transition-all ${
                      copiedAllIdx === i
                        ? "bg-emerald-500/15 border-emerald-300/30 text-emerald-100"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    title="Copy all model responses for this prompt"
                  >
                    {copiedAllIdx === i ? (
                      <Check size={12} />
                    ) : (
                      <CopyIcon size={12} />
                    )}
                  </button>
                </div>
              </div>
              <div
                className="grid gap-3 items-stretch"
                style={{ gridTemplateColumns: headerCols }}
              >
                {selectedModels.map((m) => {
                  const ans = row.answers.find((a) => a.modelId === m.id);
                  const isCollapsed = collapsedIds.includes(m.id);
                  return (
                    <div key={m.id} className="h-full">
                      <div
                        className={`group relative rounded-lg ${
                          isCollapsed ? "p-2.5" : "p-3"
                        } h-full min-h-[140px] flex overflow-hidden ring-1 transition-shadow bg-gradient-to-b from-black/40 to-black/20 ring-white/10 backdrop-blur-[2px] ${
                          isCollapsed ? "cursor-pointer" : "hover:ring-white/20"
                        }`}
                        onClick={() => {
                          if (isCollapsed)
                            setCollapsedIds((prev) =>
                              prev.filter((id) => id !== m.id)
                            );
                        }}
                        title={isCollapsed ? "Click to expand" : undefined}
                      >
                        {/* decorative overlay removed for cleaner look */}
                        {ans && String(ans.content || "").length > 0 && (
                          <button
                            onClick={() => {
                              copyToClipboard(ans.content);
                              const key = `${i}:${m.id}`;
                              setCopiedKey(key);
                              window.setTimeout(
                                () =>
                                  setCopiedKey((prev) =>
                                    typeof prev === "string" && prev === key
                                      ? null
                                      : prev
                                  ),
                                1200
                              );
                            }}
                            className={`absolute top-2 right-2 z-10 h-7 w-7 inline-flex items-center justify-center rounded border ${
                              isCollapsed
                                ? "opacity-0 pointer-events-none"
                                : "opacity-0 group-hover:opacity-100"
                            } transition-all ${
                              copiedKey === `${i}:${m.id}`
                                ? "bg-emerald-500/15 border-emerald-300/30 text-emerald-100"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                            title={`Copy ${m.label} response`}
                          >
                            {copiedKey === `${i}:${m.id}` ? (
                              <Check size={12} />
                            ) : (
                              <CopyIcon size={12} />
                            )}
                          </button>
                        )}
                        <div
                          className={`text-sm leading-relaxed w-full pr-8 ${
                            isCollapsed
                              ? "overflow-hidden max-h-20 opacity-70"
                              : "space-y-2"
                          }`}
                        >
                          {ans && String(ans.content || "").length > 0 ? (
                            <>
                              <div className="max-w-[72ch]">
                                <MarkdownLite text={ans.content} />
                              </div>
                              {ans.code === 503 &&
                                ans.provider === "openrouter" && (
                                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-amber-200/90 bg-amber-500/15 ring-1 ring-amber-300/30 px-2.5 py-1.5 rounded">
                                    <span>
                                      Free pool temporarily unavailable (503).
                                      Try again soon, switch model, or add your
                                      own OpenRouter API key for higher limits.
                                    </span>
                                    <button
                                      onClick={() =>
                                        window.dispatchEvent(
                                          new Event("open-settings")
                                        )
                                      }
                                      className="ml-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                    >
                                      Add key
                                    </button>
                                  </div>
                                )}
                              {(() => {
                                try {
                                  const txt = String(ans.content || "");
                                  const show =
                                    /add your own\s+(?:openrouter|gemini)\s+api key/i.test(
                                      txt
                                    );
                                  return show;
                                } catch {
                                  return false;
                                }
                              })() && (
                                <div className="mt-2">
                                  <button
                                    onClick={() =>
                                      window.dispatchEvent(
                                        new Event("open-settings")
                                      )
                                    }
                                    className="text-xs px-2.5 py-1 rounded bg-[#e42a42] text-white border border-white/10 hover:bg-[#cf243a]"
                                  >
                                    Add keys
                                  </button>
                                </div>
                              )}
                            </>
                          ) : loadingIds.includes(m.id) ? (
                            <div className="w-full self-stretch space-y-3">
                              <div className="inline-flex items-center gap-2 text-[12px] font-medium text-rose-100">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 ring-1 ring-rose-300/30">
                                  <Loader2 className="animate-spin" size={13} />
                                  Thinking…
                                </span>
                              </div>
                              <div className="animate-pulse space-y-2">
                                <div className="h-2.5 w-1/3 rounded bg-[#e42a42]/30" />
                                <div className="h-2 rounded bg-white/10" />
                                <div className="h-2 rounded bg-white/10 w-5/6" />
                                <div className="h-2 rounded bg-white/10 w-2/3" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-sm">
                              No response
                            </span>
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
