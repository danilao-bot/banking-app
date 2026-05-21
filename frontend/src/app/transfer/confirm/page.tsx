'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { getToken } from '../../../lib/auth';
import { postJson } from '../../../lib/api';

export default function TransferConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const summary = useMemo(() => {
    if (!searchParams) return null;
    const account_id = searchParams.get('account_id');
    const source_account_number = searchParams.get('source_account_number');
    const target_account_number = searchParams.get('target_account_number');
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');
    const reference = searchParams.get('reference');
    const target_account_id = searchParams.get('target_account_id');

    if (!account_id || !target_account_id || !amount || !source_account_number || !target_account_number) {
      return null;
    }

    return {
      account_id,
      source_account_number,
      target_account_id,
      target_account_number,
      amount,
      description,
      reference,
    };
  }, [searchParams]);

  const handleConfirm = async () => {
    if (!summary) return;
    const token = getToken();
    if (!token) {
      setMessage('Please login before confirming the transfer.');
      return;
    }

    setSubmitting(true);
    setMessage('Submitting transfer...');

    try {
      const response = await postJson(
        '/transactions/transfer',
        {
          account_id: Number(summary.account_id),
          target_account_id: Number(summary.target_account_id),
          amount: Number(summary.amount),
          description: summary.description || undefined,
          reference: summary.reference || undefined,
        },
        token,
      );
      router.push(`/transfer/success?transaction_id=${response.transaction_id}`);
    } catch (error) {
      setMessage('Transfer could not be completed. Please verify the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
              <h1 className="text-3xl font-semibold">Transfer confirmation</h1>
              <p className="mt-4 text-slate-600">Missing transfer information. Please return to the transfer page and try again.</p>
              <button
                onClick={() => router.push('/transfer')}
                className="mt-8 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Return to transfer
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Transfer confirmation</h1>
            <p className="mt-2 text-slate-600">Review the transfer details before submitting.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_0.7fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
              <dl className="mt-6 grid gap-4 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="font-medium text-slate-900">Source account</dt>
                  <dd className="mt-1 text-slate-600">{summary.source_account_number}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="font-medium text-slate-900">Destination account</dt>
                  <dd className="mt-1 text-slate-600">{summary.target_account_number}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="font-medium text-slate-900">Amount</dt>
                  <dd className="mt-1 text-slate-600">USD {Number(summary.amount).toFixed(2)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="font-medium text-slate-900">Reference</dt>
                  <dd className="mt-1 text-slate-600">{summary.reference || 'None provided'}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="font-medium text-slate-900">Description</dt>
                  <dd className="mt-1 text-slate-600">{summary.description || 'No description'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Action</h2>
              <p className="mt-4 text-slate-600">Confirm this transfer to finalize the request. This operation is recorded and cannot be repeated by accident.</p>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Submitting...' : 'Confirm transfer'}
              </button>
              <button
                onClick={() => router.push('/transfer')}
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Edit transfer details
              </button>
              {message ? <p className="mt-4 text-sm text-slate-500">{message}</p> : null}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
