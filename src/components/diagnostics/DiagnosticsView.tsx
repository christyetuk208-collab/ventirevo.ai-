import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { BusinessProblem, ProblemSeverity, ProblemCategory, ProblemStatus, DiagnosticSession } from '../../types';

export const DiagnosticsView: React.FC = () => {
  const { token, activeBusiness } = useAuth();
  const [problems, setProblems] = useState<BusinessProblem[]>([]);
  const [diagnosticSessions, setDiagnosticSessions] = useState<DiagnosticSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // 5-Whys Guided Diagnostic State
  const [diagCategory, setDiagCategory] = useState<string>('acquisition');
  const [diagSymptom, setDiagSymptom] = useState<string>('');
  const [isRunning5Whys, setIsRunning5Whys] = useState<boolean>(false);
  const [active5WhysResult, setActive5WhysResult] = useState<any>(null);

  const fetchProblems = async () => {
    if (!token || !activeBusiness) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/businesses/${activeBusiness.id}/problems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (e) {
      console.error('Error fetching problems:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [activeBusiness, token]);

  const handleRun5Whys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeBusiness || !diagSymptom.trim()) return;

    setIsRunning5Whys(true);
    try {
      const res = await fetch('/api/diagnostics/root-cause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          category: diagCategory,
          symptom: diagSymptom,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActive5WhysResult(data);
        fetchProblems();
      }
    } catch (e) {
      console.error('Error running 5-Whys Diagnostic:', e);
    } finally {
      setIsRunning5Whys(false);
    }
  };

  const handleUpdateStatus = async (problemId: string, newStatus: ProblemStatus) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      console.error('Error updating problem status:', e);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="h-4 w-4" />
            <span>Root-Cause Diagnostic Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
            5-Whys Bottleneck & Symptom Inquiry
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Identify the true systemic breakdown behind conversion drops, pricing resistance, and acquisition plateaus.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Workflow: Symptom → 5 Whys → Root Cause → High-Leverage Task</span>
        </div>
      </div>

      {/* 5-Whys Guided Diagnostic Intake */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
              Run a Guided 5-Whys Diagnostic Inquiry
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400">
            AI-Driven Root Cause Identification
          </span>
        </div>

        <form onSubmit={handleRun5Whys} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-400 font-medium mb-1.5">
                Problem Category
              </label>
              <select
                value={diagCategory}
                onChange={(e) => setDiagCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="acquisition">Acquisition & Lead Generation</option>
                <option value="sales">Sales & Deal Velocity</option>
                <option value="pricing">Offer, Value Proposition & Pricing</option>
                <option value="retention">Retention & Customer Churn</option>
                <option value="operations">Delivery & Operational Capacity</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-400 font-medium mb-1.5">
                Observed Surface Symptom *
              </label>
              <input
                type="text"
                value={diagSymptom}
                onChange={(e) => setDiagSymptom(e.target.value)}
                placeholder="e.g. Prospects ask for a demo but ghost before signing the contract proposal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isRunning5Whys || !diagSymptom.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-neutral-950 shadow-md shadow-rose-500/10 transition disabled:opacity-50"
            >
              {isRunning5Whys ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Executing 5-Whys Diagnostic Chain...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Run 5-Whys Inquiry & Prescribe Remediation</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* 5-Whys Active Result Breakdown */}
        {active5WhysResult && (
          <div className="mt-5 p-5 rounded-2xl border border-rose-800/60 bg-neutral-950/80 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800">
                5-Whys Diagnostic Complete
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Remediation Leverage Score: {active5WhysResult.session?.leverage_score || 93}/100
              </span>
            </div>

            {/* 5-Whys Chain */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-neutral-300 block">5 Sequential Whys:</span>
              <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800">
                {(active5WhysResult.session?.five_whys || []).map((why: string, idx: number) => (
                  <div key={idx} className="text-neutral-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold flex-shrink-0">#{idx + 1}</span>
                    <span>{why}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Cause & Prescribed Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" /> True Systemic Root Cause
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  {active5WhysResult.session?.root_cause}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Prescribed Highest-Leverage Fix
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  {active5WhysResult.session?.prescribed_action}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>
                Task <strong>"{active5WhysResult.task?.title}"</strong> has been automatically scheduled in your Growth Plan!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Problems Pipeline */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Bottlenecks & Problem Register ({problems.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-6 w-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Loading diagnostic register...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-neutral-800 bg-neutral-900/30 text-xs text-neutral-500">
            No unresolved bottlenecks. Run a 5-Whys diagnostic inquiry above whenever a KPI stalls.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 capitalize">
                      {p.severity} Severity
                    </span>
                    <h3 className="font-bold text-sm text-neutral-100">{p.title}</h3>
                  </div>

                  <select
                    value={p.status}
                    onChange={(e) => handleUpdateStatus(p.id, e.target.value as ProblemStatus)}
                    className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-950 text-[11px] text-neutral-300 focus:outline-none"
                  >
                    <option value="diagnosing">Diagnosing</option>
                    <option value="in_remediation">In Remediation</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {p.description || p.diagnosis}
                </p>

                {p.recommended_actions && p.recommended_actions.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 block">Prescribed Remediation:</span>
                    <p className="text-neutral-300">{p.recommended_actions[0]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
