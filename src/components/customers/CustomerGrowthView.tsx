import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomerProfileICP } from '../../types';
import {
  Users,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Target,
  ArrowRight,
  Flame,
  Zap,
  Repeat,
  Compass,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const CustomerGrowthView: React.FC = () => {
  const { token, activeBusiness } = useAuth();
  const [personas, setPersonas] = useState<CustomerProfileICP[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<CustomerProfileICP | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [audienceHint, setAudienceHint] = useState('');

  const fetchPersonas = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/customer-personas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPersonas(data);
        if (data.length > 0 && !selectedPersona) {
          setSelectedPersona(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load personas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [activeBusiness?.id]);

  const handleGeneratePersona = async () => {
    if (!activeBusiness) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/customer-personas/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          target_audience_hint: audienceHint,
        }),
      });

      if (res.ok) {
        const newPersona = await res.json();
        setPersonas([newPersona, ...personas]);
        setSelectedPersona(newPersona);
        setShowAddModal(false);
        setAudienceHint('');
      }
    } catch (e) {
      console.error('Failed to generate customer persona:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePersona = async (id: string) => {
    try {
      const res = await fetch(`/api/customer-personas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = personas.filter((p) => p.id !== id);
        setPersonas(updated);
        if (selectedPersona?.id === id) {
          setSelectedPersona(updated[0] || null);
        }
      }
    } catch (e) {
      console.error('Failed to delete persona:', e);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHookIdx(idx);
    setTimeout(() => setCopiedHookIdx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>Customer Intelligence & ICP Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100">
            Ideal Customer Profiles & Journey Engine
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Identify acute pain points, high-converting messaging hooks, purchasing triggers, and 5-stage lifecycle maps.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 transition flex-shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate / Add ICP</span>
        </button>
      </div>

      {personas.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-neutral-800 bg-neutral-900/30 space-y-3">
          <Users className="h-8 w-8 text-neutral-600 mx-auto" />
          <div className="text-sm font-semibold text-neutral-300">No ICP personas mapped yet</div>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Generate your Ideal Customer Profile to isolate their urgent daily pains and generate copy-paste messaging hooks.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition"
          >
            Generate First ICP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personas Selector Column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Customer Personas ({personas.length})
            </h2>

            {personas.map((p) => {
              const isSelected = selectedPersona?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-emerald-500/80 bg-neutral-900/90 shadow-md shadow-emerald-500/5'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-100">{p.persona_name}</h3>
                      <p className="text-xs text-emerald-400 font-medium mt-0.5">{p.title_role}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePersona(p.id);
                      }}
                      className="p-1 rounded text-neutral-600 hover:text-rose-400 transition"
                      title="Delete ICP"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {p.industry_vertical} • {p.demographics}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Persona Detailed Teardown */}
          {selectedPersona && (
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 inline-block mb-1.5">
                      Ideal Customer Profile
                    </span>
                    <h2 className="text-xl font-bold font-display text-neutral-100">
                      {selectedPersona.persona_name}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      <strong>Role:</strong> {selectedPersona.title_role} | <strong>Vertical:</strong> {selectedPersona.industry_vertical}
                    </p>
                  </div>
                </div>

                {/* Demographics */}
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                  <span className="font-bold text-neutral-400 block mb-1">Target Profile & Context:</span>
                  <p className="text-neutral-200">{selectedPersona.demographics}</p>
                </div>

                {/* Acute Pain Points vs Desired Outcomes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Pain Points */}
                  <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-2">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5" /> Acute Pain Points (Bleeding Neck)
                    </span>
                    <ul className="space-y-1.5 text-neutral-300">
                      {selectedPersona.acute_pain_points.map((pain, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desired Outcomes */}
                  <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10 space-y-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" /> Desired Transformation / Outcomes
                    </span>
                    <ul className="space-y-1.5 text-neutral-300">
                      {selectedPersona.desired_outcomes.map((out, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Purchasing Triggers */}
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-2 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Purchasing Triggers (Why They Buy Now)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedPersona.purchasing_triggers.map((trig, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                        {trig}
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-Converting Messaging Hooks */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> High-Converting Messaging Hooks (Copy & Outbound)
                    </span>
                    <span className="text-[10px] text-neutral-500">Click to copy</span>
                  </div>

                  <div className="space-y-2">
                    {selectedPersona.high_converting_hooks.map((hook, idx) => {
                      const isCopied = copiedHookIdx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => copyToClipboard(hook, idx)}
                          className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between gap-3 group"
                        >
                          <span className="text-neutral-200 font-medium italic select-all">
                            {hook}
                          </span>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 group-hover:text-emerald-400 flex-shrink-0 transition"
                            title="Copy to clipboard"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Retention Tactics */}
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-2 text-xs">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Repeat className="h-3.5 w-3.5" /> Retention & Anti-Churn Tactics
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPersona.retention_tactics.map((tactic, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                        {tactic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5-Stage Customer Journey Matrix */}
              {selectedPersona.journey_stages && selectedPersona.journey_stages.length > 0 && (
                <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                      5-Stage Customer Lifecycle Journey
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    {selectedPersona.journey_stages.map((stage, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                            {idx + 1}. {stage.stage}
                          </span>
                          <p className="text-[11px] text-neutral-300 font-medium leading-snug">
                            {stage.touchpoint}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-400">
                          <strong>Trigger:</strong> {stage.action_trigger}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>AI Customer Profile Generator</span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1.5">
                  Target Audience / Buyer Persona Focus (Optional)
                </label>
                <input
                  type="text"
                  value={audienceHint}
                  onChange={(e) => setAudienceHint(e.target.value)}
                  placeholder="e.g. Operations Director in 3PL Logistics or Clinic Practice Manager"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 text-neutral-400 space-y-1">
                <p className="font-semibold text-neutral-300">What Venturevo AI will generate:</p>
                <p>• 3 acute, costly daily pain points</p>
                <p>• 3 urgent purchasing triggers</p>
                <p>• 3 high-converting cold email hooks</p>
                <p>• 5-stage customer journey pipeline</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePersona}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>Generating ICP Matrix...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate Ideal Customer Profile</span>
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
