import Link from 'next/link';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    bizName?: string | null;
    country?: string | null;
    mainProducts?: string | null;
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-1">{profile.name}</h3>
      {profile.bizName && <p className="text-sm text-gray-600 mb-1">🏢 {profile.bizName}</p>}
      {profile.country && <p className="text-sm text-gray-500 mb-1">🌍 {profile.country}</p>}
      {profile.mainProducts && (
        <p className="text-sm text-gray-500 mb-3">🏭 {profile.mainProducts}</p>
      )}
      <div className="flex gap-2">
        <Link href={`/profile/${profile.id}`} className="text-sm text-blue-600 hover:underline">
          Edit
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href={`/topics/generate?profileId=${profile.id}`}
          className="text-sm text-green-600 hover:underline"
        >
          Generate Topics
        </Link>
      </div>
    </div>
  );
}
