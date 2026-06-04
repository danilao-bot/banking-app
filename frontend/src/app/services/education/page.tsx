'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import BottomNav from '../../../components/BottomNav';
import { getToken } from '../../../lib/auth';
import { getJson, postJson } from '../../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
};

type ExamProduct = {
  id: string;
  name: string;
  price: number;
};

const EXAM_BOARDS = [
  { id: 'WAEC', name: 'WAEC', color: 'bg-indigo-600/10 text-indigo-400 border-indigo-600/25 hover:bg-indigo-600/20' },
  { id: 'JAMB', name: 'JAMB', color: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/25 hover:bg-emerald-600/20' },
  { id: 'NECO', name: 'NECO', color: 'bg-teal-600/10 text-teal-400 border-teal-600/25 hover:bg-teal-600/20' },
];

const PRODUCTS: Record<string, ExamProduct[]> = {
  WAEC: [
    { id: 'waec-pin', name: 'WAEC Result Checker PIN', price: 3500 },
    { id: 'waec-reg', name: 'WAEC GCE Registration Pin', price: 27000 },
  ],
  JAMB: [
    { id: 'jamb-utme', name: 'JAMB UTME Profile Code PIN', price: 6200 },
    { id: 'jamb-de', name: 'JAMB Direct Entry PIN', price: 6200 },
    { id: 'jamb-change', name: 'JAMB Change of Course/Institution', price: 2500 },
  ],
  NECO: [
    { id: 'neco-checker', name: 'NECO Token Result Checker', price: 1200 },
    { id: 'neco-reg', name: 'NECO GCE Registration Token', price: 18500 },
  ],
};

export default function EducationPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [candidateId, setCandidateId] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('WAEC');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [pinCode, setPinCode] = useState('');

  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadAccounts() {
      try {
        setLoading(true);
        const data = await getJson('/accounts/me', token);
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccountId(data[0].account_id);
        }
      } catch (err) {
        setMessage('Failed to load active wallets.');
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    setSelectedProductId('');
  }, [selectedBoard]);

  const activeProducts = PRODUCTS[selectedBoard] || [];
  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setPinCode('');

    if (!selectedAccountId) {
      setMessage('Select a source wallet first.');
      return;
    }

    if (candidateId.length < 8) {
      setMessage('Profile/Candidate ID must be at least 8 digits.');
      return;
    }

    if (!selectedProduct) {
      setMessage('Please select an exam product/PIN type.');
      return;
    }

    const selectedAccount = accounts.find((a) => a.account_id === selectedAccountId);
    if (selectedAccount && selectedAccount.balance < selectedProduct.price) {
      setMessage('Insufficient funds in the selected wallet.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const reference = 'EDU-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const payload = {
        account_id: selectedAccountId,
        amount: selectedProduct.price,
        description: `Education PIN: ${selectedProduct.name} for Candidate #${candidateId} (${selectedBoard})`,
        reference,
      };

      await postJson('/transactions/withdraw', payload, token || undefined);
      setIsSuccess(true);
      setMessage(`Successfully purchased ${selectedBoard} PIN!`);
      
      // Generate a mock PIN / Serial
      const mockPin = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
      const mockSerial = 'WR' + Math.floor(100000000 + Math.random() * 900000000);
      setPinCode(`PIN: ${mockPin} | SERIAL: ${mockSerial}`);

      setCandidateId('');
      setSelectedProductId('');
      
      if (token) {
        const data = await getJson('/accounts/me', token);
        setAccounts(data);
      }
    } catch (err: any) {
      setMessage(err.message || 'Transaction failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrencySymbol = (accId: number | null) => {
    const acc = accounts.find((a) => a.account_id === accId);
    if (!acc) return '₦';
    return acc.currency === 'NGN' ? '₦' : acc.currency === 'USD' ? '₦' : acc.currency;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <div className="glow-circle bg-purple-600/10 w-[45vw] h-[45vw] left-[-15vw] top-[-15vw]" />
      <div className="glow-circle bg-pink-600/10 w-[40vw] h-[40vw] right-[-5vw] top-[5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-xl mx-auto md:mx-0 md:max-w-4xl w-full">
            <div className="mb-6 flex items-center gap-3">
              <Link href="/services" className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Education Services</h1>
                <p className="text-xs text-slate-400 mt-0.5">Purchase exam registration PINs and result checkers instantly.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex h-[40vh] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-xs text-slate-400">Loading wallets...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-panel space-y-6 rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl max-w-xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Source Wallet
                    <select
                      value={selectedAccountId ?? ''}
                      onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                    >
                      {accounts.map((account) => (
                        <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                          {account.account_type} Wallet ({account.account_number}) • {account.currency === 'NGN' ? '₦' : account.currency === 'USD' ? '₦' : account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Exam Board
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {EXAM_BOARDS.map((board) => {
                        const isSelected = selectedBoard === board.id;
                        return (
                          <button
                            key={board.id}
                            type="button"
                            onClick={() => setSelectedBoard(board.id)}
                            className={`rounded-2xl p-3 text-center border text-xs font-extrabold transition-all ${board.color} ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5' : ''
                            }`}
                          >
                            {board.name}
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Profile ID / Candidate ID
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 5839201948"
                      value={candidateId}
                      onChange={(e) => setCandidateId(e.target.value.replace(/\D/g, ''))}
                      className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-wider text-white"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Product / PIN
                    <div className="flex flex-col gap-2 mt-2">
                      {activeProducts.map((prod) => {
                        const isSelected = selectedProductId === prod.id;
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => setSelectedProductId(prod.id)}
                            className={`rounded-2xl p-4 flex items-center justify-between border text-sm font-extrabold transition-all text-left bg-slate-900/50 hover:bg-slate-900 border-white/5 ${
                              isSelected ? 'ring-2 ring-purple-500 border-transparent bg-white/5 text-purple-300' : 'text-slate-300'
                            }`}
                          >
                            <span className="font-bold">{prod.name}</span>
                            <span className="font-extrabold text-white text-base">
                              {getCurrencySymbol(selectedAccountId)}{prod.price.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </label>
                </div>

                {selectedProduct ? (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">PIN Cost</span>
                    <span className="text-lg font-black text-white">
                      {getCurrencySymbol(selectedAccountId)}{selectedProduct.price.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || accounts.length === 0 || candidateId.length < 8 || !selectedProductId}
                  className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Generating PIN...' : 'Purchase PIN'}
                </button>

                {message ? (
                  <div className={`p-4 rounded-2xl text-center text-xs font-bold ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="flex items-center gap-1.5">
                        {isSuccess && (
                          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {message}
                      </span>
                      {pinCode && (
                        <div className="mt-3 p-4 bg-slate-950/80 rounded-2xl border border-white/5 w-full select-all font-mono">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">Exam Pin Details</p>
                          <p className="text-sm font-bold text-white mt-1 leading-relaxed">{pinCode}</p>
                          <p className="text-[9px] text-slate-500 mt-1 font-sans">Use these details on the exam portal to check results or register.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </form>
            )}
          </main>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
