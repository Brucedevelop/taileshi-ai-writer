'use client';

import { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/lib/llm/models';
import Link from 'next/link';

interface Profile {
  id: string;
  name: string;
  bizName?: string | null;
  mainProducts?: string | null;
  country?: string | null;
  customerType?: string | null;
}

export default function CustomerAnalysisPage() {
  const [step, setStep] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);

  // Step 3
  const [analysis, setAnalysis] = useState('');
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    fetch('/api/profiles')
      .then((r) => r.json())
      .then((d) => setProfiles(d.profiles ?? []))
      .catch(console.error);
  }, []);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setError('');
    setStep(2);
    try {
      const res = await fetch('/api/ai/customer-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedProfileId, model: selectedModel }),
      });
      const data = await res.json() as { analysis?: string; profileName?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed');
        setStep(1);
        return;
      }
      setAnalysis(data.analysis ?? '');
      setProfileName(data.profileName ?? '');
      setStep(3);
    } catch {
      setError('An error occurred');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const steps = ['Select Profile', 'Generate', 'Results'];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Customer Analysis</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > i + 1
                  ? 'bg-green-500 text-white'
                  : step === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm ${
                step === i + 1 ? 'font-medium text-blue-600' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Step 1: Select Profile */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold">Step 1: Select Role Profile</h2>

          {profiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-3">👤</div>
              <p className="mb-3">No role profiles found.</p>
              <a href="/profile" className="text-blue-600 hover:underline text-sm">
                Create a profile first →
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedProfileId === profile.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{profile.name}</div>
                    {profile.bizName && (
                      <div className="text-xs text-gray-500 mb-0.5">🏢 {profile.bizName}</div>
                    )}
                    {profile.mainProducts && (
                      <div className="text-xs text-gray-500 mb-0.5">
                        🏭 {profile.mainProducts.slice(0, 60)}
                        {profile.mainProducts.length > 60 ? '…' : ''}
                      </div>
                    )}
                    {profile.country && (
                      <div className="text-xs text-gray-500">🌍 {profile.country}</div>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider}) — {m.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedProfileId) {
                      setError('Please select a profile');
                      return;
                    }
                    setError('');
                    void handleGenerateAnalysis();
                  }}
                  disabled={!selectedProfileId}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  🔍 Generate Analysis →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Loading */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Generating Analysis…</h2>
          <p className="text-gray-500 text-sm">
            Analyzing customer profile and generating insights. This may take 20–40 seconds.
          </p>
          {selectedProfile && (
            <div className="mt-4 text-xs text-gray-400">
              Profile: {selectedProfile.name}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && analysis && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Customer Analysis Results</h2>
                <p className="text-sm text-gray-500">Profile: {profileName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setAnalysis('');
                  setSelectedProfileId('');
                }}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                ← New Analysis
              </button>
            </div>

            {/* Rendered markdown as formatted text */}
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                {analysis}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-3">Next Steps</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/topics/generate"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                📋 Generate Topics
              </Link>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([analysis], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `customer-analysis-${profileName}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                💾 Save Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
