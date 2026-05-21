'use client';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import TransactionForm from '../../components/TransactionForm';

export default function WithdrawalPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Withdrawal</h1>
            <p className="mt-2 text-slate-600">Process a withdrawal from a selected account.</p>
          </div>
          <TransactionForm mode="withdraw" />
        </main>
      </div>
    </div>
  );
}
