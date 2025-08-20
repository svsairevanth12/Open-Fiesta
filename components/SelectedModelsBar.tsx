"use client";
import { Layers, Star } from "lucide-react";
import Settings from "@/components/Settings";
import CustomModels from "@/components/CustomModels";
import type { AiModel } from "@/lib/types";
import ProBadge from "./ui/ProBadge";
import FreeBadge from "./ui/FreeBadge";

type Props = {
  selectedModels: AiModel[];
  onToggle: (id: string) => void;
  onOpenModelsModal: () => void;
};

export default function SelectedModelsBar({
  selectedModels,
  onToggle,
  onOpenModelsModal,
}: Props) {
  return (
    <div className="mb-3 flex items-start gap-3 min-w-0">
      {/* Chips: no wrap, horizontal scroll */}
      <div
        className="hidden sm:flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pr-1 pb-2 min-w-0"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        {selectedModels.map((m) => {
          const isFree = /(\(|\s)free\)/i.test(m.label);
          const isUncensored =
            /uncensored/i.test(m.label) || /venice/i.test(m.model);
          return (
            <button
              key={m.id}
              onClick={() => onToggle(m.id)}
              className={`h-9 px-3 text-xs rounded-full text-white border inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors shrink-0 ${
                m.good
                  ? "border-amber-300/40"
                  : isFree
                  ? "border-emerald-300/40"
                  : "border-white/10"
              }`}
              title="Click to toggle"
            >
              {m.good && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30">
                  <Star size={12} className="shrink-0" />
                  <ProBadge size="sm" />
                </span>
              )}
              {isFree && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <FreeBadge size="sm" />
                </span>
              )}
              {isUncensored && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30">
                  <span className="h-2 w-2 rounded-full bg-rose-200" />
                  <span className="hidden sm:inline">Uncensored</span>
                </span>
              )}
              <span className="truncate max-w-[180px]">{m.label}</span>
              <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-orange-500/40">
                <span className="h-3 w-3 rounded-full bg-orange-200 translate-x-3.5" />
              </span>
            </button>
          );
        })}
        {selectedModels.length === 0 && (
          <span className="text-xs text-zinc-400">No models selected</span>
        )}
      </div>
      {/* Actions pinned right */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenModelsModal}
          className="inline-flex items-center gap-1.5 text-xs h-9 px-3 py-2 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 shadow"
          title="Change models"
        >
          <Layers size={14} />
          <span>Change models</span>
        </button>
        <CustomModels />
        <Settings />
      </div>
    </div>
  );
}
