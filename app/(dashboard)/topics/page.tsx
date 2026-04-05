import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TopicsPage() {
  const session = await auth();
  const topicLists = await prisma.topicList.findMany({
    where: { userId: session!.user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Topic Lists</h1>
        <Link
          href="/topics/generate"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Generate Topics
        </Link>
      </div>

      {topicLists.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No topic lists yet</h3>
          <p className="text-gray-500 mb-4">Generate your first batch of SEO topics</p>
          <Link href="/topics/generate" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Generate Topics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topicLists.map((list) => (
            <div key={list.id} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-1">{list.name}</h3>
              <div className="text-sm text-gray-500 mb-3">
                {list.product && <span className="mr-2">🏭 {list.product}</span>}
                {list.country && <span className="mr-2">🌍 {list.country}</span>}
                <span>📝 {list._count.items} topics</span>
              </div>
              <Link href={`/topics/${list.id}`} className="text-sm text-blue-600 hover:underline">
                View Topics →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
