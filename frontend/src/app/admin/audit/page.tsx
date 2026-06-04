'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import BottomNav from '../../../components/BottomNav';
import { getToken, getRole } from '../../../lib/auth';
import { getJson } from '../../../lib/api';

type AuditLog = {
  audit_id: number;
  user_id: number;
  action: string;
  entity: string;
  entity_id: number | null;
  description: string | null;
  created_at: string;
};

export default function AdminAuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token || role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    async function loadAuditLogs() {
      try {
        setLoading(true);
        const data = await getJson('/audit/', token);
        if (Array.isArray(data)) {
          setLogs(data);
          setFilteredLogs(data);
        }
        setError('');
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch security audit logs.');
      } finally {
        setLoading(false);
      }
    }

    loadAuditLogs();
  }, []);

  // Filter logs dynamically
  useEffect(() => {
    let result = logs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.description?.toLowerCase().includes(term) ||
          String(log.user_id).includes(term) ||
          String(log.entity_id).includes(term)
      );
    }

    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (entityFilter) {
      result = result.filter((log) => log.entity === entityFilter);
    }

    setFilteredLogs(result);
  }, [searchTerm, actionFilter, entityFilter, logs]);

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueEntities = Array.from(new Set(logs.map((l) => l.entity)));

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
          
          <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Heading */}
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  Security Audit Logs
                </h1>
                <p className="mt-2 text-slate-400 text-sm">System transaction trail and security monitoring ledger.</p>
              </div>

              {loading ? (
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                  <p className="text-sm text-slate-400">Loading audit ledger...</p>
                </div>
              ) : error ? (
                <div className="glass-panel mx-auto max-w-xl rounded-3xl p-8 border border-red-500/20 text-center">
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                  <button onClick={() => window.location.reload()} className="glow-btn px-6 py-2 rounded-xl text-xs font-bold uppercase">Retry</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filters Board */}
                  <div className="glass-panel rounded-3xl p-6 border border-white/5 grid gap-4 md:grid-cols-3">
                    {/* Search */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Search Logs</label>
                      <input
                        type="text"
                        placeholder="Search description, user ID, entity ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-glass w-full rounded-xl py-2 px-3 text-xs"
                      />
                    </div>

                    {/* Action Filter */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Filter Action</label>
                      <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="input-glass w-full rounded-xl py-2 px-3 text-xs bg-slate-950"
                      >
                        <option value="">All Actions</option>
                        {uniqueActions.map((act) => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>

                    {/* Entity Filter */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Filter Entity</label>
                      <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="input-glass w-full rounded-xl py-2 px-3 text-xs bg-slate-950"
                      >
                        <option value="">All Entities</option>
                        {uniqueEntities.map((ent) => (
                          <option key={ent} value={ent}>{ent}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table Panel */}
                  <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-slate-900/40 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            <th className="p-4">Audit ID</th>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">User ID</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Entity type</th>
                            <th className="p-4">Entity ID</th>
                            <th className="p-4">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredLogs.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-500">
                                No security logs found matching the filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log) => (
                              <tr key={log.audit_id} className="hover:bg-slate-900/20 transition-colors">
                                <td className="p-4 font-mono font-bold text-slate-400">#{log.audit_id}</td>
                                <td className="p-4 text-slate-300">
                                  {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                                </td>
                                <td className="p-4 font-mono font-bold text-indigo-300">User_{log.user_id}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                    log.action.includes('LOGIN') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' :
                                    log.action.includes('REGISTER') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25' :
                                    log.action.includes('TRANSFER') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' :
                                    log.action.includes('WITHDRAW') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' :
                                    log.action.includes('DEPOSIT') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                                    'bg-slate-500/10 text-slate-400 border border-white/5'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-400 capitalize">{log.entity}</td>
                                <td className="p-4 font-mono text-slate-400">{log.entity_id ?? '-'}</td>
                                <td className="p-4 text-slate-200">{log.description ?? '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
        
        <BottomNav />
      </div>
    </div>
  );
}
