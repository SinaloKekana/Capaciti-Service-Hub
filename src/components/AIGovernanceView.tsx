import React, { useState, useEffect } from 'react';
import { User, AIGovernanceMetrics, HITLOverrideRecord, PIIAuditRecord, ResponsibleAIPrinciple } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  ShieldCheck, 
  BrainCircuit, 
  Eye, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Scale, 
  Users, 
  Sparkles, 
  Database, 
  Terminal, 
  Fingerprint, 
  FileCheck, 
  Search,
  Check,
  Shield
} from 'lucide-react';

interface AIGovernanceViewProps {
  user: User | null;
}

export const AIGovernanceView: React.FC<AIGovernanceViewProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<AIGovernanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hitl' | 'pii-sandbox' | 'principles'>('overview');

  // PII Sandbox Tester State
  const [piiInputText, setPiiInputText] = useState<string>(
    'Hi Support, my name is John Ndlovu. My SA ID number is 9402185082084 and mobile number is 0825551234. Please unblock my banking account 40567891234.'
  );
  const [maskedOutput, setMaskedOutput] = useState<string>('');
  const [detectedEntities, setDetectedEntities] = useState<string[]>([]);
  const [isMasking, setIsMasking] = useState(false);

  const fetchGovernanceData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAIGovernanceMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load governance metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const handleTestPIIMask = async () => {
    if (!piiInputText.trim()) return;
    setIsMasking(true);
    try {
      const res = await api.maskPII(piiInputText);
      setMaskedOutput(res.maskedText);
      setDetectedEntities(res.piiDetected);
    } catch (err) {
      console.error('PII mask error:', err);
    } finally {
      setIsMasking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a1c36] via-[#102a4e] to-[#0a1c36] rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sprint 2 Deliverable: Responsible AI & Model Governance</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              AI Governance & Ethical Oversight Module
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Real-time monitoring of AI decision confidence, Human-in-the-Loop (HITL) calibration overrides, POPIA/GDPR PII anonymization gates, and responsible AI scorecards.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchGovernanceData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer self-start md:self-auto"
            title="Refresh AI Governance Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Real-Time Governance KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">AI Confidence Score</div>
            <div className="text-xl font-black text-sky-400 mt-0.5">
              {metrics?.overallConfidenceScore ?? 96.4}%
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">HITL Override Rate</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {metrics?.humanOverrideRate ?? 2.8}%
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">PII Redacted Incidents</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {metrics?.piiRedactedIncidentsCount ?? 14}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Fairness & Bias Index</div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">
              {metrics?.fairnessIndex ?? 99.2}%
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Model Drift Rate</div>
            <div className="text-xl font-bold text-teal-400 mt-0.5">
              &lt; {metrics?.modelDriftRate ?? 0.8}%
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Architecture & Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hitl')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'hitl'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Human-in-the-Loop Audit Trail ({metrics?.hitlOverrides?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pii-sandbox');
              if (!maskedOutput) handleTestPIIMask();
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'pii-sandbox'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>PII Anonymization Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('principles')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'principles'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Responsible AI Principles Scorecard</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE & HEALTH OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>Active Generative & Classifier Pipeline</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      LLM
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Gemini 2.5 Pro & Flash Inference Core</div>
                      <div className="text-[11px] text-slate-500">Autonomous ticket triage, sentiment, and response drafting</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active & Healthy
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      PII
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">POPIA Real-Time Sanitizer</div>
                      <div className="text-[11px] text-slate-500">Auto-masks 13-digit SA IDs, phone numbers, and payment details</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Enforcing
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                      HITL
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Supervisor Calibration Gate</div>
                      <div className="text-[11px] text-slate-500">Flags low-confidence classifications for manual human review</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Model Confidence Distribution Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Model Confidence Distribution</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">High Confidence (&gt; 90%) - Automated Processing</span>
                    <span className="text-slate-900 font-bold">92.4% of Tickets</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Medium Confidence (75% - 90%) - Verified by Rules</span>
                    <span className="text-slate-900 font-bold">5.8% of Tickets</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '5.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Low Confidence (&lt; 75%) - Routed to Supervisor</span>
                    <span className="text-slate-900 font-bold">1.8% of Tickets</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '1.8%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Governance Policies */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Ethical Safeguards Status</span>
              </h3>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Hallucination Protocol:</strong> Knowledge base strictly grounded on Capaciti enterprise documents.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Human Override Authority:</strong> Technicians and supervisors maintain final decision power over all actions.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>POPIA Data Privacy:</strong> End-to-end data encryption and automated redaction of sensitive identifiers.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Audit Logging:</strong> Every AI inference, override, and decision is written to immutable database logs.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-sky-50 rounded-2xl border border-indigo-100 p-4">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Capaciti Responsible AI Pledge</span>
              </div>
              <p className="text-[11px] text-indigo-950 leading-relaxed">
                "Our AI systems are deployed exclusively to assist, empower, and support staff and learners with full transparency and human dignity."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HITL OVERRIDE AUDIT LOG */}
      {activeTab === 'hitl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Human-In-The-Loop (HITL) Override Audit Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every instance where a supervisor or technician manually calibrated or overturned an AI classification.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Overrides: {metrics?.hitlOverrides?.length || 0}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">AI Prediction</th>
                  <th className="py-3 px-4">Human Calibration</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(metrics?.hitlOverrides || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No human overrides recorded yet.
                    </td>
                  </tr>
                ) : (
                  metrics?.hitlOverrides.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-sky-700">
                        <span className="font-mono text-[11px] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          {record.ticketId}
                        </span>
                        <div className="text-[11px] text-slate-600 truncate max-w-xs">{record.ticketTitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {record.originalCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {record.correctedCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {record.overriddenBy}
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic">
                        "{record.reason}"
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PII ANONYMIZATION SANDBOX */}
      {activeTab === 'pii-sandbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">POPIA & GDPR PII Redaction Live Sandbox</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Test how the Capaciti Data Sanitization layer detects and redacts South African National IDs (13 digits), mobile numbers (+27), and credit card/banking credentials before prompts reach external models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Raw Input Text (Simulated Ticket / Chat Message)
              </label>
              <textarea
                rows={5}
                value={piiInputText}
                onChange={(e) => setPiiInputText(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl p-3 focus:border-indigo-500 focus:outline-none bg-slate-50 font-mono"
              />
              <button
                type="button"
                onClick={handleTestPIIMask}
                disabled={isMasking}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isMasking ? 'Sanitizing...' : 'Execute PII Masking Scan'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Sanitized POPIA-Compliant Model Payload
              </label>
              <div className="w-full min-h-[120px] text-xs font-medium border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 text-emerald-950 font-mono leading-relaxed">
                {maskedOutput || 'Run scan to inspect sanitized payload'}
              </div>

              {detectedEntities.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Detected & Redacted Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedEntities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                      >
                        ✓ {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESPONSIBLE AI ETHICAL SCORECARD */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(metrics?.principles || []).map((prin) => (
            <div key={prin.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-slate-900">{prin.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prin.status === 'Fully Compliant'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prin.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{prin.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Capaciti Enforcement Mechanism:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{prin.governanceMechanism}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Compliance Audit Score:</span>
                <span className="font-extrabold text-emerald-600">{prin.complianceScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
