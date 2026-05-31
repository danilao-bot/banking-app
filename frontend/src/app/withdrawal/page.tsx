'use client';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import TransactionForm from '../../components/TransactionForm';

export default function WithdrawalPage() {
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
            <div className="mb-8 max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Withdrawal / Cash Out</h1>
              <p className="mt-2 text-slate-400 text-sm">Process a secure cash withdrawal from your active wallets.</p>
            </div>
            
            <TransactionForm mode="withdraw" />
          </main>
        </div>
      </div>
    </div>
  );
}
