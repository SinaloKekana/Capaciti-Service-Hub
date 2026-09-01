import React, { useState, useEffect } from 'react';
import { User, ApprovalRequest, RequestItem } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  DollarSign, 
  ShieldAlert, 
  FileText, 
  UserCheck, 
  Building2, 
  ChevronRight, 
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface ApprovalDashboardViewProps {
  user: User | null;
  onNavigateTicket?: (ticketId: string) => void;
}

export const ApprovalDashboardView: React.FC<ApprovalDashboardViewProps> = ({ user, onNavigateTicket }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [tickets, setTickets] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Decision Modal State
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [isDeciding, setIsDeciding] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // New Approval Request Modal State
  const [showNewApprovalModal, setShowNewApprovalModal] = useState(false);
  const [newApprovalForm, setNewApprovalForm] = useState<{
    requestId: string;
    ticketTitle: string;
    approvalType: string;
    estimatedCost: number;
    justification: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    requiredRole: 'SUPERVISOR' | 'ADMIN';
  }>({
    requestId: '',
    ticketTitle: '',
    approvalType: 'EQUIPMENT_REQUISITION',
    estimatedCost: 12500,
    justification: '',
    riskLevel: 'Medium',
    requiredRole: 'SUPERVISOR',
  });

  const isSupervisorOrAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const [approvalList, ticketList] = await Promise.all([
        api.getApprovals().catch(() => []),
        api.getRequests().catch(() => []),
      ]);
      setApprovals(approvalList);
      setTickets(ticketList);
      if (ticketList.length > 0 && !newApprovalForm.requestId) {
        setNewApprovalForm((prev) => ({
          ...prev,
          requestId: ticketList[0].id,
          ticketTitle: ticketList[0].title,
        }));
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleOpenDecisionModal = (approval: ApprovalRequest, type: 'APPROVED' | 'REJECTED') => {
    setSelectedApproval(approval);
    setDecisionType(type);
    setDecisionNotes(
      type === 'APPROVED'
        ? `Authorized by ${user?.name || 'Supervisor'}. Approved per standard operational budget & governance policy.`
        : `Declined by ${user?.name || 'Supervisor'}. Please review requisition specifications or consult your team lead.`
    );
    setShowDecisionModal(true);
  };

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    setIsDeciding(true);
    try {
      const updated = await api.decideApproval(selectedApproval.id, decisionType, decisionNotes);
      setApprovals(approvals.map((a) => (a.id === selectedApproval.id ? updated : a)));
      setShowDecisionModal(false);
      setSelectedApproval(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit approval decision');
    } finally {
      setIsDeciding(false);
    }
  };

  const handleCreateApprovalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApprovalForm.justification.trim()) {
      alert('Please provide a justification');
      return;
    }

    try {
      const created = await api.createApproval(newApprovalForm);
      setApprovals([created, ...approvals]);
      setShowNewApprovalModal(false);
      setNewApprovalForm({
        requestId: tickets[0]?.id || '',
        ticketTitle: tickets[0]?.title || '',
        approvalType: 'EQUIPMENT_REQUISITION',
        estimatedCost: 12500,
        justification: '',
        riskLevel: 'Medium',
        requiredRole: 'SUPERVISOR',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create approval request');
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const approvedCount = approvals.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = approvals.filter((a) => a.status === 'REJECTED').length;
  const totalCostUnderReview = approvals
    .filter((a) => a.status === 'PENDING')
    .reduce((acc, a) => acc + (a.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1c36] via-[#0f2e59] to-[#0a1c36] rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Sprint 2 Deliverable: Multi-Tier Approval Workflows</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Executive Approval & Authorization Hub
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Enforce corporate governance, IT equipment requisition sign-offs, high-value expense authorizations, and elevated security access gates before execution.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowNewApprovalModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Approval Request</span>
            </button>
            <button
              type="button"
              onClick={fetchApprovals}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Refresh Approvals"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Pending Review</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{pendingCount}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Approved Requests</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{approvedCount}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Declined / Rejected</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{rejectedCount}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Pending Capital Value</div>
            <div className="text-xl font-bold text-white mt-0.5">
              R {totalCostUnderReview.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-2">
          {[
            { id: 'ALL', label: 'All Requests', count: approvals.length },
            { id: 'PENDING', label: 'Pending Review', count: pendingCount, color: 'text-amber-600 bg-amber-50' },
            { id: 'APPROVED', label: 'Authorized', count: approvedCount, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'REJECTED', label: 'Rejected', count: rejectedCount, color: 'text-rose-600 bg-rose-50' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                statusFilter === tab.id
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${tab.color || 'bg-slate-100 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Approvals Cards Grid */}
      {filteredApprovals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No approval requests in this category</h3>
          <p className="text-xs text-slate-500 mt-1">All incoming workflow requisitions have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApprovals.map((req) => (
            <div
              key={req.id}
              className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all bg-white ${
                req.status === 'PENDING'
                  ? 'border-amber-200 hover:border-amber-300'
                  : req.status === 'APPROVED'
                  ? 'border-emerald-200'
                  : 'border-rose-200'
              }`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {req.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          req.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug mt-1">
                      {req.ticketTitle}
                    </h3>
                  </div>

                  {/* Requisition Type Badge */}
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                    {req.approvalType.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Requestor:</span>
                    <div className="font-semibold text-slate-800 truncate">{req.requestorName}</div>
                    <div className="text-[11px] text-slate-500">{req.department}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Required Role:</span>
                    <div className="font-bold text-slate-800">{req.requiredRole}</div>
                    <div className="text-[11px] text-slate-500">Risk: <strong className={req.riskLevel === 'High' || req.riskLevel === 'Critical' ? 'text-rose-600' : 'text-slate-700'}>{req.riskLevel}</strong></div>
                  </div>

                  {req.estimatedCost ? (
                    <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">Estimated Expense:</span>
                      <span className="text-xs font-extrabold text-slate-900 font-mono">
                        R {req.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Justification Quote */}
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Business Justification:</span>
                  <p className="text-xs text-slate-700 mt-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/60 italic leading-relaxed">
                    "{req.justification}"
                  </p>
                </div>

                {/* Decision Results (If decided) */}
                {req.status !== 'PENDING' && (
                  <div className={`p-3 rounded-xl border text-xs mb-2 ${
                    req.status === 'APPROVED' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center space-x-1.5 font-bold mb-1">
                      {req.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{req.status === 'APPROVED' ? 'Authorized By' : 'Rejected By'} {req.decidedByName}</span>
                      {req.decidedAt && (
                        <span className="text-[10px] font-normal text-slate-500">
                          ({new Date(req.decidedAt).toLocaleString()})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-700">{req.decisionNotes}</div>
                  </div>
                )}
              </div>

              {/* Card Actions Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {req.status === 'PENDING' && isSupervisorOrAdmin ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDecisionModal(req, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDecisionModal(req, 'APPROVED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Authorize
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Linked to Ticket: <strong className="text-sky-700">{req.requestId}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUPERVISOR DECISION MODAL */}
      {showDecisionModal && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                {decisionType === 'APPROVED' ? (
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {decisionType === 'APPROVED' ? 'Authorize Requisition' : 'Decline Requisition'}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedApproval.id} • {selectedApproval.ticketTitle}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Requestor:</span>
                <span className="font-bold text-slate-900">{selectedApproval.requestorName} ({selectedApproval.department})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="font-semibold text-slate-800">{selectedApproval.approvalType}</span>
              </div>
              {selectedApproval.estimatedCost ? (
                <div className="flex justify-between">
                  <span className="text-slate-500">Value:</span>
                  <span className="font-extrabold text-slate-900 font-mono">R {selectedApproval.estimatedCost.toLocaleString()}</span>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleExecuteDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supervisor Decision Notes & Corporate Compliance Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                  placeholder="State the audit rationale for approving or declining this requisition..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeciding}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs cursor-pointer shadow-xs ${
                    decisionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isDeciding ? 'Submitting...' : decisionType === 'APPROVED' ? 'Confirm Authorization' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW APPROVAL REQUEST MODAL */}
      {showNewApprovalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Initiate New Approval Gate</h3>
              <button
                type="button"
                onClick={() => setShowNewApprovalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApprovalRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Ticket *</label>
                <select
                  value={newApprovalForm.requestId}
                  onChange={(e) => {
                    const found = tickets.find((t) => t.id === e.target.value);
                    setNewApprovalForm({
                      ...newApprovalForm,
                      requestId: e.target.value,
                      ticketTitle: found?.title || 'Service Ticket',
                    });
                  }}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.id}] - {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requisition Type *</label>
                  <select
                    value={newApprovalForm.approvalType}
                    onChange={(e) => setNewApprovalForm({ ...newApprovalForm, approvalType: e.target.value })}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="EQUIPMENT_REQUISITION">Equipment Requisition</option>
                    <option value="BUDGET_EXPENSE">Budget / Expense Sign-off</option>
                    <option value="SOFTWARE_LICENSE">Software License Grant</option>
                    <option value="SECURITY_ACCESS">Elevated Security Access</option>
                    <option value="ACCOUNT_UNBLOCK">Corporate Account Unblock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost (ZAR R)</label>
                  <input
                    type="number"
                    value={newApprovalForm.estimatedCost}
                    onChange={(e) => setNewApprovalForm({ ...newApprovalForm, estimatedCost: Number(e.target.value) })}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Risk Level</label>
                  <select
                    value={newApprovalForm.riskLevel}
                    onChange={(e) => setNewApprovalForm({ ...newApprovalForm, riskLevel: e.target.value as any })}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Approver Role</label>
                  <select
                    value={newApprovalForm.requiredRole}
                    onChange={(e) => setNewApprovalForm({ ...newApprovalForm, requiredRole: e.target.value as any })}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="SUPERVISOR">Operations Manager (Supervisor)</option>
                    <option value="ADMIN">Global Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Justification *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the operational need, business ROI, and reason for this request..."
                  value={newApprovalForm.justification}
                  onChange={(e) => setNewApprovalForm({ ...newApprovalForm, justification: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewApprovalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
