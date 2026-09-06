import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MarketingAsset } from '../../types';
import {
  Sparkles,
  Megaphone,
  Mail,
  Send,
  Share2,
  FileCode,
  Layers,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Target,
  FileText,
  DollarSign,
  AlertCircle,
  X,
  Eye,
  Sliders,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MarketingStudioViewProps {
  onNavigateToApprovals?: () => void;
  onNavigateToGrowth?: () => void;
  onNavigateToTasks?: () => void;
}

export const MarketingStudioView: React.FC<MarketingStudioViewProps> = ({
  onNavigateToApprovals,
  onNavigateToGrowth,
  onNavigateToTasks,
}) => {
  const { token, activeBusiness, activeProfile } = useAuth();

  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MarketingAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [contentType, setContentType] = useState<string>('offer');
  const [channel, setChannel] = useState<string>('linkedin');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [focusTopic, setFocusTopic] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // Regeneration Modal State
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenFeedback, setRegenFeedback] = useState('');

  // Approval Submission Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalBudget, setApprovalBudget] = useState<number>(0);
  const [approvalTarget, setApprovalTarget] = useState<string>('');

  // Filter state for library
  const [filterType, setFilterType] = useState<string>('all');

  const contentTypes = [
    { id: 'offer', label: 'Grand Slam Offer', icon: Target, desc: 'High-margin, risk-reversal offer with dream outcome framing' },
    { id: 'ad', label: 'Direct-Response Ad', icon: Megaphone, desc: 'Meta / LinkedIn ad copy with high-contrast visual hook' },
    { id: 'campaign', label: 'Launch Campaign', icon: Layers, desc: 'Chronological multi-channel acquisition roadmap' },
    { id: 'sales_message', label: 'Direct Cold DM', icon: Send, desc: 'Pain-focused, personalized outbound message' },
    { id: 'followup_message', label: '3-Touch Follow-Up', icon: Clock, desc: 'Value-drop follow-up cadence (Day 3, 7, 14)' },
    { id: 'email_campaign', label: '4-Part Email Nurture', icon: Mail, desc: 'Automated email sequence with high open rates' },
    { id: 'landing_page_copy', label: 'Landing Page Stack', icon: FileCode, desc: 'Hero headline, proof pillars, and guarantee' },
    { id: 'social_post', label: 'Authority Post', icon: Share2, desc: 'High-engagement LinkedIn & X breakdown' },
    { id: 'caption', label: 'Short-Form Caption', icon: FileText, desc: 'Concise punchy copy for reels and carousels' },
  ];

  const channels = [
    { id: 'linkedin', label: 'LinkedIn B2B' },
    { id: 'meta', label: 'Meta (FB / IG Ads)' },
    { id: 'google_search', label: 'Google Search Ads' },
    { id: 'email', label: 'Cold Email / Outreach' },
    { id: 'landing_page', label: 'Website / Landing Page' },
    { id: 'twitter', label: 'X / Twitter' },
    { id: 'direct_chat', label: 'Direct SMS / WhatsApp' },
  ];

  const fetchAssets = async () => {
    if (!token || !activeBusiness) return;
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/studio/assets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
        if (data.length > 0 && !selectedAsset) {
          setSelectedAsset(data[0]);
          setEditTitle(data[0].title);
          setEditContent(data[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to fetch studio assets:', err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [token, activeBusiness]);

  useEffect(() => {
    if (activeProfile && !targetAudience) {
      setTargetAudience(activeProfile.target_customers || 'B2B Decision Makers');
    }
  }, [activeProfile]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeBusiness) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: activeBusiness.id,
          content_type: contentType,
          channel,
          target_audience: targetAudience || activeProfile?.target_customers,
          focus_topic: focusTopic,
          custom_prompt: customPrompt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Generation failed');
      }

      const newAsset: MarketingAsset = await res.json();
      setAssets((prev) => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
      setEditTitle(newAsset.title);
      setEditContent(newAsset.content);
      setActiveTab('library');
      setNotification(`"${newAsset.title}" generated and saved to library.`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate marketing asset');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedAsset || !token) return;
    try {
      const res = await fetch(`/api/studio/assets/${selectedAsset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (res.ok) {
        const updated: MarketingAsset = await res.json();
        setSelectedAsset(updated);
        setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setIsEditing(false);
        setNotification('Asset revisions saved (Version updated).');
      }
    } catch (err) {
      console.error('Save edit error:', err);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedAsset || !token) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/studio/assets/${selectedAsset.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback: regenFeedback }),
      });

      if (res.ok) {
        const updated: MarketingAsset = await res.json();
        setSelectedAsset(updated);
        setEditTitle(updated.title);
        setEditContent(updated.content);
        setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setShowRegenModal(false);
        setRegenFeedback('');
        setNotification('Asset refined and regenerated with feedback.');
      }
    } catch (err) {
      console.error('Regenerate error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleConvertToTask = async (asset: MarketingAsset) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/studio/assets/${asset.id}/convert-to-task`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, approval_status: 'converted_to_task' } : a)));
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset((prev) => (prev ? { ...prev, approval_status: 'converted_to_task' } : null));
        }
        setNotification('Marketing asset converted into an active Growth Sprint Task.');
      }
    } catch (err) {
      console.error('Convert task error:', err);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!selectedAsset || !token) return;
    try {
      const res = await fetch(`/api/studio/assets/${selectedAsset.id}/submit-for-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel_target: approvalTarget || selectedAsset.channel,
          financial_amount_usd: Number(approvalBudget) || 0,
        }),
      });

      if (res.ok) {
        setAssets((prev) =>
          prev.map((a) => (a.id === selectedAsset.id ? { ...a, approval_status: 'pending_approval' } : a))
        );
        setSelectedAsset((prev) => (prev ? { ...prev, approval_status: 'pending_approval' } : null));
        setShowApprovalModal(false);
        setNotification('Submitted to Approval Queue. Human authorization required before dispatch.');
      }
    } catch (err) {
      console.error('Submit approval error:', err);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!token || !confirm('Delete this marketing asset?')) return;
    try {
      const res = await fetch(`/api/studio/assets/${assetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
        if (selectedAsset?.id === assetId) {
          const remaining = assets.filter((a) => a.id !== assetId);
          setSelectedAsset(remaining.length > 0 ? remaining[0] : null);
        }
        setNotification('Asset deleted from library.');
      }
    } catch (err) {
      console.error('Delete asset error:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter((a) => {
    if (filterType === 'all') return true;
    return a.content_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              Venturevo Studio
            </span>
            <span className="text-xs text-neutral-400">High-Converting Direct-Response Engine</span>
          </div>
          <h1 className="text-xl font-bold font-display text-neutral-100 mt-1">
            Marketing & Business Content Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl">
            Generate Grand Slam offers, targeted ad creative, multi-channel launch campaigns, and outbound sales copy grounded strictly in your verified business economics.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950 p-1">
          <button
            id="tab-create-asset"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Generate New
          </button>
          <button
            id="tab-library-asset"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'library'
                ? 'bg-emerald-600 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Asset Library ({assets.length})
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main View Mode */}
      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Asset Specification (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-5">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              1. Choose Asset Archetype
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {contentTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = contentType === t.id;
                return (
                  <button
                    key={t.id}
                    id={`type-${t.id}`}
                    type="button"
                    onClick={() => setContentType(t.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-600/80 text-neutral-100 shadow-sm'
                        : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                      <span className="font-semibold text-xs truncate">{t.label}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-tight">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 pt-3 border-t border-neutral-800">
              {/* Channel Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Deployment Channel
                </label>
                <select
                  id="studio-channel-select"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Target Customer Avatar / ICP
                </label>
                <input
                  id="studio-icp-input"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Mid-Market Warehouse Directors & 3PL Logistics VPs"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Focus Topic or Hook */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Primary Hook / Pain Angle
                </label>
                <input
                  id="studio-hook-input"
                  type="text"
                  value={focusTopic}
                  onChange={(e) => setFocusTopic(e.target.value)}
                  placeholder="e.g. 3.2% carrier surcharge leakage & 3-minute audit"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Custom Prompt Constraints */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Custom Constraints (Optional)
                </label>
                <textarea
                  id="studio-custom-prompt"
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Emphasize risk-reversal guarantee, no software install required, $2,400 benchmark"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <button
                id="studio-generate-btn"
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating Direct-Response Copy...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate High-Converting Copy
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Area: Best Practices & Safety Rule Notice (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Venturevo Studio Directives
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-200 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Acute Pain-First Hooks
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Zero generic fluff. Every generated line targets quantified financial leakage, operational bottlenecks, or risk-reversal guarantees.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-200 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                    Approval-First Execution
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    The AI prepares actions. Never sends cold messages, spends ad budget, or publishes content without your explicit 1-click confirmation.
                  </p>
                </div>
              </div>

              {/* Sample Output Preview Showcase */}
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400 font-bold uppercase tracking-wider">
                    Formula Architecture (Alex Hormozi Grand Slam Offer)
                  </span>
                  <span className="text-emerald-400 font-semibold">Grounded in Business Memory</span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-300 font-mono space-y-1">
                  <p><span className="text-emerald-400 font-bold">Dream Outcome:</span> Recover 3.2% in carrier overcharges every month</p>
                  <p><span className="text-teal-400 font-bold">Perceived Likelihood:</span> Automated manifest regex reconciliation script</p>
                  <p><span className="text-amber-400 font-bold">Time Delay:</span> 3-minute turnaround on first sample manifest</p>
                  <p><span className="text-purple-400 font-bold">Effort & Sacrifice:</span> Zero software installation or credit card required</p>
                  <p><span className="text-rose-400 font-bold">Guarantee:</span> 3x ROI or 100% refund guarantee within 60 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Library & Live Editor Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Saved Assets List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Filter Bar */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Filter:
              </span>
              <select
                id="filter-asset-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:outline-none"
              >
                <option value="all">All Types ({assets.length})</option>
                <option value="offer">Offers</option>
                <option value="ad">Ads</option>
                <option value="campaign">Campaigns</option>
                <option value="sales_message">Outbound DMs</option>
                <option value="email_campaign">Emails</option>
                <option value="landing_page_copy">Landing Pages</option>
              </select>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
                No marketing assets found matching criteria.
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setEditTitle(asset.title);
                        setEditContent(asset.content);
                        setIsEditing(false);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-600/70 shadow-sm'
                          : 'bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            {asset.content_type.replace('_', ' ')} • {asset.channel}
                          </span>
                          <h3 className="font-semibold text-neutral-200 truncate mt-0.5">
                            {asset.title}
                          </h3>
                        </div>

                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 flex-shrink-0">
                          v{asset.version || 1}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                        <span
                          className={`font-semibold uppercase tracking-wider ${
                            asset.approval_status === 'approved'
                              ? 'text-emerald-400'
                              : asset.approval_status === 'pending_approval'
                              ? 'text-amber-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {asset.approval_status?.replace('_', ' ') || 'Draft'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Asset Detail, Live Markdown Preview & Actions (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedAsset ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-5">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                        {selectedAsset.content_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-neutral-400">
                        Channel: <strong className="text-neutral-200 capitalize">{selectedAsset.channel}</strong>
                      </span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-base font-bold text-neutral-100 focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-lg font-bold text-neutral-100 mt-1">
                        {selectedAsset.title}
                      </h2>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => copyToClipboard(selectedAsset.content, selectedAsset.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                      title="Copy to Clipboard"
                    >
                      {copiedId === selectedAsset.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </button>

                    {isEditing ? (
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Save Edits
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                    )}

                    <button
                      onClick={() => setShowRegenModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Refine & Regenerate
                    </button>

                    <button
                      onClick={() => handleDeleteAsset(selectedAsset.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content Box (Markdown Render vs Live Editor) */}
                {isEditing ? (
                  <textarea
                    rows={12}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs font-mono leading-relaxed focus:outline-none resize-y"
                  />
                ) : (
                  <div className="p-5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 prose prose-invert max-w-none text-xs leading-relaxed text-neutral-200">
                    <ReactMarkdown>{selectedAsset.content}</ReactMarkdown>
                  </div>
                )}

                {/* Bottom Conversion & Safety Gate Buttons */}
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">
                      Execution & Deployment Options
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Schedule into 30-day sprint or submit to safety gate approval queue.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="convert-task-btn"
                      onClick={() => handleConvertToTask(selectedAsset)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                    >
                      <Target className="h-3.5 w-3.5 text-emerald-400" />
                      Convert to Task
                    </button>

                    <button
                      id="submit-approval-btn"
                      onClick={() => {
                        setApprovalTarget(selectedAsset.channel);
                        setShowApprovalModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Submit for Approval
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-center text-neutral-500 space-y-3">
                <Megaphone className="h-10 w-10 mx-auto text-neutral-600 opacity-60" />
                <h3 className="text-sm font-semibold text-neutral-300">
                  Select a Marketing Asset to Inspect
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click on an asset from your library to review copy, edit headline parameters, or submit to the Approval Queue.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                Refine & Regenerate Asset
              </h3>
              <button onClick={() => setShowRegenModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Provide feedback for the AI copywriter to iterate on tone, length, urgency, or specific value claims:
            </p>

            <textarea
              rows={4}
              value={regenFeedback}
              onChange={(e) => setRegenFeedback(e.target.value)}
              placeholder="e.g. Make the hook more confrontational about lost revenue, emphasize 3.2% surcharge discrepancy, and make the guarantee unconditional."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-neutral-950 text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
              >
                {isRegenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Regenerate Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Queue Submission Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Submit to Approval Queue
              </h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              In accordance with Venturevo's <strong>Approval-First Guarantee</strong>, no external message or financial ad spend will execute without your final explicit 1-click confirmation in the Approval Queue.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Destination Channel / Target
                </label>
                <input
                  type="text"
                  value={approvalTarget}
                  onChange={(e) => setApprovalTarget(e.target.value)}
                  placeholder="e.g. LinkedIn Sponsored Ads, Cold Email Campaign"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Allocated Ad Budget / Financial Authorization (USD)
                </label>
                <div className="relative">
                  <DollarSign className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    value={approvalBudget}
                    onChange={(e) => setApprovalBudget(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Leave 0 if this action does not incur paid ad spend.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitForApproval}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-neutral-950 text-xs font-bold hover:bg-emerald-500"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Confirm Queue Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
