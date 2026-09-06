import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  ChevronDown,
  Building2,
  Plus,
  Bell,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { Notification } from '../../types';

interface HeaderProps {
  onOpenNewBusinessModal?: () => void;
  onNavigate: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewBusinessModal, onNavigate }) => {
  const { user, businesses, activeBusiness, switchBusiness, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif_1',
      user_id: user?.id || '1',
      title: 'High-Leverage Insight Ready',
      message: 'Ventirevo AI diagnosed outbound conversion constraints. Repositioning proposal ready.',
      type: 'insight',
      is_read: false,
      link: '/chat',
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif_2',
      user_id: user?.id || '1',
      title: 'Memory Bank Updated',
      message: '5 customer discovery learnings verified with 94% confidence rating.',
      type: 'milestone',
      is_read: false,
      link: '/memory',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto">
        {/* Left: Brand Identity & Active Business */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1px] shadow-lg shadow-emerald-500/10 flex items-center justify-center">
              <div className="h-full w-full bg-neutral-900 dark:bg-neutral-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="hidden xs:block sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight font-display text-neutral-900 dark:text-neutral-100">
                  VENTIREVO <span className="text-emerald-600 dark:text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 tracking-wider">
                  GPS Core
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-none mt-0.5 hidden sm:block">
                #1 Business GPS & Billionaire Coach
              </p>
            </div>
          </div>

          {/* Business Switcher Dropdown */}
          {activeBusiness && (
            <div className="relative">
              <button
                id="biz-switcher-btn"
                onClick={() => {
                  setBizDropdownOpen(!bizDropdownOpen);
                  setUserDropdownOpen(false);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/90 hover:bg-neutral-200 dark:hover:bg-neutral-850 transition-all text-xs font-medium text-neutral-800 dark:text-neutral-200"
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="max-w-[100px] sm:max-w-[150px] truncate">{activeBusiness.name}</span>
                <ChevronDown className="h-3 w-3 text-neutral-400 flex-shrink-0" />
              </button>

              {bizDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Your Businesses ({businesses.length})
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {businesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          switchBusiness(b.id);
                          setBizDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                          b.id === activeBusiness.id
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate">{b.name}</p>
                          <span className="text-[10px] text-neutral-400 capitalize">{b.stage.replace('_', ' ')}</span>
                        </div>
                        {b.id === activeBusiness.id && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={() => {
                        setBizDropdownOpen(false);
                        if (onOpenNewBusinessModal) onOpenNewBusinessModal();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Add New Business
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center/Right: System Status & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Evidence Core Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Ventirevo Intelligence Active
          </div>

          {/* Theme Selector Toggle */}
          <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-0.5 text-xs">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${resolvedTheme === 'dark' ? 'bg-neutral-800 text-emerald-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${resolvedTheme === 'light' ? 'bg-white text-emerald-600 shadow-sm font-semibold' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              title="Light Mode"
              aria-label="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-neutral-200 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              title="System Theme"
              aria-label="System Theme"
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              id="notif-btn"
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setBizDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="relative p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1.5 mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        n.is_read = true;
                        setNotifDropdownOpen(false);
                        if (n.link === '/chat') onNavigate('chat');
                        else if (n.link === '/memory') onNavigate('memory');
                        else if (n.link === '/growth') onNavigate('growth');
                        else if (n.link === '/approvals') onNavigate('approvals');
                        else if (n.link === '/billing') onNavigate('billing');
                        else if (n.link === '/studio') onNavigate('studio');
                        else if (n.link === '/files') onNavigate('files');
                        else if (n.link === '/referrals') onNavigate('referrals');
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                        n.is_read ? 'bg-neutral-50 dark:bg-neutral-950/40 text-neutral-500 dark:text-neutral-400' : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {n.type === 'insight' ? (
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : n.type === 'approval_required' ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold leading-snug">{n.title}</p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          {user && (
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setBizDropdownOpen(false);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-850 transition-colors"
              >
                <img
                  src={user.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}
                  alt={user.name}
                  className="h-7 w-7 rounded-md object-cover border border-neutral-300 dark:border-neutral-700"
                />
                <span className="hidden md:inline text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3 w-3 text-neutral-400 hidden md:inline" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1 mt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('billing');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Pricing & Subscriptions
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('referrals');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Gift className="h-3.5 w-3.5 text-amber-500" />
                      Referral Rewards ($20)
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Building2 className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                      Business Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                      Account & Security
                    </button>
                  </div>

                  <div className="mt-1 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
