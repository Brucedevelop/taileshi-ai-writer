import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function WordPressSettingsPage() {
  const session = await auth();
  const sites = await prisma.wordPressSite.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">WordPress Sites</h1>
        <Link
          href="/settings/wordpress/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Add Site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h3 className="text-lg font-semibold mb-2">No WordPress sites connected</h3>
          <p className="text-gray-500 mb-4">Add your WordPress site to start publishing articles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <div className="font-semibold">{site.name}</div>
                <div className="text-sm text-gray-500">{site.url}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${site.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {site.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
