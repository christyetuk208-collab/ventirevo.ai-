import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApprovalAction } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  DollarSign,
  Share2,
  Settings,
  RefreshCw,
  Clock,
  ExternalLink,
  Edit3,
  Check,
  X,
  FileText,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ApprovalQueueView: React.FC = () => {
  const { token, activeBusiness } = useAuth();

  const [actions, setActions] = useState<ApprovalAction[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modify Modal State
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyTitle, setModifyTitle] = useState('');
  const [modifyTarget, setModifyTarget] = useState('');
  const [modifyContent, setModifyContent] = useState('');

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchApprovals = async () => {
    if (!token || !activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/approvals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActions(data);
        if (data.length > 0 && !selectedAction) {
          setSelectedAction(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [token, activeBusiness]);

  const handleApprove = async (action: ApprovalAction) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/approvals/${action.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setActions((prev) => prev.map((a) => (a.id === action.id ? data.action : a)));
        if (selectedAction?.id === action.id) {
          setSelectedAction(data.action);
        }
        setNotification(`Action "${action.title}" was authorized and securely dispatched.`);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to approve action');
      }
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async () => {
    if (!selectedAction || !token) return;
    try {
      const res = await fetch(`/api/approvals/${selectedAction.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason || 'Declined by founder' }),
      });

      if (res.ok) {
        const data = await res.json();
        setActions((prev) => prev.map((a) => (a.id === selectedAction.id ? data.action : a)));
        setSelectedAction(data.action);
        setShowRejectModal(false);
        setRejectReason('');
        setNotification(`Action "${selectedAction.title}" was rejected and canceled.`);
      }
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleModify = async () => {
    if (!selectedAction || !token) return;
    try {
      const res = await fetch(`/api/approvals/${selectedAction.id}/modify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: modifyTitle,
          channel_or_target: modifyTarget,
          payload: {
            ...selectedAction.payload,
            content: modifyContent,
          },
        }),
      });

      if (res.ok) {
        const updated: ApprovalAction = await res.json();
        setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelectedAction(updated);
        setShowModifyModal(false);
        setNotification('Action payload updated successfully.');
      }
    } catch (err) {
      console.error('Modify error:', err);
    }
  };

  const openModifyModal = (action: ApprovalAction) => {
    setSelectedAction(action);
    setModifyTitle(action.title);
    setModifyTarget(action.channel_or_target);
    setModifyContent(action.payload?.content || '');
    setShowModifyModal(true);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'financial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <DollarSign className="h-3 w-3 text-rose-400" /> Financial Spend
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <AlertTriangle className="h-3 w-3 text-rose-400" /> High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Clock className="h-3 w-3 text-amber-400" /> Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Low Risk
          </span>
        );
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_message':
        return <Send className="h-4 w-4 text-emerald-400" />;
      case 'spend_budget':
        return <DollarSign className="h-4 w-4 text-rose-400" />;
      case 'publish_content':
        return <Share2 className="h-4 w-4 text-teal-400" />;
      case 'account_modification':
        return <Settings className="h-4 w-4 text-purple-400" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
    }
  };

  const filteredActions = actions.filter((a) => a.status === activeTab);
  const pendingCount = actions.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner with Strict Safety Commitment */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                Safety Architecture
              </span>
              <span className="text-xs text-neutral-400">Zero Autonomous Financial or External Liability</span>
            </div>
            <h1 className="text-xl font-bold font-display text-neutral-100 mt-1">
              Approval-First Action Queue
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchApprovals}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              Refresh Queue
            </button>
          </div>
        </div>

        {/* The Golden Safety Gate Notice */}
        <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 flex-shrink-0 mt-0.5">
            <Lock className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-neutral-200 block mb-0.5">
              The Venturevo AI Autonomous Safety Guarantee:
            </span>
            <p className="text-neutral-400 leading-relaxed">
              The AI may analyze, diagnose, draft, and prepare high-leverage actions. However, the system is <strong>strictly forbidden</strong> from spending budget, dispatching outbound messages, publishing content, or altering third-party accounts without your direct, explicit 1-click authorization.
            </p>
          </div>
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

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          id="tab-pending-approvals"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          Pending Approval ({pendingCount})
        </button>

        <button
          id="tab-approved-actions"
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'approved'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Approved & Dispatched ({actions.filter((a) => a.status === 'approved').length})
        </button>

        <button
          id="tab-rejected-actions"
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'rejected'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <XCircle className="h-3.5 w-3.5 text-rose-400" />
          Rejected / Dismissed ({actions.filter((a) => a.status === 'rejected').length})
        </button>
      </div>

      {/* Main Layout: Action Cards on Left, Action Payload Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Action Items List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredActions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500 space-y-2">
              <ShieldCheck className="h-8 w-8 mx-auto text-neutral-600 opacity-60" />
              <p>No actions in {activeTab} status.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredActions.map((action) => {
                const isSelected = selectedAction?.id === action.id;
                const hasBudget = Number(action.payload?.financial_amount_usd) > 0;

                return (
                  <div
                    key={action.id}
                    onClick={() => setSelectedAction(action)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-600/70 shadow-sm'
                        : 'bg-neutral-900/50 border-neutral-800/80 hover:bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="p-1.5 rounded-lg bg-neutral-950 text-neutral-200 flex-shrink-0">
                          {getActionIcon(action.action_type)}
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                            {action.action_type.replace('_', ' ')} • {action.channel_or_target}
                          </span>
                          <h3 className="text-xs font-bold text-neutral-100 truncate mt-0.5">
                            {action.title}
                          </h3>
                        </div>
                      </div>
                      {getRiskBadge(action.risk_level)}
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {action.description}
                    </p>

                    {hasBudget && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/30 px-2 py-1 rounded-md border border-rose-900/40">
                        <DollarSign className="h-3 w-3" />
                        Requires Financial Authorization: ${action.payload.financial_amount_usd} USD
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                      <span>Proposed by {action.proposed_by}</span>
                      <span>{new Date(action.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Action Inspector & 1-Click Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedAction ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                      {selectedAction.action_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Target: <strong className="text-neutral-200">{selectedAction.channel_or_target}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-neutral-100 mt-1">
                    {selectedAction.title}
                  </h2>
                </div>
                {getRiskBadge(selectedAction.risk_level)}
              </div>

              {/* Action Description */}
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs text-neutral-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Action Context & Purpose:
                </span>
                {selectedAction.description}
              </div>

              {/* Financial Spend Warning Box if applicable */}
              {Number(selectedAction.payload?.financial_amount_usd) > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-900/80 text-rose-300 flex-shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-rose-200">
                      Financial Spend Authorization: ${selectedAction.payload.financial_amount_usd} USD
                    </h4>
                    <p className="text-rose-300/80 text-[11px] leading-relaxed">
                      Authorizing this action will allocate ad budget from your connected billing method. You can modify or cap this amount before execution.
                    </p>
                  </div>
                </div>
              )}

              {/* Payload Content Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    Prepared Execution Payload
                  </span>
                  {selectedAction.status === 'pending' && (
                    <button
                      onClick={() => openModifyModal(selectedAction)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Edit3 className="h-3 w-3" /> Edit Payload
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 prose prose-invert max-w-none text-xs leading-relaxed text-neutral-200 max-h-72 overflow-y-auto">
                  {selectedAction.payload?.content ? (
                    <ReactMarkdown>{selectedAction.payload.content}</ReactMarkdown>
                  ) : (
                    <p className="text-neutral-500 font-mono text-[11px]">
                      {JSON.stringify(selectedAction.payload, null, 2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Execution Audit Trail / Confirmation Area */}
              {selectedAction.status === 'pending' ? (
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                  <div className="text-xs text-neutral-400">
                    <span>Clicking <strong>Approve & Execute</strong> records your explicit cryptographic audit authorization.</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      id="reject-action-btn"
                      onClick={() => setShowRejectModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject & Dismiss
                    </button>

                    <button
                      id="approve-action-btn"
                      onClick={() => handleApprove(selectedAction)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Execute
                    </button>
                  </div>
                </div>
              ) : selectedAction.status === 'approved' ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Authorized & Dispatched</p>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">
                      Executed at {new Date(selectedAction.executed_at || selectedAction.created_at).toLocaleString()}. Audit token recorded.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-xs text-rose-300">
                  <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Rejected by Founder</p>
                    <p className="text-[11px] text-rose-400/80 mt-0.5">
                      Reason: {selectedAction.rejection_reason || 'Declined'}. No external action was dispatched.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-center text-neutral-500 space-y-3">
              <ShieldCheck className="h-10 w-10 mx-auto text-neutral-600 opacity-60" />
              <h3 className="text-sm font-semibold text-neutral-300">
                Select an Action to Inspect & Authorize
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Review copy payloads, destination parameters, and ad budgets before granting 1-click execution clearance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modify Payload Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-emerald-400" />
                Modify Action Payload
              </h3>
              <button onClick={() => setShowModifyModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  value={modifyTitle}
                  onChange={(e) => setModifyTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Destination Channel / Target
                </label>
                <input
                  type="text"
                  value={modifyTarget}
                  onChange={(e) => setModifyTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Message / Copy Payload
                </label>
                <textarea
                  rows={6}
                  value={modifyContent}
                  onChange={(e) => setModifyContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModify}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-neutral-950 text-xs font-bold hover:bg-emerald-500"
              >
                <Check className="h-3.5 w-3.5" />
                Save Modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-400" />
                Confirm Rejection & Dismissal
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              State the reason for rejecting this action. This feedback helps calibrate future AI-prepared campaigns:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Angle does not match our current positioning, ad spend too high."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-rose-500 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                <XCircle className="h-3.5 w-3.5" />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
