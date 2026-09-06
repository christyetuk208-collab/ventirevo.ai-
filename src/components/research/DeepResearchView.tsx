import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ResearchSession, ResearchSource, BusinessMemoryReliability } from '../../types';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BookmarkPlus,
  Check,
} from 'lucide-react';

export const DeepResearchView: React.FC = () => {
  const { token, activeBusiness } = useAuth();
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [selectedSession, setSelectedSession] = useState<ResearchSession | null>(null);
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [savedMemoryIdx, setSavedMemoryIdx] = useState<number | null>(null);

  const fetchResearch = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/research`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setSources(data.sources || []);
        if (data.sessions?.length > 0 && !selectedSession) {
          setSelectedSession(data.sessions[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load research:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, [activeBusiness?.id]);

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness || !topic.trim()) return;
    setIsResearching(true);
    try {
      const res = await fetch('/api/research/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          topic: topic.trim(),
        }),
      });

      if (res.ok) {
        const newSession = await res.json();
        setSessions([newSession, ...sessions]);
        setSelectedSession(newSession);
        setTopic('');
        await fetchResearch();
      }
    } catch (e) {
      console.error('Failed to run research:', e);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSaveToMemory = async (finding: any, idx: number) => {
    if (!activeBusiness) return;
    try {
      const res = await fetch('/api/research/save-to-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          category: 'validated_findings',
          key: `Research: ${selectedSession?.topic?.slice(0, 35) || 'Finding'}`,
          value: `${finding.claim} (Evidence: ${finding.evidence})`,
          reliability: finding.reliability || 'verified_fact',
          source: `Research Session: ${selectedSession?.topic || 'Evidence Review'}`,
        }),
      });

      if (res.ok) {
        setSavedMemoryIdx(idx);
        setTimeout(() => setSavedMemoryIdx(null), 2500);
      }
    } catch (e) {
      console.error('Failed to save to memory:', e);
    }
  };

  const getReliabilityBadge = (rel: BusinessMemoryReliability) => {
    switch (rel) {
      case 'verified_fact':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Verified Fact
          </span>
        );
      case 'estimate':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-400" /> Economic Estimate
          </span>
        );
      case 'assumption':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-400" /> Assumption (Needs Test)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-purple-400" /> Hypothesis
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Fact-Checked Deep Research Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100">
            Evidence-Based Market & Problem Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Conduct rigorous business research with verified facts, economic estimates, and zero fabricated citations.
          </p>
        </div>
      </div>

      {/* Research Query Bar */}
      <form onSubmit={handleRunResearch} className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter market niche, pricing benchmark, or competitor question (e.g. 3PL carrier surcharge dispute rate)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isResearching || !topic.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10 transition disabled:opacity-50 flex-shrink-0"
          >
            {isResearching ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Evidence...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run Deep Research</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Main Research Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Previous Sessions */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Research History ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 text-center text-xs text-neutral-500">
              No research runs yet. Search any industry topic above.
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = selectedSession?.id === sess.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSession(sess)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-emerald-500/80 bg-neutral-900/90 shadow-md shadow-emerald-500/5'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    <BookOpen className="h-3 w-3" />
                    <span>Evidence Dossier</span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-100 line-clamp-2">
                    {sess.topic}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {sess.summary}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Research Dossier */}
        {selectedSession && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 inline-block mb-2">
                  Completed Research Dossier
                </span>
                <h2 className="text-xl font-bold font-display text-neutral-100">
                  {selectedSession.topic}
                </h2>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  {selectedSession.summary}
                </p>
              </div>

              {/* Categorized Findings */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Structured Findings & Evidence
                </h3>

                <div className="space-y-3">
                  {(selectedSession.findings || []).map((finding: any, idx: number) => {
                    const isSaved = savedMemoryIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2 hover:border-neutral-700 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          {getReliabilityBadge(finding.reliability)}

                          <button
                            type="button"
                            onClick={() => handleSaveToMemory(finding, idx)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-neutral-900 hover:bg-emerald-950/80 text-neutral-300 hover:text-emerald-300 border border-neutral-800 hover:border-emerald-700 transition"
                            title="Save to verified business memory"
                          >
                            {isSaved ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Saved to Memory</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="h-3 w-3" />
                                <span>Save to Business Memory</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs font-semibold text-neutral-100">
                          {finding.claim}
                        </p>

                        <div className="pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                          <strong className="text-neutral-300">Supporting Evidence / Logic:</strong> {finding.evidence}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
