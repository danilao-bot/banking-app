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

const CardsIcon = ({ active }: { active: boolean }) => (
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
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
    />
  </svg>
);

const FinanceIcon = ({ active }: { active: boolean }) => (
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
      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
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
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

type Tab = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
};

const tabs: Tab[] = [
  { label: 'Home',    href: '/dashboard', icon: (a) => <HomeIcon active={a} /> },
  { label: 'Cards',   href: '/cards',     icon: (a) => <CardsIcon active={a} /> },
  { label: 'Finance', href: '/loans',     icon: (a) => <FinanceIcon active={a} /> },
  { label: 'Me',      href: '/dashboard', icon: (a) => <UserIcon active={a} /> },
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
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          /* For the "Me" tab, use a special check so it doesn't conflict with Home */
          const isActive =
            tab.label === 'Me'
              ? false /* Me tab has no unique route yet */
              : pathname === tab.href ||
                (tab.href !== '/dashboard' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-colors duration-200"
            >
              <span className={isActive ? 'text-purple-400' : 'text-slate-500'}>
                {tab.icon(isActive)}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
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
