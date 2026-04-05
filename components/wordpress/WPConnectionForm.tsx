'use client';

import { useState } from 'react';

interface WPConnectionFormProps {
  onSuccess?: () => void;
}

export function WPConnectionForm({ onSuccess }: WPConnectionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    appPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/wordpress/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json() as { error?: string; siteName?: string };

    if (!response.ok) {
      setError(data.error ?? 'Connection failed');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    onSuccess?.();
  };

  if (success) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-semibold">WordPress site connected!</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Site Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My WordPress Blog"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">WordPress URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://yourblog.com"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Application Password</label>
        <input
          type="password"
          value={formData.appPassword}
          onChange={(e) => setFormData({ ...formData, appPassword: e.target.value })}
          placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          WordPress Admin → Users → Profile → Application Passwords
        </p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing connection...' : 'Connect Site'}
      </button>
    </form>
  );
}
