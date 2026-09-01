import React, { useState } from 'react';
import { User } from '../types/index.js';
import { 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  Layers, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Tag, 
  Menu, 
  X,
  FileText,
  Sparkles,
  Bot
} from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onQuickDemoLogin?: (email: string, role: string) => void;
  onOpenEmailInbox: () => void;
  unreadEmailCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenEmailInbox,
  unreadEmailCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0" 
            onClick={() => {
              setActiveTab(user ? 'dashboard' : 'landing');
              setMobileMenuOpen(false);
            }}
          >
            <CapacitiLogoIcon className="w-8 h-8 shrink-0" />
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">Capaciti</span>
              <span className="text-[11px] font-semibold tracking-tight text-indigo-600">Service Hub</span>
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Sprint 2
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  activeTab === 'requests'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{user.role === 'ADMIN' ? 'Service Queue' : 'My Requests'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chatbot')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  activeTab === 'chatbot'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-sky-600" />
                <span>AI Chatbot</span>
              </button>

              <button
                onClick={() => setActiveTab('reporting')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  activeTab === 'reporting'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Reporting</span>
              </button>

              {user.role !== 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    activeTab === 'submit'
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Taxonomy</span>
              </button>

              {user.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('admin-staff')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    activeTab === 'admin-staff'
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Staff & Audit</span>
                </button>
              )}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center space-x-2.5">
            {user ? (
              <>
                {/* Email Notifications Inbox Button */}
                <button
                  type="button"
                  onClick={onOpenEmailInbox}
                  className="relative p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shrink-0"
                  title="View Email Receipts & Ticket Confirmations"
                >
                  <Mail className="w-4 h-4" />
                  {unreadEmailCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadEmailCount}
                    </span>
                  )}
                </button>

                {/* User Capsule */}
                <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                  <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">
                      {user.role.toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="hidden sm:flex p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                >
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-4 space-y-3 shadow-sm">
          {user ? (
            <>
              {/* User Identity info on mobile */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 text-xs font-medium">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  <span>Analytics Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('requests');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>{user.role === 'ADMIN' ? 'Service Queue' : 'My Requests'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('reporting');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'reporting'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Executive AI Reporting</span>
                </button>

                {user.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      setActiveTab('submit');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'submit'
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-slate-600" />
                    <span>Submit Request</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('categories');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Tag className="w-4 h-4 text-slate-600" />
                  <span>Taxonomy</span>
                </button>

                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setActiveTab('admin-staff');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'admin-staff'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Staff & Audit</span>
                  </button>
                )}
              </div>

              {/* Mobile Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    onOpenEmailInbox();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-50 text-slate-800 font-semibold flex items-center justify-center space-x-2 border border-slate-200"
                >
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>Inbox ({unreadEmailCount})</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-50 text-slate-700 hover:text-rose-600 font-semibold flex items-center justify-center space-x-1.5 border border-slate-200 shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-1 text-xs">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-center border border-slate-200"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-center shadow-2xs flex items-center justify-center space-x-2"
              >
                <span>Create New Account</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
