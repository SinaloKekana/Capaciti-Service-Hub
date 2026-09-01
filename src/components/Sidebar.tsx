import React from 'react';
import { User } from '../types/index.js';
import { 
  LayoutDashboard, 
  Ticket, 
  CheckSquare, 
  Boxes, 
  BookOpen, 
  Users, 
  Plus, 
  LogOut,
  Sparkles,
  Zap,
  ShieldCheck,
  FileCheck2,
  BarChart3,
  FileText,
  Bot
} from 'lucide-react';
import { CapacitiLogo, CapacitiLogoIcon } from './CapacitiLogo.js';
export { CapacitiLogo, CapacitiLogoIcon };

interface SidebarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenNewTicket: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenNewTicket,
  isOpenMobile,
  onCloseMobile,
}) => {
  const isManagerOrAdmin = 
    user?.role === 'ADMIN' || 
    user?.role === 'SUPERVISOR' || 
    user?.role === 'HR_MANAGER' || 
    user?.role === 'FINANCE_MANAGER' || 
    user?.role === 'IT_MANAGER' || 
    user?.role === 'FACILITIES_MANAGER';

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
    managementOnly?: boolean;
    adminOnly?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, managementOnly: true },
    { id: 'requests', label: 'Tickets Queue', icon: Ticket },
    { id: 'chatbot', label: 'AI Chatbot', icon: Bot, badge: 'AI' },
    { id: 'workflows', label: 'Workflows', icon: Zap, badge: 'AUTO', managementOnly: true },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'governance', label: 'AI Governance', icon: ShieldCheck, badge: 'AI', managementOnly: true },
    { id: 'compliance', label: 'Compliance & DSAR', icon: FileCheck2 },
    { id: 'reporting', label: 'Executive Reports', icon: BarChart3, managementOnly: true },
    { id: 'categories', label: 'Assets & Taxonomy', icon: Boxes },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'admin-staff', label: 'Staff & Leadership', icon: Users, managementOnly: true },
  ];

  const handleBrandClick = () => {
    if (isManagerOrAdmin) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('requests');
    }
    onCloseMobile();
  };

  const getRoleDisplayName = (role?: string, jobTitle?: string) => {
    if (jobTitle) return jobTitle;
    switch (role) {
      case 'ADMIN': return 'Global Administrator';
      case 'HR_MANAGER': return 'HR Manager / Director';
      case 'FINANCE_MANAGER': return 'Finance Manager / CFO';
      case 'IT_MANAGER': return 'IT Director / Systems Lead';
      case 'FACILITIES_MANAGER': return 'Facilities Manager';
      case 'SUPERVISOR': return 'Operations Supervisor';
      case 'TECHNICIAN': return 'Service Technician';
      case 'EMPLOYEE': return 'Staff Employee';
      case 'CUSTOMER': return 'End User (Learner)';
      default: return 'End User';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a1c36] text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-[#142e54] select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Nav Section */}
        <div className="p-4 flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div 
            onClick={handleBrandClick}
            className="flex items-center space-x-3 px-2 py-2 mb-4 cursor-pointer group rounded-xl hover:bg-[#11294d]/60 transition-colors"
          >
            <CapacitiLogoIcon className="w-8 h-8 shrink-0" rounded="rounded-lg" />
            <div className="min-w-0">
              <div className="text-white font-extrabold text-sm tracking-wider uppercase leading-tight group-hover:text-sky-300 transition-colors">
                CAPACITI
              </div>
              <div className="text-sky-400 text-xs font-semibold leading-none mt-0.5 whitespace-nowrap">
                Service Hub
              </div>
            </div>
          </div>

          {/* New Ticket Action Button */}
          <button
            type="button"
            onClick={() => {
              onOpenNewTicket();
              onCloseMobile();
            }}
            className="w-full mb-5 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>

          {/* Navigation Item Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return null;
              if (item.managementOnly && !isManagerOrAdmin) return null;
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#15345d] text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#0e274b]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Capsule in Sidebar */}
        <div className="p-3 border-t border-[#132c50]">
          {user ? (
            <div className="bg-white rounded-xl p-3 text-slate-900 shadow-sm">
              <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user.name}
              </div>
              <div className="text-[11px] text-sky-700 font-semibold mt-0.5">
                {getRoleDisplayName(user.role)}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {user.email}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center space-x-1.5 text-xs text-slate-700 hover:text-rose-600 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#122849] rounded-xl p-3 text-center">
              <span className="text-xs text-slate-300 block mb-2 font-medium">Guest Session</span>
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
