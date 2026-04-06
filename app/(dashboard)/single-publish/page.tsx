'use client';

import { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/lib/llm/models';
import { PRICING } from '@/lib/billing/credits';

interface Profile {
  id: string;
  name: string;
  bizName?: string | null;
}

interface WPSite {
  id: string;
  name: string;
  url: string;
}

interface Article {
  id: string;
  title: string;
  markdownContent: string;
  modelUsed?: string | null;
  cost: number;
  withImages: boolean;
}

export default function SinglePublishPage() {
  const [step, setStep] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [wpSites, setWpSites] = useState<WPSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [topic, setTopic] = useState('');
  const [profileId, setProfileId] = useState('');
  const [withImages, setWithImages] = useState(true);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [serpEnabled, setSerpEnabled] = useState(false);

  // Step 3
  const [article, setArticle] = useState<Article | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Step 4
  const [wpSiteId, setWpSiteId] = useState('');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'publish' | 'future'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishResult, setPublishResult] = useState<{ link: string } | null>(null);

  useEffect(() => {
    fetch('/api/profiles')
      .then((r) => r.json())
      .then((d) => setProfiles(d.profiles ?? []));
    fetch('/api/wordpress/sites')
      .then((r) => r.json())
      .then((d) => setWpSites(d.sites ?? []));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate-single-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          profileId: profileId || undefined,
          withImages,
          model: selectedModel,
          serpEnabled,
        }),
      });
      const data = await res.json() as { article?: Article; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Generation failed');
        return;
      }
      setArticle(data.article!);
      setEditedContent(data.article!.markdownContent);
      setStep(3);
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article!.id,
          wpSiteId,
          publishStatus,
          scheduledDate: publishStatus === 'future' ? scheduledDate : undefined,
        }),
      });
      const data = await res.json() as { result?: { link: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Publish failed');
        return;
      }
      setPublishResult({ link: data.result!.link });
      setStep(5);
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = editedContent.split(/\s+/).filter(Boolean).length;

  const steps = ['Configure', 'Generate', 'Review', 'Publish'];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">✍️ Single Article Publish</h1>

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

      {/* Step 1: Configure */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold">Step 1: Configure Article</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How to Source Stainless Steel Pipes from China"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Profile</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— No profile —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.bizName ? ` (${p.bizName})` : ''}
                </option>
              ))}
            </select>
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

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium text-sm">With Images</div>
              <div className="text-xs text-gray-500">
                ¥{PRICING.WITH_IMAGES} with images / ¥{PRICING.WITHOUT_IMAGES} without
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWithImages((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                withImages ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  withImages ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium text-sm">SERP Research</div>
              <div className="text-xs text-gray-500">Analyze top Google results before writing</div>
            </div>
            <button
              type="button"
              onClick={() => setSerpEnabled((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                serpEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  serpEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Estimated cost:{' '}
              <span className="font-medium text-blue-600">
                ¥{withImages ? PRICING.WITH_IMAGES : PRICING.WITHOUT_IMAGES}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!topic.trim()) {
                  setError('Please enter a topic');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold">Step 2: Generate Article</h2>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <div>
              <span className="text-gray-500">Topic:</span>{' '}
              <span className="font-medium">{topic}</span>
            </div>
            <div>
              <span className="text-gray-500">Model:</span>{' '}
              <span className="font-medium">
                {AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Images:</span>{' '}
              <span className="font-medium">{withImages ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">SERP Research:</span>{' '}
              <span className="font-medium">{serpEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Generating article… This may take 30–60 seconds.</p>
              {serpEnabled && (
                <p className="text-sm text-gray-400 mt-1">Running SERP research first…</p>
              )}
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                🚀 Generate Article
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Edit */}
      {step === 3 && article && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Step 3: Review &amp; Edit</h2>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>📝 {wordCount} words</span>
              {article.modelUsed && <span>🤖 {article.modelUsed}</span>}
              <span>💰 ¥{article.cost}</span>
            </div>
          </div>

          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={25}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Publish →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Publish */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold">Step 4: Publish to WordPress</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WordPress Site <span className="text-red-500">*</span>
            </label>
            {wpSites.length === 0 ? (
              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                No WordPress sites connected.{' '}
                <a href="/settings/wordpress" className="text-blue-600 hover:underline">
                  Connect one →
                </a>
              </div>
            ) : (
              <select
                value={wpSiteId}
                onChange={(e) => setWpSiteId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select site —</option>
                {wpSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.url})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publish Status
            </label>
            <div className="flex gap-3">
              {(['draft', 'publish', 'future'] as const).map((status) => (
                <label
                  key={status}
                  className={`flex-1 text-center py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    publishStatus === status
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="publishStatus"
                    value={status}
                    checked={publishStatus === status}
                    onChange={() => setPublishStatus(status)}
                    className="sr-only"
                  />
                  {status === 'draft' ? '📄 Draft' : status === 'publish' ? '🌐 Publish' : '📅 Scheduled'}
                </label>
              ))}
            </div>
          </div>

          {publishStatus === 'future' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (!wpSiteId) {
                  setError('Please select a WordPress site');
                  return;
                }
                setError('');
                void handlePublish();
              }}
              disabled={loading || !wpSiteId}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Publishing…' : '🚀 Publish Article'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && publishResult && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold mb-2">Article Published!</h2>
          <p className="text-gray-500 mb-6">
            Your article has been successfully published to WordPress.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href={publishResult.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              View Article →
            </a>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setTopic('');
                setArticle(null);
                setPublishResult(null);
                setEditedContent('');
              }}
              className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              Publish Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
