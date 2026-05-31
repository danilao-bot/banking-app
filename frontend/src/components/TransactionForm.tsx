'use client';

import { useEffect, useState } from 'react';
import { getToken } from '../lib/auth';
import { getJson, postJson } from '../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
};

type TransactionFormProps = {
  mode: 'deposit' | 'withdraw' | 'transfer';
  onSuccess?: () => void;
  onConfirm?: (payload: Record<string, unknown>) => void;
};

const labels = {
  deposit: 'Fund Wallet',
  withdraw: 'Cash Out / Withdraw',
  transfer: 'Send Money to Friend',
};

const endpoints = {
  deposit: '/transactions/deposit',
  withdraw: '/transactions/withdraw',
  transfer: '/transactions/transfer',
};

export default function TransactionForm({ mode, onSuccess, onConfirm }: TransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState<number | null>(null);
  
  // Peer Transfer inputs
  const [recipientNumber, setRecipientNumber] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookedUpAccount, setLookedUpAccount] = useState<{ account_id: number; account_number: string; owner_name: string } | null>(null);
  const [targetAccountId, setTargetAccountId] = useState<number | null>(null);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('Loading accounts...');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setMessage('Please login to access transaction tools.');
      return;
    }

    async function loadAccounts() {
      try {
        const data = await getJson('/accounts/me', token);
        setAccounts(data);
        if (data.length > 0) {
          setSourceAccountId(data[0].account_id);
          setMessage('');
        } else {
          setMessage('No active wallet accounts available.');
        }
      } catch (err) {
        setMessage('Unable to load accounts.');
      }
    }

    loadAccounts();
  }, []);

  // Peer-to-peer real-time lookup
  useEffect(() => {
    if (mode !== 'transfer') return;
    if (recipientNumber.length !== 10) {
      setLookedUpAccount(null);
      setTargetAccountId(null);
      setLookupError('');
      return;
    }

    async function performLookup() {
      setLookupLoading(true);
      setLookupError('');
      setLookedUpAccount(null);
      setTargetAccountId(null);
      try {
        const token = getToken();
        if (!token) throw new Error('Unauthenticated');
        const data = await getJson(`/accounts/lookup?account_number=${recipientNumber}`, token);
        setLookedUpAccount(data);
        setTargetAccountId(data.account_id);
      } catch (err: any) {
        setLookupError('No account matches this number.');
      } finally {
        setLookupLoading(false);
      }
    }

    performLookup();
  }, [recipientNumber, mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceAccountId) {
      setMessage('Select a source wallet first.');
      return;
    }
    if (mode === 'transfer' && !targetAccountId) {
      setMessage('A valid 10-digit recipient account number is required.');
      return;
    }
    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      setMessage('Enter an amount greater than zero.');
      return;
    }
    if (mode === 'transfer' && sourceAccountId === targetAccountId) {
      setMessage('You cannot transfer money to the same wallet.');
      return;
    }

    setSubmitting(true);
    setMessage('Processing your request...');

    try {
      const payload: any = {
        account_id: sourceAccountId,
        amount: amountValue,
        description: description || undefined,
        reference: reference || undefined,
      };
      
      if (mode === 'transfer') {
        payload.target_account_id = targetAccountId;
      }

      if (mode === 'transfer' && onConfirm) {
        const sourceAccount = accounts.find((account) => account.account_id === sourceAccountId);
        if (sourceAccount) payload.source_account_number = sourceAccount.account_number;
        if (lookedUpAccount) {
          payload.target_account_number = lookedUpAccount.account_number;
          payload.owner_name = lookedUpAccount.owner_name;
        }
        onConfirm(payload);
        return;
      }

      const token = getToken();
      await postJson(endpoints[mode], payload, token || undefined);
      setMessage(`${labels[mode]} completed successfully.`);
      setAmount('');
      setDescription('');
      setReference('');
      setRecipientNumber('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setMessage(error.message || `Transaction failed. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrencySymbol = (accId: number | null) => {
    const acc = accounts.find((a) => a.account_id === accId);
    if (!acc) return '₦';
    return acc.currency === 'NGN' ? '₦' : acc.currency === 'USD' ? '$' : acc.currency;
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel space-y-6 rounded-[2rem] p-8 border border-white/5 shadow-xl max-w-xl mx-auto">
      <div className="border-b border-white/5 pb-4 mb-2">
        <h2 className="text-xl font-black text-white tracking-tight">{labels[mode]}</h2>
        <p className="text-xs text-slate-400 mt-1">Wallet secure instant processing protocols.</p>
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Source Wallet
          <select
            value={sourceAccountId ?? ''}
            onChange={(e) => setSourceAccountId(Number(e.target.value))}
            className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
          >
            {accounts.map((account) => (
              <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                {account.account_type} Wallet ({account.account_number}) • {account.currency === 'NGN' ? '₦' : account.currency === 'USD' ? '$' : account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === 'transfer' ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Recipient's 10-digit Account Number
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 9012345678"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value.replace(/\D/g, ''))}
              className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm font-semibold tracking-widest text-white"
            />
          </label>

          {/* Peer lookup dynamic state banner */}
          {recipientNumber.length > 0 && (
            <div className="transition duration-300">
              {lookupLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                  <span className="text-[10px] text-slate-400">Looking up account owner...</span>
                </div>
              ) : lookupError ? (
                <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold">
                    <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {lookupError}
                  </span>
                </div>
              ) : lookedUpAccount ? (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-extrabold tracking-wide uppercase">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Recipient: {lookedUpAccount.owner_name}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    Verified
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400">Enter {10 - recipientNumber.length} more digits...</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Amount
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
              {getCurrencySymbol(sourceAccountId)}
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-glass w-full rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-white"
              placeholder="0.00"
            />
          </div>
        </label>
        
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Reference
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
            placeholder="Optional reference"
          />
        </label>
      </div>

      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-glass mt-2 h-20 w-full rounded-2xl p-3.5 text-sm"
          placeholder="Optional transaction description"
        />
      </label>

      <button
        type="submit"
        disabled={submitting || accounts.length === 0 || (mode === 'transfer' && !targetAccountId)}
        className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Authenticating...' : `${labels[mode]}`}
      </button>

      {message ? (
        <div className={`p-3 rounded-xl text-center text-xs font-medium ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5'}`}>
          {message}
        </div>
      ) : null}
    </form>
  );
}
