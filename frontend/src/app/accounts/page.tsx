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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Account Management</h1>
            <p className="mt-2 text-slate-600">Review active accounts and open new ones with confidence.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Account list</h2>
                {message ? (
                  <p className="mt-4 text-sm text-slate-500">{message}</p>
                ) : accounts.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No accounts available yet.</p>
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
  );
}
