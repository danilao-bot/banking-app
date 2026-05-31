'use client';

type DashboardCardProps = {
  title: string;
  value: string | number;
  children?: React.ReactNode;
};

export default function DashboardCard({ title, value, children }: DashboardCardProps) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl p-6 border border-white/5">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-extrabold text-white tracking-tight">{value}</p>
      {children ? <div className="mt-4 text-xs leading-relaxed text-slate-400">{children}</div> : null}
      
      {/* Decorative accent glow bubble inside the card */}
      <div className="absolute right-[-20px] bottom-[-20px] h-24 w-24 rounded-full bg-indigo-500/5 filter blur-xl" />
    </div>
  );
}

