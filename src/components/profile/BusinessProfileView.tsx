import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building,
  Save,
  CheckCircle2,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  Target,
  Sparkles,
  Globe,
  Layers,
} from 'lucide-react';
import { BusinessProfile } from '../../types';

export const BusinessProfileView: React.FC = () => {
  const { token, activeBusiness, activeProfile } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(activeProfile);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setProfile(activeProfile);
  }, [activeProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeBusiness || !profile) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-16 text-xs text-neutral-400">
        No active business profile loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-100 tracking-tight">
              Business Profile & Parameters
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure unit economics, founder constraints, and offer models used by the Venturevo AI Core.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Profile Synced to AI Memory</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Globe className="h-4 w-4" /> Market & Category Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Industry / Category</label>
              <input
                type="text"
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Business Model</label>
              <select
                value={profile.business_model}
                onChange={(e) => setProfile({ ...profile, business_model: e.target.value as any })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="online">Online / SaaS / Digital</option>
                <option value="physical">Physical / Retail / Local</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Primary Country / Market</label>
              <input
                type="text"
                value={profile.country || ''}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Target City / Territory</label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Founder Resources */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" /> Founder Capital & Time Constraints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Available Capital ({profile.currency || 'USD'})</label>
              <input
                type="number"
                value={profile.starting_capital || 0}
                onChange={(e) => setProfile({ ...profile, starting_capital: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Available Time (Hours / Week)</label>
              <input
                type="number"
                value={profile.available_time_hours_per_week || 40}
                onChange={(e) => setProfile({ ...profile, available_time_hours_per_week: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Founder Skills (Comma separated)</label>
              <input
                type="text"
                value={Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || ''}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map((s) => s.trim()) })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Offer & Customers */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Layers className="h-4 w-4" /> Products, Pricing & Customer Avatar
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Products / Services Description</label>
              <textarea
                rows={2}
                value={profile.products_services || ''}
                onChange={(e) => setProfile({ ...profile, products_services: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Current Pricing Structure</label>
              <input
                type="text"
                value={profile.current_pricing || ''}
                onChange={(e) => setProfile({ ...profile, current_pricing: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Customer Profile</label>
              <input
                type="text"
                value={profile.target_customers || ''}
                onChange={(e) => setProfile({ ...profile, target_customers: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save & Sync AI Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
