import React, { useState, useEffect, useRef } from 'react';
import { User, RequestItem, Priority, RequestStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Ticket, 
  Copy, 
  Check, 
  Zap, 
  ShieldAlert, 
  Clock, 
  MessageSquare,
  HelpCircle,
  Wrench,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Search,
  BookOpen,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';

interface AIChatbotViewProps {
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

export const AIChatbotView: React.FC<AIChatbotViewProps> = ({
  currentUser,
  onOpenNewTicket,
  onRefreshAppData,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Hello ${currentUser?.name || 'there'}! 👋 Welcome to the **Capaciti AI Service Hub Copilot**.\n\nI am your intelligent conversational assistant powered by Gemini 3.7 Flash. I can help you with:\n- **Instant Technical Troubleshooting** for SSO, MFA, VPN, WiFi, and Academy tools\n- **Live Ticket Status Inquiries** and SLA progress tracking\n- **Automated Service Ticket Drafting & 1-Click Submission**\n- **Operational & HR Policy Guidance** (Leave, requisitions, procurement)\n\nWhat would you like assistance with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Check my open tickets',
        'Reset my password & MFA',
        'Request software license',
        'How do SLA response times work?',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<string | null>(null);
  const [userTickets, setUserTickets] = useState<RequestItem[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
    loadTickets();
  }, []);

  const loadTickets = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingTickets(true);
      const tickets = await api.getRequests();
      setUserTickets(tickets);
    } catch (err) {
      console.error('Failed to load tickets in Chatbot view:', err);
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
      console.error('Chatbot view message error:', err);
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

      // Update message state
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

      // Add system confirmation
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
      loadTickets();
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
        text: `Conversation history cleared. How can I assist you now, ${currentUser?.name || 'colleague'}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Check my open tickets', 'Reset password', 'Browse FAQs'],
      },
    ]);
  };

  const filteredTickets = userTickets.filter((t) => {
    if (!ticketSearchQuery) return true;
    const q = ticketSearchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      (t.department && t.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0a1c36] to-[#0284c7] flex items-center justify-center text-white shadow-xs shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Capaciti AI Copilot & Virtual Assistant
              </h1>
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversational IT helpdesk, live SLA status lookup, and automated ticket classification.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleClearHistory}
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
          {onOpenNewTicket && (
            <button
              type="button"
              onClick={onOpenNewTicket}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Manual Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Chat Workspace + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chat Stream (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Stream Header */}
          <div className="p-3.5 px-4 bg-[#0a1c36] text-white flex items-center justify-between border-b border-[#142e54] select-none">
            <div className="flex items-center space-x-2.5">
              <CapacitiLogoIcon className="w-6 h-6" rounded="rounded-md" />
              <div>
                <div className="text-xs font-bold leading-none">Interactive Copilot Stream</div>
                <div className="text-[10px] text-sky-200 font-medium leading-none mt-1">
                  Active Session • Connected to Capaciti Hub DB
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] text-emerald-300 font-semibold">Ready</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
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
                {/* System Message */}
                {msg.sender === 'system' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs max-w-[90%] shadow-2xs my-1">
                    <div className="font-semibold">{msg.text}</div>
                    <div className="text-[10px] text-emerald-600 mt-1">{msg.timestamp}</div>
                  </div>
                )}

                {/* Regular Message Bubble */}
                {msg.sender !== 'system' && (
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-xs relative group shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#0284c7] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Assistant Name Label */}
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between mb-2 text-slate-400">
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-sky-700">
                          <Bot className="w-4 h-4" />
                          <span>Capaciti Copilot</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                      {msg.text}
                    </div>

                    {/* Troubleshooting Box */}
                    {msg.troubleshootingTips && msg.troubleshootingTips.length > 0 && (
                      <div className="mt-3 p-3 bg-sky-50/80 border border-sky-100 rounded-xl text-slate-700">
                        <div className="flex items-center space-x-1.5 font-bold text-sky-900 mb-1.5 text-xs">
                          <Wrench className="w-3.5 h-3.5 text-sky-600" />
                          <span>Recommended Action Steps:</span>
                        </div>
                        <ul className="space-y-1 list-disc list-inside text-xs text-slate-600">
                          {msg.troubleshootingTips.map((tip, idx) => (
                            <li key={idx} className="leading-relaxed">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Matched Tickets Card */}
                    {msg.matchedTickets && msg.matchedTickets.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.matchedTickets.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-900 truncate">#{t.id} - {t.title}</div>
                              <div className="text-slate-500 text-[11px]">
                                {t.department || 'IT'} • Logged {new Date(t.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center space-x-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.priority === 'Urgent'
                                    ? 'bg-rose-100 text-rose-700'
                                    : t.priority === 'High'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {t.priority}
                              </span>
                              <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Draft Ticket Card */}
                    {msg.draftTicket && (
                      <div className="mt-3.5 p-3.5 bg-gradient-to-br from-slate-50 to-sky-50/50 border border-sky-200 rounded-xl text-slate-800 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                            <Ticket className="w-4 h-4 text-sky-600" />
                            <span>AI-Drafted Service Ticket</span>
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

                        <div className="text-xs font-bold text-slate-900 mb-1">
                          {msg.draftTicket.title}
                        </div>
                        <div className="text-xs text-slate-600 mb-2 leading-relaxed">
                          {msg.draftTicket.description}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 mb-2.5">
                          <span>Department: <strong>{msg.draftTicket.department}</strong></span>
                          <span>Category: <strong>{msg.draftTicket.category}</strong></span>
                        </div>

                        {msg.ticketCreatedId ? (
                          <div className="w-full py-2 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Logged into Queue as Ticket #{msg.ticketCreatedId}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isSubmittingTicket === msg.id}
                            onClick={() => msg.draftTicket && handleCreateTicketFromDraft(msg.id, msg.draftTicket)}
                            className="w-full py-2.5 px-3 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingTicket === msg.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Logging Ticket into Queue...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                <span>1-Click Log Ticket to Queue</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] mt-2 font-medium ${
                        msg.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                  <div className="flex flex-wrap gap-2 mt-2.5 max-w-[95%]">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (action === 'View ticket in queue' && onNavigateTab) {
                            onNavigateTab('requests');
                          } else if (action === 'Submit ticket manually' && onOpenNewTicket) {
                            onOpenNewTicket();
                          } else {
                            handleSendMessage(action);
                          }
                        }}
                        className="text-xs bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-full font-medium shadow-2xs hover:border-sky-400 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>{action}</span>
                        <ChevronRight className="w-3 h-3 text-sky-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white p-3 rounded-2xl rounded-bl-xs border border-slate-200 w-fit shadow-2xs">
                <Bot className="w-4 h-4 text-sky-600 animate-bounce" />
                <span className="text-xs font-medium text-slate-600">Capaciti Copilot is reasoning...</span>
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse delay-200" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3.5 bg-white border-t border-slate-200">
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
                id="capaciti-chatbot-view-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Capaciti Copilot (e.g. 'What is the status of my ticket?' or 'Reset my password')..."
                disabled={isTyping}
                className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                id="capaciti-chatbot-view-send-btn"
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-3 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-2xs font-semibold text-xs flex items-center space-x-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Panel: Quick Shortcuts & Live Tickets (1 Column) */}
        <div className="space-y-6">
          
          {/* Quick Prompts Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Recommended Inquiries</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  title: '🔑 Password & MFA Sync',
                  desc: 'SSO credentials, lockout recovery',
                  prompt: 'I am locked out of my account and need to reset my password.',
                },
                {
                  title: '💻 Software License Access',
                  desc: 'Figma, GitHub, AWS, IDEs',
                  prompt: 'I need to request a software license for my development cohort.',
                },
                {
                  title: '🎧 Bluetooth Audio Setup',
                  desc: 'Headphone pairing & output',
                  prompt: 'My bluetooth headphones are not working to listen to music.',
                },
                {
                  title: '🚨 Urgent Outage Alert',
                  desc: 'Critical security or server blocker',
                  prompt: 'I need to report an urgent cybersecurity incident / server down.',
                },
                {
                  title: '📋 Check My Ticket Progress',
                  desc: 'Live SLA countdown & technician status',
                  prompt: 'What is the status of my open tickets?',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 hover:border-sky-400 hover:bg-sky-50/40 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User's Recent Tickets Quick View */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Ticket className="w-4 h-4 text-sky-600" />
                <span>Your Active Tickets</span>
              </div>
              <button
                type="button"
                onClick={loadTickets}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Search filter for tickets */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter tickets..."
                value={ticketSearchQuery}
                onChange={(e) => setTicketSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-700"
              />
            </div>

            {isLoadingTickets ? (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600 mb-1.5" />
                <span>Loading queue records...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No tickets matching criteria.
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {filteredTickets.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSendMessage(`What is the current status and update for ticket #${t.id}?`)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-sky-700">#{t.id}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          t.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'High'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {t.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{t.department || 'IT'}</span>
                      <span className="text-sky-600 font-medium">Click to inquire →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
