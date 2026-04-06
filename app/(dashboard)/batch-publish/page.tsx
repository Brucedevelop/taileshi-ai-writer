'use client';

import { useState, useEffect, useCallback } from 'react';
import { AVAILABLE_MODELS } from '@/lib/llm/models';
import { PRICING } from '@/lib/billing/credits';

interface Profile {
  id: string;
  name: string;
}

interface WPSite {
  id: string;
  name: string;
  url: string;
}

interface TopicItem {
  id: string;
  title: string;
  status: string;
}

interface TopicList {
  id: string;
  name: string;
  product?: string | null;
  items: TopicItem[];
}

interface PublishJob {
  id: string;
  status: string;
  totalArticles: number;
  completedCount: number;
  failedCount: number;
  totalCost: number;
  wpSite: { name: string; url: string };
}

export default function BatchPublishPage() {
  const [step, setStep] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [wpSites, setWpSites] = useState<WPSite[]>([]);
  const [topicLists, setTopicLists] = useState<TopicList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all');

  // Step 2
  const [profileId, setProfileId] = useState('');
  const [wpSiteId, setWpSiteId] = useState('');
  const [withImages, setWithImages] = useState(true);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledStart, setScheduledStart] = useState('');
  const [dailyLimit, setDailyLimit] = useState(5);
  const [dailyStartHour, setDailyStartHour] = useState(9);
  const [dailyEndHour, setDailyEndHour] = useState(18);
  const [timezone, setTimezone] = useState('UTC');

  // Step 4
  const [jobId, setJobId] = useState('');
  const [job, setJob] = useState<PublishJob | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/profiles').then((r) => r.json()),
      fetch('/api/wordpress/sites').then((r) => r.json()),
      fetch('/api/topics?includeItems=true').then((r) => r.json()),
    ]).then(([pd, wd, td]: [
      { profiles?: Profile[] },
      { sites?: WPSite[] },
      { topicLists?: TopicList[] },
    ]) => {
      setProfiles(pd.profiles ?? []);
      setWpSites(wd.sites ?? []);
      setTopicLists(td.topicLists ?? []);
    }).catch(console.error);
  }, []);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;
    const res = await fetch(`/api/batch-publish/${jobId}`);
    const data = await res.json() as { job?: PublishJob };
    if (data.job) setJob(data.job);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    if (job && (job.status === 'completed' || job.status === 'failed')) return;
    const interval = setInterval(() => { void fetchJobStatus(); }, 3000);
    return () => clearInterval(interval);
  }, [jobId, job, fetchJobStatus]);

  const filteredLists = topicLists
    .map((list) => ({
      ...list,
      items: statusFilter === 'all' ? list.items : list.items.filter((i) => i.status === statusFilter),
    }))
    .filter((list) => list.items.length > 0);

  const selectedCount = selectedTopics.size;
  const totalCost = selectedCount * (withImages ? PRICING.WITH_IMAGES : PRICING.WITHOUT_IMAGES);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleList = (list: TopicList) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      const allSelected = list.items.every((i) => next.has(i.id));
      if (allSelected) list.items.forEach((i) => next.delete(i.id));
      else list.items.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const handleStartBatch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/batch-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicIds: Array.from(selectedTopics),
          wpSiteId,
          profileId: profileId || undefined,
          withImages,
          model: selectedModel,
          publishMode,
          scheduledStart: publishMode === 'scheduled' ? scheduledStart : undefined,
          dailyLimit: publishMode === 'scheduled' ? dailyLimit : undefined,
          dailyStartHour: publishMode === 'scheduled' ? dailyStartHour : undefined,
          dailyEndHour: publishMode === 'scheduled' ? dailyEndHour : undefined,
          timezone: publishMode === 'scheduled' ? timezone : undefined,
        }),
      });
      const data = await res.json() as { jobId?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to start batch');
        return;
      }
      setJobId(data.jobId!);
      setStep(4);
      await fetchJobStatus();
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const progressPct =
    job && job.totalArticles > 0
      ? Math.round(((job.completedCount + job.failedCount) / job.totalArticles) * 100)
      : 0;

  const steps = ['Select Topics', 'Configure', 'Review', 'Progress'];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📤 Batch Article Publishing</h1>

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

      {/* Step 1: Select Topics */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Step 1: Select Topics</h2>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Generated</option>
                <option value="published">Published</option>
              </select>
              <span className="text-sm text-gray-500">{selectedCount} selected</span>
            </div>
          </div>

          {filteredLists.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-3">📋</div>
              <p>
                No topics available.{' '}
                <a href="/topics/generate" className="text-blue-600 hover:underline">
                  Generate topics first →
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {filteredLists.map((list) => {
                const allSelected = list.items.every((i) => selectedTopics.has(i.id));
                return (
                  <div key={list.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer"
                      onClick={() => toggleList(list)}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleList(list)}
                        className="rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="font-medium text-sm">{list.name}</span>
                      {list.product && (
                        <span className="text-xs text-gray-400">({list.product})</span>
                      )}
                      <span className="ml-auto text-xs text-gray-400">
                        {list.items.length} topics
                      </span>
                    </div>
                    <div className="divide-y">
                      {list.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleTopic(item.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTopics.has(item.id)}
                            onChange={() => toggleTopic(item.id)}
                            className="rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm flex-1">{item.title}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'pending'
                                ? 'bg-gray-100 text-gray-600'
                                : item.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                if (!selectedCount) {
                  setError('Please select at least one topic');
                  return;
                }
                setError('');
                setStep(2);
              }}
              disabled={!selectedCount}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Next ({selectedCount} topics) →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold">Step 2: Configure Batch</h2>

          <div className="grid grid-cols-2 gap-4">
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
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WordPress Site <span className="text-red-500">*</span>
              </label>
              {wpSites.length === 0 ? (
                <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg">
                  <a href="/settings/wordpress" className="text-blue-600 hover:underline">
                    Connect a site →
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
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
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
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium text-sm">With Images</div>
              <div className="text-xs text-gray-500">
                ¥{PRICING.WITH_IMAGES} vs ¥{PRICING.WITHOUT_IMAGES} per article
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publish Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {(['immediate', 'scheduled'] as const).map((mode) => (
                <label
                  key={mode}
                  className={`p-3 rounded-lg border cursor-pointer text-sm transition-colors ${
                    publishMode === mode
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="publishMode"
                    value={mode}
                    checked={publishMode === mode}
                    onChange={() => setPublishMode(mode)}
                    className="sr-only"
                  />
                  <div className="font-medium">
                    {mode === 'immediate' ? '⚡ Immediate' : '📅 Scheduled'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {mode === 'immediate'
                      ? 'Publish all at once'
                      : 'Set daily limits and schedule'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {publishMode === 'scheduled' && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Daily Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={dailyStartHour}
                    onChange={(e) => setDailyStartHour(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={dailyEndHour}
                    onChange={(e) => setDailyEndHour(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="UTC"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="text-gray-500">Estimated cost:</span>
              <span className="font-bold text-blue-700 ml-1">¥{totalCost}</span>
              <span className="text-xs text-gray-400 ml-1">
                ({selectedCount} articles × ¥
                {withImages ? PRICING.WITH_IMAGES : PRICING.WITHOUT_IMAGES})
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep(1)}
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
                setStep(3);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Step 3: Review &amp; Start</h2>

          <div className="space-y-0 divide-y">
            {[
              ['Articles', `${selectedCount} topics selected`],
              ['Model', AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel],
              ['WordPress Site', wpSites.find((s) => s.id === wpSiteId)?.name ?? wpSiteId],
              ['Images', withImages ? `Yes (¥${PRICING.WITH_IMAGES}/article)` : `No (¥${PRICING.WITHOUT_IMAGES}/article)`],
              ['Publish Mode', publishMode === 'immediate' ? 'Immediate' : `Scheduled (${dailyLimit}/day)`],
              ['Total Cost', `¥${totalCost}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between py-3">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg">
            ⚠️ Credits will be deducted immediately when you start the batch.
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => { void handleStartBatch(); }}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Starting…' : '🚀 Start Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Progress */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold">Step 4: Progress</h2>

          {job ? (
            <>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">
                  {job.completedCount + job.failedCount} / {job.totalArticles}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    job.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  ['Total', job.totalArticles, 'text-gray-700'],
                  ['Completed', job.completedCount, 'text-green-600'],
                  ['Failed', job.failedCount, 'text-red-600'],
                ].map(([label, val, cls]) => (
                  <div key={String(label)} className="bg-gray-50 rounded-lg p-3">
                    <div className={`text-2xl font-bold ${String(cls)}`}>{String(val)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{String(label)}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                    job.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : job.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : job.status === 'processing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {job.status === 'processing' && <span className="animate-pulse">⏳</span>}
                  {job.status === 'completed' && '✅'}
                  {job.status === 'failed' && '❌'}
                  {job.status === 'pending' && '⏸'}
                  <span className="capitalize">{job.status}</span>
                </span>
                {(job.status === 'processing' || job.status === 'pending') && (
                  <span className="text-xs text-gray-400">Auto-refreshing every 3 seconds…</span>
                )}
              </div>

              {job.status === 'completed' && (
                <div className="flex gap-3">
                  <a
                    href="/articles"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    View Articles →
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSelectedTopics(new Set());
                      setJob(null);
                      setJobId('');
                    }}
                    className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    New Batch
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading job status…</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
