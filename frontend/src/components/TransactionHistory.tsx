'use client';

import { useState, useEffect } from 'react';
import { getJson } from '../lib/api';
import { getToken } from '../lib/auth';
import Receipt from './Receipt';

interface Transaction {
  transaction_id: number;
  account_id: number;
  transaction_type: string;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string;
  reference: string;
  related_account_id?: number;
  status: string;
}

interface GroupedTransactions {
  [key: string]: {
    month: string;
    transactions: Transaction[];
  };
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<GroupedTransactions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('all');

  const token = getToken();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getJson('/transactions/me/grouped', token);
      setTransactions(data);
      
      // Expand first month by default
      const firstMonth = Object.keys(data)[0];
      if (firstMonth) {
        setExpandedMonths(new Set([firstMonth]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DEPOSIT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'WITHDRAWAL':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'AIRTIME':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'DATA':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER':
        return '💸';
      case 'DEPOSIT':
        return '📥';
      case 'WITHDRAWAL':
        return '📤';
      case 'AIRTIME':
        return '📱';
      case 'DATA':
        return '📊';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  const months = Object.entries(transactions);

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap">
        {['all', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'AIRTIME', 'DATA'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterType === type
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {type === 'all' ? 'All Transactions' : type}
          </button>
        ))}
      </div>

      {/* Month Groups */}
      {months.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No transactions found
        </div>
      ) : (
        months.map(([monthKey, { month, transactions: txns }]) => {
          const filtered = filterType === 'all' ? txns : txns.filter((t) => t.transaction_type === filterType);
          
          if (filtered.length === 0) return null;

          const isExpanded = expandedMonths.has(monthKey);

          return (
            <div key={monthKey} className="border border-slate-800 rounded-lg overflow-hidden">
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(monthKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-900/50 transition bg-slate-900/30"
              >
                <div className="flex items-center gap-3">
                  <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  <h3 className="font-semibold text-white">{month}</h3>
                  <span className="text-sm text-slate-400">({filtered.length})</span>
                </div>
                <span className="text-sm text-slate-500">
                  {filtered.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {filtered[0]?.currency}
                </span>
              </button>

              {/* Transactions List */}
              {isExpanded && (
                <div className="divide-y divide-slate-800">
                  {filtered.map((txn) => (
                    <button
                      key={txn.transaction_id}
                      onClick={() => setSelectedTransaction(txn)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-900/50 transition text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getTypeColor(txn.transaction_type)}`}>
                          {getTypeIcon(txn.transaction_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{txn.description}</p>
                          <p className="text-xs text-slate-500">{formatDate(txn.transaction_date)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`font-semibold ${
                          txn.transaction_type === 'DEPOSIT' ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {txn.transaction_type === 'DEPOSIT' ? '+' : '-'}{txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-xs ${
                          txn.status === 'COMPLETED' ? 'text-emerald-400' : 'text-yellow-400'
                        }`}>
                          {txn.status}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Receipt Modal */}
      {selectedTransaction && (
        <Receipt
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
