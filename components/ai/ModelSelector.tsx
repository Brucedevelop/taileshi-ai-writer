'use client';

import { AVAILABLE_MODELS, MODEL_GROUPS, COST_TIER_LABELS } from '@/lib/llm/models';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">AI Model</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(MODEL_GROUPS).map(([provider, models]) => (
          <optgroup key={provider} label={provider}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} — {COST_TIER_LABELS[model.costTier]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {value && (
        <p className="text-xs text-gray-500">
          {AVAILABLE_MODELS.find((m) => m.id === value)?.description}
        </p>
      )}
    </div>
  );
}
