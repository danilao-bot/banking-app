'use client';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import TransactionForm from '../../components/TransactionForm';

export default function DepositPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Deposit</h1>
            <p className="mt-2 text-slate-600">Create a secure deposit to a selected account.</p>
          </div>
          <TransactionForm mode="deposit" />
        </main>
      </div>
    </div>
  );
}
