import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Target,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  AlertCircle,
  Brain,
  Repeat,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { GrowthTask, GrowthPlan, TaskLearningRecord } from '../../types';

export const GrowthPlanView: React.FC = () => {
  const { token, activeBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'learnings'>('tasks');
  const [plans, setPlans] = useState<GrowthPlan[]>([]);
  const [tasks, setTasks] = useState<GrowthTask[]>([]);
  const [learnings, setLearnings] = useState<TaskLearningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Retrospective Modal State
  const [completingTask, setCompletingTask] = useState<GrowthTask | null>(null);
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [metricDelta, setMetricDelta] = useState('');
  const [keyLearning, setKeyLearning] = useState('');
  const [promoteToMemory, setPromoteToMemory] = useState(true);
  const [isSubmittingLearning, setIsSubmittingLearning] = useState(false);

  // Add Task State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'sales' | 'marketing' | 'offer' | 'operations' | 'validation'>('sales');
  const [newPriority, setNewPriority] = useState<'highest_leverage' | 'secondary' | 'maintenance'>('highest_leverage');
  const [newLeverage, setNewLeverage] = useState(90);
  const [newHours, setNewHours] = useState(4);

  const fetchGrowthData = async () => {
    if (!token || !activeBusiness) return;
    try {
      setLoading(true);
      const [plansRes, learningsRes] = await Promise.all([
        fetch(`/api/businesses/${activeBusiness.id}/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/businesses/${activeBusiness.id}/learnings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (plansRes.ok) {
        const contentType = plansRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await plansRes.json();
          setPlans(data.plans || []);
          setTasks(data.tasks || []);
        }
      }
      if (learningsRes.ok) {
        const contentType = learningsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const learnData = await learningsRes.json();
          setLearnings(learnData || []);
        }
      }
    } catch (e) {
      console.warn('Notice loading growth data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [activeBusiness, token]);

  const handleOpenCompleteModal = (task: GrowthTask) => {
    setCompletingTask(task);
    setExpectedOutcome(`Verify if ${task.title.toLowerCase()} improves acquisition velocity.`);
    setActualResult('');
    setMetricDelta('');
    setKeyLearning('');
    setPromoteToMemory(true);
  };

  const handleSubmitRetrospective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !completingTask) return;
    setIsSubmittingLearning(true);

    try {
      const res = await fetch(`/api/tasks/${completingTask.id}/log-learning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expected_outcome: expectedOutcome,
          actual_result: actualResult,
          metric_delta: metricDelta,
          key_learning: keyLearning,
          promote_to_memory: promoteToMemory,
        }),
      });

      if (res.ok) {
        setCompletingTask(null);
        await fetchGrowthData();
      }
    } catch (e) {
      console.error('Failed to log retrospective learning:', e);
    } finally {
      setIsSubmittingLearning(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    if (!token) return;
    if (newStatus === 'done') {
      const t = tasks.find((item) => item.id === taskId);
      if (t) {
        handleOpenCompleteModal(t);
        return;
      }
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error('Error updating task status:', e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeBusiness || !newTitle.trim()) return;

    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: plans[0]?.id,
          title: newTitle,
          description: newDesc,
          category: newCategory,
          priority: newPriority,
          leverage_score: newLeverage,
          estimated_hours: newHours,
        }),
      });

      if (res.ok) {
        setShowAddTaskModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchGrowthData();
      }
    } catch (e) {
      console.error('Error creating task:', e);
    }
  };

  const filteredTasks = tasks.filter(
    (t) => filterCategory === 'all' || t.category === filterCategory
  );

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
              Growth Plans & Learning Loop
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Prioritized sprints focused on high-speed customer acquisition, measurement, and institutional learning.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'tasks'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sprint Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('learnings')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'learnings'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span>Learning Loop ({learnings.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'learnings' ? (
        /* Institutional Learning Loop Tab */
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Brain className="h-4 w-4" />
              <span>Institutional Business Memory & Retrospective Feedback</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Every completed task logs actual empirical outcomes and metric deltas. Verified findings compound into your core Business Memory to permanently sharpen AI decision recommendations.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Captured Empirical Learnings ({learnings.length})
            </h2>

            {learnings.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-neutral-800 bg-neutral-900/30 text-xs text-neutral-500">
                No task retrospectives logged yet. Complete tasks in your active sprint to capture verified learnings.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learnings.map((lrn) => (
                  <div
                    key={lrn.id}
                    className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Task Retrospective
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {new Date(lrn.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-neutral-100">{lrn.task_title}</h3>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 block">Actual Outcome:</span>
                        <p className="text-neutral-300 mt-0.5">{lrn.actual_result}</p>
                      </div>

                      {lrn.metric_delta && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                          <span className="text-[10px] text-emerald-400 font-bold block">Metric Impact:</span>
                          <p className="text-emerald-300 font-semibold mt-0.5">{lrn.metric_delta}</p>
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                        <span className="text-[10px] text-neutral-400 font-bold block mb-1">Key Business Rule / Insight:</span>
                        <p className="text-neutral-200 font-medium">{lrn.key_learning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sprint Tasks Kanban */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300"
              >
                <option value="all">All Categories</option>
                <option value="sales">Sales & Outreach</option>
                <option value="marketing">Marketing</option>
                <option value="offer">Offer & Pricing</option>
                <option value="operations">Operations</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Todo Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">To Do</span>
                <span className="text-xs font-bold text-neutral-500">{todoTasks.length}</span>
              </div>

              <div className="space-y-3">
                {todoTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3 hover:border-neutral-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        {t.leverage_score}/100 Leverage
                      </span>
                      <span className="text-[10px] text-neutral-500 capitalize">{t.category}</span>
                    </div>

                    <h4 className="font-bold text-sm text-neutral-100">{t.title}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-2">{t.description}</p>

                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-500">{t.estimated_hours}h estimated</span>
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                        className="text-xs font-semibold text-emerald-400 hover:underline"
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">In Progress</span>
                <span className="text-xs font-bold text-amber-500">{inProgressTasks.length}</span>
              </div>

              <div className="space-y-3">
                {inProgressTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-amber-900/50 bg-neutral-900/70 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                        Active Sprint
                      </span>
                      <span className="text-[10px] text-neutral-500 capitalize">{t.category}</span>
                    </div>

                    <h4 className="font-bold text-sm text-neutral-100">{t.title}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-2">{t.description}</p>

                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'todo')}
                        className="text-[11px] text-neutral-500 hover:text-neutral-300"
                      >
                        ← Move to Todo
                      </button>
                      <button
                        onClick={() => handleOpenCompleteModal(t)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow transition"
                      >
                        <Check className="h-3 w-3" /> Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed</span>
                <span className="text-xs font-bold text-emerald-500">{doneTasks.length}</span>
              </div>

              <div className="space-y-3">
                {doneTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-emerald-950/80 bg-neutral-950/60 space-y-2 opacity-80"
                  >
                    <div className="flex items-center justify-between text-[10px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified Complete
                      </span>
                      <span>{t.metrics_impact || 'Validated'}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-neutral-200">{t.title}</h4>
                    {t.outcome_notes && (
                      <p className="text-xs text-neutral-400 italic">"{t.outcome_notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retrospective Learning Logger Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 inline-block mb-1">
                  Learning Loop Retrospective
                </span>
                <h3 className="font-bold text-base text-neutral-100">{completingTask.title}</h3>
              </div>
              <button onClick={() => setCompletingTask(null)} className="text-neutral-500 hover:text-neutral-300">✕</button>
            </div>

            <form onSubmit={handleSubmitRetrospective} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Hypothesis / Expected Outcome
                </label>
                <input
                  type="text"
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Actual Result (Empirical Data) *
                </label>
                <input
                  type="text"
                  value={actualResult}
                  onChange={(e) => setActualResult(e.target.value)}
                  placeholder="e.g. Reached out to 25 target ICP buyers, 5 responded, 2 scheduled demo audits"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Metric Delta / Impact
                </label>
                <input
                  type="text"
                  value={metricDelta}
                  onChange={(e) => setMetricDelta(e.target.value)}
                  placeholder="e.g. +20% response rate vs 0% baseline, $3,000 pipeline created"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Key Business Learning (Institutional Rule) *
                </label>
                <textarea
                  value={keyLearning}
                  onChange={(e) => setKeyLearning(e.target.value)}
                  rows={2}
                  placeholder="e.g. Framing the audit as a 3-minute risk discovery hook converts 3x higher than pitching software features."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promoteMem"
                  checked={promoteToMemory}
                  onChange={(e) => setPromoteToMemory(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <label htmlFor="promoteMem" className="text-neutral-300 font-medium cursor-pointer">
                  Promote finding directly into Core Business Memory as Verified Fact
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLearning || !actualResult.trim() || !keyLearning.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow transition disabled:opacity-50"
                >
                  {isSubmittingLearning ? 'Logging...' : 'Save Learning & Complete Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-100">Add High-Leverage Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-neutral-500 hover:text-neutral-300">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build 1-page Discrepancy Audit hook"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200"
                  >
                    <option value="sales">Sales & Outreach</option>
                    <option value="marketing">Marketing</option>
                    <option value="offer">Offer & Pricing</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Leverage Score (1-100)</label>
                  <input
                    type="number"
                    value={newLeverage}
                    onChange={(e) => setNewLeverage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
