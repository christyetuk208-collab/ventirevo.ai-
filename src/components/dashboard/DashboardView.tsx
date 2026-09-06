import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveView } from '../../types';
import {
  Target,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  Layers,
  Brain,
  ShieldCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: ActiveView, contextPayload?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, token, activeBusiness } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    if (!token || !activeBusiness) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/businesses/${activeBusiness.id}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeBusiness, token]);

  const handleCompleteTask = async (taskId: string) => {
    if (!token) return;
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'done' }),
      });
      fetchDashboard();
    } catch (e) {
      console.error('Error completing task:', e);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400 font-medium">Loading evidence-driven business metrics...</p>
        </div>
      </div>
    );
  }

  const {
    main_goal,
    highest_priority_problem,
    current_opportunity,
    recommended_next_action,
    active_growth_plan,
    task_progress,
    memory_count,
    verified_facts_count,
    recent_activity,
  } = data || {};

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
              {activeBusiness?.name} Growth Dashboard
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {activeBusiness?.stage.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time business telemetry, verified memory constraints, and high-leverage actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('chat')}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask Venturevo AI</span>
          </button>

          <button
            onClick={fetchDashboard}
            className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Top 3 Core Strategic Cards: Goal, Problem, Opportunity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Main Goal */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/70 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-400" /> Primary Business Goal
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/40">
                In Progress
              </span>
            </div>

            <h3 className="font-bold text-sm text-neutral-100 leading-snug">
              {main_goal ? main_goal.title : 'Establish Initial Revenue Target'}
            </h3>

            {main_goal && (
              <div className="pt-2">
                <div className="flex justify-between text-[11px] text-neutral-400 font-medium mb-1">
                  <span>Current: {main_goal.current_value} {main_goal.unit}</span>
                  <span className="text-neutral-200 font-semibold">Target: {main_goal.target_value} {main_goal.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((main_goal.current_value / (main_goal.target_value || 1)) * 100))}%`,
                    }}
                  />
                </div>
                {main_goal.deadline && (
                  <p className="text-[10px] text-neutral-500 mt-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Target Deadline: {main_goal.deadline}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Strategic Alignment</span>
            <button
              onClick={() => onNavigate('profile')}
              className="text-[11px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              Update Goal <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 2. Highest-Priority Problem */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/70 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Highest-Priority Problem
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-semibold border border-rose-800/40 uppercase">
                {highest_priority_problem?.severity || 'Critical'}
              </span>
            </div>

            <h3 className="font-bold text-sm text-neutral-100 leading-snug">
              {highest_priority_problem ? highest_priority_problem.title : 'Customer Acquisition Friction'}
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
              {highest_priority_problem?.description || 'Evaluating primary operational and sales conversion bottlenecks.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 capitalize">
              Status: {highest_priority_problem?.status?.replace('_', ' ') || 'Unsolved'}
            </span>
            <button
              onClick={() => onNavigate('diagnostics')}
              className="text-[11px] text-rose-400 hover:underline font-semibold flex items-center gap-1"
            >
              Diagnose Root Causes <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 3. Current Opportunity */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/70 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-teal-400" /> Active Opportunity
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 font-semibold border border-teal-800/40">
                Score: {current_opportunity?.overall_leverage_score || 85}/100
              </span>
            </div>

            <h3 className="font-bold text-sm text-neutral-100 leading-snug">
              {current_opportunity ? current_opportunity.title : 'Direct Value-First Acquisition Hook'}
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
              {current_opportunity?.description || 'Rapid customer discovery and low-friction pilot validation.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[10px] text-neutral-400">
              1st Customer: ~{current_opportunity?.speed_to_first_customer_days || 14} days
            </span>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-[11px] text-teal-400 hover:underline font-semibold flex items-center gap-1"
            >
              View Matrix <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Leverage Next Action Spotlight Card */}
      {recommended_next_action ? (
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-neutral-900/80 to-neutral-900/80 p-5 shadow-xl shadow-emerald-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  <Zap className="h-3 w-3 text-amber-400" /> Single Highest-Leverage Next Action
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  Est: {recommended_next_action.estimated_hours || 4} hrs • Leverage Score: {recommended_next_action.leverage_score || 92}/100
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-neutral-100">
                {recommended_next_action.title}
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {recommended_next_action.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => handleCompleteTask(recommended_next_action.id)}
                className="py-2.5 px-4 rounded-xl border border-emerald-600/60 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Mark Completed</span>
              </button>

              <button
                onClick={() => onNavigate('chat', { prompt: `How should I execute this highest-leverage action: "${recommended_next_action.title}" with maximum speed and zero waste?` })}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Execute in AI Chat</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-neutral-200">All current high-leverage tasks completed!</p>
              <p className="text-[11px] text-neutral-400">Ask Venturevo AI to generate your next growth sprint plan.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('chat')}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold"
          >
            Generate Next Sprint
          </button>
        </div>
      )}

      {/* Two Column Layout: Active Growth Plan & Evidence Memory Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Growth Plan & Tasks Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Active Growth Sprint
                </span>
                <h3 className="text-sm sm:text-base font-bold text-neutral-100 mt-0.5">
                  {active_growth_plan ? active_growth_plan.title : 'Sprint 1: Validation & Positioning'}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">
                  {task_progress?.pct || 0}% Complete
                </span>
                <p className="text-[10px] text-neutral-400">
                  {task_progress?.completed || 0} of {task_progress?.total || 0} Tasks Done
                </p>
              </div>
            </div>

            <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${task_progress?.pct || 0}%` }}
              />
            </div>

            <p className="text-xs text-neutral-300 italic">
              "{active_growth_plan?.objective || 'Validate unit economics and isolate zero-risk value propositions.'}"
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-neutral-800/80">
              <span className="text-xs text-neutral-400 font-medium">Sprint Timeframe: 8 Weeks</span>
              <button
                onClick={() => onNavigate('growth')}
                className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                View Full Kanban & Task List <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* AI Evidence-Based Business Insights */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Venturevo Growth Engine Insights
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                7-Factor Scored
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Offer Positioning SLA
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Switching outbound email focus from "automation efficiency" to "eliminating 3.2% invoice leakage" reduces buyer evaluation friction by 4x.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  Unit Economics Margin
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Current pricing preserves an 88% gross margin, providing sufficient margin buffer for referral channel commissions with software partners.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Business Memory & Telemetry Stats */}
        <div className="space-y-4">
          {/* Business Memory Summary */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Business Memory
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {memory_count || 0} Records
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Venturevo AI preserves institutional business memory across sessions to prevent repeated questions and maintain strategic continuity.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/60">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Facts
                </span>
                <span className="font-bold text-emerald-300">{verified_facts_count || 0}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/60">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-teal-400" /> Founder Assumptions
                </span>
                <span className="font-bold text-teal-300">{(memory_count || 0) - (verified_facts_count || 0)}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('memory')}
              className="w-full mt-2 py-2 px-3 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage Memory Matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Recent Audit & System Activity */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Recent Activity
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {recent_activity && recent_activity.length > 0 ? (
                recent_activity.map((act: any) => (
                  <div key={act.id} className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-0.5">
                      <span className="font-semibold uppercase text-emerald-400">{act.action.replace(/_/g, ' ')}</span>
                      <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 truncate">
                      {act.resource_type}: {act.resource_id || 'system'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic">No recent system activity recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
