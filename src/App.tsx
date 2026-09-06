import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveView } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { DashboardView } from './components/dashboard/DashboardView';
import { AskVenturevoView } from './components/chat/AskVenturevoView';
import { StartBusinessView } from './components/opportunities/StartBusinessView';
import { GrowthPlanView } from './components/growth/GrowthPlanView';
import { BusinessMemoryView } from './components/memory/BusinessMemoryView';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView';
import { CompetitorAnalysisView } from './components/competitors/CompetitorAnalysisView';
import { CustomerGrowthView } from './components/customers/CustomerGrowthView';
import { DeepResearchView } from './components/research/DeepResearchView';
import { DiagnosticsView } from './components/diagnostics/DiagnosticsView';
import { BusinessProfileView } from './components/profile/BusinessProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { MarketingStudioView } from './components/studio/MarketingStudioView';
import { FileAnalysisView } from './components/files/FileAnalysisView';
import { ApprovalQueueView } from './components/approvals/ApprovalQueueView';
import { BillingView } from './components/billing/BillingView';
import { ReferralsView } from './components/referrals/ReferralsView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LocationIntelligenceView } from './components/location/LocationIntelligenceView';
import { PrivacyTermsView } from './components/legal/PrivacyTermsView';

function AppContent() {
  const { user, token, activeBusiness, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>('chat');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  const handleNavigate = (view: ActiveView, contextPayload?: any) => {
    if (view === 'chat' && contextPayload?.prompt) {
      setChatInitialPrompt(contextPayload.prompt);
    }
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold font-display uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            VENTIREVO AI
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Bootstrapping business intelligence environment...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication modal
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-neutral-950/80 text-neutral-100 relative">
        <AuthModal />
      </div>
    );
  }

  // Only show onboarding wizard if the user explicitly clicked "Add New Business" modal
  if (showOnboardingModal) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 relative transition-colors">
        <OnboardingWizard onComplete={() => setShowOnboardingModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        onOpenNewBusinessModal={() => setShowOnboardingModal(true)}
        onNavigate={handleNavigate}
      />

      {/* Workspace Area: Sidebar + Main Content View */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {currentView === 'chat' && (
            <AskVenturevoView
              initialPrompt={chatInitialPrompt}
              onNavigateToGrowth={() => setCurrentView('growth')}
            />
          )}
          {currentView === 'studio' && (
            <MarketingStudioView
              onNavigateToApprovals={() => setCurrentView('approvals')}
              onNavigateToTasks={() => setCurrentView('growth')}
            />
          )}
          {currentView === 'files' && (
            <FileAnalysisView
              onNavigateToStudio={() => setCurrentView('studio')}
              onNavigateToGrowth={() => setCurrentView('growth')}
            />
          )}
          {currentView === 'approvals' && <ApprovalQueueView />}
          {currentView === 'location_intelligence' && <LocationIntelligenceView />}
          {currentView === 'start_business' && (
            <StartBusinessView onLaunched={() => setCurrentView('growth')} />
          )}
          {currentView === 'opportunities' && <OpportunitiesView />}
          {currentView === 'competitors' && <CompetitorAnalysisView />}
          {currentView === 'customer_growth' && <CustomerGrowthView />}
          {currentView === 'research' && <DeepResearchView />}
          {currentView === 'growth' && <GrowthPlanView />}
          {currentView === 'diagnostics' && <DiagnosticsView />}
          {currentView === 'memory' && <BusinessMemoryView />}
          {currentView === 'billing' && <BillingView />}
          {currentView === 'referrals' && <ReferralsView />}
          {currentView === 'admin' && <AdminDashboardView />}
          {currentView === 'legal' && <PrivacyTermsView />}
          {currentView === 'profile' && <BusinessProfileView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Bottom Mobile Navigation for Phone screens */}
      <MobileNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
