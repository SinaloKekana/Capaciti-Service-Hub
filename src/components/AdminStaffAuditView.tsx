import React, { useState, useEffect } from 'react';
import { User, AuditLog, DepartmentLeadership } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  Users, 
  Check, 
  Clock, 
  ShieldAlert, 
  Search,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  UserPlus,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  Building2,
  DollarSign,
  Briefcase,
  Laptop,
  Wrench,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2,
  ChevronRight,
  Sparkles,
  Headphones
} from 'lucide-react';

interface AdminStaffAuditViewProps {
  currentUser: User;
  onRefreshAppData?: () => void;
}

export const AdminStaffAuditView: React.FC<AdminStaffAuditViewProps> = ({ currentUser, onRefreshAppData }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [leadership, setLeadership] = useState<DepartmentLeadership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewTab, setViewTab] = useState<'users' | 'leadership'>('users');
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [departmentFilter, setDepartmentFilter] = useState('All departments');
  const [accountStatusFilter, setAccountStatusFilter] = useState('All');

  // Modal for assigning role / department
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<string>('CUSTOMER');
  const [newSelectedDept, setNewSelectedDept] = useState<string>('IT Operations');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Modal for adding new user
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('EMPLOYEE');
  const [newUserDept, setNewUserDept] = useState<string>('IT Operations');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Modal for deleting / removing user
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal for audit history
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchData = async () => {
    try {
      const [uList, aLogs, leaders] = await Promise.all([
        api.getUsers(),
        api.getAuditLogs(),
        api.getDepartmentLeadership().catch(() => [] as DepartmentLeadership[]),
      ]);
      setUsers(uList);
      setAuditLogs(aLogs);
      setLeadership(leaders);
    } catch (err) {
      console.error('Failed to load users & audit data:', err);
      showToast('Failed to load user records from database', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    if (onRefreshAppData) onRefreshAppData();
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUserForRole(user);
    setNewSelectedRole(user.role || 'CUSTOMER');
    setNewSelectedDept(user.department || 'IT Operations');
  };

  const handleSaveRoleAndDept = async () => {
    if (!selectedUserForRole) return;
    setIsSubmittingRole(true);
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserForRole.id
            ? { ...u, role: newSelectedRole as any, department: newSelectedDept }
            : u
        )
      );

      await api.updateUser(selectedUserForRole.id, {
        role: newSelectedRole as any,
        department: newSelectedDept,
      });
      showToast(`Successfully updated ${selectedUserForRole.name}'s role to ${newSelectedRole} (${newSelectedDept}).`);
      setSelectedUserForRole(null);
      await fetchData();
      if (onRefreshAppData) onRefreshAppData();
    } catch (err: any) {
      showToast(`Role update failed: ${err.message || 'Server error'}`, 'error');
      await fetchData();
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleToggleSuspend = async (userToToggle: User) => {
    if (currentUser.id === userToToggle.id && (userToToggle.status || 'Active') === 'Active') {
      showToast('You cannot suspend your own active administrator account.', 'error');
      return;
    }

    const newStatus = (userToToggle.status || 'Active') === 'Active' ? 'Suspended' : 'Active';
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToToggle.id ? { ...u, status: newStatus } : u
        )
      );

      await api.updateUserStatus(userToToggle.id, newStatus);
      showToast(`User ${userToToggle.name} is now ${newStatus.toLowerCase()}.`);
      await fetchData();
      if (onRefreshAppData) onRefreshAppData();
    } catch (err: any) {
      showToast(`Status update failed: ${err.message || 'Server error'}`, 'error');
      await fetchData();
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    if (currentUser.id === selectedUserForDelete.id) {
      showToast('You cannot delete your own active administrator account.', 'error');
      setSelectedUserForDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Optimistic removal
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserForDelete.id));

      await api.deleteUser(selectedUserForDelete.id);
      showToast(`User ${selectedUserForDelete.name} has been removed.`);
      setSelectedUserForDelete(null);
      await fetchData();
      if (onRefreshAppData) onRefreshAppData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message || 'Server error'}`, 'error');
      await fetchData();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsCreatingUser(true);
    try {
      await api.createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword,
        role: newUserRole,
        department: newUserDept,
      });

      showToast(`User ${newUserName} created with role ${newUserRole}.`);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      await fetchData();
      if (onRefreshAppData) onRefreshAppData();
    } catch (err: any) {
      showToast(`Failed to create user: ${err.message || 'Server error'}`, 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Filtered User list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase())) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = 
      roleFilter === 'All roles' || 
      (roleFilter === 'Administrator' && u.role === 'ADMIN') ||
      (roleFilter === 'HR Manager' && u.role === 'HR_MANAGER') ||
      (roleFilter === 'Finance Manager' && u.role === 'FINANCE_MANAGER') ||
      (roleFilter === 'IT Director' && u.role === 'IT_MANAGER') ||
      (roleFilter === 'Facilities Manager' && u.role === 'FACILITIES_MANAGER') ||
      (roleFilter === 'Department Supervisor' && (u.role === 'SUPERVISOR' || u.role.endsWith('_MANAGER'))) ||
      (roleFilter === 'Technician' && u.role === 'TECHNICIAN') ||
      (roleFilter === 'Staff Employee' && u.role === 'EMPLOYEE') ||
      (roleFilter === 'End User / Customer' && u.role === 'CUSTOMER');

    const matchesDept =
      departmentFilter === 'All departments' ||
      (u.department && u.department.toLowerCase().includes(departmentFilter.toLowerCase())) ||
      (departmentFilter === 'IT Operations' && (u.department === 'IT Operations' || u.department === 'IT'));

    const statusVal = u.status || 'Active';
    const matchesStatus =
      accountStatusFilter === 'All' ||
      (accountStatusFilter === 'Active' && statusVal === 'Active') ||
      (accountStatusFilter === 'Suspended' && statusVal === 'Suspended');

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Award className="w-3 h-3 text-amber-600" />
            <span>Global Administrator</span>
          </span>
        );
      case 'HR_MANAGER':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Briefcase className="w-3 h-3 text-purple-600" />
            <span>HR Manager / Director</span>
          </span>
        );
      case 'FINANCE_MANAGER':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>Finance Manager / CFO</span>
          </span>
        );
      case 'IT_MANAGER':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Laptop className="w-3 h-3 text-cyan-600" />
            <span>IT Director / Lead</span>
          </span>
        );
      case 'FACILITIES_MANAGER':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <Building2 className="w-3 h-3 text-orange-600" />
            <span>Facilities Manager</span>
          </span>
        );
      case 'SUPERVISOR':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <Headphones className="w-3 h-3 text-sky-600" />
            <span>Supervisor / Lead</span>
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Wrench className="w-3 h-3 text-teal-600" />
            <span>Service Technician</span>
          </span>
        );
      case 'EMPLOYEE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span>Staff Employee</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>End User / Learner</span>
          </span>
        );
    }
  };

  // Department icon mapper
  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case 'Human Resources':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'Finance':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'IT Operations':
        return <Laptop className="w-5 h-5 text-cyan-600" />;
      case 'Facilities':
        return <Building2 className="w-5 h-5 text-orange-600" />;
      case 'Customer Support':
        return <Headphones className="w-5 h-5 text-sky-600" />;
      default:
        return <Layers className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-5 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5 text-slate-900 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Department Leadership & Staff Governance
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive matrix of department head managers, functional responsibilities, and granular user roles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold">
            <button
              onClick={() => setViewTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setViewTab('leadership')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewTab === 'leadership'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Department Heads ({leadership.length || 6})</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: LEADERSHIP MATRIX VIEW */}
      {viewTab === 'leadership' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-slate-50 border border-sky-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                  Departmental Leadership Framework
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Specialized Heads of Department & Delegated Responsibilities
                </h2>
                <p className="text-xs text-slate-600 max-w-3xl">
                  Each departmental leader exercises oversight, policy enforcement, SLA monitoring, and approval delegation for their respective operational division.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 font-semibold bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>6 Active Divisions</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(leadership.length > 0 ? leadership : [
              {
                department: 'Human Resources',
                title: 'Head of Human Resources / HR Director',
                roleKey: 'HR_MANAGER',
                responsibilities: [
                  'Manages end-to-end recruitment, hiring, & onboardings',
                  'Employee training & professional development programs',
                  'Employee relations, grievance resolution, & workplace culture',
                  'Payroll verification, leave approvals, & compensation reviews'
                ],
                currentLeaderName: 'Nomsa Mthembu',
                currentLeaderEmail: 'hr.manager@capaciti.org',
                approvalScope: ['Leave Approvals > 5 Days', 'New Hire Equipment Kits', 'Workplace Policy Changes'],
                accentColor: 'purple'
              },
              {
                department: 'Finance',
                title: 'Chief Financial Officer / Finance Controller',
                roleKey: 'FINANCE_MANAGER',
                responsibilities: [
                  'Departmental budget allocation, oversight, & variance audits',
                  'Cash flow management & treasury operations',
                  'Financial record-keeping, balance sheets, & auditing',
                  'Corporate tax compliance, VAT filings, & CapEx approval'
                ],
                currentLeaderName: 'Sipho Ndlovu',
                currentLeaderEmail: 'finance.manager@capaciti.org',
                approvalScope: ['Expenditures > R5,000', 'Cloud Infra Subscriptions', 'Annual Departmental Budgets'],
                accentColor: 'emerald'
              },
              {
                department: 'IT Operations',
                title: 'IT Director & Systems Architect',
                roleKey: 'IT_MANAGER',
                responsibilities: [
                  'Enterprise IT infrastructure & cloud platform architecture',
                  'Cybersecurity posture, Okta IAM, & zero-trust access control',
                  'Hardware provisioning, staging servers, & network uptime',
                  'Automated incident triage & SLA compliance enforcement'
                ],
                currentLeaderName: 'Thabo Khumalo',
                currentLeaderEmail: 'it.director@capaciti.org',
                approvalScope: ['Root IAM & Firewall Rules', 'High-Risk Production Deployments', 'Hardware Requisitions'],
                accentColor: 'cyan'
              },
              {
                department: 'Facilities',
                title: 'Head of Facilities & Workplace Operations',
                roleKey: 'FACILITIES_MANAGER',
                responsibilities: [
                  'Building maintenance, biometric access cards, & physical security',
                  'HVAC, electrical power grids, generator/UPS continuity',
                  'Health, workplace safety (OHS), & ergonomic desk setups',
                  'Office supplies, vendor logistics, & workstation allocations'
                ],
                currentLeaderName: 'Lerato Sithole',
                currentLeaderEmail: 'facilities.manager@capaciti.org',
                approvalScope: ['Office Keycard Access', 'Contractor Site Permits', 'Physical Repairs & Assets'],
                accentColor: 'orange'
              },
              {
                department: 'Customer Support',
                title: 'Customer Support & Service Desk Lead',
                roleKey: 'SUPERVISOR',
                responsibilities: [
                  'Customer success, helpdesk queue triage, & ticket dispatch',
                  'First-contact resolution rate monitoring & CSAT scores',
                  'Escalation handling for high-priority user incidents',
                  'Technician shift coverage & knowledge base maintenance'
                ],
                currentLeaderName: 'Naledi Khumalo',
                currentLeaderEmail: 'manager@capaciti.org',
                approvalScope: ['SLA Breach Exemptions', 'Urgent Ticket Reassignments', 'Client Dispute Resolutions'],
                accentColor: 'sky'
              },
              {
                department: 'Operations',
                title: 'Global System Administrator & COO',
                roleKey: 'ADMIN',
                responsibilities: [
                  'Enterprise-wide operations & cross-departmental alignment',
                  'System security auditing, role-based privileges & DSAR signing',
                  'Executive reporting, business intelligence & KPI governance',
                  'Multi-tenant cloud scaling & platform reliability'
                ],
                currentLeaderName: 'Executive Leadership Team',
                currentLeaderEmail: 'admin@capaciti.org',
                approvalScope: ['Enterprise-Wide Policies', 'System Privilege Elevation', 'Regulatory DSAR Compliance Signing'],
                accentColor: 'blue'
              }
            ]).map((dept, idx) => {
              const assignedUsersCount = users.filter(
                (u) => u.department && (u.department.toLowerCase().includes(dept.department.toLowerCase()) || (dept.department === 'IT Operations' && u.department === 'IT'))
              ).length;

              return (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-2xs">
                          {getDeptIcon(dept.department)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{dept.department}</h3>
                          <p className="text-[11px] font-semibold text-slate-500">{dept.title}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {assignedUsersCount} Staff
                      </span>
                    </div>

                    {/* Current Leader */}
                    <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Current Department Head</span>
                        <span className="text-sky-600 font-semibold">{dept.roleKey}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{dept.currentLeaderName}</p>
                      <p className="text-[11px] font-mono text-slate-600">{dept.currentLeaderEmail}</p>
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Core Functional Responsibilities
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {dept.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-tight">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Approval Scopes */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Authorized Approval Scope
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dept.approvalScope.map((scope, sIdx) => (
                          <span 
                            key={sIdx} 
                            className="text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded-md"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setDepartmentFilter(dept.department);
                        setViewTab('users');
                      }}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>View Department Staff</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW TAB 2: ALL USERS TABLE VIEW */}
      {viewTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Role Governance & Security Policy Notice */}
          <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sky-950 flex items-center space-x-2">
                  <span>Default Account Role: End User</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-sky-200/80 text-sky-800 px-2 py-0.5 rounded-md">
                    Enforced
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  All self-registered accounts are automatically assigned as standard <strong>End Users</strong>. Only <strong>Administrators</strong> have authority to assign, elevate, or revoke operational roles (Technician, Supervisor, Department Manager, Administrator).
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="self-start sm:self-auto shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision User</span>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search name or email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Search staff, title, or email</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, job title, email..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Role / Authority</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer transition-colors"
                >
                  <option value="All roles">All roles</option>
                  <option value="Administrator">Administrator (Global Executive)</option>
                  <option value="HR Manager">HR Manager / Director</option>
                  <option value="Finance Manager">Finance Manager / CFO</option>
                  <option value="IT Director">IT Director / Tech Head</option>
                  <option value="Facilities Manager">Facilities Manager</option>
                  <option value="Department Supervisor">All Department Supervisors & Heads</option>
                  <option value="Technician">Service Technician</option>
                  <option value="Staff Employee">Staff Employee</option>
                  <option value="End User / Customer">End User / Learner</option>
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer transition-colors"
                >
                  <option value="All departments">All departments</option>
                  <option value="Human Resources">Human Resources (HR)</option>
                  <option value="Finance">Finance & Accounting</option>
                  <option value="IT Operations">IT & Cloud Systems</option>
                  <option value="Facilities">Facilities & Workplace</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Procurement">Procurement</option>
                </select>
              </div>

              {/* Account Status Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={accountStatusFilter}
                  onChange={(e) => setAccountStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer transition-colors"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Accounts</option>
                  <option value="Suspended">Suspended Accounts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-xs">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
                <span>Loading user database...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No users match the selected filters.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 font-bold bg-slate-50/60">
                      <th className="py-3.5 px-4">Staff Member & Title</th>
                      <th className="py-3.5 px-4">Email Address</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Leadership Role</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Email Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredUsers.map((u) => {
                      const isSuspended = u.status === 'Suspended';
                      const isCurrentUser = currentUser.id === u.id;

                      return (
                        <tr 
                          key={u.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSuspended ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs ${
                                u.role === 'ADMIN' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : u.role === 'HR_MANAGER'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'FINANCE_MANAGER'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.role === 'IT_MANAGER'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : u.role === 'FACILITIES_MANAGER'
                                  ? 'bg-orange-100 text-orange-800'
                                  : u.role === 'TECHNICIAN'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span>{u.name}</span>
                                  {isCurrentUser && (
                                    <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.2 rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                                {u.jobTitle && (
                                  <p className="text-[11px] font-normal text-slate-500">{u.jobTitle}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                            <span className="inline-flex items-center space-x-1 text-slate-800 font-semibold">
                              <span>{u.department || 'IT Operations'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getRoleBadge(u.role)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isSuspended ? (
                              <span className="inline-flex items-center space-x-1 text-rose-600 text-[11px] font-bold bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Suspended</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-emerald-600 text-[11px] font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                <Check className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {u.emailVerified !== false ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-600 text-[11px] font-semibold">
                                <Check className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Assign Role / Dept */}
                              <button
                                type="button"
                                onClick={() => handleOpenRoleModal(u)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                                title="Edit Role and Department"
                              >
                                Edit Role
                              </button>

                              {/* Audit History */}
                              <button
                                type="button"
                                onClick={() => setSelectedUserForHistory(u)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                                title="View Audit History"
                              >
                                History
                              </button>

                              {/* Suspend / Activate Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleSuspend(u)}
                                disabled={isCurrentUser}
                                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-colors cursor-pointer shadow-2xs ${
                                  isCurrentUser
                                    ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                                    : isSuspended
                                    ? 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200'
                                }`}
                              >
                                {isSuspended ? 'Activate' : 'Suspend'}
                              </button>

                              {/* Delete User */}
                              <button
                                type="button"
                                onClick={() => setSelectedUserForDelete(u)}
                                disabled={isCurrentUser}
                                className={`p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
                                  isCurrentUser ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Role & Department Modal */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Assign Departmental Leadership & Role</span>
              </h3>
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Update access privileges and operational department for <span className="font-bold text-slate-900">{selectedUserForRole.name}</span> (<span className="font-mono text-slate-700">{selectedUserForRole.email}</span>).
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Privilege Role & Departmental Authority</label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <optgroup label="Executive & System Admin">
                    <option value="ADMIN">👑 System Administrator (Global Executive)</option>
                  </optgroup>
                  <optgroup label="Department Leadership & Heads">
                    <option value="HR_MANAGER">👥 HR Manager / HR Director (Hiring & Payroll)</option>
                    <option value="FINANCE_MANAGER">💰 Finance Manager / CFO (Budgets & Cash Flow)</option>
                    <option value="IT_MANAGER">💻 IT Director / Tech Head (Systems & IAM)</option>
                    <option value="FACILITIES_MANAGER">🏢 Facilities Manager (Workplace & Assets)</option>
                    <option value="SUPERVISOR">🎧 Customer Support / Helpdesk Supervisor</option>
                  </optgroup>
                  <optgroup label="Operational Staff">
                    <option value="TECHNICIAN">🛠️ Service Technician</option>
                    <option value="EMPLOYEE">👤 Staff Employee</option>
                    <option value="CUSTOMER">🎓 End User / Candidate / Learner</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Department</label>
                <select
                  value={newSelectedDept}
                  onChange={(e) => setNewSelectedDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Human Resources">Human Resources (HR)</option>
                  <option value="Finance">Finance & Accounting</option>
                  <option value="IT Operations">IT Operations & Systems</option>
                  <option value="Facilities">Facilities & Workplace</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Operations">Operations</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Sales">Sales & Marketing</option>
                  <option value="General">General Administrative</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForRole(null)}
                disabled={isSubmittingRole}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoleAndDept}
                disabled={isSubmittingRole}
                className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                {isSubmittingRole && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmittingRole ? 'Saving Changes...' : 'Save Role & Dept'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Delete User Account
                </h3>
                <p className="text-[11px] text-slate-500">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-slate-700 space-y-1">
              <p>
                Are you sure you want to permanently remove <span className="font-bold text-slate-900">{selectedUserForDelete.name}</span>?
              </p>
              <p className="font-mono text-[11px] text-slate-600">
                Email: {selectedUserForDelete.email}
              </p>
              <p className="text-[11px] text-slate-500">
                Role: {selectedUserForDelete.role} | Department: {selectedUserForDelete.department || 'IT Operations'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-sky-600" />
                <span>Create New User Account</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nomsa Mthembu"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hr.manager@capaciti.org"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create a secure password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Privilege Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                    <option value="IT_MANAGER">IT Director</option>
                    <option value="FACILITIES_MANAGER">Facilities Manager</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="EMPLOYEE">Staff Employee</option>
                    <option value="CUSTOMER">End User</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="IT Operations">IT Operations</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Operations">Operations</option>
                    <option value="Procurement">Procurement</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  {isCreatingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isCreatingUser ? 'Creating...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Audit Log History Modal */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 text-xs animate-in fade-in duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Security & Audit Log History
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
              <p className="font-bold text-slate-900">{selectedUserForHistory.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">{selectedUserForHistory.email}</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Role: <span className="font-semibold">{selectedUserForHistory.role}</span> | Department: <span className="font-semibold">{selectedUserForHistory.department || 'IT Operations'}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {auditLogs.filter(
                (log) => 
                  log.actorUserId === selectedUserForHistory.id || 
                  log.targetId === selectedUserForHistory.id || 
                  log.actorEmail.toLowerCase() === selectedUserForHistory.email.toLowerCase() ||
                  (log.details && log.details.toLowerCase().includes(selectedUserForHistory.email.toLowerCase()))
              ).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No explicit audit events recorded for this user yet.
                </div>
              ) : (
                auditLogs.filter(
                  (log) => 
                    log.actorUserId === selectedUserForHistory.id || 
                    log.targetId === selectedUserForHistory.id || 
                    log.actorEmail.toLowerCase() === selectedUserForHistory.email.toLowerCase() ||
                    (log.details && log.details.toLowerCase().includes(selectedUserForHistory.email.toLowerCase()))
                ).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.details}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedUserForHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
