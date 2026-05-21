'use client';

import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import TransactionForm from '../../components/TransactionForm';

export default function TransferPage() {
  const router = useRouter();

  const handleConfirm = (payload: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    router.push(`/transfer/confirm?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Transfer</h1>
            <p className="mt-2 text-slate-600">Move funds securely between accounts.</p>
          </div>
          <TransactionForm mode="transfer" onConfirm={handleConfirm} />
        </main>
      </div>
    </div>
  );
}
