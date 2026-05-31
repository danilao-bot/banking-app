'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { getToken } from '../../../lib/auth';
import { getJson, postJson } from '../../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
};

type DataPlan = {
  id: string;
  name: string;
  price: number;
  duration: string;
};

const PLANS: Record<string, DataPlan[]> = {
  MTN: [
    { id: 'mtn-1', name: '1.5GB Data', price: 350, duration: '30 Days' },
    { id: 'mtn-2', name: '3GB Data', price: 600, duration: '30 Days' },
    { id: 'mtn-3', name: '5GB Data', price: 1500, duration: '30 Days' },
    { id: 'mtn-4', name: '12GB Data', price: 3000, duration: '30 Days' },
    { id: 'mtn-5', name: '25GB Data', price: 5000, duration: '30 Days' },
  ],
  Airtel: [
    { id: 'airtel-1', name: '1.5GB Data', price: 500, duration: '30 Days' },
    { id: 'airtel-2', name: '3GB Data', price: 1000, duration: '30 Days' },
    { id: 'airtel-3', name: '6GB Data', price: 1500, duration: '30 Days' },
    { id: 'airtel-4', name: '12GB Data', price: 3000, duration: '30 Days' },
    { id: 'airtel-5', name: '25GB Data', price: 5000, duration: '30 Days' },
  ],
  Glo: [
    { id: 'glo-1', name: '1.25GB Data', price: 400, duration: '30 Days' },
    { id: 'glo-2', name: '2.5GB Data', price: 800, duration: '30 Days' },
    { id: 'glo-3', name: '5.8GB Data', price: 1500, duration: '30 Days' },
    { id: 'glo-4', name: '12GB Data', price: 3000, duration: '30 Days' },
    { id: 'glo-5', name: '26GB Data', price: 5000, duration: '30 Days' },
  ],
  '9mobile': [
    { id: '9m-1', name: '1GB Data', price: 400, duration: '30 Days' },
    { id: '9m-2', name: '2.5GB Data', price: 800, duration: '30 Days' },
    { id: '9m-3', name: '5.5GB Data', price: 1500, duration: '30 Days' },
    { id: '9m-4', name: '11.5GB Data', price: 3000, duration: '30 Days' },
    { id: '9m-5', name: '25GB Data', price: 5000, duration: '30 Days' },
  ],
};

const NETWORKS = [
  { id: 'MTN', name: 'MTN', color: 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20' },
  { id: 'Airtel', name: 'Airtel', color: 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-rose-500/20' },
  { id: 'Glo', name: 'Glo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' },
  { id: '9mobile', name: '9mobile', color: 'bg-teal-500/10 text-teal-400 border-teal-500/25 hover:bg-teal-500/20' },
];

export default function DataBundlePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
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

  // Clear plan selection when network changes
  useEffect(() => {
    setSelectedPlanId('');
  }, [selectedNetwork]);

  const activePlans = PLANS[selectedNetwork] || [];
  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!selectedAccountId) {
      setMessage('Select a source wallet first.');
      return;
    }

    if (phoneNumber.length !== 11) {
      setMessage('Mobile number must be exactly 11 digits.');
      return;
    }

    if (!selectedPlan) {
      setMessage('Please select a data bundle plan.');
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
      const reference = 'DATA-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const payload = {
        account_id: selectedAccountId,
        amount: selectedPlan.price,
        description: `Data purchase: ${selectedPlan.name} for ${phoneNumber} (${selectedNetwork})`,
        reference,
      };

      await postJson('/transactions/withdraw', payload, token || undefined);
      setIsSuccess(true);
      setMessage(`Successfully loaded ${selectedPlan.name} to ${phoneNumber}`);
      setPhoneNumber('');
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
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-purple-600/10 w-[45vw] h-[45vw] left-[-15vw] top-[-15vw]" />
      <div className="glow-circle bg-pink-600/10 w-[40vw] h-[40vw] right-[-5vw] top-[5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-xl mx-auto md:mx-0 md:max-w-4xl w-full">
            <div className="mb-6 flex items-center gap-3">
              <Link href="/dashboard" className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Buy Data</h1>
                <p className="text-xs text-slate-400 mt-0.5">Secure, lightning-fast dynamic data bundles with zero extra fees.</p>
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
                    Select Network Provider
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {NETWORKS.map((network) => {
                        const isSelected = selectedNetwork === network.id;
                        return (
                          <button
                            key={network.id}
                            type="button"
                            onClick={() => setSelectedNetwork(network.id)}
                            className={`rounded-2xl p-3 text-center border text-xs font-extrabold transition-all ${network.color} ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5' : ''
                            }`}
                          >
                            {network.name}
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mobile Phone Number
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="e.g. 08012345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wider text-white"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Data Bundle Plan
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
                            <div>
                              <p className="font-bold">{plan.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{plan.duration}</p>
                            </div>
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
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Purchase Price</span>
                    <span className="text-lg font-black text-white">
                      {getCurrencySymbol(selectedAccountId)}{selectedPlan.price.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || accounts.length === 0 || phoneNumber.length !== 11 || !selectedPlanId}
                  className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Authenticating...' : 'Purchase Bundle'}
                </button>

                {message ? (
                  <div className={`p-4 rounded-2xl text-center text-xs font-bold ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
                    <div className="flex items-center justify-center gap-2">
                      {isSuccess ? (
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                      {message}
                    </div>
                  </div>
                ) : null}
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
