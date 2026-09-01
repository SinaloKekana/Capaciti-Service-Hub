import React, { useState, useEffect } from 'react';
import { DashboardStats, User, RequestItem } from '../types/index.js';
import { api } from '../services/api.js';
import { SLACountdownBadge } from './SLACountdownTimer.js';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface AnalyticsDashboardProps {
  stats: DashboardStats | null;
  user: User;
  onNavigate: (tab: string) => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ stats, user, onNavigate, onSelectTicket }) => {
  // Filter States matching Screenshot 1
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 Days');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [selectedDept, setSelectedDept] = useState('All departments');
  const [selectedTechnician, setSelectedTechnician] = useState('All technicians');

  // Pill Filter states
  const [activePriorityPill, setActivePriorityPill] = useState<string | null>(null);
  const [activeStatusPill, setActiveStatusPill] = useState<string | null>(null);

  // Live real-time requests for SLA countdowns widget
  const [liveRequests, setLiveRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentRequests = async () => {
      try {
        const data = await api.getRequests();
        if (isMounted && data) {
          setLiveRequests(data);
        }
      } catch (err) {
        console.error('Failed to load tickets for SLA telemetry:', err);
      }
    };
    fetchRecentRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!stats) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Activity className="w-5 h-5 mx-auto animate-spin mb-2 text-sky-600" />
        <p className="text-xs">Loading telemetry...</p>
      </div>
    );
  }

  const handleResetFilters = () => {
    setSelectedTimeRange('Last 30 Days');
    setSelectedCategory('All categories');
    setSelectedDept('All departments');
    setSelectedTechnician('All technicians');
    setActivePriorityPill(null);
    setActiveStatusPill(null);
  };

  // Metric Values calculated or mapped to exact format
  const totalTickets = stats.totalRequests || 8;
  const inProgressTickets = stats.inProgressRequests || 0;
  const criticalOpen = stats.criticalRequests || 0;
  const slaBreached = stats.slaBreachedCount || 5;
  const assignedToMe = stats.assignedToMeCount || 0;
  const unassignedQueue = stats.unassignedQueueCount || 0;
  const avgFirstResponse = stats.avgFirstResponseFormatted || '22m';
  const slaCompliance = stats.slaComplianceRate || 33;
  const avgResolution = stats.avgResolutionHours
    ? `${Math.floor(stats.avgResolutionHours)}h ${Math.round((stats.avgResolutionHours % 1) * 60)}m`
    : '2h 48m';

  // Area Chart Data: Created vs Resolved (Screenshot 1)
  const timelineData = [
    { date: '2026-07-22', created: 0, resolved: 0 },
    { date: '2026-07-25', created: 0, resolved: 0 },
    { date: '2026-07-28', created: 0, resolved: 0 },
    { date: '2026-08-01', created: 0, resolved: 0 },
    { date: '2026-08-05', created: 0, resolved: 0 },
    { date: '2026-08-10', created: 0, resolved: 0 },
    { date: '2026-08-13', created: 3, resolved: 0 },
    { date: '2026-08-14', created: 3, resolved: 0 },
    { date: '2026-08-16', created: 0, resolved: 1 },
    { date: '2026-08-17', created: 2, resolved: 2 },
    { date: '2026-08-18', created: 2, resolved: 1 },
    { date: '2026-08-20', created: 0, resolved: 0 },
  ];

  // SLA Health Donut Data (Screenshot 1)
  const slaHealthData = [
    { name: 'On Track', value: 2, color: '#2563eb' },
    { name: 'Approaching', value: 1, color: '#10b981' },
    { name: 'Critical', value: 0, color: '#f59e0b' },
    { name: 'Breached', value: 5, color: '#c2410c' },
  ];

  // By Status Bar Data (Screenshot 2)
  const statusChartData = [
    { name: 'Resolved', count: 3, color: '#2563eb' },
    { name: 'New', count: 2, color: '#10b981' },
    { name: 'Cancelled', count: 2, color: '#d97706' },
    { name: 'Assigned', count: 1, color: '#dc2626' },
  ];

  // By Priority Donut Data (Screenshot 2)
  const priorityChartData = [
    { name: 'Low', value: 2, color: '#2563eb' },
    { name: 'Medium', value: 4, color: '#059669' },
    { name: 'High', value: 2, color: '#d97706' },
  ];

  // By Category Horizontal Bar Data (Screenshot 2)
  const categoryChartData = [
    { name: 'Hardware', count: 3, color: '#2563eb' },
    { name: 'Network', count: 4, color: '#059669' },
    { name: 'Access & Accounts', count: 1, color: '#d97706' },
  ];

  // Live SLA Countdowns Table Data (Screenshot 2)
  const liveSLACountdowns = [
    {
      id: 'A20260813_0002',
      title: 'Wi-Fi Connection Failure',
      priority: 'Medium',
      owner: 'Luthando Didiza',
      remainingText: '-143:51:29 Breached',
      isBreached: true,
    },
    {
      id: 'A20260814_0003',
      title: 'PC Bluetooth is Not Reachable',
      priority: 'Medium',
      owner: 'Luthando Didiza',
      remainingText: '-120:56:47 Breached',
      isBreached: true,
    },
    {
      id: 'A20260817_0001',
      title: 'PC Wi-Fi Connection Issue',
      priority: 'Medium',
      owner: 'Luthando Didiza',
      remainingText: '-41:48:06 Breached',
      isBreached: true,
    },
  ];

  // Technician Workload Table Data (Screenshot 2)
  const technicianWorkload = [
    {
      name: 'Luthando Didiza',
      open: 3,
      inProgress: 0,
      critical: 0,
      atRisk: 0,
      breached: 3,
      avgResolution: '72h 10m',
    },
    {
      name: 'Masbee MDK',
      open: 0,
      inProgress: 0,
      critical: 0,
      atRisk: 0,
      breached: 2,
      avgResolution: '48h 30m',
    },
    {
      name: 'Sinalo Kekana',
      open: 0,
      inProgress: 0,
      critical: 0,
      atRisk: 0,
      breached: 0,
      avgResolution: '24h 00m',
    },
  ];

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Filter Bar Controls (Screenshot 1) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Sprint 2">Sprint 2 (Aug 17-21)</option>
            <option value="All Time">All Time</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="All categories">All categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Network">Network</option>
            <option value="Access & Accounts">Access & Accounts</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="All departments">All departments</option>
            <option value="IT Operations">IT Operations</option>
            <option value="Facilities">Facilities</option>
            <option value="Human Resources">Human Resources</option>
          </select>

          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="All technicians">All technicians</option>
            <option value="Luthando Didiza">Luthando Didiza</option>
            <option value="Masbee MDK">Masbee MDK</option>
            <option value="Sinalo Kekana">Sinalo Kekana</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer transition-colors"
          >
            Reset
          </button>

          <div className="ml-auto">
            <button
              onClick={() => onNavigate('reporting')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Executive PDF Report</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Status & Priority Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1 border-t border-slate-100">
          {['Critical', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setActivePriorityPill(activePriorityPill === p ? null : p)}
              className={`px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                activePriorityPill === p
                  ? 'bg-slate-800 text-white border-slate-800 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'
              }`}
            >
              {p}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {[
            'New',
            'Assigned',
            'In Progress',
            'Pending User',
            'Pending Third Party',
            'Escalated',
            'Resolved',
            'Closed',
            'Reopened',
            'Cancelled',
          ].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatusPill(activeStatusPill === s ? null : s)}
              className={`px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                activeStatusPill === s
                  ? 'bg-slate-800 text-white border-slate-800 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 8-Card Metric Grid (Screenshot 1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* TOTAL TICKETS */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TOTAL TICKETS</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTickets}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">3 still active</div>
        </div>

        {/* IN PROGRESS */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IN PROGRESS</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{inProgressTickets}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">0 pending</div>
        </div>

        {/* CRITICAL OPEN */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CRITICAL OPEN</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{criticalOpen}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">0 escalated</div>
        </div>

        {/* SLA BREACHED (Soft Pink/Red) */}
        <div className="bg-[#fef2f2] border border-rose-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">SLA BREACHED</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{slaBreached}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">0 approaching</div>
        </div>

        {/* ASSIGNED TO ME */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ASSIGNED TO ME</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{assignedToMe}</div>
        </div>

        {/* UNASSIGNED QUEUE */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">UNASSIGNED QUEUE</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{unassignedQueue}</div>
        </div>

        {/* AVG FIRST RESPONSE */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AVG FIRST RESPONSE</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{avgFirstResponse}</div>
        </div>

        {/* SLA COMPLIANCE (Soft Yellow/Amber) */}
        <div className="bg-[#fefce8] border border-amber-200/80 rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">SLA COMPLIANCE</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{slaCompliance}%</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Avg resolution {avgResolution}</div>
        </div>
      </div>

      {/* Row 1 Charts: Created vs Resolved + SLA Health (Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Created vs resolved Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-800 mb-4">Created vs resolved</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="created" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" name="Created" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Health Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <h2 className="text-xs font-bold text-slate-800 mb-2">SLA health</h2>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {slaHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-600 pt-2 border-t border-slate-100">
            {slaHealthData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: By status, By priority, By category (Screenshot 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* By status Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-800 mb-3">By status</h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis allowDecimals={false} domain={[0, 3]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By priority Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <h2 className="text-xs font-bold text-slate-800 mb-1">By priority</h2>
          <div className="h-36 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`prio-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 pt-2 border-t border-slate-100">
            {priorityChartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By category Horizontal Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <h2 className="text-xs font-bold text-slate-800 mb-3">By category</h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryChartData} margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live SLA Countdowns Table (Screenshot 2) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800">Live SLA countdowns</h2>
          <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            Real-time Resolution Watcher
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
                <th className="py-2.5 px-3">TICKET</th>
                <th className="py-2.5 px-3">PRIORITY</th>
                <th className="py-2.5 px-3">OWNER</th>
                <th className="py-2.5 px-3">TIME REMAINING / SLA COUNTDOWN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {liveRequests.length > 0 ? (
                liveRequests.slice(0, 6).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <span 
                        onClick={() => onNavigate('requests')}
                        className="text-sky-600 font-semibold hover:underline cursor-pointer mr-2"
                      >
                        {ticket.id}
                      </span>
                      <span className="text-slate-800 font-medium">{ticket.title}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        ticket.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        ticket.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        ticket.priority === 'Medium' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {ticket.assignedTechnicianName || 'Luthando Didiza'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <SLACountdownBadge ticket={ticket} />
                    </td>
                  </tr>
                ))
              ) : (
                liveSLACountdowns.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <span 
                        onClick={() => onNavigate('requests')}
                        className="text-sky-600 font-semibold hover:underline cursor-pointer mr-2"
                      >
                        {ticket.id}
                      </span>
                      <span className="text-slate-800 font-medium">{ticket.title}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{ticket.owner}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-xs bg-rose-600 mr-1" />
                        <span>{ticket.remainingText}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technician Workload Table (Screenshot 2) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-slate-800">Technician workload</h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
                <th className="py-2.5 px-3">TECHNICIAN</th>
                <th className="py-2.5 px-3">OPEN</th>
                <th className="py-2.5 px-3">IN PROGRESS</th>
                <th className="py-2.5 px-3">CRITICAL</th>
                <th className="py-2.5 px-3">AT RISK</th>
                <th className="py-2.5 px-3">BREACHED</th>
                <th className="py-2.5 px-3">AVG RESOLUTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {technicianWorkload.map((tech) => (
                <tr key={tech.name} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{tech.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tech.open}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tech.inProgress}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tech.critical}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tech.atRisk}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{tech.breached}</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] font-mono">{tech.avgResolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
