import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Shield,
  User,
  Cpu,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
  CreditCard,
  Lock,
} from 'lucide-react';
import { AuditLog } from '../../types';

export const SettingsView: React.FC = () => {
  const { user, token, deleteAccount } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch('/api/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (e) {
        console.error('Error fetching audit logs:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [token]);

  const handleExportData = () => {
    if (!token) return;
    window.open('/api/auth/export-data', '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="border-b border-neutral-800/80 pb-5">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
            Account & System Telemetry
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Security controls, audit logs, subscription tier, and exportable business data.
        </p>
      </div>

      {/* Account Info & Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-400" /> Founder Identity
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 uppercase">
              {user?.role || 'owner'}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm text-neutral-100">{user?.name}</h3>
            <p className="text-xs text-neutral-400">{user?.email}</p>
          </div>

          <div className="pt-2 border-t border-neutral-800/60 text-xs text-neutral-400 flex items-center justify-between">
            <span>Authentication Type</span>
            <span className="text-neutral-200 font-semibold">Encrypted Session</span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> Subscription Tier
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Founder Pro
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm text-neutral-100">Enterprise AI Strategist Core</h3>
            <p className="text-xs text-neutral-400">Unlimited sessions with Ventirevo High-Intelligence Reasoning Core</p>
          </div>

          <div className="pt-2 border-t border-neutral-800/60 text-xs text-neutral-400 flex items-center justify-between">
            <span>Monthly AI Strategy Quota</span>
            <span className="text-emerald-400 font-bold">Active & Unlimited</span>
          </div>
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              System Audit Trail & Access Logs
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400">Security Logging</span>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {logs.map((l) => (
            <div
              key={l.id}
              className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-neutral-200 capitalize">
                    {l.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-neutral-500 text-[10px] ml-2">
                    {l.resource_type}: {l.resource_id || 'system'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500">
                {new Date(l.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {logs.length === 0 && !loading && (
            <p className="text-center py-6 text-xs text-neutral-500">No logs recorded yet.</p>
          )}
        </div>
      </div>

      {/* Data Export & Account Deletion */}
      <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-emerald-400" /> Data Governance & Account Security
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h4 className="text-xs font-bold text-neutral-200">Download Complete Business Profile & Memory Data</h4>
            <p className="text-[11px] text-neutral-400">Export a JSON file containing all strategic recommendations, memory records, and tasks.</p>
          </div>
          <button
            onClick={handleExportData}
            className="py-2 px-3 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-850 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Data</span>
          </button>
        </div>

        <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-rose-400">Permanently Delete Account & Ventures</h4>
            <p className="text-[11px] text-neutral-400">Irreversibly wipe all businesses, conversations, memory banks, and tasks.</p>
          </div>

          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="py-1.5 px-3 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Delete Everything
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="py-2 px-3 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
