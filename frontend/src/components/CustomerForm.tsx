'use client';

import { useState } from 'react';
import { getToken } from '../lib/auth';
import { postJson } from '../lib/api';

export default function CustomerForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Creating customer...');
    try {
      const token = getToken();
      await postJson(
        '/customers',
        {
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
        },
        token || undefined,
      );
      setMessage('Customer created successfully');
      setFirstName('');
      setLastName('');
      setPhone('');
      setAddress('');
    } catch (error) {
      setMessage('Failed to create customer.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">New Customer</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-600">First name</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Last name</span>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-slate-600">Phone</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">Address</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
      </label>
      <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
        Create Customer
      </button>
      <p className="text-sm text-slate-500">{message}</p>
    </form>
  );
}
