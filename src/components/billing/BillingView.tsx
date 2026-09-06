import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Subscription,
  PlanLimits,
  UserUsageQuota,
  InvoiceRecord,
  LocalizedCurrency,
} from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Zap,
  Sparkles,
  CreditCard,
  Download,
  Check,
  TrendingUp,
  Brain,
  FileText,
  Building2,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  AlertCircle,
  HelpCircle,
  X,
  Layers,
  Clock,
  ArrowRight,
  Printer,
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { token, user } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [activePlan, setActivePlan] = useState<PlanLimits | null>(null);
  const [quota, setQuota] = useState<UserUsageQuota | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [plans, setPlans] = useState<PlanLimits[]>([]);
  const [currencies, setCurrencies] = useState<LocalizedCurrency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [faq, setFaq] = useState<Array<{ q: string; a: string }>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Upgrade Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<'free' | 'pro' | 'max'>('pro');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Selected Invoice for Receipt Modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const fetchSubscriptionData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // 1. Fetch Subscription & Quotas
      const subRes = await fetch('/api/billing/subscription', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data.subscription);
        setActivePlan(data.plan);
        setQuota(data.quota);
        setInvoices(data.invoices || []);
        if (data.subscription?.currency) {
          setSelectedCurrency(data.subscription.currency);
        }
      }

      // 2. Fetch Plans & Currencies
      const plansRes = await fetch('/api/billing/plans');
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData.plans || []);
        setCurrencies(pData.currencies || []);
        setFaq(pData.billing_faq || []);
      }
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [token]);

  const activeCurrencyObj = currencies.find((c) => c.code === selectedCurrency) || {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate_multiplier: 1.0,
  };

  const calculatePrice = (priceUsd: number) => {
    const rate = activeCurrencyObj.rate_multiplier || 1.0;
    const symbol = activeCurrencyObj.symbol || '$';
    const converted = (priceUsd * rate).toFixed(0);
    return `${symbol}${converted}`;
  };

  const handleCheckout = async () => {
    if (!token) return;
    setIsProcessingCheckout(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: checkoutTier,
          billing_cycle: billingCycle,
          currency: selectedCurrency,
          payment_method: 'Card ending in 4242',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Checkout failed');
      }

      const result = await res.json();
      setShowCheckoutModal(false);
      setNotification(`Successfully updated plan to ${checkoutTier.toUpperCase()}! Your limits have been upgraded.`);
      fetchSubscriptionData();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token || !confirm('Are you sure you want to cancel? You will keep access until the end of your billing cycle.')) return;
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: 'free',
          billing_cycle: 'monthly',
          currency: 'USD',
        }),
      });

      if (res.ok) {
        setNotification('Subscription canceled. Your account will revert to Free tier at period end.');
        fetchSubscriptionData();
      }
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const renderQuotaBar = (label: string, used: number, limit: number, icon: React.ReactNode) => {
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const isNearLimit = pct >= 80;

    return (
      <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
            {icon}
            {label}
          </span>
          <span className={`font-mono text-[11px] ${isNearLimit ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}>
            {used} / {limit} ({pct}%)
          </span>
        </div>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              Subscription & Value Engine
            </span>
            <span className="text-xs text-neutral-400">Zero Artificial Scarcity • Transparent Pricing</span>
          </div>
          <h1 className="text-xl font-bold font-display text-neutral-100 mt-1">
            Monetization, Plans & Billing
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl">
            Upgrade to higher leverage capacity. Every tier expands deep market research runs, multi-business workspaces, multimodal document teardowns, and verified memory retention.
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
          <Globe className="h-4 w-4 text-emerald-400" />
          <span className="text-[11px] text-neutral-400 font-bold uppercase">Currency:</span>
          <select
            id="billing-currency-select"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-transparent text-xs font-semibold text-neutral-100 focus:outline-none cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code} className="bg-neutral-900 text-neutral-100">
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
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

      {/* 2-Column Overview: Active Plan & Quotas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Plan Status Card (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Active Plan Status
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                subscription?.tier === 'max'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                  : subscription?.tier === 'pro'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {subscription?.tier || 'Free'} Tier
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-neutral-100 capitalize">
              {activePlan?.name || 'Venturevo Free'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {activePlan?.tier === 'max'
                ? 'Maximum business scaling capacity with priority intelligence core.'
                : activePlan?.tier === 'pro'
                ? 'High-leverage growth engine for active operators and founders.'
                : 'Foundational discovery and diagnostic framework.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Billing Cycle:</span>
              <span className="text-neutral-200 font-semibold capitalize">
                {subscription?.billing_cycle || 'Monthly'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Renews / Expires:</span>
              <span className="text-neutral-200 font-semibold">
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'Ongoing'}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Payment Method:</span>
              <span className="text-neutral-200 font-semibold flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> Card ending in 4242
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {subscription?.tier !== 'max' && (
              <button
                id="upgrade-plan-btn"
                onClick={() => {
                  setCheckoutTier(subscription?.tier === 'pro' ? 'max' : 'pro');
                  setShowCheckoutModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-950/40 text-center"
              >
                Upgrade to {subscription?.tier === 'pro' ? 'Max' : 'Pro'}
              </button>
            )}

            {subscription?.tier !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                className="px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Quota Consumption Gauges (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Current Period Quotas & Usage
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">Resets Monthly</span>
          </div>

          {quota && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderQuotaBar(
                'AI Intelligence Requests',
                quota.ai_requests_used,
                quota.ai_requests_limit,
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {renderQuotaBar(
                'Deep Market Research Runs',
                quota.research_used,
                quota.research_limit,
                <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
              )}
              {renderQuotaBar(
                'File & Collateral Audits',
                quota.files_used,
                quota.files_limit,
                <FileText className="h-3.5 w-3.5 text-blue-400" />
              )}
              {renderQuotaBar(
                'Studio Content Generations',
                quota.content_used,
                quota.content_limit,
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              )}
              {renderQuotaBar(
                'Business Memory Items',
                quota.memory_used,
                quota.memory_limit,
                <Brain className="h-3.5 w-3.5 text-purple-400" />
              )}
              {renderQuotaBar(
                'Active Business Ventures',
                quota.businesses_used,
                quota.businesses_limit,
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold font-display text-neutral-100">
            Predictable, Founder-Friendly Plans
          </h2>
          <p className="text-xs text-neutral-400">
            No hidden tiers, no pay-per-prompt nickel-and-diming. Choose the plan that fits your business scale.
          </p>

          {/* Annual vs Monthly Switch */}
          <div className="inline-flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-emerald-600 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                Save 2 Months
              </span>
            </button>
          </div>
        </div>

        {/* 3 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Discovery Tier
                </span>
                <h3 className="text-xl font-bold text-neutral-100 mt-0.5">Free</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Ideal for testing venture ideas and validating initial problem-market fit.
                </p>
              </div>

              <div className="text-3xl font-extrabold text-neutral-100 font-display">
                {calculatePrice(0)}
                <span className="text-xs text-neutral-500 font-normal"> / forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>50 AI intelligence requests / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>3 Deep Market Research runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>5 File & Collateral audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>1 Active business venture</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>15 Verified memory entries</span>
                </li>
              </ul>
            </div>

            <button
              disabled={subscription?.tier === 'free'}
              onClick={() => {
                setCheckoutTier('free');
                handleCheckout();
              }}
              className="w-full py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-300 font-semibold text-xs hover:bg-neutral-900 disabled:opacity-40 transition-colors"
            >
              {subscription?.tier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="p-6 rounded-2xl bg-neutral-900/90 border-2 border-emerald-500/80 flex flex-col justify-between space-y-6 relative shadow-xl shadow-emerald-950/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[10px] uppercase tracking-wider shadow-md">
              Most Popular For Operators
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Growth Tier
                </span>
                <h3 className="text-xl font-bold text-neutral-100 mt-0.5">Venturevo Pro</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Full power execution engine for active founders scaling acquisition.
                </p>
              </div>

              <div className="text-3xl font-extrabold text-neutral-100 font-display">
                {billingCycle === 'annual' ? calculatePrice(190) : calculatePrice(19)}
                <span className="text-xs text-neutral-500 font-normal">
                  {' '}
                  / {billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-200 pt-2 border-t border-neutral-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span><strong>500</strong> AI intelligence requests / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span><strong>30</strong> Deep Market Research runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span><strong>50</strong> Multimodal file audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span><strong>3</strong> Active business ventures</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span><strong>100</strong> Marketing Studio generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span><strong>100</strong> Business Memory bank items</span>
                </li>
              </ul>
            </div>

            <button
              id="checkout-pro-btn"
              disabled={subscription?.tier === 'pro'}
              onClick={() => {
                setCheckoutTier('pro');
                setShowCheckoutModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
            >
              {subscription?.tier === 'pro' ? 'Active Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Max Plan */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Scale Tier
                </span>
                <h3 className="text-xl font-bold text-neutral-100 mt-0.5">Venturevo Max</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Maximum capacity for serial entrepreneurs, agencies, and portfolio ventures.
                </p>
              </div>

              <div className="text-3xl font-extrabold text-neutral-100 font-display">
                {billingCycle === 'annual' ? calculatePrice(490) : calculatePrice(49)}
                <span className="text-xs text-neutral-500 font-normal">
                  {' '}
                  / {billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                  <span><strong>1,500</strong> AI intelligence requests / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                  <span><strong>100</strong> Deep Market Research runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                  <span><strong>200</strong> Multimodal file audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                  <span><strong>10</strong> Business Workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                  <span><strong>500</strong> Marketing Studio generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                  <span><strong>250</strong> Business Memory bank items</span>
                </li>
              </ul>
            </div>

            <button
              id="checkout-max-btn"
              disabled={subscription?.tier === 'max'}
              onClick={() => {
                setCheckoutTier('max');
                setShowCheckoutModal(true);
              }}
              className="w-full py-2.5 rounded-xl border border-purple-700/60 bg-purple-950/40 text-purple-300 font-bold text-xs hover:bg-purple-900/60 disabled:opacity-40 transition-colors"
            >
              {subscription?.tier === 'max' ? 'Active Plan' : 'Upgrade to Max'}
            </button>
          </div>
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              Invoices & Billing History
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Download tax receipts and review historical transactions.
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No invoices on file yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Plan / Item</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-900/40">
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">{inv.id}</td>
                    <td className="py-3 px-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-semibold text-neutral-200 capitalize">
                      {inv.tier} Subscription ({inv.billing_cycle})
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-neutral-100">
                      ${(inv.amount || 0).toFixed(2)} USD
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 justify-end ml-auto"
                      >
                        <Download className="h-3.5 w-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Billing FAQ */}
      {faq.length > 0 && (
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            Billing Integrity & Refund Guarantee
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faq.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1 text-xs">
                <p className="font-bold text-neutral-200">{item.q}</p>
                <p className="text-neutral-400 text-[11px] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                Confirm Plan Upgrade
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Selected Plan:</span>
                <span className="text-neutral-100 font-bold uppercase">{checkoutTier} Tier</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Billing Cycle:</span>
                <span className="text-neutral-100 font-semibold capitalize">{billingCycle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Currency:</span>
                <span className="text-neutral-100 font-semibold">{selectedCurrency}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-sm">
                <span className="font-bold text-neutral-200">Total Billed Today:</span>
                <span className="font-bold font-display text-emerald-400 text-base">
                  {checkoutTier === 'pro'
                    ? billingCycle === 'annual'
                      ? calculatePrice(190)
                      : calculatePrice(19)
                    : billingCycle === 'annual'
                    ? calculatePrice(490)
                    : calculatePrice(49)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>30-day unconditional money-back guarantee. Cancel anytime with 1 click.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingCheckout}
                onClick={handleCheckout}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-neutral-950 text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
              >
                {isProcessingCheckout ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Confirm & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-sm text-neutral-100">VENTUREVO AI RECEIPT</span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Receipt Number:</span>
                <span className="font-mono text-neutral-200">{selectedInvoice.id}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Customer Email:</span>
                <span className="text-neutral-200">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Date:</span>
                <span className="text-neutral-200">{new Date(selectedInvoice.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Description:</span>
                <span className="text-neutral-200 font-semibold capitalize">
                  Venturevo {selectedInvoice.tier} Plan ({selectedInvoice.billing_cycle})
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-sm">
                <span className="font-bold text-neutral-200">Amount Paid:</span>
                <span className="font-bold font-mono text-emerald-400 text-base">
                  ${(selectedInvoice.amount || 0).toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-semibold hover:bg-neutral-700"
              >
                <Printer className="h-3.5 w-3.5" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-neutral-950 text-xs font-bold hover:bg-emerald-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
