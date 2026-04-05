'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/profile', label: 'Role Profiles', icon: '👤' },
  { href: '/topics', label: 'Topics', icon: '📋' },
  { href: '/customer-analysis', label: 'Customer Analysis', icon: '🔍' },
  { href: '/single-publish', label: 'Single Publish', icon: '✍️' },
  { href: '/batch-publish', label: 'Batch Publish', icon: '📤' },
  { href: '/billing', label: 'Billing', icon: '💳' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b">
        <div className="text-lg font-bold text-gray-900">泰乐施</div>
        <div className="text-xs text-gray-500">AI Writing Assistant</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
