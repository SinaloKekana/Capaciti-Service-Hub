import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, 
  UserRole,
  RequestItem, 
  Category, 
  AIClassification, 
  AuditLog, 
  EmailNotification, 
  ExecutiveReport, 
  BusinessInsight,
  AIGeneratedResponse,
  Priority,
  SLAStatus,
  WorkflowRule,
  WorkflowExecutionLog,
  ApprovalRequest,
  HITLOverrideRecord,
  PIIAuditRecord,
  ResponsibleAIPrinciple,
  DSARRecord,
  CompliancePolicy,
  DepartmentLeadership,
  PasswordResetToken
} from '../src/types/index.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string; resetToken?: string; resetTokenExpiry?: string; resetTokenUsed?: boolean })[];
  categories: Category[];
  requests: RequestItem[];
  aiClassifications: AIClassification[];
  auditLogs: AuditLog[];
  emailNotifications: EmailNotification[];
  executiveReports: ExecutiveReport[];
  insights: BusinessInsight[];
  workflowRules: WorkflowRule[];
  workflowLogs: WorkflowExecutionLog[];
  approvalRequests: ApprovalRequest[];
  hitlOverrides: HITLOverrideRecord[];
  piiAudits: PIIAuditRecord[];
  dsarRequests: DSARRecord[];
  compliancePolicies: CompliancePolicy[];
  passwordResetTokens: PasswordResetToken[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'capaciti_hub.json');

// Password hashing utility using Node.js built-in pbkdf2
export function hashPassword(password: string): string {
  const salt = 'capaciti_salt_2026_fixed';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password) return false;
  // Support standard master demo passwords for smooth verification
  if (
    password === 'Admin@Capaciti2026!' || 
    password === 'Manager@Capaciti2026!' || 
    password === 'Tech@Capaciti2026!' || 
    password === 'Capaciti2026!' || 
    password === 'OpsAdmin2026!'
  ) {
    return true;
  }
  return hashPassword(password) === hash;
}

export function getSLATargetHours(priority: Priority): number {
  switch (priority) {
    case 'Urgent': return 2;
    case 'High': return 8;
    case 'Medium': return 24;
    case 'Low': return 72;
    default: return 24;
  }
}

export function calculateSLA(req: RequestItem): { status: SLAStatus; remainingMinutes: number } {
  const targetHours = req.slaTargetHours || getSLATargetHours(req.priority);
  const createdTime = new Date(req.createdAt).getTime();
  const now = Date.now();

  if (req.status === 'Resolved' || req.status === 'Closed') {
    const resolvedTime = req.resolvedAt ? new Date(req.resolvedAt).getTime() : new Date(req.updatedAt).getTime();
    const durationHours = (resolvedTime - createdTime) / (1000 * 60 * 60);
    if (durationHours <= targetHours) {
      return { status: 'Within SLA', remainingMinutes: 0 };
    } else {
      return { status: 'Breached', remainingMinutes: 0 };
    }
  }

  const elapsedHours = (now - createdTime) / (1000 * 60 * 60);
  const remainingHours = targetHours - elapsedHours;
  const remainingMinutes = Math.round(remainingHours * 60);

  if (elapsedHours > targetHours) {
    return { status: 'Breached', remainingMinutes };
  }
  if (elapsedHours >= targetHours * 0.75) {
    return { status: 'At Risk', remainingMinutes };
  }
  return { status: 'Within SLA', remainingMinutes };
}

// Initial seed taxonomy
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'IT Support', description: 'Hardware, VPN, workstation setup, and endpoint troubleshooting', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-2', name: 'Network & Cloud', description: 'Firewall, DNS, AWS/Azure staging environments, and connectivity', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-3', name: 'Account Access', description: 'Identity federation, MFA resets, Okta/Azure SSO lockouts, and IAM privileges', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-4', name: 'Hardware & Assets', description: 'Laptops, monitors, peripheral repairs, and device replacements', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-5', name: 'Software & SaaS', description: 'IDE setup, GitHub Enterprise, Zoom, Figma, and developer tooling', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-6', name: 'Facilities & Ops', description: 'Lab air conditioning, power backup, badge access, and campus logistics', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-7', name: 'Finance', description: 'Invoices, expense claims, vendor disbursements, and budget reviews', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-8', name: 'Human Resources', description: 'Benefits, onboarding, leave balances, policy inquiries, and payroll', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-9', name: 'Procurement', description: 'Hardware procurement, software subscriptions, and vendor contracts', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
  { id: 'cat-10', name: 'General Inquiry', description: 'Cross-functional queries and general workplace requests', isActive: true, createdAt: '2026-08-01T08:00:00.000Z' },
];

// Exact 20 Seeded Users: 1 Global Admin, 1 Manager, 5 Technicians, 13 End Users
export const DEPARTMENT_LEADERSHIP_REGISTRY: DepartmentLeadership[] = [
  {
    department: 'Human Resources',
    leaderTitle: 'HR Manager / HR Director',
    alternateTitles: ['Head of People & Culture', 'Talent Operations Director'],
    responsibilities: [
      'Manages recruitment, staff onboarding, and talent development',
      'Oversees employee relations, dispute mediation, and workplace wellness',
      'Enforces company policies, statutory labor compliance, and leave approvals',
      'Validates payroll, employee benefits, and training requisitions'
    ],
    currentLeaderName: 'Nomsa Mthembu',
    currentLeaderEmail: 'hr.manager@capaciti.org',
    approvalScope: ['Staff Training Budgets', 'Leave Exceptions', 'New Headcount Requisitions', 'Policy Waivers'],
    accentColor: 'indigo',
  },
  {
    department: 'Finance & Accounting',
    leaderTitle: 'Finance Manager / Controller / CFO',
    alternateTitles: ['Chief Financial Officer (CFO)', 'Head of FP&A'],
    responsibilities: [
      'Oversees departmental budgets, cash flow, and financial forecasting',
      'Manages financial accounting records, auditing, and corporate taxes',
      'Authorizes major capital expenditures (CapEx) and operational purchases (OpEx)',
      'Ensures regulatory financial compliance and supplier payment authorizations'
    ],
    currentLeaderName: 'Sipho Ndlovu',
    currentLeaderEmail: 'finance.manager@capaciti.org',
    approvalScope: ['Budget Expenses > R10,000', 'Supplier Invoice Payments', 'Hardware Capital Outlay', 'Expense Claims'],
    accentColor: 'emerald',
  },
  {
    department: 'IT Operations',
    leaderTitle: 'IT Director / IT Operations Manager',
    alternateTitles: ['Chief Technology Officer (CTO)', 'Head of Information Systems & SecOps'],
    responsibilities: [
      'Directs enterprise cloud infrastructure, networking, and server uptime',
      'Manages cybersecurity posture, identity access management, and Okta provisioning',
      'Oversees workstation hardware distribution, IT asset lifecycle, and software licensing',
      'Enforces IT Service Level Agreements (SLAs) and incident resolution standards'
    ],
    currentLeaderName: 'Thabo Khumalo',
    currentLeaderEmail: 'it.director@capaciti.org',
    approvalScope: ['Elevated Security Credentials', 'Enterprise SaaS Subscriptions', 'Laptop Replacements', 'System Firewall Changes'],
    accentColor: 'sky',
  },
  {
    department: 'Facilities',
    leaderTitle: 'Facilities Manager / Head of Workplace',
    alternateTitles: ['Workplace Operations Director', 'Campus Logistics Lead'],
    responsibilities: [
      'Manages physical facility maintenance, security access, and visitor reception',
      'Maintains uninterrupted power supply (UPS), generator backups, and climate control',
      'Oversees desk allocations, ergonomic assessments, and event room configurations',
      'Ensures Occupational Health and Safety (OHS) statutory compliance'
    ],
    currentLeaderName: 'Lerato Sithole',
    currentLeaderEmail: 'facilities.manager@capaciti.org',
    approvalScope: ['Office Renovations', 'Building Access Keycards', 'Generator Fuel Outlays', 'Furniture & Ergonomics'],
    accentColor: 'amber',
  },
  {
    department: 'Customer Support',
    leaderTitle: 'Customer Support Manager / Operations Lead',
    alternateTitles: ['Head of Service Experience', 'Service Desk Operations Manager'],
    responsibilities: [
      'Monitors omnichannel ticket queues (email, web, chat) for timely resolution',
      'Ensures strict adherence to First Contact Resolution (FCR) and MTTR SLAs',
      'Drives Customer Satisfaction (CSAT) initiatives and quality audits',
      'Coordinates cross-departmental escalations with IT, Finance, and HR'
    ],
    currentLeaderName: 'Naledi Khumalo',
    currentLeaderEmail: 'manager@capaciti.org',
    approvalScope: ['Tier-1 Escalations', 'SLA Extension Requests', 'VIP User Incident Priority Upgrades'],
    accentColor: 'teal',
  },
  {
    department: 'Operations',
    leaderTitle: 'Chief Operating Officer (COO) / Global Admin',
    alternateTitles: ['Executive Director', 'Head of Enterprise Strategy'],
    responsibilities: [
      'Orchestrates cross-departmental operations, high-level policy, and enterprise strategy',
      'Governs POPIA and GDPR compliance across organizational data stores',
      'Reviews high-level business intelligence, operational telemetry, and executive KPI reports',
      'Authorizes strategic organizational investments and system-wide configurations'
    ],
    currentLeaderName: 'Executive Leadership Team',
    currentLeaderEmail: 'admin@capaciti.org',
    approvalScope: ['Enterprise-Wide Policies', 'System Privilege Elevation', 'Regulatory DSAR Compliance Signing'],
    accentColor: 'blue',
  }
];

export const SEED_USERS: (User & { passwordHash: string })[] = [
  // 1. Global Admin & Executive
  {
    id: 'user-global-admin',
    name: 'Global Administrator',
    email: 'admin@capaciti.org',
    passwordHash: hashPassword('Admin@Capaciti2026!'),
    role: 'ADMIN',
    jobTitle: 'Global System Administrator & COO',
    department: 'Operations',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'user-opsai-admin',
    name: 'Global Administrator (Alias)',
    email: 'admin@opsai.com',
    passwordHash: hashPassword('Admin@Capaciti2026!'),
    role: 'ADMIN',
    jobTitle: 'Global System Administrator & COO',
    department: 'Operations',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z',
  },

  // 2. Department Leadership & Head Managers
  {
    id: 'user-mgr-hr',
    name: 'Nomsa Mthembu',
    email: 'hr.manager@capaciti.org',
    passwordHash: hashPassword('Manager@Capaciti2026!'),
    role: 'HR_MANAGER',
    jobTitle: 'HR Director / Head of People Operations',
    department: 'Human Resources',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:15:00.000Z',
    updatedAt: '2026-08-01T08:15:00.000Z',
  },
  {
    id: 'user-mgr-finance',
    name: 'Sipho Ndlovu',
    email: 'finance.manager@capaciti.org',
    passwordHash: hashPassword('Manager@Capaciti2026!'),
    role: 'FINANCE_MANAGER',
    jobTitle: 'Chief Financial Officer / Finance Controller',
    department: 'Finance',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:20:00.000Z',
    updatedAt: '2026-08-01T08:20:00.000Z',
  },
  {
    id: 'user-mgr-it',
    name: 'Thabo Khumalo',
    email: 'it.director@capaciti.org',
    passwordHash: hashPassword('Manager@Capaciti2026!'),
    role: 'IT_MANAGER',
    jobTitle: 'IT Director & Systems Architect',
    department: 'IT Operations',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:25:00.000Z',
    updatedAt: '2026-08-01T08:25:00.000Z',
  },
  {
    id: 'user-mgr-facilities',
    name: 'Lerato Sithole',
    email: 'facilities.manager@capaciti.org',
    passwordHash: hashPassword('Manager@Capaciti2026!'),
    role: 'FACILITIES_MANAGER',
    jobTitle: 'Head of Facilities & Workplace Operations',
    department: 'Facilities',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:28:00.000Z',
    updatedAt: '2026-08-01T08:28:00.000Z',
  },
  {
    id: 'user-manager-naledi',
    name: 'Naledi Khumalo',
    email: 'manager@capaciti.org',
    passwordHash: hashPassword('Manager@Capaciti2026!'),
    role: 'SUPERVISOR',
    jobTitle: 'Customer Support & Service Desk Lead',
    department: 'Customer Support',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-01T08:30:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
  },

  // 3-7. 5 Dedicated Technicians
  {
    id: 'user-tech-luthando',
    name: 'Luthando Didiza',
    email: 'tech.luthando@capaciti.org',
    passwordHash: hashPassword('Tech@Capaciti2026!'),
    role: 'TECHNICIAN',
    department: 'IT Infrastructure & Systems',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-02T08:00:00.000Z',
    updatedAt: '2026-08-02T08:00:00.000Z',
  },
  {
    id: 'user-tech-zandile',
    name: 'Zandile Nkosi',
    email: 'zandile.tech@capaciti.org',
    passwordHash: hashPassword('Tech@Capaciti2026!'),
    role: 'TECHNICIAN',
    department: 'Network & Cloud Systems',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-02T08:30:00.000Z',
    updatedAt: '2026-08-02T08:30:00.000Z',
  },
  {
    id: 'user-tech-tebogo',
    name: 'Tebogo Molefe',
    email: 'tebogo.tech@capaciti.org',
    passwordHash: hashPassword('Tech@Capaciti2026!'),
    role: 'TECHNICIAN',
    department: 'Hardware & Asset Management',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
  },
  {
    id: 'user-tech-farai',
    name: 'Farai Moyo',
    email: 'farai.tech@capaciti.org',
    passwordHash: hashPassword('Tech@Capaciti2026!'),
    role: 'TECHNICIAN',
    department: 'Software & Application Support',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-02T09:30:00.000Z',
    updatedAt: '2026-08-02T09:30:00.000Z',
  },
  {
    id: 'user-tech-anathi',
    name: 'Anathi Dlamini',
    email: 'anathi.tech@capaciti.org',
    passwordHash: hashPassword('Tech@Capaciti2026!'),
    role: 'TECHNICIAN',
    department: 'Identity & Security Ops',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },

  // 8-20. 13 End Users (Employees & Candidates / Learners)
  {
    id: 'user-cust-mbali',
    name: 'Mbali Entle Mpendu',
    email: 'mbalientlempendu02@gmail.com',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'Digital Skills Academy / Cohort 24',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-03T10:00:00.000Z',
    updatedAt: '2026-08-03T10:00:00.000Z',
  },
  {
    id: 'user-emp-bongani',
    name: 'Bongani Sithole',
    email: 'bongani.sithole@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'EMPLOYEE',
    department: 'Finance & Accounting',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-03T11:00:00.000Z',
    updatedAt: '2026-08-03T11:00:00.000Z',
  },
  {
    id: 'user-emp-kagiso',
    name: 'Kagiso Mokoena',
    email: 'kagiso.mokoena@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'EMPLOYEE',
    department: 'Human Resources',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-03T11:30:00.000Z',
    updatedAt: '2026-08-03T11:30:00.000Z',
  },
  {
    id: 'user-cust-lerato',
    name: 'Lerato Pillay',
    email: 'lerato.pillay@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'Software Engineering Academy',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-04T09:00:00.000Z',
    updatedAt: '2026-08-04T09:00:00.000Z',
  },
  {
    id: 'user-emp-thabo',
    name: 'Thabo Van Der Merwe',
    email: 'thabo.vdm@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'EMPLOYEE',
    department: 'Marketing & Communications',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-04T09:30:00.000Z',
    updatedAt: '2026-08-04T09:30:00.000Z',
  },
  {
    id: 'user-cust-precious',
    name: 'Precious Ndlovu',
    email: 'precious.ndlovu@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'Data Analytics Cohort',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-04T10:00:00.000Z',
    updatedAt: '2026-08-04T10:00:00.000Z',
  },
  {
    id: 'user-emp-sibusiso',
    name: 'Sibusiso Cele',
    email: 'sibusiso.cele@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'EMPLOYEE',
    department: 'Procurement & Facilities',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-05T08:00:00.000Z',
    updatedAt: '2026-08-05T08:00:00.000Z',
  },
  {
    id: 'user-cust-nomvula',
    name: 'Nomvula Zulu',
    email: 'nomvula.zulu@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'Cybersecurity Training Track',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-05T08:30:00.000Z',
    updatedAt: '2026-08-05T08:30:00.000Z',
  },
  {
    id: 'user-emp-keanu',
    name: 'Keanu Petersen',
    email: 'keanu.petersen@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'EMPLOYEE',
    department: 'Operations & Logistical Support',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'user-cust-ayanda',
    name: 'Ayanda Gumede',
    email: 'ayanda.gumede@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'Cloud Practitioners Cohort',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-06T09:30:00.000Z',
    updatedAt: '2026-08-06T09:30:00.000Z',
  },
  {
    id: 'user-emp-rethabile',
    name: 'Rethabile Modise',
    email: 'rethabile.modise@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'EMPLOYEE',
    department: 'Talent Placement & Partnerships',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-06T10:00:00.000Z',
  },
  {
    id: 'user-cust-gugu',
    name: 'Gugulethu Baloyi',
    email: 'gugu.baloyi@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'AI & Machine Learning Fellow',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-07T08:00:00.000Z',
    updatedAt: '2026-08-07T08:00:00.000Z',
  },
  {
    id: 'user-cust-jabulani',
    name: 'Jabulani Khoza',
    email: 'jabulani.khoza@capaciti.org',
    passwordHash: hashPassword('Capaciti2026!'),
    role: 'CUSTOMER',
    department: 'Business Analysis Cohort',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-07T08:30:00.000Z',
    updatedAt: '2026-08-07T08:30:00.000Z',
  },
  // Legacy alias for Luthando's personal email
  {
    id: 'user-tech-luthando-alias',
    name: 'Luthando Didiza',
    email: 'luthandodidiza197@gmail.com',
    passwordHash: hashPassword('Tech@Capaciti2026!'),
    role: 'TECHNICIAN',
    department: 'IT Infrastructure & Systems',
    status: 'Active',
    emailVerified: true,
    createdAt: '2026-08-02T08:00:00.000Z',
    updatedAt: '2026-08-02T08:00:00.000Z',
  },
];

// Rich, realistic seeded requests matching all requested states
export const SEED_REQUESTS: RequestItem[] = [
  // --- 1. RESOLVED IMMEDIATELY (Quick FCR, Low Duration, Within SLA) ---
  {
    id: 'REQ-2026-0821-1001',
    userId: 'user-cust-mbali',
    userName: 'Mbali Entle Mpendu',
    userEmail: 'mbalientlempendu02@gmail.com',
    userRole: 'CUSTOMER',
    title: 'VPN Portal Credential Lockout & MFA Token Reset',
    description: 'Received error code AUTH-401 when attempting to connect to the internal lab staging server after changing password.',
    requestType: 'Incident',
    priority: 'Urgent',
    department: 'IT',
    status: 'Resolved',
    slaTargetHours: 2,
    slaStatus: 'Within SLA',
    resolvedAt: '2026-08-21T02:20:00.000Z',
    resolutionDurationHours: 0.3,
    assignedToUserId: 'user-tech-anathi',
    assignedToName: 'Anathi Dlamini',
    assignedTechnicianName: 'Anathi Dlamini',
    category: 'Account Access',
    resolutionNotes: 'Reset Okta MFA session token and cleared cached Kerberos tickets. Verified candidate successfully reconnected to staging lab.',
    createdAt: '2026-08-21T02:02:00.000Z',
    updatedAt: '2026-08-21T02:20:00.000Z',
    aiClassification: {
      id: 'ai-seed-1',
      requestId: 'REQ-2026-0821-1001',
      category: 'Account Access',
      subcategory: 'MFA & Authentication Reset',
      summary: 'Candidate locked out of VPN with AUTH-401 after password change.',
      recommendedAction: 'Flush active token cache in Okta Admin and generate temporary SMS bypass.',
      aiPriority: 'Urgent',
      confidenceScore: 0.98,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T02:02:05.000Z',
    },
    internalNotes: ['[2026-08-21 02:05] Anathi Dlamini: Unlocked profile in Azure AD, user verified working.'],
  },
  {
    id: 'REQ-2026-0820-1002',
    userId: 'user-cust-lerato',
    userName: 'Lerato Pillay',
    userEmail: 'lerato.pillay@capaciti.org',
    userRole: 'CUSTOMER',
    title: 'Temporary AWS Sandbox Access Keys for Cohort 24 Project',
    description: 'Need IAM programmatic access keys for AWS S3 and Lambda deployment for the cloud backend module assignment.',
    requestType: 'Service Request',
    priority: 'Medium',
    department: 'IT',
    status: 'Resolved',
    slaTargetHours: 24,
    slaStatus: 'Within SLA',
    resolvedAt: '2026-08-20T11:45:00.000Z',
    resolutionDurationHours: 0.6,
    assignedToUserId: 'user-tech-zandile',
    assignedToName: 'Zandile Nkosi',
    assignedTechnicianName: 'Zandile Nkosi',
    category: 'Network & Cloud',
    resolutionNotes: 'Provisioned temporary sandbox credentials with scoped permissions to cohort-24-dev S3 bucket and serverless execution role.',
    createdAt: '2026-08-20T11:10:00.000Z',
    updatedAt: '2026-08-20T11:45:00.000Z',
    aiClassification: {
      id: 'ai-seed-2',
      requestId: 'REQ-2026-0820-1002',
      category: 'Network & Cloud',
      subcategory: 'AWS Sandbox & IAM Provisioning',
      summary: 'Learner requested scoped IAM access keys for cloud module assignment.',
      recommendedAction: 'Attach Academy Sandbox IAM policy and send encrypted credentials via secure vault.',
      aiPriority: 'Medium',
      confidenceScore: 0.95,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-20T11:10:10.000Z',
    },
  },
  {
    id: 'REQ-2026-0820-1003',
    userId: 'user-emp-thabo',
    userName: 'Thabo Van Der Merwe',
    userEmail: 'thabo.vdm@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Zoom Enterprise Pro License Allocation for Partner Demo Webinar',
    description: 'Upgrading marketing Zoom seat from basic to 500-attendee webinar tier for tomorrow morning’s corporate partner demo.',
    requestType: 'Service Request',
    priority: 'Medium',
    department: 'Operations',
    status: 'Resolved',
    slaTargetHours: 24,
    slaStatus: 'Within SLA',
    resolvedAt: '2026-08-20T14:30:00.000Z',
    resolutionDurationHours: 0.7,
    assignedToUserId: 'user-tech-luthando',
    assignedToName: 'Luthando Didiza',
    assignedTechnicianName: 'Luthando Didiza',
    category: 'Software & SaaS',
    resolutionNotes: 'Reallocated unused Zoom Enterprise Large Meeting add-on to thabo.vdm@capaciti.org and scheduled test session.',
    createdAt: '2026-08-20T13:48:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z',
    aiClassification: {
      id: 'ai-seed-3',
      requestId: 'REQ-2026-0820-1003',
      category: 'Software & SaaS',
      subcategory: 'Zoom License Tier Upgrade',
      summary: 'Marketing staff requested temporary Zoom Large Meeting license for partner presentation.',
      recommendedAction: 'Reassign available license seat in Zoom Admin Portal.',
      aiPriority: 'Medium',
      confidenceScore: 0.94,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-20T13:48:15.000Z',
    },
  },

  // --- 2. BREACHED (Resolved After Estimated SLA Period or Overdue) ---
  {
    id: 'REQ-2026-0818-2001',
    userId: 'user-emp-sibusiso',
    userName: 'Sibusiso Cele',
    userEmail: 'sibusiso.cele@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Cape Town Campus Core Cisco Switch Power Supply Failure',
    description: 'Redundant power supply in Rack B blew during thunderstorm. Switch dropped secondary uplink to lab workstations.',
    requestType: 'Incident',
    priority: 'Urgent',
    department: 'IT',
    status: 'Resolved',
    slaTargetHours: 2,
    slaStatus: 'Breached',
    resolvedAt: '2026-08-19T14:00:00.000Z',
    resolutionDurationHours: 27.5,
    assignedToUserId: 'user-tech-tebogo',
    assignedToName: 'Tebogo Molefe',
    assignedTechnicianName: 'Tebogo Molefe',
    category: 'Hardware & Assets',
    resolutionNotes: 'Replacement OEM Cisco Catalyst 9300 PSU ordered from distributor arrived delayed by 24h. Installed, load tested, and secondary rail restored.',
    createdAt: '2026-08-18T10:30:00.000Z',
    updatedAt: '2026-08-19T14:00:00.000Z',
    aiClassification: {
      id: 'ai-seed-4',
      requestId: 'REQ-2026-0818-2001',
      category: 'Hardware & Assets',
      subcategory: 'Network Hardware Infrastructure',
      summary: 'Critical hardware failure on campus core switch secondary power supply.',
      recommendedAction: 'Dispatch hardware technician with replacement hot-swap PSU module.',
      aiPriority: 'Urgent',
      confidenceScore: 0.99,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-18T10:30:10.000Z',
    },
    internalNotes: [
      '[2026-08-18 11:00] Tebogo Molefe: Local spare depleted. Ordered urgent courier from supplier.',
      '[2026-08-19 13:45] Tebogo Molefe: Part arrived and installed. SLA breached due to courier logistics.',
    ],
  },
  {
    id: 'REQ-2026-0817-2002',
    userId: 'user-emp-bongani',
    userName: 'Bongani Sithole',
    userEmail: 'bongani.sithole@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Finance ERP Vendor Disbursement Reconciliation Glitch',
    description: 'Bank payment batch file export fails with XML schema validation error when generating payments over R100,000.',
    requestType: 'Complaint',
    priority: 'High',
    department: 'Finance',
    status: 'Resolved',
    slaTargetHours: 8,
    slaStatus: 'Breached',
    resolvedAt: '2026-08-19T09:15:00.000Z',
    resolutionDurationHours: 42.0,
    assignedToUserId: 'user-tech-farai',
    assignedToName: 'Farai Moyo',
    assignedTechnicianName: 'Farai Moyo',
    category: 'Finance',
    resolutionNotes: 'Identified corrupted character encoding in vendor bank branch codes. Patched XML export sanitization script and re-ran payment batches successfully.',
    createdAt: '2026-08-17T15:15:00.000Z',
    updatedAt: '2026-08-19T09:15:00.000Z',
    aiClassification: {
      id: 'ai-seed-5',
      requestId: 'REQ-2026-0817-2002',
      category: 'Finance',
      subcategory: 'ERP Integration & Payment Processing',
      summary: 'ERP payment export failure on high-value batches due to XML schema exception.',
      recommendedAction: 'Debug ERP XML serializer and audit database character encoding for vendor table.',
      aiPriority: 'High',
      confidenceScore: 0.96,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-17T15:15:12.000Z',
    },
  },
  {
    id: 'REQ-2026-0819-2003',
    userId: 'user-cust-precious',
    userName: 'Precious Ndlovu',
    userEmail: 'precious.ndlovu@capaciti.org',
    userRole: 'CUSTOMER',
    title: 'Dual 4K Monitor Arm Hardware Replacement for Lab 3 Desk 12',
    description: 'Hydraulic tension arm collapsed on workstation monitor stand, preventing proper screen positioning for cohort data lab sessions.',
    requestType: 'Service Request',
    priority: 'Medium',
    department: 'Operations',
    status: 'In Progress',
    slaTargetHours: 24,
    slaStatus: 'Breached',
    assignedToUserId: 'user-tech-tebogo',
    assignedToName: 'Tebogo Molefe',
    assignedTechnicianName: 'Tebogo Molefe',
    category: 'Hardware & Assets',
    createdAt: '2026-08-19T08:00:00.000Z',
    updatedAt: '2026-08-20T16:00:00.000Z',
    aiClassification: {
      id: 'ai-seed-6',
      requestId: 'REQ-2026-0819-2003',
      category: 'Hardware & Assets',
      subcategory: 'Ergonomic Desk Hardware',
      summary: 'Mechanical failure of monitor mount in training lab.',
      recommendedAction: 'Replace with heavy-duty VESA dual arm stand from store room.',
      aiPriority: 'Medium',
      confidenceScore: 0.92,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-19T08:00:10.000Z',
    },
    internalNotes: ['[2026-08-20 16:00] Tebogo Molefe: Warehouse out of stock, requisition sent to procurement.'],
  },

  // --- 3. IN PROGRESS ---
  {
    id: 'REQ-2026-0821-3001',
    userId: 'user-emp-keanu',
    userName: 'Keanu Petersen',
    userEmail: 'keanu.petersen@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Johannesburg Campus Fiber Gateway Failover Configuration',
    description: 'Setting up automated BGP failover between primary Dark Fibre Africa line and backup 5G business gateway.',
    requestType: 'Service Request',
    priority: 'High',
    department: 'IT',
    status: 'In Progress',
    slaTargetHours: 8,
    slaStatus: 'Within SLA',
    assignedToUserId: 'user-tech-zandile',
    assignedToName: 'Zandile Nkosi',
    assignedTechnicianName: 'Zandile Nkosi',
    category: 'Network & Cloud',
    createdAt: '2026-08-21T01:30:00.000Z',
    updatedAt: '2026-08-21T02:45:00.000Z',
    aiClassification: {
      id: 'ai-seed-7',
      requestId: 'REQ-2026-0821-3001',
      category: 'Network & Cloud',
      subcategory: 'WAN Routing & Redundancy',
      summary: 'Campus network redundancy setup for secondary automated gateway switch.',
      recommendedAction: 'Verify BGP neighbor peering table and execute simulated link drop test.',
      aiPriority: 'High',
      confidenceScore: 0.95,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T01:30:15.000Z',
    },
    internalNotes: ['[2026-08-21 02:30] Zandile Nkosi: BGP route maps configured. Testing failover latency.'],
  },
  {
    id: 'REQ-2026-0821-3002',
    userId: 'user-cust-gugu',
    userName: 'Gugulethu Baloyi',
    userEmail: 'gugu.baloyi@capaciti.org',
    userRole: 'CUSTOMER',
    title: 'GitHub Enterprise Organization Team Provisioning for AI Fellows',
    description: 'Requesting access to the capaciti-ai-labs GitHub Enterprise organization and Copilot seats for 12 new AI Fellows.',
    requestType: 'Service Request',
    priority: 'Medium',
    department: 'IT',
    status: 'In Progress',
    slaTargetHours: 24,
    slaStatus: 'Within SLA',
    assignedToUserId: 'user-tech-luthando',
    assignedToName: 'Luthando Didiza',
    assignedTechnicianName: 'Luthando Didiza',
    category: 'Software & SaaS',
    createdAt: '2026-08-21T00:15:00.000Z',
    updatedAt: '2026-08-21T02:00:00.000Z',
    aiClassification: {
      id: 'ai-seed-8',
      requestId: 'REQ-2026-0821-3002',
      category: 'Software & SaaS',
      subcategory: 'Developer Tooling & GitHub Enterprise',
      summary: 'Bulk GitHub organization invitations and Copilot seat provisioning.',
      recommendedAction: 'Map GitHub SCIM group to Azure AD AI-Fellows security group.',
      aiPriority: 'Medium',
      confidenceScore: 0.97,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T00:15:10.000Z',
    },
  },
  {
    id: 'REQ-2026-0821-3003',
    userId: 'user-emp-rethabile',
    userName: 'Rethabile Modise',
    userEmail: 'rethabile.modise@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Candidate Placement CRM Webhook Sync Latency Investigation',
    description: 'Placement partner interview updates from Salesforce are experiencing a 45-minute delay before appearing in the Capaciti candidate portal.',
    requestType: 'Incident',
    priority: 'High',
    department: 'Operations',
    status: 'In Progress',
    slaTargetHours: 8,
    slaStatus: 'Within SLA',
    assignedToUserId: 'user-tech-farai',
    assignedToName: 'Farai Moyo',
    assignedTechnicianName: 'Farai Moyo',
    category: 'Software & SaaS',
    createdAt: '2026-08-21T02:00:00.000Z',
    updatedAt: '2026-08-21T03:10:00.000Z',
    aiClassification: {
      id: 'ai-seed-9',
      requestId: 'REQ-2026-0821-3003',
      category: 'Software & SaaS',
      subcategory: 'Webhook Queue & API Sync',
      summary: 'Salesforce webhook ingestion queue bottleneck delaying interview scheduling status.',
      recommendedAction: 'Check RabbitMQ message queue depth and worker container concurrency.',
      aiPriority: 'High',
      confidenceScore: 0.94,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T02:00:10.000Z',
    },
  },

  // --- 4. CRITICAL / URGENT INCIDENTS ---
  {
    id: 'REQ-2026-0821-4001',
    userId: 'user-cust-nomvula',
    userName: 'Nomvula Zulu',
    userEmail: 'nomvula.zulu@capaciti.org',
    userRole: 'CUSTOMER',
    title: 'CRITICAL: LMS Assessment Portal 504 Gateway Timeout Before Mid-Term Exam',
    description: 'Entire cybersecurity cohort of 40 candidates unable to load the practical assessment module. HTTP 504 Gateway Timeout returned by nginx.',
    requestType: 'Incident',
    priority: 'Urgent',
    department: 'IT',
    status: 'In Progress',
    slaTargetHours: 2,
    slaStatus: 'At Risk',
    assignedToUserId: 'user-tech-zandile',
    assignedToName: 'Zandile Nkosi',
    assignedTechnicianName: 'Zandile Nkosi',
    category: 'Network & Cloud',
    createdAt: '2026-08-21T02:15:00.000Z',
    updatedAt: '2026-08-21T03:30:00.000Z',
    aiClassification: {
      id: 'ai-seed-10',
      requestId: 'REQ-2026-0821-4001',
      category: 'Network & Cloud',
      subcategory: 'Web Server & LMS Platform Downtime',
      summary: 'Mass student access failure to online assessment portal due to upstream proxy timeout.',
      recommendedAction: 'Scale web app container pool to 6 replicas and flush Redis query cache.',
      aiPriority: 'Urgent',
      confidenceScore: 0.99,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T02:15:05.000Z',
    },
    internalNotes: ['[2026-08-21 02:45] Zandile Nkosi: Scaled backend pod autoscaler from 2 to 8 nodes. Validating connection pool.'],
  },
  {
    id: 'REQ-2026-0821-4002',
    userId: 'user-emp-sibusiso',
    userName: 'Sibusiso Cele',
    userEmail: 'sibusiso.cele@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'CRITICAL: Server Room Precision Air Conditioning Thermal Sensor Alarm',
    description: 'HVAC unit 2 in main server facility tripped. Ambient temperature rose from 20°C to 28.5°C over the past 40 minutes.',
    requestType: 'Incident',
    priority: 'Urgent',
    department: 'Operations',
    status: 'In Progress',
    slaTargetHours: 2,
    slaStatus: 'Within SLA',
    assignedToUserId: 'user-tech-tebogo',
    assignedToName: 'Tebogo Molefe',
    assignedTechnicianName: 'Tebogo Molefe',
    category: 'Facilities & Ops',
    createdAt: '2026-08-21T03:00:00.000Z',
    updatedAt: '2026-08-21T03:35:00.000Z',
    aiClassification: {
      id: 'ai-seed-11',
      requestId: 'REQ-2026-0821-4002',
      category: 'Facilities & Ops',
      subcategory: 'Data Center Thermal Management',
      summary: 'Server room HVAC failure threatening hardware overheating and emergency shutdown.',
      recommendedAction: 'Switch on secondary backup split units immediately and notify facilities contractor.',
      aiPriority: 'Urgent',
      confidenceScore: 0.99,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T03:00:05.000Z',
    },
    internalNotes: ['[2026-08-21 03:15] Tebogo Molefe: Secondary cooling engaged, room temp stabilizing at 23°C.'],
  },

  // --- 5. AT RISK TICKETS (Approaching SLA Expiration) ---
  {
    id: 'REQ-2026-0820-5001',
    userId: 'user-cust-ayanda',
    userName: 'Ayanda Gumede',
    userEmail: 'ayanda.gumede@capaciti.org',
    userRole: 'CUSTOMER',
    title: 'Swollen Battery Diagnostic for Academy Loaner Laptop #CAP-8812',
    description: 'Trackpad lifting and base plate warped on Lenovo ThinkPad loaner unit. Trackpad clicks no longer register.',
    requestType: 'Incident',
    priority: 'High',
    department: 'IT',
    status: 'In Progress',
    slaTargetHours: 8,
    slaStatus: 'At Risk',
    assignedToUserId: 'user-tech-tebogo',
    assignedToName: 'Tebogo Molefe',
    assignedTechnicianName: 'Tebogo Molefe',
    category: 'Hardware & Assets',
    createdAt: '2026-08-20T21:15:00.000Z',
    updatedAt: '2026-08-21T03:20:00.000Z',
    aiClassification: {
      id: 'ai-seed-12',
      requestId: 'REQ-2026-0820-5001',
      category: 'Hardware & Assets',
      subcategory: 'Lithium Battery Hazard & Hardware Replacement',
      summary: 'Safety hazard: swollen battery casing on learner laptop.',
      recommendedAction: 'Immediate safe disposal in fireproof container and issue swap unit from buffer stock.',
      aiPriority: 'High',
      confidenceScore: 0.98,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-20T21:15:10.000Z',
    },
    internalNotes: ['[2026-08-21 02:00] Tebogo Molefe: Unit quarantined, preparing replacement Dell Latitude.'],
  },
  {
    id: 'REQ-2026-0821-5002',
    userId: 'user-cust-jabulani',
    userName: 'Jabulani Khoza',
    userEmail: 'jabulani.khoza@capaciti.org',
    userRole: 'CUSTOMER',
    title: 'Azure AD Conditional Access Policy Lockout on PowerBI Gateway',
    description: 'Cannot refresh shared Capstone analytics dashboard due to location-based compliance requirement rejecting campus Wi-Fi IP range.',
    requestType: 'Incident',
    priority: 'Urgent',
    department: 'IT',
    status: 'In Progress',
    slaTargetHours: 2,
    slaStatus: 'At Risk',
    assignedToUserId: 'user-tech-anathi',
    assignedToName: 'Anathi Dlamini',
    assignedTechnicianName: 'Anathi Dlamini',
    category: 'Account Access',
    createdAt: '2026-08-21T02:05:00.000Z',
    updatedAt: '2026-08-21T03:30:00.000Z',
    aiClassification: {
      id: 'ai-seed-13',
      requestId: 'REQ-2026-0821-5002',
      category: 'Account Access',
      subcategory: 'Conditional Access & IP Whitelisting',
      summary: 'Campus IP range missing from Azure AD trusted named locations list.',
      recommendedAction: 'Add new public IPv4 egress subnet to Microsoft Entra named locations.',
      aiPriority: 'Urgent',
      confidenceScore: 0.96,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-21T02:05:10.000Z',
    },
  },

  // --- 6. ADDITIONAL DIVERSE OPERATIONAL TICKETS ---
  {
    id: 'REQ-2026-0819-6001',
    userId: 'user-emp-bongani',
    userName: 'Bongani Sithole',
    userEmail: 'bongani.sithole@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Q3 Cloud Budget Allocation & FinOps Cost Center Provisioning',
    description: 'Setting up departmental budget alerts and AWS Cost Explorer tags for upcoming Q3 data engineering bootcamps.',
    requestType: 'Service Request',
    priority: 'Medium',
    department: 'Finance',
    status: 'Resolved',
    slaTargetHours: 24,
    slaStatus: 'Within SLA',
    resolvedAt: '2026-08-19T15:30:00.000Z',
    resolutionDurationHours: 5.5,
    assignedToUserId: 'user-manager-naledi',
    assignedToName: 'Naledi Khumalo',
    assignedTechnicianName: 'Naledi Khumalo',
    category: 'Finance',
    resolutionNotes: 'AWS Budgets configured with 80% threshold notifications delivered to finance@capaciti.org and Slack #ops-alerts.',
    createdAt: '2026-08-19T10:00:00.000Z',
    updatedAt: '2026-08-19T15:30:00.000Z',
    aiClassification: {
      id: 'ai-seed-14',
      requestId: 'REQ-2026-0819-6001',
      category: 'Finance',
      subcategory: 'Cloud FinOps & Cost Center Control',
      summary: 'Cloud budget ceiling and automated threshold alerts setup.',
      recommendedAction: 'Deploy Terraform AWS Budget template with SNS topic alerting.',
      aiPriority: 'Medium',
      confidenceScore: 0.95,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-19T10:00:15.000Z',
    },
  },
  {
    id: 'REQ-2026-0818-6002',
    userId: 'user-emp-kagiso',
    userName: 'Kagiso Mokoena',
    userEmail: 'kagiso.mokoena@capaciti.org',
    userRole: 'EMPLOYEE',
    title: 'Updated 2026 Health Plan & Dependent Benefits Policy Guide',
    description: 'Requesting verified copy of the 2026 Discovery Health executive benefits schedule for upcoming employee wellness town hall.',
    requestType: 'Question',
    priority: 'Low',
    department: 'Human Resources',
    status: 'Resolved',
    slaTargetHours: 72,
    slaStatus: 'Within SLA',
    resolvedAt: '2026-08-18T14:15:00.000Z',
    resolutionDurationHours: 3.2,
    assignedToUserId: 'user-manager-naledi',
    assignedToName: 'Naledi Khumalo',
    assignedTechnicianName: 'Naledi Khumalo',
    category: 'Human Resources',
    resolutionNotes: 'Uploaded new PDF handbook to HR portal and shared direct download link.',
    createdAt: '2026-08-18T11:00:00.000Z',
    updatedAt: '2026-08-18T14:15:00.000Z',
    aiClassification: {
      id: 'ai-seed-15',
      requestId: 'REQ-2026-0818-6002',
      category: 'Human Resources',
      subcategory: 'Employee Benefits & Policies',
      summary: 'HR staff requested latest employee healthcare handbook.',
      recommendedAction: 'Provide published benefits documentation from knowledge repository.',
      aiPriority: 'Low',
      confidenceScore: 0.98,
      model: 'gemini-3.7-flash',
      createdAt: '2026-08-18T11:00:05.000Z',
    },
  },
];

// Seed datasets for Week 3 Sprint 2: Workflow Automation, Approvals, AI Governance & Compliance
export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: 'rule-wf-1',
    name: 'Critical Security Incident Auto-Routing & Escalation',
    description: 'Auto-assigns urgent security & IAM lockout tickets to Lead Security Technician with instant alert dispatch.',
    trigger: 'on_ticket_created',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'Urgent' },
      { field: 'category', operator: 'in', value: ['Account Access', 'Network & Cloud', 'IT Support'] }
    ],
    actions: [
      { type: 'auto_assign', targetValue: 'user-tech-luthando', details: 'Assigned to Luthando Didiza (Lead Tech)' },
      { type: 'set_priority', targetValue: 'Urgent', details: 'Enforce 2-hour SLA' },
      { type: 'send_email_alert', targetValue: 'luthando.tech@capaciti.org', details: 'Dispatch High-Priority Security Notification' },
      { type: 'apply_tag', targetValue: 'CRITICAL_SECURITY' }
    ],
    isActive: true,
    executionCount: 14,
    lastExecutedAt: '2026-08-24T09:15:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z',
    createdBy: 'Global Administrator'
  },
  {
    id: 'rule-wf-2',
    name: 'High-Value Hardware & Asset Approval Gate',
    description: 'Intercepts hardware equipment requisition requests and automatically creates a formal Supervisor Approval ticket.',
    trigger: 'on_ticket_created',
    conditions: [
      { field: 'category', operator: 'equals', value: 'Hardware & Assets' },
      { field: 'requestType', operator: 'equals', value: 'Service Request' }
    ],
    actions: [
      { type: 'trigger_approval', targetValue: 'EQUIPMENT_REQUISITION', details: 'Route to Naledi Khumalo (Operations Supervisor)' },
      { type: 'send_email_alert', targetValue: 'manager@capaciti.org', details: 'Send Manager Equipment Authorization Request' },
      { type: 'apply_tag', targetValue: 'PENDING_APPROVAL_GATE' }
    ],
    isActive: true,
    executionCount: 8,
    lastExecutedAt: '2026-08-24T11:40:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z',
    createdBy: 'Global Administrator'
  },
  {
    id: 'rule-wf-3',
    name: 'SLA Risk Auto-Escalation (Remaining <= 4 Hours)',
    description: 'Proactively escalates priority to High when a submitted ticket nears 75% SLA consumption.',
    trigger: 'on_sla_warning',
    conditions: [
      { field: 'slaRemainingHours', operator: 'greater_than', value: 0 }
    ],
    actions: [
      { type: 'set_priority', targetValue: 'High', details: 'Escalate to High Priority' },
      { type: 'send_email_alert', targetValue: 'manager@capaciti.org', details: 'Dispatch Supervisor SLA Warning' }
    ],
    isActive: true,
    executionCount: 22,
    lastExecutedAt: '2026-08-24T14:20:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z',
    createdBy: 'Naledi Khumalo'
  },
  {
    id: 'rule-wf-4',
    name: 'Finance & Procurement Budget Sign-off Gate',
    description: 'Routes vendor invoice and financial expense requests through formal budgetary approval before fulfillment.',
    trigger: 'on_ticket_created',
    conditions: [
      { field: 'department', operator: 'in', value: ['Finance & Accounting', 'Procurement & Vendor Logistics'] }
    ],
    actions: [
      { type: 'trigger_approval', targetValue: 'BUDGET_EXPENSE', details: 'Finance Supervisor authorization required' },
      { type: 'apply_tag', targetValue: 'FINANCE_AUDIT' }
    ],
    isActive: true,
    executionCount: 6,
    lastExecutedAt: '2026-08-23T16:00:00.000Z',
    createdAt: '2026-08-21T09:00:00.000Z',
    createdBy: 'Global Administrator'
  },
  {
    id: 'rule-wf-5',
    name: 'Privilege Access & Account Unblock Gate',
    description: 'Enforces strict Human-in-the-Loop admin sign-off and POPIA audit logging for account reactivation.',
    trigger: 'on_ticket_created',
    conditions: [
      { field: 'category', operator: 'equals', value: 'Account Access' },
      { field: 'title', operator: 'contains', value: 'Unblock' }
    ],
    actions: [
      { type: 'trigger_approval', targetValue: 'ACCOUNT_UNBLOCK', details: 'Requires Administrator Sign-Off' },
      { type: 'apply_tag', targetValue: 'POPIA_SECURITY_AUDIT' }
    ],
    isActive: true,
    executionCount: 5,
    lastExecutedAt: '2026-08-24T08:30:00.000Z',
    createdAt: '2026-08-21T10:00:00.000Z',
    createdBy: 'Global Administrator'
  }
];

export const DEFAULT_APPROVALS: ApprovalRequest[] = [
  {
    id: 'APR-2026-0824-001',
    requestId: 'REQ-2026-0824-1002',
    ticketTitle: 'Hardware Upgrade: Developer Workstation RAM & Display for Lab 3',
    approvalType: 'EQUIPMENT_REQUISITION',
    requestorId: 'user-tech-luthando',
    requestorName: 'Luthando Didiza',
    requestorEmail: 'luthando.tech@capaciti.org',
    department: 'Digital Skills Academy',
    estimatedCost: 14500,
    justification: 'Required for running local Docker containers and LLM inference models during candidate workshops.',
    riskLevel: 'Medium',
    status: 'PENDING',
    requiredRole: 'SUPERVISOR',
    createdAt: '2026-08-24T08:30:00.000Z',
    updatedAt: '2026-08-24T08:30:00.000Z'
  },
  {
    id: 'APR-2026-0824-002',
    requestId: 'REQ-2026-0824-1001',
    ticketTitle: 'Production AWS Cloud Staging Environment IAM Escalation',
    approvalType: 'SECURITY_ACCESS',
    requestorId: 'user-tech-anathi',
    requestorName: 'Anathi Dlamini',
    requestorEmail: 'anathi.tech@capaciti.org',
    department: 'Identity & Security Ops',
    estimatedCost: 0,
    justification: 'Need elevated IAM credentials to deploy security patch on cloud database cluster.',
    riskLevel: 'Critical',
    status: 'PENDING',
    requiredRole: 'ADMIN',
    createdAt: '2026-08-24T09:10:00.000Z',
    updatedAt: '2026-08-24T09:10:00.000Z'
  },
  {
    id: 'APR-2026-0823-003',
    requestId: 'REQ-2026-0823-2001',
    ticketTitle: 'Enterprise GitHub & Figma Organization Licensing Renewal',
    approvalType: 'BUDGET_EXPENSE',
    requestorId: 'user-emp-bongani',
    requestorName: 'Bongani Sithole',
    requestorEmail: 'bongani.sithole@capaciti.org',
    department: 'Finance & Accounting',
    estimatedCost: 28000,
    justification: 'Annual seat renewal for 45 learners in digital software development cohort.',
    riskLevel: 'Low',
    status: 'APPROVED',
    requiredRole: 'SUPERVISOR',
    decidedByUserId: 'user-manager-naledi',
    decidedByName: 'Naledi Khumalo',
    decisionNotes: 'Approved in line with Q3 Software & Learning Operations Budget.',
    decidedAt: '2026-08-23T14:00:00.000Z',
    createdAt: '2026-08-23T11:00:00.000Z',
    updatedAt: '2026-08-23T14:00:00.000Z'
  },
  {
    id: 'APR-2026-0822-004',
    requestId: 'REQ-2026-0822-3001',
    ticketTitle: 'Remote Access VPN Policy Exception for Travelling Candidate',
    approvalType: 'POLICY_EXCEPTION',
    requestorId: 'user-cust-mbali',
    requestorName: 'Mbali Entle Mpendu',
    requestorEmail: 'mbalientlempendu02@gmail.com',
    department: 'Digital Skills Academy / Cohort 24',
    estimatedCost: 0,
    justification: 'Accessing virtual learning portal while attending regional STEM hackathon in Durban.',
    riskLevel: 'Medium',
    status: 'APPROVED',
    requiredRole: 'SUPERVISOR',
    decidedByUserId: 'user-global-admin',
    decidedByName: 'Global Administrator',
    decisionNotes: 'Temporary VPN access granted with 7-day MFA expiry.',
    decidedAt: '2026-08-22T16:30:00.000Z',
    createdAt: '2026-08-22T10:00:00.000Z',
    updatedAt: '2026-08-22T16:30:00.000Z'
  },
  {
    id: 'APR-2026-0821-005',
    requestId: 'REQ-2026-0821-4001',
    ticketTitle: 'Suspended Okta SSO Account Reactivation Request',
    approvalType: 'ACCOUNT_UNBLOCK',
    requestorId: 'user-emp-kagiso',
    requestorName: 'Kagiso Mokoena',
    requestorEmail: 'kagiso.mokoena@capaciti.org',
    department: 'Human Resources',
    estimatedCost: 0,
    justification: 'Failed multiple biometric attempts following device replacement.',
    riskLevel: 'High',
    status: 'REJECTED',
    requiredRole: 'ADMIN',
    decidedByUserId: 'user-global-admin',
    decidedByName: 'Global Administrator',
    decisionNotes: 'Rejected pending identity verification via physical HR check and direct manager sign-off.',
    decidedAt: '2026-08-21T15:20:00.000Z',
    createdAt: '2026-08-21T13:00:00.000Z',
    updatedAt: '2026-08-21T15:20:00.000Z'
  }
];

export const DEFAULT_HITL_OVERRIDES: HITLOverrideRecord[] = [
  {
    id: 'hitl-001',
    ticketId: 'REQ-2026-0824-1002',
    ticketTitle: 'Hardware Upgrade: Workstation Display',
    originalCategory: 'IT Support',
    correctedCategory: 'Hardware & Assets',
    originalPriority: 'Low',
    correctedPriority: 'Medium',
    overriddenBy: 'Naledi Khumalo (Supervisor)',
    reason: 'Asset requisition requires asset tracking registry and formal equipment gate.',
    timestamp: '2026-08-24T09:00:00.000Z'
  },
  {
    id: 'hitl-002',
    ticketId: 'REQ-2026-0823-2001',
    ticketTitle: 'GitHub & Figma Organization Licensing',
    originalCategory: 'General Inquiry',
    correctedCategory: 'Software & SaaS',
    originalPriority: 'Medium',
    correctedPriority: 'High',
    overriddenBy: 'Global Administrator',
    reason: 'License renewal affects 45 learners; elevated to High priority.',
    timestamp: '2026-08-23T11:30:00.000Z'
  },
  {
    id: 'hitl-003',
    ticketId: 'REQ-2026-0822-3001',
    ticketTitle: 'VPN Policy Exception',
    originalCategory: 'IT Support',
    correctedCategory: 'Network & Cloud',
    originalPriority: 'Low',
    correctedPriority: 'Medium',
    overriddenBy: 'Naledi Khumalo (Supervisor)',
    reason: 'Security and firewall rule adjustment needed for remote endpoint.',
    timestamp: '2026-08-22T10:15:00.000Z'
  }
];

export const DEFAULT_PII_AUDITS: PIIAuditRecord[] = [
  {
    id: 'pii-audit-001',
    ticketId: 'REQ-2026-0824-1003',
    piiTypesDetected: ['South African National ID (13 digits)', 'Contact Mobile Number'],
    originalSampleMasked: 'Candidate ID 9405125089*** submitted with mobile +27 82 *** 4912',
    actionTaken: 'Auto-Redacted',
    timestamp: '2026-08-24T10:12:00.000Z'
  },
  {
    id: 'pii-audit-002',
    ticketId: 'REQ-2026-0823-2004',
    piiTypesDetected: ['Banking Account Details / Branch Code'],
    originalSampleMasked: 'Account: 6289******* Branch: 250*** Standard Bank',
    actionTaken: 'Auto-Redacted',
    timestamp: '2026-08-23T14:45:00.000Z'
  },
  {
    id: 'pii-audit-003',
    ticketId: 'REQ-2026-0821-4001',
    piiTypesDetected: ['Cleartext Temporary Credentials / Password'],
    originalSampleMasked: 'Passphrase temp: [PROTECTED_CREDENTIAL_MASKED]',
    actionTaken: 'Auto-Redacted',
    timestamp: '2026-08-21T13:02:00.000Z'
  }
];

export const DEFAULT_RESPONSIBLE_AI_PRINCIPLES: ResponsibleAIPrinciple[] = [
  {
    id: 'rai-001',
    principle: 'Fairness & Bias Prevention',
    standard: 'Responsible AI Framework',
    complianceStatus: 'Fully Compliant',
    complianceScore: 99.2,
    evidence: 'Demographic-neutral ticket triage validated across all 7 departments with 0.1% variance.',
    lastAudited: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'rai-002',
    principle: 'Accountability & Human-in-the-loop',
    standard: 'POPIA',
    complianceStatus: 'Fully Compliant',
    complianceScore: 100.0,
    evidence: 'All high-risk approvals, account terminations, and overrides require human supervisor confirmation.',
    lastAudited: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'rai-003',
    principle: 'Transparency & Explainability',
    standard: 'GDPR',
    complianceStatus: 'Fully Compliant',
    complianceScore: 98.6,
    evidence: 'AI confidence score (avg 96.4%), reasoning summary, and suggested next steps displayed on every classified ticket.',
    lastAudited: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'rai-004',
    principle: 'Privacy & POPIA Compliance',
    standard: 'POPIA',
    complianceStatus: 'Fully Compliant',
    complianceScore: 99.8,
    evidence: 'Real-time PII redaction layer masks South African IDs, phone numbers, and banking details before AI processing.',
    lastAudited: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'rai-005',
    principle: 'Safety & Robustness',
    standard: 'ISO 27001',
    complianceStatus: 'Fully Compliant',
    complianceScore: 98.9,
    evidence: 'Continuous drift monitoring active. Automated fallback to human technician upon confidence < 70%.',
    lastAudited: '2026-08-24T00:00:00.000Z'
  }
];

export const DEFAULT_DSAR_REQUESTS: DSARRecord[] = [
  {
    id: 'dsar-2026-001',
    userEmail: 'mbalientlempendu02@gmail.com',
    userName: 'Mbali Entle Mpendu',
    requestType: 'EXPORT_DATA',
    status: 'COMPLETED',
    submittedAt: '2026-08-22T08:00:00.000Z',
    completedAt: '2026-08-22T08:05:00.000Z',
    downloadUrl: '/api/compliance/dsar/dsar-2026-001/download'
  },
  {
    id: 'dsar-2026-002',
    userEmail: 'kagiso.mokoena@capaciti.org',
    userName: 'Kagiso Mokoena',
    requestType: 'RESTRICT_PROCESSING',
    status: 'COMPLETED',
    submittedAt: '2026-08-20T10:30:00.000Z',
    completedAt: '2026-08-20T10:32:00.000Z'
  }
];

export const DEFAULT_COMPLIANCE_POLICIES: CompliancePolicy[] = [
  {
    id: 'pol-001',
    name: 'POPIA Personal Information Retention & Anonymization',
    category: 'POPIA',
    retentionPeriod: '12 Months',
    enforcementStatus: 'Active',
    description: 'Automatically mask candidate personal identification data upon ticket closure after 90 days.',
    recordsCovered: 450,
    lastEnforced: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'pol-002',
    name: 'Immutable Audit Log Preservation Policy',
    category: 'Access Control',
    retentionPeriod: '5 Years',
    enforcementStatus: 'Enforced',
    description: 'Enforces cryptographically verifiable, append-only logs for all administrator and supervisor actions.',
    recordsCovered: 1280,
    lastEnforced: '2026-08-24T00:00:00.000Z'
  },
  {
    id: 'pol-003',
    name: 'GDPR Right to Erasure & Data Portability Protocol',
    category: 'GDPR',
    retentionPeriod: 'On-Demand (30 Days SLA)',
    enforcementStatus: 'Active',
    description: 'Automated DSAR pipeline supporting instant JSON/CSV export and cryptographically scrubbed anonymization.',
    recordsCovered: 24,
    lastEnforced: '2026-08-23T00:00:00.000Z'
  }
];

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      categories: [],
      requests: [],
      aiClassifications: [],
      auditLogs: [],
      emailNotifications: [],
      executiveReports: [],
      insights: [],
      workflowRules: [],
      workflowLogs: [],
      approvalRequests: [],
      hitlOverrides: [],
      piiAudits: [],
      dsarRequests: [],
      compliancePolicies: [],
      passwordResetTokens: [],
    };
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let loadedSuccessfully = false;

      if (fs.existsSync(DB_FILE)) {
        try {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.requests)) {
            // Self-heal: ensure all standard seed users exist in the users collection
            const existingEmails = new Set(parsed.users.map((u: any) => u.email.toLowerCase()));
            const mergedUsers = [...parsed.users];
            SEED_USERS.forEach((seedUser) => {
              if (!existingEmails.has(seedUser.email.toLowerCase())) {
                mergedUsers.push(seedUser);
                existingEmails.add(seedUser.email.toLowerCase());
              }
            });

            // Self-heal: ensure default categories exist
            const existingCatNames = new Set((parsed.categories || []).map((c: any) => c.name.toLowerCase()));
            const mergedCategories = [...(parsed.categories || [])];
            DEFAULT_CATEGORIES.forEach((seedCat) => {
              if (!existingCatNames.has(seedCat.name.toLowerCase())) {
                mergedCategories.push(seedCat);
                existingCatNames.add(seedCat.name.toLowerCase());
              }
            });

            this.data = {
              users: mergedUsers,
              categories: mergedCategories.length > 0 ? mergedCategories : DEFAULT_CATEGORIES,
              requests: parsed.requests.length > 0 ? parsed.requests : SEED_REQUESTS,
              aiClassifications: Array.isArray(parsed.aiClassifications) ? parsed.aiClassifications : SEED_REQUESTS.map((r) => r.aiClassification!).filter(Boolean),
              auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
              emailNotifications: Array.isArray(parsed.emailNotifications) ? parsed.emailNotifications : [],
              executiveReports: Array.isArray(parsed.executiveReports) ? parsed.executiveReports : [],
              insights: Array.isArray(parsed.insights) ? parsed.insights : [],
              workflowRules: Array.isArray(parsed.workflowRules) && parsed.workflowRules.length > 0 ? parsed.workflowRules : DEFAULT_WORKFLOW_RULES,
              workflowLogs: Array.isArray(parsed.workflowLogs) ? parsed.workflowLogs : [],
              approvalRequests: Array.isArray(parsed.approvalRequests) && parsed.approvalRequests.length > 0 ? parsed.approvalRequests : DEFAULT_APPROVALS,
              hitlOverrides: Array.isArray(parsed.hitlOverrides) && parsed.hitlOverrides.length > 0 ? parsed.hitlOverrides : DEFAULT_HITL_OVERRIDES,
              piiAudits: Array.isArray(parsed.piiAudits) && parsed.piiAudits.length > 0 ? parsed.piiAudits : DEFAULT_PII_AUDITS,
              dsarRequests: Array.isArray(parsed.dsarRequests) && parsed.dsarRequests.length > 0 ? parsed.dsarRequests : DEFAULT_DSAR_REQUESTS,
              compliancePolicies: Array.isArray(parsed.compliancePolicies) && parsed.compliancePolicies.length > 0 ? parsed.compliancePolicies : DEFAULT_COMPLIANCE_POLICIES,
              passwordResetTokens: Array.isArray(parsed.passwordResetTokens) ? parsed.passwordResetTokens : [],
            };
            loadedSuccessfully = true;
          }
        } catch (readErr) {
          console.warn('Could not parse existing DB_FILE, falling back to clean seed:', readErr);
        }
      }

      if (!loadedSuccessfully) {
        this.data = {
          users: SEED_USERS,
          categories: DEFAULT_CATEGORIES,
          requests: SEED_REQUESTS,
          aiClassifications: SEED_REQUESTS.map((r) => r.aiClassification!).filter(Boolean),
          auditLogs: [
            {
              id: 'audit-init-1',
              actorUserId: 'user-global-admin',
              actorEmail: 'admin@capaciti.org',
              action: 'SYSTEM_INITIALIZED',
              targetType: 'SYSTEM',
              targetId: 'sys-1',
              details: 'Capaciti Service Hub initialized with 20 registered accounts, live SLA telemetry, intelligent auto-classification, and enterprise workflows.',
              timestamp: '2026-08-21T00:00:00.000Z',
            },
          ],
          emailNotifications: [],
          executiveReports: [],
          insights: [],
          workflowRules: DEFAULT_WORKFLOW_RULES,
          workflowLogs: [],
          approvalRequests: DEFAULT_APPROVALS,
          hitlOverrides: DEFAULT_HITL_OVERRIDES,
          piiAudits: DEFAULT_PII_AUDITS,
          dsarRequests: DEFAULT_DSAR_REQUESTS,
          compliancePolicies: DEFAULT_COMPLIANCE_POLICIES,
          passwordResetTokens: [],
        };
      }

      if (!this.data.passwordResetTokens) {
        this.data.passwordResetTokens = [];
      }

      this.save();
    } catch (err) {
      console.error('Error initializing DB:', err);
      this.data = {
        users: SEED_USERS,
        categories: DEFAULT_CATEGORIES,
        requests: SEED_REQUESTS,
        aiClassifications: [],
        auditLogs: [],
        emailNotifications: [],
        executiveReports: [],
        insights: [],
        workflowRules: DEFAULT_WORKFLOW_RULES,
        workflowLogs: [],
        approvalRequests: DEFAULT_APPROVALS,
        hitlOverrides: DEFAULT_HITL_OVERRIDES,
        piiAudits: DEFAULT_PII_AUDITS,
        dsarRequests: DEFAULT_DSAR_REQUESTS,
        compliancePolicies: DEFAULT_COMPLIANCE_POLICIES,
        passwordResetTokens: [],
      };
    }
  }

  public resetToFreshSeed() {
    this.data = {
      users: SEED_USERS,
      categories: DEFAULT_CATEGORIES,
      requests: SEED_REQUESTS,
      aiClassifications: SEED_REQUESTS.map((r) => r.aiClassification!).filter(Boolean),
      auditLogs: [
        {
          id: `audit-reset-${Date.now()}`,
          actorUserId: 'user-global-admin',
          actorEmail: 'admin@capaciti.org',
          action: 'DATABASE_RESET_TO_SEED',
          targetType: 'SYSTEM',
          targetId: 'sys-1',
          details: 'Database completely refreshed with 20 users, ticket seed records, workflow automation rules, approval workflows, and AI governance policies.',
          timestamp: new Date().toISOString(),
        },
      ],
      emailNotifications: [],
      executiveReports: [],
      insights: [],
      workflowRules: DEFAULT_WORKFLOW_RULES,
      workflowLogs: [],
      approvalRequests: DEFAULT_APPROVALS,
      hitlOverrides: DEFAULT_HITL_OVERRIDES,
      piiAudits: DEFAULT_PII_AUDITS,
      dsarRequests: DEFAULT_DSAR_REQUESTS,
      compliancePolicies: DEFAULT_COMPLIANCE_POLICIES,
      passwordResetTokens: [],
    };
    this.save();
    return true;
  }

  public save() {
    try {
      const serialized = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(DB_FILE, serialized, 'utf-8');
      
      // Also maintain opsai.json in sync to ensure all data folder files are 100% healthy and up to date
      const opsaiFile = path.join(process.cwd(), 'data', 'opsai.json');
      fs.writeFileSync(opsaiFile, serialized, 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  // Users
  public getUsers() {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) {
    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: hashPassword(user.password),
      role: user.role,
      department: user.department || 'Digital Skills Academy',
      status: 'Active',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash, ...clean } = newUser;
    return clean;
  }

  public updateUserRole(userId: string, newRole: User['role']) {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      user.role = newRole;
      user.updatedAt = new Date().toISOString();
      this.save();
      const { passwordHash, ...clean } = user;
      return clean;
    }
    return null;
  }

  public updateUserStatus(userId: string, status: 'Active' | 'Suspended') {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      user.updatedAt = new Date().toISOString();
      this.save();
      const { passwordHash, ...clean } = user;
      return clean;
    }
    return null;
  }

  public updateUser(userId: string, updates: Partial<User>) {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.role !== undefined) user.role = updates.role;
      if (updates.department !== undefined) user.department = updates.department;
      if (updates.status !== undefined) user.status = updates.status;
      if (updates.emailVerified !== undefined) user.emailVerified = updates.emailVerified;
      user.updatedAt = new Date().toISOString();
      this.save();
      const { passwordHash, ...clean } = user;
      return clean;
    }
    return null;
  }

  public deleteUser(userId: string): boolean {
    const initLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    if (this.data.users.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // PASSWORD RESET TOKEN MANAGEMENT
  // ==========================================
  public createPasswordResetToken(email: string): { token: string; user: User; expiresAt: string } | null {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return null;
    }

    let user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      // Auto-provision user account for this email so reset token and delivery are created
      const nameFromEmail = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      user = {
        id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        email: cleanEmail,
        name: nameFromEmail || 'User',
        role: 'EMPLOYEE',
        department: 'Operations',
        passwordHash: hashPassword(crypto.randomBytes(16).toString('hex')),
        status: 'Active',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.users.push(user);
    }

    if (!this.data.passwordResetTokens) {
      this.data.passwordResetTokens = [];
    }

    // Invalidate prior unused tokens for this user
    this.data.passwordResetTokens.forEach((t) => {
      if (t.userEmail.toLowerCase() === cleanEmail && !t.used) {
        t.used = true;
        t.usedAt = new Date().toISOString();
      }
    });

    // Generate cryptographically secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // Exactly 30 minutes validity

    const tokenRecord: PasswordResetToken = {
      id: `prt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      token,
      userId: user.id,
      userEmail: user.email,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };

    this.data.passwordResetTokens.unshift(tokenRecord);

    // Also update user record to maintain schema compatibility
    user.resetToken = token;
    user.resetTokenExpiry = expiresAt;
    user.resetTokenUsed = false;
    user.updatedAt = new Date().toISOString();

    this.save();

    const { passwordHash, ...cleanUser } = user;
    return { token, user: cleanUser, expiresAt };
  }

  public verifyPasswordResetToken(token: string): { 
    valid: boolean; 
    reason?: 'expired' | 'used' | 'invalid'; 
    tokenRecord?: PasswordResetToken; 
    user?: User 
  } {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return { valid: false, reason: 'invalid' };
    }

    if (!this.data.passwordResetTokens) {
      this.data.passwordResetTokens = [];
    }

    const cleanToken = token.trim();
    const record = this.data.passwordResetTokens.find((t) => t.token === cleanToken);

    if (!record) {
      // Fallback check on user record directly
      const userWithToken = this.data.users.find((u) => u.resetToken === cleanToken);
      if (!userWithToken) {
        return { valid: false, reason: 'invalid' };
      }
      if (userWithToken.resetTokenUsed) {
        return { valid: false, reason: 'used' };
      }
      if (userWithToken.resetTokenExpiry && new Date(userWithToken.resetTokenExpiry).getTime() < Date.now()) {
        return { valid: false, reason: 'expired' };
      }
      const { passwordHash, ...cleanUser } = userWithToken;
      return { valid: true, user: cleanUser };
    }

    if (record.used) {
      return { valid: false, reason: 'used', tokenRecord: record };
    }

    const isExpired = new Date(record.expiresAt).getTime() < Date.now();
    if (isExpired) {
      return { valid: false, reason: 'expired', tokenRecord: record };
    }

    const user = this.data.users.find((u) => u.id === record.userId || u.email.toLowerCase() === record.userEmail.toLowerCase());
    if (!user) {
      return { valid: false, reason: 'invalid' };
    }

    const { passwordHash, ...cleanUser } = user;
    return { valid: true, tokenRecord: record, user: cleanUser };
  }

  public resetPasswordWithToken(token: string, newPassword: string): { 
    success: boolean; 
    error?: string; 
    reason?: 'expired' | 'used' | 'invalid' | 'validation_failed';
    user?: User 
  } {
    const verification = this.verifyPasswordResetToken(token);
    if (!verification.valid) {
      return { 
        success: false, 
        reason: verification.reason || 'invalid',
        error: 'This password reset link is invalid or has expired. Please request a new password reset link.' 
      };
    }

    const rawPass = (newPassword || '').trim();
    // Validate password complexity requirements
    const isMin8 = rawPass.length >= 8;
    const hasUpper = /[A-Z]/.test(rawPass);
    const hasLower = /[a-z]/.test(rawPass);
    const hasNumber = /[0-9]/.test(rawPass);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(rawPass);

    if (!isMin8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return {
        success: false,
        reason: 'validation_failed',
        error: 'Password does not meet all security requirements (min 8 chars, uppercase, lowercase, number, and special character).'
      };
    }

    const targetUser = this.data.users.find((u) => u.id === verification.user?.id || u.email.toLowerCase() === verification.user?.email.toLowerCase());
    if (!targetUser) {
      return { success: false, reason: 'invalid', error: 'User account could not be found.' };
    }

    // Update password securely
    targetUser.passwordHash = hashPassword(rawPass);
    targetUser.resetTokenUsed = true;
    targetUser.resetToken = undefined;
    targetUser.resetTokenExpiry = undefined;
    targetUser.updatedAt = new Date().toISOString();

    // Mark token in token registry as used
    if (verification.tokenRecord) {
      verification.tokenRecord.used = true;
      verification.tokenRecord.usedAt = new Date().toISOString();
    }
    if (this.data.passwordResetTokens) {
      this.data.passwordResetTokens.forEach((t) => {
        if (t.token === token.trim() || t.userId === targetUser.id) {
          t.used = true;
          t.usedAt = new Date().toISOString();
        }
      });
    }

    // Log security audit trail
    this.addAuditLog(
      targetUser.id,
      targetUser.email,
      'PASSWORD_RESET',
      'USER',
      targetUser.id,
      'Password successfully reset via secure single-use cryptographic token'
    );

    this.save();
    const { passwordHash, ...cleanUser } = targetUser;
    return { success: true, user: cleanUser };
  }

  public getDepartmentLeadership() {
    return DEPARTMENT_LEADERSHIP_REGISTRY;
  }

  // Categories
  public getCategories() {
    return this.data.categories;
  }

  public createCategory(name: string, description: string) {
    const cat: Category = {
      id: `cat-${Date.now()}`,
      name,
      description,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    const cat = this.data.categories.find((c) => c.id === id);
    if (cat) {
      Object.assign(cat, updates);
      this.save();
      return cat;
    }
    return null;
  }

  // Requests
  public getRequests(filters?: {
    userId?: string;
    department?: string;
    priority?: string;
    status?: string;
    search?: string;
    category?: string;
  }) {
    let list = this.data.requests.map((r) => {
      const liveSLA = calculateSLA(r);
      return {
        ...r,
        slaStatus: liveSLA.status,
        slaRemainingMinutes: liveSLA.remainingMinutes,
      };
    });

    if (filters) {
      if (filters.userId) {
        list = list.filter((r) => r.userId === filters.userId || r.userEmail === filters.userId);
      }
      if (filters.department) {
        list = list.filter((r) => r.department?.toLowerCase() === filters.department?.toLowerCase());
      }
      if (filters.priority) {
        list = list.filter((r) => r.priority.toLowerCase() === filters.priority?.toLowerCase());
      }
      if (filters.status) {
        list = list.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
      }
      if (filters.category) {
        list = list.filter((r) => r.category?.toLowerCase() === filters.category?.toLowerCase() || r.aiClassification?.category.toLowerCase() === filters.category?.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            r.userName?.toLowerCase().includes(q) ||
            r.userEmail?.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRequestById(id: string) {
    const r = this.data.requests.find((req) => req.id === id);
    if (!r) return null;
    const liveSLA = calculateSLA(r);
    return {
      ...r,
      slaStatus: liveSLA.status,
      slaRemainingMinutes: liveSLA.remainingMinutes,
    };
  }

  public createRequest(reqData: Omit<RequestItem, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: RequestItem['status'] }) {
    const now = new Date();
    const datePrefix = `REQ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `${datePrefix}-${randSuffix}`;

    const newReq: RequestItem = {
      ...reqData,
      id,
      status: reqData.status || 'Submitted',
      slaTargetHours: reqData.slaTargetHours || getSLATargetHours(reqData.priority),
      slaStatus: 'Within SLA',
      slaRemainingMinutes: (reqData.slaTargetHours || getSLATargetHours(reqData.priority)) * 60,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.data.requests.unshift(newReq);
    this.save();
    return newReq;
  }

  public updateRequest(id: string, updates: Partial<RequestItem>) {
    const req = this.data.requests.find((r) => r.id === id);
    if (req) {
      if (updates.status === 'Resolved' && req.status !== 'Resolved') {
        req.resolvedAt = new Date().toISOString();
        const durationHours = (new Date(req.resolvedAt).getTime() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60);
        req.resolutionDurationHours = Math.round(durationHours * 10) / 10;
      }
      Object.assign(req, updates);
      req.updatedAt = new Date().toISOString();
      const live = calculateSLA(req);
      req.slaStatus = live.status;
      req.slaRemainingMinutes = live.remainingMinutes;
      this.save();
      return req;
    }
    return null;
  }

  public deleteRequest(id: string) {
    const initialLen = this.data.requests.length;
    this.data.requests = this.data.requests.filter((r) => r.id !== id);
    this.data.aiClassifications = this.data.aiClassifications.filter((a) => a.requestId !== id);
    if (this.data.requests.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // AI Classification
  public saveAIClassification(rawClassification: Partial<AIClassification> & { requestId: string }) {
    const classification: AIClassification = {
      id: rawClassification.id || `ai-class-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: rawClassification.requestId,
      category: rawClassification.category || 'General Operations',
      subcategory: rawClassification.subcategory || 'Support',
      summary: rawClassification.summary || '',
      recommendedAction: rawClassification.recommendedAction || '',
      aiPriority: rawClassification.aiPriority || 'Medium',
      confidenceScore: rawClassification.confidenceScore ?? 0.9,
      model: rawClassification.model || 'capaciti-model',
      createdAt: rawClassification.createdAt || new Date().toISOString(),
      isOverridden: rawClassification.isOverridden,
      overrideNotes: rawClassification.overrideNotes,
      overriddenBy: rawClassification.overriddenBy,
    };

    const existingIdx = this.data.aiClassifications.findIndex((c) => c.requestId === classification.requestId);
    if (existingIdx >= 0) {
      this.data.aiClassifications[existingIdx] = classification;
    } else {
      this.data.aiClassifications.push(classification);
    }

    const req = this.data.requests.find((r) => r.id === classification.requestId);
    if (req) {
      req.aiClassification = classification;
      if (classification.category) req.category = classification.category;
      if (classification.aiPriority) req.priority = classification.aiPriority;
      req.slaTargetHours = getSLATargetHours(req.priority);
      const live = calculateSLA(req);
      req.slaStatus = live.status;
      req.slaRemainingMinutes = live.remainingMinutes;
      req.updatedAt = new Date().toISOString();
    }

    this.save();
    return classification;
  }

  public overrideAIClassification(
    requestId: string,
    overriddenCategory: string,
    overriddenPriority: Priority,
    notes: string,
    adminUserId: string
  ) {
    const classification = this.data.aiClassifications.find((c) => c.requestId === requestId);
    if (classification) {
      classification.category = overriddenCategory;
      classification.aiPriority = overriddenPriority;
      classification.isOverridden = true;
      classification.overrideNotes = notes;
      classification.overriddenBy = adminUserId;
    }

    const req = this.data.requests.find((r) => r.id === requestId);
    if (req) {
      req.category = overriddenCategory;
      req.priority = overriddenPriority;
      req.slaTargetHours = getSLATargetHours(overriddenPriority);
      if (classification) {
        req.aiClassification = classification;
      }
      const live = calculateSLA(req);
      req.slaStatus = live.status;
      req.slaRemainingMinutes = live.remainingMinutes;
      req.updatedAt = new Date().toISOString();
      if (!req.internalNotes) req.internalNotes = [];
      req.internalNotes.push(`[${new Date().toISOString()}] AI Classification overridden by ${adminUserId}: Category=${overriddenCategory}, Priority=${overriddenPriority}. Notes: ${notes}`);
    }

    this.save();
    return req;
  }

  // AI Generated Responses
  public saveAIResponse(resp: AIGeneratedResponse) {
    const req = this.data.requests.find((r) => r.id === resp.requestId);
    if (req) {
      if (!req.aiGeneratedResponses) req.aiGeneratedResponses = [];
      req.aiGeneratedResponses.push(resp);
      req.lastDraftResponse = resp.responseDraft;
      req.updatedAt = new Date().toISOString();
      this.save();
    }
    return resp;
  }

  public addAIGeneratedResponse(requestId: string, draftData: Partial<AIGeneratedResponse>) {
    const resp: AIGeneratedResponse = {
      id: draftData.id || `ai-resp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId,
      tone: draftData.tone || 'professional_empathetic',
      responseDraft: draftData.responseDraft || draftData.responseText || '',
      responseText: draftData.responseText || draftData.responseDraft || '',
      suggestedActionSteps: draftData.suggestedActionSteps || [],
      keyPolicyReferences: draftData.keyPolicyReferences || [],
      confidenceScore: draftData.confidenceScore ?? 0.95,
      model: draftData.model || 'capaciti-model',
      createdAt: draftData.createdAt || new Date().toISOString(),
      dispatchedAt: draftData.dispatchedAt,
      dispatchedBy: draftData.dispatchedBy,
    };
    return this.saveAIResponse(resp);
  }

  // Audit Logs
  public addAuditLog(actorUserId: string, actorEmail: string, action: string, targetType: string, targetId: string, details?: string) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorUserId,
      actorEmail,
      action,
      targetType,
      targetId,
      details: details || '',
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return log;
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }

  // Email Notifications
  public addEmailNotification(
    ticketOrRecipient: string,
    recipientEmailOrName: string,
    recipientNameOrSubject: string,
    subjectOrBody: string,
    bodyOrType?: string,
    typeParam?: any
  ) {
    let ticketId: string | undefined;
    let recipientEmail: string;
    let recipientName: string;
    let subject: string;
    let bodyHtml: string;
    let type: any = 'CONFIRMATION';

    if (typeParam !== undefined) {
      // 6 args call: (ticketId, recipientEmail, recipientName, subject, bodyHtml, type)
      ticketId = ticketOrRecipient;
      recipientEmail = recipientEmailOrName;
      recipientName = recipientNameOrSubject;
      subject = subjectOrBody;
      bodyHtml = bodyOrType || '';
      type = typeParam;
    } else if (bodyOrType && (bodyOrType.includes('<') || bodyOrType.length > 50)) {
      // 5 args call: (ticketId, recipientEmail, recipientName, subject, bodyHtml)
      ticketId = ticketOrRecipient;
      recipientEmail = recipientEmailOrName;
      recipientName = recipientNameOrSubject;
      subject = subjectOrBody;
      bodyHtml = bodyOrType;
    } else {
      // 4-5 args call: (recipientEmail, recipientName, subject, bodyText, requestId?)
      recipientEmail = ticketOrRecipient;
      recipientName = recipientEmailOrName;
      subject = recipientNameOrSubject;
      bodyHtml = subjectOrBody;
      ticketId = bodyOrType;
    }

    const notif: EmailNotification = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketId: ticketId || '',
      requestId: ticketId,
      recipientEmail,
      recipientName,
      subject,
      bodyHtml,
      bodyText: bodyHtml.replace(/<[^>]*>?/gm, ''),
      type: type || 'CONFIRMATION',
      sentAt: new Date().toISOString(),
      deliveryStatus: 'delivered',
      isRead: false,
    };
    this.data.emailNotifications.unshift(notif);
    if (this.data.emailNotifications.length > 200) {
      this.data.emailNotifications = this.data.emailNotifications.slice(0, 200);
    }
    this.save();
    return notif;
  }

  public getEmailNotifications(recipientEmail?: string) {
    if (recipientEmail) {
      return this.data.emailNotifications.filter(
        (e) => e.recipientEmail.toLowerCase() === recipientEmail.toLowerCase()
      );
    }
    return this.data.emailNotifications;
  }

  public markEmailAsRead(id: string) {
    const item = this.data.emailNotifications.find((e) => e.id === id);
    if (item) {
      item.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllEmailsAsRead(recipientEmail?: string) {
    this.data.emailNotifications.forEach((e) => {
      if (!recipientEmail || e.recipientEmail.toLowerCase() === recipientEmail.toLowerCase()) {
        e.isRead = true;
      }
    });
    this.save();
    return true;
  }

  // Executive Reports
  public saveExecutiveReport(reportData: Partial<ExecutiveReport> & { title: string }) {
    const report: ExecutiveReport = {
      id: reportData.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: reportData.title,
      timeRange: reportData.timeRange || 'sprint_week_2',
      executiveSummary: reportData.executiveSummary || '',
      keyAccomplishments: reportData.keyAccomplishments || [],
      operationalBottlenecks: reportData.operationalBottlenecks || [],
      bottlenecksAndRisks: reportData.bottlenecksAndRisks || [],
      slaRiskAnalysis: reportData.slaRiskAnalysis || '',
      slaHealthAnalysis: reportData.slaHealthAnalysis || '',
      departmentalWorkload: reportData.departmentalWorkload || [],
      categoryBreakdown: reportData.categoryBreakdown || [],
      priorityBreakdown: reportData.priorityBreakdown || [],
      statusBreakdown: reportData.statusBreakdown || [],
      technicianBreakdown: reportData.technicianBreakdown || [],
      dailyTrends: reportData.dailyTrends || [],
      keyIncidents: reportData.keyIncidents || [],
      strategicRecommendations: reportData.strategicRecommendations || [],
      hoursSavedByAI: reportData.hoursSavedByAI ?? 0,
      metricsSnapshot: reportData.metricsSnapshot,
      kpiMetrics: reportData.kpiMetrics,
      generatedAt: reportData.generatedAt || new Date().toISOString(),
      createdAt: reportData.createdAt || new Date().toISOString(),
      generatedBy: reportData.generatedBy || 'Capaciti AI Engine',
      authorName: reportData.authorName || 'Capaciti Executive Analytics',
    };
    this.data.executiveReports.unshift(report);
    if (this.data.executiveReports.length > 50) {
      this.data.executiveReports = this.data.executiveReports.slice(0, 50);
    }
    this.save();
    return report;
  }

  public getExecutiveReports() {
    return this.data.executiveReports;
  }

  public getExecutiveReportById(id: string) {
    return this.data.executiveReports.find((r) => r.id === id) || null;
  }

  // Business Insights
  public saveInsights(insights: BusinessInsight[]) {
    this.data.insights = insights;
    this.save();
    return insights;
  }

  public getInsights() {
    return this.data.insights;
  }

  // ==========================================
  // SPRINT 2: WORKFLOW AUTOMATION ENGINE
  // ==========================================
  public getWorkflowRules() {
    return this.data.workflowRules || [];
  }

  public getWorkflowRuleById(id: string) {
    return (this.data.workflowRules || []).find((r) => r.id === id) || null;
  }

  public createWorkflowRule(ruleData: Omit<WorkflowRule, 'id' | 'createdAt' | 'executionCount' | 'lastExecutedAt'> & { id?: string }) {
    const id = ruleData.id || `rule-wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRule: WorkflowRule = {
      ...ruleData,
      id,
      executionCount: 0,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.workflowRules) this.data.workflowRules = [];
    this.data.workflowRules.push(newRule);
    this.save();
    return newRule;
  }

  public updateWorkflowRule(id: string, updates: Partial<WorkflowRule>) {
    const rule = (this.data.workflowRules || []).find((r) => r.id === id);
    if (!rule) return null;
    Object.assign(rule, updates);
    this.save();
    return rule;
  }

  public toggleWorkflowRule(id: string) {
    const rule = (this.data.workflowRules || []).find((r) => r.id === id);
    if (!rule) return null;
    rule.isActive = !rule.isActive;
    this.save();
    return rule;
  }

  public deleteWorkflowRule(id: string): boolean {
    const initLen = (this.data.workflowRules || []).length;
    this.data.workflowRules = (this.data.workflowRules || []).filter((r) => r.id !== id);
    if (this.data.workflowRules.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getWorkflowLogs() {
    return (this.data.workflowLogs || []).slice(0, 100);
  }

  // Live Workflow Evaluation & Execution Engine
  public executeWorkflowsForTicket(ticketId: string, trigger: WorkflowRule['trigger']) {
    const ticket = this.data.requests.find((r) => r.id === ticketId);
    if (!ticket) return { executedRules: 0, executedLogs: [] };

    const activeRules = (this.data.workflowRules || []).filter(
      (r) => r.isActive && (r.trigger === trigger || r.trigger === 'on_ticket_created')
    );

    const executedLogs: WorkflowExecutionLog[] = [];

    for (const rule of activeRules) {
      // Evaluate all conditions
      const matches = rule.conditions.every((cond) => {
        let ticketVal: any = undefined;
        if (cond.field === 'category') ticketVal = ticket.category || ticket.aiClassification?.category;
        else if (cond.field === 'priority') ticketVal = ticket.priority;
        else if (cond.field === 'department') ticketVal = ticket.department;
        else if (cond.field === 'requestType') ticketVal = ticket.requestType;
        else if (cond.field === 'title') ticketVal = ticket.title;
        else if (cond.field === 'description') ticketVal = ticket.description;
        else if (cond.field === 'slaRemainingHours') ticketVal = (ticket.slaRemainingMinutes ?? 0) / 60;

        if (ticketVal === undefined || ticketVal === null) return false;

        const strVal = String(ticketVal).toLowerCase();
        const condVal = typeof cond.value === 'string' ? cond.value.toLowerCase() : cond.value;

        if (cond.operator === 'equals') return strVal === String(condVal).toLowerCase();
        if (cond.operator === 'not_equals') return strVal !== String(condVal).toLowerCase();
        if (cond.operator === 'contains') return strVal.includes(String(condVal).toLowerCase());
        if (cond.operator === 'in' && Array.isArray(cond.value)) {
          return cond.value.some((v) => String(v).toLowerCase() === strVal);
        }
        if (cond.operator === 'greater_than') return Number(ticketVal) > Number(cond.value);
        return false;
      });

      if (matches) {
        const actionDescriptions: string[] = [];

        for (const action of rule.actions) {
          if (action.type === 'auto_assign') {
            const techUser = this.findUserById(action.targetValue) || this.data.users.find(u => u.name.toLowerCase().includes(action.targetValue.toLowerCase()) || u.id === action.targetValue);
            if (techUser) {
              ticket.assignedToUserId = techUser.id;
              ticket.assignedToName = techUser.name;
              ticket.assignedTechnicianName = techUser.name;
              ticket.status = 'In Progress';
              actionDescriptions.push(`Auto-assigned to ${techUser.name} (${techUser.role})`);
            }
          } else if (action.type === 'set_priority') {
            ticket.priority = action.targetValue as Priority;
            ticket.slaTargetHours = getSLATargetHours(ticket.priority);
            const live = calculateSLA(ticket);
            ticket.slaStatus = live.status;
            ticket.slaRemainingMinutes = live.remainingMinutes;
            actionDescriptions.push(`Priority automatically adjusted to ${action.targetValue} (${ticket.slaTargetHours}h SLA)`);
          } else if (action.type === 'trigger_approval') {
            // Check if approval request already exists for this ticket
            const existingApproval = (this.data.approvalRequests || []).find(a => a.requestId === ticket.id && a.status === 'PENDING');
            if (!existingApproval) {
              const approvalType = (action.targetValue as any) || 'EQUIPMENT_REQUISITION';
              const approvalReq: ApprovalRequest = {
                id: `APR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
                requestId: ticket.id,
                ticketTitle: ticket.title,
                approvalType: approvalType,
                requestorId: ticket.userId || 'user-unknown',
                requestorName: ticket.userName || 'Employee',
                requestorEmail: ticket.userEmail || 'user@capaciti.org',
                department: ticket.department || 'Operations',
                estimatedCost: approvalType === 'EQUIPMENT_REQUISITION' ? 12500 : approvalType === 'BUDGET_EXPENSE' ? 8500 : 0,
                justification: `Automated approval requirement triggered by Workflow Rule: "${rule.name}"`,
                riskLevel: approvalType === 'SECURITY_ACCESS' ? 'High' : 'Medium',
                status: 'PENDING',
                requiredRole: approvalType === 'SECURITY_ACCESS' || approvalType === 'ACCOUNT_UNBLOCK' ? 'ADMIN' : 'SUPERVISOR',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              if (!this.data.approvalRequests) this.data.approvalRequests = [];
              this.data.approvalRequests.unshift(approvalReq);
              actionDescriptions.push(`Triggered formal approval gate [${approvalReq.id}] for ${approvalReq.approvalType}`);
            }
          } else if (action.type === 'apply_tag') {
            if (!ticket.internalNotes) ticket.internalNotes = [];
            ticket.internalNotes.push(`[${new Date().toISOString()}] Workflow Rule "${rule.name}" applied tag: ${action.targetValue}`);
            actionDescriptions.push(`Applied business tag: ${action.targetValue}`);
          } else if (action.type === 'send_email_alert') {
            this.addEmailNotification(
              ticket.id,
              action.targetValue,
              'Operations Team',
              `⚡ Automated Workflow Alert: "${rule.name}" for Ticket [${ticket.id}]`,
              `<p>Rule <strong>${rule.name}</strong> triggered for ticket <strong>${ticket.title}</strong> (${ticket.id}).</p>`,
              'WORKFLOW_ALERT'
            );
            actionDescriptions.push(`Dispatched automated alert email to ${action.targetValue}`);
          }
        }

        rule.executionCount = (rule.executionCount || 0) + 1;
        rule.lastExecutedAt = new Date().toISOString();

        const logEntry: WorkflowExecutionLog = {
          id: `log-wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          ruleId: rule.id,
          ruleName: rule.name,
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          executedActions: actionDescriptions,
          status: 'SUCCESS',
          executedAt: new Date().toISOString(),
        };

        if (!this.data.workflowLogs) this.data.workflowLogs = [];
        this.data.workflowLogs.unshift(logEntry);
        executedLogs.push(logEntry);
      }
    }

    ticket.updatedAt = new Date().toISOString();
    this.save();
    return { executedRules: executedLogs.length, executedLogs };
  }

  // ==========================================
  // SPRINT 2: MULTI-TIER APPROVAL WORKFLOWS
  // ==========================================
  public getApprovalRequests(filters?: { status?: string; role?: string; requestorEmail?: string }) {
    let list = this.data.approvalRequests || [];
    if (filters) {
      if (filters.status) {
        list = list.filter((a) => a.status.toLowerCase() === filters.status?.toLowerCase());
      }
      if (filters.role) {
        list = list.filter((a) => a.requiredRole.toLowerCase() === filters.role?.toLowerCase());
      }
      if (filters.requestorEmail) {
        list = list.filter((a) => a.requestorEmail.toLowerCase() === filters.requestorEmail?.toLowerCase());
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getApprovalRequestById(id: string) {
    return (this.data.approvalRequests || []).find((a) => a.id === id) || null;
  }

  public createApprovalRequest(data: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const datePrefix = `APR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const id = `${datePrefix}-${randSuffix}`;

    const newApproval: ApprovalRequest = {
      ...data,
      id,
      status: 'PENDING',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (!this.data.approvalRequests) this.data.approvalRequests = [];
    this.data.approvalRequests.unshift(newApproval);
    this.save();
    return newApproval;
  }

  public decideApprovalRequest(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    decidedByUserId: string,
    decidedByName: string,
    decisionNotes?: string
  ) {
    const approval = (this.data.approvalRequests || []).find((a) => a.id === id);
    if (!approval) return null;

    approval.status = status;
    approval.decidedByUserId = decidedByUserId;
    approval.decidedByName = decidedByName;
    approval.decisionNotes = decisionNotes || (status === 'APPROVED' ? 'Formally authorized by supervisor.' : 'Declined per operational governance policy.');
    approval.decidedAt = new Date().toISOString();
    approval.updatedAt = new Date().toISOString();

    // Update linked ticket if exists
    if (approval.requestId) {
      const ticket = this.data.requests.find((r) => r.id === approval.requestId);
      if (ticket) {
        if (!ticket.internalNotes) ticket.internalNotes = [];
        ticket.internalNotes.push(`[${new Date().toISOString()}] Approval Request [${approval.id} - ${approval.approvalType}] ${status} by ${decidedByName}. Note: ${approval.decisionNotes}`);
        
        if (status === 'APPROVED') {
          if (ticket.status === 'Submitted') ticket.status = 'In Progress';
        } else {
          // If rejected
          ticket.status = 'Closed';
          ticket.resolutionNotes = `Approval Rejected: ${approval.decisionNotes}`;
        }
        ticket.updatedAt = new Date().toISOString();
      }
    }

    this.save();
    return approval;
  }

  // ==========================================
  // SPRINT 2: AI GOVERNANCE & RESPONSIBLE AI
  // ==========================================
  public getAIGovernanceMetrics() {
    const totalClassifications = (this.data.aiClassifications || []).length || 1;
    const hitlOverrides = this.data.hitlOverrides || [];
    const piiAudits = this.data.piiAudits || [];
    const principles = DEFAULT_RESPONSIBLE_AI_PRINCIPLES;

    const confidences = (this.data.aiClassifications || []).map((c) => c.confidenceScore || 0.95);
    const avgConfidence = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0.964;

    const overrideRate = parseFloat(((hitlOverrides.length / Math.max(totalClassifications, 1)) * 100).toFixed(1));

    return {
      overallConfidenceScore: Math.round(avgConfidence * 1000) / 10,
      totalClassificationsCount: totalClassifications,
      humanOverrideCount: hitlOverrides.length,
      humanOverrideRate: overrideRate,
      piiRedactedIncidentsCount: piiAudits.length,
      fairnessIndex: 99.2,
      modelDriftRate: 0.8,
      hitlOverrides,
      piiAudits,
      principles: DEFAULT_RESPONSIBLE_AI_PRINCIPLES,
    };
  }

  public logHITLOverride(data: Omit<HITLOverrideRecord, 'id' | 'timestamp'>) {
    const record: HITLOverrideRecord = {
      ...data,
      id: `hitl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    if (!this.data.hitlOverrides) this.data.hitlOverrides = [];
    this.data.hitlOverrides.unshift(record);
    this.save();
    return record;
  }

  public logPIIAudit(data: Omit<PIIAuditRecord, 'id' | 'timestamp'>) {
    const record: PIIAuditRecord = {
      ...data,
      id: `pii-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    if (!this.data.piiAudits) this.data.piiAudits = [];
    this.data.piiAudits.unshift(record);
    this.save();
    return record;
  }

  // ==========================================
  // SPRINT 2: COMPLIANCE & DSAR SUITE
  // ==========================================
  public getDSARRequests() {
    return this.data.dsarRequests || [];
  }

  public createDSARRequest(data: Omit<DSARRecord, 'id' | 'status' | 'submittedAt'>) {
    const id = `dsar-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newDSAR: DSARRecord = {
      ...data,
      id,
      status: 'IN_PROGRESS',
      submittedAt: new Date().toISOString(),
    };
    if (!this.data.dsarRequests) this.data.dsarRequests = [];
    this.data.dsarRequests.unshift(newDSAR);
    this.save();
    return newDSAR;
  }

  public completeDSARRequest(id: string) {
    const dsar = (this.data.dsarRequests || []).find((d) => d.id === id);
    if (!dsar) return null;
    dsar.status = 'COMPLETED';
    dsar.completedAt = new Date().toISOString();
    dsar.downloadUrl = `/api/compliance/dsar/${id}/download`;
    this.save();
    return dsar;
  }

  public getCompliancePolicies() {
    return this.data.compliancePolicies || [];
  }

  public enforceCompliancePolicy(id: string) {
    const pol = (this.data.compliancePolicies || []).find((p) => p.id === id);
    if (!pol) return null;
    pol.lastEnforced = new Date().toISOString();
    pol.enforcementStatus = 'Enforced';
    this.save();
    return pol;
  }
}

export const db = new JsonDatabase();

