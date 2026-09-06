import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  Globe,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Users,
  Compass,
  Cpu,
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'existing' as 'new' | 'existing',
    stage: 'early_revenue',
    country: 'United States',
    city: 'Austin, TX',
    industry: 'B2B SaaS & Automation',
    starting_capital: '10000',
    currency: 'USD',
    skills: 'Software Architecture, B2B Outbound, Product Management',
    experience: '4 years operating mid-market digital solutions',
    available_time_hours_per_week: 40,
    business_interests: 'B2B Workflow, AI Tools, Logistics',
    business_model: 'online' as 'online' | 'physical' | 'hybrid',
    products_services: 'Automated order reconciliation and audit software for logistics providers',
    current_pricing: '$499/month per facility',
    target_customers: 'Independent logistics providers with 10-50 warehouse staff',
    main_problem: 'High customer acquisition cost and long enterprise sales cycles',
    main_goal: 'Reach $25k Monthly Recurring Revenue with payback < 60 days',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.business_name.trim()) {
      setError('Please enter a business name to continue');
      return;
    }
    setError(null);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submitOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    }
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      business_interests: formData.business_interests.split(',').map((s) => s.trim()).filter(Boolean),
      starting_capital: Number(formData.starting_capital) || 0,
      available_time_hours_per_week: Number(formData.available_time_hours_per_week) || 40,
    };

    const res = await completeOnboarding(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to complete onboarding setup');
    } else {
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-lg overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 sm:p-8 animate-in fade-in duration-200">
        {/* Progress Bar & Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Growth Engine Initialization
            </span>
            <span>Step {step} of {totalSteps}</span>
          </div>

          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Business Identity & Stage */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                What is your venture's name and stage?
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Venturevo AI adapts its recommendations based on whether this is an early validation or existing operation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Business Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="e.g. ApexFlow Automation"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Business Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('business_type', 'new')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.business_type === 'new'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    New Venture
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('business_type', 'existing')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.business_type === 'existing'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    Existing Business
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Delivery Model</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['online', 'physical', 'hybrid'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleChange('business_model', m)}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        formData.business_model === m
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location & Market */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                Location & Industry Market
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Ground recommendations in realistic regional demographics and category benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Country / Global</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="e.g. United States or Global"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">City / Target Market Area</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Austin, TX or Remote"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Industry / Category</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="e.g. B2B SaaS, Logistics, E-commerce, Local Services"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Target Customers Avatar (Optional)
              </label>
              <input
                type="text"
                value={formData.target_customers}
                onChange={(e) => handleChange('target_customers', e.target.value)}
                placeholder="e.g. Independent 3PL logistics facilities with 10-50 staff"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Founder Resources & Constraints */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                Founder Capital, Time & Skills
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Venturevo evaluates founder fit to ensure growth tasks match your real time and budget constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Available Starting/Working Capital</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-neutral-500">$</span>
                  <input
                    type="number"
                    value={formData.starting_capital}
                    onChange={(e) => handleChange('starting_capital', e.target.value)}
                    placeholder="10000"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-7 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Available Time (Hours / Week)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="number"
                    value={formData.available_time_hours_per_week}
                    onChange={(e) => handleChange('available_time_hours_per_week', e.target.value)}
                    placeholder="40"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Key Founder Skills (Comma separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="e.g. Direct Sales, Software Development, Operations, Copywriting"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Relevant Experience Summary</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="e.g. 5 years working in logistics supply chain and software tools"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: Product & Pricing */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                Products, Services & Pricing
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Helps calculate unit economics, gross margins, and customer lifetime value.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Primary Products or Services</label>
              <textarea
                rows={2}
                value={formData.products_services}
                onChange={(e) => handleChange('products_services', e.target.value)}
                placeholder="e.g. Automated order reconciliation software for independent 3PL warehouse operators."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Current Pricing or Pricing Hypothesis</label>
              <input
                type="text"
                value={formData.current_pricing}
                onChange={(e) => handleChange('current_pricing', e.target.value)}
                placeholder="e.g. $499/month per facility or $50/unit"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Primary Goal & Core Problem */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100 font-display">
                Main Goal & Primary Problem
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Venturevo focuses 80% of recommendations on solving your single highest-priority bottleneck first.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Main Business Goal (6-12 Months)
              </label>
              <input
                type="text"
                value={formData.main_goal}
                onChange={(e) => handleChange('main_goal', e.target.value)}
                placeholder="e.g. Reach $25k Monthly Recurring Revenue with payback < 60 days"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Highest-Priority Business Problem
              </label>
              <textarea
                rows={2}
                value={formData.main_problem}
                onChange={(e) => handleChange('main_problem', e.target.value)}
                placeholder="e.g. Cold outreach outbound reply rate is under 2% and sales cycles take 45 days."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="py-2 px-3.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {step < totalSteps && step > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="py-2 px-3 text-xs text-neutral-400 hover:text-neutral-200 font-medium"
              >
                Skip / Use Defaults
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Business Engine...</span>
                </>
              ) : (
                <>
                  <span>{step === totalSteps ? 'Initialize Growth System' : 'Continue'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
