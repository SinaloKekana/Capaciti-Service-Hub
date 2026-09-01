import React from 'react';
import { DashboardStats, User } from '../types/index.js';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Bot, 
  PlusCircle, 
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  user: User;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, user, onNavigate }) => {
  if (!stats) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Activity className="w-5 h-5 mx-auto animate-spin mb-2 text-slate-500" />
        <p className="text-xs">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500 mb-1">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
              {user.role}
            </span>
            <span>• Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.role === 'ADMIN'
              ? 'Review business requests, AI ticket triage, and operational throughput.'
              : 'Track your submitted requests and status updates.'}
          </p>
        </div>

        {user.role === 'ADMIN' ? (
          <button
            onClick={() => onNavigate('requests')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Requests Queue</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('submit')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Request</span>
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{stats.totalRequests}</div>
          <div className="text-[10px] text-slate-400 mt-1">All tickets</div>
        </div>

        {/* Open */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Open</div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">{stats.openRequests}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting review</div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">In Progress</div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono">{stats.inProgressRequests}</div>
          <div className="text-[10px] text-slate-400 mt-1">Active resolution</div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Resolved</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">{stats.resolvedRequests}</div>
          <div className="text-[10px] text-slate-400 mt-1">Completed</div>
        </div>

        {/* AI Classified */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Classified</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{stats.aiClassifiedRequests}</div>
          <div className="text-[10px] text-slate-400 mt-1">Gemini triaged</div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Requests by AI Category</h2>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Taxonomy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No categories mapped yet.</p>
            ) : (
              stats.categoryBreakdown.map((item, idx) => {
                const percentage = stats.totalRequests > 0 ? Math.round((item.count / stats.totalRequests) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800">{item.category}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800 rounded-full"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4">Priority Distribution</h2>

            <div className="grid grid-cols-2 gap-3">
              {stats.priorityBreakdown.map((p, idx) => {
                const priorityStyles: Record<string, string> = {
                  Urgent: 'bg-rose-50/70 border-rose-200 text-rose-800',
                  High: 'bg-amber-50/70 border-amber-200 text-amber-800',
                  Medium: 'bg-blue-50/70 border-blue-200 text-blue-800',
                  Low: 'bg-slate-50 border-slate-200 text-slate-700',
                };
                return (
                  <div key={idx} className={`p-3.5 rounded-lg border ${priorityStyles[p.priority] || 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">{p.priority}</div>
                    <div className="text-xl font-bold font-mono">{p.count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg. Resolution:</span>
            <span className="font-semibold text-slate-800 font-mono">2.4h / ticket</span>
          </div>
        </div>
      </div>
    </div>
  );
};

