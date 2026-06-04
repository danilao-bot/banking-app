'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import { getToken } from '../../lib/auth';
import { getJson, postJson } from '../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
};

const INVESTMENT_TERMS = [
  { months: 3, interestRate: 5.0, label: '3 Months (5.0% p.a.)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { months: 6, interestRate: 8.5, label: '6 Months (8.5% p.a.)', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { months: 12, interestRate: 12.0, label: '12 Months (12.0% p.a.)', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

export default function FixedDepositPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fixedAccounts, setFixedAccounts] = useState<Account[]>([]);
  const [nonFixedAccounts, setNonFixedAccounts] = useState<Account[]>([]);
  const [selectedSourceAccountId, setSelectedSourceAccountId] = useState<number | null>(null);
  
  // Fixed deposit settings
  const [lockAmount, setLockAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(6); // default 6 months
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      const data = await getJson('/accounts/me', token);
      setAccounts(data);
      
      const fixed = data.filter((a: Account) => a.account_type === 'FIXED');
      const others = data.filter((a: Account) => a.account_type !== 'FIXED');
      
      setFixedAccounts(fixed);
      setNonFixedAccounts(others);
      
      if (others.length > 0) {
        setSelectedSourceAccountId(others[0].account_id);
      }
    } catch (err) {
      setMessage('Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFixedDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!selectedSourceAccountId) {
      setMessage('Please select a funding source wallet.');
      return;
    }

    const amountValue = Number(lockAmount);
    if (!amountValue || amountValue <= 0) {
      setMessage('Enter a valid amount to lock.');
      return;
    }

    const sourceAccount = accounts.find((a) => a.account_id === selectedSourceAccountId);
    if (sourceAccount && sourceAccount.balance < amountValue) {
      setMessage('Insufficient funds in the funding source wallet.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      
      // Step 1: Create FIXED account
      const fixedAccount = await postJson(
        '/accounts/',
        {
          account_type: 'FIXED',
          currency: 'NGN',
        },
        token || undefined,
      );

      // Step 2: Transfer from source to FIXED account
      const reference = 'LOCK-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      await postJson(
        '/transactions/transfer',
        {
          account_id: selectedSourceAccountId,
          target_account_id: fixedAccount.account_id,
          amount: amountValue,
          description: `Fixed Deposit lock for ${selectedTerm} months at ${getInterestRate(selectedTerm)}% interest`,
          reference,
        },
        token || undefined,
      );

      setIsSuccess(true);
      setMessage(`Successfully locked ${getCurrencySymbol(selectedSourceAccountId)}${amountValue.toLocaleString()} into Fixed Deposit #${fixedAccount.account_number}!`);
      setLockAmount('');
      await loadData();
    } catch (err: any) {
      setMessage(err.message || 'Fixed deposit lock-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInterestRate = (months: number) => {
    return INVESTMENT_TERMS.find((t) => t.months === months)?.interestRate || 8.5;
  };

  const getCurrencySymbol = (accId: number | null) => {
    const acc = accounts.find((a) => a.account_id === accId);
    if (!acc) return '₦';
    return acc.currency === 'NGN' ? '₦' : acc.currency === 'USD' ? '₦' : acc.currency;
  };

  const calculateMaturityEstimate = (principal: number, termMonths: number) => {
    const annualRate = getInterestRate(termMonths) / 100;
    const rateForTerm = annualRate * (termMonths / 12);
    const profit = principal * rateForTerm;
    return principal + profit;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <div className="glow-circle bg-purple-600/10 w-[45vw] h-[45vw] left-[-15vw] top-[-15vw]" />
      <div className="glow-circle bg-pink-600/10 w-[40vw] h-[40vw] right-[-5vw] top-[5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-5xl w-full mx-auto md:mx-0 pb-20 md:pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Fixed Deposits</h1>
              <p className="mt-2 text-slate-400 text-sm">Lock funds for a specific period and earn high-yield interest guaranteed by Aether.</p>
            </div>

            {loading && accounts.length === 0 ? (
              <div className="flex h-[40vh] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-xs text-slate-400">Loading investment portfolios...</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                
                {/* Left Side: Active Fixed Deposits */}
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Fixed Portfolios</h2>

                  {fixedAccounts.length === 0 ? (
                    <div className="glass-panel rounded-[2rem] p-8 text-center border border-white/5 space-y-4">
                      <p className="text-slate-400 text-sm">No active fixed deposit portfolios found.</p>
                      <p className="text-xs text-slate-500">Lock your idle funds using the investment form to start earning interest.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-1">
                      {fixedAccounts.map((account) => {
                        // Estimate terms from description, default 6
                        const matches = account.status.toLowerCase() === 'active';
                        const rate = 8.5; // default rate
                        const maturityEst = calculateMaturityEstimate(account.balance, 6);
                        
                        return (
                          <div
                            key={account.account_id}
                            className="glass-panel rounded-[2rem] p-6 border border-white/5 space-y-4 relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-emerald-950/15"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold tracking-wider uppercase">
                                  Term Locked Deposit
                                </span>
                                <h3 className="text-base font-bold text-white mt-2 font-mono">
                                  NUBAN: {account.account_number}
                                </h3>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase">Principal locked</p>
                                <p className="text-lg font-black text-white mt-1">
                                  {getCurrencySymbol(account.account_id)}{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-semibold border-t border-dashed border-white/5">
                              <div>
                                <p className="text-slate-400">Interest yield</p>
                                <p className="text-white mt-0.5 font-bold">{rate}% p.a. (est.)</p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-400">Estimated payout value</p>
                                <p className="text-emerald-400 mt-0.5 font-extrabold font-mono">
                                  {getCurrencySymbol(account.account_id)}{maturityEst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Side: Lock-in Form */}
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Lock-in Investment</h2>

                  <form onSubmit={handleCreateFixedDeposit} className="glass-panel rounded-[2rem] p-6 sm:p-8 border border-white/5 space-y-6 h-fit bg-slate-900/30">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Funding Wallet
                        <select
                          value={selectedSourceAccountId ?? ''}
                          onChange={(e) => setSelectedSourceAccountId(Number(e.target.value))}
                          className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                        >
                          {nonFixedAccounts.map((account) => (
                            <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                              {account.account_type} ({account.account_number}) • {getCurrencySymbol(account.account_id)}{account.balance.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Select Lock-in Duration
                        <div className="flex flex-col gap-2 mt-2">
                          {INVESTMENT_TERMS.map((term) => {
                            const isSelected = selectedTerm === term.months;
                            return (
                              <button
                                key={term.months}
                                type="button"
                                onClick={() => setSelectedTerm(term.months)}
                                className={`rounded-2xl p-3.5 border text-xs font-extrabold transition-all text-left ${term.color} ${
                                  isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5' : ''
                                }`}
                              >
                                {term.label}
                              </button>
                            );
                          })}
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Principal Amount to Lock
                        <div className="relative mt-2">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                            {getCurrencySymbol(selectedSourceAccountId)}
                          </span>
                          <input
                            type="number"
                            min="1000"
                            step="100"
                            value={lockAmount}
                            onChange={(e) => setLockAmount(e.target.value)}
                            className="input-glass w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-white"
                            placeholder="Min ₦1,000"
                          />
                        </div>
                      </label>
                    </div>

                    {lockAmount && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                        <div className="flex justify-between text-slate-400">
                          <span>Interest rate yield</span>
                          <span className="text-white font-bold">{getInterestRate(selectedTerm)}% p.a.</span>
                        </div>
                        <div className="flex justify-between text-slate-400 border-t border-white/5 pt-2">
                          <span>Estimated Maturity Amount</span>
                          <span className="text-emerald-400 font-extrabold">
                            {getCurrencySymbol(selectedSourceAccountId)}{calculateMaturityEstimate(Number(lockAmount), selectedTerm).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !lockAmount || Number(lockAmount) < 1000}
                      className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Creating Investment...' : 'Authorize Fixed Lock'}
                    </button>

                    {message ? (
                      <div className={`p-4 rounded-2xl text-center text-[11px] font-bold ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
                        {message}
                      </div>
                    ) : null}
                  </form>
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
