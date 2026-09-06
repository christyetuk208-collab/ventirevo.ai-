import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CompetitorAnalysis } from '../../types';
import {
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Target,
  TrendingUp,
  Crosshair,
  Award,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const CompetitorAnalysisView: React.FC = () => {
  const { token, activeBusiness } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // New competitor form
  const [compName, setCompName] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [pricingModel, setPricingModel] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [weaknessesText, setWeaknessesText] = useState('');
  const [counterStrategy, setCounterStrategy] = useState('');
  const [quadrant, setQuadrant] = useState<'budget_leader' | 'premium_specialist' | 'general_incumbent' | 'nimble_disruptor'>('general_incumbent');
  const [xPos, setXPos] = useState<number>(75);
  const [yPos, setYPos] = useState<number>(40);

  const fetchCompetitors = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/competitors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data);
      }
    } catch (e) {
      console.error('Failed to load competitors:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [activeBusiness?.id]);

  const handleGenerateTeardown = async () => {
    if (!activeBusiness || !compName.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/competitors/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          competitor_name: compName,
          competitor_url: compUrl,
        }),
      });

      if (res.ok) {
        const newComp = await res.json();
        setCompetitors([newComp, ...competitors]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (e) {
      console.error('Failed to generate teardown:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness || !compName.trim()) return;

    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/competitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: compName,
          website_url: compUrl,
          value_proposition: valueProp,
          pricing_model: pricingModel,
          target_segment: targetSegment,
          strengths: strengthsText.split('\n').filter((s) => s.trim()),
          weaknesses: weaknessesText.split('\n').filter((s) => s.trim()),
          counter_strategy: counterStrategy,
          market_quadrant: quadrant,
          x_position: xPos,
          y_position: yPos,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCompetitors([created, ...competitors]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (e) {
      console.error('Failed to add competitor:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCompetitors(competitors.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete competitor:', e);
    }
  };

  const resetForm = () => {
    setCompName('');
    setCompUrl('');
    setValueProp('');
    setPricingModel('');
    setTargetSegment('');
    setStrengthsText('');
    setWeaknessesText('');
    setCounterStrategy('');
    setQuadrant('general_incumbent');
    setXPos(75);
    setYPos(40);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Crosshair className="h-4 w-4" />
            <span>Competitive Intelligence & Positioning</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100">
            Competitor Teardowns & 2x2 Positioning Grid
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Analyze rival value propositions, pricing structures, and exploit their operational weaknesses with agile counter-strategies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 transition flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add / Analyze Competitor</span>
        </button>
      </div>

      {/* 2x2 Market Positioning Matrix Visualizer */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
              Market Positioning Grid (Price vs. Specialization)
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400">
            Find uncontested market white-space
          </span>
        </div>

        {/* 2x2 Interactive Canvas Box */}
        <div className="relative w-full h-80 rounded-xl border border-neutral-800 bg-neutral-950/80 overflow-hidden select-none p-4">
          {/* Axis Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            High Specialization (Niche Expert) ↑
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            ↓ Low Specialization (Generalist)
          </div>
          <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-neutral-500 uppercase tracking-wider origin-left">
            ← Low Cost / Budget
          </div>
          <div className="absolute top-1/2 right-2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-neutral-500 uppercase tracking-wider origin-right">
            High Cost / Enterprise →
          </div>

          {/* Center Dividing Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neutral-800/80 border-r border-dashed border-neutral-700/50" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-neutral-800/80 border-b border-dashed border-neutral-700/50" />

          {/* Quadrant Labels */}
          <div className="absolute top-6 left-6 text-[11px] font-medium text-emerald-500/70">
            Nimble Disruptor
          </div>
          <div className="absolute top-6 right-6 text-[11px] font-medium text-purple-500/70 text-right">
            Premium Specialist
          </div>
          <div className="absolute bottom-6 left-6 text-[11px] font-medium text-blue-500/70">
            Budget Leader
          </div>
          <div className="absolute bottom-6 right-6 text-[11px] font-medium text-amber-500/70 text-right">
            General Incumbent
          </div>

          {/* Our Business Node */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: '42%', top: '28%' }}
          >
            <div className="h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 animate-pulse flex items-center justify-center text-[8px] font-black text-neutral-950 shadow-lg shadow-emerald-500/50">
              ★
            </div>
            <div className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold mt-1 shadow-md whitespace-nowrap">
              You ({activeBusiness?.name || 'Your Venture'})
            </div>
          </div>

          {/* Competitor Nodes */}
          {competitors.map((comp) => {
            const left = `${Math.min(90, Math.max(10, comp.x_position ?? 65))}%`;
            const top = `${Math.min(90, Math.max(10, 100 - (comp.y_position ?? 50)))}%`;

            return (
              <div
                key={comp.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left, top }}
              >
                <div className="h-3.5 w-3.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30 group-hover:scale-125 transition shadow-sm" />
                <div className="px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 text-[9px] font-medium mt-1 whitespace-nowrap shadow group-hover:border-rose-400 transition">
                  {comp.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor Teardown Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Analyzed Competitors ({competitors.length})
        </h2>

        {competitors.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-neutral-800 bg-neutral-900/30 space-y-3">
            <Crosshair className="h-8 w-8 text-neutral-600 mx-auto" />
            <div className="text-sm font-semibold text-neutral-300">No competitors analyzed yet</div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Run an AI teardown on your primary category rivals to expose their weaknesses and discover pricing arbitrage.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition"
            >
              Analyze First Competitor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {competitors.map((comp) => (
              <div
                key={comp.id}
                className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4 hover:border-neutral-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Title & Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-neutral-100">{comp.name}</h3>
                        {comp.website_url && (
                          <a
                            href={comp.website_url.startsWith('http') ? comp.website_url : `https://${comp.website_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-500 hover:text-emerald-400 transition"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{comp.value_proposition}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Delete competitor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Pricing & Target Segment */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 block">Pricing Model</span>
                      <span className="font-semibold text-neutral-200">{comp.pricing_model || 'Custom / Contact Sales'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 block">Target Segment</span>
                      <span className="font-semibold text-neutral-200">{comp.target_segment || 'Broad Market'}</span>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Core Strengths
                      </span>
                      <ul className="space-y-1 text-neutral-400">
                        {comp.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Vulnerabilities / Gaps
                      </span>
                      <ul className="space-y-1 text-neutral-400">
                        {comp.weaknesses.map((w, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Agile Counter-Strategy */}
                <div className="mt-3 p-3 rounded-xl border border-emerald-800/40 bg-emerald-950/20 space-y-1 text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Venturevo Counter-Strategy
                  </span>
                  <p className="text-neutral-300 leading-relaxed">
                    {comp.counter_strategy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / AI Teardown Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>AI Competitor Intelligence Teardown</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-neutral-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">
                  Competitor Name *
                </label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Acme Corp or LegacyTMS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">
                  Competitor Website / URL (Optional)
                </label>
                <input
                  type="text"
                  value={compUrl}
                  onChange={(e) => setCompUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 text-neutral-400">
                <p>
                  Venturevo AI will synthesize public product positioning, pricing tiers, and generate a concrete counter-strategy to out-position them.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGenerateTeardown}
                  disabled={isGenerating || !compName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>Generating Teardown...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Run AI Teardown</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
