'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { getToken } from '../../../lib/auth';
import { postJson } from '../../../lib/api';

function TransferConfirmationContent() {
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
    const owner_name = searchParams.get('owner_name');

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
      owner_name
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
    } catch (error: any) {
      setMessage(error.message || 'Transfer could not be completed. Please verify the details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!summary) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="glass-panel max-w-md rounded-3xl p-8 border border-white/5 text-center space-y-6">
              <h1 className="text-2xl font-extrabold text-white">Transfer Error</h1>
              <p className="text-slate-400 text-sm">Missing transfer information. Please return to the transfer page and try again.</p>
              <button
                onClick={() => router.push('/transfer')}
                className="glow-btn px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider w-full"
              >
                Return to Transfer
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="mb-8 max-w-4xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Confirm Transfer</h1>
              <p className="mt-2 text-slate-400 text-sm">Review transaction details before authorization.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] max-w-4xl mx-auto">
              <section className="glass-panel rounded-[2rem] p-8 border border-white/5 space-y-6">
                <h2 className="text-lg font-black text-white tracking-tight">Transaction Summary</h2>
                
                <div className="grid gap-4 text-sm">
                  <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 flex justify-between items-center">
                    <div>
                      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Account</dt>
                      <dd className="mt-1 font-semibold text-slate-200">{summary.source_account_number}</dd>
                    </div>
                    <span className="text-indigo-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 flex justify-between items-center">
                    <div>
                      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination Account</dt>
                      <dd className="mt-1 font-semibold text-slate-200">{summary.target_account_number}</dd>
                      {summary.owner_name && (
                        <span className="inline-block mt-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold">
                          Recipient: {summary.owner_name}
                        </span>
                      )}
                    </div>
                    <span className="text-cyan-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5 flex justify-between items-center">
                    <div>
                      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transfer Amount</dt>
                      <dd className="mt-1 text-xl font-black text-indigo-300">
                        ₦{Number(summary.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </dd>
                    </div>
                    <span className="text-emerald-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                  </div>

                  {summary.reference && (
                    <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5">
                      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</dt>
                      <dd className="mt-1 font-semibold text-slate-200">{summary.reference}</dd>
                    </div>
                  )}

                  {summary.description && (
                    <div className="rounded-2xl bg-slate-900/60 p-4 border border-white/5">
                      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</dt>
                      <dd className="mt-1 font-semibold text-slate-200">{summary.description}</dd>
                    </div>
                  )}
                </div>
              </section>

              <section className="glass-panel rounded-[2rem] p-8 border border-white/5 space-y-6 h-fit">
                <h2 className="text-lg font-black text-white tracking-tight">Security Check</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aether security protocols require manual transaction authentication. Double check all destination details. Peer transfers are instant and irreversible.
                </p>
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {submitting ? 'Authorizing...' : 'Authorize Transfer'}
                  </button>
                  <button
                    onClick={() => router.push('/transfer')}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:bg-slate-900/70"
                  >
                    Edit Details
                  </button>
                </div>
                
                {message ? (
                  <div className="p-3 bg-slate-900/60 text-[10px] text-slate-400 rounded-xl text-center border border-white/5">
                    {message}
                  </div>
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function TransferConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <p className="text-sm text-slate-400 font-medium">Loading transfer confirmation details...</p>
      </div>
    }>
      <TransferConfirmationContent />
    </Suspense>
  );
}
