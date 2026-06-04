'use client';

import { useState } from 'react';

interface ReceiptProps {
  transaction: {
    transaction_id: number;
    transaction_type: string;
    amount: number;
    currency: string;
    transaction_date: string;
    description?: string;
    reference?: string;
    status: string;
    account_id?: number;
    related_account_id?: number;
  };
  accountDetails?: {
    account_number: string;
    account_type: string;
    customer_name?: string;
  };
  recipientDetails?: {
    account_number: string;
    customer_name?: string;
  };
  onClose?: () => void;
}

export default function Receipt({ transaction, accountDetails, recipientDetails, onClose }: ReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const handleDownload = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `receipt-${transaction.reference || transaction.transaction_id}.png`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TRANSFER: 'Money Transfer',
      DEPOSIT: 'Deposit',
      WITHDRAWAL: 'Withdrawal',
      AIRTIME: 'Airtime Purchase',
      DATA: 'Data Purchase',
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-cyan-500">
          <h2 className="text-lg font-bold text-white">Receipt</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-6 space-y-6 text-slate-900 print:bg-white">
          {/* AETHER Header */}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600">
              AETHER
            </h1>
            <p className="text-xs text-slate-500 mt-1">Digital Banking Platform</p>
          </div>

          {/* Receipt Type & Status */}
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-slate-600">
              {getTransactionTypeLabel(transaction.transaction_type)}
            </p>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              transaction.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {transaction.status}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-600 mb-1">Amount</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600">
              {transaction.currency} {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Reference:</span>
              <span className="text-sm font-semibold text-slate-900">{transaction.reference || transaction.transaction_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Date & Time:</span>
              <span className="text-sm font-semibold text-slate-900">{formatDate(transaction.transaction_date)}</span>
            </div>
            {transaction.description && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-600">Description:</span>
                <span className="text-sm font-semibold text-slate-900 text-right">{transaction.description}</span>
              </div>
            )}
          </div>

          {/* Account Details */}
          {accountDetails && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-600 uppercase">Your Account</p>
              <div className="space-y-1">
                <p className="text-sm text-slate-900">{accountDetails.customer_name || 'Account Holder'}</p>
                <p className="text-sm text-slate-600">{accountDetails.account_number}</p>
                <p className="text-xs text-slate-500">{accountDetails.account_type}</p>
              </div>
            </div>
          )}

          {/* Recipient Details (for transfers) */}
          {recipientDetails && transaction.transaction_type === 'TRANSFER' && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase">Recipient</p>
              <div className="space-y-1">
                <p className="text-sm text-slate-900">{recipientDetails.customer_name || 'Recipient'}</p>
                <p className="text-sm text-slate-600">{recipientDetails.account_number}</p>
              </div>
            </div>
          )}

          {/* Footer Message */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Thank you for using AETHER Banking.
              <br />
              Keep this receipt for your records.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex gap-3 p-4 bg-slate-50 border-t print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ⬇️ Download
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
