'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DashboardCard from '../../components/DashboardCard';
import { getToken } from '../../lib/auth';
import { getJson } from '../../lib/api';

export default function DashboardPage() {
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [accountCount, setAccountCount] = useState<number>(0);
  const [message, setMessage] = useState('Loading data...');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to see dashboard data.');
      return;
    }

    async function loadData() {
      try {
        const customers = await getJson('/customers', token);
        const accounts = await getJson('/accounts', token);
        setCustomerCount(customers.length || 0);
        setAccountCount(accounts.length || 0);
        setMessage('');
      } catch (err) {
        setMessage('Unable to load dashboard data.');
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-slate-600">View active banking metrics and quick actions.</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DashboardCard title="Customers" value={customerCount}>
              Total customers in the system.
            </DashboardCard>
            <DashboardCard title="Accounts" value={accountCount}>
              Account summary and balance totals.
            </DashboardCard>
            <DashboardCard title="Status" value={message || 'Ready'}>
              {message ? message : 'System operational.'}
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  );
}
