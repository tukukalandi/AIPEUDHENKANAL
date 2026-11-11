import { OfficeBearer, UnionDocumentRuling } from '../types';

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

// All initial demo cards cleared per user instruction. Fresh entries can be added via Admin Portal.
export const OFFICE_BEARERS: OfficeBearer[] = [];

export const UNION_AFFILIATION = {
  text: 'National JCM - Staff Side, Confederation of Central Government Employees and Workers, National Federation of Postal Employees - CHQ - New Delhi',
  shortText: 'National JCM - Staff Side · Confederation · NFPE CHQ New Delhi',
};

export const UNION_CONTACT_INFO = {
  organization: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF',
  division: 'Dhenkanal Division',
  name: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division',
  headquarters: 'Office of the Superintendent of Post Offices, Dhenkanal Division, Dhenkanal, Odisha - 759001',
  whatsappGroup: 'https://chat.whatsapp.com/LWdnfVy9ZGGAaR1Ltr1iF2?s=sh&p=a&mlu=4&ilr=4&iam=0',
  facebookGroup: 'https://www.facebook.com/share/g/1Fbi1km9XA/',
  facebookPage: 'https://www.facebook.com/share/1C1e9fHijV/',
  twitter: 'https://x.com/aipeup3dkl',
  telegramChannel: 'https://t.me/+RgcDu9IJaBwgGW66',
  blogUrl: 'https://aipeup3dkl.blogspot.com/',
  email: 'aipeup3dhenkanaldivn@gmail.com',
  mobile: '9861184651',
  phone: 'Mob - 9861184651',
  chqDelhi: 'First Floor, North Avenue Post Office Building, New Delhi - 110001',
  affiliatedTo: 'National JCM - Staff Side, Confederation of Central Government Employees and Workers, National Federation of Postal Employees - CHQ - New Delhi',
};

export const IMPORTANT_DOCUMENTS: UnionDocumentRuling[] = [
  {
    id: 'doc-ruling-1',
    title: 'AIPEU Constitution & Trade Union Rulings',
    desc: 'Official constitution, aims, objectives and union conference bylaws.',
    link: 'https://drive.google.com/file/d/0B3b5xv2bvRIbMnVDYzgyUDNoNGc/view',
    type: 'Constitution',
    order: 1,
  },
  {
    id: 'doc-ruling-2',
    title: 'Register of Trade Union - Form B',
    desc: 'Official statutory trade union registration records under Trade Unions Act.',
    link: 'https://aipeup3dkl.blogspot.com/p/register-of-trade-union-form-b.html',
    type: 'Legal',
    order: 2,
  },
  {
    id: 'doc-ruling-3',
    title: 'Staff Adalat Grievance Submission Form',
    desc: 'Standard representation format for Half-Yearly Staff Adalat at Regional Office & Division.',
    link: 'https://drive.google.com/file/d/1ArNMez75hZPspwG6FDQu6uG4l67-ok_0/view',
    type: 'Grievance',
    order: 3,
  },
  {
    id: 'doc-ruling-4',
    title: 'Charter of Demands (8th CPC & GDS Target Pressure)',
    desc: 'Resolution and strike demand charter passed by NFPE and AIGDSU conferences.',
    link: 'https://aipeup3dkl.blogspot.com/2026/06/charter-of-demands-for-coming-gds-strike.html',
    type: 'Resolution',
    order: 4,
  },
  {
    id: 'doc-ruling-5',
    title: 'Union Official Letter Pad (Printable)',
    desc: 'Division executive letter pad template for branch correspondence.',
    link: 'https://docs.google.com/file/d/0B3b5xv2bvRIbMnVDYzgyUDNoNGc/edit',
    type: 'Letter Pad',
    order: 5,
  },
];
