import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  RotateCcw,
  Compass,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signup, demoLogin, socialLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showIssuesPanel, setShowIssuesPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) setError(res.error || 'Login failed. Please check your credentials or click Login Issues below.');
      } else if (tab === 'signup') {
        const res = await signup(email, password, name || 'Ventirevo Founder');
        if (!res.success) setError(res.error || 'Signup failed');
      } else if (tab === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setResetSent(true);
          setSuccessMsg('Password reset link has been dispatched to your email.');
        } else {
          setError('Failed to initiate password reset');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setSocialLoading(provider);
    try {
      const res = await socialLogin(provider);
      if (!res.success) {
        setError(res.error || `Could not sign in with ${provider}`);
      }
    } catch (err: any) {
      setError(err.message || `Error connecting to ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setLoading(true);
    const res = await demoLogin();
    if (!res.success) setError(res.error || 'Instant demo access failed');
    setLoading(false);
  };

  const handleClearCache = () => {
    localStorage.removeItem('venturevo_session_token');
    localStorage.removeItem('venturevo_active_biz_id');
    setSuccessMsg('Local session cache cleared. You may now attempt signing in fresh.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md my-auto rounded-3xl border border-neutral-200 dark:border-neutral-800/90 bg-white dark:bg-neutral-900 shadow-2xl p-5 sm:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto transition-colors">
        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 mb-2.5 items-center justify-center">
            <div className="h-full w-full bg-neutral-900 dark:bg-neutral-950 rounded-[15px] flex items-center justify-center">
              <Compass className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-neutral-900 dark:text-neutral-100">
            VENTIREVO <span className="text-emerald-500 dark:text-emerald-400">AI</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            #1 Business GPS, Corridor Intelligence & Sovereign Coach
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
              setResetSent(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
              setResetSent(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Continue with Google & Continue with Apple */}
        {tab !== 'reset' && (
          <div className="space-y-2.5 mb-5">
            {/* Continue with Google */}
            <button
              type="button"
              id="btn-continue-google"
              onClick={() => handleSocialAuth('google')}
              disabled={loading || socialLoading !== null}
              className="w-full h-11 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/90 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60"
            >
              {socialLoading === 'google' ? (
                <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Continue with Apple */}
            <button
              type="button"
              id="btn-continue-apple"
              onClick={() => handleSocialAuth('apple')}
              disabled={loading || socialLoading !== null}
              className="w-full h-11 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/90 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60"
            >
              {socialLoading === 'apple' ? (
                <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-4 w-4 flex-shrink-0 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.55-7.71-11.59-14.01-6.19-9.66-10.9-20.73-14.14-33.22-3.23-12.49-4.85-24.16-4.85-35.03 0-14.13 3.41-26.06 10.23-35.79 6.82-9.73 15.42-14.69 25.8-14.89 4.35 0 9.49 1.16 15.42 3.48 5.93 2.32 9.87 3.53 11.83 3.64 1.74 0 5.86-1.28 12.37-3.85 6.51-2.57 12.21-3.69 17.1-3.35 12.74.87 22.84 5.76 30.3 14.69-11.09 6.74-16.53 16.08-16.31 28.02.22 9.35 3.86 17.3 10.93 23.86 7.07 6.56 15.54 10.32 25.41 11.28-2.61 7.61-5.69 15.22-9.24 22.84zm-37.13-108.62c0-7.39 2.68-14.34 8.04-20.85 5.36-6.51 12.04-10.45 20.04-11.82.22 1.09.33 2.07.33 2.94 0 7.39-2.77 14.47-8.31 21.24-5.54 6.77-12.34 10.74-20.4 11.91-.01-1.2-.03-2.34-.03-3.42z" />
                </svg>
              )}
              <span>Continue with Apple</span>
            </button>

            {/* Subtle Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-neutral-900 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                or continue with email
              </span>
            </div>
          </div>
        )}

        {/* Reset Confirmation Screen */}
        {resetSent ? (
          <div className="text-center py-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Reset Email Dispatched</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
              If an account exists for <span className="font-semibold text-neutral-700 dark:text-neutral-300">{email}</span>, password reset guidance has been sent.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setTab('login');
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-xs font-semibold text-white dark:text-neutral-200 hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* Email & Password Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samuel Okafor"
                    className="w-full h-11 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-10 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Work / Founder Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venturevo.com"
                  className="w-full h-11 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-10 pr-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {tab !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setTab('reset')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-10 pr-10 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              id="btn-auth-submit"
              disabled={loading || socialLoading !== null}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-1"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'login'
                      ? 'Sign In to Ventirevo'
                      : tab === 'signup'
                      ? 'Create Business Account'
                      : 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Dedicated Login Issues Section */}
        <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={() => setShowIssuesPanel(!showIssuesPanel)}
            className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>Login issues? Need help signing in?</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              {showIssuesPanel ? 'Hide' : 'Options'}
            </span>
          </button>

          {showIssuesPanel && (
            <div className="mt-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 animate-in fade-in duration-150">
              {/* Option 1: Instant 1-Click Demo Evaluation */}
              <button
                type="button"
                id="btn-demo-quick-access"
                onClick={handleDemoAccess}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>1-Click Instant Demo Login</span>
                </span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-md font-bold">
                  No Password
                </span>
              </button>

              {/* Option 2: Forgot Password Reset */}
              <button
                type="button"
                onClick={() => {
                  setTab('reset');
                  setShowIssuesPanel(false);
                }}
                className="w-full py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-300 text-xs font-medium flex items-center gap-2 transition-all"
              >
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                <span>Reset password via email link</span>
              </button>

              {/* Option 3: Clear Stuck Browser Session */}
              <button
                type="button"
                onClick={handleClearCache}
                className="w-full py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-medium flex items-center gap-2 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
                <span>Clear cached credentials / session tokens</span>
              </button>
            </div>
          )}
        </div>

        {/* Security and White-Label Footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-neutral-400 dark:text-neutral-500 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Sovereign Encrypted Storage • Zero Data Leakage</span>
        </div>
      </div>
    </div>
  );
};
