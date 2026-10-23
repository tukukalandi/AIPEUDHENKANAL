import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Phone,
  Building,
  MapPin,
  Shield,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { OfficeBearer } from '../types';
import { saveExecutiveMemberToFirestore } from '../services/firebase';

interface AddOfficeBearerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBearerAdded?: (newBearer: OfficeBearer) => void;
}

const BRANCH_OPTIONS = [
  "AIPEU Group 'C', Dhenkanal Division",
  "AIPEU Postmen, MTS & Group 'D'",
  "AIGDSU Dhenkanal Division",
  "AIPRPA (Postal Pensioners)",
  "Divisional Women Sub-Committee",
  "National Federation of Postal Employees (NFPE)",
  "Staff Side JCM / Confederation",
];

const ROLE_OPTIONS: { id: OfficeBearer['roleType']; label: string }[] = [
  { id: 'president', label: 'President / Vice President' },
  { id: 'secretary', label: 'Divisional / Branch Secretary' },
  { id: 'treasurer', label: 'Financial Secretary / Treasurer' },
  { id: 'executive', label: 'Executive Member / Convener' },
];

export const AddOfficeBearerModal: React.FC<AddOfficeBearerModalProps> = ({
  isOpen,
  onClose,
  onBearerAdded,
}) => {
  const [formData, setFormData] = useState<Partial<OfficeBearer>>({
    name: '',
    designation: 'Executive Member',
    branch: "AIPEU Group 'C', Dhenkanal Division",
    phone: '',
    location: 'Dhenkanal HO',
    roleType: 'executive',
    photoUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Please enter the comrade / member name.');
      return;
    }
    if (!formData.designation?.trim()) {
      setErrorMsg('Please enter the union designation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newBearer: OfficeBearer = {
        name: formData.name.trim().startsWith('Com.')
          ? formData.name.trim()
          : `Com. ${formData.name.trim()}`,
        designation: formData.designation.trim(),
        branch: formData.branch || "AIPEU Group 'C', Dhenkanal Division",
        phone: formData.phone?.trim() || '',
        location: formData.location?.trim() || 'Dhenkanal HO',
        roleType: (formData.roleType as any) || 'executive',
        photoUrl: formData.photoUrl?.trim() || '',
      };

      // 1. Save to Firestore
      const savedId = await saveExecutiveMemberToFirestore(newBearer);
      newBearer.id = savedId;

      // 2. Update local storage cache
      try {
        const stored = localStorage.getItem('aipeu_office_bearers');
        const list: OfficeBearer[] = stored ? JSON.parse(stored) : [];
        list.push(newBearer);
        localStorage.setItem('aipeu_office_bearers', JSON.stringify(list));
      } catch {
        // ignore storage errors
      }

      // 3. Dispatch global sync event
      window.dispatchEvent(new CustomEvent('office-bearers-updated', { detail: newBearer }));

      if (onBearerAdded) {
        onBearerAdded(newBearer);
      }

      setSuccessMsg('Office bearer added successfully! Synchronized across Circulars, Feed & Directory.');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to add office bearer:', err);
      setErrorMsg('Failed to save office bearer. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400/50 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#022A61] via-[#083E82] to-[#B91C1C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-snug">
                Add Executive Office Bearer
              </h3>
              <p className="text-[11px] text-amber-200">
                Syncs in real-time across Circulars, Feed & Directory pages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Comrade Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Comrade Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Chandra Sahoo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Designation & Role Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Divisional President / Secretary"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Executive Rank / Role
              </label>
              <select
                value={formData.roleType || 'executive'}
                onChange={(e) => setFormData({ ...formData, roleType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Branch / Union Wing */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Affiliated Branch / Union Wing
            </label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Phone & Office Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98611 84651"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Office / Posting Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Dhenkanal HO / Hindol SO"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Photo URL (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Photo URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={formData.photoUrl || ''}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://... or leave empty for official union avatar"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Saving Comrade...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Save & Sync Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
