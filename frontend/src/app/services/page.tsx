'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

const SERVICES = [
  {
    id: 'airtime',
    name: 'Airtime Recharge',
    description: 'Instant mobile credit top-up with zero service charge.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-950/15',
    path: '/services/airtime',
  },
  {
    id: 'data',
    name: 'Data Bundle',
    description: 'Super-fast internet data subscriptions across all major networks.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.25h.008v.008H12v-.008z" />
      </svg>
    ),
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-950/15',
    path: '/services/data',
  },
  {
    id: 'electricity',
    name: 'Electricity Bills',
    description: 'Pay pre-paid and post-paid meter bills for all major DisCos.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-950/15',
    path: '/services/electricity',
  },
  {
    id: 'tv',
    name: 'TV & Cable',
    description: 'Renew your DSTV, GOtv, or StarTimes cable subscriptions instantly.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/15',
    path: '/services/tv',
  },
  {
    id: 'betting',
    name: 'Sports Betting',
    description: 'Fund your online sport betting accounts instantly and securely.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.672c-.99 0-1.928-.228-2.77-.672" />
      </svg>
    ),
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-950/15',
    path: '/services/betting',
  },
  {
    id: 'education',
    name: 'Education Bills',
    description: 'Purchase JAMB pin cards, WAEC scratch cards and pay tuition fees.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-950/15',
    path: '/services/education',
  },
  {
    id: 'internet',
    name: 'Internet Subscriptions',
    description: 'Pay for Spectranet, Smile, Swift or fiber-to-the-home routers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    color: 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:border-teal-500/40 hover:bg-teal-950/15',
    path: '/services/internet',
  },
];

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-indigo-600/10 w-[45vw] h-[45vw] left-[-15vw] top-[-15vw]" />
      <div className="glow-circle bg-purple-600/10 w-[40vw] h-[40vw] right-[-5vw] top-[5vw]" />
      <div className="glow-circle bg-cyan-600/10 w-[35vw] h-[35vw] left-[15vw] bottom-[-10vw]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
            <div className="mb-8 max-w-5xl mx-auto md:mx-0">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Utility Services</h1>
              <p className="mt-2 text-slate-400 text-sm">Pay bills, purchase airtime, data and recharge utilities instantly from your Aether wallets.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto md:mx-0">
              {SERVICES.map((srv) => (
                <Link
                  key={srv.id}
                  href={srv.path}
                  className={`glass-panel rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${srv.color}`}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0 transition duration-300 group-hover:scale-110">
                      {srv.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider">{srv.name}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{srv.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400 group-hover:text-white transition">
                    Access Service
                    <svg className="w-4 h-4 transition duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
