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

export const DEFAULT_MY_APPS: CustomPortalApp[] = [
  { id: 'app-1', name: 'India Post Official Portal', category: 'Official Portal', url: 'https://www.indiapost.gov.in', description: 'Central India Post portal for tracking, rules, and circulars' },
  { id: 'app-2', name: 'Meghdoot / SAP ERP Portal', category: 'Operations', url: 'https://sapep.indiapost.gov.in', description: 'Postal Enterprise Resource Planning and daily operations' },
  { id: 'app-3', name: 'Dak Karmayogi E-Learning', category: 'Training', url: 'https://dakkarmayogi.gov.in', description: 'Mandatory online training modules for GDS and Postal Assistants' },
  { id: 'app-4', name: 'CEPT Web Services Hub', category: 'IT & Technology', url: 'https://cept.gov.in', description: 'Centre for Excellence in Postal Technology utilities' },
  { id: 'app-5', name: 'Finacle Core Banking System (CBS)', category: 'Banking', url: 'https://cbs.indiapost.gov.in', description: 'POSB Core Banking and ATM transaction portal' },
  { id: 'app-6', name: 'Postal Life Insurance (PLI)', category: 'Insurance', url: 'https://pli.indiapost.gov.in', description: 'PLI and RPLI customer portal and quotation tools' },
  { id: 'app-7', name: 'Speed Post Tracking Tool', category: 'Tracking', url: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx', description: 'Consignment track and trace service' },
  { id: 'app-8', name: 'Central Govt Health Scheme (CGHS)', category: 'Medical', url: 'https://cghs.nic.in', description: 'CGHS empanelled hospitals, plastic card and claims' },
  { id: 'app-9', name: 'Bhavishya Pension Portal', category: 'Pension', url: 'https://bhavishya.nic.in', description: 'Civil servants pension sanction and payment tracking' },
  { id: 'app-10', name: 'CPENGRAMS Grievance Portal', category: 'Grievance', url: 'https://pgportal.gov.in/pension', description: 'Online pension grievances redressal system' },
  { id: 'app-11', name: 'Odisha Postal Circle Cuttack', category: 'Circle Office', url: 'https://odishapost.gov.in', description: 'Odisha Circle administrative notifications & transfers' },
  { id: 'app-12', name: 'NFPE National Confederation', category: 'Union Portal', url: 'http://confederationhq.blogspot.com', description: 'National Federation of Postal Employees updates' },
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
