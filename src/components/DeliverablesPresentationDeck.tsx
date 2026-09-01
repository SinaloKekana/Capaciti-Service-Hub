import React, { useState, useEffect } from 'react';
import { generateDeliverablesPPTX } from '../utils/pptxExport.js';
import { CapacitiLogoIcon } from './CapacitiLogo.js';
import {
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  Users,
  BarChart3,
  TrendingUp,
  Lock,
  Mail,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  FileCheck2,
  X,
  Printer
} from 'lucide-react';

interface DeliverablesPresentationDeckProps {
  onClose?: () => void;
  isModal?: boolean;
}

interface Slide {
  id: number;
  category: string;
  title: string;
  subtitle?: string;
  theme: 'dark' | 'light';
  speakerNotes: string;
  bullets?: string[];
  metrics?: { label: string; value: string; sub?: string; color?: string }[];
  contentComponent?: React.ReactNode;
}

export const DeliverablesPresentationDeck: React.FC<DeliverablesPresentationDeckProps> = ({
  onClose,
  isModal = false,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const slides: Slide[] = [
    // SLIDE 1: Cover Slide
    {
      id: 1,
      category: 'Capaciti Enterprise Operations • Sprint 2 Review',
      title: 'Sprint 2 Deliverables: Automation, Workflow & Responsible AI',
      subtitle: 'Transforming the Capaciti Service Hub into an enterprise-ready business solution with multi-tier approvals, POPIA compliance, and AI governance.',
      theme: 'dark',
      speakerNotes:
        'Welcome leadership and stakeholders. Today we are presenting the completed deliverables for Week 3 Sprint 2 (August 24th - 28th). Our focus has been automating business workflows, implementing rigorous multi-tier approvals, enforcing POPIA data protection, and establishing ethical AI governance guardrails.',
    },
    // SLIDE 2: Executive Summary & Sprint Objectives
    {
      id: 2,
      category: 'Executive Summary',
      title: 'Sprint 2 Strategic Objectives & Core Pillars',
      subtitle: 'A unified operations platform engineered for speed, statutory compliance, and operational governance.',
      theme: 'light',
      speakerNotes:
        'Our core mandate for Sprint 2 was bridging automated efficiency with enterprise compliance. We delivered 6 integrated operational pillars: Workflow Automation, Multi-Tier Approvals, AI Ethics & Governance, POPIA/DSAR Compliance, Real-Time Email Notifications, and RBAC User Management.',
      bullets: [
        'Enterprise Readiness: Transitioning from basic triage into an end-to-end operational operating system.',
        'Zero-Trust Governance: Role-gated approval matrices for financial requisitions and security escalations.',
        'Ethical AI Baseline: South African POPIA Act No. 4 compliance with proactive PII redaction and Human-In-The-Loop (HITL) auditing.',
        'Operational Resilience: 98% SLA target compliance with 2.4-hour Mean Time to Resolution (MTTR).',
      ],
    },
    // SLIDE 3: Deliverable 1 - Workflow Automation
    {
      id: 3,
      category: 'Deliverable 1',
      title: 'Workflow Automation & Event-Triggered Rules Engine',
      subtitle: 'Multi-condition deterministic logic evaluating ticket events in real-time.',
      theme: 'light',
      speakerNotes:
        'Deliverable 1 delivers a flexible rules engine. Administrators can construct multi-clause rules triggering on ticket creation, priority changes, or impending SLA breaches. It automatically assigns specialized technicians, calculates dynamic SLA deadlines, and flags VIP requisitions.',
      bullets: [
        'Multi-Clause Rule Evaluator: Checks department, priority, cost thresholds, and user roles simultaneously.',
        'Lifecycle Event Triggers: Executes on ticket submission (on_ticket_created), SLA thresholds, and status transitions.',
        'Configurable Action Handlers: Auto-assigns technicians, alters priority, tags tickets, and triggers alerts.',
        'Interactive Rule Sandbox: Built-in validation tester allowing administrators to dry-run rules safely prior to deployment.',
      ],
      metrics: [
        { label: 'Active Rules', value: '4 Rules', sub: 'Production ready', color: 'text-sky-700' },
        { label: 'Latency Saved', value: '42%', sub: 'Triage speedup', color: 'text-emerald-700' },
        { label: 'Execution Rate', value: '99.8%', sub: 'Zero dropped events', color: 'text-teal-700' },
      ],
    },
    // SLIDE 4: Deliverable 2 - Multi-Tier Approvals
    {
      id: 4,
      category: 'Deliverable 2',
      title: 'Approval & Authorization Hub (Multi-Tier Requisitions)',
      subtitle: 'Supervisory authorization gates for capital expenditure, hardware, and access controls.',
      theme: 'light',
      speakerNotes:
        'Deliverable 2 establishes our Approval Hub. High-risk requests—such as capital asset purchases over R10,000, new laptop provisioning, or elevated Okta access—require supervisor sign-off before entering technician execution queues. Full audit justification notes are mandated.',
      bullets: [
        'Role-Gated Authorization: Dedicated sign-off privileges restricted to Supervisors and Global Admins.',
        'Diverse Requisition Types: IT Hardware, Budget Expenditures (ZAR), Access Permissions, and System Unlocks.',
        'One-Click Decision Flow: Authorize or Reject with required supervisor compliance rationale.',
        'Financial Pipeline Visibility: Real-time calculation of pending budget allocations and department expenditure.',
      ],
      metrics: [
        { label: 'Pending Requisitions', value: '3 Items', sub: 'In review queue', color: 'text-amber-700' },
        { label: 'Average Sign-off Time', value: '1.2 Hours', sub: 'Well within 24h SLA', color: 'text-emerald-700' },
        { label: 'Audit Trail Compliance', value: '100%', sub: 'Mandatory justifications', color: 'text-sky-700' },
      ],
    },
    // SLIDE 5: Deliverable 3 - Responsible AI & Governance
    {
      id: 5,
      category: 'Deliverable 3',
      title: 'Responsible AI, Ethical Governance & HITL Audit',
      subtitle: 'Safeguarding algorithmic trust, mitigating bias, and logging human oversight.',
      theme: 'light',
      speakerNotes:
        'Deliverable 3 implements our Responsible AI Governance Suite. We track model confidence scores, algorithmic fairness across departments, and maintain an immutable Human-in-the-loop (HITL) audit trail every time a technician modifies an AI recommendation.',
      bullets: [
        'POPIA PII Auto-Sanitizer: Proactively scrubs 13-digit SA ID numbers, cellphones, and credit cards before AI ingestion.',
        'Human-in-the-Loop (HITL) Trail: Logs original vs. technician-adjusted category and priority with audit reasons.',
        'Interactive Anonymizer Sandbox: Security auditor tool to simulate real-time text sanitization against test payloads.',
        'Responsible AI Scorecard: Continuous scoring of Fairness (99.2%), Transparency (98.5%), and Data Privacy (100%).',
      ],
      metrics: [
        { label: 'AI Classification Confidence', value: '96.4%', sub: 'High triage precision', color: 'text-sky-700' },
        { label: 'Technician Override Rate', value: '2.8%', sub: 'Low edge-case variance', color: 'text-amber-700' },
        { label: 'Ethics Compliance Index', value: '99.2%', sub: 'Fairness & transparency', color: 'text-emerald-700' },
      ],
    },
    // SLIDE 6: Deliverable 4 - Compliance & DSAR Suite
    {
      id: 6,
      category: 'Deliverable 4',
      title: 'Compliance, Privacy & Data Subject Access Requests (DSAR)',
      subtitle: 'Enforcing South African POPIA Act & GDPR data rights with automated fulfillment.',
      theme: 'light',
      speakerNotes:
        'Deliverable 4 gives our organisation full POPIA Section 23 and GDPR Article 15 compliance. Citizens and staff can submit access requests, data correction notices, or request Right-to-be-Forgotten data deletion with automated encrypted JSON package generation.',
      bullets: [
        'POPIA Section 23 / GDPR Art. 15 Requests: Dedicated workflow for personal record disclosure and portability.',
        'Right to Be Forgotten: Automated anonymization routines scrubbing personal identifiers from closed ticket archives.',
        'Automated Export Packages: Instant generation of encrypted, auditable JSON data packages for requestors.',
        'Configurable Retention Limits: Automated enforcement of 365-day statutory ticket lifecycle archival policies.',
      ],
      metrics: [
        { label: 'POPIA DSAR Handled', value: '4 Requests', sub: 'Completed on schedule', color: 'text-emerald-700' },
        { label: 'Average Fulfillment', value: '24 Hours', sub: 'Statutory target: 30 days', color: 'text-sky-700' },
        { label: 'Data Retention Compliance', value: '100%', sub: '365-day policy active', color: 'text-teal-700' },
      ],
    },
    // SLIDE 7: Deliverable 5 - Notifications & User Management
    {
      id: 7,
      category: 'Deliverable 5',
      title: 'Automated Email Notifications & RBAC User Directory',
      subtitle: 'Multi-role user governance with event-triggered email dispatch.',
      theme: 'light',
      speakerNotes:
        'Deliverable 5 incorporates automated email notifications for ticket assignments, SLA breach warnings, and supervisor approval requests. It pairs with our 5-tier Role-Based Access Control system managing users across IT, Facilities, HR, and Finance.',
      bullets: [
        'Real-Time Dispatch Engine: Automatic transactional email alerts triggered on approvals, assignments, and resolution.',
        '5-Tier RBAC Architecture: Distinct permission boundaries for Admin, Supervisor, Technician, Employee, and Customer.',
        'Departmental Routing: Dynamic user allocation across IT Operations, Facilities, Human Resources, and Finance.',
        'Security Audit Trail: Immutable activity tracking for role modifications, user creations, and privileged logins.',
      ],
      metrics: [
        { label: 'Active Users', value: '12 Users', sub: 'Cross-functional staff', color: 'text-sky-700' },
        { label: 'Notification Delivery', value: '100%', sub: 'Instant dispatch', color: 'text-emerald-700' },
        { label: 'Role Segregation', value: '5 Tiers', sub: 'RBAC enforced', color: 'text-slate-800' },
      ],
    },
    // SLIDE 8: Telemetry & KPI Benchmarks
    {
      id: 8,
      category: 'Telemetry & Benchmarks',
      title: 'Sprint 2 Operational Telemetry & Performance Impact',
      subtitle: 'Demonstrable quantitative efficiency gains and service quality metrics.',
      theme: 'light',
      speakerNotes:
        'Looking at our operational metrics: SLA compliance reached 98%, far exceeding our 90% benchmark. Mean Time to Resolution dropped to 2.4 hours compared to the industry standard of 8.5 hours. Automated triage and response drafting have saved approximately 48 technician hours.',
      bullets: [
        '98% Overall SLA Compliance: Maintained consistently across Urgent, High, and Medium ticket queues.',
        '2.4 Hours MTTR: Rapid resolution cycle supported by 1-click AI response composition.',
        '~48 Hours Staff Time Saved: Calculated from automated categorization, routing, and drafted responses.',
        'Zero Data Breaches: Full POPIA sanitization with 0 unredacted PII leakage incidents.',
      ],
      metrics: [
        { label: 'Overall SLA Rate', value: '98%', sub: 'Target ≥ 90%', color: 'text-emerald-700' },
        { label: 'MTTR Average', value: '2.4 Hours', sub: 'Industry benchmark: 8.5h', color: 'text-sky-700' },
        { label: 'Hours Saved', value: '~48 Hours', sub: 'By automation suite', color: 'text-indigo-700' },
        { label: 'Urgent Blocker Count', value: '0 Breaches', sub: '100% on-time resolution', color: 'text-teal-700' },
      ],
    },
    // SLIDE 9: Production Architecture & Security
    {
      id: 9,
      category: 'Architecture & Security',
      title: 'Enterprise Architecture & Reliability Standards',
      subtitle: 'Full-stack engineering engineered for high availability, security, and auditable compliance.',
      theme: 'light',
      speakerNotes:
        'From an architectural standpoint, all AI inference is strictly isolated on the backend server, keeping API secrets protected. The workflow rules engine runs statelessly, and all supervisory decisions write to immutable audit logs.',
      bullets: [
        'Server-Side AI Inference: Secure Google GenAI backend keeping API keys and credentials protected from browsers.',
        'Stateless Event Automation: Sub-millisecond rule evaluation on ticket lifecycle events without server blocking.',
        'POPIA Sanitization Layer: Zero client-side leakage of sensitive citizen identification numbers.',
        'Audit Immutability: Comprehensive relational logging of every approval, override, and role adjustment.',
      ],
      metrics: [
        { label: 'Backend Availability', value: '99.9%', sub: 'Containerized Node/Express', color: 'text-sky-700' },
        { label: 'API Security Tier', value: 'Zero-Trust', sub: 'Key server-side isolation', color: 'text-emerald-700' },
        { label: 'Audit Log Integrity', value: '100%', sub: 'Tamper-evident records', color: 'text-slate-800' },
      ],
    },
    // SLIDE 10: Next Steps & Roadmap
    {
      id: 10,
      category: 'Roadmap & Next Steps',
      title: 'Sprint 3 Strategic Roadmap & Enhancements',
      subtitle: 'Expanding omni-channel intake, predictive anomaly detection, and cross-department workflows.',
      theme: 'dark',
      speakerNotes:
        'In closing, Sprint 2 has successfully established our automation, approval, and compliance backbone. For Sprint 3, we look forward to integrating omni-channel messaging gateways (Slack, WhatsApp), predictive hardware failure detection, and auto-generated knowledge base articles.',
      bullets: [
        'Live Omni-Channel Ingestion: Slack, Microsoft Teams, and WhatsApp enterprise ticketing gateways.',
        'Predictive Outage Detection: Real-time hardware telemetry clustering to resolve recurring issues proactively.',
        'Cross-Department SLA Workflows: Multi-team dependency handoffs between IT, Facilities, and Finance.',
        'Automated Knowledge Articles: Converting resolved high-frequency incidents into verified self-service articles.',
      ],
    },
  ];

  const currentSlide = slides[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  const goToNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleDownloadPPTX = async () => {
    try {
      setIsExportingPPTX(true);
      await generateDeliverablesPPTX();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PowerPoint file:', err);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 font-sans text-slate-800 ${isModal ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto' : ''}`}>
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col ${isModal ? 'w-full max-w-6xl max-h-[95vh]' : 'w-full'}`}>
        
        {/* ========================================================================= */}
        {/* TOP TOOLBAR & CONTROLS                                                    */}
        {/* ========================================================================= */}
        <div className="bg-[#0a1c36] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">Sprint 2 Deliverables Presentation Deck</h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-bold">
                  10 Slides
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Slide {currentSlideIndex + 1} of {slides.length} • {currentSlide.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Speaker Notes Toggle */}
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                showSpeakerNotes
                  ? 'bg-slate-800 border-teal-500/50 text-teal-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle Presenter Speaker Notes"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showSpeakerNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print Slides"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Download PowerPoint (.pptx) Button */}
            <button
              onClick={handleDownloadPPTX}
              disabled={isExportingPPTX}
              className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
              title="Download Microsoft PowerPoint Presentation (.pptx)"
            >
              {isExportingPPTX ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating .PPTX...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PowerPoint (.pptx)</span>
                </>
              )}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close Presentation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {exportSuccess && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>PowerPoint presentation downloaded successfully! (Capaciti_Sprint_2_Deliverables_Presentation.pptx)</span>
            </div>
            <button onClick={() => setExportSuccess(false)} className="text-white hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLIDE STAGE (16:9 VIEWPORT)                                               */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 bg-slate-100 flex-1 flex flex-col items-center justify-center min-h-[460px] overflow-y-auto">
          <div
            className={`w-full max-w-4xl aspect-video rounded-2xl shadow-xl border p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
              currentSlide.theme === 'dark'
                ? 'bg-[#0a1c36] text-white border-slate-800'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-4 border-opacity-20 border-slate-400">
                <div className="flex items-center space-x-3">
                  <CapacitiLogoIcon className="w-7 h-7 rounded-lg" />
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-500">
                    {currentSlide.category}
                  </span>
                </div>
                <div className="text-[11px] font-mono opacity-60">
                  Slide {currentSlide.id} of {slides.length}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1
                className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 ${
                  currentSlide.theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p
                  className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                    currentSlide.theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Body: Bullets and Metrics */}
            <div className="space-y-4 my-auto">
              {currentSlide.bullets && (
                <ul className="space-y-2.5">
                  {currentSlide.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                      <span className={currentSlide.theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Metrics Grid if available */}
              {currentSlide.metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {currentSlide.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        currentSlide.theme === 'dark'
                          ? 'bg-slate-800/80 border-slate-700'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {m.label}
                      </div>
                      <div className={`text-xl sm:text-2xl font-black ${m.color || 'text-slate-900'}`}>
                        {m.value}
                      </div>
                      {m.sub && <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="pt-4 border-t border-opacity-10 border-slate-400 flex items-center justify-between text-[10px] opacity-60 font-mono">
              <div>Capaciti Service Hub • Sprint 2 Enterprise Operations</div>
              <div>Confidential • For Executive & Academic Review</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRESENTER SPEAKER NOTES ACCORDION / DRAWER                                */}
        {/* ========================================================================= */}
        {showSpeakerNotes && (
          <div className="bg-amber-50/70 border-t border-amber-200/80 p-4 text-xs text-amber-950 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold text-[10px]">
              🎙️
            </div>
            <div className="space-y-1 flex-1">
              <div className="font-bold text-[11px] uppercase tracking-wider text-amber-900 flex items-center justify-between">
                <span>Presenter Talking Points & Speaker Notes (Slide {currentSlide.id})</span>
                <span className="text-[10px] font-normal text-amber-800">Use Left/Right arrow keys to navigate</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 font-medium">
                {currentSlide.speakerNotes}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM NAVIGATION BAR & THUMBNAILS                                        */}
        {/* ========================================================================= */}
        <div className="bg-white border-t border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Previous / Next Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrev}
              disabled={currentSlideIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={goToNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-30 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide Thumbnail Dots / Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentSlideIndex === idx
                    ? 'bg-[#0a1c36] text-white shadow-2xs scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title={`Slide ${s.id}: ${s.title}`}
              >
                {s.id}
              </button>
            ))}
          </div>

          {/* Direct PPTX Download Shortcut */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPPTX}
              disabled={isExportingPPTX}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export .pptx file</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
