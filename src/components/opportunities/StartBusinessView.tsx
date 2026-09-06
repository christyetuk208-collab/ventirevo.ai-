import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BusinessOpportunity } from '../../types';
import {
  Compass,
  Sparkles,
  ArrowRight,
  DollarSign,
  Clock,
  Shield,
  Briefcase,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  RefreshCw,
  Zap,
  Target,
  FileText,
  Users,
  Building,
  HelpCircle,
} from 'lucide-react';

interface StartBusinessViewProps {
  onLaunched?: (businessId: string) => void;
}

export const StartBusinessView: React.FC<StartBusinessViewProps> = ({ onLaunched }) => {
  const { token, refreshBusinesses } = useAuth();

  // Intake State
  const [step, setStep] = useState<'intake' | 'results'>('intake');
  const [location, setLocation] = useState('United States (Remote / Global)');
  const [capital, setCapital] = useState<number>(1000);
  const [skills, setSkills] = useState<string[]>(['Problem Solving', 'Digital Workflow', 'Client Communication']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [experience, setExperience] = useState('Mid-level professional (5+ years in operational roles)');
  const [availableTime, setAvailableTime] = useState<number>(20);
  const [interests, setInterests] = useState<string[]>(['B2B Software & Automation', 'Operational Efficiency']);
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [businessModelPref, setBusinessModelPref] = useState<'online' | 'physical' | 'hybrid'>('online');
  const [incomeGoal, setIncomeGoal] = useState('$5,000 / month in 6 months');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<BusinessOpportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<BusinessOpportunity | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccessMsg, setLaunchSuccessMsg] = useState<string | null>(null);

  const predefinedSkills = [
    'Software & Automation',
    'Copywriting & Messaging',
    'Outreach & Sales',
    'UI / Graphic Design',
    'Finance & Bookkeeping',
    'Operations & Logistics',
    'Data Analysis',
    'Industry Domain Expertise',
  ];

  const predefinedInterests = [
    'B2B Operations & SaaS',
    'AI-Augmented Services',
    'Healthcare & Compliance',
    'E-Commerce & Logistics',
    'Professional Consulting',
    'Local Small Business Growth',
  ];

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills([...skills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterestInput.trim() && !interests.includes(customInterestInput.trim())) {
      setInterests([...interests, customInterestInput.trim()]);
      setCustomInterestInput('');
    }
  };

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/start-business/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location,
          capital,
          skills,
          experience,
          available_time_hours_per_week: availableTime,
          interests,
          risk_tolerance: riskTolerance,
          business_model_preference: businessModelPref,
          income_goal: incomeGoal,
        }),
      });

      if (!res.ok) throw new Error('Failed to evaluate opportunities');
      const data = await res.json();
      setRecommendedOpportunities(data.opportunities || []);
      if (data.opportunities && data.opportunities.length > 0) {
        setSelectedOpp(data.opportunities[0]);
      }
      setStep('results');
    } catch (e) {
      console.error('Error generating opportunities:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchOpportunity = async (opp: BusinessOpportunity) => {
    setIsLaunching(true);
    try {
      const res = await fetch(`/api/opportunities/${opp.id}/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opportunityData: opp }),
      });

      if (!res.ok) throw new Error('Failed to launch business');
      const data = await res.json();

      await refreshBusinesses();
      setLaunchSuccessMsg(`Venture "${opp.title}" launched successfully with initial 30-day growth sprint!`);

      if (onLaunched) {
        setTimeout(() => {
          onLaunched(data.business.id);
        }, 1200);
      }
    } catch (e) {
      console.error('Error launching opportunity:', e);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="h-4 w-4" />
            <span>Start Your Business Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100">
            Tailored Venture Discovery & Feasibility System
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            We evaluate your exact capital, skills, time, and constraints to recommend high-leverage ventures. No random generic ideas.
          </p>
        </div>

        {step === 'results' && (
          <button
            onClick={() => setStep('intake')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Adjust Constraints
          </button>
        )}
      </div>

      {launchSuccessMsg && (
        <div className="p-4 rounded-xl border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>{launchSuccessMsg}</span>
        </div>
      )}

      {step === 'intake' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Intake Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Location & Capital */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                1. Location & Starting Capital
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Location / Operational Base
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX or Remote / Global"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-neutral-400">Available Starting Capital</label>
                    <span className="text-xs font-bold text-emerald-400">${capital.toLocaleString()} USD</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="250"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>$0 (Sweat Equity)</span>
                    <span>$2,500</span>
                    <span>$5,000</span>
                    <span>$10,000+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Skills & Experience */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
                2. Core Skills & Experience
              </h2>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">
                  Select your strongest skills & advantages:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedSkills.map((sk) => {
                    const isSelected = skills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {sk}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder="Add custom skill..."
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Prior Professional Background / Industry Experience
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 6 years in logistics management, sales operations, or marketing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* 3. Time, Interests & Business Model */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                3. Available Time, Model & Risk Tolerance
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-neutral-400">Available Time per Week</label>
                    <span className="text-xs font-bold text-amber-400">{availableTime} Hours / Wk</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={availableTime}
                    onChange={(e) => setAvailableTime(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>5h (Side Sprint)</span>
                    <span>20h (Part Time)</span>
                    <span>40h+ (Full Time)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Business Model Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['online', 'physical', 'hybrid'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setBusinessModelPref(m)}
                        className={`py-2 rounded-xl text-xs font-medium capitalize border transition ${
                          businessModelPref === m
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Risk Tolerance</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskTolerance(r)}
                        className={`py-2 rounded-xl text-xs font-medium capitalize border transition ${
                          riskTolerance === r
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Realistic Income Goal</label>
                  <input
                    type="text"
                    value={incomeGoal}
                    onChange={(e) => setIncomeGoal(e.target.value)}
                    placeholder="e.g. $5,000 / month in 6 months"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerateRecommendations}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Feasibility & Computing 8-Factor Leverage Scores...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Evaluate My Profile & Recommend Tailored Ventures</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Right Guidance / Principles Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                The Venturevo AI Evaluation Standard
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Most new founders fail because they pick businesses incompatible with their true capital or time capacity.
              </p>
              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Zero Clichés:</strong> No dropshipping junk or generic spam tools.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>8-Factor Scored:</strong> Demand, Fit, Capital, Speed, Risk, Margin, Scalability & Leverage.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>24-Hour Next Action:</strong> Every recommendation gives a concrete first step.</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-2 text-xs text-neutral-400">
              <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                Why We Ask Only These Questions
              </div>
              <p>
                We do not ask for 50-page business plans. We isolate the 9 core variables that determine whether you can acquire your first 5 paying clients in under 30 days.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunities List Column */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Recommended Ventures ({recommendedOpportunities.length})
            </h2>

            {recommendedOpportunities.map((opp) => {
              const isSelected = selectedOpp?.id === opp.id;
              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-emerald-500/80 bg-neutral-900/90 shadow-md shadow-emerald-500/5'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-neutral-100 line-clamp-2">
                      {opp.title}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex-shrink-0">
                      {opp.overall_leverage_score}/100 Leverage
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {opp.problem_solved || opp.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800/70 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Fit: <strong className="text-neutral-200">{opp.founder_fit_score}%</strong></span>
                    <span>Capital: <strong className="text-emerald-400">${opp.capital_required}</strong></span>
                    <span>Speed: <strong className="text-amber-400">{opp.speed_to_first_customer_days}d</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Opportunity Detailed Teardown */}
          {selectedOpp && (
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-6">
                {/* Title & Top Badges */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 inline-block mb-2">
                      Feasibility-Verified Recommendation
                    </span>
                    <h2 className="text-xl font-bold text-neutral-100 font-display">
                      {selectedOpp.title}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      {selectedOpp.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleLaunchOpportunity(selectedOpp)}
                    disabled={isLaunching}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/10 transition flex-shrink-0 disabled:opacity-50"
                  >
                    {isLaunching ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        <span>Launch This Venture</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 8-Factor Leverage Matrix Grid */}
                <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/70">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                    <span>8-Factor Leverage Scorecard</span>
                    <span className="text-emerald-400 font-bold">Overall Score: {selectedOpp.overall_leverage_score}/100</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Market Demand</div>
                      <div className="text-sm font-bold text-neutral-100 mt-0.5">{selectedOpp.demand_score}/100</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Founder Fit</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedOpp.founder_fit_score}/100</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Capital Needed</div>
                      <div className="text-sm font-bold text-neutral-100 mt-0.5">${selectedOpp.capital_required}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Speed to Customer</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{selectedOpp.speed_to_first_customer_days} Days</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Competition</div>
                      <div className="text-sm font-bold capitalize text-neutral-200 mt-0.5">{selectedOpp.competition_level}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Risk Level</div>
                      <div className="text-sm font-bold capitalize text-emerald-400 mt-0.5">{selectedOpp.risk_level}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Gross Margin</div>
                      <div className="text-sm font-bold text-neutral-100 mt-0.5">{selectedOpp.profit_margin_pct || 85}%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                      <div className="text-[10px] text-neutral-500">Scalability</div>
                      <div className="text-sm font-bold text-blue-400 mt-0.5">{selectedOpp.scalability_score}/100</div>
                    </div>
                  </div>
                </div>

                {/* 11 Required Evaluated Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Problem Solved */}
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-1.5">
                    <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-red-400" /> Problem Solved
                    </div>
                    <p className="text-neutral-400 leading-relaxed">
                      {selectedOpp.problem_solved || 'Eliminating acute operational drag and financial leakage.'}
                    </p>
                  </div>

                  {/* Target Customer */}
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-1.5">
                    <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-400" /> Target Customer (ICP)
                    </div>
                    <p className="text-neutral-400 leading-relaxed">
                      {selectedOpp.target_customer || 'Mid-market business owners and department directors.'}
                    </p>
                  </div>

                  {/* Why It Fits */}
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-1.5">
                    <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" /> Why It Fits You
                    </div>
                    <p className="text-neutral-400 leading-relaxed">
                      {selectedOpp.why_it_fits || 'Directly matches your available capital and operational background.'}
                    </p>
                  </div>

                  {/* Demand Evidence */}
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-1.5">
                    <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Demand Evidence
                    </div>
                    <p className="text-neutral-400 leading-relaxed">
                      {selectedOpp.demand_evidence || 'Active recurring budget allocations for point-solution audit services.'}
                    </p>
                  </div>
                </div>

                {/* Startup Requirements & Obstacles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                    <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-cyan-400" /> Startup Requirements
                    </div>
                    <ul className="space-y-1.5 text-neutral-400">
                      {(selectedOpp.startup_requirements || ['Minimal landing page & offer doc', 'Domain email & outbound sequencer', 'Audit template']).map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                    <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Risks & Obstacles
                    </div>
                    <ul className="space-y-1.5 text-neutral-400">
                      {(selectedOpp.risks_and_obstacles || ['Prospect inertia unless pain is quantified upfront', 'Requires clear diagnostic sample']).map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Business Model & 24h Next Action */}
                <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Rocket className="h-3.5 w-3.5" /> 24-Hour Next Action
                    </span>
                    <span className="text-[11px] text-neutral-400">Execute immediately to validate</span>
                  </div>
                  <p className="text-xs text-neutral-200 font-medium">
                    {selectedOpp.next_action || 'Draft a 1-page "Diagnostic Discrepancy Audit" sample and message 10 targeted buyers.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
