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

const DISCOS = [
  { id: 'ikedc', name: 'Ikeja Electric (IKEDC)', color: 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20' },
  { id: 'ekedc', name: 'Eko Electric (EKEDC)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/25 hover:bg-blue-500/20' },
  { id: 'aedc', name: 'Abuja Electric (AEDC)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' },
  { id: 'ibedc', name: 'Ibadan Electric (IBEDC)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:bg-amber-500/20' },
  { id: 'kedco', name: 'Kano Electric (KEDCO)', color: 'bg-teal-500/10 text-teal-400 border-teal-500/25 hover:bg-teal-500/20' },
  { id: 'phed', name: 'Port Harcourt (PHED)', color: 'bg-purple-500/10 text-purple-400 border-purple-500/25 hover:bg-purple-500/20' },
];

export default function ElectricityPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [selectedDisco, setSelectedDisco] = useState('ikedc');
  const [meterType, setMeterType] = useState('PREPAID');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenCode, setTokenCode] = useState('');

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
    setTokenCode('');

    if (!selectedAccountId) {
      setMessage('Select a source wallet first.');
      return;
    }

    if (meterNumber.length < 10 || meterNumber.length > 13) {
      setMessage('Meter number must be between 10 and 13 digits.');
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
      const reference = 'ELEC-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const discoObj = DISCOS.find((d) => d.id === selectedDisco);
      const payload = {
        account_id: selectedAccountId,
        amount: amountValue,
        description: `Electricity Bill: ${meterType} for Meter #${meterNumber} (${discoObj?.name})`,
        reference,
      };

      await postJson('/transactions/withdraw', payload, token || undefined);
      setIsSuccess(true);
      setMessage(`Successfully paid ${getCurrencySymbol(selectedAccountId)}${amountValue.toLocaleString()} to ${discoObj?.name}`);
      
      // If prepaid, generate a mock recharge token
      if (meterType === 'PREPAID') {
        const mockToken = Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
        setTokenCode(mockToken);
      }

      setAmount('');
      setMeterNumber('');
      
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
                <h1 className="text-2xl font-black text-white tracking-tight">Electricity Bill</h1>
                <p className="text-xs text-slate-400 mt-0.5">Pay electricity bills instantly with instant token generation.</p>
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
                    Select Distribution Company (DisCo)
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {DISCOS.map((disco) => {
                        const isSelected = selectedDisco === disco.id;
                        return (
                          <button
                            key={disco.id}
                            type="button"
                            onClick={() => setSelectedDisco(disco.id)}
                            className={`rounded-2xl p-3 text-left border text-xs font-extrabold transition-all leading-snug ${disco.color} ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5' : ''
                            }`}
                          >
                            {disco.name}
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Meter Type
                      <select
                        value={meterType}
                        onChange={(e) => setMeterType(e.target.value)}
                        className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                      >
                        <option value="PREPAID" className="bg-slate-950">Prepaid</option>
                        <option value="POSTPAID" className="bg-slate-950">Postpaid</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Meter Number
                      <input
                        type="text"
                        maxLength={13}
                        placeholder="e.g. 01423456789"
                        value={meterNumber}
                        onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))}
                        className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wider text-white"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Amount to Pay
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

                <button
                  type="submit"
                  disabled={submitting || accounts.length === 0 || meterNumber.length < 10 || !amount}
                  className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Verifying Meter...' : 'Proceed to Payment'}
                </button>

                {message ? (
                  <div className={`p-4 rounded-2xl text-center text-xs font-bold ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="flex items-center gap-1.5">
                        {isSuccess && (
                          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {message}
                      </span>
                      {tokenCode && (
                        <div className="mt-3 p-4 bg-slate-950/80 rounded-2xl border border-white/5 w-full">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Meter Recharge Token</p>
                          <p className="text-lg font-mono font-black text-white mt-1 select-all">{tokenCode}</p>
                          <p className="text-[9px] text-slate-500 mt-1">Input this token into your meter to load credit.</p>
                        </div>
                      )}
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
