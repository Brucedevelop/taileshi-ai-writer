'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  bizName?: string | null;
  country?: string | null;
  mainProducts?: string | null;
}

export default function ProfileListClient({ profiles: initial }: { profiles: Profile[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initial);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/profiles/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="font-semibold text-lg mb-2">Delete Profile?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete &quot;{deleteName}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-1">{profile.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{profile.bizName ?? 'No company name'}</p>
            {profile.country && <p className="text-xs text-gray-400 mb-3">🌍 {profile.country}</p>}
            <div className="flex flex-wrap gap-2 items-center">
              <Link
                href={`/profile/${profile.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href={`/topics/generate?profileId=${profile.id}`}
                className="text-sm text-green-600 hover:underline"
              >
                Generate Topics
              </Link>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => confirmDelete(profile.id, profile.name)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
