import React from 'react';
import { 
  Building2, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  BarChart3, 
  Cpu, 
  FileText, 
  Lock,
  Mail,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { CapacitiLogo, CapacitiLogoIcon } from './CapacitiLogo.js';

interface LandingPageProps {
  onGetStarted: (mode?: 'login' | 'register') => void;
  onTryDemo?: (email: string, role: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onTryDemo }) => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CapacitiLogoIcon className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-slate-900">
                CAPACITI
              </span>
              <span className="text-sky-600 text-[11px] font-bold tracking-tight mt-0.5">
                Service Hub
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onGetStarted('login')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
            <button
              onClick={() => onGetStarted('register')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] transition-colors cursor-pointer shadow-2xs"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 sm:pt-16 pb-12 sm:pb-14 border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <CapacitiLogoIcon className="w-4 h-4 rounded-sm shrink-0" />
            <span>Capaciti Business Intelligence & SLA Automation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Enterprise Operations & Service Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Ticket management platform powered by intelligent classification, real-time SLA telemetry, and role-based workflows.
          </p>

          {/* Quick Demo Logins Grid */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Explore Demo Accounts
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => onTryDemo && onTryDemo('admin@capaciti.org', 'ADMIN')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-900">Global Admin</div>
                <div className="text-[10px] text-slate-500">admin@capaciti.org</div>
              </button>

              <button
                onClick={() => onTryDemo && onTryDemo('manager@capaciti.org', 'SUPERVISOR')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-900">Manager</div>
                <div className="text-[10px] text-slate-500">Naledi Khumalo</div>
              </button>

              <button
                onClick={() => onTryDemo && onTryDemo('tech.luthando@capaciti.org', 'TECHNICIAN')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-900">Technician</div>
                <div className="text-[10px] text-slate-500">Luthando Didiza</div>
              </button>

              <button
                onClick={() => onTryDemo && onTryDemo('mbalientlempendu02@gmail.com', 'CUSTOMER')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-900">End User</div>
                <div className="text-[10px] text-slate-500">Mbali Entle</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">01 • Response Studio</div>
            <h3 className="font-bold text-slate-900">AI Response Generation</h3>
            <p className="text-slate-500 leading-relaxed">
              Generate personalized technician draft responses in multiple tones with human approval.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">02 • Telemetry</div>
            <h3 className="font-bold text-slate-900">Business Analytics</h3>
            <p className="text-slate-500 leading-relaxed">
              Track SLA compliance rates, Mean Time to Resolution, and technician workload telemetry.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">03 • Intelligence</div>
            <h3 className="font-bold text-slate-900">Executive Reporting</h3>
            <p className="text-slate-500 leading-relaxed">
              On-demand operational reporting, risk assessments, and strategic leadership briefs.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1.5">
            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">04 • Governance</div>
            <h3 className="font-bold text-slate-900">User & Role Management</h3>
            <p className="text-slate-500 leading-relaxed">
              Role assignment, status auditing, and email receipt logs for end-to-end accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center space-x-2">
          <CapacitiLogoIcon className="w-5 h-5 rounded-xs" />
          <span className="font-bold text-slate-800">CAPACITI Service Hub</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span>Enterprise Operations & SLA Platform</span>
      </footer>
    </div>
  );
};
