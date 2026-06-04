'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import BottomNav from '../../../components/BottomNav';
import { getToken } from '../../../lib/auth';
import { getJson, postJson } from '../../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
};

const PLATFORMS = [
  { id: 'sportybet', name: 'SportyBet', color: 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20' },
  { id: 'bet9ja', name: 'Bet9ja', color: 'bg-green-500/10 text-green-400 border-green-500/25 hover:bg-green-500/20' },
  { id: '1xbet', name: '1xBet', color: 'bg-blue-500/10 text-blue-400 border-blue-500/25 hover:bg-blue-500/20' },
  { id: 'betking', name: 'BetKing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20' },
];

export default function BettingPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [userId, setUserId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('sportybet');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadAccounts() {
      try {
        setLoading(true);
        const data = await getJson('/accounts/me', token);
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccountId(data[0].account_id);
        }
      } catch (err) {
        setMessage('Failed to load active wallets.');
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!selectedAccountId) {
      setMessage('Select a source wallet first.');
      return;
    }

    if (userId.length < 5) {
      setMessage('User ID must be at least 5 characters.');
      return;
    }

    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      setMessage('Enter a valid amount greater than zero.');
      return;
    }

    const selectedAccount = accounts.find((a) => a.account_id === selectedAccountId);
    if (selectedAccount && selectedAccount.balance < amountValue) {
      setMessage('Insufficient funds in the selected wallet.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const reference = 'BET-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const platformObj = PLATFORMS.find((p) => p.id === selectedPlatform);
      const payload = {
        account_id: selectedAccountId,
        amount: amountValue,
        description: `Betting Deposit: User ID ${userId} on ${platformObj?.name}`,
        reference,
      };

      await postJson('/transactions/withdraw', payload, token || undefined);
      setIsSuccess(true);
      setMessage(`Successfully funded ${platformObj?.name} account (${userId}) with ${getCurrencySymbol(selectedAccountId)}${amountValue.toLocaleString()}!`);
      setUserId('');
      setAmount('');
      
      if (token) {
        const data = await getJson('/accounts/me', token);
        setAccounts(data);
      }
    } catch (err: any) {
      setMessage(err.message || 'Transaction failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrencySymbol = (accId: number | null) => {
    const acc = accounts.find((a) => a.account_id === accId);
    if (!acc) return '₦';
    return acc.currency === 'NGN' ? '₦' : acc.currency === 'USD' ? '₦' : acc.currency;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <div className="glow-circle bg-purple-600/10 w-[45vw] h-[45vw] left-[-15vw] top-[-15vw]" />
      <div className="glow-circle bg-pink-600/10 w-[40vw] h-[40vw] right-[-5vw] top-[5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-xl mx-auto md:mx-0 md:max-w-4xl w-full">
            <div className="mb-6 flex items-center gap-3">
              <Link href="/services" className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Fund Betting Wallet</h1>
                <p className="text-xs text-slate-400 mt-0.5">Top up your sports betting wallets instantly and securely.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex h-[40vh] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-xs text-slate-400">Loading wallets...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-panel space-y-6 rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl max-w-xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Source Wallet
                    <select
                      value={selectedAccountId ?? ''}
                      onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                    >
                      {accounts.map((account) => (
                        <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                          {account.account_type} Wallet ({account.account_number}) • {account.currency === 'NGN' ? '₦' : account.currency === 'USD' ? '₦' : account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Betting Platform
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {PLATFORMS.map((platform) => {
                        const isSelected = selectedPlatform === platform.id;
                        return (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={`rounded-2xl p-3 text-left border text-xs font-extrabold transition-all leading-snug ${platform.color} ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5' : ''
                            }`}
                          >
                            {platform.name}
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      User / Account ID
                      <input
                        type="text"
                        placeholder="e.g. 5834928"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value.replace(/\s/g, ''))}
                        className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wider text-white"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Amount
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                          {getCurrencySymbol(selectedAccountId)}
                        </span>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-glass w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-white"
                          placeholder="Min ₦100"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || accounts.length === 0 || userId.length < 5 || !amount}
                  className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Verifying Account...' : 'Deposit to Bookmaker'}
                </button>

                {message ? (
                  <div className={`p-4 rounded-2xl text-center text-xs font-bold ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
                    <div className="flex items-center justify-center gap-2">
                      {isSuccess && (
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {message}
                    </div>
                  </div>
                ) : null}
              </form>
            )}
          </main>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
