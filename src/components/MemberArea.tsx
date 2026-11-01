import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  RotateCw,
  Send,
  HelpCircle,
  Clock,
  FileEdit,
  ArrowRight,
  Shield,
  KeyRound,
} from 'lucide-react';
import { MemberProfile, MemberSession, ProfileUpdateRequest } from '../types';
import {
  loginMember,
  getActiveMemberSession,
  getLiveMemberProfile,
  logoutMember,
  requestPasswordReset,
} from '../services/memberAuth';
import {
  submitProfileUpdateRequest,
  getProfileUpdateRequests,
} from '../services/memberService';
import { DigitalMembershipCardView } from './DigitalMembershipCardView';

interface MemberAreaProps {
  onBackToPortalHome?: () => void;
}

export const MemberArea: React.FC<MemberAreaProps> = ({ onBackToPortalHome }) => {
  // Session State
  const [session, setSession] = useState<MemberSession | null>(() => getActiveMemberSession());
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // Active Member Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'card' | 'requests'>('profile');

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Forgot Password State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Profile Update Request Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateCadre, setUpdateCadre] = useState('');
  const [updateOffice, setUpdateOffice] = useState('');
  const [updateMobile, setUpdateMobile] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updateAddress, setUpdateAddress] = useState('');
  const [updatePhotoUrl, setUpdatePhotoUrl] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  // Member's own update requests list
  const [myRequests, setMyRequests] = useState<ProfileUpdateRequest[]>([]);

  // Refresh live member profile from Firestore to enforce live authentication and authorization
  const refreshMember = async (currentSession?: MemberSession | null) => {
    const s = currentSession || session;
    if (!s) return;
    setLoadingMember(true);
    try {
      const live = await getLiveMemberProfile(s.memberId);
      if (live) {
        setMember(live);
        // Load update requests
        const allReqs = await getProfileUpdateRequests();
        setMyRequests(allReqs.filter((r) => r.memberId === live.id));
      } else {
        // Member record no longer exists
        handleLogout();
      }
    } catch (err) {
      console.warn('Could not load live member:', err);
    } finally {
      setLoadingMember(false);
    }
  };

  useEffect(() => {
    if (session) {
      refreshMember(session);
    }
  }, [session?.memberId]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMsg('');
    setLoginLoading(true);

    try {
      const res = await loginMember(identifier, password);
      if (res.success && res.member && res.session) {
        setSession(res.session);
        setMember(res.member);
        setLoginSuccessMsg('Login successful!');
        // Populate update form defaults
        setUpdateCadre(res.member.cadre);
        setUpdateOffice(res.member.office);
        setUpdateMobile(res.member.mobile);
        setUpdateEmail(res.member.email);
        setUpdateAddress(res.member.address);
        setUpdatePhotoUrl(res.member.photoUrl || '');
        refreshMember(res.session);
      } else {
        setLoginError(res.message || 'Login failed. Please verify your credentials.');
      }
    } catch {
      setLoginError('An unexpected error occurred during login. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutMember();
    setSession(null);
    setMember(null);
    setActiveTab('profile');
    setIdentifier('');
    setPassword('');
    setLoginError('');
    setLoginSuccessMsg('');
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const res = await requestPasswordReset(forgotIdentifier);
      setForgotMessage(res.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Submit Profile Update Request
  const handleSubmitProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setSubmittingUpdate(true);
    setUpdateSuccessMsg('');

    try {
      const proposed: ProfileUpdateRequest['proposedChanges'] = {};
      if (updateCadre.trim() !== member.cadre) proposed.cadre = updateCadre.trim();
      if (updateOffice.trim() !== member.office) proposed.office = updateOffice.trim();
      if (updateMobile.trim() !== member.mobile) proposed.mobile = updateMobile.trim();
      if (updateEmail.trim() !== member.email) proposed.email = updateEmail.trim();
      if (updateAddress.trim() !== member.address) proposed.address = updateAddress.trim();
      if (updatePhotoUrl.trim() !== (member.photoUrl || '')) proposed.photoUrl = updatePhotoUrl.trim();

      if (Object.keys(proposed).length === 0) {
        alert('No changes were detected in the form.');
        setSubmittingUpdate(false);
        return;
      }

      await submitProfileUpdateRequest(member, proposed);
      setUpdateSuccessMsg('Your profile update request has been submitted for Divisional Executive approval.');
      setIsUpdateModalOpen(false);
      refreshMember();
    } catch (err: any) {
      alert(err.message || 'Failed to submit update request.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  // ================= 1. LOGIN SCREEN (WHEN NOT AUTHENTICATED) =================
  if (!session || !member) {
    return (
      <div className="max-w-md mx-auto py-4 sm:py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#022A61] text-white flex items-center justify-center mx-auto mb-3 shadow-md ring-4 ring-blue-50 dark:ring-slate-800">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-500 block">
              SECURE MEMBER AREA
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Union Member Login
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Access your digital membership card, verified cadre profile, and union services.
            </p>
          </div>

          {/* Quick Demo Credentials Help */}
          <div className="mb-5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-[#022A61] dark:text-blue-300 mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Registered Member Credentials (Dhenkanal HO):</span>
            </div>
            <div className="font-mono text-[11px] space-y-0.5 text-slate-600 dark:text-slate-400">
              <p>ID: <span className="font-bold text-slate-900 dark:text-white">AIPEU-DKL-1001</span> or Mob: <span className="font-bold text-slate-900 dark:text-white">9861184651</span></p>
              <p>Password: <span className="font-bold text-slate-900 dark:text-white">Member@1234</span></p>
            </div>
          </div>

          {/* Error & Success Messages */}
          {loginError && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccessMsg && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{loginSuccessMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Membership ID or Mobile Number *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. AIPEU-DKL-1001 or 9861184651"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#022A61] dark:focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs font-bold text-[#022A61] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your member password"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#022A61] dark:focus:ring-blue-500 pr-10 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#022A61] hover:bg-[#0A3D80] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loginLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Secure Member Login</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy & Anti-Abuse notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Protected by PBKDF2 cryptographic hashing and rate limiting. Plaintext passwords are never stored. For membership enrollment, contact the Divisional Secretary.
            </p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {isForgotOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Password Reset &amp; Recovery</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(false);
                    setForgotMessage('');
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              </div>

              {forgotMessage ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-slate-700 dark:text-slate-300 p-4 rounded-2xl text-xs leading-relaxed">
                    {forgotMessage}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(false);
                      setForgotMessage('');
                    }}
                    className="w-full bg-[#022A61] text-white py-2.5 rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter your Membership ID or registered 10-digit mobile number. We will dispatch reset instructions or notify the Divisional Secretary for assisted recovery.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Membership ID or Registered Mobile
                    </label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. AIPEU-DKL-1001 or 9861184651"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#022A61] hover:bg-[#0A3D80] text-white text-xs font-bold disabled:opacity-60"
                    >
                      {forgotLoading ? 'Submitting...' : 'Request Reset'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= 2. AUTHENTICATED MEMBER DASHBOARD =================
  const isActive = member.status === 'Active';
  const isPending = member.status === 'Pending';
  const isExpired = member.status === 'Expired';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Welcome & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                {member.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : isPending
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                }`}
              >
                {member.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-bold text-red-600 dark:text-red-400">{member.membershipId}</span> • {member.cadre} • {member.office}
            </p>
          </div>
        </div>

        {/* Member Navigation Tabs & Logout Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#022A61] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            My Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-[#022A61] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Membership Card
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'requests'
                ? 'bg-[#022A61] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Update Requests
            {myRequests.some((r) => r.status === 'Pending') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title="Log out of member session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Status Alert if Pending or Expired */}
      {isPending && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Membership Verification Pending Approval</p>
            <p className="leading-relaxed">
              Your registration with Dhenkanal Division is awaiting confirmation by the Divisional Secretary. During pending status, union grievance filing and contact directories remain available, while digital card generation is activated upon approval.
            </p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-800 dark:text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Membership Has Expired</p>
            <p className="leading-relaxed">
              Your union membership subscription period expired on {member.validTo}. Please contact the Divisional Treasurer or submit a renewal update request to restore active status and card validity.
            </p>
          </div>
        </div>
      )}

      {/* Success notification for submitted request */}
      {updateSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{updateSuccessMsg}</span>
        </div>
      )}

      {/* ================= TAB 1: MY PROFILE ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h4 className="font-black text-lg text-slate-900 dark:text-white">
                Member Profile Information
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official employee record verified by AIPEU Dhenkanal Division.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setUpdateCadre(member.cadre);
                setUpdateOffice(member.office);
                setUpdateMobile(member.mobile);
                setUpdateEmail(member.email);
                setUpdateAddress(member.address);
                setUpdatePhotoUrl(member.photoUrl || '');
                setIsUpdateModalOpen(true);
              }}
              className="px-4 py-2 bg-[#022A61] hover:bg-[#0A3D80] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Request Profile Update</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Full Name */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Full Member Name
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {member.name}
              </span>
            </div>

            {/* Membership ID */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Official Membership ID (Unique)
              </span>
              <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                {member.membershipId}
              </span>
            </div>

            {/* Cadre / Designation */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Designation / Cadre
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {member.cadre}
              </span>
            </div>

            {/* Office / Post Office */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Office / Post Office
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {member.office}
              </span>
            </div>

            {/* Postal Division */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Postal Division
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Dhenkanal Division
              </span>
            </div>

            {/* Registered Mobile */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Registered Mobile Number
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 {member.mobile}</span>
              </span>
            </div>

            {/* Registered Email */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Registered Email
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{member.email || 'Not Provided'}</span>
              </span>
            </div>

            {/* Date of Joining */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Date of Joining Department / Union
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{member.dateOfJoining || 'N/A'}</span>
              </span>
            </div>

            {/* Validity Dates */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Membership Validity Period
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Valid from <span className="text-emerald-600">{member.validFrom || '2026-01-01'}</span> through{' '}
                <span className="text-red-600">{member.validTo || '2027-12-31'}</span>
              </span>
            </div>

            {/* Residential / Postal Address */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Residential / Postal Communication Address
              </span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {member.address || 'Address not registered'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DIGITAL MEMBERSHIP CARD ================= */}
      {activeTab === 'card' && (
        <DigitalMembershipCardView
          member={member}
          onRefresh={() => refreshMember()}
        />
      )}

      {/* ================= TAB 3: PROFILE UPDATE REQUESTS HISTORY ================= */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                Profile Update Requests
              </h4>
              <p className="text-xs text-slate-500">
                Track status of your submitted change requests. Approved changes update your record and reissue your digital card automatically.
              </p>
            </div>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No profile update requests submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Request #{req.id.slice(0, 8)} • {req.requestedAt?.split('T')[0]}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
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

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Proposed Changes:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      {Object.entries(req.proposedChanges).map(([k, v]) => (
                        <li key={k}>
                          <span className="capitalize font-semibold">{k}:</span> {String(v)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {req.reviewRemarks && (
                    <p className="text-[11px] text-slate-500 italic">
                      Review Remarks: "{req.reviewRemarks}" (by {req.reviewedBy || 'Admin'})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PROFILE UPDATE REQUEST MODAL ================= */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  Request Profile Update
                </h4>
                <p className="text-xs text-slate-400">
                  Submit proposed changes. Approved records will not change until verified by an administrator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProfileUpdate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Designation / Cadre
                  </label>
                  <input
                    type="text"
                    value={updateCadre}
                    onChange={(e) => setUpdateCadre(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Office / Post Office
                  </label>
                  <input
                    type="text"
                    value={updateOffice}
                    onChange={(e) => setUpdateOffice(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={updateMobile}
                    onChange={(e) => setUpdateMobile(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={updateEmail}
                    onChange={(e) => setUpdateEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Residential / Postal Address
                </label>
                <textarea
                  value={updateAddress}
                  onChange={(e) => setUpdateAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Member Photograph URL (Optional)
                </label>
                <input
                  type="url"
                  value={updatePhotoUrl}
                  onChange={(e) => setUpdatePhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">
                Notice: Members cannot modify their Membership ID, status, or validity dates. All submissions are audited by the Divisional Authority.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUpdate}
                  className="flex-1 py-2.5 rounded-xl bg-[#022A61] hover:bg-[#0A3D80] text-white text-xs font-bold disabled:opacity-60"
                >
                  {submittingUpdate ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
