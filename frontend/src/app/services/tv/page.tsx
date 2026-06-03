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

type TvPlan = {
  id: string;
  name: string;
  price: number;
};

const PROVIDERS = [
  { id: 'DSTV', name: 'DSTV', color: 'bg-blue-600/10 text-blue-400 border-blue-600/25 hover:bg-blue-600/20' },
  { id: 'GOtv', name: 'GOtv', color: 'bg-green-600/10 text-green-400 border-green-600/25 hover:bg-green-600/20' },
  { id: 'StarTimes', name: 'StarTimes', color: 'bg-amber-600/10 text-amber-400 border-amber-600/25 hover:bg-amber-600/20' },
];

const PLANS: Record<string, TvPlan[]> = {
  DSTV: [
    { id: 'dstv-pula', name: 'DSTV Premium', price: 29500 },
    { id: 'dstv-compact-plus', name: 'DSTV Compact Plus', price: 19800 },
    { id: 'dstv-compact', name: 'DSTV Compact', price: 12500 },
    { id: 'dstv-confam', name: 'DSTV Confam', price: 7400 },
    { id: 'dstv-yanga', name: 'DSTV Yanga', price: 4200 },
  ],
  GOtv: [
    { id: 'gotv-supa-plus', name: 'GOtv Supa Plus', price: 12500 },
    { id: 'gotv-supa', name: 'GOtv Supa', price: 7600 },
    { id: 'gotv-max', name: 'GOtv Max', price: 4850 },
    { id: 'gotv-jolli', name: 'GOtv Jolli', price: 3300 },
    { id: 'gotv-jinja', name: 'GOtv Jinja', price: 2700 },
  ],
  StarTimes: [
    { id: 'st-super', name: 'Super Bouquet', price: 6500 },
    { id: 'st-classic', name: 'Classic Bouquet', price: 4500 },
    { id: 'st-smart', name: 'Smart Bouquet', price: 3500 },
    { id: 'st-nova', name: 'Nova Bouquet', price: 1500 },
  ],
};

export default function TvPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [smartcard, setSmartcard] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('DSTV');
  const [selectedPlanId, setSelectedPlanId] = useState('');
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

  useEffect(() => {
    setSelectedPlanId('');
  }, [selectedProvider]);

  const activePlans = PLANS[selectedProvider] || [];
  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!selectedAccountId) {
      setMessage('Select a source wallet first.');
      return;
    }

    if (smartcard.length < 9 || smartcard.length > 11) {
      setMessage('Smartcard / UIC Number must be 9-11 digits.');
      return;
    }

    if (!selectedPlan) {
      setMessage('Please select a subscription package.');
      return;
    }

    const selectedAccount = accounts.find((a) => a.account_id === selectedAccountId);
    if (selectedAccount && selectedAccount.balance < selectedPlan.price) {
      setMessage('Insufficient funds in the selected wallet.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const reference = 'TV-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const payload = {
        account_id: selectedAccountId,
        amount: selectedPlan.price,
        description: `TV Subscription: ${selectedPlan.name} for Decoder #${smartcard} (${selectedProvider})`,
        reference,
      };

      await postJson('/transactions/withdraw', payload, token || undefined);
      setIsSuccess(true);
      setMessage(`Successfully renewed ${selectedProvider} ${selectedPlan.name} subscription!`);
      setSmartcard('');
      setSelectedPlanId('');
      
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
    return acc.currency === 'NGN' ? '₦' : acc.currency === 'USD' ? '$' : acc.currency;
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
                <h1 className="text-2xl font-black text-white tracking-tight">TV & Cable</h1>
                <p className="text-xs text-slate-400 mt-0.5">Instant activation for DSTV, GOtv and StarTimes subscriptions.</p>
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
                          {account.account_type} Wallet ({account.account_number}) • {account.currency === 'NGN' ? '₦' : account.currency === 'USD' ? '$' : account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Cable Provider
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {PROVIDERS.map((prov) => {
                        const isSelected = selectedProvider === prov.id;
                        return (
                          <button
                            key={prov.id}
                            type="button"
                            onClick={() => setSelectedProvider(prov.id)}
                            className={`rounded-2xl p-3 text-center border text-xs font-extrabold transition-all ${prov.color} ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5' : ''
                            }`}
                          >
                            {prov.name}
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Smartcard / Decoder / UIC Number
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="e.g. 1023456789"
                      value={smartcard}
                      onChange={(e) => setSmartcard(e.target.value.replace(/\D/g, ''))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wider text-white"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Package
                    <div className="flex flex-col gap-2 mt-2">
                      {activePlans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`rounded-2xl p-4 flex items-center justify-between border text-sm font-extrabold transition-all text-left bg-slate-900/50 hover:bg-slate-900 border-white/5 ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5 text-purple-300' : 'text-slate-300'
                            }`}
                          >
                            <span className="font-bold">{plan.name}</span>
                            <span className="font-extrabold text-white text-base">
                              {getCurrencySymbol(selectedAccountId)}{plan.price.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                {selectedPlan ? (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Plan Cost</span>
                    <span className="text-lg font-black text-white">
                      {getCurrencySymbol(selectedAccountId)}{selectedPlan.price.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || accounts.length === 0 || smartcard.length < 9 || !selectedPlanId}
                  className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Verifying smartcard...' : 'Purchase Subscription'}
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
