import React, { useState } from 'react';
import { RequestType, Priority, Department, RequestItem } from '../types/index.js';
import { api } from '../services/api.js';
import { SLACountdownCard } from './SLACountdownTimer.js';
import { getSLATargetHoursForPriority } from '../utils/slaCalculator.js';
import { 
  Send, 
  Bot, 
  Paperclip, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Mail, 
  ArrowRight,
  X,
  HelpCircle,
  Wrench,
  Loader2,
  Clock
} from 'lucide-react';

interface SubmitRequestViewProps {
  onSubmit: (data: {
    title: string;
    description: string;
    requestType: RequestType;
    priority: Priority;
    department?: Department;
    attachments?: any[];
  }) => Promise<RequestItem>;
  onViewAllRequests: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isQuickAction?: boolean;
}

export const SubmitRequestView: React.FC<SubmitRequestViewProps> = ({ onSubmit, onViewAllRequests }) => {
  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Hi! Tell me what's going wrong and I'll help classify and log the ticket.",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [troubleshootingTips, setTroubleshootingTips] = useState<string[]>([]);

  // Ticket Form Details State (Auto-filled by AI, editable by user)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [impact, setImpact] = useState<string>('Just me');
  const [category, setCategory] = useState<string>('Access & Accounts');
  const [department, setDepartment] = useState<Department>('IT');
  const [requestType, setRequestType] = useState<RequestType>('Support Request');
  const [attachments, setAttachments] = useState<{ name: string; size: number; type: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<RequestItem | null>(null);

  // Send message to AI Support Assistant
  const handleSendMessage = async (customMessage?: string, statusFlag?: string) => {
    const textToSend = customMessage || chatInput.trim();
    if (!textToSend && !statusFlag) return;

    if (!customMessage) {
      setChatInput('');
    }

    // Instant local pre-fill so user sees form update immediately (< 1ms)
    if (textToSend && textToSend !== 'Still unfixed') {
      if (!title || title.length < 5) {
        setTitle(textToSend.length > 50 ? `${textToSend.slice(0, 48)}...` : textToSend);
      }
      if (!description || description.length < 10) {
        setDescription(`User reported: "${textToSend}". Pending AI self-service troubleshooting and classification.`);
      }

      // Fast preliminary heuristic for instant UI responsiveness
      const lower = textToSend.toLowerCase();
      if (
        lower.includes('music') ||
        (lower.includes('bluetooth') && (lower.includes('music') || lower.includes('song') || lower.includes('listen') || lower.includes('headphone') || lower.includes('airpod'))) ||
        lower.includes('wallpaper') || lower.includes('theme')
      ) {
        setPriority('Low');
      } else if (
        lower.includes('stolen') || lower.includes('breach') || lower.includes('hacked') ||
        lower.includes('ransomware') || lower.includes('production down') || lower.includes('phishing')
      ) {
        setPriority('Urgent');
      } else if (lower.includes('locked out') || lower.includes('cannot login') || lower.includes('won\'t boot') || lower.includes('blue screen')) {
        setPriority('High');
      }
    }

    // Append user message
    const userMsgId = `user-${Date.now()}`;
    const newHistory = [
      ...chatMessages,
      { id: userMsgId, sender: 'user' as const, text: textToSend },
    ];
    setChatMessages(newHistory);
    setIsAssistantThinking(true);

    try {
      const historyForApi = newHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await api.sendSupportAssistantChat(textToSend, historyForApi, statusFlag);

      // Append assistant message
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: res.assistantMessage,
        },
      ]);

      // Update troubleshooting tips
      if (res.troubleshootingTips && res.troubleshootingTips.length > 0) {
        setTroubleshootingTips(res.troubleshootingTips);
      }

      // Auto-populate / draft ticket details form with high precision
      if (res.draftTicket) {
        if (res.draftTicket.title) setTitle(res.draftTicket.title);
        if (res.draftTicket.description) setDescription(res.draftTicket.description);
        if (res.draftTicket.priority) setPriority(res.draftTicket.priority);
        if (res.draftTicket.impact) setImpact(res.draftTicket.impact);
        if (res.draftTicket.category) setCategory(res.draftTicket.category);
        if (res.draftTicket.department) setDepartment(res.draftTicket.department as Department);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          sender: 'assistant',
          text: "I've drafted the ticket details on the right for you. You can adjust the form fields directly and click 'Submit ticket'.",
        },
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  const handleQuickUnfixed = () => {
    handleSendMessage('Still unfixed', 'unfixed');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files).map((f: File) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setAttachments((prev) => [...prev, ...fileList]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description before submitting.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const ticket = await onSubmit({
        title,
        description,
        requestType,
        priority,
        department,
        attachments,
      });
      setSubmittedTicket(ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  // Ticket Creation Success Confirmation View
  if (submittedTicket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-slate-800 space-y-6">
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ticket Logged & Auto-Classified</div>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Tracking Ref: <span className="font-mono text-indigo-600">{submittedTicket.id}</span></h2>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-indigo-900">
            <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-950">Confirmation Email Sent to {submittedTicket.userEmail || 'your email'}</p>
              <p className="text-indigo-800 mt-1">A receipt containing ticket <span className="font-mono font-bold">{submittedTicket.id}</span> and assigned AI category has been sent to your inbox and recorded in system notifications.</p>
            </div>
          </div>

          {/* Real-time SLA Countdown Tracker Card */}
          <SLACountdownCard ticket={submittedTicket} />

          {submittedTicket.aiClassification && (
            <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>AI AUTOMATED TICKET CLASSIFICATION</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold">
                  Model: {submittedTicket.aiClassification.model}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Assigned Category</span>
                  <span className="text-base font-extrabold text-indigo-700">{submittedTicket.aiClassification.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium">Subcategory</span>
                  <span className="text-sm font-semibold text-slate-800">{submittedTicket.aiClassification.subcategory || 'General'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-medium mb-1">AI Executive Summary</span>
                <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                  {submittedTicket.aiClassification.summary}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-medium mb-1">Recommended Action</span>
                <p className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium">
                  {submittedTicket.aiClassification.recommendedAction}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => {
                setSubmittedTicket(null);
                setTitle('');
                setDescription('');
                setChatMessages([
                  {
                    id: 'msg-init-2',
                    sender: 'assistant',
                    text: "Hi! Tell me what's going wrong and I'll help classify and log the ticket.",
                  },
                ]);
                setTroubleshootingTips([]);
              }}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors text-center"
            >
              Submit Another Request
            </button>

            <button
              onClick={onViewAllRequests}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-200 text-center flex items-center justify-center space-x-2"
            >
              <span>View All Requests Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Support Assistant Chatbot */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[580px] justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Support assistant</span>
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                AI Auto-Drafting
              </span>
            </div>

            {/* Chat Thread */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0f4c81] text-white rounded-br-none shadow-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isAssistantThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-slate-500 flex items-center space-x-2 shadow-2xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Analyzing issue & drafting ticket...</span>
                  </div>
                </div>
              )}
            </div>

            {/* "Try these first" troubleshooting box */}
            {troubleshootingTips.length > 0 && (
              <div className="mt-4 bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-2.5 shadow-2xs">
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try these first</span>
                </div>
                <div className="text-slate-600 space-y-1 text-[11px] leading-relaxed">
                  {troubleshootingTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="text-slate-400 select-none">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                {/* Clear action button for user if tips don't resolve the issue */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleQuickUnfixed}
                    disabled={isAssistantThinking}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-900 font-semibold text-[11px] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tips didn't resolve your issue? Click to escalate ticket</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Scenario Starters */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Example Scenarios</span>
              <span className="text-[10px] text-slate-400">Click to test priority triage</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => handleSendMessage('My bluetooth is not working to listen to music')}
                disabled={isAssistantThinking}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-medium transition-colors text-left flex items-center space-x-1"
                title="Personal convenience / non-blocking -> Low Priority"
              >
                <span>🎵 Bluetooth for music</span>
                <span className="text-[9px] font-bold px-1 rounded bg-emerald-200/70 text-emerald-900">Low</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('URGENT: Stolen admin credentials and unauthorized login detected')}
                disabled={isAssistantThinking}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-medium transition-colors text-left flex items-center space-x-1"
                title="Security emergency -> Urgent Priority"
              >
                <span>🚨 Stolen credentials</span>
                <span className="text-[9px] font-bold px-1 rounded bg-red-200/70 text-red-900">Urgent</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('Locked out of primary laptop, blue screen error blocking daily work')}
                disabled={isAssistantThinking}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-medium transition-colors text-left flex items-center space-x-1"
                title="Work blocker with no workaround -> High Priority"
              >
                <span>💻 Locked workstation</span>
                <span className="text-[9px] font-bold px-1 rounded bg-amber-200/70 text-amber-900">High</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('Question about software license subscription billing invoice')}
                disabled={isAssistantThinking}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-medium transition-colors text-left flex items-center space-x-1"
                title="Standard operational request -> Medium Priority"
              >
                <span>💳 Invoice question</span>
                <span className="text-[9px] font-bold px-1 rounded bg-sky-200/70 text-sky-900">Medium</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe the issue (e.g. My bluetooth is not working to listen to music)..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f4c81] focus:ring-1 focus:ring-[#0f4c81]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAssistantThinking}
                className="px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] disabled:opacity-50 text-white font-medium text-xs transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
              >
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket details Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="pb-3 mb-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Ticket details</h2>
            <span className="text-[11px] text-slate-400">Review & submit</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs mb-4 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-[11px]">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title auto-filled by AI assistant or type here..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-[11px]">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description auto-filled by AI assistant or type details here..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white text-xs leading-relaxed"
              />
            </div>

            {/* Priority & Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold text-[11px]">Priority</label>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                    {getSLATargetHoursForPriority(priority)}h SLA Target
                  </span>
                </div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f4c81] focus:bg-white text-xs"
                >
                  <option value="Low">Low (72-hour SLA)</option>
                  <option value="Medium">Medium (24-hour SLA)</option>
                  <option value="High">High (8-hour SLA)</option>
                  <option value="Urgent">Urgent (2-hour SLA)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">Impact</label>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f4c81] focus:bg-white text-xs"
                >
                  <option value="Just me">Just me</option>
                  <option value="Department / Team">Department / Team</option>
                  <option value="Company-wide">Company-wide</option>
                </select>
              </div>
            </div>

            {/* Category & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f4c81] focus:bg-white text-xs"
                >
                  <option value="Access & Accounts">Access & Accounts</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Billing">Billing</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0f4c81] focus:bg-white text-xs"
                >
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Procurement">Procurement</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Attachments Dropzone */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-[11px]">Attachments (Optional)</label>
              <div className="border border-dashed border-slate-300 hover:border-[#0f4c81] rounded-xl p-3 text-center bg-slate-50/50 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center space-x-2 text-slate-600">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-xs">Attach files or screenshots</span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-100 px-3 py-1 rounded-lg text-slate-800 text-[11px] border border-slate-200">
                      <span className="truncate max-w-xs font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-slate-400 hover:text-rose-600 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading || !title.trim() || !description.trim()}
                className="w-full py-2.5 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Logging Ticket...</span>
                  </>
                ) : (
                  <span>Submit ticket</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
