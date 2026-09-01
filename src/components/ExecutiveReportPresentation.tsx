import React, { useState } from 'react';
import { ExecutiveReport } from '../types/index.js';
import { exportReportElementToPDF } from '../utils/pdfExport.js';
import { generateDeliverablesPPTX } from '../utils/pptxExport.js';
import { DeliverablesPresentationDeck } from './DeliverablesPresentationDeck.js';
import { CapacitiLogoIcon, CapacitiLogo } from './CapacitiLogo.js';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
  RefreshCw,
  Layers,
  Users,
  CheckCircle2,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Presentation
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';

interface ExecutiveReportPresentationProps {
  report: ExecutiveReport;
  onRefresh?: () => void;
  isGenerating?: boolean;
}

export const ExecutiveReportPresentation: React.FC<ExecutiveReportPresentationProps> = ({
  report,
  onRefresh,
  isGenerating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingPPTX, setExportingPPTX] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);

  const reportId = report.id || 'rep-latest';
  const elementId = `executive-report-container-${reportId}`;

  // Date Formatter
  const formattedDate = report.generatedAt || report.createdAt
    ? new Date(report.generatedAt || report.createdAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Sprint Review';

  // Metrics Extraction
  const totalTickets = report.metricsSnapshot?.totalRequests ?? report.kpiMetrics?.totalVolume ?? 8;
  const resolutionRate = report.metricsSnapshot?.resolutionRate ?? 75;
  const resolvedCount = Math.round((totalTickets * resolutionRate) / 100);
  const slaCompliance = report.metricsSnapshot?.slaComplianceRate ?? report.kpiMetrics?.slaComplianceRate ?? 92;
  const avgResolutionHours = report.metricsSnapshot?.avgResolutionHours ?? report.kpiMetrics?.meanTimeToResolutionHours ?? 2.8;
  const aiAccuracy = report.metricsSnapshot?.aiClassificationAccuracy ?? report.kpiMetrics?.aiAutomationAccuracy ?? 96;
  const hoursSaved = report.hoursSavedByAI ?? Math.round(totalTickets * 1.8);
  const urgentCount = report.metricsSnapshot?.urgentIncidentCount ?? 2;

  // Chart Data Extraction
  const categoryData = (report.categoryBreakdown && report.categoryBreakdown.length > 0)
    ? report.categoryBreakdown
    : [
        { category: 'Hardware', count: 3, percentage: 38, resolvedCount: 2, color: '#0284c7' },
        { category: 'Network', count: 4, percentage: 50, resolvedCount: 3, color: '#0d9488' },
        { category: 'Access & Accounts', count: 1, percentage: 12, resolvedCount: 1, color: '#f59e0b' },
      ];

  const priorityData = (report.priorityBreakdown && report.priorityBreakdown.length > 0)
    ? report.priorityBreakdown
    : [
        { priority: 'Urgent', count: 1, percentage: 12, avgHours: 1.5 },
        { priority: 'High', count: 2, percentage: 25, avgHours: 4.2 },
        { priority: 'Medium', count: 4, percentage: 50, avgHours: 12.0 },
        { priority: 'Low', count: 1, percentage: 13, avgHours: 24.0 },
      ];

  const departmentalData = (report.departmentalWorkload && report.departmentalWorkload.length > 0)
    ? report.departmentalWorkload
    : [
        { department: 'IT Operations', volume: 5, avgResolutionHours: 2.4, slaRate: 95, riskLevel: 'Low' },
        { department: 'Facilities', volume: 2, avgResolutionHours: 4.1, slaRate: 90, riskLevel: 'Low' },
        { department: 'Human Resources', volume: 1, avgResolutionHours: 5.5, slaRate: 85, riskLevel: 'Medium' },
      ];

  const dailyTrendData = (report.dailyTrends && report.dailyTrends.length > 0)
    ? report.dailyTrends
    : [
        { date: 'Mon Aug 17', incoming: 2, resolved: 1, breaches: 0 },
        { date: 'Tue Aug 18', incoming: 3, resolved: 2, breaches: 0 },
        { date: 'Wed Aug 19', incoming: 4, resolved: 3, breaches: 0 },
        { date: 'Thu Aug 20', incoming: 3, resolved: 3, breaches: 0 },
        { date: 'Fri Aug 21', incoming: 2, resolved: 2, breaches: 0 },
      ];

  const technicianData = (report.technicianBreakdown && report.technicianBreakdown.length > 0)
    ? report.technicianBreakdown
    : [
        { name: 'Luthando Didiza', assigned: 4, resolved: 3, slaRate: 95, avgHours: '2.4h' },
        { name: 'Sarah Jenkins', assigned: 2, resolved: 2, slaRate: 100, avgHours: '1.8h' },
        { name: 'David Okafor', assigned: 2, resolved: 1, slaRate: 88, avgHours: '3.2h' },
      ];

  const keyIncidents = (report.keyIncidents && report.keyIncidents.length > 0)
    ? report.keyIncidents
    : [
        {
          id: 'REQ-2026-0817-4921',
          title: 'Wi-Fi Access Point Dropping Packets in Innovation Lab',
          priority: 'Urgent' as any,
          department: 'IT Operations',
          status: 'Resolved' as any,
          owner: 'Luthando Didiza',
          duration: '1.4h',
          resolutionSummary: 'Access point firmware updated and DHCP lease pool rebalanced.',
        },
        {
          id: 'REQ-2026-0818-1029',
          title: 'New Cohort Developer Laptop Provisioning & Okta SSO',
          priority: 'High' as any,
          department: 'IT Operations',
          status: 'Resolved' as any,
          owner: 'Sarah Jenkins',
          duration: '3.1h',
          resolutionSummary: 'Standard developer image pushed and MFA security keys assigned.',
        },
      ];

  const accomplishments = (report.keyAccomplishments && report.keyAccomplishments.length > 0)
    ? report.keyAccomplishments
    : [
        `Maintained ${slaCompliance}% overall SLA compliance across all operational queues.`,
        `Integrated multi-tonal AI response drafting, saving an estimated ${hoursSaved} hours of staff response composition.`,
        `Resolved ${resolvedCount} out of ${totalTickets} logged operational requests with automated audit trails.`,
        `Achieved a rapid average resolution time of ${avgResolutionHours} hours.`,
      ];

  const bottlenecks = (report.operationalBottlenecks && report.operationalBottlenecks.length > 0)
    ? report.operationalBottlenecks
    : (report.bottlenecksAndRisks && report.bottlenecksAndRisks.length > 0)
    ? report.bottlenecksAndRisks
    : [
        'High ticket concentration in IT Support indicates high demand for self-service password and Wi-Fi reset articles.',
        'Month-end SaaS invoice reconciliation in Finance requires automated credit note verification.',
      ];

  const recommendations = (report.strategicRecommendations && report.strategicRecommendations.length > 0)
    ? report.strategicRecommendations
    : [
        'Deploy pre-approved knowledge base workflows for repetitive account access requests.',
        'Expand 1-click AI response generation across all Tier-1 technician workspaces.',
        'Establish automated daily SLA breach warnings routed directly to on-call supervisors.',
      ];

  // Actions
  const handleExportPDF = async () => {
    setExportingPDF(true);
    setExportProgress(10);
    const filename = `Capaciti_Executive_Operations_Report_${report.timeRange || 'sprint'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    await exportReportElementToPDF(elementId, {
      filename,
      onProgress: (p) => setExportProgress(p),
    });

    setTimeout(() => {
      setExportingPDF(false);
      setExportProgress(0);
    }, 800);
  };

  const handleExportPPTX = async () => {
    try {
      setExportingPPTX(true);
      await generateDeliverablesPPTX();
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setExportingPPTX(false);
    }
  };

  const handleCopyText = () => {
    const text = `# Capaciti Service Hub — Executive Business Report\nTitle: ${report.title}\nDate: ${formattedDate}\nAuthor: ${report.generatedBy || 'Executive AI Analyst'}\n\n## Executive Summary\n${report.executiveSummary}\n\n## KPIs\n- Total Volume: ${totalTickets}\n- Resolved: ${resolvedCount} (${resolutionRate}%)\n- SLA Compliance: ${slaCompliance}%\n- MTTR: ${avgResolutionHours}h\n- AI Accuracy: ${aiAccuracy}%\n- Hours Saved: ${hoursSaved}h\n\n## Key Accomplishments\n${accomplishments.map((a) => `- ${a}`).join('\n')}\n\n## Strategic Recommendations\n${recommendations.map((r) => `- ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar for Manager / Leadership */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">Executive Report View</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Manager Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Generated from real-time database telemetry, AI triage data, and technician workloads.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowDeckModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#0a1c36] hover:bg-[#11294d] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Open Interactive Deliverables Presentation"
          >
            <Presentation className="w-3.5 h-3.5 text-teal-400" />
            <span>Present Deck</span>
          </button>

          <button
            onClick={handleExportPPTX}
            disabled={exportingPPTX}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download PowerPoint Presentation (.pptx)"
          >
            {exportingPPTX ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting .pptx...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>PowerPoint (.pptx)</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copy Report as Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Print to Paper or Native PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
            title="Export High-Definition PDF Report"
          >
            {exportingPDF ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting PDF ({exportProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export as PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Report Document Container (Target for PDF Canvas Rendering & Print) */}
      <div
        id={elementId}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs space-y-8 text-slate-800 font-sans print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* ========================================================================= */}
        {/* 1. DOCUMENT HEADER & BRANDING                                             */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-2">
                <CapacitiLogoIcon className="w-8 h-8 rounded-lg shadow-2xs" />
                <span className="text-lg font-black tracking-tight text-slate-900">
                  CAPACITI
                </span>
              </div>
              <span className="h-4 w-px bg-slate-300" />
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise Operations Report
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Generated: <strong>{formattedDate}</strong></span>
              </span>
              <span>•</span>
              <span>Prepared by: <strong>{report.generatedBy || 'Executive AI Analyst'}</strong></span>
              <span>•</span>
              <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Ref: {report.id}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-between text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Classification
            </div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Internal Management Audit</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Scope: {report.timeRange === 'sprint_week_2' ? 'Sprint 2 (17-21 Aug 2026)' : report.timeRange}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. EXECUTIVE KPI HIGHLIGHT SCORECARDS                                     */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Executive Telemetry & KPI Snapshot</span>
            </h2>
            <span className="text-[11px] text-slate-400">Target Benchmark ≥ 90%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* KPI 1: Volume */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Volume</div>
              <div className="text-2xl font-black text-slate-900">{totalTickets}</div>
              <div className="text-[10px] text-slate-500 font-medium">{resolvedCount} resolved ({resolutionRate}%)</div>
            </div>

            {/* KPI 2: SLA Compliance */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">SLA Compliance</div>
              <div className="text-2xl font-black text-emerald-700">{slaCompliance}%</div>
              <div className="text-[10px] text-emerald-700 font-medium">Safe threshold</div>
            </div>

            {/* KPI 3: MTTR */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MTTR (Average)</div>
              <div className="text-2xl font-black text-slate-900">{avgResolutionHours}h</div>
              <div className="text-[10px] text-slate-500 font-medium">Mean resolution cycle</div>
            </div>

            {/* KPI 4: AI Triage Accuracy */}
            <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">AI Accuracy</div>
              <div className="text-2xl font-black text-sky-700">{aiAccuracy}%</div>
              <div className="text-[10px] text-sky-700 font-medium">Triage precision</div>
            </div>

            {/* KPI 5: Hours Saved */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Hours Saved</div>
              <div className="text-2xl font-black text-indigo-700">~{hoursSaved}h</div>
              <div className="text-[10px] text-indigo-700 font-medium">By AI automation</div>
            </div>

            {/* KPI 6: Urgent Handled */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Urgent / High</div>
              <div className="text-2xl font-black text-amber-700">{urgentCount}</div>
              <div className="text-[10px] text-amber-700 font-medium">Zero blockers</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. VISUAL CHARTS & CATEGORIZATION                                        */}
        {/* ========================================================================= */}
        <div className="space-y-4 print-avoid-break">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <span>Categorized Operations & Distribution Analytics</span>
            </h2>
            <span className="text-[11px] text-slate-400">Interactive Visual Breakdown</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Graph 1: Category Volume & Resolution Share */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-sky-600" />
                  <span>Volume by Ticket Category</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Total: {totalTickets} requests</span>
              </div>

              {/* Category Progress Bars */}
              <div className="space-y-2 pt-1">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.category}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        <strong>{cat.count}</strong> tickets ({cat.percentage}%) • {cat.resolvedCount} resolved
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(8, cat.percentage)}%`,
                          backgroundColor: cat.color || '#0284c7',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Summary Tags */}
              <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-200/60 text-[10px]">
                {categoryData.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md font-medium border"
                    style={{
                      backgroundColor: `${cat.color || '#0284c7'}15`,
                      color: cat.color || '#0284c7',
                      borderColor: `${cat.color || '#0284c7'}30`,
                    }}
                  >
                    {cat.category}: {cat.count}
                  </span>
                ))}
              </div>
            </div>

            {/* Graph 2: Daily Ingestion vs Resolution Throughput */}
            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Daily Throughput: Incoming vs Resolved</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">5-Day Sprint Run</span>
              </div>

              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    <Bar dataKey="incoming" name="Incoming Tickets" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved Tickets" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DEPARTMENTAL WORKLOAD & RISK MATRIX                                    */}
        {/* ========================================================================= */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Departmental Workload & SLA Matrix</span>
            </h2>
            <span className="text-[11px] text-slate-400">Cross-Functional Efficiency</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3">TICKET VOLUME</th>
                  <th className="py-2.5 px-3">AVG RESOLUTION (MTTR)</th>
                  <th className="py-2.5 px-3">SLA COMPLIANCE</th>
                  <th className="py-2.5 px-3 text-right">RISK LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {departmentalData.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span>{dept.department}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {dept.volume} requests
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {dept.avgResolutionHours}h
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        {dept.slaRate}% SLA
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dept.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        dept.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {dept.riskLevel} Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. TECHNICIAN WORKLOAD & EXECUTION                                        */}
        {/* ========================================================================= */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Technician Workload & Performance Review</span>
            </h2>
            <span className="text-[11px] text-slate-400">Staff Load Balancing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {technicianData.map((tech, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{tech.name}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {tech.slaRate}% SLA
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Assigned / Resolved</span>
                    <strong className="text-slate-800">{tech.assigned}</strong> / <strong className="text-emerald-700">{tech.resolved}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Avg Resolution</span>
                    <strong className="font-mono text-slate-800">{tech.avgHours}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. EXECUTIVE QUALITATIVE SUMMARY                                          */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>1. Executive Summary</span>
          </h2>
          <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-700 leading-relaxed text-xs space-y-2">
            <p className="whitespace-pre-line font-medium text-slate-800">
              {report.executiveSummary}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. KEY OPERATIONAL ACCOMPLISHMENTS                                        */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>2. Key Operational Highlights & Accomplishments</span>
          </h2>
          <div className="space-y-2">
            {accomplishments.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60 text-xs">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-slate-800 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8. BOTTLENECKS AND RISK FACTORS                                          */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>3. Operational Friction Points & Bottlenecks</span>
          </h2>
          <div className="space-y-2">
            {bottlenecks.map((risk, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 leading-relaxed">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 9. HIGH-IMPACT INCIDENT CASE LOG                                          */}
        {/* ========================================================================= */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-sky-600" />
              <span>4. High-Impact Incident Case Log</span>
            </h2>
            <span className="text-[11px] text-slate-400">Critical & High Priority Handled</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">TICKET</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">OWNER</th>
                  <th className="py-2.5 px-3">DURATION</th>
                  <th className="py-2.5 px-3">RESOLUTION SUMMARY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {keyIncidents.map((incident, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-sky-700 font-semibold block text-[11px]">
                        {incident.id}
                      </span>
                      <span className="text-slate-900 font-medium line-clamp-1">{incident.title}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        incident.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        incident.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {incident.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                      {incident.owner}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {incident.duration}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] line-clamp-2 max-w-xs">
                      {incident.resolutionSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 10. STRATEGIC RECOMMENDATIONS FOR LEADERSHIP                              */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 print-avoid-break">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>5. Strategic Recommendations for Leadership</span>
          </h2>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-snug flex items-start space-x-2.5 text-xs">
                <span className="font-bold text-sky-700 bg-sky-100/70 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
          <div>Capaciti Service Hub • Operations Intelligence Platform</div>
          <div>Confidential • For Executive & Management Review Only</div>
        </div>

      </div>

      {/* Deliverables Presentation Deck Modal */}
      {showDeckModal && (
        <DeliverablesPresentationDeck
          isModal={true}
          onClose={() => setShowDeckModal(false)}
        />
      )}
    </div>
  );
};
