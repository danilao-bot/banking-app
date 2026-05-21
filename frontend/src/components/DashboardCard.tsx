'use client';

type DashboardCardProps = {
  title: string;
  value: string | number;
  children?: React.ReactNode;
};

export default function DashboardCard({ title, value, children }: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      {children ? <div className="mt-4 text-sm text-slate-600">{children}</div> : null}
    </div>
  );
}
