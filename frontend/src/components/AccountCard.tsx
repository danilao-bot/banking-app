'use client';

type AccountCardProps = {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
};

export default function AccountCard({ accountNumber, accountType, balance, currency }: AccountCardProps) {
  return (
    <div className="glass-panel-interactive relative overflow-hidden rounded-3xl p-6 border border-white/5">
      <div className="flex justify-between items-start">
        <span className="inline-block rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
          {accountType}
        </span>
        <span className="text-[10px] font-mono tracking-widest text-slate-500">ACTIVE</span>
      </div>
      <p className="mt-4 text-sm font-mono tracking-wider text-slate-300">•••• {accountNumber.slice(-4)}</p>
      <p className="mt-6 text-2xl font-extrabold text-white tracking-tight">
        <span className="text-sm font-semibold text-slate-500 mr-1">{currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency}</span>
        {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      
      {/* Decorative accent glow bubble inside the card */}
      <div className="absolute left-[-20px] bottom-[-20px] h-20 w-20 rounded-full bg-cyan-500/5 filter blur-xl" />
    </div>
  );
}

