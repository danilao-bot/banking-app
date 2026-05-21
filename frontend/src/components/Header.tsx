'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearAuth, getToken } from '../lib/auth';

type HeaderProps = {
  title?: string;
};

export default function Header({ title = 'Core Banking System' }: HeaderProps) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    setAuthToken(getToken());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shadow-sm">
      <div>
        <Link href="/">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </Link>
        <p className="text-sm text-slate-500">Modern banking for your project</p>
      </div>
      <nav className="flex items-center gap-4 text-sm text-slate-600">
        {authToken ? (
          <>
            <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
            <button onClick={handleLogout} className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="hover:text-slate-900">Login</Link>
        )}
      </nav>
    </header>
  );
}
