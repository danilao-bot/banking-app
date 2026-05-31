'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getJson } from '../../lib/api';
import { getToken } from '../../lib/auth';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
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
  related_account_id?: number;
  status: string;
};

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [message, setMessage] = useState('Loading accounts...');

  // ── Search & Filter State ──
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to view transaction history.');
      return;
    }

    async function loadAccounts() {
      try {
        const data = await getJson('/accounts/me', token);
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccountId(data[0].account_id);
          setMessage('');
        } else {
          setMessage('No wallets available. Fund your wallet first.');
        }
      } catch (err) {
        setMessage('Unable to load accounts.');
      }
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token || selectedAccountId === null) {
      return;
    }

    async function loadHistory() {
      try {
        setMessage('Querying transaction history logs...');
        const data = await getJson(`/transactions/history/${selectedAccountId}`, token);
        setTransactions(data);
        setMessage('');
      } catch (err) {
        setMessage('Unable to load transactions.');
        setTransactions([]);
      }
    }

    loadHistory();
  }, [selectedAccountId]);

  // ── Client-Side Filtered Results ──
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'ALL' && tx.transaction_type.toUpperCase() !== typeFilter) {
        return false;
      }

      // Search query filter (description, reference)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        const matchesRef = tx.reference?.toLowerCase().includes(q);
        const matchesType = tx.transaction_type.toLowerCase().includes(q);
        if (!matchesDesc && !matchesRef && !matchesType) return false;
      }

      // Date range filter
      if (dateFrom) {
        const txDate = new Date(tx.transaction_date);
        const fromDate = new Date(dateFrom);
        if (txDate < fromDate) return false;
      }
      if (dateTo) {
        const txDate = new Date(tx.transaction_date);
        const toDate = new Date(dateTo + 'T23:59:59');
        if (txDate > toDate) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, dateFrom, dateTo]);

  const formatBalance = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getFormatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'ALL' || dateFrom || dateTo;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-indigo-600/10 w-[40vw] h-[40vw] left-[-10vw] top-[-10vw]" />
      <div className="glow-circle bg-purple-600/10 w-[35vw] h-[35vw] right-[-5vw] top-[10vw]" />
      <div className="glow-circle bg-cyan-600/10 w-[30vw] h-[30vw] left-[20vw] bottom-[-5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <div className="mb-6 max-w-5xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Transaction History</h1>
              <p className="mt-2 text-slate-400 text-sm">Review full retail auditing history of deposits, withdrawals, and peer transfers.</p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
              {/* ── Account Selector + Filters Panel ── */}
              <section className="rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 space-y-5">
                {/* Account Selection */}
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight mb-3">Select Wallet</h2>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Wallet Account
                    <select
                      value={selectedAccountId ?? ''}
                      onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wide text-slate-200"
                    >
                      {accounts.map((account) => (
                        <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                          {account.account_type} • {account.account_number} • {account.currency === 'NGN' ? '₦' : account.currency === 'USD' ? '$' : account.currency} {account.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* ── Search & Filters ── */}
                <div className="border-t border-white/5 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                      </svg>
                      Search & Filter
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by description, reference, or type..."
                      className="input-glass w-full rounded-2xl py-3 pl-11 pr-4 text-sm placeholder:text-slate-500"
                    />
                  </div>

                  {/* Filter Row: Type + Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Type Filter */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Type</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="input-glass w-full rounded-xl py-2.5 px-3 text-xs font-semibold"
                      >
                        <option value="ALL" className="bg-slate-950">All Types</option>
                        <option value="DEPOSIT" className="bg-slate-950">Deposit</option>
                        <option value="WITHDRAWAL" className="bg-slate-950">Withdrawal</option>
                        <option value="TRANSFER" className="bg-slate-950">Transfer</option>
                      </select>
                    </div>

                    {/* From Date */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">From Date</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="input-glass w-full rounded-xl py-2.5 px-3 text-xs font-semibold"
                      />
                    </div>

                    {/* To Date */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">To Date</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="input-glass w-full rounded-xl py-2.5 px-3 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {message ? (
                  <div className="p-3 bg-slate-900/60 rounded-xl text-center text-xs text-slate-400 border border-white/5">
                    {message}
                  </div>
                ) : null}
              </section>

              {/* ── Transactions Table ── */}
              <section className="rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {hasActiveFilters ? 'Filtered Results' : 'Recent Transactions'}
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {message && filteredTransactions.length === 0 ? (
                  <div className="rounded-2xl bg-slate-900/40 p-6 text-xs text-slate-400 border border-white/5 text-center">{message}</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="flex justify-center mb-3 text-slate-500">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <p className="text-slate-400 font-medium">No transactions found matching your criteria.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-slate-300">
                      <thead className="border-b border-white/5 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.transaction_id} className="hover:bg-slate-900/30 transition">
                            <td className="px-4 py-4 text-slate-400">{getFormatDate(tx.transaction_date)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 text-white uppercase tracking-wider`}>
                                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-lg shadow-inner">
                                  {tx.transaction_type.toUpperCase() === 'DEPOSIT' && <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                                  {tx.transaction_type.toUpperCase() === 'WITHDRAWAL' && <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                                  {tx.transaction_type.toUpperCase() === 'TRANSFER' && <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                                  {tx.transaction_type.toUpperCase() !== 'DEPOSIT' && tx.transaction_type.toUpperCase() !== 'WITHDRAWAL' && tx.transaction_type.toUpperCase() !== 'TRANSFER' && <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                                </div>
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td className={`px-4 py-4 font-extrabold ${tx.transaction_type.toUpperCase() === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.transaction_type.toUpperCase() === 'DEPOSIT' ? '+' : '-'} {formatBalance(tx.amount, tx.currency)}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${tx.status.toUpperCase() === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <Link href={`/transactions/${tx.transaction_id}`} className="text-indigo-400 hover:text-indigo-300 underline transition font-bold">
                                Receipt
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
