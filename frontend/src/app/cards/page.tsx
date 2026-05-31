'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getToken } from '../../lib/auth';
import { getJson, postJson } from '../../lib/api';

type Account = {
  account_id: number;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
};

type Card = {
  card_id: number;
  customer_id: number;
  account_id: number;
  card_number: string;
  card_type: string;
  expiry_date: string;
  status: string;
  cvv?: string;
};

export default function CardsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedCardType, setSelectedCardType] = useState<string>('VIRTUAL');
  
  const [revealDetails, setRevealDetails] = useState<{ [cardId: number]: boolean }>({});
  const [message, setMessage] = useState('Loading cards...');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function loadCardData() {
      try {
        setLoading(true);
        // Load cards
        const userCards = await getJson('/cards/me', token);
        setCards(userCards);

        // Load accounts to issue new cards
        const userAccounts = await getJson('/accounts/me', token);
        setAccounts(userAccounts);
        if (userAccounts.length > 0) {
          setSelectedAccountId(userAccounts[0].account_id);
        }
        setMessage('');
      } catch (err) {
        setMessage('Unable to load card information.');
      } finally {
        setLoading(false);
      }
    }

    loadCardData();
  }, []);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      setMessage('Select an account to bind to this card.');
      return;
    }
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setMessage('Issuing card, establishing security hash...');
    try {
      const payload = {
        account_id: selectedAccountId,
        card_type: selectedCardType,
      };
      const newCard = await postJson('/cards/', payload, token);
      setCards([...cards, newCard]);
      setMessage('New card issued successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Unable to issue card.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReveal = (cardId: number) => {
    setRevealDetails((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const maskCardNumber = (num: string, revealed: boolean) => {
    if (revealed) {
      return num.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    }
    return '•••• •••• •••• ' + num.slice(-4);
  };

  const getCardBrandIcon = (num: string) => {
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    return 'Verve';
  };

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
          
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="mb-8 max-w-5xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Virtual Cards</h1>
              <p className="mt-2 text-slate-400 text-sm">Issue and manage secure co-branded virtual cards for online shopping.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] max-w-5xl mx-auto">
              {/* Left Column: Shimmering Card Showcase & Action */}
              <div className="space-y-8">
                {loading ? (
                  <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
                    Querying secure card keys...
                  </div>
                ) : cards.length === 0 ? (
                  <div className="glass-panel rounded-[2rem] p-12 text-center space-y-4 border border-white/5 bg-slate-900/40">
                    <span className="text-slate-400">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </span>
                    <h3 className="text-lg font-bold text-white">No active virtual cards</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Generate your co-branded card instantly. No paper, zero activation fee, secured with bank-grade encryption.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Your Cards</h3>
                    
                    {cards.map((card) => {
                      const revealed = !!revealDetails[card.card_id];
                      return (
                        <div 
                          key={card.card_id}
                          className="relative group overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl transition duration-300 hover:shadow-indigo-500/10 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900"
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                          
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400">{card.card_type} CARD</span>
                              <h2 className="text-sm font-black tracking-widest text-white mt-1">AETHER WALLET</h2>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                              {getCardBrandIcon(card.card_number)}
                            </span>
                          </div>

                          {/* Card Chip & Wi-Fi Icon */}
                          <div className="flex justify-between items-center mb-8">
                            <div className="w-11 h-8 rounded bg-gradient-to-br from-amber-300 to-amber-600 border border-yellow-300/20" />
                            <span className="text-slate-500">
                              <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 12h.01" /></svg>
                            </span>
                          </div>

                          {/* Masked Card Number */}
                          <div className="mb-6">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Card Number</p>
                            <p className="text-xl font-mono font-bold tracking-[0.25em] text-slate-200">
                              {maskCardNumber(card.card_number, revealed)}
                            </p>
                          </div>

                          {/* Expiry & CVV */}
                          <div className="flex justify-between items-end">
                            <div className="flex gap-8">
                              <div>
                                <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Expiry</p>
                                <p className="text-xs font-semibold text-slate-200 mt-1">
                                  {new Date(card.expiry_date).toLocaleDateString(undefined, {month: '2-digit', year: '2-digit'})}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">CVV</p>
                                <p className="text-xs font-semibold text-slate-200 mt-1">
                                  {revealed ? (card.cvv || '•••') : '•••'}
                                </p>
                              </div>
                            </div>

                            <button 
                              onClick={() => toggleReveal(card.card_id)}
                              className="inline-flex items-center px-3.5 py-1.5 rounded-xl border border-white/10 bg-slate-900/60 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-900 hover:scale-105 active:scale-100 transition focus:outline-none"
                            >
                              {revealed ? (
                                <><svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>Mask</>
                              ) : (
                                <><svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Reveal Details</>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Virtual Card Self-Issuance Form */}
              <section className="glass-panel rounded-[2rem] p-6 border border-white/5 space-y-6 h-fit bg-slate-900/40">
                <div className="border-b border-white/5 pb-4">
                  <h2 className="text-lg font-black text-white tracking-tight">Issue New Card</h2>
                  <p className="text-xs text-slate-400 mt-1">Create customized Mastercard/Visa instantly.</p>
                </div>

                <form onSubmit={handleIssueCard} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bind to Wallet Account
                      <select
                        value={selectedAccountId ?? ''}
                        onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                        className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                      >
                        {accounts.map((account) => (
                          <option key={account.account_id} value={account.account_id} className="bg-slate-950 text-slate-200">
                            {account.account_type} • {account.account_number} (₦{account.balance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Card Provider Type
                      <select
                        value={selectedCardType}
                        onChange={(e) => setSelectedCardType(e.target.value)}
                        className="input-glass mt-2 w-full rounded-2xl p-3.5 text-sm"
                      >
                        <option value="VIRTUAL" className="bg-slate-950 text-slate-200">Mastercard (Virtual)</option>
                        <option value="DEBIT" className="bg-slate-950 text-slate-200">Visa Debit (Physical Mockup)</option>
                      </select>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || accounts.length === 0}
                      className="glow-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                    >
                      {submitting ? 'Generating...' : 'Instant Issuance (Free)'}
                    </button>
                  </div>
                </form>

                {message ? (
                  <div className={`p-3 rounded-xl text-center text-xs font-medium ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-950/60 text-slate-300 border border-white/5'}`}>
                    {message}
                  </div>
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
