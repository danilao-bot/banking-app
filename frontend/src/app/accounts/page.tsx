'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import AccountCard from '../../components/AccountCard';
import AccountForm from '../../components/AccountForm';
import { getToken } from '../../lib/auth';
import { getJson } from '../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState('Loading accounts...');

  const loadAccounts = async () => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to view accounts.');
      return;
    }

    try {
      const data = await getJson('/accounts', token);
      setAccounts(data);
      setMessage('');
    } catch (err) {
      setMessage('Unable to load account list.');
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-indigo-500 w-[40vw] h-[40vw] left-[-10vw] top-[-10vw]" />
      <div className="glow-circle bg-purple-500 w-[35vw] h-[35vw] right-[-5vw] top-[10vw]" />
      <div className="glow-circle bg-cyan-500 w-[30vw] h-[30vw] left-[20vw] bottom-[-5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Management</h1>
              <p className="mt-2 text-slate-400 text-sm">Review active accounts and open new ones with confidence.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/5">
                  <h2 className="text-xl font-bold text-white tracking-tight mb-4">Account list</h2>
                  {message ? (
                    <p className="text-sm text-slate-500">{message}</p>
                  ) : accounts.length === 0 ? (
                    <p className="text-sm text-slate-500">No accounts available yet.</p>
                  ) : (
                    <div className="grid gap-4">
                      {accounts.map((account) => (
                        <AccountCard
                          key={account.account_id}
                          accountNumber={account.account_number}
                          accountType={account.account_type}
                          balance={account.balance}
                          currency={account.currency}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <AccountForm onCreated={loadAccounts} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
