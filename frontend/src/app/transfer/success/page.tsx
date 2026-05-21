'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { getJson } from '../../../lib/api';
import { getToken } from '../../../lib/auth';

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

export default function TransferSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState('Loading transfer receipt...');

  useEffect(() => {
    const transactionId = searchParams.get('transaction_id');
    const token = getToken();
    if (!token) {
      setMessage('Please login to view receipt.');
      return;
    }
    if (!transactionId) {
      setMessage('Invalid transfer receipt link.');
      return;
    }

    async function loadReceipt() {
      try {
        const data = await getJson(`/transactions/${transactionId}`, token);
        setTransaction(data);
        setMessage('');
      } catch (err) {
        setMessage('Unable to load receipt details.');
      }
    }

    loadReceipt();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Transfer receipt</h1>
            <p className="mt-2 text-slate-600">Your transfer has been completed and recorded.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {message && !transaction ? (
              <p className="text-sm text-slate-600">{message}</p>
            ) : transaction ? (
              <div className="space-y-6">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">Receipt</h2>
                  <p className="mt-3 text-slate-700">Transaction ID: {transaction.transaction_id}</p>
                  <p className="mt-1 text-slate-700">Status: {transaction.status}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Source account</h3>
                    <p className="mt-2 text-slate-700">Account ID: {transaction.account_id}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Related account</h3>
                    <p className="mt-2 text-slate-700">{transaction.related_account_id || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Amount</h3>
                    <p className="mt-2 text-slate-700">{transaction.currency} {transaction.amount.toFixed(2)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Date</h3>
                    <p className="mt-2 text-slate-700">{new Date(transaction.transaction_date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Reference</h3>
                  <p className="mt-2 text-slate-700">{transaction.reference || 'None'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Description</h3>
                  <p className="mt-2 text-slate-700">{transaction.description || 'No description provided'}</p>
                </div>

                <button
                  onClick={() => router.push('/transactions')}
                  className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Back to transaction history
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
