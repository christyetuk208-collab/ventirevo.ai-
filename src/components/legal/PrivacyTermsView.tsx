import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileText,
  Brain,
  Building,
  UserX,
  Sparkles,
} from 'lucide-react';

export const PrivacyTermsView: React.FC = () => {
  const { token, activeBusiness, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'data_control'>('terms');

  // Purge modals & states
  const [purgeMemoryLoading, setPurgeMemoryLoading] = useState(false);
  const [deleteBusinessLoading, setDeleteBusinessLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showConfirmMemory, setShowConfirmMemory] = useState(false);
  const [showConfirmBusiness, setShowConfirmBusiness] = useState(false);
  const [showConfirmAccount, setShowConfirmAccount] = useState(false);

  const handlePurgeMemory = async () => {
    if (!activeBusiness) return;
    setPurgeMemoryLoading(true);
    try {
      const res = await fetch('/api/privacy/purge-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ business_id: activeBusiness.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: data.message || 'Business memory records permanently wiped.' });
        setShowConfirmMemory(false);
      } else {
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to wipe memory.' });
      }
    } catch (e) {
      setFeedbackMessage({ type: 'error', text: 'Network exception during memory purge.' });
    } finally {
      setPurgeMemoryLoading(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!activeBusiness) return;
    setDeleteBusinessLoading(true);
    try {
      const res = await fetch('/api/privacy/delete-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ business_id: activeBusiness.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: 'Venture and all cascading records successfully deleted. Refreshing...' });
        setShowConfirmBusiness(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to delete business.' });
      }
    } catch (e) {
      setFeedbackMessage({ type: 'error', text: 'Network exception during business deletion.' });
    } finally {
      setDeleteBusinessLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountLoading(true);
    try {
      const res = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert('Your account, sessions, and data have been permanently erased.');
        logout();
      } else {
        setFeedbackMessage({ type: 'error', text: data.error || 'Failed to delete account.' });
      }
    } catch (e) {
      setFeedbackMessage({ type: 'error', text: 'Network exception during account erasure.' });
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/40 border border-neutral-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-100 font-display">
                Privacy, Legal & Governance
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Statutory & User Control
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Transparent terms of service, AI fiduciary disclaimers, and irreversible data purge controls.
            </p>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
              : 'bg-red-950/70 border-red-700/60 text-red-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/80 border border-neutral-800">
        <button
          id="legal-tab-terms"
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'terms'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>Terms of Service & AI Disclaimers</span>
        </button>

        <button
          id="legal-tab-privacy"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'privacy'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Privacy Policy</span>
        </button>

        <button
          id="legal-tab-data-control"
          onClick={() => setActiveTab('data_control')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'data_control'
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
          <span>Data Erasure & Purge Suite</span>
        </button>
      </div>

      {/* CONTENT: TERMS OF SERVICE */}
      {activeTab === 'terms' && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-5 text-neutral-300 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-200 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Core Operational Declarations</span>
            </h3>
            <ul className="space-y-1 text-xs">
              <li>• <strong>AI Provides Strategic Assistance:</strong> Venturevo AI generates hypotheses, strategic drafts, road analyses, and analytical frameworks.</li>
              <li>• <strong>Results Are Not Guaranteed:</strong> Market response, customer conversion, and economic conditions vary; no specific performance is assured.</li>
              <li>• <strong>Business Success Is Not Guaranteed:</strong> Entrepreneurial execution carries intrinsic market risks.</li>
              <li>• <strong>The User Holds Final Authority:</strong> You, as the founder/operator, make all final commercial, financial, and operational decisions.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-100">1. Acceptance of Terms</h4>
            <p>
              By accessing or using the Venturevo AI software platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the platform.
            </p>

            <h4 className="font-bold text-sm text-neutral-100">2. Nature of the AI Service</h4>
            <p>
              Venturevo AI is an advanced business intelligence and strategic decision-support engine. The calculations, opportunity scores, corridor foot-traffic assessments, competitor tear-downs, and financial simulations are probabilistic models designed to accelerate founder problem-solving.
            </p>

            <h4 className="font-bold text-sm text-neutral-100">3. Non-Fiduciary & Professional Disclaimer</h4>
            <p>
              Venturevo AI is not a registered investment advisor, certified public accountant (CPA), licensed attorney, or broker-dealer. Information provided through our service does not constitute certified legal, tax, or financial advice. You are advised to consult licensed professionals before entering into binding commercial leases or executing capital allocations.
            </p>

            <h4 className="font-bold text-sm text-neutral-100">4. Prohibited Uses</h4>
            <p>
              You agree not to use Venturevo AI for any unlawful activities, spam email dissemination, fraud, intellectual property infringement, or malicious reverse-engineering of system prompts and AI models.
            </p>
          </div>
        </div>
      )}

      {/* CONTENT: PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-5 text-neutral-300 text-xs leading-relaxed">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-neutral-100">1. Data Ownership & Sovereignty</h3>
            <p>
              You retain 100% intellectual property ownership of all proprietary business data, financials, customer personas, and strategic notes entered into Venturevo AI. We do not sell your personal or corporate data to third parties.
            </p>

            <h3 className="font-bold text-sm text-neutral-100">2. Business Memory & LLM Training Isolation</h3>
            <p>
              Your verified business memory items and multimodal uploaded documents are stored in dedicated encrypted collections with strict Row-Level Security (RLS). Your proprietary venture data is NEVER used to train public foundation models.
            </p>

            <h3 className="font-bold text-sm text-neutral-100">3. Subprocessors & Sovereign Infrastructure</h3>
            <p>
              We utilize enterprise cloud infrastructure and verified high-tier AI model APIs via server-side isolated proxy endpoints with zero client-side API key leakage.
            </p>

            <h3 className="font-bold text-sm text-neutral-100">4. GDPR / CCPA Right to Erasure</h3>
            <p>
              You maintain the absolute right to permanently delete your verified memory records, specific ventures, or your complete user account at any time using the Data Erasure Suite below.
            </p>
          </div>
        </div>
      )}

      {/* CONTENT: DATA PURGE SUITE */}
      {activeTab === 'data_control' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              <span>Granular Data Purge & Erasure Controls</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              These actions are permanent, immediate, and cannot be undone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Purge Memory */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                  <Brain className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-100">Purge Business Memory</h4>
                <p className="text-xs text-neutral-400">
                  Wipe all verified facts, learned strategic patterns, and extracted insights for <strong>{activeBusiness?.name}</strong>.
                </p>
              </div>

              {showConfirmMemory ? (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <p className="text-[11px] text-amber-300 font-semibold">Are you sure? This cannot be reversed.</p>
                  <div className="flex gap-2">
                    <button
                      id="btn-confirm-purge-memory"
                      onClick={handlePurgeMemory}
                      disabled={purgeMemoryLoading}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-neutral-950 transition"
                    >
                      {purgeMemoryLoading ? 'Wiping...' : 'Confirm Purge'}
                    </button>
                    <button
                      onClick={() => setShowConfirmMemory(false)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-neutral-800 text-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="btn-trigger-purge-memory"
                  onClick={() => setShowConfirmMemory(true)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-amber-950/60 text-amber-400 border border-neutral-700 hover:border-amber-800 transition"
                >
                  Purge Verified Memory
                </button>
              )}
            </div>

            {/* Delete Venture */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 w-fit">
                  <Building className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-100">Delete Current Venture</h4>
                <p className="text-xs text-neutral-400">
                  Permanently delete <strong>{activeBusiness?.name}</strong> including all plans, tasks, diagnostics, and uploads.
                </p>
              </div>

              {showConfirmBusiness ? (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <p className="text-[11px] text-red-300 font-semibold">Irreversible action! Confirm delete?</p>
                  <div className="flex gap-2">
                    <button
                      id="btn-confirm-delete-business"
                      onClick={handleDeleteBusiness}
                      disabled={deleteBusinessLoading}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-neutral-100 transition"
                    >
                      {deleteBusinessLoading ? 'Deleting...' : 'Delete Venture'}
                    </button>
                    <button
                      onClick={() => setShowConfirmBusiness(false)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-neutral-800 text-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="btn-trigger-delete-business"
                  onClick={() => setShowConfirmBusiness(true)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-red-950/60 text-red-400 border border-neutral-700 hover:border-red-800 transition"
                >
                  Delete Venture Data
                </button>
              )}
            </div>

            {/* Delete Account */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-red-950 text-red-400 w-fit border border-red-800">
                  <UserX className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-100">Erase Entire Account</h4>
                <p className="text-xs text-neutral-400">
                  Complete Right-to-be-Forgotten erasure. Deletes user login, subscriptions, all ventures, and audit history.
                </p>
              </div>

              {showConfirmAccount ? (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <p className="text-[11px] text-red-400 font-bold">ALL DATA WILL BE DESTROYED.</p>
                  <div className="flex gap-2">
                    <button
                      id="btn-confirm-delete-account"
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountLoading}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-700 hover:bg-red-600 text-neutral-100 transition"
                    >
                      {deleteAccountLoading ? 'Erasing...' : 'Erase Everything'}
                    </button>
                    <button
                      onClick={() => setShowConfirmAccount(false)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-neutral-800 text-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="btn-trigger-delete-account"
                  onClick={() => setShowConfirmAccount(true)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800 transition"
                >
                  Erase Entire Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
