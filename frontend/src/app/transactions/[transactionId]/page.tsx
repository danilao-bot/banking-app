'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function TransactionDetailPage() {
  const { transactionId } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState('Loading transaction...');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to view transaction details.');
      return;
    }

    if (!transactionId) {
      setMessage('Transaction ID is missing.');
      return;
    }

    async function loadTransaction() {
      try {
        const data = await getJson(`/transactions/${transactionId}`, token);
        setTransaction(data);
        setMessage('');
      } catch (err) {
        setMessage('Unable to load transaction details.');
      }
    }

    loadTransaction();
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Transaction details</h1>
            <p className="mt-2 text-slate-600">Review the recorded details for this transaction.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {message && !transaction ? (
              <div className="text-sm text-slate-600">{message}</div>
            ) : transaction ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Transaction</h2>
                    <p className="mt-3 text-xl font-semibold text-slate-900">{transaction.transaction_type}</p>
                    <p className="mt-1 text-slate-700">{transaction.currency} {transaction.amount.toFixed(2)}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Status</h3>
                    <p className="mt-2 text-slate-700">{transaction.status}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Date</h3>
                    <p className="mt-2 text-slate-700">{new Date(transaction.transaction_date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Reference</h3>
                    <p className="mt-2 text-slate-700">{transaction.reference || 'None'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Description</h3>
                    <p className="mt-2 text-slate-700">{transaction.description || 'No description provided'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Accounts involved</h3>
                    <p className="mt-2 text-slate-700">Source account ID: {transaction.account_id}</p>
                    <p className="mt-2 text-slate-700">Related account ID: {transaction.related_account_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              onClick={() => router.push('/transactions')}
              className="mt-8 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to history
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
