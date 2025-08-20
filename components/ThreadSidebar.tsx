"use client";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import type { ChatThread } from "@/lib/types";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  threads: ChatThread[];
  activeId: string | null;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  mobileSidebarOpen: boolean;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
};

export default function ThreadSidebar({
  sidebarOpen,
  onToggleSidebar,
  threads,
  activeId,
  onSelectThread,
  onNewChat,
  mobileSidebarOpen,
  onCloseMobile,
}: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`relative hidden lg:flex shrink-0 h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] rounded-lg border border-white/10 bg-white/5 p-3 flex-col transition-[width] duration-300 ${
          sidebarOpen ? "w-64" : "w-14"
        }`}
      >
        {/* Collapse/Expand toggle */}
        <button
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggleSidebar}
          className="absolute -right-3 top-5 z-10 h-6 w-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div
          className={`flex items-center justify-between mb-2 ${
            sidebarOpen ? "" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full accent-dot accent-dot-pulse" />
            <h2 className="text-sm font-semibold">Open Fiesta</h2>
          </div>
        </div>

        {sidebarOpen ? (
          <>
            <button
              onClick={onNewChat}
              className="mb-3 text-sm px-3 py-2 rounded-md text-white shadow transition-colors accent-action-fill"
            >
              + New Chat
            </button>
            <div className="text-xs uppercase tracking-wide opacity-60 mb-2">
              Chats
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {threads.length === 0 && (
                <div className="text-xs opacity-60">No chats yet</div>
              )}
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectThread(t.id)}
                  className={`w-full text-left px-2 py-2 rounded-md text-sm border ${
                    t.id === activeId
                      ? "bg-white/15 border-white/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {t.title || "Untitled"}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center pt-6">
            {/* New chat button */}
            <button
              title="New Chat"
              onClick={onNewChat}
              className="h-8 w-8 rounded-full flex items-center justify-center mb-4 mx-auto shrink-0 text-white transition-colors accent-action-fill"
            >
              <Plus size={14} />
            </button>

            {/* Mini chat boxes list */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 pt-1 pb-2">
              {threads.map((t) => {
                const isActive = t.id === activeId;
                const letter =
                  (t.title || "Untitled").trim()[0]?.toUpperCase() || "N";
                return (
                  <button
                    key={t.id}
                    title={t.title || "Untitled"}
                    onClick={() => onSelectThread(t.id)}
                    className={`h-6 w-6 aspect-square rounded-full flex items-center justify-center transition-colors focus-visible:outline-none mx-auto shrink-0 
                      ${
                        isActive
                          ? "bg-white/20 ring-1 ring-white/30 ring-offset-1 ring-offset-black"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
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
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onCloseMobile}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-zinc-900/90 border-r border-white/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full accent-dot accent-dot-pulse" />
                <h2 className="text-sm font-semibold">Open Fiesta</h2>
              </div>
              <button
                aria-label="Close"
                onClick={onCloseMobile}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="mb-3 text-sm px-3 py-2 w-full rounded-md text-white transition-colors accent-action-fill"
            >
              + New Chat
            </button>
            <div className="text-xs uppercase tracking-wide opacity-60 mb-2">
              Chats
            </div>
            <div className="h-[70vh] overflow-y-auto space-y-1 pr-1">
              {threads.length === 0 && (
                <div className="text-xs opacity-60">No chats yet</div>
              )}
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectThread(t.id);
                    onCloseMobile();
                  }}
                  className={`w-full text-left px-2 py-2 rounded-md text-sm border ${
                    t.id === activeId
                      ? "bg-white/15 border-white/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {t.title || "Untitled"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
