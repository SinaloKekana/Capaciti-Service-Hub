import React, { useState, useEffect } from 'react';
import { RequestItem, User, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { RequestDetailsModal } from './RequestDetailsModal.js';
import { SLACountdownBadge } from './SLACountdownTimer.js';
import { 
  Search, 
  Plus, 
  Check, 
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface RequestsListViewProps {
  currentUser: User;
  categories: Category[];
  onNavigateSubmit: () => void;
  onRefreshAppData?: () => void;
}

export const RequestsListView: React.FC<RequestsListViewProps> = ({ 
  currentUser, 
  categories, 
  onNavigateSubmit, 
  onRefreshAppData 
}) => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: All, My requests, Assigned to me, Available queue (Screenshot 3)
  const [activeQueueTab, setActiveQueueTab] = useState<'All' | 'My requests' | 'Assigned to me' | 'Available queue'>('All');

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('All Time');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');

  // Pill Filter states
  const [selectedPriorityPill, setSelectedPriorityPill] = useState<string | null>(null);
  const [selectedStatusPill, setSelectedStatusPill] = useState<string | null>(null);

  // Selected Request Modal State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        search: search || undefined,
        category: selectedCategory || undefined,
        priority: selectedPriorityPill || undefined,
        status: selectedStatusPill || undefined,
        department: selectedDepartment || undefined,
      });

      // Filter by Queue Tab if needed
      let filtered = data;
      if (activeQueueTab === 'My requests') {
        filtered = data.filter((r) => r.userId === currentUser.id || r.userEmail === currentUser.email);
      } else if (activeQueueTab === 'Assigned to me') {
        filtered = data.filter((r) => r.assignedTechnicianName === currentUser.name);
      } else if (activeQueueTab === 'Available queue') {
        filtered = data.filter((r) => !r.assignedTechnicianName && r.status !== 'Resolved' && r.status !== 'Closed');
      }

      setRequests(filtered);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, selectedCategory, selectedDepartment, selectedPriorityPill, selectedStatusPill, activeQueueTab]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTimeRange('All Time');
    setSelectedCategory('');
    setSelectedDepartment('');
    setSelectedTechnician('');
    setSelectedPriorityPill(null);
    setSelectedStatusPill(null);
    setActiveQueueTab('All');
  };

  const handleUpdateRequest = async (id: string, updates: any) => {
    const updated = await api.updateRequest(id, updates);
    setSelectedRequest(updated);
    fetchRequests();
    if (onRefreshAppData) onRefreshAppData();
  };

  const handleOverrideAI = async (id: string, category: string, priority: any, notes: string) => {
    const updated = await api.overrideAIClassification(id, category, priority, notes);
    setSelectedRequest(updated);
    fetchRequests();
    if (onRefreshAppData) onRefreshAppData();
  };

  const handleRetryClassify = async (id: string) => {
    const updated = await api.classifyRequest(id);
    setSelectedRequest(updated);
    fetchRequests();
    if (onRefreshAppData) onRefreshAppData();
  };

  const handleRefreshTicket = (updated: RequestItem) => {
    setSelectedRequest(updated);
    fetchRequests();
    if (onRefreshAppData) onRefreshAppData();
  };

  // Badge styles matching Screenshot 3
  const priorityBadgeStyle: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-600 border border-slate-200',
    Medium: 'bg-sky-50 text-sky-700 border border-sky-200',
    High: 'bg-amber-50 text-amber-700 border border-amber-200',
    Urgent: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  const statusBadgeStyle: Record<string, string> = {
    Resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    New: 'bg-slate-100 text-slate-700 border border-slate-200',
    Assigned: 'bg-sky-50 text-sky-700 border border-sky-200',
    'In Progress': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    Cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
    Closed: 'bg-slate-100 text-slate-600 border border-slate-200',
    'Account Blocked': 'bg-rose-50 text-rose-700 border border-rose-200',
    'AI Classified': 'bg-sky-50 text-sky-700 border border-sky-200',
    'Under Review': 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Header (Screenshot 3) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tickets</h1>
        <button
          type="button"
          onClick={onNavigateSubmit}
          className="bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-medium text-xs py-2 px-3.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <span>Log a ticket</span>
        </button>
      </div>

      {/* Filter and Tabs Controls Container (Screenshot 3) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        {/* Row 1: Queue Tabs + Search Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'My requests', 'Assigned to me', 'Available queue'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveQueueTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeQueueTab === tab
                    ? 'bg-[#0284c7] text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or ticket number..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Row 2: Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="All Time">All Time</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="">All departments</option>
            <option value="IT Operations">IT Operations</option>
            <option value="Facilities">Facilities</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="">All technicians</option>
            <option value="Luthando Didiza">Luthando Didiza</option>
            <option value="Masbee MDK">Masbee MDK</option>
            <option value="Sinalo Kekana">Sinalo Kekana</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Row 3: Filter Pills (Screenshot 3) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1 border-t border-slate-100">
          {['Critical', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriorityPill(selectedPriorityPill === p ? null : p)}
              className={`px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                selectedPriorityPill === p
                  ? 'bg-slate-800 text-white border-slate-800 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'
              }`}
            >
              {p}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {[
            'New',
            'Assigned',
            'In Progress',
            'Pending User',
            'Pending Third Party',
            'Escalated',
            'Resolved',
            'Closed',
            'Reopened',
            'Cancelled',
          ].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatusPill(selectedStatusPill === s ? null : s)}
              className={`px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                selectedStatusPill === s
                  ? 'bg-slate-800 text-white border-slate-800 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tickets Table (Screenshot 3) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs text-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading tickets...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">No tickets found.</p>
            <p className="text-slate-400 text-xs">Try clearing filters or logging a new ticket.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold bg-white">
                  <th className="py-3 px-4">TICKET</th>
                  <th className="py-3 px-4">REQUESTER</th>
                  <th className="py-3 px-4">PRIORITY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">OWNER</th>
                  <th className="py-3 px-4">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {requests.map((req) => {
                  const isResolved = req.status === 'Resolved' || req.status === 'Closed';
                  const isBreached = req.slaStatus === 'Breached' || (req.slaRemainingHours != null && req.slaRemainingHours < 0);
                  const isAtRisk = req.slaStatus === 'At Risk';

                  // Assign sample realistic owners if not set
                  const ownerName = req.assignedTechnicianName || (req.id.includes('2') || req.id.includes('3') ? 'Luthando Didiza' : 'Masbee MDK');

                  return (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedRequest(req)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Ticket Column */}
                      <td className="py-3 px-4">
                        <div className="text-sky-600 font-semibold hover:underline">
                          {req.id}
                        </div>
                        <div className="text-slate-900 font-medium text-xs mt-0.5 line-clamp-1">
                          {req.title}
                        </div>
                      </td>

                      {/* Requester */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {req.userName || 'Masibulele Madikane'}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${priorityBadgeStyle[req.priority] || priorityBadgeStyle.Low}`}>
                          {req.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeStyle[req.status] || statusBadgeStyle.New}`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {ownerName}
                      </td>

                      {/* SLA Countdown Timer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SLACountdownBadge ticket={req} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          currentUser={currentUser}
          categories={categories}
          onClose={() => setSelectedRequest(null)}
          onUpdateRequest={handleUpdateRequest}
          onOverrideAI={handleOverrideAI}
          onRetryClassify={handleRetryClassify}
          onRefreshTicket={handleRefreshTicket}
        />
      )}
    </div>
  );
};
