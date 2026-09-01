import { 
  User, 
  RequestItem, 
  Category, 
  DashboardStats, 
  AuditLog, 
  EmailNotification, 
  Priority, 
  RequestStatus,
  AIResponseTone,
  AIGeneratedResponse,
  ExecutiveReport,
  BusinessInsight,
  WorkflowRule,
  WorkflowExecutionLog,
  ApprovalRequest,
  AIGovernanceMetrics,
  HITLOverrideRecord,
  DSARRecord,
  CompliancePolicy,
  DepartmentLeadership,
  ChatbotResponsePayload
} from '../types/index.js';

const TOKEN_KEY = 'capaciti_auth_token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new Error('Unable to connect to the server. Please check your network connection.');
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (parseErr) {
      data = null;
    }
  } else {
    // Non-JSON response (e.g. HTML 404, 502 Bad Gateway, or proxy error)
    const rawText = await res.text();
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Endpoint not found (${endpoint}). Please verify the service is running.`);
      } else if (res.status >= 500) {
        throw new Error(`Server temporarily unavailable (${res.status}). Please try again in a few moments.`);
      }
      throw new Error(`Request failed with status ${res.status}`);
    }
    return rawText;
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  // Auth
  register: async (name: string, email: string, password: string, role: string = 'CUSTOMER') => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (data.token) setStoredToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setStoredToken(data.token);
    return data;
  },

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      removeStoredToken();
    }
  },

  getCurrentUser: async () => {
    if (!getStoredToken()) return null;
    try {
      const data = await apiFetch('/api/auth/me');
      return data.user as User;
    } catch (e) {
      removeStoredToken();
      return null;
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const data = await apiFetch('/api/categories');
    return data.categories;
  },

  createCategory: async (name: string, description: string): Promise<Category> => {
    const data = await apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    return data.category;
  },

  // Requests
  getRequests: async (filters: { category?: string; priority?: string; status?: string; department?: string; search?: string } = {}): Promise<RequestItem[]> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.status) params.append('status', filters.status);
    if (filters.department) params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);

    const data = await apiFetch(`/api/requests?${params.toString()}`);
    return data.requests;
  },

  createRequest: async (reqData: {
    title: string;
    description: string;
    requestType: string;
    priority: Priority;
    department?: string;
    attachments?: any[];
  }): Promise<RequestItem> => {
    const data = await apiFetch('/api/requests', {
      method: 'POST',
      body: JSON.stringify(reqData),
    });
    return data.request;
  },

  getRequestById: async (id: string): Promise<RequestItem> => {
    const data = await apiFetch(`/api/requests/${id}`);
    return data.request;
  },

  updateRequest: async (
    id: string,
    updates: {
      status?: RequestStatus;
      priority?: Priority;
      department?: string;
      assignedToUserId?: string;
      assignedToName?: string;
      resolutionNotes?: string;
      internalNote?: string;
    }
  ): Promise<RequestItem> => {
    const data = await apiFetch(`/api/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.request;
  },

  classifyRequest: async (id: string): Promise<RequestItem> => {
    const data = await apiFetch(`/api/requests/${id}/classify`, {
      method: 'POST',
    });
    return data.request;
  },

  overrideAIClassification: async (id: string, category: string, priority: Priority, notes: string): Promise<RequestItem> => {
    const data = await apiFetch(`/api/requests/${id}/override-ai`, {
      method: 'POST',
      body: JSON.stringify({ category, priority, notes }),
    });
    return data.request;
  },

  // Week 2: AI Response Generation
  generateAIResponse: async (
    id: string, 
    tone: AIResponseTone, 
    customInstructions?: string
  ): Promise<{ response: AIGeneratedResponse; request: RequestItem }> => {
    const data = await apiFetch(`/api/requests/${id}/generate-response`, {
      method: 'POST',
      body: JSON.stringify({ tone, customInstructions }),
    });
    return data;
  },

  dispatchResponse: async (
    id: string,
    responseText: string,
    applyAsResolution: boolean = false,
    internalNote?: string
  ): Promise<{ success: boolean; request: RequestItem }> => {
    const data = await apiFetch(`/api/requests/${id}/dispatch-response`, {
      method: 'POST',
      body: JSON.stringify({ responseText, applyAsResolution, internalNote }),
    });
    return data;
  },

  // Dashboard & Business Analytics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const data = await apiFetch('/api/analytics');
    return data.stats;
  },

  // Week 2: Executive Reporting Module
  getReports: async (): Promise<ExecutiveReport[]> => {
    const data = await apiFetch('/api/reports');
    return data.reports;
  },

  getReportById: async (id: string): Promise<ExecutiveReport> => {
    const data = await apiFetch(`/api/reports/${id}`);
    return data.report;
  },

  generateExecutiveReport: async (timeRange: string = 'sprint_week_2'): Promise<ExecutiveReport> => {
    const data = await apiFetch('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ timeRange }),
    });
    return data.report;
  },

  // Admin & Staff
  getUsers: async (): Promise<User[]> => {
    const data = await apiFetch('/api/admin/users');
    return data.users;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const data = await apiFetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return data.user;
  },

  updateUserStatus: async (userId: string, status: 'Active' | 'Suspended'): Promise<User> => {
    const data = await apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data.user;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const data = await apiFetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const data = await apiFetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return data;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const data = await apiFetch('/api/admin/audit-logs');
    return data.logs;
  },

  getEmailLogs: async (): Promise<EmailNotification[]> => {
    const data = await apiFetch('/api/email-logs');
    return data.emails;
  },

  markEmailAsRead: async (id: string): Promise<EmailNotification> => {
    const data = await apiFetch(`/api/email-logs/${id}/read`, {
      method: 'PATCH',
    });
    return data.email;
  },

  markAllEmailsAsRead: async (): Promise<boolean> => {
    const data = await apiFetch('/api/email-logs/read-all', {
      method: 'POST',
    });
    return data.success;
  },

  // AI Support Assistant
  sendSupportAssistantChat: async (
    userMessage: string,
    chatHistory: { sender: 'user' | 'assistant'; text: string }[] = [],
    statusFlag?: string
  ) => {
    const data = await apiFetch('/api/ai/support-assistant', {
      method: 'POST',
      body: JSON.stringify({ userMessage, chatHistory, statusFlag }),
    });
    return data as {
      assistantMessage: string;
      troubleshootingTips: string[];
      draftTicket: {
        title: string;
        description: string;
        priority: Priority;
        impact: string;
        category: string;
        department: string;
      };
    };
  },

  // AI Copilot / Chatbot
  sendChatbotMessage: async (
    userMessage: string,
    chatHistory: { sender: 'user' | 'assistant'; text: string }[] = []
  ): Promise<ChatbotResponsePayload> => {
    const data = await apiFetch('/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({ userMessage, chatHistory }),
    });
    return data;
  },

  // ==========================================
  // SPRINT 2: WORKFLOW AUTOMATION API
  // ==========================================
  getWorkflowRules: async (): Promise<WorkflowRule[]> => {
    const data = await apiFetch('/api/workflows');
    return data.rules;
  },

  createWorkflowRule: async (rule: Partial<WorkflowRule>): Promise<WorkflowRule> => {
    const data = await apiFetch('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
    return data.rule;
  },

  updateWorkflowRule: async (id: string, updates: Partial<WorkflowRule>): Promise<WorkflowRule> => {
    const data = await apiFetch(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.rule;
  },

  toggleWorkflowRule: async (id: string): Promise<WorkflowRule> => {
    const data = await apiFetch(`/api/workflows/${id}/toggle`, {
      method: 'PATCH',
    });
    return data.rule;
  },

  deleteWorkflowRule: async (id: string): Promise<{ success: boolean; message: string }> => {
    const data = await apiFetch(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
    return data;
  },

  getWorkflowLogs: async (): Promise<WorkflowExecutionLog[]> => {
    const data = await apiFetch('/api/workflows/logs');
    return data.logs;
  },

  testRunWorkflow: async (ticketId: string, trigger: string = 'on_ticket_created'): Promise<{ result: { executedRules: number; executedLogs: WorkflowExecutionLog[] }; ticket: RequestItem }> => {
    const data = await apiFetch('/api/workflows/test-run', {
      method: 'POST',
      body: JSON.stringify({ ticketId, trigger }),
    });
    return data;
  },

  // ==========================================
  // SPRINT 2: APPROVAL PROCESSES API
  // ==========================================
  getApprovals: async (filters: { status?: string; role?: string } = {}): Promise<ApprovalRequest[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);
    const data = await apiFetch(`/api/approvals?${params.toString()}`);
    return data.approvals;
  },

  getApprovalById: async (id: string): Promise<ApprovalRequest> => {
    const data = await apiFetch(`/api/approvals/${id}`);
    return data.approval;
  },

  createApproval: async (approvalData: {
    requestId: string;
    ticketTitle: string;
    approvalType: string;
    estimatedCost?: number;
    justification: string;
    riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
    requiredRole?: 'SUPERVISOR' | 'ADMIN';
  }): Promise<ApprovalRequest> => {
    const data = await apiFetch('/api/approvals', {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
    return data.approval;
  },

  decideApproval: async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<ApprovalRequest> => {
    const data = await apiFetch(`/api/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
    return data.approval;
  },

  // ==========================================
  // SPRINT 2: AI GOVERNANCE & RESPONSIBLE AI API
  // ==========================================
  getAIGovernanceMetrics: async (): Promise<AIGovernanceMetrics> => {
    const data = await apiFetch('/api/ai-governance');
    return data;
  },

  logHITLOverride: async (data: {
    ticketId: string;
    ticketTitle: string;
    originalCategory: string;
    correctedCategory: string;
    originalPriority?: string;
    correctedPriority?: string;
    reason: string;
  }): Promise<HITLOverrideRecord> => {
    const res = await apiFetch('/api/ai-governance/override', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.record;
  },

  maskPII: async (text: string): Promise<{ maskedText: string; piiDetected: string[] }> => {
    const data = await apiFetch('/api/ai-governance/mask-pii', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return data;
  },

  // ==========================================
  // SPRINT 2: COMPLIANCE & DSAR SUITE API
  // ==========================================
  getDSARRequests: async (): Promise<DSARRecord[]> => {
    const data = await apiFetch('/api/compliance/dsar');
    return data.dsarRequests;
  },

  createDSARRequest: async (dsarData: {
    requestType: 'EXPORT_DATA' | 'ERASURE_REQUEST' | 'RESTRICT_PROCESSING';
    userEmail?: string;
    userName?: string;
  }): Promise<DSARRecord> => {
    const data = await apiFetch('/api/compliance/dsar', {
      method: 'POST',
      body: JSON.stringify(dsarData),
    });
    return data.dsar;
  },

  completeDSARRequest: async (id: string): Promise<DSARRecord> => {
    const data = await apiFetch(`/api/compliance/dsar/${id}/complete`, {
      method: 'POST',
    });
    return data.dsar;
  },

  getCompliancePolicies: async (): Promise<CompliancePolicy[]> => {
    const data = await apiFetch('/api/compliance/policies');
    return data.policies;
  },

  enforceCompliancePolicy: async (id: string): Promise<{ policy: CompliancePolicy; message: string }> => {
    const data = await apiFetch(`/api/compliance/policies/${id}/enforce`, {
      method: 'POST',
    });
    return data;
  },

  // Department Leadership
  getDepartmentLeadership: async (): Promise<DepartmentLeadership[]> => {
    const data = await apiFetch('/api/departments/leadership');
    return data.leadership;
  },
};
