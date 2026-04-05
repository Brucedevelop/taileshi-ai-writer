'use client';

import { useState } from 'react';
import { AVAILABLE_MODELS } from '@/lib/llm/models';

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const response = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredModel: selectedModel }),
    });
    if (response.ok) setSaved(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Default AI Model</h2>
        <div className="space-y-2">
          {AVAILABLE_MODELS.map((model) => (
            <label key={model.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={selectedModel === model.id}
                onChange={() => setSelectedModel(model.id)}
              />
              <div>
                <div className="font-medium">{model.name} <span className="text-xs text-gray-400">({model.provider})</span></div>
                <div className="text-sm text-gray-500">{model.description}</div>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                model.costTier === 'budget' ? 'bg-green-100 text-green-700' :
                model.costTier === 'premium' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {model.costTier}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
