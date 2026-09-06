import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoadLocationReport, RoadBusinessIdea } from '../../types';
import {
  MapPin,
  TrendingUp,
  Search,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign,
  Briefcase,
  AlertTriangle,
  FileText,
  Copy,
  Layers,
  ArrowRight,
  Compass,
  Zap,
} from 'lucide-react';

export const LocationIntelligenceView: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<RoadLocationReport[]>([]);
  const [popularCorridors, setPopularCorridors] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<RoadLocationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingPopular, setIsSearchingPopular] = useState(false);

  // Form State
  const [roadName, setRoadName] = useState('');
  const [city, setCity] = useState('Lagos');
  const [stateOrRegion, setStateOrRegion] = useState('Lagos State');
  const [country, setCountry] = useState('Nigeria');
  const [budget, setBudget] = useState(5000);
  const [targetSector, setTargetSector] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/location-intelligence/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          setSelectedReport(data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching location reports:', e);
    }
  };

  const fetchPopular = async () => {
    try {
      const res = await fetch('/api/location-intelligence/popular-corridors');
      if (res.ok) {
        const data = await res.json();
        setPopularCorridors(data);
      }
    } catch (e) {
      console.error('Error fetching popular corridors:', e);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchPopular();
  }, [token]);

  const handleAnalyzeRoad = async (e?: React.FormEvent, presetRoad?: any) => {
    if (e) e.preventDefault();

    const targetRoad = presetRoad ? presetRoad.road_name : roadName;
    const targetCity = presetRoad ? presetRoad.city : city;
    const targetState = presetRoad ? presetRoad.state : stateOrRegion;
    const targetCountry = presetRoad ? presetRoad.country : country;

    if (!targetRoad) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/location-intelligence/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          road_name: targetRoad,
          city: targetCity,
          state_or_region: targetState,
          country: targetCountry,
          budget: Number(budget),
          target_sector: targetSector,
        }),
      });

      if (res.ok) {
        const report = await res.json();
        setSelectedReport(report);
        setReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
      }
    } catch (e) {
      console.error('Error analyzing road:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPopular = (corridor: any) => {
    setRoadName(corridor.road_name);
    setCity(corridor.city);
    setStateOrRegion(corridor.state);
    setCountry(corridor.country);
    handleAnalyzeRoad(undefined, corridor);
  };

  const copyAgentBrief = (briefText: string) => {
    navigator.clipboard.writeText(briefText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const googleMapsUrl = selectedReport
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${selectedReport.road_name}, ${selectedReport.city}, ${selectedReport.country}`
      )}`
    : '#';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-100 font-display">
                Hyperlocal Road & Corridor Intelligence
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Nigeria & Global
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Identify high-profit businesses for specific roads, evaluate street traffic synergies, connect with verified leasing agents, and execute a billionaire scaling roadmap.
            </p>
          </div>
        </div>

        {selectedReport && (
          <a
            id="link-google-maps-view"
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition flex-shrink-0"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3 ml-0.5 text-neutral-400" />
          </a>
        )}
      </div>

      {/* Popular Corridors Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>High-Yield Arterial Corridors (Instant Audit)</span>
          </span>
          <span className="text-[11px] text-neutral-500">Tap to analyze</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {popularCorridors.map((c, idx) => (
            <button
              key={idx}
              id={`popular-corridor-${idx}`}
              onClick={() => handleSelectPopular(c)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-emerald-300 hover:border-emerald-700/50 transition flex items-center gap-1.5"
            >
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{c.road_name}</span>
              <span className="text-[10px] text-neutral-500">({c.city})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Analyzer Form */}
      <form
        onSubmit={handleAnalyzeRoad}
        className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">Specific Road / Street Name *</label>
            <input
              id="input-road-name"
              type="text"
              required
              value={roadName}
              onChange={(e) => setRoadName(e.target.value)}
              placeholder="e.g. Allen Avenue, Admiralty Way, Oxford St"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">City / Metro *</label>
            <input
              id="input-city-name"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lagos, Abuja, London"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">State / Region</label>
            <input
              id="input-state-name"
              type="text"
              value={stateOrRegion}
              onChange={(e) => setStateOrRegion(e.target.value)}
              placeholder="e.g. Lagos State, FCT"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">Country</label>
            <input
              id="input-country-name"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Nigeria"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">Available Budget / Capital (Est. USD/NGN)</label>
            <input
              id="input-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">Preferred Sector (Optional)</label>
            <input
              id="input-target-sector"
              type="text"
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
              placeholder="e.g. Food & Beverage, Tech Retail, Healthcare"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            id="btn-run-location-analysis"
            type="submit"
            disabled={isLoading || !roadName}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-neutral-950 transition shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Auditing Traffic & Yield...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Evaluate Road & Corridor Potential</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Selected Report Display */}
      {selectedReport && (
        <div className="space-y-6">
          {/* Corridor Characteristics Header */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Location Audit Report
                </span>
                <h2 className="text-lg font-bold text-neutral-100 mt-0.5">
                  {selectedReport.road_name}, {selectedReport.city}
                </h2>
                <p className="text-xs text-neutral-400">
                  {selectedReport.state_or_region}, {selectedReport.country}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Traffic: {selectedReport.traffic_density}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Tier: {selectedReport.purchasing_power_tier}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <span className="font-semibold text-neutral-400 block mb-1">Commercial Atmosphere & Vibe:</span>
                <p className="text-neutral-200 leading-relaxed">{selectedReport.commercial_vibe}</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                <span className="font-semibold text-neutral-400 block mb-1">Anchor Traffic Magnets:</span>
                <ul className="space-y-1">
                  {selectedReport.anchor_commercial_magnets?.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-neutral-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended High-Profit Businesses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span>Highest-Profit Business Concepts for {selectedReport.road_name}</span>
              </h3>
              <span className="text-xs text-neutral-500">Ranked by margin & traffic synergy</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {selectedReport.recommended_businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4 hover:border-emerald-700/40 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {biz.sector}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {biz.net_profit_margin_pct}% Margin
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-100 leading-snug">
                      {biz.title}
                    </h4>

                    <p className="text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300">Target Customer:</span> {biz.target_audience}
                    </p>

                    <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Est. Monthly Rev:</span>
                        <span className="font-bold text-emerald-400">{biz.estimated_monthly_revenue_local}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Startup Capex:</span>
                        <span className="font-bold text-neutral-200">{biz.startup_capex_local}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Breakeven:</span>
                        <span className="font-semibold text-neutral-300">{biz.breakeven_months} Months</span>
                      </div>
                    </div>

                    {/* Road Traffic Synergy Rationale */}
                    <div className="p-2.5 rounded-lg bg-neutral-950 text-[11px] text-neutral-300 border border-neutral-800/80 leading-relaxed">
                      <span className="font-semibold text-emerald-400 block mb-0.5">Why this road works:</span>
                      {biz.traffic_synergy_reason}
                    </div>

                    {/* High Margin Product Selection */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-neutral-400">Top High-Margin SKUs:</span>
                      <ul className="text-[11px] text-neutral-300 space-y-1">
                        {biz.high_margin_products?.map((p, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1">
                            <span className="text-emerald-400">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-500 border-t border-neutral-800/80 pt-2">
                    <span className="font-semibold text-neutral-400">Risk Mitigation:</span> {biz.key_risks_and_mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Leasing Agent Protocol & Anti-Fraud Guide */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  Local Agent Leasing Protocol & Inspection Framework
                </h3>
              </div>
              <span className="text-xs text-neutral-500">Shop / Kiosk Acquisition</span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedReport.agent_leasing_protocol.overview}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Fee Structure */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span>Standard Industry Fee Ceilings:</span>
                </span>
                <ul className="space-y-1.5 text-neutral-300">
                  {selectedReport.agent_leasing_protocol.fee_structure_guide.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inspection Checklist */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>On-Site Road Inspection Checklist:</span>
                </span>
                <ul className="space-y-1.5 text-neutral-300">
                  {selectedReport.agent_leasing_protocol.inspection_checklist.map((c, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Anti-Fraud Safeguards & Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Landlord Verification Steps:</span>
                </span>
                <ul className="space-y-1 text-neutral-300">
                  {selectedReport.agent_leasing_protocol.verification_steps.map((v, vIdx) => (
                    <li key={vIdx}>• {v}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Red Flags to Avoid (Ghost Agents):</span>
                </span>
                <ul className="space-y-1 text-neutral-300">
                  {selectedReport.agent_leasing_protocol.red_flags_to_avoid.map((r, rIdx) => (
                    <li key={rIdx}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Copyable Agent Brief */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copyable WhatsApp / Agent Negotiation Brief</span>
                </span>
                <button
                  id="btn-copy-agent-brief"
                  onClick={() => copyAgentBrief(selectedReport.agent_leasing_protocol.sample_agent_brief)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-700 transition"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Brief'}</span>
                </button>
              </div>
              <p className="text-xs text-neutral-300 font-mono bg-neutral-900/80 p-3 rounded-lg border border-neutral-800/80 leading-relaxed select-all">
                "{selectedReport.agent_leasing_protocol.sample_agent_brief}"
              </p>
            </div>
          </div>

          {/* Billionaire Enterprise Scaling Roadmap */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  4-Phase Zero-to-Billionaire Scaling Roadmap
                </h3>
              </div>
              <span className="text-xs text-purple-400 font-semibold">Long-Term Compounding</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Phase 1 */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Phase 1: {selectedReport.scaling_roadmap.phase_1_launch.duration}
                </span>
                <h4 className="font-bold text-neutral-200">Pilot Launch on {selectedReport.road_name}</h4>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Target: {selectedReport.scaling_roadmap.phase_1_launch.target_metric}
                </p>
                <ul className="space-y-1 text-neutral-400 text-[11px] pt-1">
                  {selectedReport.scaling_roadmap.phase_1_launch.actions.map((a, aIdx) => (
                    <li key={aIdx}>• {a}</li>
                  ))}
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Phase 2: {selectedReport.scaling_roadmap.phase_2_multi_unit.duration}
                </span>
                <h4 className="font-bold text-neutral-200">Multi-Unit Corridor Expansion</h4>
                <p className="text-[11px] text-blue-400 font-semibold">
                  Target: {selectedReport.scaling_roadmap.phase_2_multi_unit.target_metric}
                </p>
                <ul className="space-y-1 text-neutral-400 text-[11px] pt-1">
                  {selectedReport.scaling_roadmap.phase_2_multi_unit.actions.map((a, aIdx) => (
                    <li key={aIdx}>• {a}</li>
                  ))}
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Phase 3: {selectedReport.scaling_roadmap.phase_3_supply_chain.duration}
                </span>
                <h4 className="font-bold text-neutral-200">Centralized Supply Chain</h4>
                <p className="text-[11px] text-amber-400 font-semibold">
                  Target: {selectedReport.scaling_roadmap.phase_3_supply_chain.target_metric}
                </p>
                <ul className="space-y-1 text-neutral-400 text-[11px] pt-1">
                  {selectedReport.scaling_roadmap.phase_3_supply_chain.actions.map((a, aIdx) => (
                    <li key={aIdx}>• {a}</li>
                  ))}
                </ul>
              </div>

              {/* Phase 4 */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                  Phase 4: {selectedReport.scaling_roadmap.phase_4_enterprise_conglomerate.duration}
                </span>
                <h4 className="font-bold text-neutral-200">Enterprise Conglomerate & IPO</h4>
                <p className="text-[11px] text-purple-400 font-semibold">
                  Target: {selectedReport.scaling_roadmap.phase_4_enterprise_conglomerate.target_metric}
                </p>
                <ul className="space-y-1 text-neutral-400 text-[11px] pt-1">
                  {selectedReport.scaling_roadmap.phase_4_enterprise_conglomerate.actions.map((a, aIdx) => (
                    <li key={aIdx}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Highest Leverage Immediate Next Action */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Next Action
                </span>
                <p className="text-xs font-semibold text-neutral-200 mt-0.5">
                  {selectedReport.highest_leverage_next_action}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
