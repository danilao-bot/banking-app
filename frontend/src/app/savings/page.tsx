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
};

export default function SavingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<Account[]>([]);
  const [nonSavingsAccounts, setNonSavingsAccounts] = useState<Account[]>([]);
  const [selectedSourceAccountId, setSelectedSourceAccountId] = useState<number | null>(null);
  const [selectedTargetAccountId, setSelectedTargetAccountId] = useState<number | null>(null);
  
  // Savings goal state
  const [goalAmount, setGoalAmount] = useState('100000');
  const [saveAmount, setSaveAmount] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submittingGoal, setSubmittingGoal] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
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
      
      const savings = data.filter((a: Account) => a.account_type === 'SAVINGS');
      const others = data.filter((a: Account) => a.account_type !== 'SAVINGS');
      
      setSavingsAccounts(savings);
      setNonSavingsAccounts(others);
      
      if (others.length > 0) {
        setSelectedSourceAccountId(others[0].account_id);
      } else if (data.length > 0) {
        setSelectedSourceAccountId(data[0].account_id);
      }
      
      if (savings.length > 0) {
        setSelectedTargetAccountId(savings[0].account_id);
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

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    
    setSubmittingGoal(true);
    try {
      const token = getToken();
      await postJson(
        '/accounts/',
        {
          account_type: 'SAVINGS',
          currency: 'NGN',
        },
        token || undefined,
      );
      
      setIsSuccess(true);
      setMessage(`Successfully created a new savings goal: ${newGoalName || 'Target Savings'}!`);
      setNewGoalName('');
      await loadData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to create savings account.');
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleSaveMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!selectedSourceAccountId || !selectedTargetAccountId) {
      setMessage('Please select both source and target savings wallets.');
      return;
    }

    if (selectedSourceAccountId === selectedTargetAccountId) {
      setMessage('Source and target wallets must be different.');
      return;
    }

    const amountValue = Number(saveAmount);
    if (!amountValue || amountValue <= 0) {
      setMessage('Enter a valid amount to save.');
      return;
    }

    const sourceAccount = accounts.find((a) => a.account_id === selectedSourceAccountId);
    if (sourceAccount && sourceAccount.balance < amountValue) {
      setMessage('Insufficient funds in the source wallet.');
      return;
    }

    setSubmittingTransfer(true);
    try {
      const token = getToken();
      const reference = 'SAVE-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      
      await postJson(
        '/transactions/transfer',
        {
          account_id: selectedSourceAccountId,
          target_account_id: selectedTargetAccountId,
          amount: amountValue,
          description: `Savings Lock: Funded Savings Goal`,
          reference,
        },
        token || undefined,
      );

      setIsSuccess(true);
      setMessage(`Successfully transferred ${getCurrencySymbol(selectedSourceAccountId)}${amountValue.toLocaleString()} to your savings wallet!`);
      setSaveAmount('');
      await loadData();
    } catch (err: any) {
      setMessage(err.message || 'Transfer failed. Please try again.');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const getCurrencySymbol = (accId: number | null) => {
    const acc = accounts.find((a) => a.account_id === accId);
    if (!acc) return '₦';
    return acc.currency === 'NGN' ? '₦' : acc.currency === 'USD' ? '₦' : acc.currency;
  };

  const getProgressPercentage = (balance: number, target: number) => {
    if (target <= 0) return 0;
    const pct = (balance / target) * 100;
    return Math.min(Math.round(pct), 100);
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
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Savings Goals</h1>
              <p className="mt-2 text-slate-400 text-sm">Lock away funds from your current account, track progress and grow your wealth.</p>
            </div>

            {loading && accounts.length === 0 ? (
              <div className="flex h-[40vh] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-xs text-slate-400">Loading savings balances...</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                
                {/* Left Side: Savings Accounts Cards */}
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Savings Goals</h2>
                  
                  {savingsAccounts.length === 0 ? (
                    <div className="glass-panel rounded-[2rem] p-8 text-center border border-white/5 space-y-4">
                      <p className="text-slate-400 text-sm">No dedicated savings goals created yet.</p>
                      <p className="text-xs text-slate-500">Create a savings goal below to start lock-in transfers.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-1">
                      {savingsAccounts.map((account) => {
                        const targetVal = Number(goalAmount) || 100000;
                        const progress = getProgressPercentage(account.balance, targetVal);
                        return (
                          <div
                            key={account.account_id}
                            className="glass-panel rounded-[2rem] p-6 border border-white/5 space-y-4 relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-purple-950/20"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-extrabold tracking-wider uppercase">
                                  Goal Vault
                                </span>
                                <h3 className="text-base font-bold text-white mt-2 font-mono">
                                  NUBAN: {account.account_number}
                                </h3>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase">Balance</p>
                                <p className="text-lg font-black text-white mt-1">
                                  {getCurrencySymbol(account.account_id)}{account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Target: {getCurrencySymbol(account.account_id)}{targetVal.toLocaleString()}</span>
                                <span className="text-purple-400">{progress}% Completed</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Create Goal Form */}
                  <form onSubmit={handleCreateGoal} className="glass-panel rounded-[2rem] p-6 sm:p-8 border border-white/5 space-y-4 bg-slate-900/30">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Set Up a New Savings Goal</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Goal Title
                        <input
                          type="text"
                          required
                          placeholder="e.g. New Car, Vacation"
                          value={newGoalName}
                          onChange={(e) => setNewGoalName(e.target.value)}
                          className="input-glass mt-2 w-full rounded-2xl p-3.5 text-xs font-semibold text-white"
                        />
                      </label>

                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Target Amount (₦)
                        <input
                          type="number"
                          required
                          value={goalAmount}
                          onChange={(e) => setGoalAmount(e.target.value)}
                          className="input-glass mt-2 w-full rounded-2xl p-3.5 text-xs font-bold text-white"
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingGoal}
                      className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                    >
                      {submittingGoal ? 'Opening Goal...' : 'Initialize Savings Goal'}
                    </button>
                  </form>
                </div>

                {/* Right Side: Fund Savings Goals */}
                <div className="space-y-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Save Funds</h2>

                  <form onSubmit={handleSaveMoney} className="glass-panel rounded-[2rem] p-6 sm:p-8 border border-white/5 space-y-6 h-fit bg-slate-900/30">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        From Account
                        <select
                          value={selectedSourceAccountId ?? ''}
                          onChange={(e) => setSelectedSourceAccountId(Number(e.target.value))}
                          className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                        >
                          {nonSavingsAccounts.map((account) => (
                            <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                              {account.account_type} ({account.account_number}) • {getCurrencySymbol(account.account_id)}{account.balance.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        To Savings Goal
                        <select
                          value={selectedTargetAccountId ?? ''}
                          onChange={(e) => setSelectedTargetAccountId(Number(e.target.value))}
                          className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                          disabled={savingsAccounts.length === 0}
                        >
                          {savingsAccounts.length === 0 ? (
                            <option className="bg-slate-950">Create a savings goal first</option>
                          ) : (
                            savingsAccounts.map((account) => (
                              <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                                Goal Wallet ({account.account_number}) • {getCurrencySymbol(account.account_id)}{account.balance.toLocaleString()}
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Amount to Save
                        <div className="relative mt-2">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                            {getCurrencySymbol(selectedSourceAccountId)}
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={saveAmount}
                            onChange={(e) => setSaveAmount(e.target.value)}
                            className="input-glass w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-white"
                            placeholder="0.00"
                            disabled={savingsAccounts.length === 0}
                          />
                        </div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingTransfer || savingsAccounts.length === 0 || !saveAmount}
                      className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingTransfer ? 'Locking Funds...' : 'Transfer to Savings'}
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
