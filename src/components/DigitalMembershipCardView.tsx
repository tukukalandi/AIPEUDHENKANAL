import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import {
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  Calendar,
  Building,
  User,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import { MemberProfile, DigitalMembershipCard } from '../types';
import { PRIMARY_BRAND_LOGO } from '../data/logos';

interface DigitalMembershipCardViewProps {
  member: MemberProfile;
  card?: DigitalMembershipCard | null;
  onRefresh?: () => void;
}

export const DigitalMembershipCardView: React.FC<DigitalMembershipCardViewProps> = ({
  member,
  card,
  onRefresh,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${window.location.origin}/?verifyCard=${member.activeCardToken || card?.cardToken || ''}`;

  useEffect(() => {
    const token = member.activeCardToken || card?.cardToken;
    if (token) {
      QRCode.toDataURL(verificationUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#022A61',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR Code:', err));
    }
  }, [member.activeCardToken, card?.cardToken, verificationUrl]);

  // Check eligibility
  if (member.status !== 'Active') {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 sm:p-8 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
          Digital Membership Card Unavailable
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          {member.status === 'Pending'
            ? 'Your membership application is currently under verification. Digital membership cards are automatically generated and issued once approved by the Divisional Secretary.'
            : `Your membership expired on ${member.validTo || 'earlier dates'}. Please contact the Divisional Treasurer or submit a renewal request to restore active status and card validity.`}
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 text-xs font-bold">
          Current Status: {member.status}
        </div>
      </div>
    );
  }

  if (!member.activeCardToken && !card?.cardToken) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
          Card Generation in Progress
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Your active membership card has not been initialized yet. Click below to refresh your card details from the server.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-5 py-2.5 bg-[#022A61] hover:bg-[#0A3D80] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <RotateCw className="w-4 h-4" />
            <span>Refresh Card Details</span>
          </button>
        )}
      </div>
    );
  }

  // Handle PDF Generation
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Page background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');

      // Top Header
      doc.setFillColor(2, 42, 97); // #022A61
      doc.rect(15, 15, 180, 20, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('ALL INDIA POSTAL EMPLOYEES UNION', 105, 24, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(253, 224, 71); // Amber
      doc.text('NATIONAL FEDERATION OF POSTAL EMPLOYEES (NFPE) • DHENKANAL DIVISION', 105, 30, {
        align: 'center',
      });

      // Card Box (ID Card dimension: 160mm x 100mm)
      const cardX = 25;
      const cardY = 45;
      const cardW = 160;
      const cardH = 102;

      // Card Outer border & shadow
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'F');
      doc.setDrawColor(2, 42, 97);
      doc.setLineWidth(0.8);
      doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'D');

      // Card Header Ribbon
      doc.setFillColor(2, 42, 97);
      doc.rect(cardX, cardY, cardW, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('ALL INDIA POSTAL EMPLOYEES UNION', cardX + 8, cardY + 8);
      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36);
      doc.text('CLASS III & POSTAL EMPLOYEES • DHENKANAL DIVISION', cardX + 8, cardY + 14);

      // Card Badge: OFFICIAL DIGITAL MEMBERSHIP CARD
      doc.setFillColor(220, 38, 38); // Red
      doc.rect(cardX + cardW - 45, cardY + 3, 40, 6, 'F');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('DIGITAL ID CARD', cardX + cardW - 25, cardY + 7.2, { align: 'center' });

      // Member Photo Placeholder / Avatar Box
      const photoX = cardX + 10;
      const photoY = cardY + 24;
      const photoW = 32;
      const photoH = 38;

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'D');

      // Silhouette text placeholder
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('MEMBER', photoX + photoW / 2, photoY + photoH / 2 - 2, { align: 'center' });
      doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2 + 3, { align: 'center' });

      // Member Info Column
      const infoX = cardX + 48;
      let textY = cardY + 28;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(member.name, infoX, textY);

      textY += 6;
      doc.setFontSize(9);
      doc.setTextColor(185, 28, 28); // Crimson red
      doc.text(`ID: ${member.membershipId}`, infoX, textY);

      doc.setFillColor(220, 252, 231);
      doc.roundedRect(infoX + 50, textY - 4.5, 22, 5.5, 1.5, 1.5, 'F');
      doc.setFontSize(7);
      doc.setTextColor(22, 101, 52);
      doc.text('ACTIVE', infoX + 61, textY - 0.5, { align: 'center' });

      textY += 6.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Cadre / Post:', infoX, textY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(member.cadre, infoX + 24, textY);

      textY += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Office / Branch:', infoX, textY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(member.office, infoX + 24, textY);

      textY += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Division:', infoX, textY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Dhenkanal Division', infoX + 24, textY);

      textY += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Date of Joining:', infoX, textY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(member.dateOfJoining || 'N/A', infoX + 24, textY);

      textY += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Valid Through:', infoX, textY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28);
      doc.text(member.validTo || '2027-12-31', infoX + 24, textY);

      // Embedded QR Code (Bottom Right of card)
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', cardX + cardW - 38, cardY + cardH - 38, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(2, 42, 97);
        doc.text('SCAN TO VERIFY', cardX + cardW - 23, cardY + cardH - 5, { align: 'center' });
      }

      // Bottom Bar of Card
      doc.setFillColor(241, 245, 249);
      doc.rect(cardX, cardY + cardH - 10, cardW - 40, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text('AUTHORIZED DIGITAL IDENTITY • AIPEU DHENKANAL DIVISION', cardX + 8, cardY + cardH - 4);

      // Explanatory Instructions under Card
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Verification & Security Instructions:', 25, 160);
      doc.setFontSize(8);
      doc.text(
        '1. This digital card certifies legitimate union membership with AIPEU Class III, Dhenkanal Division.',
        25,
        167
      );
      doc.text(
        '2. Scan the QR code to verify the active status in real-time on the official divisional server.',
        25,
        173
      );
      doc.text(
        '3. If revoked, expired, or replaced, the live QR verification will instantly reflect the current state.',
        25,
        179
      );
      doc.text(
        '4. For any corrections or updates, submit a Profile Update Request through the Member Portal.',
        25,
        185
      );

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(25, 200, 185, 200);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • AIPEU Dhenkanal Division Official Portal`,
        105,
        206,
        { align: 'center' }
      );

      doc.save(`AIPEU_Membership_Card_${member.membershipId}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Clean Card Print
  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (hidden during print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Official Digital Membership Card
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
            Active &amp; Issued
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-[#022A61] hover:bg-[#0A3D80] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Download PDF Card with embedded QR code"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintCard}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            title="Print clean card layout"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Card</span>
          </button>
        </div>
      </div>

      {/* 💳 The Digital Card Container */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          id="printable-membership-card"
          className="w-full max-w-lg bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl border-2 border-[#022A61] shadow-xl overflow-hidden relative"
        >
          {/* Card Top Brand Header */}
          <div className="bg-[#022A61] text-white px-5 py-3 flex items-center justify-between border-b border-amber-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm ring-1 ring-amber-400 shrink-0 flex items-center justify-center">
                <img
                  src={PRIMARY_BRAND_LOGO}
                  alt="AIPEU Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-amber-300 block uppercase">
                  National Federation of Postal Employees
                </span>
                <h3 className="text-sm font-black tracking-tight text-white leading-tight">
                  ALL INDIA POSTAL EMPLOYEES UNION
                </h3>
                <span className="text-[10px] font-bold text-blue-200">
                  Class III • Dhenkanal Division Branch
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-red-600 text-[9px] font-black tracking-wider text-white uppercase shadow-xs">
                MEMBER ID
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Left: Photo column */}
            <div className="sm:col-span-4 flex flex-col items-center text-center">
              <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm flex items-center justify-center relative">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <User className="w-10 h-10 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">No Photo</span>
                  </div>
                )}
              </div>
              <span className="mt-2 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                {member.membershipId}
              </span>
            </div>

            {/* Right: Member Details */}
            <div className="sm:col-span-8 space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Member Name
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {member.name}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Designation / Cadre
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {member.cadre}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Division
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Dhenkanal Division
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Office / Branch
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {member.office}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Date of Joining
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {member.dateOfJoining || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Validity Period
                  </span>
                  <span className="font-black text-red-600 dark:text-red-400">
                    {member.validFrom || '2026-01-01'} to {member.validTo || '2027-12-31'}
                  </span>
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer with Scannable QR Code */}
          <div className="bg-slate-100/90 dark:bg-slate-800/90 px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Authorized Digital Union Identity</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Scan QR code with any smartphone to verify official registration status.
              </p>
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 bg-white p-1 rounded-xl shadow-xs border border-slate-200">
                  <img src={qrDataUrl} alt="QR Verification" className="w-full h-full object-contain" />
                </div>
                <span className="text-[8px] font-bold text-[#022A61] dark:text-blue-300 mt-0.5 uppercase tracking-wider">
                  Scan QR
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Note under Card */}
      <div className="no-print max-w-lg mx-auto bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#022A61] dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Zero-Exposure Privacy &amp; Live Verification:
            </p>
            <p className="text-[11px] leading-relaxed">
              The QR code verification points to a secure token and will never expose your mobile number, home address, or password to the public. If your card is revoked or reissued by the Divisional Authority, this QR verification will instantly invalidate previous cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
