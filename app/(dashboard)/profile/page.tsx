import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ProfilesPage() {
  const session = await auth();
  const profiles = await prisma.roleProfile.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Role Profiles</h1>
        <Link
          href="/profile/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Profile
        </Link>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
          <p className="text-gray-500 mb-4">Create your first role profile to start generating articles</p>
          <Link href="/profile/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Create Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-1">{profile.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{profile.bizName ?? 'No company name'}</p>
              <div className="flex gap-2">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
