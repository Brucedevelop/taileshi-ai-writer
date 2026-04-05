import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CREDIT_PACKAGES } from '@/lib/billing/credits';

export default async function BillingPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { credits: true, role: true },
  });

  const recentLogs = await prisma.creditLog.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing & Credits</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Current Balance</div>
            <div className="text-4xl font-bold text-blue-600">
              {isAdmin ? '∞ Unlimited (Admin)' : `¥${user?.credits.toFixed(2) ?? '0.00'}`}
            </div>
          </div>
          {!isAdmin && (
            <a
              href="#packages"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Recharge
            </a>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div id="packages" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Credit Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-sm p-6 border-2 border-transparent hover:border-blue-400 transition cursor-pointer">
                <div className="font-semibold mb-1">{pkg.name}</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">¥{pkg.price}</div>
                <div className="text-sm text-gray-500 mb-4">{pkg.description}</div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                  Purchase
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Date</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="py-2 text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      log.type === 'purchase' ? 'bg-green-100 text-green-700' :
                      log.type === 'admin_free' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2">{log.description}</td>
                  <td className={`py-2 text-right font-medium ${log.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.amount >= 0 ? '+' : ''}¥{Math.abs(log.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
