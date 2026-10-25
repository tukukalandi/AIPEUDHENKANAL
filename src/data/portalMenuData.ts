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
    if (raw) return JSON.parse(raw);
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
