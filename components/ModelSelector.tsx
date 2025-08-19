"use client";
import { useMemo } from 'react';
import { AiModel } from '@/lib/types';
import { mergeModels, useCustomModels } from '@/lib/customModels';

export default function ModelSelector({
  selectedIds,
  onToggle,
  max = 5,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  max?: number;
}) {
  const [customModels] = useCustomModels();
  const allModels: AiModel[] = useMemo(() => mergeModels(customModels), [customModels]);
  const disabledIds = useMemo(() => {
    if (selectedIds.length < max) return new Set<string>();
    return new Set<string>(allModels.filter(m => !selectedIds.includes(m.id)).map(m => m.id));
  }, [selectedIds, max, allModels]);

  return (
    <div className="flex flex-wrap gap-2">
      {allModels.map((m: AiModel) => {
        const selected = selectedIds.includes(m.id);
        const disabled = disabledIds.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            disabled={!selected && disabled}
            className={`px-3 py-1.5 rounded-md border text-sm tracking-tight ${selected ? 'bg-[#e42a42] border-[#d0253b] text-white shadow-[0_0_0_1px_rgba(228,42,66,0.4)_inset]' : 'bg-white/10 border-white/15 text-white'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/20'}`}
            title={disabled ? `Max ${max} models at once` : ''}
          >
            {selected ? '✓ ' : ''}{m.label}
            {'custom' in m ? <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-white/10 border border-white/15">custom</span> : null}
          </button>
        );
      })}
    </div>
  );
}
