'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ── SVG Icon Components ── */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={active ? 0 : 1.8}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const TransferIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={active ? 0 : 1.8}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  </svg>
);

const SavingsIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={active ? 0 : 1.8}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ServicesIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={active ? 0 : 1.8}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

const SitemapIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    strokeWidth={active ? 0 : 1.8}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 6.75h12m-12 5.25h12m-12 5.25h12M3 6.75h.008v.008H3V6.75zm0 5.25h.008v.008H3V12zm0 5.25h.008v.008H3v-.008z"
    />
  </svg>
);

type Tab = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
};

const tabs: Tab[] = [
  { label: 'Home',        href: '/dashboard',     icon: (a) => <HomeIcon active={a} /> },
  { label: 'Accounts',    href: '/accounts',      icon: (a) => <SavingsIcon active={a} /> },
  { label: 'Transactions',href: '/transactions',  icon: (a) => <TransferIcon active={a} /> },
  { label: 'Services',    href: '/services',      icon: (a) => <ServicesIcon active={a} /> },
  { label: 'More',        href: '/sitemap',       icon: (a) => <SitemapIcon active={a} /> },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on public pages (landing, login, register)
  if (!pathname || ['/', '/login', '/register'].includes(pathname)) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-slate-950/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-1 py-3 gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all duration-200 active:bg-slate-800"
            >
              <span className={`${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                {tab.icon(isActive)}
              </span>
              <span
                className={`text-[11px] font-semibold tracking-tight truncate px-1 ${
                  isActive ? 'text-purple-400' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
