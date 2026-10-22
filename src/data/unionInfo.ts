import { OfficeBearer } from '../types';

export const UNION_BRANCHES = [
  {
    id: 'group-c',
    name: "AIPEU Group 'C'",
    subtitle: 'Postal Assistants, Sorting Assistants & System Administrators',
    badge: 'Gr. C',
    iconName: 'Mail',
  },
  {
    id: 'postman-mts',
    name: "AIPEU Postmen, MTS & Group 'D'",
    subtitle: 'Postmen, Mail Guards, MTS & Multi-Tasking Staff',
    badge: 'Postman/MTS',
    iconName: 'Truck',
  },
  {
    id: 'aigdsu',
    name: 'AIGDSU Dhenkanal',
    subtitle: 'All India Gramin Dak Sevaks Union, Dhenkanal Branch',
    badge: 'GDS / ED',
    iconName: 'Users',
  },
  {
    id: 'women-committee',
    name: 'Divisional Women Sub-Committee',
    subtitle: 'Empowering Women Postal Employees in Dhenkanal Division',
    badge: 'Women Wing',
    iconName: 'Shield',
  },
  {
    id: 'pensioners',
    name: 'AIPRPA (Pensioners Corner)',
    subtitle: 'All India Postal & RMS Pensioners Association',
    badge: 'Pensioners',
    iconName: 'Award',
  },
  {
    id: 'rti-corner',
    name: 'RTI & Staff Adalat Corner',
    subtitle: 'RTI Act 2005 & Divisional Grievance Redressal Forums',
    badge: 'Legal & RTI',
    iconName: 'FileText',
  },
];

export const OFFICE_BEARERS: OfficeBearer[] = [
  {
    name: 'Com. Ramesh Chandra Sahoo',
    designation: 'Divisional President',
    branch: "AIPEU Group 'C', Dhenkanal Division",
    phone: '+91 94372 45812',
    location: 'Dhenkanal Head Post Office',
    roleType: 'president',
  },
  {
    name: 'Com. Chandra Sekhar Singh',
    designation: 'Ex-Divisional Secretary & Circle President',
    branch: "AIPEU Group 'C', Odisha Circle",
    phone: '+91 94371 89230',
    location: 'Dhenkanal Division',
    roleType: 'executive',
  },
  {
    name: 'Com. Prasanta Kumar Mohapatra',
    designation: 'Divisional Secretary',
    branch: "AIPEU Group 'C', Dhenkanal Division",
    phone: '+91 94370 71492',
    location: 'Dhenkanal HO',
    roleType: 'secretary',
  },
  {
    name: 'Com. Bijay Kumar Nayak',
    designation: 'Financial Secretary',
    branch: "AIPEU Group 'C', Dhenkanal Division",
    phone: '+91 94373 62109',
    location: 'Hindol SO',
    roleType: 'treasurer',
  },
  {
    name: 'Com. Satyabrata Mishra',
    designation: 'Assistant Divisional Secretary',
    branch: "AIPEU Group 'C', Dhenkanal Division",
    phone: '+91 98610 34215',
    location: 'Kamakhyanagar SO',
    roleType: 'executive',
  },
  {
    name: 'Com. Niranjan Barik',
    designation: 'Divisional Secretary',
    branch: "AIPEU Postmen, MTS & Group 'D'",
    phone: '+91 94374 81290',
    location: 'Dhenkanal HO',
    roleType: 'secretary',
  },
  {
    name: 'Com. Subash Chandra Rout',
    designation: 'Divisional Secretary',
    branch: 'AIGDSU Dhenkanal Division',
    phone: '+91 99381 22401',
    location: 'Gondia BO',
    roleType: 'secretary',
  },
  {
    name: 'Com. Minati Samal',
    designation: 'Convener, Women Sub-Committee',
    branch: 'Divisional Women Sub-Committee',
    phone: '+91 94380 91283',
    location: 'Bhuban SO',
    roleType: 'executive',
  },
];

export const UNION_CONTACT_INFO = {
  organization: 'ALL INDIA POSTAL EMPLOYEES UNION (NFPE)',
  division: 'Dhenkanal Division, Odisha Circle',
  headquarters: 'Office of the Superintendent of Post Offices, Dhenkanal Division, Dhenkanal, Odisha - 759001',
  whatsappGroup: 'https://chat.whatsapp.com/invite/aipeudkl',
  telegramChannel: 'https://t.me/aipeudkl',
  blogUrl: 'https://aipeup3dkl.blogspot.com/',
  email: 'aipeup3dkl@gmail.com',
  chqDelhi: 'First Floor, North Avenue Post Office Building, New Delhi - 110001',
};

export const IMPORTANT_DOCUMENTS = [
  {
    title: 'AIPEU Constitution & Trade Union Rulings',
    desc: 'Official constitution, aims, objectives and union conference bylaws.',
    link: 'https://drive.google.com/file/d/0B3b5xv2bvRIbMnVDYzgyUDNoNGc/view',
    type: 'Constitution',
  },
  {
    title: 'Register of Trade Union - Form B',
    desc: 'Official statutory trade union registration records under Trade Unions Act.',
    link: 'https://aipeup3dkl.blogspot.com/p/register-of-trade-union-form-b.html',
    type: 'Legal',
  },
  {
    title: 'Staff Adalat Grievance Submission Form',
    desc: 'Standard representation format for Half-Yearly Staff Adalat at Regional Office & Division.',
    link: 'https://drive.google.com/file/d/1ArNMez75hZPspwG6FDQu6uG4l67-ok_0/view',
    type: 'Grievance',
  },
  {
    title: 'Charter of Demands (8th CPC & GDS Target Pressure)',
    desc: 'Resolution and strike demand charter passed by NFPE and AIGDSU conferences.',
    link: 'https://aipeup3dkl.blogspot.com/2026/06/charter-of-demands-for-coming-gds-strike.html',
    type: 'Resolution',
  },
  {
    title: 'Union Official Letter Pad (Printable)',
    desc: 'Division executive letter pad template for branch correspondence.',
    link: 'https://docs.google.com/file/d/0B3b5xv2bvRIbMnVDYzgyUDNoNGc/edit',
    type: 'Letter Pad',
  },
];
