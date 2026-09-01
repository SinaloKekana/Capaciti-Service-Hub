import React, { useState, useEffect, useRef } from 'react';
import { User, RequestItem, Priority, RequestStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Ticket, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Zap, 
  ShieldAlert, 
  Clock, 
  MessageSquare,
  HelpCircle,
  Wrench,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';

interface AIChatbotWidgetProps {
  currentUser: User | null;
  onOpenNewTicket?: () => void;
  onRefreshAppData?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  troubleshootingTips?: string[];
  suggestedActions?: string[];
  draftTicket?: {
    title: string;
    description: string;
    priority: Priority;
    impact: string;
    category: string;
    department: string;
  };
  matchedTickets?: {
    id: string;
    title: string;
    status: RequestStatus;
    priority: Priority;
    department?: string;
    createdAt: string;
  }[];
  ticketCreatedId?: string;
}

export const AIChatbotWidget: React.FC<AIChatbotWidgetProps> = ({
  currentUser,
  onOpenNewTicket,
  onRefreshAppData,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'shortcuts'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<string | null>(null);
  const [userTickets, setUserTickets] = useState<RequestItem[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! 👋 I'm **Capaciti Copilot**, your AI Support & Triage Assistant.\n\nHow can I help you today? You can ask me to troubleshoot an issue, check ticket status, or draft a service request for IT, HR, or Operations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Check my open tickets',
        'Reset my password',
        'Request software access',
        'How do SLAs work?',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      loadUserTickets();
    }
  }, [isOpen]);

  const loadUserTickets = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingTickets(true);
      const tickets = await api.getRequests();
      setUserTickets(tickets.slice(0, 5));
    } catch (err) {
      console.error('Failed to load tickets in chatbot widget:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsTyping(true);

    try {
      const historyPayload = updatedHistory
        .filter((m) => m.sender === 'user' || m.sender === 'assistant')
        .map((m) => ({
          sender: m.sender as 'user' | 'assistant',
          text: m.text,
        }));

      const res = await api.sendChatbotMessage(query, historyPayload);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.message || 'I have analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        troubleshootingTips: res.troubleshootingTips,
        suggestedActions: res.suggestedActions,
        draftTicket: res.draftTicket,
        matchedTickets: res.matchedTickets,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chatbot message error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I'm having a brief connection delay with the AI service. You can still create a ticket manually using the 'New Ticket' button or try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Try again', 'Submit ticket manually'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateTicketFromDraft = async (msgId: string, draft: NonNullable<ChatMessage['draftTicket']>) => {
    if (!currentUser) {
      alert('Please sign in to submit a service ticket.');
      return;
    }

    try {
      setIsSubmittingTicket(msgId);
      const created = await api.createRequest({
        title: draft.title,
        description: `${draft.description}\n\n[Auto-logged via Capaciti AI Copilot Chatbot]`,
        requestType: draft.category === 'Account Access' ? 'Access Request' : 'Support Request',
        priority: draft.priority,
        department: draft.department as any,
      });

      // Update message state with confirmation
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                ticketCreatedId: created.id,
              }
            : m
        )
      );

      // Add a system confirmation message
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `✅ **Ticket #${created.id} successfully created!**\nPriority: **${created.priority}** (${created.slaTargetHours}h SLA target). Our ${created.department || 'IT'} queue has been notified.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: ['View ticket in queue', 'Ask another question'],
        },
      ]);

      if (onRefreshAppData) {
        onRefreshAppData();
      }
      loadUserTickets();
    } catch (err: any) {
      console.error('Failed to create ticket from chatbot draft:', err);
      alert('Failed to log ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(null);
    }
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. How can I assist you now, ${currentUser?.name ? currentUser.name.split(' ')[0] : 'friend'}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Check my open tickets', 'Reset password', 'Browse FAQs'],
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          id="capaciti-chatbot-launcher"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group hover:scale-[1.02] border border-sky-300/30"
          aria-label="Open AI Copilot Chatbot"
        >
          <div className="relative">
            <CapacitiLogoIcon className="w-6 h-6" rounded="rounded-full" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0284c7] rounded-full animate-pulse" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold leading-none flex items-center space-x-1.5">
              <span>Capaciti Copilot</span>
              <Sparkles className="w-3 h-3 text-sky-200" />
            </div>
            <div className="text-[10px] text-sky-100 font-medium leading-none mt-1">
              AI Support & Triage
            </div>
          </div>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          id="capaciti-chatbot-window"
          className={`fixed z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col transition-all duration-200 overflow-hidden ${
            isExpanded
              ? 'bottom-4 right-4 top-4 left-4 sm:left-auto sm:w-[680px] sm:top-12'
              : 'bottom-5 right-5 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#0a1c36] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#142e54] shrink-0 select-none">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <CapacitiLogoIcon className="w-7 h-7" rounded="rounded-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#0a1c36]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 leading-none">
                  <span className="font-extrabold text-xs tracking-wider uppercase">Capaciti Copilot</span>
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded border border-sky-400/30">
                    GEMINI 3.7
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium leading-none mt-1 block">
                  Intelligent Triage & Operations Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear conversation history"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse size' : 'Expand size'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-header Quick Navigation Pills */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💬 Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('tickets');
                  loadUserTickets();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'tickets'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎫 My Tickets</span>
                {userTickets.length > 0 && (
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1 rounded-full">
                    {userTickets.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shortcuts')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'shortcuts'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Shortcuts
              </button>
            </div>

            <span className="text-[10px] font-medium text-emerald-600 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Online</span>
            </span>
          </div>

          {/* Tab 1: Chat View */}
          {activeTab === 'chat' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'system'
                      ? 'items-center'
                      : 'items-start'
                  }`}
                >
                  {/* System Notification */}
                  {msg.sender === 'system' && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs max-w-[90%] shadow-2xs my-1">
                      <div className="font-semibold">{msg.text}</div>
                      <div className="text-[10px] text-emerald-600 mt-1">{msg.timestamp}</div>
                    </div>
                  )}

                  {/* Regular User & Assistant Messages */}
                  {msg.sender !== 'system' && (
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs relative group shadow-2xs ${
                        msg.sender === 'user'
                          ? 'bg-[#0284c7] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      }`}
                    >
                      {/* Assistant Header Icon */}
                      {msg.sender === 'assistant' && (
                        <div className="flex items-center justify-between mb-1.5 text-slate-400">
                          <div className="flex items-center space-x-1 text-[11px] font-bold text-sky-700">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Capaciti Copilot</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Copy message"
                          >
                            {copiedMsgId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>

                      {/* Troubleshooting Tips Box */}
                      {msg.troubleshootingTips && msg.troubleshootingTips.length > 0 && (
                        <div className="mt-2.5 p-2.5 bg-sky-50/70 border border-sky-100 rounded-xl text-slate-700">
                          <div className="flex items-center space-x-1.5 font-bold text-sky-900 mb-1.5 text-[11px]">
                            <Wrench className="w-3 h-3 text-sky-600" />
                            <span>Recommended Troubleshooting:</span>
                          </div>
                          <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                            {msg.troubleshootingTips.map((tip, idx) => (
                              <li key={idx} className="leading-tight">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Matched Tickets Card (if status check) */}
                      {msg.matchedTickets && msg.matchedTickets.length > 0 && (
                        <div className="mt-2.5 space-y-1.5">
                          {msg.matchedTickets.map((t) => (
                            <div
                              key={t.id}
                              className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px]"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="font-bold text-slate-900 truncate">#{t.id} - {t.title}</div>
                                <div className="text-slate-500 text-[10px]">
                                  {t.department || 'IT'} • {new Date(t.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center space-x-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    t.priority === 'Urgent'
                                      ? 'bg-rose-100 text-rose-700'
                                      : t.priority === 'High'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {t.priority}
                                </span>
                                <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                  {t.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Auto-Drafted Ticket Card */}
                      {msg.draftTicket && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-slate-50 to-sky-50/40 border border-sky-200 rounded-xl text-slate-800 shadow-2xs">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                              <Ticket className="w-3.5 h-3.5 text-sky-600" />
                              <span>Drafted Service Ticket</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                msg.draftTicket.priority === 'Urgent'
                                  ? 'bg-rose-500 text-white'
                                  : msg.draftTicket.priority === 'High'
                                  ? 'bg-amber-500 text-white'
                                  : msg.draftTicket.priority === 'Low'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-sky-600 text-white'
                              }`}
                            >
                              {msg.draftTicket.priority} Priority
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-900 mb-1">
                            {msg.draftTicket.title}
                          </div>
                          <div className="text-[10px] text-slate-600 line-clamp-2 mb-2">
                            {msg.draftTicket.description}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60 mb-2">
                            <span>Dept: <strong>{msg.draftTicket.department}</strong></span>
                            <span>Category: <strong>{msg.draftTicket.category}</strong></span>
                          </div>

                          {msg.ticketCreatedId ? (
                            <div className="w-full py-1.5 px-2 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Logged as Ticket #{msg.ticketCreatedId}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isSubmittingTicket === msg.id}
                              onClick={() => msg.draftTicket && handleCreateTicketFromDraft(msg.id, msg.draftTicket)}
                              className="w-full py-2 px-3 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isSubmittingTicket === msg.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Logging Ticket...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>1-Click Log Ticket to Queue</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div
                        className={`text-[9px] mt-1.5 font-medium ${
                          msg.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  )}

                  {/* Suggested Quick Prompt Chips under assistant message */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (action === 'View ticket in queue' && onNavigateTab) {
                              onNavigateTab('requests');
                              setIsOpen(false);
                            } else if (action === 'Submit ticket manually' && onOpenNewTicket) {
                              onOpenNewTicket();
                              setIsOpen(false);
                            } else {
                              handleSendMessage(action);
                            }
                          }}
                          className="text-[11px] bg-white hover:bg-sky-50 text-sky-800 border border-sky-200/80 px-2.5 py-1 rounded-full font-medium shadow-2xs hover:border-sky-400 transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>{action}</span>
                          <ChevronRight className="w-2.5 h-2.5 text-sky-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white p-3 rounded-2xl rounded-bl-xs border border-slate-200 w-fit shadow-2xs">
                  <Bot className="w-4 h-4 text-sky-600 animate-bounce" />
                  <span className="text-[11px] font-medium text-slate-600">Capaciti Copilot is thinking...</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Tab 2: My Tickets Quick Glance */}
          {activeTab === 'tickets' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Your Active Service Requests</span>
                <button
                  type="button"
                  onClick={loadUserTickets}
                  className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingTickets ? (
                <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center">
                  <Loader2 className="w-5 h-5 animate-spin mb-2 text-sky-600" />
                  <span>Loading your tickets...</span>
                </div>
              ) : userTickets.length === 0 ? (
                <div className="text-center py-8 bg-white border border-slate-200 rounded-xl p-4">
                  <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No open tickets found</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Have an issue? Ask the chatbot or log a ticket directly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage('I need help logging a new ticket');
                    }}
                    className="mt-3 text-xs bg-sky-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-500 cursor-pointer"
                  >
                    Draft a Ticket
                  </button>
                </div>
              ) : (
                userTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-sky-700">#{t.id}</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : t.priority === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[10px] bg-sky-50 text-sky-800 font-semibold px-1.5 py-0.5 rounded border border-sky-100">
                          {t.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                      {t.description}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>{t.department || 'IT'} Dept</span>
                      <span>Target: {t.slaTargetHours || 24}h SLA</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage(`What is the current status and update for ticket #${t.id}?`);
                      }}
                      className="mt-2 w-full py-1.5 text-center text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Ask AI about this ticket →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Shortcuts & Common Issues */}
          {activeTab === 'shortcuts' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                Common IT, HR & Operational Quick Actions
              </span>

              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    title: '🔑 Password Reset & MFA Unlock',
                    desc: 'Troubleshoot SSO login or log emergency credential unlock',
                    prompt: 'I am locked out of my account and need to reset my password.',
                  },
                  {
                    title: '💻 Software License & Tool Requisition',
                    desc: 'Request Figma, GitHub Copilot, AWS Sandbox, or JetBrains',
                    prompt: 'I would like to request a software license for my development project.',
                  },
                  {
                    title: '🎧 Bluetooth / Audio Connectivity',
                    desc: 'Pair headphones or troubleshoot music playback',
                    prompt: 'My bluetooth headphones are not connecting to listen to music.',
                  },
                  {
                    title: '🚨 Report Critical Outage / Security Alert',
                    desc: 'Escalate enterprise blocker with 2-hour Urgent SLA',
                    prompt: 'I need to report a critical security threat / production server outage.',
                  },
                  {
                    title: '🏝️ HR Leave & Time-Off Policy',
                    desc: 'Annual, sick, and study leave submission procedures',
                    prompt: 'How do I submit an annual leave application and what is the notice period?',
                  },
                  {
                    title: '🎓 Capaciti LMS & Academy Access',
                    desc: 'Canvas, Moodle, or student portal authorization',
                    prompt: 'I am unable to access the Capaciti Academy LMS courses.',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(item.prompt);
                    }}
                    className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-xl text-left shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                id="capaciti-chatbot-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Capaciti Copilot anything..."
                disabled={isTyping}
                className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                id="capaciti-chatbot-send-btn"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Powered by Capaciti AI Engine</span>
              <span>Gemini 3.7 Flash</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
