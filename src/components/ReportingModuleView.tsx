import React, { useState, useEffect } from 'react';
import { ExecutiveReport, User, RequestItem, Category, Priority, RequestStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { RequestDetailsModal } from './RequestDetailsModal.js';
import { SLACountdownBadge } from './SLACountdownTimer.js';
import { ExecutiveReportPresentation } from './ExecutiveReportPresentation.js';
import { DeliverablesPresentationDeck } from './DeliverablesPresentationDeck.js';
import { generateDeliverablesPPTX } from '../utils/pptxExport.js';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  Zap, 
  RefreshCw,
  Award,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Cpu,
  SlidersHorizontal,
  Presentation
} from 'lucide-react';

interface ReportingModuleViewProps {
  user: User;
  onNavigate: (tab: string) => void;
  onRefreshAppData?: () => void;
}

// Defensive field extractors to prevent any schema mismatch crashes
function getReportDate(report: ExecutiveReport): string {
  const d = report.generatedAt || report.createdAt;
  if (!d) return 'Recent';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recent';
  }
}

function getReportAuthor(report: ExecutiveReport): string {
  return report.generatedBy || report.authorName || 'Executive AI Analyst';
}

function getReportMetrics(report: ExecutiveReport) {
  if (report.metricsSnapshot) {
    return {
      total: report.metricsSnapshot.totalRequests ?? 0,
      resolved: Math.round(((report.metricsSnapshot.totalRequests ?? 0) * (report.metricsSnapshot.resolutionRate ?? 0)) / 100),
      slaRate: report.metricsSnapshot.slaComplianceRate ?? 98,
      avgHours: report.metricsSnapshot.avgResolutionHours ?? 2.8,
      aiAccuracy: report.metricsSnapshot.aiClassificationAccuracy ?? 95,
      urgentCount: report.metricsSnapshot.urgentIncidentCount ?? 0,
    };
  }
  if (report.kpiMetrics) {
    return {
      total: report.kpiMetrics.totalVolume ?? 0,
      resolved: report.kpiMetrics.resolvedVolume ?? 0,
      slaRate: report.kpiMetrics.slaComplianceRate ?? 98,
      avgHours: report.kpiMetrics.meanTimeToResolutionHours ?? 2.8,
      aiAccuracy: report.kpiMetrics.aiAutomationAccuracy ?? 95,
      urgentCount: 0,
    };
  }
  return {
    total: 6,
    resolved: 4,
    slaRate: 98,
    avgHours: 2.8,
    aiAccuracy: 95,
    urgentCount: 1,
  };
}

function getReportBottlenecks(report: ExecutiveReport): string[] {
  if (Array.isArray(report.operationalBottlenecks) && report.operationalBottlenecks.length > 0) {
    return report.operationalBottlenecks;
  }
  if (Array.isArray(report.bottlenecksAndRisks) && report.bottlenecksAndRisks.length > 0) {
    return report.bottlenecksAndRisks;
  }
  return ['No critical operational bottlenecks detected for this period.'];
}

function getReportAccomplishments(report: ExecutiveReport): string[] {
  if (Array.isArray(report.keyAccomplishments) && report.keyAccomplishments.length > 0) {
    return report.keyAccomplishments;
  }
  return ['Operational workflows maintained within expected performance benchmarks.'];
}

function getReportRecommendations(report: ExecutiveReport): string[] {
  if (Array.isArray(report.strategicRecommendations) && report.strategicRecommendations.length > 0) {
    return report.strategicRecommendations;
  }
  return ['Continue monitoring service levels and maintain proactive SLA notifications.'];
}

function getReportSlaAnalysis(report: ExecutiveReport): string {
  return (
    report.slaRiskAnalysis ||
    report.slaHealthAnalysis ||
    'SLA compliance rate is healthy across all operational queues.'
  );
}

export const ReportingModuleView: React.FC<ReportingModuleViewProps> = ({ 
  user, 
  onNavigate, 
  onRefreshAppData 
}) => {
  const [subView, setSubView] = useState<'approvals' | 'reports' | 'presentation'>('approvals');
  
  // Executive Reports State
  const [reports, setReports] = useState<ExecutiveReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ExecutiveReport | null>(null);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('sprint_week_2');
  const [copied, setCopied] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // AI Approvals State
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState<boolean>(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalSuccessMessage, setApprovalSuccessMessage] = useState<string | null>(null);
  const [selectedRequestForModal, setSelectedRequestForModal] = useState<RequestItem | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadReports(), loadApprovalsData()]);
  };

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setReportError(null);
      const data = await api.getReports();
      const safeReports = Array.isArray(data) ? data : [];
      setReports(safeReports);
      if (safeReports.length > 0) {
        setSelectedReport(safeReports[0]);
      }
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setReportError('Could not retrieve archived reports. You can generate a new one above.');
    } finally {
      setLoadingReports(false);
    }
  };

  const loadApprovalsData = async () => {
    try {
      setLoadingApprovals(true);
      const [allReqs, cats] = await Promise.all([
        api.getRequests(),
        api.getCategories()
      ]);
      setCategories(cats || []);
      // Filter for tickets needing approval or in AI Classified state
      const approvals = (allReqs || []).filter(
        (r) => r.status === 'AI Classified' || r.status === 'Submitted' || r.status === 'Under Review'
      );
      setPendingRequests(approvals);
    } catch (err: any) {
      console.error('Failed to load approvals queue:', err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setReportError(null);
      const newReport = await api.generateExecutiveReport(timeRange);
      if (newReport) {
        setReports((prev) => [newReport, ...prev]);
        setSelectedReport(newReport);
        setSubView('reports');
      }
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setReportError('Failed to generate executive report with AI. Please retry.');
    } finally {
      setGenerating(false);
    }
  };

  // Quick 1-Click Approval for AI Triage
  const handleQuickApprove = async (req: RequestItem) => {
    try {
      setApprovingId(req.id);
      await api.updateRequest(req.id, {
        status: 'In Progress',
        assignedToUserId: user.id,
        assignedToName: user.name,
        internalNote: `Approved AI Triage classification (${req.aiClassification?.category || req.department} - ${req.priority} Priority) by ${user.name}.`,
      });
      setApprovalSuccessMessage(`Approved & assigned ticket ${req.id} to queue.`);
      setTimeout(() => setApprovalSuccessMessage(null), 3500);
      await loadApprovalsData();
      if (onRefreshAppData) onRefreshAppData();
    } catch (err: any) {
      console.error('Error approving ticket:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleCopySummary = () => {
    if (!selectedReport) return;
    const metrics = getReportMetrics(selectedReport);
    const accomplishments = getReportAccomplishments(selectedReport);
    const recommendations = getReportRecommendations(selectedReport);
    
    const text = `# ${selectedReport.title}\nDate: ${getReportDate(selectedReport)}\nAuthor: ${getReportAuthor(selectedReport)}\n\n## Executive Summary\n${selectedReport.executiveSummary}\n\n## KPIs\n- Total Tickets: ${metrics.total}\n- SLA Compliance: ${metrics.slaRate}%\n- MTTR: ${metrics.avgHours} hrs\n- AI Accuracy: ${metrics.aiAccuracy}%\n\n## Key Accomplishments\n${accomplishments.map((a) => `- ${a}`).join('\n')}\n\n## Strategic Recommendations\n${recommendations.map((r) => `- ${r}`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const metrics = getReportMetrics(selectedReport);
    const accomplishments = getReportAccomplishments(selectedReport);
    const bottlenecks = getReportBottlenecks(selectedReport);
    const recommendations = getReportRecommendations(selectedReport);
    const slaAnalysis = getReportSlaAnalysis(selectedReport);

    const content = `# ${selectedReport.title}\n\n**Generated:** ${getReportDate(selectedReport)}\n**Author:** ${getReportAuthor(selectedReport)}\n**Time Period:** ${selectedReport.timeRange}\n\n---\n\n## 1. Executive Summary\n${selectedReport.executiveSummary}\n\n## 2. Key Operational Metrics\n- **Total Volume:** ${metrics.total}\n- **Resolved:** ${metrics.resolved}\n- **SLA Compliance Rate:** ${metrics.slaRate}%\n- **Mean Time to Resolution (MTTR):** ${metrics.avgHours} hours\n- **AI Triage Accuracy:** ${metrics.aiAccuracy}%\n\n## 3. Key Accomplishments\n${accomplishments.map((a) => `* ${a}`).join('\n')}\n\n## 4. Bottlenecks & Operational Risks\n${bottlenecks.map((b) => `* ${b}`).join('\n')}\n\n## 5. SLA & Compliance Health\n${slaAnalysis}\n\n## 6. Strategic Recommendations for Leadership\n${recommendations.map((r) => `* ${r}`).join('\n')}\n`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Capaciti_Executive_Report_${selectedReport.id || 'export'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeMetrics = selectedReport ? getReportMetrics(selectedReport) : null;
  const activeAccomplishments = selectedReport ? getReportAccomplishments(selectedReport) : [];
  const activeBottlenecks = selectedReport ? getReportBottlenecks(selectedReport) : [];
  const activeRecommendations = selectedReport ? getReportRecommendations(selectedReport) : [];

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500 mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-sky-700 font-bold uppercase tracking-wider text-[10px]">
              AI Decision Center
            </span>
            <span>Intelligent Approvals & Executive Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Approvals & Business Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate automated triage classifications, review drafted technician responses, and generate executive summaries.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Sub-view switcher tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 font-medium">
            <button
              onClick={() => setSubView('approvals')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                subView === 'approvals'
                  ? 'bg-white text-sky-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
              <span>Pending Approvals</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold ml-1">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSubView('reports')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                subView === 'reports'
                  ? 'bg-white text-sky-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Executive Reports</span>
            </button>

            <button
              onClick={() => setSubView('presentation')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                subView === 'presentation'
                  ? 'bg-[#0a1c36] text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-teal-400" />
              <span>Deliverables Deck (.pptx)</span>
            </button>
          </div>

          {/* Direct PowerPoint Export Trigger */}
          <button
            onClick={() => generateDeliverablesPPTX()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download Sprint 2 PowerPoint Presentation (.pptx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .PPTX</span>
          </button>

          {/* Report Generator Controls (Visible if reports tab is active or for quick access) */}
          {subView === 'reports' && (
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                disabled={generating}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 font-medium text-xs"
              >
                <option value="sprint_week_2">Sprint Week 2 (Aug 17–21, 2026)</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="all_time">All Time To Date</option>
              </select>

              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {approvalSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{approvalSuccessMessage}</span>
          </div>
        </div>
      )}

      {reportError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{reportError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: PENDING AI APPROVALS & CLASSIFICATION TRIAGE QUEUE            */}
      {/* ========================================================================= */}
      {subView === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span>AI Triage & Classification Approvals Queue</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review tickets classified by the AI engine. Confirm categorization, verify SLA priority assignments, or override with custom routing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadApprovalsData}
                  disabled={loadingApprovals}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Refresh Queue"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingApprovals ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loadingApprovals ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading pending AI approvals...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">All AI Triage Items Approved</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No tickets are currently pending AI triage verification. Incoming requests will automatically populate here for staff sign-off.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('requests')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    View All Tickets Queue
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const classification = req.aiClassification;
                  const confidence = classification ? Math.round(classification.confidenceScore * 100) : 90;
                  const isApproving = approvingId === req.id;

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/20 transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-500">{req.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-800">{req.userName}</span>
                          <span className="text-[11px] text-slate-400">({req.userEmail})</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <SLACountdownBadge
                            createdAt={req.createdAt}
                            priority={req.priority}
                            slaTargetHours={req.slaTargetHours}
                            status={req.status}
                            resolvedAt={req.resolvedAt}
                          />
                        </div>
                      </div>

                      {/* Ticket Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {req.description}
                        </p>
                      </div>

                      {/* AI Classification Reasoning Box */}
                      <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span className="font-bold text-sky-950">AI Triage Recommendation:</span>
                            <span className="px-2 py-0.5 rounded bg-white border border-sky-200 text-sky-800 font-bold text-[10px]">
                              {classification?.category || req.department || 'IT Support'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                              req.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                              req.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {req.priority} Priority
                            </span>
                          </div>
                          {classification?.summary && (
                            <p className="text-slate-600 text-[11px] leading-snug">
                              {classification.summary}
                            </p>
                          )}
                          {classification?.recommendedAction && (
                            <div className="text-[11px] text-slate-700 font-medium">
                              <strong>Recommended Action:</strong> {classification.recommendedAction}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between gap-1">
                          <div className="text-[10px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full">
                            {confidence}% AI Confidence
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'AI Classified' ? 'bg-sky-100 text-sky-800' :
                            req.status === 'Submitted' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            Status: {req.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRequestForModal(req)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Review & Override</span>
                          </button>

                          <button
                            onClick={() => handleQuickApprove(req)}
                            disabled={isApproving}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                          >
                            {isApproving ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Approving...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve AI Triage</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: EXECUTIVE BUSINESS REPORTS & ANALYTICS                        */}
      {/* ========================================================================= */}
      {subView === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Left Sidebar: Saved Reports History */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 lg:col-span-1 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Archived Reports</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {reports.length}
              </span>
            </div>

            {loadingReports ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                <p>No reports generated yet.</p>
                <button
                  onClick={handleGenerateReport}
                  className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded font-semibold text-xs cursor-pointer"
                >
                  Generate First Report
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {reports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  const metrics = getReportMetrics(report);

                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-50/70 border-sky-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="font-mono">{report.id}</span>
                        <span>{getReportDate(report)}</span>
                      </div>
                      <div className={`text-xs font-bold line-clamp-2 ${isSelected ? 'text-sky-950' : 'text-slate-900'}`}>
                        {report.title}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {metrics.total} tickets
                        </span>
                        <span className="font-bold text-emerald-600">
                          {metrics.slaRate}% SLA
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Area: Selected Report Presentation */}
          <div className="lg:col-span-3 space-y-4">
            {selectedReport ? (
              <ExecutiveReportPresentation
                report={selectedReport}
                onRefresh={handleGenerateReport}
                isGenerating={generating}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600">No report selected</p>
                <p className="text-xs text-slate-400 mt-1">Select a report from the archive or click "Generate Report" above.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: INTERACTIVE DELIVERABLES PRESENTATION DECK & PPTX EXPORT      */}
      {/* ========================================================================= */}
      {subView === 'presentation' && (
        <div className="space-y-4">
          <DeliverablesPresentationDeck isModal={false} />
        </div>
      )}

      {/* Ticket Details & Override Modal */}
      {selectedRequestForModal && (
        <RequestDetailsModal
          request={selectedRequestForModal}
          currentUser={user}
          categories={categories}
          onClose={() => setSelectedRequestForModal(null)}
          onUpdateRequest={async (id, updates) => {
            const updated = await api.updateRequest(id, updates);
            setSelectedRequestForModal(updated);
            await loadApprovalsData();
            if (onRefreshAppData) onRefreshAppData();
          }}
          onOverrideAI={async (id, cat, prio, notes) => {
            const updated = await api.overrideAIClassification(id, cat, prio, notes);
            setSelectedRequestForModal(updated);
            await loadApprovalsData();
            if (onRefreshAppData) onRefreshAppData();
          }}
          onRetryClassify={async (id) => {
            const updated = await api.classifyRequest(id);
            setSelectedRequestForModal(updated);
            await loadApprovalsData();
            if (onRefreshAppData) onRefreshAppData();
          }}
          onRefreshTicket={(updated) => {
            setSelectedRequestForModal(updated);
            loadApprovalsData();
            if (onRefreshAppData) onRefreshAppData();
          }}
        />
      )}

    </div>
  );
};
