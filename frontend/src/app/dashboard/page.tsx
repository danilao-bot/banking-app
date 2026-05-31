'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import { getToken } from '../../lib/auth';
import { getJson } from '../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  status: string;
};

type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
};

type Transaction = {
  transaction_id: number;
  account_id: number;
  transaction_type: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description?: string;
  reference?: string;
  status: string;
};

export default function DashboardPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        const profile = await getJson('/customers/me', token);
        setCustomer(profile);

        const userAccounts = await getJson('/accounts/me', token);
        setAccounts(userAccounts);

        if (userAccounts.length > 0) {
          const primaryAccount = userAccounts[0];
          const history = await getJson(`/transactions/history/${primaryAccount.account_id}`, token);
          setTransactions(history.slice(0, 5));
        }
        setError('');
      } catch (err: any) {
        console.error(err);
        setError('Unable to load wallet data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const primaryAccount = accounts[0] || null;

  const formatBalance = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '\u20A6' : currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DEPOSIT':
        return <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
      case 'WITHDRAWAL':
        return <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
      case 'TRANSFER':
        return <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
      default:
        return <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
    }
  };

  const userInitials = customer
    ? `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`
    : '';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-indigo-600/10 w-[45vw] h-[45vw] left-[-15vw] top-[-15vw]" />
      <div className="glow-circle bg-purple-600/10 w-[40vw] h-[40vw] right-[-5vw] top-[5vw]" />
      <div className="glow-circle bg-cyan-600/10 w-[35vw] h-[35vw] left-[15vw] bottom-[-10vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
            {loading ? (
              <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <p className="text-sm text-slate-400">Loading your dashboard...</p>
              </div>
            ) : error ? (
              <div className="glass-panel mx-auto max-w-xl rounded-3xl p-8 border border-red-500/20 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Failed to load wallet</h2>
                <p className="text-slate-400 text-sm mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="glow-btn px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto md:mx-0 md:max-w-5xl">

                {/* ───── 1. Greeting Section ───── */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-extrabold text-white shrink-0 shadow-lg shadow-purple-500/20 border border-white/10">
                      {userInitials}
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-white tracking-tight">
                        Hi, {customer?.first_name || 'Customer'}
                      </h1>
                      <p className="text-xs text-slate-400 mt-0.5">Welcome to your secure Aether portal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
                      Retail Tier 3
                    </span>
                  </div>
                </div>

                {/* ───── 2. Balance Card (PalmPay solid gradient style) ───── */}
                {primaryAccount ? (
                  <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-700 via-purple-800 to-violet-950 p-6 sm:p-8 shadow-xl shadow-purple-950/20 border border-white/10">
                    {/* Background decorations */}
                    <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-pink-500/10 filter blur-2xl" />
                    <div className="absolute left-[-20px] bottom-[-20px] h-32 w-32 rounded-full bg-purple-500/15 filter blur-2xl" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-purple-200/70 uppercase tracking-widest">Available Balance</p>
                        <div className="flex items-center gap-3.5">
                          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            {showBalance
                              ? formatBalance(primaryAccount.balance, primaryAccount.currency)
                              : '••••••••'}
                          </span>
                          <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-purple-200/70 hover:text-white transition focus:outline-none bg-white/5 hover:bg-white/10 p-1.5 rounded-lg shrink-0"
                            title={showBalance ? 'Hide Balance' : 'Show Balance'}
                          >
                            {showBalance ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] font-semibold text-purple-300/80 tracking-widest font-mono pt-1">
                          NUBAN: {primaryAccount.account_number}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <Link
                          href="/deposit"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-purple-900 hover:bg-purple-50 transition-all font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-white/5 active:scale-95"
                        >
                          <svg className="w-4 h-4 text-purple-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          Add Money
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel rounded-[2rem] p-8 text-center border border-white/5">
                    <p className="text-slate-400 text-sm">No active accounts found.</p>
                    <Link href="/deposit" className="glow-btn mt-4 inline-block px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider">
                      Fund Wallet to Start
                    </Link>
                  </div>
                )}

                {/* ───── 3. Money Transfer Section ───── */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Money Transfer</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {/* To Bank */}
                    <Link href="/transfer" className="glass-panel rounded-[2rem] p-5 flex flex-col items-center gap-2.5 border border-white/5 hover:border-purple-500/20 hover:bg-purple-950/10 transition group">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 text-purple-400 transition duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 group-hover:text-white transition">To Bank</span>
                    </Link>
                    {/* To Aether */}
                    <Link href="/transfer" className="glass-panel rounded-[2rem] p-5 flex flex-col items-center gap-2.5 border border-white/5 hover:border-pink-500/20 hover:bg-pink-950/10 transition group">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 text-pink-400 transition duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 group-hover:text-white transition">To Aether</span>
                    </Link>
                    {/* Withdraw */}
                    <Link href="/withdrawal" className="glass-panel rounded-[2rem] p-5 flex flex-col items-center gap-2.5 border border-white/5 hover:border-amber-500/20 hover:bg-amber-950/10 transition group">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 text-amber-400 transition duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 group-hover:text-white transition">Withdraw</span>
                    </Link>
                  </div>
                </div>

                {/* ───── 4. Services Grid (Solid premium icons) ───── */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Services</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Airtime */}
                    <Link href="/services/airtime" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-emerald-500/25 hover:bg-emerald-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">Airtime</span>
                    </Link>
                    {/* Data */}
                    <Link href="/services/data" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-blue-500/25 hover:bg-blue-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.25h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">Data</span>
                    </Link>
                    {/* Electricity */}
                    <Link href="/services/electricity" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-amber-500/25 hover:bg-amber-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">Electricity</span>
                    </Link>
                    {/* TV / Cable */}
                    <Link href="/services/tv" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-purple-500/25 hover:bg-purple-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">TV/Cable</span>
                    </Link>
                    {/* Betting */}
                    <Link href="/services/betting" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-orange-500/25 hover:bg-orange-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.672c-.99 0-1.928-.228-2.77-.672" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">Betting</span>
                    </Link>
                    {/* Education */}
                    <Link href="/services/education" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-cyan-500/25 hover:bg-cyan-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">Education</span>
                    </Link>
                    {/* Internet */}
                    <Link href="/services/internet" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-teal-500/25 hover:bg-teal-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">Internet</span>
                    </Link>
                    {/* More */}
                    <Link href="/services" className="glass-panel rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-white/5 hover:border-slate-500/25 hover:bg-slate-950/10 transition group text-center">
                      <div className="w-11 h-11 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400 group-hover:bg-slate-500/20 transition duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition">More</span>
                    </Link>
                  </div>
                </div>

                {/* ───── 5. Recent Transactions ───── */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Transactions</h3>
                    <Link href="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition">
                      View All
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {transactions.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No transaction records found.</p>
                    ) : (
                      transactions.map((tx) => (
                        <div key={tx.transaction_id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition border border-transparent hover:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center shadow">
                              {getTransactionIcon(tx.transaction_type)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white capitalize">{tx.transaction_type.toLowerCase()}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-extrabold ${tx.transaction_type.toUpperCase() === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.transaction_type.toUpperCase() === 'DEPOSIT' ? '+' : '-'} {formatBalance(tx.amount, tx.currency)}
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">{tx.status}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </main>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
