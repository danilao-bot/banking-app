'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

const SITEMAP_GROUPS = [
  {
    title: 'Public Portal',
    color: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
    routes: [
      { path: '/', label: 'Home Page', desc: 'Promotional landing and savings simulator.' },
      { path: '/login', label: 'Sign In', desc: 'Secure login access using email and password.' },
      { path: '/register', label: 'Sign Up', desc: 'Instant registration with automatic ₦500,000 wallet funding.' },
    ]
  },
  {
    title: 'Core Wallet & Transactions',
    color: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
    routes: [
      { path: '/dashboard', label: 'Wallet Dashboard', desc: 'View balances, copy NUBAN, quick actions, and recent activities.' },
      { path: '/deposit', label: 'Fund Wallet', desc: 'Deposit funds instantly into your savings or current accounts.' },
      { path: '/withdrawal', label: 'Cash Out / Withdraw', desc: 'Withdraw money securely to external accounts.' },
      { path: '/transfer', label: 'Peer Transfer', desc: 'Send NGN/USD to anyone using NUBAN lookup & get downloadable receipts.' },
      { path: '/transactions', label: 'Transaction Logs', desc: 'Complete history with filtering, search, and date pickers.' },
    ]
  },
  {
    title: 'Wealth & Asset Growth',
    color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
    routes: [
      { path: '/savings', label: 'Savings Goals', desc: 'Lock funds in target wallets with dynamic completion progress bars.' },
      { path: '/fixed-deposit', label: 'Fixed Deposits', desc: 'Guaranteed high-yield investment lock-ins (3, 6, 12 months).' },
      { path: '/loans', label: 'Quick Loans', desc: 'Apply for quick credits with approval tracking dashboard.' },
      { path: '/cards', label: 'My Cards', desc: 'Create virtual co-branded debit/credit cards with live CVV hiding.' },
    ]
  },
  {
    title: 'Utility Services',
    color: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
    routes: [
      { path: '/services', label: 'Services Hub', desc: 'Central directory for all bills and network recharges.' },
      { path: '/services/airtime', label: 'Mobile Airtime', desc: 'Instant top-up for MTN, Airtel, Glo, and 9mobile.' },
      { path: '/services/data', label: 'Data Bundles', desc: 'Network data subscriptions with zero service charge.' },
      { path: '/services/electricity', label: 'Electricity Bills', desc: 'Prepaid/Postpaid utility payments with instant token codes.' },
      { path: '/services/tv', label: 'TV & Cable', desc: 'DSTV, GOtv, and StarTimes subscription renewals.' },
      { path: '/services/betting', label: 'Betting Wallet', desc: 'Fund betting accounts (SportyBet, Bet9ja, etc.) instantly.' },
      { path: '/services/education', label: 'Education PINs', desc: 'JAMB, WAEC, and NECO result checkers and registration PINs.' },
      { path: '/services/internet', label: 'Broadband Router', desc: 'Spectranet, Smile, or Swift router broadband subscription renewal.' },
    ]
  }
];

export default function SitemapPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-indigo-600/10 w-[40vw] h-[40vw] left-[-10vw] top-[-10vw]" />
      <div className="glow-circle bg-purple-600/10 w-[35vw] h-[35vw] right-[-5vw] top-[10vw]" />
      <div className="glow-circle bg-cyan-600/10 w-[30vw] h-[30vw] left-[20vw] bottom-[-5vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8 max-w-5xl w-full mx-auto md:mx-0">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Sitemap Directory</h1>
              <p className="mt-2 text-slate-400 text-sm">Full map of the LUCE Core Banking platform directories and services.</p>
            </div>

            <div className="space-y-8">
              {SITEMAP_GROUPS.map((group, groupIdx) => (
                <section key={groupIdx} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${group.color}`}>
                      {group.title}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.routes.map((route, routeIdx) => (
                      <Link
                        key={routeIdx}
                        href={route.path}
                        className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition flex flex-col justify-between group"
                      >
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-white tracking-wider uppercase group-hover:text-purple-400 transition">
                            {route.label}
                          </h3>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {route.desc}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-4 select-all block bg-slate-950/60 p-2 rounded border border-white/5">
                          {route.path}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
