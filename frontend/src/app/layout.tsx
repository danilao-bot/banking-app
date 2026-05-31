import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '../components/SidebarContext';
import BottomNav from '../components/BottomNav';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Core Banking System',
  description: 'Banking dashboard with authenticated customer and account management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 pb-[calc(env(safe-area-inset-bottom)+76px)] md:pb-0">
        <SidebarProvider>
          {children}
          <BottomNav />
        </SidebarProvider>
      </body>
    </html>
  );
}


