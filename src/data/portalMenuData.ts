import { GalleryPhoto, CustomPortalApp, EmployeeResource } from '../types';

export const DEFAULT_GALLERY: GalleryPhoto[] = [
  {
    id: 'gal-1',
    title: 'AIPEU All India Postal Employees Union Conference 2026',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    category: 'Union Conference',
    date: '2026-01-15',
  },
  {
    id: 'gal-2',
    title: 'Divisional Staff Adalat & Redressal Meet Dhenkanal',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    category: 'Staff Adalat',
    date: '2026-01-26',
  },
  {
    id: 'gal-3',
    title: 'Speed Post 24 Hub & India Post Parcel Logistics',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    category: 'Department Operations',
    date: '2026-02-18',
  },
  {
    id: 'gal-4',
    title: 'Philatelic Heritage Exhibition at Dhenkanal Head Post Office',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    category: 'Philately',
    date: '2026-03-05',
  },
];

export const ACG_17_RECEIPT_GENERATOR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ACG-17 Receipt Generator - Department of Posts</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f3f6;
      color: #1e293b;
      padding: 24px 20px 60px 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    .tool-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      border-top: 5px solid #b91c1c;
      padding: 24px 28px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      margin-bottom: 24px;
    }
    .tool-title {
      color: #b91c1c;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tool-subtitle {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 22px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 24px;
      margin-bottom: 16px;
    }
    @media (max-width: 640px) {
      .grid-2 { grid-template-columns: 1fr; }
      body { padding: 12px 10px 40px 10px; }
      .tool-card { padding: 16px; }
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    label {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 6px;
    }
    input[type="text"],
    input[type="date"],
    textarea {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: all 0.2s;
    }
    input:focus, textarea:focus {
      border-color: #b91c1c;
      box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12);
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    .btn-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      margin-bottom: 12px;
    }
    .btn-print {
      background: #c5221f;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-print:hover {
      background: #a51d1a;
    }
    .btn-print:active {
      transform: scale(0.98);
    }
    .btn-clear {
      background: #f59e0b;
      color: #111827;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-clear:hover {
      background: #d97706;
      color: #ffffff;
    }
    .btn-clear:active {
      transform: scale(0.98);
    }
    .helper-text {
      font-size: 12px;
      color: #64748b;
    }
    .preview-heading {
      font-size: 17px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
    }
    /* Official Postal ACG-17 Frame */
    .receipt-container {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
    .receipt-box {
      border: 2px solid #8b0000;
      background: #fffdf9;
      padding: 28px 32px;
      font-family: "Times New Roman", Times, Georgia, serif;
      color: #111111;
      line-height: 1.8;
      position: relative;
    }
    .receipt-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .receipt-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .dept-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1px;
      margin: 8px 0 4px 0;
      text-transform: uppercase;
    }
    .dept-note {
      font-size: 13px;
      font-weight: 600;
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.4;
    }
    .receipt-tag {
      font-size: 20px;
      font-weight: 800;
      margin-top: 10px;
      letter-spacing: 2px;
    }
    .receipt-row {
      font-size: 16px;
      margin-bottom: 12px;
    }
    .dotted-fill {
      border-bottom: 1px dotted #333333;
      padding: 0 6px;
      font-weight: 700;
      font-family: inherit;
    }
    .receipt-amount-block {
      margin-top: 24px;
      font-size: 19px;
      font-weight: 900;
    }
    .receipt-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 48px;
      padding-top: 10px;
    }
    .sig-box {
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }
    .sig-line {
      border-top: 1px solid #333;
      padding-top: 6px;
      min-width: 220px;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .receipt-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .receipt-box {
        border: 2px solid #000000 !important;
        background: #ffffff !important;
        padding: 24px !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Top Form Card -->
    <div class="tool-card no-print">
      <h1 class="tool-title">ACG-17 Receipt Generator</h1>
      <p class="tool-subtitle">Enter the required details below. The receipt preview will update automatically.</p>

      <div class="grid-2">
        <div class="form-group">
          <label for="receiptDate">Date</label>
          <input type="date" id="receiptDate">
        </div>
        <div class="form-group">
          <label for="voucherNo">Voucher No.</label>
          <input type="text" id="voucherNo" placeholder="e.g. 2" value="2">
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label for="amountRs">Amount (Rs.)</label>
          <input type="text" id="amountRs" placeholder="e.g. 5000" value="5000">
        </div>
        <div class="form-group">
          <label for="receivedFrom">Received From</label>
          <input type="text" id="receivedFrom" placeholder="e.g. Sub Postmaster, Gooty - 515401" value="Sub Postmaster, Gooty - 515401">
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 12px;">
        <label for="onAccountOf">On Account Of</label>
        <textarea id="onAccountOf" placeholder="Enter the purpose / account description">Office Contingency and Stationery settlement for AIPEU Dhenkanal Division operations.</textarea>
      </div>

      <div class="btn-group">
        <button class="btn-print" onclick="window.print()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          Print / Save as PDF
        </button>
        <button class="btn-clear" onclick="clearForm()">Clear All</button>
      </div>
      <p class="helper-text">Amount in words is generated automatically in Indian numbering style (Thousand/Lakh/Crore).</p>
    </div>

    <!-- Live Preview Section -->
    <h2 class="preview-heading no-print">Receipt Preview</h2>
    
    <div class="receipt-container">
      <div class="receipt-box" id="printableReceipt">
        <!-- Top row: ACG-17 & Please Pay Rs -->
        <div class="receipt-top">
          <span>A.C.G.- 17</span>
          <span style="font-style: italic;">
            Please Pay Rs. <span id="previewPayAmount" class="dotted-fill">5,000/-</span>
          </span>
        </div>

        <!-- Official Header -->
        <div class="receipt-header">
          <div class="logo-container">
            <svg width="68" height="42" viewBox="0 0 140 85" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 45 C30 20 85 10 135 15 C95 28 45 40 10 70 Z" fill="#b91c1c"/>
              <path d="M25 50 C50 35 90 28 130 30 C85 45 50 60 20 75 Z" fill="#b91c1c" opacity="0.85"/>
              <text x="70" y="82" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="bold" fill="#000">भारतीय डाक / India Post</text>
            </svg>
          </div>
          <div class="dept-title">DEPARTMENT OF POSTS - INDIA</div>
          <div class="dept-note">
            (See Note below Rules 6 (b) of Appendix II to Posts and Telegraphs Financial Handbook Volume I)<br>
            2nd Edition 2nd Reprinting)
          </div>
          <div class="receipt-tag">/Receipt</div>
        </div>

        <!-- Body -->
        <div class="receipt-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            The <span id="previewDate" class="dotted-fill">--/--/----</span>
          </div>
          <div>
            Voucher No <span id="previewVoucher" class="dotted-fill">2</span>
          </div>
        </div>

        <div class="receipt-row">
          Received from <span id="previewFrom" class="dotted-fill">Sub Postmaster, Gooty - 515401</span>
        </div>

        <div class="receipt-row">
          the sum of Rupees <span id="previewWords" class="dotted-fill">Five Thousand Rupees Only</span>
        </div>

        <div class="receipt-row" style="margin-bottom: 24px;">
          on account of <span id="previewPurpose" class="dotted-fill">Office Contingency and Stationery settlement for AIPEU Dhenkanal Division operations.</span>
        </div>

        <!-- Amount Highlight -->
        <div class="receipt-amount-block">
          Rs. <span id="previewAmountBox" style="font-size: 22px; text-decoration: underline;">5,000.00</span>
        </div>

        <!-- Signatures -->
        <div class="receipt-signatures">
          <div class="sig-box">
            <div class="sig-line">(Signature and designation of the person receiving money)</div>
          </div>
          <div class="sig-box" style="text-align: right;">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 2px;">Sub-Postmaster / Postmaster</div>
            <div style="font-size: 11px; color: #555;">(With Postal Office Seal &amp; Date)</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Indian Number to Words converter
    function numberToIndianWords(num) {
      if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
      
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      function convertGroup(n) {
        let str = '';
        if (n > 99) {
          str += a[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n > 19) {
          str += b[Math.floor(n / 10)] + ' ';
          n %= 10;
        }
        if (n > 0) {
          str += a[n] + ' ';
        }
        return str.trim();
      }

      num = Math.floor(Number(num));
      let words = '';

      const crore = Math.floor(num / 10000000);
      num %= 10000000;
      const lakh = Math.floor(num / 100000);
      num %= 100000;
      const thousand = Math.floor(num / 1000);
      num %= 1000;
      const remainder = num;

      if (crore > 0) words += convertGroup(crore) + ' Crore ';
      if (lakh > 0) words += convertGroup(lakh) + ' Lakh ';
      if (thousand > 0) words += convertGroup(thousand) + ' Thousand ';
      if (remainder > 0) words += convertGroup(remainder) + ' ';

      return (words.trim() ? words.trim() : 'Zero') + ' Rupees Only';
    }

    // Format Indian Number Currency
    function formatIndianCurrency(n) {
      if (!n || isNaN(n)) return '0.00';
      const num = Number(n);
      return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function updatePreview() {
      const dateVal = document.getElementById('receiptDate').value;
      const voucherVal = document.getElementById('voucherNo').value || '---';
      const amountRaw = document.getElementById('amountRs').value.replace(/[^0-9.]/g, '');
      const fromVal = document.getElementById('receivedFrom').value || '---';
      const purposeVal = document.getElementById('onAccountOf').value || '---';

      let formattedDate = '--/--/----';
      if (dateVal) {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
          formattedDate = parts[2] + '-' + parts[1] + '-' + parts[0];
        }
      }

      const numVal = parseFloat(amountRaw) || 0;
      const words = numberToIndianWords(numVal);
      const formattedCurrency = formatIndianCurrency(numVal);

      document.getElementById('previewDate').textContent = formattedDate;
      document.getElementById('previewVoucher').textContent = voucherVal;
      document.getElementById('previewFrom').textContent = fromVal;
      document.getElementById('previewWords').textContent = words;
      document.getElementById('previewPurpose').textContent = purposeVal;
      document.getElementById('previewAmountBox').textContent = formattedCurrency;
      document.getElementById('previewPayAmount').textContent = numVal > 0 ? (numVal.toLocaleString('en-IN') + '/-') : '0/-';
    }

    function clearForm() {
      document.getElementById('voucherNo').value = '';
      document.getElementById('amountRs').value = '';
      document.getElementById('receivedFrom').value = '';
      document.getElementById('onAccountOf').value = '';
      updatePreview();
    }

    // Set default today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('receiptDate').value = today;

    // Attach listeners
    ['receiptDate', 'voucherNo', 'amountRs', 'receivedFrom', 'onAccountOf'].forEach(function(id) {
      document.getElementById(id).addEventListener('input', updatePreview);
    });

    // Initial render
    updatePreview();
  </script>
</body>
</html>`;

export const TARGET_CALCULATOR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Target Calculator - Postal Operations</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #f8fafc; color: #1e293b; padding: 18px; }
    .card { max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #b91c1c, #dc2626); color: white; padding: 20px; }
    .header h1 { font-size: 19px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 12px; opacity: 0.9; }
    .body { padding: 20px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }
    .btn { width: 100%; background: #dc2626; color: white; border: none; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; margin-top: 6px; }
    .btn:hover { background: #b91c1c; }
    .results { margin-top: 20px; padding-top: 18px; border-top: 1px dashed #cbd5e1; display: none; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
    .stat-box { background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
    .stat-box.highlight { background: #fef2f2; border: 1px solid #fecaca; }
    .stat-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .stat-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .stat-box.highlight .stat-val { color: #dc2626; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🎯 Target & Achievement Calculator</h1>
      <p>AIPEU Dhenkanal Division • Postal & GDS Performance Calculator</p>
    </div>
    <div class="body">
      <div class="form-group">
        <label>Monthly Target (Units / Premium in ₹)</label>
        <input type="number" id="target" value="1000" placeholder="e.g. 1000">
      </div>
      <div style="display: flex; gap: 10px;">
        <div class="form-group" style="flex: 1;">
          <label>Total Working Days</label>
          <input type="number" id="totalDays" value="25" placeholder="e.g. 25">
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Days Completed</label>
          <input type="number" id="daysPassed" value="10" placeholder="e.g. 10">
        </div>
      </div>
      <div class="form-group">
        <label>Current Achievement Done</label>
        <input type="number" id="achieved" value="450" placeholder="e.g. 450">
      </div>
      <button class="btn" onclick="calculate()">Calculate Performance</button>

      <div class="results" id="results">
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">Achievement Rate</div>
            <div class="stat-val" id="percentVal">0%</div>
          </div>
          <div class="stat-box highlight">
            <div class="stat-label">Balance Remaining</div>
            <div class="stat-val" id="balanceVal">0</div>
          </div>
          <div class="stat-box highlight">
            <div class="stat-label">Required Per Day</div>
            <div class="stat-val" id="runRateVal">0 / day</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Projected Month End</div>
            <div class="stat-val" id="projectedVal">0</div>
          </div>
        </div>
        <div id="statusBadgeContainer" style="text-align: center;"></div>
      </div>
    </div>
  </div>
  <script>
    function calculate() {
      const target = parseFloat(document.getElementById('target').value) || 0;
      const totalDays = parseFloat(document.getElementById('totalDays').value) || 1;
      const daysPassed = parseFloat(document.getElementById('daysPassed').value) || 1;
      const achieved = parseFloat(document.getElementById('achieved').value) || 0;
      
      const balance = Math.max(0, target - achieved);
      const daysLeft = Math.max(1, totalDays - daysPassed);
      const runRate = Math.ceil(balance / daysLeft);
      const percent = target > 0 ? ((achieved / target) * 100).toFixed(1) : 0;
      const dailyAverage = daysPassed > 0 ? achieved / daysPassed : 0;
      const projected = Math.round(achieved + (dailyAverage * (totalDays - daysPassed)));

      document.getElementById('percentVal').textContent = percent + '%';
      document.getElementById('balanceVal').textContent = balance.toLocaleString('en-IN');
      document.getElementById('runRateVal').textContent = runRate.toLocaleString('en-IN') + ' / day';
      document.getElementById('projectedVal').textContent = projected.toLocaleString('en-IN');

      const badge = document.getElementById('statusBadgeContainer');
      if (percent >= 100) {
        badge.innerHTML = '<span class="status-badge" style="background:#dcfce7; color:#15803d;">🎉 Target Achieved! Excellent Performance!</span>';
      } else if (projected >= target) {
        badge.innerHTML = '<span class="status-badge" style="background:#e0f2fe; color:#0369a1;">✅ On Track to Surpass Target!</span>';
      } else {
        badge.innerHTML = '<span class="status-badge" style="background:#fee2e2; color:#b91c1c;">⚠️ Attention Required: Increase Daily Run Rate</span>';
      }

      document.getElementById('results').style.display = 'block';
    }
    calculate();
  </script>
</body>
</html>`;

export const DEFAULT_MY_APPS: CustomPortalApp[] = [
  {
    id: 'app-acg17-generator',
    name: 'ACG-17 Receipt Generator',
    category: 'Operations',
    sourceType: 'code',
    codeSnippet: ACG_17_RECEIPT_GENERATOR_HTML,
    description: 'Department of Posts ACG-17 official receipt generator with auto amount-in-words & instant print preview',
    fileSize: '7.8 KB',
    createdAt: '2026-03-24',
  },
  {
    id: 'app-target-calc',
    name: 'Target Calculator',
    category: 'Calculators',
    sourceType: 'code',
    codeSnippet: TARGET_CALCULATOR_HTML,
    description: 'Interactive Postal & GDS monthly target & daily run rate calculator',
    fileSize: '3.2 KB',
    createdAt: '2026-03-20',
  },
  { id: 'app-1', name: 'India Post Official Portal', category: 'Official Portal', sourceType: 'url', url: 'https://www.indiapost.gov.in', description: 'Central India Post portal for tracking, rules, and circulars' },
  { id: 'app-2', name: 'Meghdoot / SAP ERP Portal', category: 'Operations', sourceType: 'url', url: 'https://sapep.indiapost.gov.in', description: 'Postal Enterprise Resource Planning and daily operations' },
  { id: 'app-3', name: 'Dak Karmayogi E-Learning', category: 'Training', sourceType: 'url', url: 'https://dakkarmayogi.gov.in', description: 'Mandatory online training modules for GDS and Postal Assistants' },
  { id: 'app-4', name: 'CEPT Web Services Hub', category: 'IT & Technology', sourceType: 'url', url: 'https://cept.gov.in', description: 'Centre for Excellence in Postal Technology utilities' },
  { id: 'app-5', name: 'Finacle Core Banking System (CBS)', category: 'Banking', sourceType: 'url', url: 'https://cbs.indiapost.gov.in', description: 'POSB Core Banking and ATM transaction portal' },
  { id: 'app-6', name: 'Postal Life Insurance (PLI)', category: 'Insurance', sourceType: 'url', url: 'https://pli.indiapost.gov.in', description: 'PLI and RPLI customer portal and quotation tools' },
  { id: 'app-7', name: 'Speed Post Tracking Tool', category: 'Tracking', sourceType: 'url', url: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx', description: 'Consignment track and trace service' },
  { id: 'app-8', name: 'Central Govt Health Scheme (CGHS)', category: 'Medical', sourceType: 'url', url: 'https://cghs.nic.in', description: 'CGHS empanelled hospitals, plastic card and claims' },
  { id: 'app-9', name: 'Bhavishya Pension Portal', category: 'Pension', sourceType: 'url', url: 'https://bhavishya.nic.in', description: 'Civil servants pension sanction and payment tracking' },
  { id: 'app-10', name: 'CPENGRAMS Grievance Portal', category: 'Grievance', sourceType: 'url', url: 'https://pgportal.gov.in/pension', description: 'Online pension grievances redressal system' },
  { id: 'app-11', name: 'Odisha Postal Circle Cuttack', category: 'Circle Office', sourceType: 'url', url: 'https://odishapost.gov.in', description: 'Odisha Circle administrative notifications & transfers' },
  { id: 'app-12', name: 'NFPE National Confederation', category: 'Union Portal', sourceType: 'url', url: 'http://confederationhq.blogspot.com', description: 'National Federation of Postal Employees updates' },
];

export const DEFAULT_EMPLOYEE_RESOURCES: EmployeeResource[] = [
  { id: 'res-1', title: 'Postal Manual Volume IV (Appointments, Promotion, Leave & Discipline)', category: 'Postal Manuals', url: 'https://www.indiapost.gov.in' },
  { id: 'res-2', title: 'Postal Manual Volume VI (Duties of Postmaster & Sub-Postmasters)', category: 'Postal Manuals', url: 'https://www.indiapost.gov.in' },
  { id: 'res-3', title: 'CCS (Conduct) Rules 1964 & CCS (CCA) Rules 1965', category: 'Conduct Rules', url: 'https://www.indiapost.gov.in' },
  { id: 'res-4', title: '7th Central Pay Commission Pay Matrix & DA Orders', category: 'Pay & Allowances', url: 'https://www.indiapost.gov.in' },
  { id: 'res-5', title: 'Seniority Lists & Transfer Policy for Postal Assistants & Postmen', category: 'Establishment', url: 'https://www.indiapost.gov.in' },
];

export function getStoredGallery(): GalleryPhoto[] {
  try {
    const raw = localStorage.getItem('aipeu_admin_gallery');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_GALLERY;
}

export function getStoredMyApps(): CustomPortalApp[] {
  try {
    const raw = localStorage.getItem('aipeu_admin_apps');
    if (raw) {
      const parsed: CustomPortalApp[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // If user already had custom apps, ensure the ACG-17 receipt generator is available
        const hasAcg17 = parsed.some((a) => a.id === 'app-acg17-generator');
        if (!hasAcg17) {
          const merged = [DEFAULT_MY_APPS[0], ...parsed];
          localStorage.setItem('aipeu_admin_apps', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_MY_APPS;
}

export function getStoredEmployeeResources(): EmployeeResource[] {
  try {
    const raw = localStorage.getItem('aipeu_admin_resources');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_EMPLOYEE_RESOURCES;
}
