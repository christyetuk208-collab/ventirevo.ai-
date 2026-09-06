import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ReferralRecord } from '../../types';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  DollarSign,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  X,
  Mail,
} from 'lucide-react';

export const ReferralsView: React.FC = () => {
  const { token, user } = useAuth();

  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [stats, setStats] = useState({
    total_referred: 0,
    successful_conversions: 0,
    total_rewards_earned_usd: 0,
    referral_code: '',
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Apply Referral Code Form State
  const [applyCode, setApplyCode] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  const referralLink = `https://venturevo.ai/join?ref=${stats.referral_code || 'FOUNDER20'}`;

  const fetchReferralData = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/referrals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
        setStats(data.stats || {
          total_referred: 0,
          successful_conversions: 0,
          total_rewards_earned_usd: 0,
          referral_code: user?.id?.replace('usr_', 'VO-') || 'VO-GROWTH',
        });
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stats.referral_code || 'FOUNDER20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !token) return;
    setIsSendingInvite(true);
    try {
      const res = await fetch('/api/referrals/create-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (res.ok) {
        setInviteEmail('');
        setNotification(`Invitation dispatched to ${inviteEmail}.`);
        fetchReferralData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to dispatch invite');
      }
    } catch (err) {
      console.error('Invite error:', err);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyCode || !token) return;
    setIsApplyingCode(true);
    try {
      const res = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ referral_code: applyCode }),
      });

      if (res.ok) {
        setApplyCode('');
        setNotification('Referral code applied! $20.00 credit added to your account.');
        fetchReferralData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Invalid referral code');
      }
    } catch (err) {
      console.error('Apply code error:', err);
    } finally {
      setIsApplyingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              Founder Network
            </span>
            <span className="text-xs text-neutral-400">Give $20, Get $20 Growth Credit</span>
          </div>
          <h1 className="text-xl font-bold font-display text-neutral-100 mt-1">
            Referral & Founder Rewards Program
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl">
            Invite fellow operators, founders, and consultants to Venturevo AI. When they activate a workspace, both of you earn $20.00 in subscription credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-emerald-900/20"
          >
            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedLink ? 'Link Copied' : 'Copy Invite Link'}
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

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Founders Invited</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-neutral-100">
            {stats.total_referred}
          </div>
          <span className="text-[10px] text-neutral-500 block">Total dispatched invites</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Active Conversions</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-400">
            {stats.successful_conversions}
          </div>
          <span className="text-[10px] text-neutral-500 block">Qualified founder activations</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Earned Credits</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-neutral-100">
            ${stats.total_rewards_earned_usd.toFixed(2)}
          </div>
          <span className="text-[10px] text-neutral-500 block">Applied to subscription invoices</span>
        </div>
      </div>

      {/* Main 2-Column Section: Share Tools on Left, Redeem / Invites on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Share Code & Dispatches (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-5">
          <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Gift className="h-4 w-4 text-emerald-400" />
            Your Unique Referral Credentials
          </h2>

          {/* Referral Code Box */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Founder Referral Code
            </label>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-base font-bold text-emerald-400 tracking-wider">
                {stats.referral_code || 'FOUNDER20'}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Direct Invite Email Form */}
          <form onSubmit={handleSendInvite} className="space-y-3 pt-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Send Direct Email Invite
            </label>
            <div className="flex gap-2">
              <input
                id="referral-email-input"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@founder.com"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <button
                id="send-invite-btn"
                type="submit"
                disabled={isSendingInvite}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                Invite
              </button>
            </div>
          </form>

          {/* Social Share Buttons */}
          <div className="pt-3 border-t border-neutral-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              1-Click Social Shares
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  'Building our next venture with Venturevo AI — the specialized AI business intelligence and growth system. Use my link for $20 in growth credit: ' + referralLink
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-center font-medium text-neutral-200 transition-colors"
              >
                Share on X / Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-center font-medium text-neutral-200 transition-colors"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Right: Apply a Code & Program Rules (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Apply Referral Code Box */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-4">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Were You Referred by a Founder?
            </h2>
            <p className="text-xs text-neutral-400">
              Enter a friend's referral code to instantly claim $20.00 credit towards your next invoice.
            </p>

            <form onSubmit={handleApplyCode} className="flex gap-2">
              <input
                id="apply-code-input"
                type="text"
                required
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                placeholder="e.g. VO-GROWTH"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-xs focus:border-emerald-500 focus:outline-none uppercase"
              />
              <button
                id="apply-code-btn"
                type="submit"
                disabled={isApplyingCode}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors disabled:opacity-50"
              >
                Claim $20
              </button>
            </form>
          </div>

          {/* Program Integrity & Anti-Fraud Guarantee */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs space-y-2 text-neutral-400">
            <div className="flex items-center gap-1.5 text-neutral-200 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Transparent Credit Rules
            </div>
            <ul className="space-y-1 text-[11px] leading-relaxed list-disc list-inside">
              <li>Credits apply automatically to monthly or annual subscription renewals.</li>
              <li>No expiration date on earned founder credits.</li>
              <li>Self-referrals are automatically filtered to protect community integrity.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Referrals Activity History Table */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 space-y-4">
        <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          Referral Activity History ({referrals.length})
        </h3>

        {referrals.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No referral invitations recorded yet. Share your code above to start earning growth credits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Invited Contact</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Earned Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-neutral-900/40">
                    <td className="py-3 px-3 font-semibold text-neutral-200">{ref.referred_email}</td>
                    <td className="py-3 px-3 text-neutral-400">{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ref.status === 'rewarded'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : ref.status === 'qualified'
                            ? 'bg-teal-950 text-teal-400 border border-teal-800/60'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {ref.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400 text-right">
                      ${Number(ref.reward_value || 20).toFixed(2)} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
