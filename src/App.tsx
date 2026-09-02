/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Category, DashboardStats, EmailNotification, UserRole } from './types/index.js';
import { api } from './services/api.js';
import { Sidebar } from './components/Sidebar.js';
import { LandingPage } from './components/LandingPage.js';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.js';
import { ReportingModuleView } from './components/ReportingModuleView.js';
import { SubmitRequestView } from './components/SubmitRequestView.js';
import { RequestsListView } from './components/RequestsListView.js';
import { CategoriesView } from './components/CategoriesView.js';
import { AdminStaffAuditView } from './components/AdminStaffAuditView.js';
import { KnowledgeView } from './components/KnowledgeView.js';
import { WorkflowAutomationView } from './components/WorkflowAutomationView.js';
import { ApprovalDashboardView } from './components/ApprovalDashboardView.js';
import { AIGovernanceView } from './components/AIGovernanceView.js';
import { ComplianceDSARView } from './components/ComplianceDSARView.js';
import { AIChatbotWidget } from './components/AIChatbotWidget.js';
import { AIChatbotView } from './components/AIChatbotView.js';
import { AuthModal } from './components/AuthModal.js';
import { EmailInboxDrawer } from './components/EmailInboxDrawer.js';
import { CapacitiLogo, CapacitiLogoIcon } from './components/CapacitiLogo.js';
import { 
  Menu, 
  Bell, 
  Mail, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // App Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);

  // Modals & Drawers
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showEmailInbox, setShowEmailInbox] = useState(false);

  // Initial user check
  useEffect(() => {
    const initUser = async () => {
      setIsLoadingUser(true);
      try {
        const u = await api.getCurrentUser();
        if (u) {
          setUser(u);
          const isManagerOrAdmin = u.role === 'ADMIN' || u.role === 'SUPERVISOR';
          setActiveTab(isManagerOrAdmin ? 'dashboard' : 'requests');
        } else {
          // Default to Global Admin for instant smooth experience
          const demoUser = await api.login('admin@capaciti.org', 'Admin@Capaciti2026!');
          setUser(demoUser.user);
          setActiveTab('dashboard');
        }
      } catch (err) {
        console.error('Error initializing session:', err);
        setUser(null);
        setActiveTab('landing');
      } finally {
        setIsLoadingUser(false);
      }
    };
    initUser();
  }, []);

  // Fetch dashboard stats & taxonomy categories whenever activeTab changes or user changes
  const refreshAppData = async () => {
    try {
      const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
      const [s, cList, eLogs] = await Promise.all([
        isManagerOrAdmin ? api.getDashboardStats().catch(() => null) : Promise.resolve(null),
        api.getCategories().catch(() => []),
        user ? api.getEmailLogs().catch(() => []) : Promise.resolve([]),
      ]);
      if (s) setStats(s);
      setCategories(cList);
      setEmailLogs(eLogs);
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshAppData();
    }
  }, [user, activeTab]);

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    setUser(data.user);
    const isManagerOrAdmin = data.user.role === 'ADMIN' || data.user.role === 'SUPERVISOR';
    setActiveTab(isManagerOrAdmin ? 'dashboard' : 'requests');
    await refreshAppData();
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const data = await api.register(name, email, pass);
    setUser(data.user);
    const isManagerOrAdmin = data.user.role === 'ADMIN' || data.user.role === 'SUPERVISOR';
    setActiveTab(isManagerOrAdmin ? 'dashboard' : 'requests');
    await refreshAppData();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveTab('landing');
  };

  const handleQuickDemoLogin = async (email: string, role: string) => {
    let password = 'Capaciti2026!';
    if (role === 'ADMIN') password = 'Admin@Capaciti2026!';
    else if (role === 'SUPERVISOR') password = 'Manager@Capaciti2026!';
    else if (role === 'TECHNICIAN') password = 'Tech@Capaciti2026!';
    
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      const isManagerOrAdmin = data.user.role === 'ADMIN' || data.user.role === 'SUPERVISOR';
      setActiveTab(isManagerOrAdmin ? 'dashboard' : 'requests');
      await refreshAppData();
    } catch (err) {
      console.error('Quick demo login error:', err);
    }
  };

  // Submit Request Handler
  const handleSubmitRequest = async (reqData: any) => {
    const newReq = await api.createRequest(reqData);
    await refreshAppData();
    return newReq;
  };

  // Create Category Handler
  const handleCreateCategory = async (name: string, description: string) => {
    await api.createCategory(name, description);
    await refreshAppData();
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleMarkEmailAsRead = async (id: string) => {
    try {
      await api.markEmailAsRead(id);
      setEmailLogs((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
      );
    } catch (err) {
      console.error('Error marking email as read:', err);
    }
  };

  const handleMarkAllEmailsAsRead = async () => {
    try {
      await api.markAllEmailsAsRead();
      setEmailLogs((prev) => prev.map((e) => ({ ...e, isRead: true })));
    } catch (err) {
      console.error('Error marking all emails as read:', err);
    }
  };

  const unreadCount = emailLogs.filter((e) => !e.isRead).length;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#0a1c36] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-300">Loading Capaciti Service Hub...</p>
        </div>
      </div>
    );
  }

  // If on Landing Page and not logged in
  if (activeTab === 'landing' || !user) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] text-slate-900 font-sans">
        <LandingPage
          onGetStarted={handleOpenAuth}
          onTryDemo={handleQuickDemoLogin}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onQuickDemoLogin={handleQuickDemoLogin}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 flex font-sans antialiased">
      
      {/* Left-hand Fixed Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenNewTicket={() => setActiveTab('submit')}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content View Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#f0f4f8]/90 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile / Tablet Brand Logo Indicator */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="lg:hidden flex items-center space-x-2 cursor-pointer select-none"
            >
              <CapacitiLogoIcon className="w-7 h-7" />
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-xs tracking-wider uppercase text-slate-900">
                  CAPACITI
                </span>
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5">
                  Service Hub
                </span>
              </div>
            </div>
            
            <div className="hidden md:block border-l border-slate-300/80 pl-3 ml-1 lg:border-l-0 lg:pl-0 lg:ml-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {activeTab === 'dashboard' && 'Operations Dashboard'}
                {activeTab === 'requests' && 'Tickets Queue'}
                {activeTab === 'chatbot' && 'AI Copilot & Virtual Assistant'}
                {activeTab === 'workflows' && 'Workflow Automation Engine'}
                {activeTab === 'approvals' && 'Approvals & Requisitions'}
                {activeTab === 'governance' && 'Responsible AI Governance'}
                {activeTab === 'compliance' && 'POPIA & GDPR Compliance'}
                {activeTab === 'reporting' && 'Executive AI Reporting'}
                {activeTab === 'categories' && 'Assets & Categories'}
                {activeTab === 'knowledge' && 'Knowledge & Diagnostics'}
                {activeTab === 'admin-staff' && 'User & Role Management'}
                {activeTab === 'submit' && 'Log New Ticket'}
              </span>
            </div>
          </div>

          {/* Right Action Bar Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Demo Role Switcher: Only for ADMIN and SUPERVISOR (Manager) */}
            {user.role === 'ADMIN' || user.role === 'SUPERVISOR' ? (
              <div className="hidden md:flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 text-[11px] shadow-2xs">
                <span className="text-slate-400 font-bold px-1.5 uppercase text-[10px]">Switch Role:</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@capaciti.org', 'ADMIN')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    user.role === 'ADMIN' ? 'bg-[#0284c7] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Switch to Global Administrator"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('manager@capaciti.org', 'SUPERVISOR')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    user.role === 'SUPERVISOR' ? 'bg-[#0284c7] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Switch to Operations Manager (Naledi Khumalo)"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('tech.luthando@capaciti.org', 'TECHNICIAN')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    user.role === 'TECHNICIAN' ? 'bg-[#0284c7] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Switch to Service Technician (Luthando Didiza)"
                >
                  Tech
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('mbalientlempendu02@gmail.com', 'CUSTOMER')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    user.role === 'CUSTOMER' || user.role === 'EMPLOYEE' ? 'bg-[#0284c7] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Switch to End User (Mbali Entle Mpendu)"
                >
                  User
                </button>
              </div>
            ) : (
              /* End User & Technician static role pill */
              <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs">
                <span className="text-slate-400 font-semibold text-[11px] uppercase">Current Role:</span>
                <span className={`font-bold ${user.role === 'TECHNICIAN' ? 'text-emerald-700' : 'text-sky-700'}`}>
                  {user.role === 'TECHNICIAN' ? 'Service Technician' : user.role === 'CUSTOMER' ? 'End User (Learner)' : 'End User (Staff)'}
                </span>
              </div>
            )}

            {/* Notification Bell / Mail Receipts Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowEmailInbox(true)}
              className="relative p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="View delivered email notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
            <AnalyticsDashboard
              stats={stats}
              user={user}
              onNavigate={(tab) => {
                if (tab === 'submit' && user.role === 'ADMIN') {
                  setActiveTab('requests');
                } else {
                  setActiveTab(tab);
                }
              }}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsListView
              currentUser={user}
              categories={categories}
              onNavigateSubmit={() => setActiveTab('submit')}
              onRefreshAppData={refreshAppData}
            />
          )}

          {activeTab === 'workflows' && (user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
            <WorkflowAutomationView
              user={user}
              onNavigateTicket={() => setActiveTab('requests')}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalDashboardView
              user={user}
              onNavigateTicket={() => setActiveTab('requests')}
            />
          )}

          {activeTab === 'governance' && (user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
            <AIGovernanceView
              user={user}
            />
          )}

          {activeTab === 'compliance' && (
            <ComplianceDSARView
              user={user}
            />
          )}

          {activeTab === 'reporting' && (user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
            <ReportingModuleView
              user={user}
              onNavigate={setActiveTab}
              onRefreshAppData={refreshAppData}
            />
          )}

          {/* Fallback for non-managers who try to open dashboard or reporting */}
          {(activeTab === 'dashboard' || activeTab === 'reporting') && !(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
            <RequestsListView
              currentUser={user}
              categories={categories}
              onNavigateSubmit={() => setActiveTab('submit')}
              onRefreshAppData={refreshAppData}
            />
          )}

          {activeTab === 'chatbot' && (
            <AIChatbotView
              currentUser={user}
              onOpenNewTicket={() => setActiveTab('submit')}
              onRefreshAppData={refreshAppData}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              currentUser={user}
              onCreateCategory={handleCreateCategory}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeView />
          )}

          {activeTab === 'admin-staff' && user.role === 'ADMIN' && (
            <AdminStaffAuditView 
              currentUser={user} 
              onRefreshAppData={refreshAppData} 
            />
          )}

          {activeTab === 'submit' && (
            <SubmitRequestView
              onSubmit={handleSubmitRequest}
              onViewAllRequests={() => setActiveTab('requests')}
            />
          )}
        </main>
      </div>

      {/* Global AI Copilot Floating Chatbot Widget */}
      <AIChatbotWidget
        currentUser={user}
        onOpenNewTicket={() => setActiveTab('submit')}
        onRefreshAppData={refreshAppData}
        onNavigateTab={setActiveTab}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickDemoLogin={handleQuickDemoLogin}
        initialMode={authModalMode}
      />

      {/* Email Inbox Receipts Slide-Over Drawer */}
      <EmailInboxDrawer
        isOpen={showEmailInbox}
        onClose={() => setShowEmailInbox(false)}
        emailLogs={emailLogs}
        onMarkAsRead={handleMarkEmailAsRead}
        onMarkAllAsRead={handleMarkAllEmailsAsRead}
      />
    </div>
  );
}
