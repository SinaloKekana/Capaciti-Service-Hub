import React, { useState, useEffect } from 'react';
import { User, WorkflowRule, WorkflowExecutionLog, RequestItem } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  Zap, 
  Plus, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Power, 
  ArrowRight, 
  RefreshCw, 
  Filter, 
  Activity, 
  Layers, 
  Sliders, 
  Mail, 
  ShieldCheck, 
  Tag, 
  Clock, 
  Check, 
  X
} from 'lucide-react';

interface WorkflowAutomationViewProps {
  user: User | null;
  onNavigateTicket?: (ticketId: string) => void;
}

export const WorkflowAutomationView: React.FC<WorkflowAutomationViewProps> = ({ user, onNavigateTicket }) => {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [tickets, setTickets] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'logs' | 'test'>('rules');

  // Test Runner State
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowRule['trigger']>('on_ticket_created');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{ executedRules: number; executedLogs: WorkflowExecutionLog[] } | null>(null);

  // Modal State for Rule Creation / Editing
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<{
    name: string;
    description: string;
    trigger: WorkflowRule['trigger'];
    conditions: { field: string; operator: string; value: string }[];
    actions: { type: string; targetValue: string }[];
    isActive: boolean;
  }>({
    name: '',
    description: '',
    trigger: 'on_ticket_created',
    conditions: [{ field: 'category', operator: 'equals', value: 'Hardware & Devices' }],
    actions: [{ type: 'auto_assign', targetValue: 'tech.luthando@capaciti.org' }],
    isActive: true,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesList, logsList, ticketList] = await Promise.all([
        api.getWorkflowRules().catch(() => []),
        api.getWorkflowLogs().catch(() => []),
        api.getRequests().catch(() => []),
      ]);
      setRules(rulesList);
      setLogs(logsList);
      setTickets(ticketList);
      if (ticketList.length > 0 && !selectedTicketId) {
        setSelectedTicketId(ticketList[0].id);
      }
    } catch (err) {
      console.error('Failed to load workflow data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRule = async (id: string) => {
    try {
      const updated = await api.toggleWorkflowRule(id);
      setRules(rules.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert('Failed to toggle rule');
    }
  };

  const handleDeleteRule = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete workflow rule "${name}"?`)) return;
    try {
      await api.deleteWorkflowRule(id);
      setRules(rules.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete workflow rule');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRuleId(null);
    setRuleForm({
      name: '',
      description: '',
      trigger: 'on_ticket_created',
      conditions: [{ field: 'category', operator: 'equals', value: 'Hardware & Devices' }],
      actions: [{ type: 'auto_assign', targetValue: 'Luthando Didiza' }],
      isActive: true,
    });
    setShowRuleModal(true);
  };

  const handleOpenEditModal = (rule: WorkflowRule) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      conditions: rule.conditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: Array.isArray(c.value) ? c.value.join(', ') : String(c.value),
      })),
      actions: rule.actions.map((a) => ({
        type: a.type,
        targetValue: String(a.targetValue),
      })),
      isActive: rule.isActive,
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.name.trim()) {
      alert('Please provide a rule name');
      return;
    }

    try {
      const payload: any = {
        name: ruleForm.name,
        description: ruleForm.description,
        trigger: ruleForm.trigger,
        conditions: ruleForm.conditions.map((c) => ({
          field: c.field as any,
          operator: c.operator as any,
          value: c.operator === 'in' ? c.value.split(',').map((s) => s.trim()) : c.value,
        })),
        actions: ruleForm.actions.map((a) => ({
          type: a.type as any,
          targetValue: a.targetValue,
        })),
        isActive: ruleForm.isActive,
      };

      if (editingRuleId) {
        const updated = await api.updateWorkflowRule(editingRuleId, payload);
        setRules(rules.map((r) => (r.id === editingRuleId ? updated : r)));
      } else {
        const created = await api.createWorkflowRule(payload);
        setRules([...rules, created]);
      }
      setShowRuleModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save workflow rule');
    }
  };

  const handleAddCondition = () => {
    setRuleForm({
      ...ruleForm,
      conditions: [...ruleForm.conditions, { field: 'priority', operator: 'equals', value: 'High' }],
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (ruleForm.conditions.length <= 1) return;
    setRuleForm({
      ...ruleForm,
      conditions: ruleForm.conditions.filter((_, i) => i !== index),
    });
  };

  const handleAddAction = () => {
    setRuleForm({
      ...ruleForm,
      actions: [...ruleForm.actions, { type: 'set_priority', targetValue: 'High' }],
    });
  };

  const handleRemoveAction = (index: number) => {
    if (ruleForm.actions.length <= 1) return;
    setRuleForm({
      ...ruleForm,
      actions: ruleForm.actions.filter((_, i) => i !== index),
    });
  };

  const handleRunTest = async () => {
    if (!selectedTicketId) {
      alert('Please select a ticket to evaluate');
      return;
    }
    setTestRunning(true);
    setTestResult(null);
    try {
      const res = await api.testRunWorkflow(selectedTicketId, selectedTrigger);
      setTestResult(res.result);
      // Refresh logs
      const updatedLogs = await api.getWorkflowLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      alert(err.message || 'Failed to execute test run');
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0a1c36] via-[#102d57] to-[#0a1c36] rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Sprint 2 Deliverable: Business Process Automation</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Workflow Automation Engine
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Automate multi-step triage, intelligent technician assignment, priority escalations, SLA protections, and approval gates based on event triggers and rule criteria.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Workflow Rule</span>
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Refresh Rules & Logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Active Rules</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {rules.filter((r) => r.isActive).length} <span className="text-xs font-normal text-slate-400">/ {rules.length}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Total Executions</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {rules.reduce((acc, r) => acc + (r.executionCount || 0), 0)}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Audit Logs Recorded</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{logs.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400">Engine Status</div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'rules'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configured Rules ({rules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'test'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Live Rule Evaluator & Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'logs'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Execution Audit Trail ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONFIGURED RULES LIST */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                rule.isActive ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200/80 opacity-75'
              }`}
            >
              <div>
                {/* Header & Status Toggle */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{rule.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        rule.isActive
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(rule)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                      title="Edit rule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id, rule.name)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Trigger Pill */}
                <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md w-fit">
                  <Zap className="w-3 h-3 text-sky-600" />
                  <span>Trigger:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {rule.trigger === 'on_ticket_created' && 'When Ticket Created'}
                    {rule.trigger === 'on_ticket_updated' && 'When Ticket Updated'}
                    {rule.trigger === 'on_sla_warning' && 'When SLA Warning Raised'}
                    {rule.trigger === 'on_status_changed' && 'When Status Changes'}
                  </span>
                </div>

                {/* Conditions Block */}
                <div className="mb-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IF Conditions:</span>
                  <div className="space-y-1">
                    {rule.conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded border border-slate-200/80 text-slate-700">
                        <span className="font-mono font-bold text-sky-700">{cond.field}</span>
                        <span className="text-slate-400 font-semibold">{cond.operator}</span>
                        <span className="font-semibold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                          {Array.isArray(cond.value) ? cond.value.join(' OR ') : String(cond.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Block */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">THEN Actions:</span>
                  <div className="space-y-1">
                    {rule.actions.map((act, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1 rounded text-emerald-800 font-medium">
                        <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="font-bold">
                          {act.type === 'auto_assign' && 'Auto-Assign: '}
                          {act.type === 'set_priority' && 'Set Priority: '}
                          {act.type === 'trigger_approval' && 'Trigger Approval Gate: '}
                          {act.type === 'apply_tag' && 'Apply Internal Tag: '}
                          {act.type === 'send_email_alert' && 'Send Alert Email: '}
                        </span>
                        <span className="text-emerald-950 font-semibold">{act.targetValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Statistics */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Executed: <strong>{rule.executionCount || 0} times</strong></span>
                </div>
                <span>
                  {rule.lastExecutedAt
                    ? `Last: ${new Date(rule.lastExecutedAt).toLocaleDateString()}`
                    : 'Never executed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE SIMULATOR & TEST RUNNER */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Workflow Evaluator & Simulator</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an existing service request to dry-run through all active workflow rules. Inspect which conditions match and what actions would execute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Ticket for Evaluation</label>
              <select
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800"
              >
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.id}] - {t.title} ({t.category} | {t.priority})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Simulated Trigger Event</label>
              <select
                value={selectedTrigger}
                onChange={(e) => setSelectedTrigger(e.target.value as any)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800"
              >
                <option value="on_ticket_created">on_ticket_created (Ticket Intake)</option>
                <option value="on_ticket_updated">on_ticket_updated (Status / Field Update)</option>
                <option value="on_sla_warning">on_sla_warning (SLA Breach Risk)</option>
                <option value="on_status_changed">on_status_changed (State Transition)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            disabled={testRunning || !selectedTicketId}
            className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${testRunning ? 'animate-spin' : ''}`} />
            <span>{testRunning ? 'Evaluating Rules...' : 'Execute Evaluation Against Ticket'}</span>
          </button>

          {/* Test Results Section */}
          {testResult && (
            <div className="border border-sky-200 bg-sky-50/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-sky-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-sky-600" />
                <span>Evaluation Complete: {testResult.executedRules} Rule(s) Matched & Executed</span>
              </div>

              {testResult.executedLogs.length === 0 ? (
                <p className="text-xs text-slate-600">No active rules matched the criteria of this ticket.</p>
              ) : (
                <div className="space-y-2">
                  {testResult.executedLogs.map((log) => (
                    <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 font-mono">{log.ruleName}</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          STATUS: {log.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Executed Actions:</span>
                        {log.executedActions.map((act, i) => (
                          <div key={i} className="text-xs font-medium text-slate-700 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXECUTION AUDIT TRAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Live Execution Audit Stream</h3>
            <span className="text-xs font-semibold text-slate-500">Showing last {logs.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Target Ticket</th>
                  <th className="py-3 px-4">Executed Actions</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No workflow execution events logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.executedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{log.ruleName}</td>
                      <td className="py-3 px-4 font-medium text-sky-700">
                        <span className="font-mono text-[11px] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          {log.ticketId}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{log.ticketTitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {log.executedActions.map((act, i) => (
                            <div key={i} className="text-[11px] text-slate-700 font-medium">
                              • {act}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WORKFLOW RULE MODAL */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingRuleId ? 'Edit Workflow Rule' : 'Create New Automation Rule'}
                </h3>
                <p className="text-xs text-slate-500">Configure event triggers, conditional matching logic, and automated business actions.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Hardware Triage to Senior Support"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Business Purpose</label>
                <input
                  type="text"
                  placeholder="Explain why this rule exists and who it routes to"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trigger Event *</label>
                <select
                  value={ruleForm.trigger}
                  onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value as any })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white"
                >
                  <option value="on_ticket_created">on_ticket_created (Intake of new request)</option>
                  <option value="on_ticket_updated">on_ticket_updated (Ticket modifications)</option>
                  <option value="on_sla_warning">on_sla_warning (SLA nearing threshold)</option>
                  <option value="on_status_changed">on_status_changed (State transitions)</option>
                </select>
              </div>

              {/* Conditions Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Matching Conditions (ALL must match)</span>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Condition</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ruleForm.conditions.map((cond, i) => (
                    <div key={i} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <select
                        value={cond.field}
                        onChange={(e) => {
                          const updated = [...ruleForm.conditions];
                          updated[i].field = e.target.value;
                          setRuleForm({ ...ruleForm, conditions: updated });
                        }}
                        className="text-xs font-medium bg-white border border-slate-200 rounded p-1.5"
                      >
                        <option value="category">category</option>
                        <option value="priority">priority</option>
                        <option value="department">department</option>
                        <option value="requestType">requestType</option>
                        <option value="title">title</option>
                        <option value="slaRemainingHours">slaRemainingHours</option>
                      </select>

                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const updated = [...ruleForm.conditions];
                          updated[i].operator = e.target.value;
                          setRuleForm({ ...ruleForm, conditions: updated });
                        }}
                        className="text-xs font-medium bg-white border border-slate-200 rounded p-1.5"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not_equals</option>
                        <option value="contains">contains</option>
                        <option value="in">in (comma separated)</option>
                        <option value="greater_than">greater_than</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Value to match"
                        value={cond.value}
                        onChange={(e) => {
                          const updated = [...ruleForm.conditions];
                          updated[i].value = e.target.value;
                          setRuleForm({ ...ruleForm, conditions: updated });
                        }}
                        className="flex-1 text-xs font-medium bg-white border border-slate-200 rounded p-1.5"
                      />

                      {ruleForm.conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(i)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Automated Actions (Executed sequentially)</span>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Action</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ruleForm.actions.map((act, i) => (
                    <div key={i} className="flex items-center space-x-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                      <select
                        value={act.type}
                        onChange={(e) => {
                          const updated = [...ruleForm.actions];
                          updated[i].type = e.target.value;
                          setRuleForm({ ...ruleForm, actions: updated });
                        }}
                        className="text-xs font-medium bg-white border border-slate-200 rounded p-1.5"
                      >
                        <option value="auto_assign">auto_assign (Assign Technician)</option>
                        <option value="set_priority">set_priority (Adjust Priority & SLA)</option>
                        <option value="trigger_approval">trigger_approval (Approval Gate)</option>
                        <option value="apply_tag">apply_tag (Apply Internal Audit Tag)</option>
                        <option value="send_email_alert">send_email_alert (Send Alert Email)</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Target value (Email, Priority, Tag, Requisition Type)"
                        value={act.targetValue}
                        onChange={(e) => {
                          const updated = [...ruleForm.actions];
                          updated[i].targetValue = e.target.value;
                          setRuleForm({ ...ruleForm, actions: updated });
                        }}
                        className="flex-1 text-xs font-medium bg-white border border-slate-200 rounded p-1.5"
                      />

                      {ruleForm.actions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(i)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="ruleActiveCheck"
                  checked={ruleForm.isActive}
                  onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="ruleActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Activate this rule immediately upon saving
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {editingRuleId ? 'Update Rule' : 'Save Workflow Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
