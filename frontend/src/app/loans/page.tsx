'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getToken } from '../../lib/auth';
import { getJson, postJson } from '../../lib/api';

type Loan = {
  loan_id: number;
  customer_id: number;
  amount: number;
  interest_rate: number;
  term_months: number;
  status: string;
  approved_by?: number;
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [requestAmount, setRequestAmount] = useState<number>(100000);
  const [termMonths, setTermMonths] = useState<number>(6);
  
  const [message, setMessage] = useState('Loading loans...');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Interest rate varies by term duration
  const interestRate = useMemo(() => {
    if (termMonths === 3) return 4.5;
    if (termMonths === 6) return 8.0;
    return 12.5; // 12 months
  }, [termMonths]);

  // Real-time calculations
  const totalRepayment = useMemo(() => {
    return requestAmount * (1 + interestRate / 100);
  }, [requestAmount, interestRate]);

  const monthlyRepayment = useMemo(() => {
    return totalRepayment / termMonths;
  }, [totalRepayment, termMonths]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function loadLoans() {
      try {
        setLoading(true);
        const userLoans = await getJson('/loans/me', token);
        setLoans(userLoans);
        setMessage('');
      } catch (err) {
        setMessage('Unable to query loan history.');
      } finally {
        setLoading(false);
      }
    }

    loadLoans();
  }, []);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setMessage('Submitting loan application to underwriting group...');
    try {
      const payload = {
        amount: requestAmount,
        interest_rate: interestRate,
        term_months: termMonths,
      };
      const newLoan = await postJson('/loans/', payload, token);
      setLoans([newLoan, ...loans]);
      setMessage('Loan application submitted successfully! Pending review.');
    } catch (err: any) {
      setMessage(err.message || 'Unable to submit loan application.');
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="mb-8 max-w-5xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Quick Loans</h1>
              <p className="mt-2 text-slate-400 text-sm">Check credit scores, apply for instant micro-loans, and manage active repayment lines.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] max-w-5xl mx-auto">
              {/* Left Column: Interactive repayment slider */}
              <section className="glass-panel rounded-[2rem] p-8 border border-white/5 space-y-6 bg-slate-900/40">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-lg font-black text-white tracking-tight">Loan Limit Calculator</h2>
                  <p className="text-xs text-slate-400 mt-1">Slide to adjust your required cash. Repayment plans are processed instantly.</p>
                </div>

                <form onSubmit={handleApplyLoan} className="space-y-6">
                  {/* Amount display box */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/5 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requested Principal</span>
                    <div className="text-4xl font-black text-white tracking-tight leading-none">
                      ₦{requestAmount.toLocaleString()}
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>Min: ₦10,000</span>
                      <span>Max: ₦500,000</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={500000}
                      step={10000}
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Term Selectors */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Repayment Term</span>
                    <div className="grid grid-cols-3 gap-3">
                      {[3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTermMonths(m)}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition ${termMonths === m ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10' : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'}`}
                        >
                          {m} Months
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submissions */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Application...' : 'Apply for Instant Credit'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Right Column: Calculations details in real-time */}
              <section className="space-y-6">
                <div className="glass-panel rounded-[2rem] p-6 border border-white/5 space-y-4 bg-slate-900/40">
                  <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">Repayment breakdown</h3>
                  
                  <div className="divide-y divide-white/5 text-xs font-semibold text-slate-400">
                    <div className="flex justify-between py-3">
                      <span>Interest Rate</span>
                      <span className="text-slate-200 font-bold">{interestRate.toFixed(1)}% ({termMonths === 12 ? 'Annualized' : 'Flat'})</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>Total Interest</span>
                      <span className="text-slate-200 font-bold">₦{(requestAmount * interestRate / 100).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>Total Repayment</span>
                      <span className="text-slate-200 font-bold">₦{totalRepayment.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-indigo-300 font-bold">Monthly Repayment</span>
                      <span className="text-indigo-300 font-extrabold text-sm">₦{monthlyRepayment.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                {/* Notifications & System warnings */}
                {message ? (
                  <div className={`p-4 rounded-[1.5rem] text-xs font-medium text-center ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
                    {message}
                  </div>
                ) : null}
              </section>
            </div>

            {/* Bottom Section: Active requested loans list */}
            <div className="mt-8 max-w-5xl mx-auto">
              <section className="glass-panel rounded-[2rem] p-6 border border-white/5 bg-slate-900/40 overflow-hidden">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Loan Application History</h3>
                
                {loading ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Checking active loan databases...</p>
                ) : loans.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No active credit requests or past loans found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-slate-300">
                      <thead className="border-b border-white/5 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                        <tr>
                          <th className="px-4 py-3">Loan ID</th>
                          <th className="px-4 py-3">Principal</th>
                          <th className="px-4 py-3">Interest Rate</th>
                          <th className="px-4 py-3">Term Duration</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
                        {loans.map((loan) => (
                          <tr key={loan.loan_id} className="hover:bg-slate-900/30 transition">
                            <td className="px-4 py-4 text-slate-400 font-mono">L-{loan.loan_id + 1000}</td>
                            <td className="px-4 py-4 text-white font-extrabold">₦{loan.amount.toLocaleString()}</td>
                            <td className="px-4 py-4">{loan.interest_rate}%</td>
                            <td className="px-4 py-4">{loan.term_months} Months</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${loan.status.toUpperCase() === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : loan.status.toUpperCase() === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                {loan.status}
                              </span>
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

