'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearAuth, getToken, getRole } from '../lib/auth';
import { getJson, postJson } from '../lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

type HeaderProps = {
  title?: string;
};

type UserProfile = {
  first_name: string;
  last_name: string;
};

type NotificationItem = {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  created_at: string;
};

export default function Header({ title = 'LUCE' }: HeaderProps) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState<{ qrcode: string; account_name: string; account_number: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Notification Drawer States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    setAuthToken(token);
    setUserRole(role);

    if (token) {
      getJson('/customers/me', token)
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const fetchNotifications = () => {
    const token = getToken() || authToken;
    if (token) {
      getJson('/notifications', token)
        .then((data) => {
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications every 10s
    return () => clearInterval(interval);
  }, [authToken]);

  useEffect(() => {
    async function ping() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) setBackendHealthy(true);
        else setBackendHealthy(false);
      } catch (e) {
        setBackendHealthy(false);
      }
    }
    ping();
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    setUserRole(null);
    setUser(null);
    router.push('/login');
  };

  const handleOpenQrModal = async () => {
    setShowQrModal(true);
    const token = getToken() || authToken;
    if (!qrData && token) {
      setQrLoading(true);
      try {
        const data = await getJson('/accounts/me/qrcode', token);
        setQrData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setQrLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id: number) => {
    const token = getToken() || authToken;
    if (token) {
      try {
        await postJson(`/notifications/${id}/read`, {}, token);
        fetchNotifications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = getToken() || authToken;
    if (token) {
      const unread = notifications.filter(n => n.status === 'UNREAD');
      for (const n of unread) {
        try {
          await postJson(`/notifications/${n.notification_id}/read`, {}, token);
        } catch (err) {
          console.error(err);
        }
      }
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-lg">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="group">
          <h1 className="text-lg sm:text-xl font-extrabold tracking-[0.2em] bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent group-hover:opacity-90 transition">
            {title}
          </h1>
        </Link>
      </div>

      {/* Right Controls */}
      <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium relative">
        {/* API Health Indicator (desktop only) */}
        <div className="hidden md:flex items-center gap-2 mr-2">
          <span className={`inline-block h-2 w-2 rounded-full ${backendHealthy ? 'bg-emerald-400' : backendHealthy === false ? 'bg-rose-500' : 'bg-slate-300'}`} />
          <span className="text-xs text-slate-400">{backendHealthy === null ? 'Checking API' : backendHealthy ? 'API OK' : 'API Offline'}</span>
        </div>

        {authToken ? (
          <>
            {/* Scan QR / Scanner (Mobile + Desktop) */}
            <button
              onClick={handleOpenQrModal}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition focus:outline-none shrink-0"
              aria-label="Scan QR code"
              title="Show QR Code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition focus:outline-none shrink-0"
              aria-label="Notifications"
              title="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto glass-panel rounded-2xl border border-white/10 shadow-2xl p-4 space-y-3 z-50 text-left animate-fadeIn">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Inbox Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[9px] text-purple-400 hover:text-white font-bold transition uppercase"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-4">No notifications found.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.notification_id} 
                        onClick={() => handleMarkAsRead(n.notification_id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer text-left ${n.status === 'UNREAD' ? 'bg-purple-950/20 border-purple-500/20 hover:bg-purple-950/30' : 'bg-slate-900/40 border-transparent hover:border-white/5'}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className={`text-xs font-bold ${n.status === 'UNREAD' ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                          {n.status === 'UNREAD' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{n.message}</p>
                        <p className="text-[8px] text-slate-500 mt-1 text-right font-mono">
                          {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(n.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Gear Icon Button */}
            <button
              onClick={() => alert('Settings: Configuration options are currently locked for security.')}
              className="w-8 h-8 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-all shrink-0 ml-1 sm:ml-2"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Display profile name only (initials circle replaced by gear above) */}
            <div className="hidden lg:block text-left select-none">
              <p className="text-xs font-bold text-white leading-none">
                {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{userRole?.toLowerCase()} Account</p>
            </div>

            {/* Admin Audit Logs link */}
            {userRole === 'ADMIN' && (
              <Link href="/admin/audit" className="hidden md:inline-block text-xs font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors uppercase border border-cyan-400/20 bg-cyan-950/20 px-3.5 py-2 rounded-xl">
                Audit Logs
              </Link>
            )}

            {/* Dashboard Link (desktop only) */}
            <Link href="/dashboard" className="hidden md:inline-block text-slate-300 hover:text-white transition">
              Dashboard
            </Link>

            {/* Sign Out (desktop only) */}
            <button
              onClick={handleLogout}
              className="hidden md:inline-block rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-100 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-400 hover:text-white transition px-2">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 hover:scale-[1.02] active:scale-100 transition"
            >
              Register
            </Link>
          </>
        )}
      </nav>

      {/* QR Code Glassmorphic Modal Overlay */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel max-w-sm w-full rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative text-center space-y-6">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-900/60 p-2 rounded-full border border-white/5 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="space-y-2 pt-2">
              <h3 className="text-xl font-black text-white tracking-tight">Your QR Code</h3>
              <p className="text-xs text-slate-400">Scan this code to receive peer money transfers instantly</p>
            </div>

            <div className="flex items-center justify-center bg-white p-4 rounded-3xl mx-auto w-fit shadow-lg">
              {qrLoading ? (
                <div className="h-48 w-48 flex items-center justify-center text-slate-800 font-bold text-xs">
                  Generating QR...
                </div>
              ) : qrData?.qrcode ? (
                <img src={qrData.qrcode} alt="Wallet QR Code" className="h-48 w-48 object-contain" />
              ) : (
                <div className="h-48 w-48 flex items-center justify-center text-rose-500 font-bold text-xs">
                  Error generating QR Code.
                </div>
              )}
            </div>

            {qrData && (
              <div className="space-y-1 bg-slate-900/60 p-4 rounded-2xl border border-white/5 font-mono text-center">
                <p className="text-xs font-bold text-white">{qrData.account_name}</p>
                <p className="text-[10px] text-purple-400 font-bold tracking-widest">{qrData.account_number}</p>
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">LUCE Secure QR Protocol</p>
          </div>
        </div>
      )}
    </header>
  );
}
