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
    <form onSubmit={handleSubmit} className="glass-panel space-y-4 rounded-3xl p-6 border border-white/5">
      <h2 className="text-lg font-bold text-white">Create New Customer Profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-slate-400">First Name</span>
          <input 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            required 
            className="input-glass mt-2 w-full rounded-2xl p-3 text-sm" 
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-400">Last Name</span>
          <input 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            required 
            className="input-glass mt-2 w-full rounded-2xl p-3 text-sm" 
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-slate-400">Phone Number</span>
        <input 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="input-glass mt-2 w-full rounded-2xl p-3 text-sm" 
          placeholder="+1 (555) 000-0000"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-400">Residential Address</span>
        <input 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          className="input-glass mt-2 w-full rounded-2xl p-3 text-sm" 
          placeholder="123 Financial Way, Wealth City"
        />
      </label>
      <button 
        type="submit" 
        className="glow-btn inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition"
      >
        Onboard Customer
      </button>
      {message ? <p className="text-xs text-slate-400 mt-2">{message}</p> : null}
    </form>
  );
}

