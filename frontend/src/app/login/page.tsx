'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { postJson } from '../../lib/api';
import { saveAuth } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await postJson('/auth/login', { email, password });
      saveAuth(data.access_token, data.role);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-20">
        <section className="rounded-[2rem] bg-white p-10 shadow-lg">
          <h1 className="text-3xl font-semibold">Login to your banking dashboard</h1>
          <p className="mt-3 text-slate-600">Use your project credentials to sign in and manage customers, accounts, and transactions.</p>
          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <label className="block">
              <span className="text-sm text-slate-600">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </section>
      </main>
    </div>
  );
}
