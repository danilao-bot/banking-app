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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Customer Management</h1>
            <p className="mt-2 text-slate-600">Create, list and review customer accounts.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Customer list</h2>
                {message ? (
                  <p className="mt-4 text-sm text-slate-500">{message}</p>
                ) : customers.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No customers found yet.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {customers.map((customer) => (
                      <li key={customer.customer_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{customer.first_name} {customer.last_name}</p>
                        <p className="text-sm text-slate-600">{customer.phone || 'No phone'}</p>
                        <p className="text-sm text-slate-500">{customer.address || 'No address'}</p>
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
  );
}
