'use client';

import { useEffect, useState } from 'react';
import { getJson, postJson } from '../lib/api';
import { getToken } from '../lib/auth';

type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
};

type AccountFormProps = {
  onCreated?: () => void;
};

const accountTypes = ['SAVINGS', 'CURRENT', 'FIXED'];
const currencies = ['USD', 'EUR', 'GBP'];

export default function AccountForm({ onCreated }: AccountFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('Loading customers...');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to manage accounts.');
      return;
    }

    async function loadCustomers() {
      try {
        const data = await getJson('/customers', token);
        setCustomers(data);
        setMessage('');
        if (data.length > 0) {
          setCustomerId(data[0].customer_id);
        }
      } catch (err) {
        setMessage('Unable to load customers for account creation.');
      }
    }

    loadCustomers();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerId) {
      setMessage('Select a customer to create the account.');
      return;
    }

    setSubmitting(true);
    setMessage('Creating account...');

    try {
      const token = getToken();
      await postJson(
        '/accounts',
        {
          customer_id: customerId,
          account_type: accountType,
          currency,
        },
        token || undefined,
      );
      setMessage('Account created successfully.');
      if (onCreated) onCreated();
    } catch (error) {
      setMessage('Could not create account. Check the customer and values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Create new account</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700">Customer</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
        >
          {customers.length === 0 ? (
            <option value="">No customers available</option>
          ) : (
            customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Account type
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
          >
            {currencies.map((currencyOption) => (
              <option key={currencyOption} value={currencyOption}>
                {currencyOption}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || !customerId}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Creating...' : 'Create account'}
      </button>

      <p className="text-sm text-slate-500">{message}</p>
    </form>
  );
}
