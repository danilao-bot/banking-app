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

type InternetPlan = {
  id: string;
  name: string;
  price: number;
  dataLimit: string;
};

const PROVIDERS = [
  { id: 'Spectranet', name: 'Spectranet', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 hover:bg-indigo-500/20' },
  { id: 'Smile', name: 'Smile Communications', color: 'bg-orange-500/10 text-orange-400 border-orange-500/25 hover:bg-orange-500/20' },
  { id: 'Swift', name: 'Swift Networks', color: 'bg-blue-500/10 text-blue-400 border-blue-500/25 hover:bg-blue-500/20' },
];

const PLANS: Record<string, InternetPlan[]> = {
  Spectranet: [
    { id: 'spec-unl', name: 'Spectranet Unlimited Gold', price: 20000, dataLimit: 'Unlimited' },
    { id: 'spec-50g', name: 'Do More 50GB', price: 12000, dataLimit: '50 GB' },
    { id: 'spec-25g', name: 'Unified Stay Connected 25GB', price: 7500, dataLimit: '25 GB' },
  ],
  Smile: [
    { id: 'smile-unl', name: 'Smile Unlimited Lite', price: 18000, dataLimit: 'Unlimited' },
    { id: 'smile-40g', name: 'SmileBig 40GB', price: 11500, dataLimit: '40 GB' },
    { id: 'smile-15g', name: 'SmileValue 15GB', price: 6000, dataLimit: '15 GB' },
  ],
  Swift: [
    { id: 'swift-unl', name: 'Swift Essential Unlimited', price: 19500, dataLimit: 'Unlimited' },
    { id: 'swift-45g', name: 'Swift Club 45GB', price: 12500, dataLimit: '45 GB' },
    { id: 'swift-20g', name: 'Swift Budget 20GB', price: 7000, dataLimit: '20 GB' },
  ],
};

export default function InternetPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('Spectranet');
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

    if (deviceId.length < 8 || deviceId.length > 12) {
      setMessage('Device / Account ID must be between 8 and 12 digits.');
      return;
    }

    if (!selectedPlan) {
      setMessage('Please select an internet bundle plan.');
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
      const reference = 'INT-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const payload = {
        account_id: selectedAccountId,
        amount: selectedPlan.price,
        description: `Internet Bundle: ${selectedPlan.name} (${selectedPlan.dataLimit}) for Account #${deviceId} (${selectedProvider})`,
        reference,
      };

      await postJson('/transactions/withdraw', payload, token || undefined);
      setIsSuccess(true);
      setMessage(`Successfully recharged device #${deviceId} with Spectranet/Smile/Swift internet bundle!`);
      setDeviceId('');
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
                <h1 className="text-2xl font-black text-white tracking-tight">Internet Bills</h1>
                <p className="text-xs text-slate-400 mt-0.5">Top up router & fiber-to-the-home subscriptions instantly.</p>
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
                    Select Internet Provider
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {PROVIDERS.map((prov) => {
                        const isSelected = selectedProvider === prov.id;
                        return (
                          <button
                            key={prov.id}
                            type="button"
                            onClick={() => setSelectedProvider(prov.id)}
                            className={`rounded-2xl p-3 text-center border text-xs font-extrabold transition-all leading-snug ${prov.color} ${
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
                    Device ID / Account Number
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 10234567"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value.replace(/\D/g, ''))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wider text-white"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Plan
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
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Allowance: {plan.dataLimit}</p>
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
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Plan Cost</span>
                    <span className="text-lg font-black text-white">
                      {getCurrencySymbol(selectedAccountId)}{selectedPlan.price.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || accounts.length === 0 || deviceId.length < 8 || !selectedPlanId}
                  className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Connecting with ISP...' : 'Activate Router Plan'}
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
