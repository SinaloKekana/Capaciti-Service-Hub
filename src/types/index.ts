export type UserRole = 
  | 'CUSTOMER' 
  | 'EMPLOYEE' 
  | 'TECHNICIAN' 
  | 'SUPERVISOR' 
  | 'HR_MANAGER' 
  | 'FINANCE_MANAGER' 
  | 'IT_MANAGER' 
  | 'FACILITIES_MANAGER' 
  | 'ADMIN';

export interface DepartmentLeadership {
  department: string;
  leaderTitle: string;
  alternateTitles: string[];
  responsibilities: string[];
  currentLeaderName: string;
  currentLeaderEmail: string;
  approvalScope: string[];
  accentColor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle?: string;
  department?: string;
  departmentScope?: string[];
  status?: 'Active' | 'Suspended';
  emailVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequestType = 
  | 'Question'
  | 'Support Request'
  | 'Complaint'
  | 'Incident'
  | 'Service Request'
  | 'General Request';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Department = 
  | 'IT'
  | 'Finance'
  | 'Human Resources'
  | 'Sales'
  | 'Customer Support'
  | 'Operations'
  | 'Procurement'
  | 'General';

export type RequestStatus = 
  | 'Submitted'
  | 'AI Classified'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Account Blocked';

export type SLAStatus = 'Within SLA' | 'At Risk' | 'Breached';

export type AIResponseTone = 
  | 'professional_empathetic' 
  | 'concise_technical' 
  | 'step_by_step_troubleshooting' 
  | 'escalation_notice' 
  | 'executive_summary';

export interface AIGeneratedResponse {
  id: string;
  requestId: string;
  tone: AIResponseTone;
  responseDraft: string;
  responseText?: string;
  suggestedActionSteps: string[];
  keyPolicyReferences?: string[];
  confidenceScore: number;
  model: string;
  createdAt: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface AIClassification {
  id: string;
  requestId: string;
  category: string;
  subcategory?: string;
  summary: string;
  recommendedAction: string;
  aiPriority: Priority;
  confidenceScore: number;
  model: string;
  isOverridden?: boolean;
  overrideNotes?: string;
  overriddenBy?: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface RequestItem {
  id: string; // Ticket number, e.g. REQ-2026-0812-4921
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: UserRole;
  title: string;
  description: string;
  requestType: RequestType;
  priority: Priority;
  department?: Department;
  status: RequestStatus;
  slaTargetHours?: number;
  slaStatus?: SLAStatus;
  slaRemainingMinutes?: number;
  resolvedAt?: string;
  resolutionDurationHours?: number;
  attachments?: Attachment[];
  aiClassification?: AIClassification;
  aiGeneratedResponses?: AIGeneratedResponse[];
  assignedToUserId?: string;
  assignedToName?: string;
  assignedTechnicianName?: string;
  category?: string;
  slaRemainingHours?: number;
  lastDraftResponse?: string;
  resolutionNotes?: string;
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInsight {
  id: string;
  type: 'bottleneck' | 'sla_warning' | 'workload_rebalance' | 'root_cause' | 'opportunity';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  department?: string;
  recommendedAction: string;
  confidence: number;
  detectedAt: string;
}

export interface ExecutiveReport {
  id: string;
  title: string;
  timeRange: 'sprint_week_2' | 'last_7_days' | 'last_30_days' | 'all_time' | string;
  executiveSummary: string;
  keyAccomplishments: string[];
  operationalBottlenecks?: string[];
  bottlenecksAndRisks?: string[];
  slaRiskAnalysis?: string;
  slaHealthAnalysis?: string;
  departmentalWorkload?: { 
    department: string; 
    volume: number; 
    avgResolutionHours: number; 
    slaRate: number;
    riskLevel: string;
  }[];
  categoryBreakdown?: { 
    category: string; 
    count: number; 
    percentage: number; 
    resolvedCount: number;
    color?: string;
  }[];
  priorityBreakdown?: { 
    priority: Priority; 
    count: number; 
    percentage: number; 
    avgHours: number;
  }[];
  statusBreakdown?: { 
    status: RequestStatus; 
    count: number; 
  }[];
  technicianBreakdown?: { 
    name: string; 
    assigned: number; 
    resolved: number; 
    slaRate: number; 
    avgHours: string;
  }[];
  dailyTrends?: { 
    date: string; 
    incoming: number; 
    resolved: number; 
    breaches: number;
  }[];
  keyIncidents?: { 
    id: string; 
    title: string; 
    priority: Priority; 
    department: string; 
    status: RequestStatus; 
    owner: string; 
    duration: string; 
    resolutionSummary: string;
  }[];
  strategicRecommendations: string[];
  hoursSavedByAI?: number;
  metricsSnapshot?: {
    totalRequests: number;
    resolutionRate: number;
    slaComplianceRate: number;
    avgResolutionHours: number;
    aiClassificationAccuracy: number;
    urgentIncidentCount: number;
  };
  kpiMetrics?: {
    totalVolume: number;
    resolvedVolume: number;
    backlogVolume: number;
    slaComplianceRate: number;
    meanTimeToResolutionHours: number;
    firstContactResolutionRate: number;
    aiAutomationAccuracy: number;
  };
  generatedAt?: string;
  createdAt?: string;
  generatedBy?: string;
  authorName?: string;
}

export interface DashboardStats {
  totalRequests: number;
  openRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  aiClassifiedRequests: number;
  avgResolutionHours: number;
  avgFirstResponseFormatted?: string;
  slaBreachedCount?: number;
  assignedToMeCount?: number;
  unassignedQueueCount?: number;
  slaComplianceRate: number;
  firstContactResolutionRate: number;
  categoryBreakdown: { category: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  departmentBreakdown: { department: string; count: number }[];
  dailyTrends: { date: string; incoming: number; resolved: number; breaches: number }[];
  departmentPerformance: { department: string; count: number; resolvedCount: number; avgHours: number; slaComplianceRate: number }[];
  recentInsights: BusinessInsight[];
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface EmailNotification {
  id: string;
  ticketId?: string;
  requestId?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  type?: 'CONFIRMATION' | 'STATUS_UPDATE' | 'RESOLVED_NOTIFICATION' | 'AI_RESPONSE_DISPATCH' | 'APPROVAL_REQUEST' | 'APPROVAL_DECISION' | 'WORKFLOW_ALERT' | 'COMPLIANCE_ALERT' | string;
  sentAt: string;
  deliveryStatus?: 'delivered' | 'pending' | 'failed' | string;
  isRead?: boolean;
}

export interface WorkflowCondition {
  field: 'department' | 'priority' | 'requestType' | 'category' | 'title' | 'description' | 'slaRemainingHours' | 'amount';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'in';
  value: string | number | string[];
}

export interface WorkflowAction {
  type: 'auto_assign' | 'set_priority' | 'trigger_approval' | 'send_email_alert' | 'apply_tag' | 'auto_resolve_with_template';
  targetValue: string;
  details?: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: 'on_ticket_created' | 'on_priority_escalated' | 'on_sla_warning' | 'on_approval_required' | 'on_status_change';
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  createdBy?: string;
}

export interface WorkflowExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  ticketId: string;
  ticketTitle: string;
  executedActions: string[];
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  executedAt: string;
}

export type ApprovalType = 
  | 'EQUIPMENT_REQUISITION' 
  | 'SECURITY_ACCESS' 
  | 'BUDGET_EXPENSE' 
  | 'POLICY_EXCEPTION' 
  | 'ACCOUNT_UNBLOCK';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string; // e.g. APR-2026-0824-001
  requestId: string; // Linked Ticket ID
  ticketTitle: string;
  approvalType: ApprovalType;
  requestorId: string;
  requestorName: string;
  requestorEmail: string;
  department: string;
  estimatedCost?: number; // In ZAR (R)
  justification: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: ApprovalStatus;
  requiredRole: 'SUPERVISOR' | 'ADMIN';
  decidedByUserId?: string;
  decidedByName?: string;
  decisionNotes?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HITLOverrideRecord {
  id: string;
  ticketId: string;
  ticketTitle: string;
  originalCategory: string;
  correctedCategory: string;
  originalPriority: string;
  correctedPriority: string;
  overriddenBy: string;
  reason: string;
  timestamp: string;
}

export interface PIIAuditRecord {
  id: string;
  ticketId: string;
  piiTypesDetected: string[];
  originalSampleMasked: string;
  actionTaken: 'Auto-Redacted' | 'Masked on Display' | 'Supervisor Cleared';
  timestamp: string;
}

export interface ResponsibleAIPrinciple {
  id: string;
  principle?: 'Fairness & Bias Prevention' | 'Accountability & Human-in-the-loop' | 'Transparency & Explainability' | 'Privacy & POPIA Compliance' | 'Safety & Robustness' | string;
  title?: string;
  description?: string;
  status?: string;
  governanceMechanism?: string;
  standard?: 'POPIA' | 'GDPR' | 'Responsible AI Framework' | 'ISO 27001' | string;
  complianceStatus?: 'Fully Compliant' | 'Audited' | 'Under Continuous Monitoring' | string;
  complianceScore: number; // e.g. 99%
  evidence?: string;
  lastAudited?: string;
}

export interface AIGovernanceOverview {
  overallConfidenceScore: number;
  totalClassificationsCount: number;
  humanOverrideCount: number;
  humanOverrideRate: number;
  piiRedactedIncidentsCount: number;
  fairnessIndex: number;
  modelDriftRate: number;
  hitlOverrides: HITLOverrideRecord[];
  piiAudits: PIIAuditRecord[];
  principles: ResponsibleAIPrinciple[];
}

export type AIGovernanceMetrics = AIGovernanceOverview;

export interface DSARRecord {
  id: string;
  userEmail: string;
  userName: string;
  requestType: 'EXPORT_DATA' | 'DELETE_DATA' | 'RESTRICT_PROCESSING';
  status: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  submittedAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  category: 'POPIA' | 'GDPR' | 'Data Retention' | 'Access Control';
  retentionPeriod: string;
  enforcementStatus: 'Active' | 'Enforced' | 'Scheduled';
  description: string;
  recordsCovered: number;
  lastEnforced: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ChatbotMessage {
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
}

export interface ChatbotResponsePayload {
  message: string;
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
}


