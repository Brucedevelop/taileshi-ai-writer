'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AVAILABLE_MODELS } from '@/lib/llm/models';

type Profile = {
  id: string;
  name: string;
  bizName: string | null;
};

function GenerateTopicsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProfileId = searchParams.get('profileId') ?? '';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState(preselectedProfileId);
  const [product, setProduct] = useState('');
  const [country, setCountry] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [numTopics, setNumTopics] = useState(20);
  const [model, setModel] = useState(AVAILABLE_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profiles')
      .then((r) => r.json())
      .then((data: { profiles?: Profile[] }) => {
        if (data.profiles) {
          setProfiles(data.profiles);
          if (!profileId && data.profiles.length > 0) {
            setProfileId(data.profiles[0].id);
          }
        }
      })
      .catch(() => {/* ignore */});
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !country.trim() || !customerType.trim()) {
      setError('Product, Target Country, and Customer Type are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          country,
          customerType,
          profileId: profileId || undefined,
          model,
          numTopics,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to generate topics');
        return;
      }
      const data = await res.json() as { topicList: { id: string } };
      router.push(`/topics/${data.topicList.id}`);
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Generate Topics</h1>
        <Link href="/topics" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Role Profile</label>
            {profiles.length === 0 ? (
              <p className="text-sm text-gray-500">
                No profiles found.{' '}
                <Link href="/profile/new" className="text-blue-600 hover:underline">
                  Create one first
                </Link>
              </p>
            ) : (
              <select
                className={inputClass}
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
              >
                <option value="">— No profile —</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.bizName ? ` (${p.bizName})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Product / Industry <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. LED lighting, solar panels"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Target Country <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. USA, Germany"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Customer Type <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Wholesaler, Retailer, Importer"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Number of Topics</label>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={150}
              value={numTopics}
              onChange={(e) => setNumTopics(Math.min(150, Math.max(1, parseInt(e.target.value, 10) || 20)))}
            />
          </div>

          <div>
            <label className={labelClass}>AI Model</label>
            <select
              className={inputClass}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) — {m.costTier}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating topics...
              </>
            ) : (
              '✨ Generate Topics'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GenerateTopicsPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">Loading...</div>}>
      <GenerateTopicsForm />
    </Suspense>
  );
}
