'use client';

import Link from 'next/link';

type SidebarLink = {
  label: string;
  href: string;
};

const links: SidebarLink[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/customers' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Deposit', href: '/deposit' },
  { label: 'Withdrawal', href: '/withdrawal' },
  { label: 'Transfer', href: '/transfer' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen border-r border-slate-200 bg-slate-50 p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
      </div>
      <ul className="space-y-3 text-sm text-slate-700">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block rounded-lg px-3 py-2 transition hover:bg-slate-200">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
