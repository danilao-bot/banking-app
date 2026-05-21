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
  deposit: 'Deposit funds',
  withdraw: 'Withdraw funds',
  transfer: 'Transfer funds',
};

const endpoints = {
  deposit: '/transactions/deposit',
  withdraw: '/transactions/withdraw',
  transfer: '/transactions/transfer',
};

export default function TransactionForm({ mode, onSuccess }: TransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState<number | null>(null);
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
        const data = await getJson('/accounts', token);
        setAccounts(data);
        if (data.length > 0) {
          setSourceAccountId(data[0].account_id);
          if (data.length > 1) {
            setTargetAccountId(data[1].account_id);
          }
        } else {
          setMessage('No accounts available. Create an account first.');
        }
      } catch (err) {
        setMessage('Unable to load accounts.');
      }
    }

    loadAccounts();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceAccountId) {
      setMessage('Select a source account first.');
      return;
    }
    if (mode === 'transfer' && !targetAccountId) {
      setMessage('Select a destination account for the transfer.');
      return;
    }
    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      setMessage('Enter a valid amount greater than zero.');
      return;
    }
    if (mode === 'transfer' && sourceAccountId === targetAccountId) {
      setMessage('Source and destination accounts must be different.');
      return;
    }

    setSubmitting(true);
    setMessage('Submitting transaction...');

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
        const targetAccount = accounts.find((account) => account.account_id === targetAccountId);
        if (sourceAccount) payload.source_account_number = sourceAccount.account_number;
        if (targetAccount) payload.target_account_number = targetAccount.account_number;
        onConfirm(payload);
        return;
      }

      const token = getToken();
      await postJson(endpoints[mode], payload, token || undefined);
      setMessage(`${labels[mode]} completed successfully.`);
      setAmount('');
      setDescription('');
      setReference('');
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage(`Transaction failed. Check account details and amount.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{labels[mode]}</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700">Source account</label>
        <select
          value={sourceAccountId ?? ''}
          onChange={(e) => setSourceAccountId(Number(e.target.value))}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
        >
          {accounts.map((account) => (
            <option key={account.account_id} value={account.account_id}>
              {account.account_number} • {account.account_type} • {account.currency} {account.balance.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {mode === 'transfer' ? (
        <div>
          <label className="block text-sm font-medium text-slate-700">Destination account</label>
          <select
            value={targetAccountId ?? ''}
            onChange={(e) => setTargetAccountId(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
          >
            <option value="">Select destination account</option>
            {accounts
              .filter((account) => account.account_id !== sourceAccountId)
              .map((account) => (
                <option key={account.account_id} value={account.account_id}>
                  {account.account_number} • {account.account_type}
                </option>
              ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
            placeholder="0.00"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Reference
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
            placeholder="Optional reference"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 h-24 w-full rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm"
          placeholder="Optional transaction description"
        />
      </label>

      <button
        type="submit"
        disabled={submitting || accounts.length === 0}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Submitting...' : `${labels[mode]} now`}
      </button>

      <p className="text-sm text-slate-500">{message}</p>
    </form>
  );
}
