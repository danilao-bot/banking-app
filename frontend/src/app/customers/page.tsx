'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomerForm from '../../components/CustomerForm';
import { getToken } from '../../lib/auth';
import { getJson } from '../../lib/api';

type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [message, setMessage] = useState('Loading customers...');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to view customers.');
      return;
    }

    async function loadCustomers() {
      try {
        const data = await getJson('/customers', token);
        setCustomers(data);
        setMessage('');
      } catch (err) {
        setMessage('Unable to load customer list.');
      }
    }

    loadCustomers();
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
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Management</h1>
              <p className="mt-2 text-slate-400 text-sm">Create, list and review customer accounts.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="space-y-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/5">
                  <h2 className="text-xl font-bold text-white tracking-tight mb-4">Customer list</h2>
                  {message ? (
                    <p className="text-sm text-slate-500">{message}</p>
                  ) : customers.length === 0 ? (
                    <p className="text-sm text-slate-500">No customers found yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {customers.map((customer) => (
                        <li key={customer.customer_id} className="glass-panel relative overflow-hidden rounded-3xl p-5 border border-white/5">
                          <p className="font-bold text-white text-base">{customer.first_name} {customer.last_name}</p>
                          <p className="text-xs text-slate-400 mt-2">Phone: {customer.phone || 'No phone'}</p>
                          <p className="text-xs text-slate-500 mt-1">Address: {customer.address || 'No address'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
              <CustomerForm />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
