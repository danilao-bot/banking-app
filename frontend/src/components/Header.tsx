'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearAuth, getToken } from '../lib/auth';
import { getJson } from '../lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

type HeaderProps = {
  title?: string;
};

type UserProfile = {
  first_name: string;
  last_name: string;
};

export default function Header({ title = 'AETHER' }: HeaderProps) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    setAuthToken(token);

    // Fetch user profile if logged in
    if (token) {
      getJson('/customers/me', token)
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  useEffect(() => {
    async function ping() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) setBackendHealthy(true);
        else setBackendHealthy(false);
      } catch (e) {
        setBackendHealthy(false);
      }
    }
    ping();
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    setUser(null);
    router.push('/login');
  };

  const getInitials = (u: UserProfile) => {
    return `${u.first_name.charAt(0)}${u.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-lg">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="group">
          <h1 className="text-lg sm:text-xl font-extrabold tracking-[0.2em] bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent group-hover:opacity-90 transition">
            {title}
          </h1>
        </Link>
      </div>

      {/* Right Controls */}
      <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
        {/* API Health Indicator (desktop only) */}
        <div className="hidden md:flex items-center gap-2 mr-2">
          <span className={`inline-block h-2 w-2 rounded-full ${backendHealthy ? 'bg-emerald-400' : backendHealthy === false ? 'bg-rose-500' : 'bg-slate-300'}`} />
          <span className="text-xs text-slate-400">{backendHealthy === null ? 'Checking API' : backendHealthy ? 'API OK' : 'API Offline'}</span>
        </div>

        {authToken ? (
          <>
            {/* Scan QR / Scanner (Mobile + Desktop) */}
            <button
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition focus:outline-none shrink-0"
              aria-label="Scan QR code"
              title="Scan QR Code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
            </button>

            {/* Notification Bell (Mobile + Desktop) */}
            <button
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition focus:outline-none shrink-0"
              aria-label="Notifications"
              title="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>

            {/* User Avatar + Name (Mobile + Desktop) */}
            <div className="flex items-center gap-3 ml-1 sm:ml-2">
              {/* Avatar Circle */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[11px] font-black text-white shadow-lg shadow-purple-500/20 border border-white/10 shrink-0">
                {user ? getInitials(user) : '?'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Retail Account</p>
              </div>
            </div>

            {/* Dashboard Link (desktop only) */}
            <Link href="/dashboard" className="hidden md:inline-block text-slate-300 hover:text-white transition">
              Dashboard
            </Link>

            {/* Sign Out (desktop only) */}
            <button
              onClick={handleLogout}
              className="hidden md:inline-block rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-100 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-400 hover:text-white transition px-2">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 hover:scale-[1.02] active:scale-100 transition"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
