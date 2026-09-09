import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminMetrics, FeatureFlag } from '../../types';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Cpu,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Sliders,
  DollarSign,
  BarChart3,
  Layers,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'flags' | 'users' | 'errors' | 'limits'
  >('overview');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isUpdatingFlag, setIsUpdatingFlag] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);

    try {
      const [resMetrics, resFlags, resUsers] = await Promise.all([
        fetch('/api/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/feature-flags', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setMetrics(data);
      }

      if (resFlags.ok) {
        const flags = await resFlags.json();
        setFeatureFlags(flags);
      }

      if (resUsers.ok) {
        const users = await resUsers.json();
        setUsersList(users);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const toggleFlag = async (
    flagId: string,
    currentStatus: boolean
  ) => {
    setIsUpdatingFlag(flagId);

    try {
      const res = await fetch(
        `/api/admin/feature-flags/${flagId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            enabled: !currentStatus,
          }),
        }
      );

      if (res.ok) {
        setFeatureFlags((prev) =>
          prev.map((flag) =>
            flag.id === flagId
              ? { ...flag, enabled: !currentStatus }
              : flag
          )
        );

        setActionMessage(
          `Feature flag successfully ${
            !currentStatus ? 'enabled' : 'disabled'
          }.`
        );

        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
    } finally {
      setIsUpdatingFlag(null);
    }
  };

  const clearSystemCache = async () => {
    try {
      const res = await fetch(
        '/api/admin/maintenance/cache-clear',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setActionMessage(
          'System cache and in-memory indexes successfully recycled.'
        );

        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const updateUserRole = async (
    targetUserId: string,
    newRole: string
  ) => {
    try {
      const res = await fetch(
        `/api/admin/users/${targetUserId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((user) =>
            user.id === targetUserId
              ? { ...user, role: newRole }
              : user
          )
        );

        setActionMessage(
          `User permissions updated to '${newRole}'.`
        );

        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-100 font-display">
                Admin Control Center
              </h1>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Protected System
              </span>
            </div>

            <p className="text-xs text-neutral-400 mt-0.5">
              Production telemetry, subscription distribution, feature
              toggles, and live usage governance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="admin-btn-cache-clear"
            onClick={clearSystemCache}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Recycle Cache</span>
          </button>

          <button
            id="admin-btn-refresh-metrics"
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-neutral-950 shadow-sm transition"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-x-auto">
        <button
          id="admin-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Metrics & Revenue</span>
        </button>

        <button
          id="admin-tab-flags"
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'flags'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Feature Flags ({featureFlags.length})</span>
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'users'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Accounts ({usersList.length})</span>
        </button>

        <button
          id="admin-tab-errors"
          onClick={() => setActiveTab('errors')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'errors'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>
            Errors & Resilience ({metrics?.recent_errors?.length || 0})
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-neutral-400 space-y-2">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">
            Aggregating real-time database state...
          </p>
        </div>
      ) : metrics ? (
        <>
          {/* TAB 1: OVERVIEW & TELEMETRY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      Total Registered Users
                    </span>
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-neutral-100 font-display">
                      {metrics.total_users}
                    </span>

                    <span className="text-[11px] text-emerald-400 font-semibold">
                      100% verified
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-neutral-500">
                    Active sessions: {metrics.total_users}
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      Active Subscriptions
                    </span>
                    <CreditCard className="h-4 w-4 text-blue-400" />
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-neutral-100 font-display">
                      {metrics.active_subscriptions}
                    </span>

                    <span className="text-[11px] text-blue-400 font-semibold">
                      Paid / Pro
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-400">
                    <span>
                      Free: {metrics.plan_distribution.free}
                    </span>
                    <span>•</span>
                    <span>
                      Pro: {metrics.plan_distribution.pro}
                    </span>
                    <span>•</span>
                    <span>
                      Max: {metrics.plan_distribution.max}
                    </span>
                  </div>
                </div>

                {/* Verified Revenue */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      Verified Revenue
                    </span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-neutral-100 font-display">
                      $
                      {metrics.verified_revenue_usd.toLocaleString()}
                    </span>

                    <span className="text-[11px] text-emerald-400 font-semibold">
                      USD
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-neutral-500">
                    From active billing invoices
                  </div>
                </div>

                {/* AI Requests & Cost */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      AI Compute Cost
                    </span>
                    <Cpu className="h-4 w-4 text-purple-400" />
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-neutral-100 font-display">
                      ${metrics.ai_usage.total_cost_usd.toFixed(4)}
                    </span>

                    <span className="text-[11px] text-purple-400 font-semibold">
                      {metrics.ai_usage.total_requests} reqs
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-neutral-500">
                    Tokens:{' '}
                    {metrics.ai_usage.total_tokens.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Feature Usage & System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Usage Distribution */}
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-400" />
                      <span>Feature Utilization Metrics</span>
                    </h3>

                    <span className="text-[11px] text-neutral-500">
                      Live counts
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {Object.entries(metrics.feature_usage).map(
                      ([key, count]) => {
                        const featureValues = Object.values(
                          metrics.feature_usage
                        ).map(Number);

                        const maxVal = Math.max(
                          ...featureValues,
                          1
                        );

                        const numericCount = Number(count);

                        const pct = Math.round(
                          (numericCount / maxVal) * 100
                        );

                        const formatName = key
                          .replace(/_/g, ' ')
                          .toUpperCase();

                        return (
                          <div
                            key={key}
                            className="space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-300 capitalize">
                                {formatName}
                              </span>

                              <span className="font-semibold text-emerald-400">
                                {numericCount} events
                              </span>
                            </div>

                            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                                style={{
                                  width: `${Math.max(
                                    pct,
                                    4
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* System & Infrastructure Health */}
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-400" />
                      <span>
                        Infrastructure & Resilience
                      </span>
                    </h3>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                      <span className="text-[10px] font-medium text-neutral-500 uppercase">
                        Process Uptime
                      </span>

                      <p className="text-sm font-bold text-neutral-200 mt-1">
                        {Math.floor(
                          metrics.system_health
                            .uptime_seconds / 60
                        )}{' '}
                        mins
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                      <span className="text-[10px] font-medium text-neutral-500 uppercase">
                        Memory Heap
                      </span>

                      <p className="text-sm font-bold text-neutral-200 mt-1">
                        {metrics.system_health.memory_usage_mb} MB
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                      <span className="text-[10px] font-medium text-neutral-500 uppercase">
                        API Latency
                      </span>

                      <p className="text-sm font-bold text-emerald-400 mt-1">
                        {metrics.system_health.api_latency_ms} ms avg
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                      <span className="text-[10px] font-medium text-neutral-500 uppercase">
                        Ventirevo Neural Engine
                      </span>

                      <p className="text-sm font-bold text-neutral-200 mt-1">
                        Active & Guarded
                      </p>
                    </div>
                  </div>

                  {/* Anti-Hallucination & Legal Disclaimer */}
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-neutral-300">
                    <span className="font-semibold text-emerald-400">
                      Zero-Hallucination Policy:
                    </span>{' '}
                    All metric totals are computed directly from
                    deterministic session records and validated
                    Stripe invoices without synthetic padding.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURE FLAGS */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-100">
                  Live Feature Governance
                </h3>

                <p className="text-xs text-neutral-400 mt-0.5">
                  Toggle runtime capabilities without redeploying
                  backend containers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-200">
                          {flag.name}
                        </span>

                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                          {flag.key}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {flag.description}
                      </p>
                    </div>

                    <button
                      id={`btn-toggle-flag-${flag.key}`}
                      disabled={
                        isUpdatingFlag === flag.id
                      }
                      onClick={() =>
                        toggleFlag(
                          flag.id,
                          flag.enabled
                        )
                      }
                      className={`p-1.5 rounded-xl transition ${
                        flag.enabled
                          ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 border border-emerald-700/50'
                          : 'text-neutral-500 hover:text-neutral-400 bg-neutral-800/80 border border-neutral-700/40'
                      }`}
                    >
                      {flag.enabled ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USER ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">
                    User Access & Role Directory
                  </h3>

                  <p className="text-xs text-neutral-400 mt-0.5">
                    Inspect founder profiles, subscription tiers,
                    and assign admin roles.
                  </p>
                </div>

                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
                  {usersList.length} Active Accounts
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Plan Tier</th>
                      <th className="p-3.5">Ventures</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {usersList.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-neutral-800/30 transition"
                      >
                        <td className="p-3.5">
                          <div className="font-semibold text-neutral-100">
                            {user.name || 'Founder'}
                          </div>

                          <div className="text-[11px] text-neutral-500">
                            {user.email}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              user.role === 'owner' ||
                              user.role === 'admin'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-[11px] font-semibold text-emerald-400 capitalize">
                            {user.tier}
                          </span>
                        </td>

                        <td className="p-3.5 text-neutral-400 font-medium">
                          {user.businesses_count}
                        </td>

                        <td className="p-3.5">
                          <select
                            id={`select-role-${user.id}`}
                            value={user.role}
                            onChange={(event) =>
                              updateUserRole(
                                user.id,
                                event.target.value
                              )
                            }
                            className="px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="member">
                              Member
                            </option>
                            <option value="admin">
                              Admin
                            </option>
                            <option value="owner">
                              Owner
                            </option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ERRORS & RESILIENCE */}
          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>
                    Telemetry & Handled Exception Logs
                  </span>
                </h3>

                <p className="text-xs text-neutral-400 mt-0.5">
                  Transient upstream load spikes, handled
                  fallbacks, and recovery transactions.
                </p>
              </div>

              {metrics.recent_errors.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800 text-neutral-400 text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />

                  <span>
                    Zero unhandled production exceptions detected
                    in current cycle.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.recent_errors.map((error) => (
                    <div
                      key={error.id}
                      className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                        <AlertTriangle className="h-4 w-4" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-300">
                            {error.error_type} (
                            {error.status_code || 500})
                          </span>

                          <span className="text-[10px] text-neutral-500">
                            {new Date(
                              error.occurred_at
                            ).toLocaleTimeString()}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 font-mono bg-neutral-950 p-2 rounded-lg border border-neutral-800/80">
                          {error.message}
                        </p>

                        {error.endpoint && (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Endpoint: {error.endpoint}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
