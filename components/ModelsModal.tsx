"use client";
import { X, Layers, Eye, EyeOff, Star } from "lucide-react";
import type { AiModel } from "@/lib/types";
import { MODEL_CATALOG } from "@/lib/models";

export type ModelsModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  selectedModels: AiModel[];
  customModels: AiModel[];
  onToggle: (id: string) => void;
};

export default function ModelsModal({
  open,
  onClose,
  selectedIds,
  selectedModels,
  customModels,
  onToggle,
}: ModelsModalProps) {
  if (!open) return null;

  const buckets: Record<string, AiModel[]> = {
    Favorites: [],
    Uncensored: [],
    Free: [],
    Good: [],
    Others: [],
  };
  const seen = new Set<string>();
  const isFree = (m: AiModel) => {
    const maybe = m as Partial<{ free: boolean }>;
    return /(\(|\s)free\)/i.test(m.label) || !!maybe.free;
  };
  const isUnc = (m: AiModel) =>
    /uncensored/i.test(m.label) || /venice/i.test(m.model);
  const staticFavIds = new Set<string>([
    "llama-3.3-70b-instruct",
    "gemini-2.5-pro",
    "openai-gpt-oss-20b-free",
    "glm-4.5-air",
    "moonshot-kimi-k2",
  ]);
  const isFav = (m: AiModel) =>
    selectedIds.includes(m.id) || staticFavIds.has(m.id);
  const pick = (m: AiModel) => {
    if (isFav(m)) return "Favorites";
    if (isUnc(m)) return "Uncensored";
    if (isFree(m)) return "Free";
    if (m.good) return "Good";
    return "Others";
  };

  MODEL_CATALOG.forEach((m) => {
    const key = pick(m as AiModel);
    if (!seen.has(m.id)) {
      buckets[key].push(m as AiModel);
      seen.add(m.id);
    }
  });

  const Section = ({
    title,
    models,
    showBadges = true,
  }: {
    title: string;
    models: AiModel[];
    showBadges?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="text-sm md:text-base font-semibold uppercase tracking-wide text-zinc-200">
        {title}
      </div>
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5">
        {models.map((m) => {
          const free = isFree(m);
          const unc = isUnc(m);
          const selected = selectedIds.includes(m.id);
          const disabled = !selected && selectedModels.length >= 5;
          return (
            <button
              key={m.id}
              onClick={() => !disabled && onToggle(m.id)}
              className={`h-11 sm:h-9 md:h-10 px-4 sm:px-3 md:px-4 text-sm sm:text-xs md:text-sm rounded-full border transition-colors flex items-center justify-between gap-3 w-full sm:w-auto min-w-[0] sm:min-w-[280px] md:min-w-[320px] ${
                selected
                  ? `${
                      m.good
                        ? "border-amber-300/50"
                        : free
                        ? "border-emerald-300/50"
                        : "border-white/20"
                    } bg-white/10`
                  : disabled
                  ? "bg-white/5 text-zinc-500 border-white/10 cursor-not-allowed opacity-60"
                  : `${
                      m.good
                        ? "border-amber-300/30"
                        : free
                        ? "border-emerald-300/30"
                        : "border-white/10"
                    } bg-white/5 hover:bg-white/10`
              }`}
              title={
                selected
                  ? "Click to unselect"
                  : disabled
                  ? "Limit reached"
                  : "Click to select"
              }
            >
              <span className="pr-1 inline-flex items-center gap-1.5 min-w-0">
                {showBadges && m.good && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ring-1"
                    style={{
                      background: "var(--badge-pro-background)",
                      color: "var(--badge-pro-text)",
                      borderColor: "var(--badge-pro-border)",
                    }}
                  >
                    <Star size={12} className="shrink-0" />
                    <span className="hidden sm:inline">Pro</span>
                  </span>
                )}
                {showBadges && free && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ring-1"
                    style={{
                      background: "var(--badge-free-background)",
                      color: "var(--badge-free-text)",
                      borderColor: "var(--badge-free-border)",
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                    <span className="hidden sm:inline">Free</span>
                  </span>
                )}
                {showBadges && unc && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30">
                    <span className="h-2 w-2 rounded-full bg-rose-200" />
                    <span className="hidden sm:inline">Uncensored</span>
                  </span>
                )}
                <span className="truncate max-w-[70vw] sm:max-w-[240px] md:max-w-[300px]">
                  {m.label}
                </span>
              </span>
              <span
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  selected ? "bg-orange-500/40" : "bg-white/10"
                }`}
              >
                <span
                  className={`h-3 w-3 rounded-full transition-transform ${
                    selected
                      ? "bg-orange-200 translate-x-3.5"
                      : "bg-white translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const order: Array<keyof typeof buckets> = [
    "Favorites",
    "Uncensored",
    "Free",
    "Good",
    "Others",
  ];
  const builtInSections = order
    .filter((k) => buckets[k].length > 0)
    .map((k) => <Section key={k} title={k} models={buckets[k]} />);

  const customSection = (
    <Section
      key="Custom models"
      title="Custom models"
      models={customModels}
      showBadges={false}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-3 sm:mx-auto rounded-2xl border border-white/10 bg-zinc-900/90 p-6 md:p-7 lg:p-8 shadow-2xl">
        <div className="sticky top-0 z-10 -mx-6 md:-mx-7 lg:-mx-8 px-6 md:px-7 lg:px-8 pt-1 pb-3 mb-3 flex items-center justify-between bg-zinc-900/95 backdrop-blur border-b border-white/10">
          <h3 className="text-base md:text-lg lg:text-xl font-semibold tracking-wide">
            Select up to 5 models
          </h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 md:h-9 md:w-9 inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
        <div className="text-xs md:text-sm text-zinc-300 mb-4">
          Selected: {selectedModels.length}/5
        </div>
        <div className="space-y-4 max-h[70vh] md:max-h-[70vh] overflow-y-auto pr-1">
          {customSection}
          {builtInSections}
        </div>
      </div>
    </div>
  );
}
