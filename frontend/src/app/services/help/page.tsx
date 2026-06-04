'use client';

import { useEffect, useState } from 'react';
import { getToken } from '../../../lib/auth';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import BottomNav from '../../../components/BottomNav';
import Link from 'next/link';

type HelpCategory = {
  title: string;
  icon: string;
  items: { question: string; answer: string }[];
};

const helpCategories: HelpCategory[] = [
  {
    title: 'Getting Started',
    icon: '🚀',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Simply visit our registration page and provide your email, password, first name, and last name. You\'ll receive a welcome bonus of 500,000 NGN to get started!',
      },
      {
        question: 'How do I verify my account?',
        answer: 'Your account is automatically verified upon registration. No additional steps are needed to start using LUCE.',,
      },
    ],
  },
  {
    title: 'Transfers & Payments',
    icon: '💸',
    items: [
      {
        question: 'How do I send money?',
        answer: 'Go to the Transfer section from your dashboard. Enter the recipient\'s account number, amount, and description. Review and confirm the transfer.',
      },
      {
        question: 'What is a transfer fee?',
        answer: 'LUCE offers free transfers between accounts. Some third-party services may have their own fees.',,
      },
      {
        question: 'How long does a transfer take?',
        answer: 'Transfers are processed instantly. You\'ll receive a receipt immediately upon completion.',
      },
      {
        question: 'Can I cancel a transfer?',
        answer: 'Transfers cannot be cancelled after completion. Please verify all details before confirming.',
      },
    ],
  },
  {
    title: 'Cards & Payments',
    icon: '💳',
    items: [
      {
        question: 'How do I order a card?',
        answer: 'Visit the "My Cards" section and click "Order New Card". Select your card type and delivery address.',
      },
      {
        question: 'What card types are available?',
        answer: 'We offer Debit Cards (instant access) and Virtual Cards (for online purchases).',
      },
      {
        question: 'How do I activate my card?',
        answer: 'Cards are automatically activated upon issuance. You can start using them immediately.',
      },
    ],
  },
  {
    title: 'Loans',
    icon: '🏦',
    items: [
      {
        question: 'How do I apply for a loan?',
        answer: 'Visit the "Quick Loans" section. Complete the application, verify your employment, and get instant approval.',
      },
      {
        question: 'What\'s the loan approval time?',
        answer: 'Most applications are approved within minutes. Funds are disbursed directly to your LUCE account.',,
      },
      {
        question: 'What are the interest rates?',
        answer: 'Interest rates vary based on your profile. You\'ll see the exact rate before confirming your loan.',
      },
    ],
  },
  {
    title: 'Services',
    icon: '📱',
    items: [
      {
        question: 'Can I buy airtime?',
        answer: 'Yes! Visit Services > Airtime, select your provider and amount, and we\'ll deliver it instantly.',
      },
      {
        question: 'Do you offer bill payments?',
        answer: 'Yes, we support electricity, water, internet, TV subscriptions, education fees, and more.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'All LUCE account funds can be used for bill payments and services.',,
      },
    ],
  },
  {
    title: 'Account Security',
    icon: '🔒',
    items: [
      {
        question: 'Is my account safe?',
        answer: 'Yes! LUCE uses bank-level encryption and security measures to protect your account.',,
      },
      {
        question: 'What should I do if I forget my password?',
        answer: 'Click "Forgot Password" on the login page and follow the recovery steps sent to your email.',
      },
      {
        question: 'Can I enable two-factor authentication?',
        answer: 'We recommend enabling 2FA in your account settings for added security.',
      },
    ],
  },
];

export default function HelpPage() {
  const [openCategory, setOpenCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const token = getToken();

  const filteredCategories = helpCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Help & Support" />

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 sm:p-6">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-4">
              {filteredCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50 hover:bg-slate-900/70 transition"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => setOpenCategory(openCategory === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-900 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                    </div>
                    <span
                      className={`transform transition-transform ${
                        openCategory === idx ? 'rotate-90' : ''
                      } text-purple-400`}
                    >
                      ▶
                    </span>
                  </button>

                  {/* Category Items */}
                  {openCategory === idx && category.items.length > 0 && (
                    <div className="border-t border-slate-800 divide-y divide-slate-800">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="p-4 hover:bg-slate-900/30 transition">
                          <p className="font-semibold text-white mb-2">{item.question}</p>
                          <p className="text-slate-300 text-sm">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {openCategory === idx && category.items.length === 0 && (
                    <div className="p-4 text-slate-500 text-sm italic">
                      No matching questions in this category.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Can't find an answer?</h3>
              <p className="text-slate-300 mb-4">
                Our support team is available 24/7 to help you with any questions or issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@luce.bank"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-center"
                >
                  📧 Email Support
                </a>
                <a
                  href="tel:+1234567890"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-center"
                >
                  📞 Call Us
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500 transition text-center"
              >
                <p className="text-2xl mb-2">📊</p>
                <p className="font-semibold text-white">Back to Dashboard</p>
              </Link>
              <Link
                href="/transactions"
                className="p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500 transition text-center"
              >
                <p className="text-2xl mb-2">📋</p>
                <p className="font-semibold text-white">View Transactions</p>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
