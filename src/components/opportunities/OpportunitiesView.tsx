import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BusinessOpportunity } from '../../types';
import { StartBusinessView } from './StartBusinessView';
import {
  TrendingUp,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  ShieldAlert,
  BarChart3,
  Search,
  SlidersHorizontal,
  Compass,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  Rocket,
} from 'lucide-react';

export const OpportunitiesView: React.FC = () => {
  const { token, activeBusiness, refreshBusinesses } = useAuth();
  const [activeTab, setActiveTab] = useState<'scanner' | 'start_business' | 'pipeline'>('scanner');
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<BusinessOpportunity | null>(null);

  // Scanner Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [maxCapital, setMaxCapital] = useState<number>(10000);
  const [minLeverage, setMinLeverage] = useState<number>(70);

  // Manual Add Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [demandScore, setDemandScore] = useState(85);
  const [founderFitScore, setFounderFitScore] = useState(90);
  const [capitalRequired, setCapitalRequired] = useState(1500);
  const [speedDays, setSpeedDays] = useState(14);
  const [competitionLevel, setCompetitionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [scalabilityScore, setScalabilityScore] = useState(88);

  const fetchOpportunities = async () => {
    if (!token || !activeBusiness) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/businesses/${activeBusiness.id}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (e) {
      console.error('Error fetching opportunities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [activeBusiness, token]);

  const handleScanDatabase = async () => {
    if (!token || !activeBusiness) return;
    setLoading(true);
    try {
      const res = await fetch('/api/opportunities/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          industry: industryFilter,
          max_capital: maxCapital,
          business_model: modelFilter,
          query: searchQuery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (e) {
      console.error('Error running scanner:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = (
    demand: number,
    fit: number,
    speed: number,
    comp: 'low' | 'medium' | 'high',
    risk: 'low' | 'medium' | 'high',
    scale: number
  ) => {
    const speedScore = Math.max(0, 100 - speed * 2);
    const compScore = comp === 'low' ? 90 : comp === 'medium' ? 60 : 30;
    const riskScore = risk === 'low' ? 90 : risk === 'medium' ? 60 : 30;
    return Math.round(
      demand * 0.25 +
        fit * 0.2 +
        speedScore * 0.15 +
        compScore * 0.1 +
        riskScore * 0.1 +
        scale * 0.2
    );
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeBusiness || !title.trim()) return;

    const overallScore = calculateOverallScore(
      demandScore,
      founderFitScore,
      speedDays,
      competitionLevel,
      riskLevel,
      scalabilityScore
    );

    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          demand_score: demandScore,
          founder_fit_score: founderFitScore,
          capital_required: capitalRequired,
          speed_to_first_customer_days: speedDays,
          competition_level: competitionLevel,
          risk_level: riskLevel,
          scalability_score: scalabilityScore,
          overall_leverage_score: overallScore,
          status: 'evaluating',
          key_hypotheses: [
            'Target customers experience painful delays with status quo solutions.',
            'Initial outreach pilot converts within 14 days without long contract review.',
          ],
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchOpportunities();
      }
    } catch (e) {
      console.error('Error adding opportunity:', e);
    }
  };

  const handleUpdateStatus = async (oppId: string, newStatus: 'discovered' | 'evaluating' | 'pursuing' | 'archived') => {
    try {
      const res = await fetch(`/api/opportunities/${oppId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOpportunities(
          opportunities.map((o) => (o.id === oppId ? { ...o, status: newStatus } : o))
        );
        if (selectedOpp?.id === oppId) {
          setSelectedOpp({ ...selectedOpp, status: newStatus });
        }
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) && !opp.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (opp.overall_leverage_score < minLeverage) return false;
    if (opp.capital_required > maxCapital) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
              Business Opportunities & Scanner
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Systematic leverage ranking based on demand, founder fit, speed to first customer, and unit economics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'scanner'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Opportunity Scanner
          </button>
          <button
            onClick={() => setActiveTab('start_business')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'start_business'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Start a Business</span>
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'pipeline'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Active Pipeline ({opportunities.length})
          </button>
        </div>
      </div>

      {activeTab === 'start_business' ? (
        <StartBusinessView />
      ) : activeTab === 'scanner' ? (
        <div className="space-y-6">
          {/* Scanner Control Bar */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities, problems solved, or niches..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Industries</option>
                  <option value="b2b_saas">B2B SaaS / Services</option>
                  <option value="logistics">Logistics & Supply Chain</option>
                  <option value="healthcare">Healthcare & Compliance</option>
                  <option value="finance">Finance & Operations</option>
                </select>

                <select
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Models</option>
                  <option value="b2b_service">B2B Productized Service</option>
                  <option value="recurring_saas">Recurring Software</option>
                  <option value="consulting">High-Ticket Audit</option>
                </select>

                <button
                  onClick={handleScanDatabase}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition flex-shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Scan Market</span>
                </button>
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/60 text-xs">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Max Capital Required</span>
                  <span className="font-bold text-emerald-400">${maxCapital.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={maxCapital}
                  onChange={(e) => setMaxCapital(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Minimum Overall Leverage Score</span>
                  <span className="font-bold text-emerald-400">{minLeverage}/100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minLeverage}
                  onChange={(e) => setMinLeverage(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      {opp.overall_leverage_score}/100 Leverage
                    </span>
                    <span className="text-[10px] text-neutral-500 capitalize">
                      {opp.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-100 line-clamp-2">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {opp.problem_solved || opp.description}
                  </p>

                  {/* 4 Core Quick Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-800/60">
                    <div className="p-2 rounded-lg bg-neutral-950/60">
                      <span className="text-[10px] text-neutral-500 block">Demand Urgency</span>
                      <span className="font-bold text-neutral-200">{opp.demand_score}/100</span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-950/60">
                      <span className="text-[10px] text-neutral-500 block">Founder Fit</span>
                      <span className="font-bold text-emerald-400">{opp.founder_fit_score}/100</span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-950/60">
                      <span className="text-[10px] text-neutral-500 block">Capital Required</span>
                      <span className="font-bold text-neutral-200">${opp.capital_required}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-950/60">
                      <span className="text-[10px] text-neutral-500 block">1st Customer Speed</span>
                      <span className="font-bold text-amber-400">{opp.speed_to_first_customer_days} Days</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-emerald-400 transition"
                  >
                    <Eye className="h-3.5 w-3.5" /> Full Teardown
                  </button>

                  <select
                    value={opp.status}
                    onChange={(e) => handleUpdateStatus(opp.id, e.target.value as any)}
                    className="px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-950 text-[11px] text-neutral-300 focus:outline-none"
                  >
                    <option value="discovered">Discovered</option>
                    <option value="evaluating">Evaluating</option>
                    <option value="pursuing">Pursuing</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Pipeline Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Evaluated & Pursued Pipeline
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Manual Opportunity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-neutral-100">{opp.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {opp.overall_leverage_score}/100
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{opp.description}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60">
                  <span className="text-neutral-500">Status: <strong className="text-neutral-200 capitalize">{opp.status}</strong></span>
                  <button
                    onClick={() => setSelectedOpp(opp)}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    View Teardown →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity Teardown Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800 mb-1.5 inline-block">
                  Opportunity Teardown
                </span>
                <h2 className="text-xl font-bold font-display text-neutral-100">{selectedOpp.title}</h2>
                <p className="text-xs text-neutral-400 mt-1">{selectedOpp.description}</p>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Overall Leverage</span>
                <span className="text-base font-extrabold text-emerald-400">{selectedOpp.overall_leverage_score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Demand Urgency</span>
                <span className="text-base font-bold text-neutral-200">{selectedOpp.demand_score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Capital Needed</span>
                <span className="text-base font-bold text-neutral-200">${selectedOpp.capital_required}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">1st Customer Speed</span>
                <span className="text-base font-bold text-amber-400">{selectedOpp.speed_to_first_customer_days} Days</span>
              </div>
            </div>

            {/* Problem & Target ICP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-300">Problem Solved:</span>
                <p className="text-neutral-400">{selectedOpp.problem_solved || 'High manual friction and financial loss.'}</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-300">Target Customer:</span>
                <p className="text-neutral-400">{selectedOpp.target_customer || 'Mid-market business leaders.'}</p>
              </div>
            </div>

            {/* Next Action */}
            <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 text-xs space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5" /> 24-Hour Next Action
              </span>
              <p className="text-neutral-200">{selectedOpp.next_action || 'Draft a 1-page sample audit and message 10 prospects.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-100">Add Custom Opportunity</h2>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-neutral-300">✕</button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Automated Carrier Surcharge Auditing"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Description / Core Offer</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Demand Score (1-100)</label>
                  <input
                    type="number"
                    value={demandScore}
                    onChange={(e) => setDemandScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Capital Required ($)</label>
                  <input
                    type="number"
                    value={capitalRequired}
                    onChange={(e) => setCapitalRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
