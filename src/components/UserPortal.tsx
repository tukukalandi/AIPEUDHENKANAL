import React, { useState } from 'react';
import {
  UserCheck,
  FileText,
  Send,
  Phone,
  Mail,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  ExternalLink,
  Copy,
  Clock,
} from 'lucide-react';
import { AppLanguage, PlatformStyle } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { UNION_CONTACT_INFO, UNION_BRANCHES, OFFICE_BEARERS } from '../data/unionInfo';
import { UNION_LOGOS, PRIMARY_BRAND_LOGO } from '../data/logos';

interface UserPortalProps {
  language?: AppLanguage;
  platform?: PlatformStyle;
  onNavigateTab?: (tab: any) => void;
}

interface GrievanceTicket {
  id: string;
  name: string;
  employeeId: string;
  cadre: string;
  office: string;
  phone: string;
  category: string;
  subject: string;
  details: string;
  timestamp: string;
  status: 'Submitted' | 'In Review' | 'Resolved';
}

export const UserPortal: React.FC<UserPortalProps> = ({
  language = 'en',
  platform = 'android',
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [activeSubTab, setActiveSubTab] = useState<'grievance' | 'forms' | 'wings' | 'helpline' | 'my-tickets'>('grievance');

  // Grievance Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    cadre: 'Postal Assistant (PA)',
    office: 'Dhenkanal HO',
    phone: '',
    category: 'Rule 38 Transfer',
    subject: '',
    details: '',
  });

  const [submittedTicket, setSubmittedTicket] = useState<GrievanceTicket | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Load existing tickets from localStorage
  const [myTickets, setMyTickets] = useState<GrievanceTicket[]>(() => {
    try {
      const stored = localStorage.getItem('aipeu_member_tickets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const cadreOptions = [
    'Postal Assistant (PA)',
    'Sorting Assistant (SA)',
    'Postman',
    'Multi-Tasking Staff (MTS)',
    'Gramin Dak Sevak (GDS BPM / ABPM / Dak Sevak)',
    'Postal Pensioner / Family Pensioner',
    'Casual / Contractual Worker',
    'System Administrator / System Assistant',
  ];

  const grievanceCategories = [
    'Rule 38 Transfer Delay / NOC',
    'MACP 1st / 2nd / 3rd Benchmark & Fixation',
    'GDS TRCA & Allowances Discrepancy',
    'Medical Reimbursement / CGHS Claim Delay',
    'Leave Sanction (EL / HPL / CCL / Paternity)',
    'Double Duty / Overtime Allowance (OTA)',
    'Uniform / Kit Maintenance Allowance',
    'Compassionate Appointment Case',
    'Harassment / Workplace Unreasonable Target Pressure',
    'Pension / Gratuity / Commutation Settlement',
    'Other Service Grievance',
  ];

  const downloadableForms = [
    {
      title: 'Rule 38 Transfer Application Form',
      desc: 'Standard proforma for Inter-Circle & Intra-Circle transfer request under Rule 38.',
      link: 'https://aipeup3dkl.blogspot.com/p/important-orders.html',
      badge: 'Transfer',
    },
    {
      title: 'CGHS & Medical Reimbursement Claim Form',
      desc: 'Form for claiming medical expenses, hospitalization and emergency treatments.',
      link: 'https://aipeup3dkl.blogspot.com/p/important-orders.html',
      badge: 'Medical',
    },
    {
      title: 'MACP Representation & Benchmark Proforma',
      desc: 'Representation format for delayed MACP financial upgradation.',
      link: 'https://aipeup3dkl.blogspot.com/p/important-orders.html',
      badge: 'Promotion',
    },
    {
      title: 'RTI Application Form A (Act 2005)',
      desc: 'Statutory format for seeking information from postal authorities under RTI.',
      link: 'https://aipeup3dkl.blogspot.com/p/register-of-trade-union-form-b.html',
      badge: 'RTI Act',
    },
    {
      title: 'Staff Adalat Grievance Proforma',
      desc: 'Format to present grievances in the Half-Yearly Divisional Staff Adalat.',
      link: 'https://drive.google.com/file/d/1ArNMez75hZPspwG6FDQu6uG4l67-ok_0/view',
      badge: 'Adalat',
    },
    {
      title: 'Union Membership Form B & Subscription Mandate',
      desc: 'Official membership enrollment and monthly check-off deduction authorization.',
      link: 'https://aipeup3dkl.blogspot.com/p/register-of-trade-union-form-b.html',
      badge: 'Union',
    },
    {
      title: 'Pension & Gratuity Calculation Sheet',
      desc: 'Proforma for verifying pension calculation, commutation value & DCRG.',
      link: 'https://aipeup3dkl.blogspot.com/p/important-orders.html',
      badge: 'Pension',
    },
    {
      title: 'Child Care Leave (CCL) Proforma',
      desc: 'Official leave application format for female postal employees.',
      link: 'https://aipeup3dkl.blogspot.com/p/important-orders.html',
      badge: 'Leave',
    },
  ];

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.subject.trim()) {
      alert('Please fill all required fields: Name, Phone, and Subject.');
      return;
    }

    const ticketNumber = `DKL-GRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: GrievanceTicket = {
      id: ticketNumber,
      name: formData.name.trim(),
      employeeId: formData.employeeId.trim() || 'N/A',
      cadre: formData.cadre,
      office: formData.office.trim(),
      phone: formData.phone.trim(),
      category: formData.category,
      subject: formData.subject.trim(),
      details: formData.details.trim(),
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Submitted',
    };

    const updated = [newTicket, ...myTickets];
    setMyTickets(updated);
    try {
      localStorage.setItem('aipeu_member_tickets', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmittedTicket(newTicket);
  };

  const handleCopyTicket = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleSendViaWhatsApp = (ticket: GrievanceTicket) => {
    const text = `*New Member Grievance Submitted*\n*Ticket ID:* ${ticket.id}\n*Name:* ${ticket.name} (${ticket.cadre})\n*Office:* ${ticket.office}\n*Mobile:* ${ticket.phone}\n*Category:* ${ticket.category}\n*Subject:* ${ticket.subject}\n*Details:* ${ticket.details}\n\nSubmitted via NFPE AIPEU Dhenkanal Division User Portal`;
    const url = `https://wa.me/919861184651?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in">
      {/* 🌟 Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#002D62] via-[#0A4B9C] to-[#C5221F] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>USER & MEMBER PORTAL</span>
              </span>
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">
                DHENKANAL DIVISION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.userPortalTitle}
            </h2>

            <p className="text-xs sm:text-sm text-slate-100 font-medium">
              {t.userPortalSubtitle}. Submit service grievances, download cadre forms, and connect directly with divisional union leadership.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>Helpline: Mob - 9861184651</span>
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>aipeup3dhenkanaldivn@gmail.com</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-amber-400/30">
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
              <img
                src={PRIMARY_BRAND_LOGO}
                alt="NFPE Crest"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Official Crest</div>
              <div className="text-xs font-black text-white leading-tight">NFPE & AIPEU</div>
              <div className="text-[10px] text-slate-300">Dhenkanal HO</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('grievance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeSubTab === 'grievance'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Submit Grievance / Request</span>
        </button>

        <button
          onClick={() => setActiveSubTab('forms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeSubTab === 'forms'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Cadre Form Downloads ({downloadableForms.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('wings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeSubTab === 'wings'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Union Wings & Eligibility</span>
        </button>

        <button
          onClick={() => setActiveSubTab('helpline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
            activeSubTab === 'helpline'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Executive Directory & Contacts</span>
        </button>

        {myTickets.length > 0 && (
          <button
            onClick={() => setActiveSubTab('my-tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
              activeSubTab === 'my-tickets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Submitted Requests ({myTickets.length})</span>
          </button>
        )}
      </div>

      {/* ================= 1. SUBMIT GRIEVANCE SECTION ================= */}
      {activeSubTab === 'grievance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-red-500/30 space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Send className="w-5 h-5 text-red-600" />
                <span>Submit Grievance / Service Issue</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your representation will be placed with the Divisional Secretary and taken up during Staff Adalat or bilateral discussions with SPOs Dhenkanal.
              </p>
            </div>

            {submittedTicket ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                      Grievance Successfully Registered!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Tracking Token: <span className="font-mono font-black text-sm">{submittedTicket.id}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                  <p><strong className="text-slate-900 dark:text-white">Applicant:</strong> {submittedTicket.name} ({submittedTicket.cadre})</p>
                  <p><strong className="text-slate-900 dark:text-white">Office:</strong> {submittedTicket.office}</p>
                  <p><strong className="text-slate-900 dark:text-white">Category:</strong> {submittedTicket.category}</p>
                  <p><strong className="text-slate-900 dark:text-white">Subject:</strong> {submittedTicket.subject}</p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleSendViaWhatsApp(submittedTicket)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Send directly to Divisional Secretary on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyTicket(submittedTicket.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedToken ? 'Token Copied!' : 'Copy Token'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setFormData({
                        name: '',
                        employeeId: '',
                        cadre: 'Postal Assistant (PA)',
                        office: 'Dhenkanal HO',
                        phone: '',
                        category: 'Rule 38 Transfer',
                        subject: '',
                        details: '',
                      });
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitGrievance} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Com. Rajesh Kumar Sahoo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Employee ID / CSI ID / PPO No.
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="e.g. 10048291"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cadre / Designation *
                    </label>
                    <select
                      value={formData.cadre}
                      onChange={(e) => setFormData({ ...formData, cadre: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      {cadreOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Post Office / Section *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.office}
                      onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                      placeholder="e.g. Bhuban SO / Hindol SO / Gondia BO"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number (WhatsApp Preferred) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9861184651"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Grievance Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      {grievanceCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brief Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Non-receipt of MACP fixation arrears since April 2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Statement / Particulars
                  </label>
                  <textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Provide relevant order numbers, date of joining, representation history, or specific difficulty faced..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Register Grievance with Division</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info Card */}
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-400 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Division Grievance Policy</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>All representations received through this portal are logged directly at Dhenkanal Division headquarters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Legitimate cases are sponsored in the Divisional Permanent Negotiating Committee (PNC) and Regional Staff Adalat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Confidentiality of member details is strictly safeguarded under trade union ethics.</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60">
                <div className="text-[11px] font-bold text-slate-500">Divisional Union Email</div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  aipeup3dhenkanaldivn@gmail.com
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-2">Secretary Direct Mobile</div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  Mob - 9861184651
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. FORMS DOWNLOAD SECTION ================= */}
      {activeSubTab === 'forms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Download className="w-5 h-5 text-red-600" />
                <span>Cadre Forms & Standard Representations</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Download verified formats for transfer, medical claim, MACP, and pension claims.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloadableForms.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-red-500 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                      {item.badge}
                    </span>
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / Open Form</span>
                  </a>
                  <span className="text-[11px] font-semibold text-slate-400">PDF / Doc</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. WINGS & ELIGIBILITY SECTION ================= */}
      {activeSubTab === 'wings' && (
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Affiliated Constituent Unions & Fraternal Bodies</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Official recognized federations, unions and pensioner associations representing all cadres in Dhenkanal Division.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {UNION_LOGOS.map((wing) => (
              <div
                key={wing.id}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img
                        src={wing.imagePath}
                        alt={wing.name}
                        className="w-full h-full object-contain rounded-full"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900">
                        {wing.shortName}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-snug line-clamp-2">
                        {wing.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      Cadre: <span className="text-slate-700 dark:text-slate-300 font-semibold">{wing.cadre}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {wing.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-amber-400">
                  <span>Dhenkanal Division Wing</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. EXECUTIVE DIRECTORY & HELPLINE ================= */}
      {activeSubTab === 'helpline' && (
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>Divisional Union Officers & Helplines</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Reach out for immediate guidance regarding division postings, transfers, or adalat representations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFFICE_BEARERS.slice(0, 6).map((bearer, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={bearer.photoUrl}
                      alt={bearer.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/50 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {bearer.name}
                      </h4>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400">
                        {bearer.designation}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {bearer.branch} · {bearer.location}
                  </p>
                </div>

                {bearer.phone && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={`tel:${bearer.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{bearer.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 5. MY TICKETS ================= */}
      {activeSubTab === 'my-tickets' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            My Submitted Representations ({myTickets.length})
          </h3>

          <div className="space-y-3">
            {myTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-lg">
                    {ticket.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {ticket.timestamp}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {ticket.subject}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Category:</strong> {ticket.category} · <strong>Office:</strong> {ticket.office}
                </p>

                {ticket.details && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    {ticket.details}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleSendViaWhatsApp(ticket)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    <span>Follow up on WhatsApp with Secretary</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
