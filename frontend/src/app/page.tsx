import Link from 'next/link';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <section className="rounded-[2rem] bg-slate-900 px-10 py-16 text-white shadow-2xl">
          <h2 className="text-4xl font-semibold">Welcome to Core Banking</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
            Build a professional banking system with customer onboarding, accounts, deposits, withdrawals, transfers, and admin workflows.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-slate-900 shadow-lg shadow-slate-800/10 transition hover:bg-slate-100">
              Login
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-white transition hover:bg-white/10">
              Dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">FastAPI Backend</h3>
            <p className="mt-3 text-slate-600">API-driven banking workflows built with Python and Oracle Cloud connectivity.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Next.js Frontend</h3>
            <p className="mt-3 text-slate-600">Reusable dashboard pages, secure login, and responsive customer management UI.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Oracle Cloud DB</h3>
            <p className="mt-3 text-slate-600">Designed for Oracle Autonomous Database with SQLAlchemy ORM and secure wallet support.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
