'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

export default function Home() {
  // Transfer Preview Simulator State
  const [transferAmount, setTransferAmount] = useState(50000);
  const fee = transferAmount > 10000 ? 50 : 0; // Simulated fee: 0 for < 10000, 50 for > 10000
  const cashback = Math.floor(transferAmount * 0.005); // 0.5% cashback on all transfers

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Pulse Glows */}
      <div className="glow-circle bg-purple-600 w-[40vw] h-[40vw] left-[-10vw] top-[-10vw]" />
      <div className="glow-circle bg-indigo-500 w-[35vw] h-[35vw] right-[-5vw] top-[10vw]" />
      <div className="glow-circle bg-cyan-500 w-[30vw] h-[30vw] left-[20vw] bottom-[-5vw]" />

      <div className="relative z-10">
        <Header title="AETHER" />
        
        <main className="mx-auto flex max-w-7xl flex-col gap-24 px-6 py-20">
          
          {/* HERO SECTION */}
          <section className="flex flex-col lg:flex-row items-center gap-16 py-8">
            <div className="flex-1 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                The Super App for Your Money
              </div>
              <h2 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                Your Ultimate <br />
                <span className="text-glow-gradient">Digital Wallet</span>
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-slate-400">
                Pay, send, and save instantly. Experience Aether's premium glassmorphic portal designed to make managing your daily finances faster, cheaper, and more rewarding.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/register" className="glow-btn inline-flex items-center justify-center rounded-2xl px-8 py-4 text-sm font-bold tracking-wide transition shadow-lg shadow-purple-500/20">
                  Open Free Account
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 py-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/80 hover:border-slate-700 hover:text-white">
                  Sign In
                </Link>
                <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md px-8 py-4 text-sm font-semibold text-purple-300 transition hover:bg-purple-900/30 hover:border-purple-400">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Mobile Wallet Interface Mockup */}
            <div className="flex-1 w-full max-w-sm animate-float lg:max-w-md">
              <div className="glass-panel relative overflow-hidden rounded-[3rem] p-6 border border-white/10 shadow-2xl">
                {/* Status Bar Mock */}
                <div className="flex justify-between items-center mb-8 px-2">
                  <span className="text-xs font-semibold">9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-3 border border-white rounded-[2px] flex items-center p-[1px]"><div className="w-full h-full bg-white rounded-sm" /></div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="text-center space-y-2 mb-10">
                  <p className="text-xs font-medium text-slate-400">Total Balance</p>
                  <p className="text-4xl font-extrabold text-white tracking-tight">₦450,890<span className="text-xl text-slate-500">.00</span></p>
                  <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium mt-2">
                    <span>+ ₦12,500</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Send", icon: "M12 4v16m8-8H4" },
                    { label: "Receive", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
                    { label: "Airtime", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
                    { label: "Pay Bills", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                  ].map((action, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <div className="h-14 w-14 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-200">{action.label}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Transaction */}
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">N</div>
                      <div>
                        <p className="text-sm font-semibold">Netflix Subscription</p>
                        <p className="text-[10px] text-slate-400">Today, 2:30 PM</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">-₦4,500</p>
                  </div>
                </div>

                {/* Reflective shine element */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              </div>
            </div>
          </section>

          {/* DYNAMIC TRANSFER PREVIEW SIMULATOR */}
          <section className="space-y-12 py-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h3 className="text-3xl font-bold sm:text-4xl text-white">Transfer & Rewards Simulator</h3>
              <p className="text-slate-400">Experience zero hidden charges and earn cashback on your daily transactions. See exactly what you send and what you get back.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              
              {/* Simulator Controls */}
              <div className="glass-panel rounded-3xl p-8 space-y-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-400">How much are you sending?</span>
                    <span className="text-cyan-400 font-bold text-lg">₦{transferAmount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="500000" 
                    step="1000"
                    value={transferAmount} 
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-2">
                    <span>₦1,000</span>
                    <span>₦250,000</span>
                    <span>₦500,000</span>
                  </div>
                </div>
              </div>

              {/* Projections Card */}
              <div className="glass-panel rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden border border-purple-500/20">
                <div className="space-y-8 relative z-10">
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-sm font-medium text-slate-400">Recipient Gets</span>
                    <span className="text-2xl font-bold text-white">₦{transferAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-sm font-medium text-slate-400">Transfer Fee</span>
                    <span className={`text-lg font-bold ${fee === 0 ? 'text-green-400' : 'text-slate-300'}`}>
                      {fee === 0 ? 'FREE' : `₦${fee}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-purple-300">Your Cashback</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white animate-bounce">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-purple-400">+₦{cashback.toLocaleString()}</span>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* RETAIL FEATURES SECTION GRID */}
          <section className="space-y-12 py-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="glass-panel-interactive rounded-3xl p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">Instant Transfers</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Send money to anyone, anywhere, in seconds. Experience lightning-fast transactions with zero delays.
                </p>
              </div>

              <div className="glass-panel-interactive rounded-3xl p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">Zero-Fee Bills</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Pay your utility bills, buy airtime, and top-up data effortlessly without worrying about hidden charges.
                </p>
              </div>

              <div className="glass-panel-interactive rounded-3xl p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">Bank-Grade Security</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your funds and personal data are protected by industry-leading encryption and biometric access controls.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
