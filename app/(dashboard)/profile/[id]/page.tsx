'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type FormData = {
  name: string;
  bizName: string;
  bizEmail: string;
  bizWebsite: string;
  brandName: string;
  country: string;
  mainProducts: string;
  businessModel: string;
  companyStatus: string;
  exportCountries: string;
  customerPosition: string;
  customerType: string;
  advantages: string;
  mainChannels: string;
  personaName: string;
  personaCountry: string;
  personaAge: string;
  personaTraits: string;
  personaProducts: string;
  personaPreferences: string;
  personaRole: string;
  personaSourcingRegion: string;
  personaBusinessModel: string;
  personaFindSuppliers: string;
  personaRequirements: string;
  personaPainPoints: string;
  summaryZh: string;
  summaryEn: string;
};

const emptyForm: FormData = {
  name: '',
  bizName: '',
  bizEmail: '',
  bizWebsite: '',
  brandName: '',
  country: '',
  mainProducts: '',
  businessModel: '',
  companyStatus: '',
  exportCountries: '',
  customerPosition: '',
  customerType: '',
  advantages: '',
  mainChannels: '',
  personaName: '',
  personaCountry: '',
  personaAge: '',
  personaTraits: '',
  personaProducts: '',
  personaPreferences: '',
  personaRole: '',
  personaSourcingRegion: '',
  personaBusinessModel: '',
  personaFindSuppliers: '',
  personaRequirements: '',
  personaPainPoints: '',
  summaryZh: '',
  summaryEn: '',
};

const STEPS = ['企业信息', '客户画像', '最终确认', '摘要生成'];

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((data: { profile?: Record<string, unknown>; error?: string }) => {
        if (data.profile) {
          const p = data.profile;
          setForm({
            name: (p.name as string | null) ?? '',
            bizName: (p.bizName as string | null) ?? '',
            bizEmail: (p.bizEmail as string | null) ?? '',
            bizWebsite: (p.bizWebsite as string | null) ?? '',
            brandName: (p.brandName as string | null) ?? '',
            country: (p.country as string | null) ?? '',
            mainProducts: (p.mainProducts as string | null) ?? '',
            businessModel: (p.businessModel as string | null) ?? '',
            companyStatus: (p.companyStatus as string | null) ?? '',
            exportCountries: (p.exportCountries as string | null) ?? '',
            customerPosition: (p.customerPosition as string | null) ?? '',
            customerType: (p.customerType as string | null) ?? '',
            advantages: (p.advantages as string | null) ?? '',
            mainChannels: (p.mainChannels as string | null) ?? '',
            personaName: (p.personaName as string | null) ?? '',
            personaCountry: (p.personaCountry as string | null) ?? '',
            personaAge: (p.personaAge as string | null) ?? '',
            personaTraits: (p.personaTraits as string | null) ?? '',
            personaProducts: (p.personaProducts as string | null) ?? '',
            personaPreferences: (p.personaPreferences as string | null) ?? '',
            personaRole: (p.personaRole as string | null) ?? '',
            personaSourcingRegion: (p.personaSourcingRegion as string | null) ?? '',
            personaBusinessModel: (p.personaBusinessModel as string | null) ?? '',
            personaFindSuppliers: (p.personaFindSuppliers as string | null) ?? '',
            personaRequirements: (p.personaRequirements as string | null) ?? '',
            personaPainPoints: (p.personaPainPoints as string | null) ?? '',
            summaryZh: (p.summaryZh as string | null) ?? '',
            summaryEn: (p.summaryEn as string | null) ?? '',
          });
        } else {
          setError(data.error ?? 'Profile not found');
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoadingProfile(false));
  }, [id]);

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { summaryZh?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate summary');
        return;
      }
      set('summaryZh', data.summaryZh ?? '');
    } catch {
      setError('Network error, please try again');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleTranslate = async () => {
    if (!form.summaryZh.trim()) {
      setError('Please generate the Chinese summary first');
      return;
    }
    setTranslating(true);
    setError('');
    try {
      const res = await fetch('/api/ai/translate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryZh: form.summaryZh }),
      });
      const data = await res.json() as { summaryEn?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to translate summary');
        return;
      }
      set('summaryEn', data.summaryEn ?? '');
    } catch {
      setError('Network error, please try again');
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(form.summaryEn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Profile name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to update profile');
        return;
      }
      router.push('/profile');
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to delete profile');
        setShowDeleteConfirm(false);
        return;
      }
      router.push('/profile');
    } catch {
      setError('Network error, please try again');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const textareaClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Role Profile</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-500 hover:text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            🗑️ Delete
          </button>
          <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="font-semibold text-lg mb-2">Delete Profile?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete &quot;{form.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                i === step
                  ? 'bg-blue-600 text-white'
                  : i < step
                  ? 'bg-blue-100 text-blue-600 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
            >
              {i + 1}
            </button>
            <span
              className={`ml-2 text-sm whitespace-nowrap ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="mx-3 h-px w-6 bg-gray-200 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Step 0: Business Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Profile Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Main Business Profile"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  className={inputClass}
                  placeholder="Your company name"
                  value={form.bizName}
                  onChange={(e) => set('bizName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Brand Name</label>
                <input
                  className={inputClass}
                  placeholder="Your brand"
                  value={form.brandName}
                  onChange={(e) => set('brandName', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Business Email</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="contact@company.com"
                  value={form.bizEmail}
                  onChange={(e) => set('bizEmail', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input
                  className={inputClass}
                  placeholder="https://yoursite.com"
                  value={form.bizWebsite}
                  onChange={(e) => set('bizWebsite', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Country</label>
                <input
                  className={inputClass}
                  placeholder="China"
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Company Status</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Manufacturer, Trader"
                  value={form.companyStatus}
                  onChange={(e) => set('companyStatus', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Main Products</label>
              <input
                className={inputClass}
                placeholder="e.g. LED lights, solar panels"
                value={form.mainProducts}
                onChange={(e) => set('mainProducts', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Business Model</label>
                <input
                  className={inputClass}
                  placeholder="e.g. B2B, OEM, ODM"
                  value={form.businessModel}
                  onChange={(e) => set('businessModel', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Customer Type</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Wholesaler, Retailer"
                  value={form.customerType}
                  onChange={(e) => set('customerType', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Export Countries</label>
              <textarea
                className={textareaClass}
                rows={2}
                placeholder="e.g. USA, Germany, UK, Australia"
                value={form.exportCountries}
                onChange={(e) => set('exportCountries', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Customer Position</label>
              <input
                className={inputClass}
                placeholder="e.g. Purchasing Manager, CEO"
                value={form.customerPosition}
                onChange={(e) => set('customerPosition', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Competitive Advantages</label>
              <textarea
                className={textareaClass}
                rows={3}
                placeholder="What makes your company stand out?"
                value={form.advantages}
                onChange={(e) => set('advantages', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Main Sales Channels</label>
              <input
                className={inputClass}
                placeholder="e.g. Alibaba, own website, trade shows"
                value={form.mainChannels}
                onChange={(e) => set('mainChannels', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 1: Customer Persona */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Persona Name</label>
                <input
                  className={inputClass}
                  placeholder="e.g. John the Buyer"
                  value={form.personaName}
                  onChange={(e) => set('personaName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Persona Country</label>
                <input
                  className={inputClass}
                  placeholder="e.g. USA"
                  value={form.personaCountry}
                  onChange={(e) => set('personaCountry', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Age Range</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 35-45"
                  value={form.personaAge}
                  onChange={(e) => set('personaAge', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Role / Title</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Procurement Director"
                  value={form.personaRole}
                  onChange={(e) => set('personaRole', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Traits</label>
              <textarea
                className={textareaClass}
                rows={3}
                placeholder="Key characteristics, values, motivations"
                value={form.personaTraits}
                onChange={(e) => set('personaTraits', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Products They Source</label>
              <input
                className={inputClass}
                placeholder="Products this persona typically buys"
                value={form.personaProducts}
                onChange={(e) => set('personaProducts', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Preferences</label>
              <textarea
                className={textareaClass}
                rows={2}
                placeholder="What they look for in a supplier"
                value={form.personaPreferences}
                onChange={(e) => set('personaPreferences', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Sourcing Region</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Asia, China"
                  value={form.personaSourcingRegion}
                  onChange={(e) => set('personaSourcingRegion', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Business Model</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Importer, Distributor"
                  value={form.personaBusinessModel}
                  onChange={(e) => set('personaBusinessModel', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>How They Find Suppliers</label>
              <textarea
                className={textareaClass}
                rows={2}
                placeholder="e.g. Google search, trade shows, referrals"
                value={form.personaFindSuppliers}
                onChange={(e) => set('personaFindSuppliers', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Key Requirements</label>
              <textarea
                className={textareaClass}
                rows={3}
                placeholder="What they need from suppliers"
                value={form.personaRequirements}
                onChange={(e) => set('personaRequirements', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Pain Points</label>
              <textarea
                className={textareaClass}
                rows={3}
                placeholder="What problems they face when sourcing"
                value={form.personaPainPoints}
                onChange={(e) => set('personaPainPoints', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Final Confirmation */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2">
              ✏️ 请确认并检查以下信息，可直接在输入框中修改
            </p>
            <h3 className="font-semibold text-gray-800 border-b pb-2">企业信息</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Profile Name', 'name'],
                ['Company Name', 'bizName'],
                ['Brand Name', 'brandName'],
                ['Business Email', 'bizEmail'],
                ['Website', 'bizWebsite'],
                ['Country', 'country'],
                ['Company Status', 'companyStatus'],
                ['Main Products', 'mainProducts'],
                ['Business Model', 'businessModel'],
                ['Customer Type', 'customerType'],
                ['Customer Position', 'customerPosition'],
                ['Main Channels', 'mainChannels'],
              ] as [string, keyof FormData][]).map(([label, field]) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Export Countries</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.exportCountries}
                onChange={(e) => set('exportCountries', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Competitive Advantages</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.advantages}
                onChange={(e) => set('advantages', e.target.value)}
              />
            </div>
            <h3 className="font-semibold text-gray-800 border-b pb-2 mt-4">客户画像</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Persona Name', 'personaName'],
                ['Persona Country', 'personaCountry'],
                ['Age Range', 'personaAge'],
                ['Role / Title', 'personaRole'],
                ['Products They Source', 'personaProducts'],
                ['Sourcing Region', 'personaSourcingRegion'],
                ['Business Model', 'personaBusinessModel'],
              ] as [string, keyof FormData][]).map(([label, field]) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Traits</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.personaTraits}
                onChange={(e) => set('personaTraits', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Preferences</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.personaPreferences}
                onChange={(e) => set('personaPreferences', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>How They Find Suppliers</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.personaFindSuppliers}
                onChange={(e) => set('personaFindSuppliers', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Key Requirements</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.personaRequirements}
                onChange={(e) => set('personaRequirements', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Pain Points</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.personaPainPoints}
                onChange={(e) => set('personaPainPoints', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Summary Generation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>中文摘要 (Summary Chinese)</label>
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="flex items-center gap-1 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {generatingSummary ? '生成中...' : '🤖 AI 生成摘要'}
                </button>
              </div>
              <textarea
                className={textareaClass}
                rows={8}
                placeholder="点击「🤖 AI 生成摘要」按钮自动生成，或手动输入..."
                value={form.summaryZh}
                onChange={(e) => set('summaryZh', e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>英文摘要 (Summary English)</label>
                <button
                  onClick={handleTranslate}
                  disabled={translating || !form.summaryZh.trim()}
                  className="flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {translating ? '翻译中...' : '🌐 翻译为英文'}
                </button>
              </div>
              <textarea
                className={textareaClass}
                rows={8}
                placeholder="中文摘要生成后，点击「翻译为英文」自动翻译，或手动输入..."
                value={form.summaryEn}
                onChange={(e) => set('summaryEn', e.target.value)}
              />
              {form.summaryEn && (
                <button
                  onClick={handleCopy}
                  className="mt-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-600"
                >
                  {copied ? '✅ 已复制' : '📋 一键复制'}
                </button>
              )}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              {step === 2 ? '🤖 进入摘要生成' : 'Next →'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : '💾 保存 Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
