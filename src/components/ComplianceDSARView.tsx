import React, { useState, useEffect } from 'react';
import { User, DSARRecord, CompliancePolicy } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  FileCheck2, 
  Download, 
  Shield, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Lock, 
  RefreshCw, 
  FileText, 
  ExternalLink, 
  AlertCircle,
  Database,
  Building,
  Check
} from 'lucide-react';

interface ComplianceDSARViewProps {
  user: User | null;
}

export const ComplianceDSARView: React.FC<ComplianceDSARViewProps> = ({ user }) => {
  const [dsarRequests, setDsarRequests] = useState<DSARRecord[]>([]);
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dsar' | 'policies'>('dsar');

  // Submit DSAR Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [dsarForm, setDsarForm] = useState<{
    requestType: 'EXPORT_DATA' | 'ERASURE_REQUEST' | 'RESTRICT_PROCESSING';
    userEmail: string;
    userName: string;
  }>({
    requestType: 'EXPORT_DATA',
    userEmail: user?.email || '',
    userName: user?.name || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enforcingPolicyId, setEnforcingPolicyId] = useState<string | null>(null);

  const fetchComplianceData = async () => {
    setIsLoading(true);
    try {
      const [dsarList, polList] = await Promise.all([
        api.getDSARRequests().catch(() => []),
        api.getCompliancePolicies().catch(() => []),
      ]);
      setDsarRequests(dsarList);
      setPolicies(polList);
    } catch (err) {
      console.error('Failed to load compliance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleCreateDSAR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsarForm.userEmail.trim()) {
      alert('Please provide a valid user email');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await api.createDSARRequest(dsarForm);
      setDsarRequests([created, ...dsarRequests]);
      setShowSubmitModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit DSAR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDSAR = async (id: string) => {
    try {
      const updated = await api.completeDSARRequest(id);
      setDsarRequests(dsarRequests.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      alert('Failed to complete DSAR');
    }
  };

  const handleEnforcePolicy = async (id: string) => {
    setEnforcingPolicyId(id);
    try {
      const res = await api.enforceCompliancePolicy(id);
      setPolicies(policies.map((p) => (p.id === id ? res.policy : p)));
      alert(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to enforce compliance policy');
    } finally {
      setEnforcingPolicyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1c36] via-[#0e2a47] to-[#0a1c36] rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Sprint 2 Deliverable: Enterprise Compliance & Privacy Suite</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              POPIA & GDPR Data Compliance Hub
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Fulfill South African POPIA (Section 23) and GDPR Data Subject Access Requests (DSAR), automate data erasure protocols, and execute enterprise retention schedules.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setDsarForm({
                  requestType: 'EXPORT_DATA',
                  userEmail: user?.email || '',
                  userName: user?.name || '',
                });
                setShowSubmitModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit DSAR Request</span>
            </button>
            <button
              type="button"
              onClick={fetchComplianceData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Refresh Compliance Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Total DSAR Requests</div>
            <div className="text-xl font-bold text-teal-400 mt-0.5">{dsarRequests.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Completed Exports</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {dsarRequests.filter((d) => d.status === 'COMPLETED').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Enforced Policies</div>
            <div className="text-xl font-bold text-white mt-0.5">{policies.length} Active</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Statutory Framework</div>
            <div className="text-xs font-bold text-sky-400 mt-1">POPIA Act No. 4 / GDPR</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('dsar')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'dsar'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Data Subject Access Requests ({dsarRequests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'policies'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Enterprise Data Retention Policies ({policies.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DSAR REQUESTS */}
      {activeTab === 'dsar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">POPIA Subject Access & Erasure Queue</h3>
            <span className="text-xs text-slate-500 font-medium">Article 15 / POPIA Section 23</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Data Subject</th>
                  <th className="py-3 px-4">Request Type</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dsarRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No DSAR requests lodged.
                    </td>
                  </tr>
                ) : (
                  dsarRequests.map((dsar) => (
                    <tr key={dsar.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">
                        {dsar.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{dsar.userName}</div>
                        <div className="text-[11px] text-slate-500">{dsar.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {dsar.requestType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(dsar.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dsar.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {dsar.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {dsar.status === 'IN_PROGRESS' && user?.role === 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleCompleteDSAR(dsar.id)}
                              className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 font-bold text-[11px] cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}

                          {dsar.status === 'COMPLETED' && (
                            <a
                              href={`/api/compliance/dsar/${dsar.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download JSON Export</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DATA RETENTION POLICIES */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div key={pol.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{pol.name}</h3>
                    <div className="text-[11px] font-semibold text-teal-700 mt-0.5">
                      Retention Window: <strong>{pol.retentionPeriodDays} Days</strong>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {pol.enforcementStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{pol.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Last Enforced Audit:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {pol.lastEnforced ? new Date(pol.lastEnforced).toLocaleString() : 'Pending Execution'}
                  </span>
                </div>
              </div>

              {user?.role === 'ADMIN' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleEnforcePolicy(pol.id)}
                    disabled={enforcingPolicyId === pol.id}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${enforcingPolicyId === pol.id ? 'animate-spin' : ''}`} />
                    <span>Enforce Audit Retention Routine</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT DSAR MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Lodge Data Subject Request (DSAR)</h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDSAR} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Full Name *</label>
                <input
                  type="text"
                  required
                  value={dsarForm.userName}
                  onChange={(e) => setDsarForm({ ...dsarForm, userName: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Email Address *</label>
                <input
                  type="email"
                  required
                  value={dsarForm.userEmail}
                  onChange={(e) => setDsarForm({ ...dsarForm, userEmail: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Request Type *</label>
                <select
                  value={dsarForm.requestType}
                  onChange={(e) => setDsarForm({ ...dsarForm, requestType: e.target.value as any })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  <option value="EXPORT_DATA">Export Complete Personal Data Archive (POPIA Sec 23)</option>
                  <option value="ERASURE_REQUEST">Request Erasure / Right to be Forgotten (GDPR Art 17)</option>
                  <option value="RESTRICT_PROCESSING">Restrict Processing of Personal Information</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Lodging Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
