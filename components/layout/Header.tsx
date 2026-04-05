'use client';

import { signOut } from 'next-auth/react';
import type { User } from 'next-auth';

interface HeaderProps {
  user: User & { role?: string };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div></div>
      <div className="flex items-center gap-4">
        {user.role === 'admin' && (
          <a href="/admin" className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            Admin
          </a>
        )}
        <div className="text-sm text-gray-600">{user.name ?? user.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
