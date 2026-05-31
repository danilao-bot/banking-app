'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';

type SidebarLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

/* ── SVG Icon Components ── */
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h5.25A2.25 2.25 0 0121 6v6zm0 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6" />
  </svg>
);

const TransferIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

const LoanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DepositIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
  </svg>
);

const WithdrawalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
  </svg>
);

const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const links: SidebarLink[] = [
  { label: 'Wallet',       href: '/dashboard',    icon: <WalletIcon /> },
  { label: 'Transfer',     href: '/transfer',     icon: <TransferIcon /> },
  { label: 'My Cards',     href: '/cards',        icon: <CardIcon /> },
  { label: 'Quick Loans',  href: '/loans',        icon: <LoanIcon /> },
  { label: 'Transactions', href: '/transactions', icon: <HistoryIcon /> },
  { label: 'Deposit',      href: '/deposit',      icon: <DepositIcon /> },
  { label: 'Withdrawal',   href: '/withdrawal',   icon: <WithdrawalIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <aside
      className="hidden md:flex h-full w-72 flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-xl"
    >
      {/* ── Header ── */}
      <div className="flex items-center px-6 pt-6 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Navigation</h2>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1 text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200
                    ${isActive
                      ? 'bg-purple-500/15 text-white border border-purple-500/20 shadow-lg shadow-purple-500/5'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <span className={`transition duration-200 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                    {link.icon}
                  </span>
                  <span className="tracking-wide">{link.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Sticky Footer ── */}
      <div className="border-t border-white/5 px-4 py-4 space-y-1">
        <button
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-slate-900/60 hover:text-white border border-transparent"
        >
          <span className="text-slate-500 group-hover:text-cyan-400 transition duration-200">
            <HelpIcon />
          </span>
          <span className="tracking-wide">Help & Support</span>
        </button>

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20"
        >
          <span className="text-slate-500 group-hover:text-rose-400 transition duration-200">
            <LogoutIcon />
          </span>
          <span className="tracking-wide">Sign Out</span>
        </button>

        {/* App version */}
        <div className="pt-3 pb-1 px-4">
          <p className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase">Aether Wallet v1.0</p>
        </div>
      </div>
    </aside>
  );
}
