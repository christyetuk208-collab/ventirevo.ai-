import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  Plus,
  ShieldCheck,
  HelpCircle,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  Info,
} from 'lucide-react';
import { BusinessMemory, MemoryCategory, InformationReliability } from '../../types';

export const BusinessMemoryView: React.FC = () => {
  const { token, activeBusiness } = useAuth();
  const [memories, setMemories] = useState<BusinessMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReliability, setSelectedReliability] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form State
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('customer_profiles');
  const [newReliability, setNewReliability] = useState<InformationReliability>('verified_fact');
  const [newConfidence, setNewConfidence] = useState(90);

  const fetchMemories = async () => {
    if (!token || !activeBusiness) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/businesses/${activeBusiness.id}/memory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (e) {
      console.error('Error fetching memories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [activeBusiness, token]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeBusiness || !newKey.trim() || !newValue.trim()) return;

    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: newKey,
          value: newValue,
          category: newCategory,
          reliability: newReliability,
          confidence_pct: newConfidence,
          source: 'founder_input',
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewKey('');
        setNewValue('');
        fetchMemories();
      }
    } catch (e) {
      console.error('Error creating memory:', e);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/memory/${memoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
    } catch (e) {
      console.error('Error deleting memory:', e);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(m.value).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesRel = selectedReliability === 'all' || m.reliability === selectedReliability;
    return matchesSearch && matchesCat && matchesRel;
  });

  const getReliabilityBadge = (rel: InformationReliability) => {
    switch (rel) {
      case 'verified_fact':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Verified Fact
          </span>
        );
      case 'user_provided':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-950/80 text-sky-300 border border-sky-800/60">
            User-Provided
          </span>
        );
      case 'estimate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800/60">
            Estimate
          </span>
        );
      case 'assumption':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-800/60">
            Assumption
          </span>
        );
      case 'hypothesis':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-950/80 text-teal-300 border border-teal-800/60">
            Hypothesis
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
              Business Memory Bank
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Institutional knowledge repository: Grounding AI advice in verified facts vs assumptions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Knowledge Record</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified parameters, customer insights, pricing..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="business_fundamentals">Fundamentals</option>
            <option value="products_and_services">Products & Services</option>
            <option value="customer_profiles">Customer Profile</option>
            <option value="pricing_and_unit_economics">Pricing & Economics</option>
            <option value="strategic_goals">Strategic Goals</option>
            <option value="validated_findings">Validated Findings</option>
            <option value="important_decisions">Important Decisions</option>
            <option value="active_problems">Active Problems</option>
            <option value="operational_learnings">Operational Learnings</option>
          </select>

          <select
            value={selectedReliability}
            onChange={(e) => setSelectedReliability(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Reliability</option>
            <option value="verified_fact">Verified Facts</option>
            <option value="user_provided">User-Provided</option>
            <option value="estimate">Estimates</option>
            <option value="assumption">Assumptions</option>
            <option value="hypothesis">Hypotheses</option>
          </select>
        </div>
      </div>

      {/* Memory Records Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-neutral-400">Loading business memory records...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <Info className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-300">No memory records matching criteria</p>
          <p className="text-xs text-neutral-500 mt-1">Add new verified data points or clear active search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-4 space-y-3 relative group hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                      {m.category.replace(/_/g, ' ')}
                    </span>
                    {getReliabilityBadge(m.reliability)}
                  </div>
                  <h3 className="font-bold text-sm text-neutral-100 capitalize">
                    {m.key.replace(/_/g, ' ')}
                  </h3>
                </div>

                <button
                  onClick={() => handleDeleteMemory(m.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-all"
                  title="Delete Record"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/70 text-xs text-neutral-300 leading-relaxed font-mono">
                {typeof m.value === 'object' ? JSON.stringify(m.value, null, 2) : String(m.value)}
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                <span>Confidence: {m.confidence_pct || 90}%</span>
                <span>Source: {m.source || 'verified'}</span>
                <span>Updated: {new Date(m.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-emerald-400" /> New Knowledge Record
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Concept / Key Name</label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. average_customer_ltv"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Value / Fact Content</label>
                <textarea
                  rows={3}
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. $14,200 based on 18-month historical cohort retention."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="business_fundamentals">Business Fundamentals</option>
                    <option value="products_and_services">Products & Services</option>
                    <option value="customer_profiles">Customer Profiles</option>
                    <option value="pricing_and_unit_economics">Pricing & Unit Economics</option>
                    <option value="strategic_goals">Strategic Goals</option>
                    <option value="validated_findings">Validated Findings</option>
                    <option value="important_decisions">Important Decisions</option>
                    <option value="active_problems">Active Problems</option>
                    <option value="operational_learnings">Operational Learnings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Reliability</label>
                  <select
                    value={newReliability}
                    onChange={(e) => setNewReliability(e.target.value as InformationReliability)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="verified_fact">Verified Fact</option>
                    <option value="user_provided">User-Provided</option>
                    <option value="estimate">Estimate</option>
                    <option value="assumption">Assumption</option>
                    <option value="hypothesis">Hypothesis</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors"
              >
                Store in Business Memory Bank
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
