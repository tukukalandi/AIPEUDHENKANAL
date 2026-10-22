// Official Constituent & Fraternal Union Logos for NFPE AIPEU Unions - Dhenkanal Division

export interface UnionLogo {
  id: string;
  name: string;
  shortName: string;
  cadre: string;
  imagePath: string;
  description: string;
}

// Primary website brand logo requested by user:
// WhatsApp_Image_2026-10-22_at_9.21.40_PM_18f144ee.jpeg (Official NFPE Red Solidarity Hands Flower Emblem)
export const PRIMARY_BRAND_LOGO = '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.40_PM_18f144ee.jpeg';
export const SECONDARY_BRAND_LOGO = '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.39_PM__1__95a7f1d9.jpeg'; // AIPEU Group C

export const UNION_LOGOS: UnionLogo[] = [
  {
    id: 'nfpe-national',
    name: 'National Federation of Postal Employees (NFPE)',
    shortName: 'NFPE CHQ & Circle',
    cadre: 'All India Postal Employees & Fraternal Cadres',
    imagePath: PRIMARY_BRAND_LOGO,
    description: 'The supreme historic emblem of National Federation of Postal Employees uniting all postal comrades.',
  },
  {
    id: 'nfpe-crest',
    name: 'NFPE & NFTE Federation Crest',
    shortName: 'NFPE-NFTE Federation',
    cadre: 'Federal Apex Body (Postal & Telecom)',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.38_PM_84cdaa31.jpeg',
    description: 'Supreme federation crest uniting all postal employees with fraternal telecom comrades.',
  },
  {
    id: 'aipeu-group-c',
    name: "All India Postal Employees Union - Group 'C'",
    shortName: "AIPEU Group 'C'",
    cadre: 'Postal Assistants, Sorting Assistants & Clerical Staff',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.39_PM__1__95a7f1d9.jpeg',
    description: 'Historic union representing clerical and operative staff in post offices and RMS.',
  },
  {
    id: 'nfpe-p4',
    name: 'NFPE - Postman, Mail Guard & Multi-Tasking Staff (P4)',
    shortName: 'NFPE Postman & MTS',
    cadre: 'Delivery, Mail Guards & MTS Staff',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.39_PM_264cb60c.jpeg',
    description: 'Dedicated frontline comrades delivering mail and safeguarding grassroots postal network.',
  },
  {
    id: 'aigdsu',
    name: 'All India Grameena Dak Sevaks Union (AIGDSU)',
    shortName: 'AIGDSU',
    cadre: 'Gramin Dak Sevaks (BPM, ABPM, Dak Sevaks)',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.37_PM_93ceb91c.jpeg',
    description: 'Vanguard organization upholding justice and civil servant rights for rural postal workers.',
  },
  {
    id: 'aiprpa-seal',
    name: 'All India Postal Rest-while Pensioners Association (AIPRPA)',
    shortName: 'AIPRPA (Postal Pensioners)',
    cadre: 'Postal & RMS Pensioners & Family Pensioners',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.36_PM_899eb8f1.jpeg',
    description: 'Official seal - "Defend Pension and Defend Social Security" with postal postbox & mail van.',
  },
  {
    id: 'nccpa-aiprpa',
    name: 'NCCPA & AIPRPA Postal Pensioners Movement',
    shortName: 'NCCPA & AIPRPA',
    cadre: 'National Coordination Committee of Pensioners Associations',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.34_PM_b252b6df.jpeg',
    description: 'Crossed red flags of national solidarity for central government & postal pensioners.',
  },
  {
    id: 'pensioners-forum',
    name: 'Forum of Civil Pensioners Associations',
    shortName: 'Civil Pensioners Forum',
    cadre: 'Civil & Central Pensioners Front',
    imagePath: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.21.36_PM__1__167be9f8.jpeg',
    description: 'Unified fraternal front fighting for medical insurance, restoration of commutation & 8th CPC.',
  },
];
