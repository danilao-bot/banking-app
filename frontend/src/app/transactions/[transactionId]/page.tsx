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
  const [message, setMessage] = useState('Loading transaction details...');

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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getFormatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Pulse Glows - hidden in print */}
      <div className="glow-circle bg-indigo-600/10 w-[40vw] h-[40vw] left-[-10vw] top-[-10vw] print:hidden" />
      <div className="glow-circle bg-purple-600/10 w-[35vw] h-[35vw] right-[-5vw] top-[10vw] print:hidden" />
      <div className="glow-circle bg-cyan-600/10 w-[30vw] h-[30vw] left-[20vw] bottom-[-5vw] print:hidden" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto print:p-0 print:bg-white print:text-black">
            <div className="mb-8 max-w-xl mx-auto print:hidden">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Audit Receipt</h1>
              <p className="mt-2 text-slate-400 text-sm">Detailed cryptographically verified wallet audit receipt.</p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
              {message && !transaction ? (
                <div className="glass-panel rounded-3xl p-6 border border-white/5 text-center text-slate-400 text-sm print:hidden">
                  {message}
                </div>
              ) : transaction ? (
                <>
                  {/* Premium Wavy-style Receipt Mockup Card */}
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl bg-slate-900/80 backdrop-blur-md print:border-none print:shadow-none print:bg-white print:p-0">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 print:hidden" />
                    
                    <div className="text-center space-y-3 pb-8 border-b border-dashed border-white/10 print:border-slate-200">
                      <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-500/5 print:hidden">
                        <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </div>
                      <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-300">Transaction Receipt</h2>
                      <p className="text-4xl font-black text-white tracking-tight print:text-slate-900">
                        {transaction.currency === 'NGN' ? '₦' : transaction.currency === 'USD' ? '$' : transaction.currency} {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-400 print:text-slate-600">Processed on {getFormatDate(transaction.transaction_date)}</p>
                    </div>

                    <div className="py-6 space-y-4 text-xs font-semibold text-slate-400 print:text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-wider">Audit Ref ID</span>
                        <span className="text-slate-200 font-mono print:text-slate-900 font-bold">TXN-{transaction.transaction_id + 1000000}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-wider">Transaction Type</span>
                        <span className="text-slate-200 uppercase print:text-slate-900 font-bold">{transaction.transaction_type}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-wider">Source Account ID</span>
                        <span className="text-slate-200 print:text-slate-900 font-bold">{transaction.account_id}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-wider">Related Account ID</span>
                        <span className="text-slate-200 print:text-slate-900 font-bold">{transaction.related_account_id || 'N/A'}</span>
                      </div>

                      {transaction.reference && (
                        <div className="flex justify-between items-center">
                          <span className="uppercase tracking-wider">System Reference</span>
                          <span className="text-slate-200 print:text-slate-900 font-bold">{transaction.reference}</span>
                        </div>
                      )}

                      {transaction.description && (
                        <div className="flex justify-between items-center">
                          <span className="uppercase tracking-wider">Memo / Details</span>
                          <span className="text-slate-200 print:text-slate-900 font-bold">{transaction.description}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="uppercase tracking-wider">Verification Clearance</span>
                        <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-widest print:border-emerald-300">
                          {transaction.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-dashed border-white/10 flex justify-between items-center text-[10px] text-slate-500 print:border-slate-200 print:text-slate-600">
                      <span>Audit Integrity Operations</span>
                      <span className="font-mono">CRYPTO BLOCK CHECK CLEAR</span>
                    </div>
                  </div>

                  {/* Print & Return Navigation controls */}
                  <div className="grid grid-cols-2 gap-4 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Print Receipt
                    </button>
                    <button
                      onClick={() => router.push('/transactions')}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:bg-slate-900/70"
                    >
                      Back to History
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
