import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  RotateCcw,
  Download,
  Calendar,
  Building,
  Phone,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  KeyRound,
  FileText,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  MemberProfile,
  ProfileUpdateRequest,
  MemberAuditLog,
  DigitalMembershipCard,
  MemberStatus,
} from '../types';
import {
  getMembersFromFirestore,
  addMemberToFirestore,
  updateMemberInFirestore,
  deleteMemberFromFirestore,
  changeMemberStatus,
  adminResetMemberPassword,
  getProfileUpdateRequests,
  reviewProfileUpdateRequest,
  generateOrReissueMembershipCard,
  revokeMembershipCard,
  getMemberAuditLogs,
  getMemberCards,
  NewMemberInput,
  INITIAL_SAMPLE_MEMBERS,
  seedInitialMembersIfEmpty,
} from '../services/memberService';

interface MemberManagementAdminProps {
  onNotify: (msg: string) => void;
}

export const MemberManagementAdmin: React.FC<MemberManagementAdminProps> = ({ onNotify }) => {
  const [subTab, setSubTab] = useState<'register' | 'pending' | 'add' | 'cards' | 'audit'>('register');
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<MemberAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MemberStatus>('All');
  const [cadreFilter, setCadreFilter] = useState('All');
  const [officeFilter, setOfficeFilter] = useState('All');

  // Modals
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null);
  const [resetPassMember, setResetPassMember] = useState<MemberProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    memberId: string;
    membershipId: string;
    memberName: string;
  } | null>(null);

  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    isOpen: boolean;
    member: MemberProfile;
    newStatus: MemberStatus;
  } | null>(null);

  const [cardIssueModal, setCardIssueModal] = useState<{
    isOpen: boolean;
    member: MemberProfile;
    action: 'Generate' | 'Reissue';
  } | null>(null);

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    req: ProfileUpdateRequest;
    decision: 'Approved' | 'Rejected';
    remarks: string;
  } | null>(null);

  const [revokeCardModal, setRevokeCardModal] = useState<{
    isOpen: boolean;
    cardId: string;
    membershipId: string;
    memberName: string;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Add Member Form State
  const [addName, setAddName] = useState('');
  const [addCadre, setAddCadre] = useState('Postal Assistant');
  const [addOffice, setAddOffice] = useState('Dhenkanal Head Post Office');
  const [addMobile, setAddMobile] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addJoiningDate, setAddJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [addValidFrom, setAddValidFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [addValidTo, setAddValidTo] = useState(() => `${new Date().getFullYear() + 2}-12-31`);
  const [addStatus, setAddStatus] = useState<MemberStatus>('Active');
  const [addPhotoUrl, setAddPhotoUrl] = useState('');
  const [addPassword, setAddPassword] = useState('Member@1234');
  const [addRemarks, setAddRemarks] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load all records
  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, reqsData, auditData] = await Promise.all([
        getMembersFromFirestore(),
        getProfileUpdateRequests(),
        getMemberAuditLogs(),
      ]);
      setMembers(membersData);
      setRequests(reqsData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error('Error loading member administration data:', err);
      onNotify('⚠️ Failed to load some member records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.membershipId.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.office.toLowerCase().includes(q) ||
        m.cadre.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' ? true : m.status === statusFilter;
      const matchesCadre = cadreFilter === 'All' ? true : m.cadre === cadreFilter;
      const matchesOffice = officeFilter === 'All' ? true : m.office.toLowerCase().includes(officeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCadre && matchesOffice;
    });
  }, [members, searchQuery, statusFilter, cadreFilter, officeFilter]);

  // Unique cadres and offices for filter dropdowns
  const uniqueCadres = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.cadre).filter(Boolean)));
  }, [members]);

  const uniqueOffices = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.office).filter(Boolean)));
  }, [members]);

  // Handle Add Member Submit
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const input: NewMemberInput = {
        name: addName.trim(),
        cadre: addCadre.trim(),
        office: addOffice.trim(),
        mobile: addMobile.trim(),
        email: addEmail.trim(),
        address: addAddress.trim(),
        dateOfJoining: addJoiningDate,
        status: addStatus,
        validFrom: addValidFrom,
        validTo: addValidTo,
        photoUrl: addPhotoUrl.trim(),
        password: addPassword.trim() || 'Member@1234',
        remarks: addRemarks.trim(),
      };

      await addMemberToFirestore(input, 'Admin Portal (Divisional Secretary)');
      onNotify(`✅ Successfully enrolled Comrade ${addName} with status ${addStatus}!`);
      // Reset form
      setAddName('');
      setAddMobile('');
      setAddEmail('');
      setAddAddress('');
      setAddRemarks('');
      setSubTab('register');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add member.');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Edit Member Submit
  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await updateMemberInFirestore(
        editingMember.id,
        editingMember,
        'Admin Portal (Divisional Secretary)'
      );
      onNotify(`✅ Successfully updated record for ${editingMember.name} (${editingMember.membershipId})`);
      setEditingMember(null);
      await loadData();
    } catch (err: any) {
      onNotify(`❌ Failed to update member: ${err.message || 'Error saving changes'}`);
    }
  };

  // Handle Quick Status Change confirmation
  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal) return;
    const { member, newStatus } = statusConfirmModal;
    try {
      await changeMemberStatus(member.id, newStatus, 'Divisional admin update', 'Divisional Secretary');
      onNotify(`✅ Status changed to ${newStatus} for ${member.name}`);
      setStatusConfirmModal(null);
      await loadData();
    } catch (err: any) {
      onNotify(`❌ Failed to update status: ${err.message}`);
    }
  };

  // Handle Card Issue / Reissue confirmation
  const handleConfirmCardIssue = async () => {
    if (!cardIssueModal) return;
    const { member, action } = cardIssueModal;
    try {
      await generateOrReissueMembershipCard(member, 'Divisional Secretary', `${action} requested via Admin`);
      onNotify(`✅ Digital Card successfully ${action.toLowerCase()}d with a live verification token!`);
      setCardIssueModal(null);
      await loadData();
    } catch (err: any) {
      onNotify(`❌ Failed to generate card: ${err.message}`);
    }
  };

  // Handle Delete Member Confirmation
  const handleConfirmDeleteMember = async () => {
    if (!deleteConfirmModal) return;
    try {
      await deleteMemberFromFirestore(deleteConfirmModal.memberId, 'Divisional Secretary');
      onNotify(`🗑️ Member ${deleteConfirmModal.memberName} (${deleteConfirmModal.membershipId}) removed from register.`);
      setDeleteConfirmModal(null);
      await loadData();
    } catch (err: any) {
      onNotify(`❌ Failed to delete member: ${err.message}`);
    }
  };

  // Handle Revoke Card
  const handleConfirmRevokeCard = async () => {
    if (!revokeCardModal) return;
    try {
      await revokeMembershipCard(
        revokeCardModal.cardId,
        revokeReason || 'Revoked by Divisional Authority',
        'Divisional Secretary'
      );
      onNotify(`🚫 Card for ${revokeCardModal.membershipId} revoked and QR verification invalidated.`);
      setRevokeCardModal(null);
      setRevokeReason('');
      await loadData();
    } catch (err: any) {
      onNotify(`❌ Failed to revoke card: ${err.message}`);
    }
  };

  // Handle Review Profile Update Request
  const handleConfirmReviewRequest = async () => {
    if (!reviewModal) return;
    try {
      await reviewProfileUpdateRequest(
        reviewModal.req.id,
        reviewModal.decision,
        reviewModal.remarks || `${reviewModal.decision} by Divisional Secretary`,
        'Divisional Secretary'
      );
      onNotify(`✅ Request #${reviewModal.req.id.slice(0, 8)} marked as ${reviewModal.decision}.`);
      setReviewModal(null);
      await loadData();
    } catch (err: any) {
      onNotify(`❌ Failed to process request: ${err.message}`);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassMember || !newPasswordInput.trim()) return;
    try {
      await adminResetMemberPassword(
        resetPassMember.membershipId,
        newPasswordInput.trim(),
        'Divisional Secretary'
      );
      onNotify(`🔑 Password successfully updated for ${resetPassMember.membershipId}!`);
      setResetPassMember(null);
      setNewPasswordInput('');
    } catch (err: any) {
      onNotify(`❌ Failed to reset password: ${err.message}`);
    }
  };

  // Restore sample members
  const handleRestoreSampleMembers = async () => {
    setLoading(true);
    try {
      await seedInitialMembersIfEmpty();
      await loadData();
      onNotify('✅ Initial Dhenkanal Union members loaded successfully!');
    } catch (err: any) {
      onNotify(`❌ Error loading members: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ================= EXPORT MEMBERS REGISTER (EXCEL / CSV) =================
  // Strictly protects against spreadsheet formula injection by prepending `'`
  const escapeCsvFormula = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    // Escape double quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = (fileType: 'csv' | 'xlsx') => {
    const headers = [
      'Membership ID',
      'Member Name',
      'Cadre / Designation',
      'Office / Post Office',
      'Division',
      'Mobile Number',
      'Email',
      'Address',
      'Date of Joining',
      'Status',
      'Valid From',
      'Valid To',
      'Active Card Token',
      'Approved By',
      'Remarks',
    ];

    const rows = filteredMembers.map((m) => [
      escapeCsvFormula(m.membershipId),
      escapeCsvFormula(m.name),
      escapeCsvFormula(m.cadre),
      escapeCsvFormula(m.office),
      escapeCsvFormula(m.division || 'Dhenkanal'),
      escapeCsvFormula(m.mobile),
      escapeCsvFormula(m.email),
      escapeCsvFormula(m.address),
      escapeCsvFormula(m.dateOfJoining),
      escapeCsvFormula(m.status),
      escapeCsvFormula(m.validFrom),
      escapeCsvFormula(m.validTo),
      escapeCsvFormula(m.activeCardToken || 'None'),
      escapeCsvFormula(m.approvedBy || ''),
      escapeCsvFormula(m.remarks || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AIPEU_Dhenkanal_Members_Register_${new Date().toISOString().split('T')[0]}.${fileType === 'xlsx' ? 'csv' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify('📥 Member register successfully exported!');
  };

  // Stats
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'Active').length;
  const pendingCount = members.filter((m) => m.status === 'Pending').length;
  const expiredCount = members.filter((m) => m.status === 'Expired').length;
  const pendingReqCount = requests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Members
          </span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{totalCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Active Members
          </span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending Approval
          </span>
          <span className="text-xl font-black text-amber-700 mt-0.5 block">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
            Update Requests
          </span>
          <span className="text-xl font-black text-red-700 mt-0.5 block">{pendingReqCount}</span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSubTab('register')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'register'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Members Register ({filteredMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              subTab === 'pending'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Update Requests ({requests.length})
            {pendingReqCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px]">
                {pendingReqCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('add')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'add'
                ? 'bg-[#022A61] text-white shadow-xs'
                : 'bg-blue-50 text-[#022A61] hover:bg-blue-100'
            }`}
          >
            + Add New Member
          </button>

          <button
            type="button"
            onClick={() => setSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCsv('csv')}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Export protected CSV register"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Refresh database"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ================= 1. MEMBERS REGISTER ================= */}
      {subTab === 'register' && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Membership ID, mobile number, name, office, or cadre..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#022A61]"
                />
              </div>

              {/* + Add Member button directly accessible */}
              <button
                type="button"
                onClick={() => setSubTab('add')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Member</span>
              </button>

              {/* Status filter */}
              <div className="flex items-center gap-1 shrink-0 overflow-x-auto py-1">
                {(['All', 'Active', 'Pending', 'Expired'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === s
                        ? 'bg-[#022A61] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Cadre & Office Filters */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-400 text-[10px] uppercase">Filters:</span>
              <select
                value={cadreFilter}
                onChange={(e) => setCadreFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
              >
                <option value="All">All Cadres</option>
                {uniqueCadres.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
              >
                <option value="All">All Offices</option>
                {uniqueOffices.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              {(searchQuery || statusFilter !== 'All' || cadreFilter !== 'All' || officeFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setCadreFilter('All');
                    setOfficeFilter('All');
                  }}
                  className="text-red-600 hover:underline text-[11px] font-bold ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Member Details</th>
                    <th className="px-4 py-3">Cadre &amp; Office</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Validity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">
                            {members.length === 0
                              ? 'No union members found in the Dhenkanal Division database.'
                              : 'No members match your search or filter criteria.'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {members.length === 0
                              ? 'You can initialize the directory with verified Dhenkanal Division members or enroll a new member.'
                              : 'Try adjusting your search query, cadre, or status filter.'}
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            {members.length === 0 && (
                              <button
                                type="button"
                                onClick={handleRestoreSampleMembers}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
                              >
                                Load Sample Members
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSubTab('add')}
                              className="px-4 py-2 bg-[#022A61] hover:bg-[#0A3D80] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Add Member</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 overflow-hidden">
                              {m.photoUrl ? (
                                <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                m.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{m.name}</span>
                              <span className="font-mono text-[10px] font-bold text-red-600">{m.membershipId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 block">{m.cadre}</span>
                          <span className="text-slate-500 text-[11px] block">{m.office}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 block">+91 {m.mobile}</span>
                          <span className="text-slate-400 text-[11px] block truncate max-w-[140px]">{m.email || 'N/A'}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-slate-700 block text-[11px] font-medium">To: {m.validTo}</span>
                          <span className="text-slate-400 text-[10px] block">Joined: {m.dateOfJoining}</span>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus: MemberStatus =
                                m.status === 'Active' ? 'Pending' : m.status === 'Pending' ? 'Active' : 'Active';
                              setStatusConfirmModal({
                                isOpen: true,
                                member: m,
                                newStatus: nextStatus,
                              });
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-block cursor-pointer hover:opacity-80 transition-opacity ${
                              m.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                            title="Click to toggle status"
                          >
                            {m.status} ▾
                          </button>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Member Details */}
                            <button
                              type="button"
                              onClick={() => setEditingMember({ ...m })}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#022A61] hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Edit Member Information"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Card Generation / Reissue */}
                            {m.status === 'Active' && (
                              <button
                                type="button"
                                onClick={() =>
                                  setCardIssueModal({
                                    isOpen: true,
                                    member: m,
                                    action: m.activeCardToken ? 'Reissue' : 'Generate',
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                title={m.activeCardToken ? 'Reissue Digital Card' : 'Generate Digital Card'}
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}

                            {/* Revoke Card button if active */}
                            {m.activeCardId && (
                              <button
                                type="button"
                                onClick={() =>
                                  setRevokeCardModal({
                                    isOpen: true,
                                    cardId: m.activeCardId!,
                                    membershipId: m.membershipId,
                                    memberName: m.name,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Revoke Digital Card"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => {
                                setResetPassMember(m);
                                setNewPasswordInput('Member@1234');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Delete Member */}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmModal({
                                  isOpen: true,
                                  memberId: m.id,
                                  membershipId: m.membershipId,
                                  memberName: m.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. PENDING PROFILE UPDATE REQUESTS ================= */}
      {subTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h4 className="font-black text-sm text-slate-900">
              Profile Update Requests from Members
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve member-submitted updates. Approved changes immediately update the master register and reissue the digital card.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
              No profile update requests found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400">
                        Request ID: #{req.id.slice(0, 8)} • Submitted on {req.requestedAt?.split('T')[0]}
                      </span>
                      <h5 className="font-black text-slate-900 text-sm mt-0.5">
                        {req.memberName} ({req.membershipId})
                      </h5>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Comparison Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                        Current Approved Values
                      </span>
                      <ul className="space-y-1 text-slate-600">
                        {Object.entries(req.proposedChanges).map(([k]) => (
                          <li key={k}>
                            <span className="font-semibold capitalize">{k}:</span>{' '}
                            {String((req.currentValues as any)?.[k] || 'Not Set')}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-[#022A61] text-[10px] uppercase block mb-1">
                        Proposed New Values
                      </span>
                      <ul className="space-y-1 text-slate-900 font-medium">
                        {Object.entries(req.proposedChanges).map(([k, v]) => (
                          <li key={k} className="text-blue-900">
                            <span className="font-bold capitalize">{k}:</span> {String(v)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions for Pending */}
                  {req.status === 'Pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          setReviewModal({
                            isOpen: true,
                            req,
                            decision: 'Rejected',
                            remarks: 'Rejected by Divisional Secretary',
                          })
                        }
                        className="px-4 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs cursor-pointer"
                      >
                        Reject Request
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReviewModal({
                            isOpen: true,
                            req,
                            decision: 'Approved',
                            remarks: 'Approved by Divisional Secretary',
                          })
                        }
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Approve &amp; Update Record
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 3. ADD NEW MEMBER ================= */}
      {subTab === 'add' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs max-w-2xl mx-auto space-y-6">
          <div>
            <h4 className="font-black text-lg text-slate-900">
              Enroll New Union Member
            </h4>
            <p className="text-xs text-slate-500">
              Register a postal employee under Dhenkanal Division. Generates unique Membership ID and PBKDF2 secure login credentials.
            </p>
          </div>

          <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Full Member Name *
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Comrade Rajesh Kumar Jena"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Designation / Cadre *
                </label>
                <select
                  value={addCadre}
                  onChange={(e) => setAddCadre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
                >
                  <option value="Postal Assistant">Postal Assistant (PA)</option>
                  <option value="Postman">Postman</option>
                  <option value="Multi-Tasking Staff (MTS)">Multi-Tasking Staff (MTS)</option>
                  <option value="GDS BPM">GDS Branch Postmaster (BPM)</option>
                  <option value="GDS ABPM / Dak Sevak">GDS ABPM / Dak Sevak</option>
                  <option value="Sorting Assistant">Sorting Assistant (SA)</option>
                  <option value="Mail Guard">Mail Guard</option>
                  <option value="Inspector of Posts">Inspector of Posts</option>
                  <option value="Other Postal Cadre">Other Postal Cadre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Office / Post Office *
                </label>
                <input
                  type="text"
                  value={addOffice}
                  onChange={(e) => setAddOffice(e.target.value)}
                  placeholder="e.g. Dhenkanal Division or Kamakhyanagar SO"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Registered Mobile (10 Digits) *
                </label>
                <input
                  type="tel"
                  value={addMobile}
                  onChange={(e) => setAddMobile(e.target.value)}
                  placeholder="e.g. 9861184651"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="comrade@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={addJoiningDate}
                  onChange={(e) => setAddJoiningDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Residential / Communication Address
              </label>
              <textarea
                value={addAddress}
                onChange={(e) => setAddAddress(e.target.value)}
                placeholder="At/PO, District, PIN..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Membership Status *
                </label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value as MemberStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                >
                  <option value="Active">Active (Issue Card)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Valid Through Date
                </label>
                <input
                  type="date"
                  value={addValidTo}
                  onChange={(e) => setAddValidTo(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Initial Password
                </label>
                <input
                  type="text"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Member@1234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSubTab('register')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="px-6 py-2.5 rounded-xl bg-[#022A61] hover:bg-[#0A3D80] text-white font-bold shadow-sm disabled:opacity-60"
              >
                {isAdding ? 'Enrolling...' : 'Enroll Member & Issue ID'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= 4. AUDIT TRAIL ================= */}
      {subTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-3 p-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-black text-sm text-slate-900">Administrator Audit Trail</h4>
            <p className="text-xs text-slate-400">
              Immutable logging of all membership approvals, card revocations, status updates, and password resets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Administrator</th>
                  <th className="px-3 py-2">Target Member</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-400">
                        {log.timestamp?.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#022A61] text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{log.actor}</td>
                      <td className="px-3 py-2 font-mono font-bold text-red-600">{log.targetMembershipId}</td>
                      <td className="px-3 py-2 text-slate-700">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EDIT MEMBER MODAL ================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-black text-base text-slate-900">
                  Edit Member Record
                </h4>
                <span className="font-mono text-xs font-bold text-red-600">
                  {editingMember.membershipId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMemberSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Member Name</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cadre</label>
                  <input
                    type="text"
                    value={editingMember.cadre}
                    onChange={(e) => setEditingMember({ ...editingMember, cadre: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Office</label>
                  <input
                    type="text"
                    value={editingMember.office}
                    onChange={(e) => setEditingMember({ ...editingMember, office: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registered Mobile</label>
                  <input
                    type="tel"
                    value={editingMember.mobile}
                    onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address</label>
                <textarea
                  value={editingMember.address || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valid To Date</label>
                  <input
                    type="date"
                    value={editingMember.validTo || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, validTo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as MemberStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#022A61] text-white text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      {resetPassMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h4 className="font-black text-base text-slate-900 mb-1">
              Reset Member Password
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Set a new secure password for {resetPassMember.name} ({resetPassMember.membershipId}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassMember(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= REVOKE CARD MODAL ================= */}
      {revokeCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="font-black text-base text-slate-900 mb-1">
              Revoke Digital Membership Card?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure? Revoking this card will immediately invalidate its live online QR verification token. Anyone scanning this card's QR code will see that it has been revoked.
            </p>

            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Revocation Reason *</label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Card replaced, member transferred, or card reported lost"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRevokeCardModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevokeCard}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MEMBER MODAL ================= */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="font-black text-base text-slate-900 mb-1">
              Delete Member Record?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{deleteConfirmModal.memberName}</strong> (<span className="font-mono text-red-600 font-bold">{deleteConfirmModal.membershipId}</span>) from the official union register?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STATUS CHANGE MODAL ================= */}
      {statusConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="font-black text-base text-slate-900 mb-1">
              Change Membership Status?
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Update status of <strong className="text-slate-900">{statusConfirmModal.member.name}</strong> from <span className="font-bold">{statusConfirmModal.member.status}</span> to <span className="font-black text-blue-900">{statusConfirmModal.newStatus}</span>?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className="flex-1 py-2.5 rounded-xl bg-[#022A61] hover:bg-[#0A3D80] text-white font-bold shadow-xs cursor-pointer"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIGITAL CARD ISSUE / REISSUE MODAL ================= */}
      {cardIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#022A61] flex items-center justify-center mb-3">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="font-black text-base text-slate-900 mb-1">
              {cardIssueModal.action} Digital Membership Card
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {cardIssueModal.action === 'Reissue'
                ? `Reissuing this digital card for ${cardIssueModal.member.name} will generate a new verification token and invalidate previous card tokens.`
                : `Generate a new digital membership card with a verified QR token for ${cardIssueModal.member.name}.`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCardIssueModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCardIssue}
                className="flex-1 py-2.5 rounded-xl bg-[#022A61] hover:bg-[#0A3D80] text-white font-bold shadow-xs cursor-pointer"
              >
                {cardIssueModal.action} Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPDATE REQUEST REVIEW MODAL ================= */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl">
            <h4 className="font-black text-base text-slate-900 mb-1">
              {reviewModal.decision} Profile Update Request
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Member: <strong className="text-slate-800">{reviewModal.req.memberName}</strong> ({reviewModal.req.membershipId})
            </p>
            <div className="mb-4">
              <label className="font-bold text-slate-700 block mb-1 text-xs">
                Administrative Remarks
              </label>
              <input
                type="text"
                value={reviewModal.remarks}
                onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Enter remarks..."
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReviewRequest}
                className={`flex-1 py-2.5 rounded-xl font-bold shadow-xs cursor-pointer text-xs text-white ${
                  reviewModal.decision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {reviewModal.decision}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
