import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [articleCount, creditBalance, publishJobCount] = await Promise.all([
    prisma.article.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { credits: true, role: true } }),
    prisma.publishJob.count({ where: { userId } }),
  ]);

  const isAdmin = creditBalance?.role === 'admin';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-1">Credit Balance</div>
          <div className="text-3xl font-bold text-blue-600">
            {isAdmin ? '∞ Admin' : `¥${creditBalance?.credits.toFixed(2) ?? '0.00'}`}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-1">Articles Generated</div>
          <div className="text-3xl font-bold">{articleCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-1">Publish Jobs</div>
          <div className="text-3xl font-bold">{publishJobCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/profile/new', label: '+ New Profile', icon: '👤' },
            { href: '/topics/generate', label: 'Generate Topics', icon: '📋' },
            { href: '/single-publish', label: 'Single Publish', icon: '✍️' },
            { href: '/batch-publish', label: 'Batch Publish', icon: '📤' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
