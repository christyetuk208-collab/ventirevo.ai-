import React from 'react';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  MessageSquareCode,
  Target,
  Brain,
  TrendingUp,
} from 'lucide-react';

interface MobileNavProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const items: Array<{ id: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Ask AI', icon: MessageSquareCode },
    { id: 'growth', label: 'Growth', icon: Target },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'opportunities', label: 'Matrix', icon: TrendingUp },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800/80 px-2 py-1.5 flex items-center justify-around pb-safe transition-colors">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            id={`mob-nav-${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
