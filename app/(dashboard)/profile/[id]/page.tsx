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

const STEPS = ['Business Info', 'Customer Persona', 'Summary'];

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((data: { profile?: Record<string, unknown>; error?: string }) => {
        if (data.profile) {
          const p = data.profile;
          setForm({
            name: String(p.name ?? ''),
            bizName: String(p.bizName ?? ''),
            bizEmail: String(p.bizEmail ?? ''),
            bizWebsite: String(p.bizWebsite ?? ''),
            brandName: String(p.brandName ?? ''),
            country: String(p.country ?? ''),
            mainProducts: String(p.mainProducts ?? ''),
            businessModel: String(p.businessModel ?? ''),
            companyStatus: String(p.companyStatus ?? ''),
            exportCountries: String(p.exportCountries ?? ''),
            customerPosition: String(p.customerPosition ?? ''),
            customerType: String(p.customerType ?? ''),
            advantages: String(p.advantages ?? ''),
            mainChannels: String(p.mainChannels ?? ''),
            personaName: String(p.personaName ?? ''),
            personaCountry: String(p.personaCountry ?? ''),
            personaAge: String(p.personaAge ?? ''),
            personaTraits: String(p.personaTraits ?? ''),
            personaProducts: String(p.personaProducts ?? ''),
            personaPreferences: String(p.personaPreferences ?? ''),
            personaRole: String(p.personaRole ?? ''),
            personaSourcingRegion: String(p.personaSourcingRegion ?? ''),
            personaBusinessModel: String(p.personaBusinessModel ?? ''),
            personaFindSuppliers: String(p.personaFindSuppliers ?? ''),
            personaRequirements: String(p.personaRequirements ?? ''),
            personaPainPoints: String(p.personaPainPoints ?? ''),
            summaryZh: String(p.summaryZh ?? ''),
            summaryEn: String(p.summaryEn ?? ''),
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
        <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                i === step
                  ? 'bg-blue-600 text-white'
                  : i < step
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i + 1}
            </button>
            <span
              className={`ml-2 text-sm ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="mx-4 h-px w-8 bg-gray-200" />}
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

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Optionally add a summary of this profile (used to give context to the AI).
            </p>
            <div>
              <label className={labelClass}>Summary (Chinese)</label>
              <textarea
                className={textareaClass}
                rows={5}
                placeholder="用中文描述企业背景、客户画像和营销目标..."
                value={form.summaryZh}
                onChange={(e) => set('summaryZh', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Summary (English)</label>
              <textarea
                className={textareaClass}
                rows={5}
                placeholder="Describe your business background, customer persona, and marketing goals..."
                value={form.summaryEn}
                onChange={(e) => set('summaryEn', e.target.value)}
              />
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
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
