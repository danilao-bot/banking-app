'use client';

type AccountCardProps = {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
};

export default function AccountCard({ accountNumber, accountType, balance, currency }: AccountCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{accountType}</p>
      <p className="mt-3 text-xl font-semibold text-slate-900">{accountNumber}</p>
      <p className="mt-4 text-2xl font-bold text-slate-900">{currency} {balance.toFixed(2)}</p>
    </div>
  );
}
