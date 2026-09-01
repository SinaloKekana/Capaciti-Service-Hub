import pptxgen from 'pptxgenjs';

export interface DeliverablesSlideData {
  title: string;
  subtitle?: string;
  category?: string;
  bulletPoints?: string[];
  metrics?: { label: string; value: string; sub?: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  callout?: string;
  speakerNotes?: string;
}

export async function generateDeliverablesPPTX(customData?: DeliverablesSlideData[]) {
  const pres = new pptxgen();

  // Configure Presentation
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Capaciti Service Hub - Sprint 2 Deliverables Presentation';
  pres.company = 'Capaciti';
  pres.subject = 'Sprint 2: Workflow Automation, Multi-Tier Approvals & Responsible AI Governance';

  // Capaciti Enterprise Brand Colors
  const NAVY = '0A1C36';
  const BLUE = '0284C7';
  const TEAL = '0D9488';
  const SLATE = '1E293B';
  const LIGHT_BG = 'F8FAFC';
  const CARD_BG = 'FFFFFF';
  const MUTED = '64748B';
  const ACCENT_EMERALD = '10B981';
  const ACCENT_AMBER = 'F59E0B';

  // SLIDE 1: Title Slide (Dark Branded Cover)
  const slide1 = pres.addSlide();
  slide1.background = { color: NAVY };

  // Decorative header band
  slide1.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.15,
    fill: { color: TEAL },
  });

  // Category Tag
  slide1.addText('CAPACITI ENTERPRISE OPERATIONS PLATFORM • SPRINT 2 DELIVERABLES', {
    x: 1.0,
    y: 1.6,
    w: 11.33,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: TEAL,
    bold: true,
    charSpacing: 2,
  });

  // Main Title
  slide1.addText('Workflow Automation, Multi-Tier Approvals\n& Responsible AI Governance', {
    x: 1.0,
    y: 2.2,
    w: 11.33,
    h: 1.8,
    fontSize: 28,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
    lineSpacing: 34,
  });

  // Subtitle / Executive Overview
  slide1.addText(
    'Comprehensive review of enterprise service workflows, supervisory requisition sign-offs, POPIA compliance, and responsible AI guardrails.',
    {
      x: 1.0,
      y: 4.2,
      w: 10.5,
      h: 0.8,
      fontSize: 14,
      fontFace: 'Arial',
      color: '94A3B8',
    }
  );

  // Presenter Footer
  slide1.addText('Presented by: Executive Engineering Team  |  Date: August 2026  |  Classification: Executive Review', {
    x: 1.0,
    y: 6.2,
    w: 11.33,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    color: '64748B',
  });

  // SLIDE 2: Executive Summary & Sprint Objectives
  const slide2 = pres.addSlide();
  slide2.background = { color: LIGHT_BG };
  addSlideHeader(slide2, 'Executive Summary', 'Sprint 2 Strategic Objectives & Core Milestones');

  slide2.addText(
    'Sprint 2 accelerates the Capaciti Service Hub from intelligent triage into a fully automated, compliant, and auditable operations platform.',
    {
      x: 0.8,
      y: 1.6,
      w: 11.73,
      h: 0.6,
      fontSize: 13,
      fontFace: 'Arial',
      color: SLATE,
      italic: true,
    }
  );

  // 3 Pillar Cards
  const pillars = [
    {
      title: '1. Intelligent Workflows',
      desc: 'Multi-condition trigger engine automating ticket routing, priority escalations, technician assignments, and SLA breach mitigation.',
      color: BLUE,
    },
    {
      title: '2. Multi-Tier Approvals',
      desc: 'Governance gates for capital expenditures, equipment requisitions, and privileged security credentials with supervisor audit trails.',
      color: TEAL,
    },
    {
      title: '3. Responsible AI & POPIA',
      desc: 'POPIA/GDPR data protection sandbox, Human-In-The-Loop (HITL) overrides, and active algorithmic bias scorecards.',
      color: ACCENT_EMERALD,
    },
  ];

  pillars.forEach((p, idx) => {
    const xPos = 0.8 + idx * 4.0;
    slide2.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: 2.4,
      w: 3.73,
      h: 4.2,
      fill: { color: CARD_BG },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.1,
    });

    slide2.addShape(pres.ShapeType.rect, {
      x: xPos,
      y: 2.4,
      w: 3.73,
      h: 0.1,
      fill: { color: p.color },
    });

    slide2.addText(p.title, {
      x: xPos + 0.3,
      y: 2.8,
      w: 3.13,
      h: 0.5,
      fontSize: 16,
      fontFace: 'Arial',
      color: SLATE,
      bold: true,
    });

    slide2.addText(p.desc, {
      x: xPos + 0.3,
      y: 3.5,
      w: 3.13,
      h: 2.8,
      fontSize: 12,
      fontFace: 'Arial',
      color: MUTED,
      lineSpacing: 18,
    });
  });

  // SLIDE 3: Deliverable 1 - Workflow Automation Engine
  const slide3 = pres.addSlide();
  slide3.background = { color: LIGHT_BG };
  addSlideHeader(slide3, 'Deliverable 1', 'Workflow Automation & Event-Triggered Rules Engine');

  const ruleBullets = [
    { text: 'Dynamic Multi-Condition Rules: Evaluates priority, department, SLA limits, estimated costs, and keywords simultaneously.' },
    { text: 'Event Lifecycle Hooks: Automatic execution on ticket creation (on_ticket_created), priority escalation, and SLA breach warnings.' },
    { text: 'Configurable Operational Actions: Auto-assigns specialized technicians, adjusts SLA timers, attaches tags, and generates supervisor alerts.' },
    { text: 'Interactive Rule Sandbox: Built-in testing interface allowing administrators to dry-run rules against mock payloads before activation.' },
  ];

  slide3.addText(ruleBullets, {
    x: 0.8,
    y: 1.8,
    w: 7.2,
    h: 4.8,
    fontSize: 13,
    fontFace: 'Arial',
    color: SLATE,
    lineSpacing: 22,
    bullet: { type: 'bullet', code: '2022' },
  });

  // Metric Callout Box on Right
  slide3.addShape(pres.ShapeType.roundRect, {
    x: 8.4,
    y: 1.8,
    w: 4.13,
    h: 4.8,
    fill: { color: NAVY },
    rectRadius: 0.1,
  });

  slide3.addText('AUTOMATION IMPACT', {
    x: 8.8,
    y: 2.1,
    w: 3.33,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    color: TEAL,
    bold: true,
  });

  slide3.addText('42%', {
    x: 8.8,
    y: 2.5,
    w: 3.33,
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
  });

  slide3.addText('Reduction in manual ticket assignment and triage latency across Tier-1 IT queues.', {
    x: 8.8,
    y: 3.4,
    w: 3.33,
    h: 1.2,
    fontSize: 12,
    fontFace: 'Arial',
    color: 'CBD5E1',
  });

  slide3.addText('Active Production Rules: 4\nExecution Reliability: 99.8%', {
    x: 8.8,
    y: 4.8,
    w: 3.33,
    h: 1.4,
    fontSize: 11,
    fontFace: 'Arial',
    color: TEAL,
    bold: true,
  });

  // SLIDE 4: Deliverable 2 - Executive Requisition & Multi-Tier Approvals
  const slide4 = pres.addSlide();
  slide4.background = { color: LIGHT_BG };
  addSlideHeader(slide4, 'Deliverable 2', 'Executive Requisition & Multi-Tier Authorization Gates');

  const approvalBullets = [
    { text: 'Role-Gated Authorization: Dedicated sign-off privileges reserved strictly for Operations Managers (SUPERVISOR) and Global Admins.' },
    { text: 'Categorized Requisition Types: IT Equipment purchases, high-value expense budgets (ZAR), elevated security access, and account unblocking.' },
    { text: 'One-Click Decision Workflow: Direct Authorize / Decline actions coupled with mandatory supervisor compliance audit justification notes.' },
    { text: 'Financial Governance: Real-time tracking of pending capital expenditure pipelines against operational department budgets.' },
  ];

  slide4.addText(approvalBullets, {
    x: 0.8,
    y: 1.8,
    w: 7.2,
    h: 4.8,
    fontSize: 13,
    fontFace: 'Arial',
    color: SLATE,
    lineSpacing: 22,
    bullet: { type: 'bullet', code: '2022' },
  });

  // Table on Right: Approval Categories
  const approvalTable: pptxgen.TableRow[] = [
    [
      { text: 'Requisition Type', options: { bold: true, fill: { color: 'F1F5F9' } } },
      { text: 'Approver', options: { bold: true, fill: { color: 'F1F5F9' } } },
      { text: 'Max SLA', options: { bold: true, fill: { color: 'F1F5F9' } } },
    ],
    [
      { text: 'Hardware / Laptops' },
      { text: 'Supervisor' },
      { text: '24 Hours' },
    ],
    [
      { text: 'Budget > R10,000' },
      { text: 'Executive Admin' },
      { text: '48 Hours' },
    ],
    [
      { text: 'Elevated Access' },
      { text: 'SecOps Admin' },
      { text: '4 Hours' },
    ],
  ];

  slide4.addTable(approvalTable, {
    x: 8.4,
    y: 1.8,
    w: 4.13,
    h: 3.2,
    colW: [1.8, 1.33, 1.0],
    fill: { color: 'FFFFFF' },
    fontSize: 11,
    fontFace: 'Arial',
    color: SLATE,
    border: { pt: 1, color: 'E2E8F0' },
  });

  // SLIDE 5: Deliverable 3 - Responsible AI & Ethical Model Governance
  const slide5 = pres.addSlide();
  slide5.background = { color: LIGHT_BG };
  addSlideHeader(slide5, 'Deliverable 3', 'Responsible AI, POPIA Sanitization & HITL Governance');

  const aiBullets = [
    { text: 'POPIA / GDPR Real-Time Sanitizer: Proactively detects and redacts 13-digit SA National IDs, phone numbers, and banking details.' },
    { text: 'Human-in-the-Loop (HITL) Audit Trail: Logs every technician override with original vs. corrected classification and audit rationale.' },
    { text: 'Live Anonymization Sandbox: Interactive UI allowing security auditors to test privacy masking pipelines prior to model ingestion.' },
    { text: 'Ethical Principles Scorecard: Standardized compliance dashboard tracking Fairness, Transparency, Privacy, and Model Robustness.' },
  ];

  slide5.addText(aiBullets, {
    x: 0.8,
    y: 1.8,
    w: 6.8,
    h: 4.8,
    fontSize: 13,
    fontFace: 'Arial',
    color: SLATE,
    lineSpacing: 22,
    bullet: { type: 'bullet', code: '2022' },
  });

  // Metric Cards Grid
  const aiStats = [
    { label: 'Model Confidence', value: '96.4%', color: BLUE },
    { label: 'HITL Override Rate', value: '2.8%', color: ACCENT_AMBER },
    { label: 'Fairness Index', value: '99.2%', color: ACCENT_EMERALD },
    { label: 'PII Redacted Incidents', value: '14 Items', color: TEAL },
  ];

  aiStats.forEach((st, idx) => {
    const xPos = 8.0 + (idx % 2) * 2.3;
    const yPos = 1.8 + Math.floor(idx / 2) * 2.2;

    slide5.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 2.1,
      h: 1.9,
      fill: { color: CARD_BG },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.1,
    });

    slide5.addText(st.label, {
      x: xPos + 0.15,
      y: yPos + 0.25,
      w: 1.8,
      h: 0.4,
      fontSize: 10,
      fontFace: 'Arial',
      color: MUTED,
      bold: true,
    });

    slide5.addText(st.value, {
      x: xPos + 0.15,
      y: yPos + 0.75,
      w: 1.8,
      h: 0.8,
      fontSize: 22,
      fontFace: 'Arial',
      color: st.color,
      bold: true,
    });
  });

  // SLIDE 6: Deliverable 4 - Compliance, Privacy & DSAR Automation
  const slide6 = pres.addSlide();
  slide6.background = { color: LIGHT_BG };
  addSlideHeader(slide6, 'Deliverable 4', 'Data Subject Access Requests (DSAR) & POPIA Compliance');

  const complianceBullets = [
    { text: 'POPIA Section 23 & GDPR Article 15 Data Subject Access Requests: End-to-end automated queue for citizen data export requests.' },
    { text: 'Right to Be Forgotten: Automated data erasure routines redacting personal identifiers from closed ticket archives.' },
    { text: 'Automated JSON Archive Generation: Instant creation of encrypted, verifiable subject data packages.' },
    { text: 'Statutory Retention Schedules: Configurable automated retention policies enforcing ticket record anonymization after 365 days.' },
  ];

  slide6.addText(complianceBullets, {
    x: 0.8,
    y: 1.8,
    w: 7.2,
    h: 4.8,
    fontSize: 13,
    fontFace: 'Arial',
    color: SLATE,
    lineSpacing: 22,
    bullet: { type: 'bullet', code: '2022' },
  });

  slide6.addShape(pres.ShapeType.roundRect, {
    x: 8.4,
    y: 1.8,
    w: 4.13,
    h: 4.8,
    fill: { color: 'F1F5F9' },
    line: { color: 'CBD5E1', width: 1 },
    rectRadius: 0.1,
  });

  slide6.addText('STATUTORY FRAMEWORK', {
    x: 8.8,
    y: 2.1,
    w: 3.33,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    color: TEAL,
    bold: true,
  });

  slide6.addText('South Africa POPIA Act No. 4 of 2013\n& EU GDPR Regulation 2016/679', {
    x: 8.8,
    y: 2.6,
    w: 3.33,
    h: 0.8,
    fontSize: 14,
    fontFace: 'Arial',
    color: NAVY,
    bold: true,
  });

  slide6.addText(
    '• Section 23: Right of Access to Personal Records\n• Section 24: Correction or Deletion of Record\n• Section 14: Data Retention Limit Schedules',
    {
      x: 8.8,
      y: 3.6,
      w: 3.33,
      h: 2.6,
      fontSize: 11,
      fontFace: 'Arial',
      color: MUTED,
      lineSpacing: 18,
    }
  );

  // SLIDE 7: Deliverable 5 - Email Notification Subsystem & User Administration
  const slide7 = pres.addSlide();
  slide7.background = { color: LIGHT_BG };
  addSlideHeader(slide7, 'Deliverable 5', 'Automated Email Dispatch & RBAC User Management');

  const notifyBullets = [
    { text: 'Real-Time Notification Dispatch: Automated emails triggered on ticket creation, supervisor approval requests, and workflow status changes.' },
    { text: 'Role-Based Access Control (RBAC): Strict segregation across 5 user tiers: Admin, Supervisor, Technician, Employee, and Customer.' },
    { text: 'Departmental Routing: Dynamic user allocation across IT, Facilities, Human Resources, and Finance divisions.' },
    { text: 'Security Audit Trail: Immutable activity tracking for user permission alterations, account activations, and privileged logins.' },
  ];

  slide7.addText(notifyBullets, {
    x: 0.8,
    y: 1.8,
    w: 7.2,
    h: 4.8,
    fontSize: 13,
    fontFace: 'Arial',
    color: SLATE,
    lineSpacing: 22,
    bullet: { type: 'bullet', code: '2022' },
  });

  // RBAC Visual Hierarchy
  const roles = [
    { name: 'Admin', desc: 'Full System & Policy Control', color: 'EF4444' },
    { name: 'Supervisor', desc: 'Approvals & Workflows', color: 'F59E0B' },
    { name: 'Technician', desc: 'Ticket Execution & Response', color: '0284C7' },
    { name: 'Employee', desc: 'Internal Service Requisitions', color: '10B981' },
  ];

  roles.forEach((r, idx) => {
    const yPos = 1.8 + idx * 1.2;
    slide7.addShape(pres.ShapeType.roundRect, {
      x: 8.4,
      y: yPos,
      w: 4.13,
      h: 1.0,
      fill: { color: CARD_BG },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.08,
    });

    slide7.addText(r.name, {
      x: 8.7,
      y: yPos + 0.15,
      w: 2.0,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: SLATE,
      bold: true,
    });

    slide7.addText(r.desc, {
      x: 8.7,
      y: yPos + 0.5,
      w: 3.5,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      color: MUTED,
    });
  });

  // SLIDE 8: Operational KPI Telemetry & Performance Benchmarks
  const slide8 = pres.addSlide();
  slide8.background = { color: LIGHT_BG };
  addSlideHeader(slide8, 'Performance Metrics', 'Sprint 2 Operational Telemetry & KPI Benchmarks');

  const kpis = [
    { label: 'Overall SLA Compliance', value: '98%', sub: 'Target ≥ 90%', color: ACCENT_EMERALD },
    { label: 'Mean Resolution (MTTR)', value: '2.4 Hours', sub: 'Industry Avg: 8.5h', color: BLUE },
    { label: 'AI Classification Precision', value: '96.4%', sub: 'Automated Triage', color: TEAL },
    { label: 'Technician Time Saved', value: '~48 Hours', sub: 'Via AI & Automation', color: '8B5CF6' },
  ];

  kpis.forEach((k, idx) => {
    const xPos = 0.8 + idx * 3.0;
    slide8.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 2.73,
      h: 2.4,
      fill: { color: CARD_BG },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.1,
    });

    slide8.addText(k.label, {
      x: xPos + 0.2,
      y: 2.0,
      w: 2.33,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: MUTED,
      bold: true,
    });

    slide8.addText(k.value, {
      x: xPos + 0.2,
      y: 2.5,
      w: 2.33,
      h: 0.8,
      fontSize: 24,
      fontFace: 'Arial',
      color: k.color,
      bold: true,
    });

    slide8.addText(k.sub, {
      x: xPos + 0.2,
      y: 3.4,
      w: 2.33,
      h: 0.4,
      fontSize: 10,
      fontFace: 'Arial',
      color: '94A3B8',
    });
  });

  // Bottom Summary Callout
  slide8.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.6,
    w: 11.73,
    h: 2.0,
    fill: { color: NAVY },
    rectRadius: 0.1,
  });

  slide8.addText('SPRINT 2 IMPACT SUMMARY', {
    x: 1.2,
    y: 4.9,
    w: 10.93,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    color: TEAL,
    bold: true,
  });

  slide8.addText(
    'The combination of event-driven automation rules, structured supervisory approval gates, and rigorous POPIA PII protection mechanisms has transitioned the Capaciti Service Hub into an enterprise-grade operational backbone.',
    {
      x: 1.2,
      y: 5.3,
      w: 10.93,
      h: 1.0,
      fontSize: 12,
      fontFace: 'Arial',
      color: 'F1F5F9',
      lineSpacing: 18,
    }
  );

  // SLIDE 9: Production Architecture & Security Guardrails
  const slide9 = pres.addSlide();
  slide9.background = { color: LIGHT_BG };
  addSlideHeader(slide9, 'Architecture & Security', 'Enterprise Architecture & Reliability Standards');

  const archItems = [
    { title: 'Server-Side AI Inference', desc: 'Secure Google GenAI backend keeping secrets and API keys isolated from client browsers.' },
    { title: 'Stateless Event Pipeline', desc: 'Fast, deterministic workflow rule evaluation on ticket lifecycle events.' },
    { title: 'POPIA Data Isolation', desc: 'Automated PII scrubbing ensuring zero leakage of citizen identification numbers.' },
    { title: 'Auditable Data Integrity', desc: 'Immutable action histories for approvals, user changes, and AI calibrations.' },
  ];

  archItems.forEach((a, idx) => {
    const xPos = 0.8 + (idx % 2) * 6.0;
    const yPos = 1.8 + Math.floor(idx / 2) * 2.4;

    slide9.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.73,
      h: 2.1,
      fill: { color: CARD_BG },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.1,
    });

    slide9.addText(a.title, {
      x: xPos + 0.3,
      y: yPos + 0.3,
      w: 5.13,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: SLATE,
      bold: true,
    });

    slide9.addText(a.desc, {
      x: xPos + 0.3,
      y: yPos + 0.8,
      w: 5.13,
      h: 1.0,
      fontSize: 11,
      fontFace: 'Arial',
      color: MUTED,
      lineSpacing: 16,
    });
  });

  // SLIDE 10: Next Steps & Sprint 3 Strategic Roadmap
  const slide10 = pres.addSlide();
  slide10.background = { color: NAVY };

  slide10.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.15,
    fill: { color: TEAL },
  });

  slide10.addText('LOOKING AHEAD', {
    x: 1.0,
    y: 1.4,
    w: 11.33,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: TEAL,
    bold: true,
    charSpacing: 2,
  });

  slide10.addText('Sprint 3 Strategic Roadmap & Enhancements', {
    x: 1.0,
    y: 1.9,
    w: 11.33,
    h: 0.8,
    fontSize: 26,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
  });

  const nextBullets = [
    { text: 'Live Omni-Channel Integrations: Slack, Microsoft Teams, and WhatsApp ticketing gateways.' },
    { text: 'Predictive IT Outage Prevention: Real-time telemetry clustering to identify hardware faults before user escalations.' },
    { text: 'Cross-Department SLA Automation: Enhanced multi-team dependency handoffs and escalating routing trees.' },
    { text: 'Automated Knowledge Article Generation: Converting resolved high-frequency incidents into verified self-service documentation.' },
  ];

  slide10.addText(nextBullets, {
    x: 1.0,
    y: 2.9,
    w: 11.33,
    h: 3.2,
    fontSize: 14,
    fontFace: 'Arial',
    color: 'E2E8F0',
    lineSpacing: 24,
    bullet: { type: 'bullet', code: '2022' },
  });

  slide10.addText('Thank you! Questions & Operational Discussions Welcome.', {
    x: 1.0,
    y: 6.2,
    w: 11.33,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: '94A3B8',
    italic: true,
  });

  // Trigger browser download of .pptx
  const filename = `Capaciti_Sprint_2_Deliverables_Presentation_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pres.writeFile({ fileName: filename });
}

function addSlideHeader(slide: any, category: string, title: string) {
  // Top Category
  slide.addText(`CAPACITI SERVICE HUB • ${category.toUpperCase()}`, {
    x: 0.8,
    y: 0.6,
    w: 11.73,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: '0D9488',
    bold: true,
    charSpacing: 1.5,
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.95,
    w: 11.73,
    h: 0.6,
    fontSize: 20,
    fontFace: 'Arial',
    color: '0A1C36',
    bold: true,
  });

  // Divider Line
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.55,
    w: 11.73,
    h: 0.02,
    fill: { color: 'E2E8F0' },
  });
}

const pres = new pptxgen();
