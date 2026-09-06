import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  MessageSquareCode,
  Target,
  Brain,
  Building,
  TrendingUp,
  Stethoscope,
  Settings,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Compass,
  Crosshair,
  Users,
  Search,
  BookOpen,
  Megaphone,
  FileText,
  ShieldCheck,
  CreditCard,
  Gift,
  MapPin,
  Scale,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { activeBusiness, activeProfile } = useAuth();

  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
    section?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      section: 'Core Overview',
    },
    {
      id: 'chat',
      label: 'Ask Venturevo',
      icon: MessageSquareCode,
      badge: 'AI Core',
      highlight: true,
    },
    {
      id: 'studio',
      label: 'Marketing Studio',
      icon: Megaphone,
      badge: 'Direct-Response',
      section: 'Marketing & Content',
    },
    {
      id: 'files',
      label: 'File & Collateral Audit',
      icon: FileText,
      badge: 'Multimodal',
    },
    {
      id: 'approvals',
      label: 'Approval Queue',
      icon: ShieldCheck,
      badge: 'Safety Gate',
    },
    {
      id: 'location_intelligence',
      label: 'Road & Corridor Intelligence',
      icon: MapPin,
      badge: 'High Profit',
      section: 'Discovery & Market Intelligence',
    },
    {
      id: 'start_business',
      label: 'Start a Business',
      icon: Compass,
      badge: 'Feasibility',
    },
    {
      id: 'opportunities',
      label: 'Opportunity Scanner',
      icon: TrendingUp,
    },
    {
      id: 'competitors',
      label: 'Competitor Teardowns',
      icon: Crosshair,
    },
    {
      id: 'customer_growth',
      label: 'Customer ICP & Hooks',
      icon: Users,
    },
    {
      id: 'research',
      label: 'Deep Market Research',
      icon: BookOpen,
      badge: 'Evidence',
    },
    {
      id: 'growth',
      label: 'Growth Plans & Tasks',
      icon: Target,
      section: 'Execution & Optimization',
    },
    {
      id: 'diagnostics',
      label: '5-Whys Diagnostics',
      icon: Stethoscope,
    },
    {
      id: 'memory',
      label: 'Business Memory',
      icon: Brain,
      badge: 'Verified',
    },
    {
      id: 'billing',
      label: 'Pricing & Subscriptions',
      icon: CreditCard,
      badge: 'Pro / Max',
      section: 'Monetization & Control',
    },
    {
      id: 'referrals',
      label: 'Referral Rewards',
      icon: Gift,
      badge: '$20 Credit',
    },
    {
      id: 'admin',
      label: 'Admin Control Center',
      icon: Shield,
      badge: 'Protected',
      section: 'System & Governance',
    },
    {
      id: 'legal',
      label: 'Privacy & Legal Notice',
      icon: Scale,
    },
    {
      id: 'profile',
      label: 'Business Profile',
      icon: Building,
    },
    {
      id: 'settings',
      label: 'Settings & Audit',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-68 border-r border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-950/60 p-3.5 select-none flex-shrink-0 transition-colors">
      {/* Active Business Snapshot */}
      {activeBusiness && (
        <div className="mb-3.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/90 bg-neutral-50 dark:bg-neutral-900/60 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Venture
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40 capitalize">
              {activeBusiness.stage.replace('_', ' ')}
            </span>
          </div>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mt-1 truncate">
            {activeBusiness.name}
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {activeProfile?.industry || 'Ventirevo GPS & Intelligence Engine'}
          </p>

          <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500 dark:text-amber-400" /> Leverage State
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimal (98/100)</span>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div className="pt-2 pb-1 px-2 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {item.section}
                </div>
              )}
              <button
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/80 dark:to-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/80 hover:text-neutral-900 dark:hover:text-neutral-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.highlight
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
                    }`}
                  />
                  <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      item.highlight
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Trust & Scientific Evidence Guarantee Footnote */}
      <div className="mt-auto pt-2.5 border-t border-neutral-200 dark:border-neutral-800/60">
        <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800 dark:text-neutral-300">
            <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span>Ventirevo Intelligence Guarantee</span>
          </div>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Corridor GPS + Street Economics: Rigorously verifies opportunities, demand density, and cashflow.
          </p>
        </div>
      </div>
    </aside>
  );
};
