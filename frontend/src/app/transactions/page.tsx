'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to view transaction history.');
      return;
    }

    async function loadAccounts() {
      try {
        const data = await getJson('/accounts', token);
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccountId(data[0].account_id);
        } else {
          setMessage('No accounts available. Please create an account first.');
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
        setMessage('Loading transaction history...');
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Transaction History</h1>
            <p className="mt-2 text-slate-600">Review account-level transaction activity and status.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Select account</h2>
              <label className="block text-sm font-medium text-slate-700">
                Account
                <select
                  value={selectedAccountId ?? ''}
                  onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
                >
                  {accounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_number} • {account.account_type} • {account.currency} {account.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
              {message ? <p className="text-sm text-slate-500">{message}</p> : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Recent transactions</h2>
              {message && transactions.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">{message}</div>
              ) : transactions.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">No transactions found for this account yet.</div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 text-slate-900">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {transactions.map((tx) => (
                        <tr key={tx.transaction_id}>
                          <td className="px-4 py-4 text-slate-600">{new Date(tx.transaction_date).toLocaleString()}</td>
                          <td className="px-4 py-4 font-medium text-slate-900">{tx.transaction_type}</td>
                          <td className="px-4 py-4">{tx.currency} {tx.amount.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{tx.reference || '—'}</td>
                          <td className="px-4 py-4">
                            <Link href={`/transactions/${tx.transaction_id}`} className="text-slate-900 underline hover:text-slate-700">
                              View details
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
  );
}
