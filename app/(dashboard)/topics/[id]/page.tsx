'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Article = {
  id: string;
  publishStatus: string;
} | null;

type TopicItem = {
  id: string;
  title: string;
  status: string;
  article: Article;
};

type TopicList = {
  id: string;
  name: string;
  product: string | null;
  country: string | null;
  customerType: string | null;
  createdAt: string;
  items: TopicItem[];
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  generated: 'bg-green-100 text-green-700',
  published: 'bg-blue-100 text-blue-700',
};

export default function TopicListPage() {
  const params = useParams();
  const id = params.id as string;

  const [topicList, setTopicList] = useState<TopicList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadTopicList = useCallback(() => {
    setLoading(true);
    fetch(`/api/topics/${id}`)
      .then((r) => r.json())
      .then((data: { topicList?: TopicList; error?: string }) => {
        if (data.topicList) {
          setTopicList(data.topicList);
        } else {
          setError(data.error ?? 'Topic list not found');
        }
      })
      .catch(() => setError('Failed to load topic list'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadTopicList();
  }, [loadTopicList]);

  const toggleSelect = (itemId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!topicList) return;
    if (selected.size === topicList.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(topicList.items.map((i) => i.id)));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        Loading topic list...
      </div>
    );
  }

  if (error || !topicList) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-red-600 mb-4">{error || 'Topic list not found'}</p>
        <Link href="/topics" className="text-blue-600 hover:underline text-sm">
          ← Back to Topics
        </Link>
      </div>
    );
  }

  const allSelected = selected.size === topicList.items.length && topicList.items.length > 0;
  const batchPublishUrl = `/batch-publish?topicIds=${Array.from(selected).join(',')}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/topics" className="text-sm text-gray-500 hover:text-gray-700">
            ← Topic Lists
          </Link>
          <h1 className="text-2xl font-bold mt-1">{topicList.name}</h1>
          <div className="flex gap-4 text-sm text-gray-500 mt-1">
            {topicList.product && <span>🏭 {topicList.product}</span>}
            {topicList.country && <span>🌍 {topicList.country}</span>}
            {topicList.customerType && <span>👥 {topicList.customerType}</span>}
            <span>📝 {topicList.items.length} topics</span>
          </div>
        </div>
        {selected.size > 0 && (
          <Link
            href={batchPublishUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Batch Publish ({selected.size} selected)
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-500">
            {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
          </span>
        </div>

        {topicList.items.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No topics in this list</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topicList.items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="rounded border-gray-300 flex-shrink-0"
                />
                <span className="text-sm text-gray-400 w-8 flex-shrink-0">{index + 1}.</span>
                <span className="flex-1 text-sm text-gray-900">{item.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    statusColors[item.status] ?? statusColors.pending
                  }`}
                >
                  {item.status}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/single-publish?topic=${encodeURIComponent(item.title)}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Generate Article
                  </Link>
                  {item.article && (
                    <Link
                      href={`/articles/${item.article.id}`}
                      className="text-xs text-green-600 hover:underline"
                    >
                      View Article
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
