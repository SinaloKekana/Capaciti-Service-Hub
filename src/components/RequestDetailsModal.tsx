import React, { useState } from 'react';
import { RequestItem, User, Priority, RequestStatus, AIResponseTone, AIGeneratedResponse } from '../types/index.js';
import { api } from '../services/api.js';
import { SLACountdownCard, SLACountdownBadge } from './SLACountdownTimer.js';
import { 
  X, 
  Bot, 
  User as UserIcon, 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Edit3, 
  RefreshCw, 
  Paperclip,
  Send,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Zap,
  Copy,
  Check,
  Building2,
  ChevronDown
} from 'lucide-react';

interface RequestDetailsModalProps {
  request: RequestItem | null;
  currentUser: User;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onUpdateRequest: (
    id: string,
    updates: {
      status?: RequestStatus;
      priority?: Priority;
      department?: string;
      resolutionNotes?: string;
      internalNote?: string;
    }
  ) => Promise<void>;
  onOverrideAI: (id: string, category: string, priority: Priority, notes: string) => Promise<void>;
  onRetryClassify: (id: string) => Promise<void>;
  onRefreshTicket?: (updated: RequestItem) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  currentUser,
  categories,
  onClose,
  onUpdateRequest,
  onOverrideAI,
  onRetryClassify,
  onRefreshTicket,
}) => {
  if (!request) return null;

  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [priority, setPriority] = useState<Priority>(request.priority);
  const [resolutionNotes, setResolutionNotes] = useState(request.resolutionNotes || '');
  const [internalNote, setInternalNote] = useState('');

  // AI Response Generation Studio State
  const [responseTone, setResponseTone] = useState<AIResponseTone>('professional_empathetic');
  const [customInstructions, setCustomInstructions] = useState('');
  const [draftResponseText, setDraftResponseText] = useState(request.lastDraftResponse || '');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [dispatchingResponse, setDispatchingResponse] = useState(false);
  const [applyAsResolution, setApplyAsResolution] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Override AI Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState(request.aiClassification?.category || 'IT Support');
  const [overridePriority, setOverridePriority] = useState<Priority>(request.priority);
  const [overrideNotes, setOverrideNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveOpsUpdates = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await onUpdateRequest(request.id, {
        status,
        priority,
        resolutionNotes,
        internalNote: internalNote.trim() ? internalNote : undefined,
      });
      setInternalNote('');
      setMessage('Ticket operational status updated successfully.');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmOverride = async () => {
    setSaving(true);
    try {
      await onOverrideAI(request.id, overrideCategory, overridePriority, overrideNotes);
      setShowOverrideModal(false);
      setMessage('AI Classification manually overridden and logged.');
    } catch (err: any) {
      setMessage(`Override error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRetryAI = async () => {
    setClassifying(true);
    setMessage(null);
    try {
      await onRetryClassify(request.id);
      setMessage('AI Ticket Classification re-executed successfully.');
    } catch (err: any) {
      setMessage(`AI error: ${err.message}`);
    } finally {
      setClassifying(false);
    }
  };

  const handleGenerateAIResponse = async () => {
    setGeneratingResponse(true);
    setMessage(null);
    try {
      const res = await api.generateAIResponse(request.id, responseTone, customInstructions);
      setDraftResponseText(res.response.responseDraft || res.response.responseText || '');
      if (onRefreshTicket && res.request) {
        onRefreshTicket(res.request);
      }
      setMessage(`AI Draft response generated in ${responseTone.replace('_', ' ')} tone.`);
    } catch (err: any) {
      setMessage(`AI response generation error: ${err.message}`);
    } finally {
      setGeneratingResponse(false);
    }
  };

  const handleDispatchResponseEmail = async () => {
    if (!draftResponseText.trim()) return;
    setDispatchingResponse(true);
    setMessage(null);
    try {
      const res = await api.dispatchResponse(
        request.id, 
        draftResponseText, 
        applyAsResolution, 
        internalNote.trim() ? internalNote : undefined
      );
      if (applyAsResolution) {
        setStatus('Resolved');
        setResolutionNotes(draftResponseText);
      }
      if (onRefreshTicket && res.request) {
        onRefreshTicket(res.request);
      }
      setMessage(`Response successfully dispatched to ${request.userEmail}!`);
    } catch (err: any) {
      setMessage(`Dispatch error: ${err.message}`);
    } finally {
      setDispatchingResponse(false);
    }
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftResponseText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const isAdmin = currentUser.role === 'ADMIN';

  // SLA Color & Text
  const slaStyles: Record<string, { bg: string; text: string; label: string }> = {
    'Within SLA': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Within SLA' },
    'At Risk': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'SLA At Risk' },
    'Breached': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'SLA Breached' },
  };
  const currentSLA = slaStyles[request.slaStatus || 'Within SLA'] || slaStyles['Within SLA'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-xl text-slate-800 relative">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10 rounded-t-xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-sky-600 font-bold mb-1 flex-wrap gap-y-1">
              <span>REF: {request.id}</span>
              <span>•</span>
              <span>Submitted {new Date(request.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <SLACountdownBadge ticket={request} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{request.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {message && (
            <div className="bg-sky-50 border border-sky-200 text-sky-900 p-3 rounded-lg flex items-center justify-between font-medium">
              <span>{message}</span>
              <button onClick={() => setMessage(null)} className="text-xs text-sky-700 underline font-semibold cursor-pointer">Dismiss</button>
            </div>
          )}

          {/* Real-time SLA Countdown & Resolution Monitor */}
          <SLACountdownCard ticket={request} />

          {/* User & Metadata Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Submitter User Card */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitter Info</div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-md bg-[#0a1c36] text-white font-bold flex items-center justify-center text-xs">
                  {request.userName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{request.userName || 'User'}</div>
                  <div className="text-[10px] text-slate-500">{request.userEmail || 'N/A'}</div>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">User Role:</span>
                <span className="font-bold text-sky-700">{request.userRole || 'CUSTOMER'}</span>
              </div>
            </div>

            {/* Request Metadata */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service Metadata</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Type:</span>
                  <span className="font-semibold text-slate-800">{request.requestType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Priority:</span>
                  <span className="font-semibold text-slate-800">{request.priority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Category:</span>
                  <span className="font-semibold text-slate-800">{request.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned To:</span>
                  <span className="font-semibold text-slate-800">{request.assignedTechnicianName || 'Queue'}</span>
                </div>
              </div>
            </div>

            {/* SLA Clock & Department Card */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SLA & Department</div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target SLA:</span>
                <span className="font-bold text-slate-800">{request.slaTargetHours || 24} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-slate-800">{request.department || 'Operations'}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Current State:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-800">
                  {request.status}
                </span>
              </div>
            </div>

          </div>

          {/* Description Content Section */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Problem Description</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed whitespace-pre-line text-xs">
              {request.description}
            </div>
          </div>

          {/* AI Response Studio (Week 2 Core Deliverable) */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Response & Auto-Resolution Studio
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Gemini Flash
                </span>
              </div>

              {/* Tone Selection & Generator Trigger */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={responseTone}
                  onChange={(e) => setResponseTone(e.target.value as AIResponseTone)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value="professional_empathetic">Professional & Empathetic</option>
                  <option value="concise_action_oriented">Concise & Action-Oriented</option>
                  <option value="technical_detailed">Technical & Step-by-Step</option>
                  <option value="first_contact_resolution">First Contact Resolution (Direct Fix)</option>
                  <option value="executive_brief">Executive Brief</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateAIResponse}
                  disabled={generatingResponse}
                  className="px-3 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  {generatingResponse ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Draft Response</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Technician Directives */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                Custom Instructions or Diagnostic Notes (Optional for AI)
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Ask them to verify VPN credentials on port 443..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            {/* Generated / Editable Draft Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Technician Response (Will be emailed to submitter)
                </label>
                {draftResponseText && (
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedDraft ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDraft ? 'Copied' : 'Copy Text'}</span>
                  </button>
                )}
              </div>
              <textarea
                value={draftResponseText}
                onChange={(e) => setDraftResponseText(e.target.value)}
                rows={5}
                placeholder="Click 'Draft Response' above or write a reply..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-mono leading-relaxed"
              />
            </div>

            {/* Dispatch and Close controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyAsResolution}
                  onChange={(e) => setApplyAsResolution(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Mark ticket as Resolved upon sending</span>
              </label>

              <button
                type="button"
                onClick={handleDispatchResponseEmail}
                disabled={dispatchingResponse || !draftResponseText.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                {dispatchingResponse ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email Response</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ticket Lifecycle Operations Form */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Ticket Operations & Resolution Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RequestStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Resolution Summary / Knowledge Article</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Document resolution steps for team knowledge base..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveOpsUpdates}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer shadow-2xs transition-colors"
              >
                {saving ? 'Updating...' : 'Save Lifecycle Updates'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
