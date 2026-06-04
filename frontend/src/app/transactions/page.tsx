'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import Receipt from '../../components/Receipt';
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

type GroupedResponse = {
  [monthKey: string]: {
    month: string;
    transactions: Transaction[];
  };
};

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedResponse>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState('Loading transactions...');

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

    async function loadData() {
      try {
        const accountsData = await getJson('/accounts/me', token);
        setAccounts(accountsData);

        const groupData = await getJson('/transactions/me/grouped', token);
        setGroupedData(groupData);
        setMessage('');
      } catch (err) {
        setMessage('Unable to load transaction history.');
      }
    }

    loadData();
  }, []);

  // ── Client-Side Filtered Results ──
  const filteredGroupedData = useMemo(() => {
    const result: GroupedResponse = {};

    Object.entries(groupedData).forEach(([key, group]) => {
      const matchedTransactions = group.transactions.filter((tx) => {
        // Type filter
        if (typeFilter !== 'ALL' && tx.transaction_type.toUpperCase() !== typeFilter) {
          return false;
        }

        // Search query filter (description, reference, type)
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

      if (matchedTransactions.length > 0) {
        result[key] = {
          month: group.month,
          transactions: matchedTransactions,
        };
      }
    });

    return result;
  }, [groupedData, searchQuery, typeFilter, dateFrom, dateTo]);

  const totalRecordCount = useMemo(() => {
    return Object.values(filteredGroupedData).reduce(
      (sum, group) => sum + group.transactions.length,
      0
    );
  }, [filteredGroupedData]);

  const formatBalance = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '₦' : currency;
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getFormatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
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

  const getAccountDetails = (accountId: number) => {
    const account = accounts.find((a) => a.account_id === accountId);
    if (!account) return undefined;
    return {
      account_number: account.account_number,
      account_type: account.account_type,
    };
  };

  const getRecipientDetails = (tx: Transaction) => {
    if (tx.transaction_type !== 'TRANSFER' || !tx.related_account_id) return undefined;
    const selfAccount = accounts.find((a) => a.account_id === tx.related_account_id);
    if (selfAccount) {
      return {
        account_number: selfAccount.account_number,
        customer_name: 'My ' + selfAccount.account_type + ' Wallet',
      };
    }
    return undefined;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-indigo-600/10 w-[40vw] h-[40vw] left-[-10vw] top-[-10vw] pointer-events-none" />
      <div className="glow-circle bg-purple-600/10 w-[35vw] h-[35vw] right-[-5vw] top-[10vw] pointer-events-none" />
      <div className="glow-circle bg-cyan-600/10 w-[30vw] h-[30vw] left-[20vw] bottom-[-5vw] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header title="AETHER" />

        <main className="flex-1 overflow-auto pb-24 md:pb-6 p-4 sm:p-8">
          <div className="mb-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Transaction History
            </h1>
            <p className="mt-2 text-slate-400 text-sm">
              Review full retail auditing history of deposits, withdrawals, and peer transfers.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {/* ── Filters Panel ── */}
            <section className="rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                    />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="input-glass w-full rounded-xl py-2.5 px-3 text-xs font-semibold"
                  >
                    <option value="ALL" className="bg-slate-950">
                      All Types
                    </option>
                    <option value="DEPOSIT" className="bg-slate-950">
                      Deposit
                    </option>
                    <option value="WITHDRAWAL" className="bg-slate-950">
                      Withdrawal
                    </option>
                    <option value="TRANSFER" className="bg-slate-950">
                      Transfer
                    </option>
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-glass w-full rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-200"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-glass w-full rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-200"
                  />
                </div>
              </div>
            </section>

            {/* ── Transaction List Grouped by Month ── */}
            {message ? (
              <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-[2rem] border border-white/5">
                {message}
              </div>
            ) : totalRecordCount === 0 ? (
              <div className="py-24 text-center bg-slate-900/40 rounded-[2rem] border border-white/5">
                <div className="flex justify-center mb-3 text-slate-500">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">
                  No transactions found matching your criteria.
                </p>
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
              <div className="space-y-8">
                {Object.entries(filteredGroupedData).map(([monthKey, group]) => (
                  <div key={monthKey} className="space-y-3">
                    {/* Month Header */}
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-sm font-black text-slate-400 tracking-wider uppercase">
                        {group.month}
                      </h2>
                      <span className="text-[10px] font-bold tracking-widest text-slate-600">
                        {group.transactions.length} TRANSACTION
                        {group.transactions.length !== 1 ? 'S' : ''}
                      </span>
                    </div>

                    {/* Transactions Card List */}
                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden divide-y divide-white/5">
                      {group.transactions.map((tx) => {
                        const isDeposit = tx.transaction_type.toUpperCase() === 'DEPOSIT';
                        return (
                          <div
                            key={tx.transaction_id}
                            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-900/30 transition cursor-pointer"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Icon Container */}
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-lg shadow-inner shrink-0">
                                {isDeposit ? (
                                  <svg
                                    className="w-5 h-5 text-emerald-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                  </svg>
                                ) : tx.transaction_type.toUpperCase() === 'WITHDRAWAL' ? (
                                  <svg
                                    className="w-5 h-5 text-rose-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-5 h-5 text-indigo-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* Transaction Title & Date */}
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                  {tx.description || tx.transaction_type}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                  {getFormatDate(tx.transaction_date)} • Ref:{' '}
                                  {tx.reference || tx.transaction_id}
                                </p>
                              </div>
                            </div>

                            {/* Amount & Action */}
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <p
                                  className={`text-sm font-extrabold ${
                                    isDeposit ? 'text-emerald-400' : 'text-slate-200'
                                  }`}
                                >
                                  {isDeposit ? '+' : '-'} {formatBalance(tx.amount, tx.currency)}
                                </p>
                                <span
                                  className={`inline-block text-[8px] font-black uppercase tracking-widest mt-0.5 ${
                                    tx.status.toUpperCase() === 'COMPLETED'
                                      ? 'text-emerald-400'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </div>

                              <button
                                className="hidden sm:inline-flex items-center justify-center p-2 rounded-lg bg-slate-950 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition"
                                title="View Receipt"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTransaction(tx);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for mobile */}
      <BottomNav />

      {/* Receipt Modal Component */}
      {selectedTransaction && (
        <Receipt
          transaction={selectedTransaction}
          accountDetails={getAccountDetails(selectedTransaction.account_id)}
          recipientDetails={getRecipientDetails(selectedTransaction)}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
