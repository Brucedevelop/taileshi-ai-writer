import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProfileListClient from './ProfileListClient';

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
        <ProfileListClient profiles={profiles} />
      )}
    </div>
  );
}
