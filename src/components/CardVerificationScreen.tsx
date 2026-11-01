import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  XCircle,
  Calendar,
  Building,
  User,
  ExternalLink,
  RotateCw,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { CardVerificationResult } from '../types';
import { getCardVerificationByToken } from '../services/memberService';
import { PRIMARY_BRAND_LOGO } from '../data/logos';

interface CardVerificationScreenProps {
  token: string;
  onClose: () => void;
}

export const CardVerificationScreen: React.FC<CardVerificationScreenProps> = ({
  token,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CardVerificationResult | null>(null);

  const fetchVerification = async () => {
    setLoading(true);
    try {
      const res = await getCardVerificationByToken(token);
      setResult(res);
    } catch {
      setResult({
        token,
        status: 'Invalid',
        message: 'Could not connect to verification server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [token]);

  const isValid = result?.status === 'Valid';
  const isExpired = result?.status === 'Expired';
  const isRevoked = result?.status === 'Revoked';
  const isInvalid = !result || result.status === 'Invalid';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Official Header */}
        <div className="bg-[#022A61] text-white p-5 text-center relative">
          <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400 mx-auto mb-2.5 flex items-center justify-center">
            <img
              src={PRIMARY_BRAND_LOGO}
              alt="AIPEU Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase block">
            National Federation of Postal Employees
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
            ALL INDIA POSTAL EMPLOYEES UNION
          </h2>
          <p className="text-xs text-blue-200 font-medium">
            Class III • Dhenkanal Division Official Digital Identity Verification
          </p>
        </div>

        {/* Verification Status Banner */}
        <div className="p-6 sm:p-7">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RotateCw className="w-10 h-10 text-[#022A61] animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Verifying Official Union Records...
              </p>
              <p className="text-xs text-slate-400">
                Checking cryptographic token against Dhenkanal Division server.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Banner */}
              {isValid && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      VERIFICATION CONFIRMED
                    </span>
                    <h4 className="text-base font-black text-emerald-900 dark:text-emerald-100">
                      Official Valid Membership Card
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                      This member is actively registered in good standing with AIPEU Dhenkanal Division.
                    </p>
                  </div>
                </div>
              )}

              {isExpired && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      STATUS EXPIRED
                    </span>
                    <h4 className="text-base font-black text-amber-900 dark:text-amber-100">
                      Membership Card Has Expired
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
                      The card validity has expired. Please contact the union treasurer for renewal.
                    </p>
                  </div>
                </div>
              )}

              {isRevoked && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <XCircle className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-800 dark:text-red-300 block">
                      CARD REVOKED
                    </span>
                    <h4 className="text-base font-black text-red-900 dark:text-red-100">
                      Card Invalidated / Revoked
                    </h4>
                    <p className="text-xs text-red-700 dark:text-red-300/90 mt-0.5">
                      This digital membership card token has been revoked or reissued by Divisional Authority.
                    </p>
                  </div>
                </div>
              )}

              {isInvalid && (
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      UNVERIFIED RECORD
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Invalid or Unknown Token
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      No matching membership card record exists on the official server for this QR code.
                    </p>
                  </div>
                </div>
              )}

              {/* Minimal Verified Member Information (Zero PII exposure) */}
              {!isInvalid && result?.memberName && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Certified Member Identification
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Member Name
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {result.memberName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Membership ID
                      </span>
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
                        {result.membershipId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Designation / Cadre
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {result.cadre}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Office / Branch
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {result.office}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Postal Division
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Dhenkanal Division
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Card Validity
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {result.validFrom || '2026-01-01'} to {result.validTo || '2027-12-31'}
                      </span>
                    </div>
                  </div>

                  {/* Privacy Guarantee Note */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      Zero PII Privacy Protection: Personal contact details and home addresses are never exposed to public QR scanners.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-[#022A61] hover:bg-[#0A3D80] text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Website Home</span>
                </button>

                <button
                  type="button"
                  onClick={fetchVerification}
                  className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
                  title="Re-check server"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
