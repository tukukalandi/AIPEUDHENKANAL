import { HeroSlide, NewsSliderItem, AnnouncementItem, ImportantDocItem, NoticeCircularItem } from '../types';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division',
    subtitle: 'Standing united for the rights, welfare and career progression of Postal Employees, Postmen, MTS, Pensioners and Gramin Dak Sevaks. Mob: 9861184651 | Email: aipeup3dhenkanaldivn@gmail.com',
    tag: '✊ NFPE AIPEU DHENKANAL',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'View Union Circulars',
    ctaLink: '#circulars',
    gradient: 'from-[#991B1B] via-[#DC2626] to-[#F97316]',
    order: 1,
    active: true,
  },
  {
    id: 'slide-2',
    title: 'Speed Post 24 & India Post Logistics',
    subtitle: 'Connecting every citizen across India with reliable express parcel, Speed Post, IT 2.0 booking and track & trace utilities.',
    tag: '⚡ SPEED POST 24',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Track Consignment',
    ctaLink: '#quick-services',
    gradient: 'from-[#064E3B] via-[#047857] to-[#10B981]',
    order: 2,
    active: true,
  },
  {
    id: 'slide-3',
    title: 'Postal Life Insurance & Rural PLI Schemes',
    subtitle: 'High returns with government security. Complete guidance on Suraksha, Santosh, Suvidha, Sumangal and Yugal Suraksha policies.',
    tag: '🛡️ PLI & RPLI SCHEMES',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore PLI Portal',
    ctaLink: '#quick-services',
    gradient: 'from-[#0A2540] via-[#1E3A8A] to-[#3B82F6]',
    order: 3,
    active: true,
  },
  {
    id: 'slide-4',
    title: 'World of Stamps & Philately Club',
    subtitle: 'Explore the heritage of Indian philately, commemorative stamps, first day covers, and special postmarks across Odisha Circle.',
    tag: '📮 PHILATELY HERITAGE',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Philately',
    ctaLink: '#quick-services',
    gradient: 'from-[#831843] via-[#BE185D] to-[#F59E0B]',
    order: 4,
    active: true,
  },
  {
    id: 'slide-5',
    title: 'Dhenkanal Division Pincode & DIGIPIN Hub',
    subtitle: 'Locate 759xxx pincodes, Head Post Office & Branch Offices, and geo-coded digital address coordinates with instant lookup.',
    tag: '📍 POSTAL DIRECTORY',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Pincode Lookup',
    ctaLink: '#quick-services',
    gradient: 'from-[#1E293B] via-[#0F766E] to-[#0284C7]',
    order: 5,
    active: true,
  },
];

export const DEFAULT_NEWS_ITEMS: NewsSliderItem[] = [
  {
    id: 'news-1',
    title: 'Notification for LDCE from GDS to Postman / Mail Guard / MTS Examination 2026 released by Directorate.',
    category: 'EXAM NOTIFICATION',
    isUrgent: true,
    published: '2026-03-20',
  },
  {
    id: 'news-2',
    title: 'AIPEU Dhenkanal: Bi-monthly Staff Adalat scheduled at Divisional Office - Submit representations before 25th.',
    category: 'DIVISION NOTICE',
    isUrgent: true,
    published: '2026-03-18',
  },
  {
    id: 'news-3',
    title: 'Dak Karamyogi mandatory modules for GDS and Postal Assistants to be completed before 31st March 2026.',
    category: 'TRAINING',
    isUrgent: false,
    published: '2026-03-15',
  },
  {
    id: 'news-4',
    title: 'POSB Interest Rates for the Current Quarter: Sukanya Samriddhi 8.2%, PPF 7.1%, Senior Citizen SCSS 8.2%.',
    category: 'SAVINGS BANK',
    isUrgent: false,
    published: '2026-03-12',
  },
  {
    id: 'news-5',
    title: 'Inspector Posts (IP) Examination 2026: Updated syllabus covering Bharatiya Nyaya Sanhita (BNS) published.',
    category: 'IP EXAM',
    isUrgent: true,
    published: '2026-03-10',
  },
  {
    id: 'news-6',
    title: '8th Central Pay Commission: National Federation of Postal Employees (NFPE) submits detailed memorandum.',
    category: 'PAY COMMISSION',
    isUrgent: true,
    published: '2026-03-05',
  },
];

export interface ExamCadre {
  id: string;
  cadre: string;
  hindiTitle: string;
  targetAudience: string;
  badge: string;
  badgeColor: string;
  description: string;
  papers: {
    paperNumber: string;
    title: string;
    marks: number;
    duration: string;
    topics: string[];
  }[];
  keyBooks: string[];
  cutoffHint: string;
}

export const DEPARTMENTAL_EXAMS: ExamCadre[] = [
  {
    id: 'gds-to-mts',
    cadre: 'GDS to MTS Exam',
    hindiTitle: 'जीडीएस से एमटीएस विभागीय परीक्षा',
    targetAudience: 'Gramin Dak Sevaks with 3 years service',
    badge: 'ENTRY LEVEL',
    badgeColor: 'bg-emerald-500 text-white',
    description: 'Limited Departmental Competitive Examination (LDCE) for recruitment of GDS as Multi Tasking Staff in Postal Divisions and RMS Divisions.',
    papers: [
      {
        paperNumber: 'Paper I (100 Marks)',
        title: 'Basic Postal Knowledge & General Awareness',
        marks: 100,
        duration: '60 Mins',
        topics: [
          'Post Office Guide Part I (Organization, Types of POs, Business Hours, Postage Stamp rules)',
          'Postal Manual Volume V (Definitions of Head Office, Sub Office, Branch Office, Transit Office)',
          'General Awareness (Indian Geography, History, Freedom Struggle, Indian Constitution)',
          'Basic Arithmetic (BODMAS, Percentage, Profit & Loss, Simple Interest, Average)',
        ],
      },
      {
        paperNumber: 'Paper II (50 Marks)',
        title: 'Knowledge of Local Language (Qualifying)',
        marks: 50,
        duration: '60 Mins',
        topics: [
          'Translation of English to Odia / Local Language (15 Marks)',
          'Translation of Local Language to English (15 Marks)',
          'Letter writing in Local Language (10 Marks)',
          'Short Paragraph writing in Local Language (10 Marks)',
        ],
      },
    ],
    keyBooks: ['Post Office Guide Part I', 'Postal Manual Vol V', 'Class 10 Arithmetic'],
    cutoffHint: 'Qualifying: 40% for OC/EWS, 37% for OBC, 33% for SC/ST.',
  },
  {
    id: 'gds-mts-to-postman',
    cadre: 'Postman & Mail Guard Exam',
    hindiTitle: 'डाकिया एवं मेल गार्ड विभागीय परीक्षा',
    targetAudience: 'MTS with 3 years service / GDS with 5 years service',
    badge: 'POPULAR CADRE',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Departmental Examination for appointment to the cadre of Postman in Postal Divisions and Mail Guard in Railway Mail Service (RMS) Divisions.',
    papers: [
      {
        paperNumber: 'Paper I (100 Marks)',
        title: 'Postal Knowledge, Delivery Rules & Arithmetic',
        marks: 100,
        duration: '60 Mins',
        topics: [
          'Post Office Guide Part I (Delivery of Mail, Franking Machine, Addressed & Unaddressed Mail, Refusal of Article)',
          'Postal Manual Volume VI Part III (Duties of Postman, Window Delivery, Cash on Delivery, Undelivered Mails)',
          'Postal Manual Volume VII (Duties of Mail Guard, Beat & Van, Transit Mail Office)',
          'Basic Mathematics & Reasoning (Work & Time, Distance & Speed, Fractions)',
        ],
      },
      {
        paperNumber: 'Paper II & III (Qualifying)',
        title: 'Local Language & Data Entry Skill Test (DEST)',
        marks: 75,
        duration: '60 Mins + 15 Mins',
        topics: [
          'Translation and Essay writing in Odia/Hindi',
          'Data Entry Skill Test: 2000 key depressions in 15 minutes on Computer',
        ],
      },
    ],
    keyBooks: ['Postal Manual Vol VI Part III', 'Postal Manual Vol VII', 'PO Guide Part I'],
    cutoffHint: 'High competition in Division. Practice DEST typing daily.',
  },
  {
    id: 'lgo-pasa-exam',
    cadre: 'PA / SA (LGO Exam)',
    hindiTitle: 'डाक सहायक एवं छंटाई सहायक परीक्षा',
    targetAudience: 'Postman, Mail Guard & MTS with 3 years continuous service',
    badge: 'CAREER BOOST',
    badgeColor: 'bg-amber-500 text-slate-950',
    description: 'Competitive Examination for Lower Grade Officials (LGO) for promotion to Postal Assistant (Clerical Cadre) and Sorting Assistant (RMS).',
    papers: [
      {
        paperNumber: 'Paper I (100 Marks)',
        title: 'Postal Knowledge, Organization & Rules',
        marks: 100,
        duration: '120 Mins',
        topics: [
          'Post Office Guide Part I (Clause 1 to 300 - Complete Postal Operations)',
          'Post Office Guide Part II (Foreign Post, Air Mails, EMS, Surface Mail)',
          'Postal Manual Volume V (General Definitions, Mails handling, Rail Mail Sorting)',
          'Postal Manual Volume VI Part I (Sub Post Office Rules, Daily Accounts, SO Slip)',
          'Postal Manual Volume VI Part II (Post Office Accounts, BO Slip, Cash Transactions)',
          'SB Orders & Rules (Savings Bank, Recurring Deposit, Monthly Income Scheme, NSC)',
        ],
      },
      {
        paperNumber: 'Paper II (DEST Test)',
        title: 'Computer Data Entry Skill Test',
        marks: 25,
        duration: '15 Mins',
        topics: ['800 key depressions in 15 minutes accuracy test on computerized console.'],
      },
    ],
    keyBooks: ['PO Guide Pt I & II', 'Postal Manual Vol V, VI Pt I & II', 'POSB CBS Manual'],
    cutoffHint: 'Division merit determined by Paper I marks. High scoring required.',
  },
  {
    id: 'inspector-posts-ip',
    cadre: 'Inspector Posts (IP Exam)',
    hindiTitle: 'डाक निरीक्षक (आईपी) विभागीय परीक्षा',
    targetAudience: 'Postal Assistants / Sorting Assistants with 8 years regular service',
    badge: 'GAZETTED / EXECUTIVE',
    badgeColor: 'bg-purple-600 text-white',
    description: 'All India Open Competitive Examination for promotion to Inspector Posts (Sub-Divisional Head, Vigilance & Inspection Authority).',
    papers: [
      {
        paperNumber: 'Paper I (150 Marks)',
        title: 'Acts & Rules relating to Postal Services',
        marks: 150,
        duration: '180 Mins',
        topics: [
          'Indian Post Office Act 1898 & Rules',
          'Government Savings Promotion Act 1873 & POSB Rules 2018',
          'Post Office Life Insurance Rules (PLI/RPLI Rules 2011)',
          'Postal Manual Vol II (Discipline & Appeals, Organization)',
          'Postal Manual Vol III (Investigation, Fraud handling, Inquiries)',
        ],
      },
      {
        paperNumber: 'Paper II (150 Marks)',
        title: 'Postal Operations & IT Modernization 2.0',
        marks: 150,
        duration: '180 Mins',
        topics: [
          'Postal Manual Vol V, VI (Parts I, II, III), Vol VII & Vol VIII',
          'IT Modernization Project 2.0, Finacle CBS, McCamish, DARPAN App',
          'Right to Information (RTI) Act 2005 & Rules',
          'Public Procurement via GeM Portal & GFR 2017',
        ],
      },
      {
        paperNumber: 'Paper III (150 Marks)',
        title: 'Constitutional Law, Criminal Laws & Service Rules',
        marks: 150,
        duration: '180 Mins',
        topics: [
          'Bharatiya Nyaya Sanhita (BNS) / IPC & Bharatiya Nagarik Suraksha Sanhita',
          'Prevention of Corruption Act 1988',
          'CCS (Conduct) Rules 1964 & CCS (CCA) Rules 1965',
          'CCS (Leave) Rules 1972 & CCS (Pension) Rules 2021',
        ],
      },
      {
        paperNumber: 'Paper IV (150 Marks)',
        title: 'Drafting, Noting, Office Procedure & English Grammar',
        marks: 150,
        duration: '180 Mins',
        topics: ['Official letter drafting, In-depth inspection report writing, English essay & précis.'],
      },
    ],
    keyBooks: ['Postal Manuals Vol II, III, V, VI, VII, VIII', 'Swamy’s Handbook', 'CCS CCA Rules'],
    cutoffHint: 'Extremely competitive nationwide exam. Daily study of 3-4 hours recommended.',
  },
  {
    id: 'po-rms-accountant',
    cadre: 'PO & RMS Accountant Examination',
    hindiTitle: 'डाकघर एवं आरएमएस लेखापाल परीक्षा',
    targetAudience: 'All confirmed Postal Assistants & Sorting Assistants',
    badge: 'SPECIALIZED CADRE',
    badgeColor: 'bg-rose-600 text-white',
    description: 'Special Departmental Examination for appointment as Head Post Office Accountant, Sub Office Cashier, and RMS Treasury Officers.',
    papers: [
      {
        paperNumber: 'Paper I (100 Marks)',
        title: 'General Accounts & Postal Accounting Procedure',
        marks: 100,
        duration: '180 Mins',
        topics: [
          'Financial Handbook (FHB) Volume I & II',
          'Postal Manual Volume II (Financial powers of Divisional Heads)',
          'Preparation of HO Daily Accounts, Summary of Accounts, Cash Balance Reports',
          'SAP ERP Finance (FICO) and POSB CBS Reconciliation',
        ],
      },
      {
        paperNumber: 'Paper II (100 Marks)',
        title: 'Rules relating to Pay, Allowances, Pension & Budget',
        marks: 100,
        duration: '180 Mins',
        topics: [
          'Fundamental Rules & Supplementary Rules (FR & SR)',
          'Central Civil Services (Traveling Allowance) Rules',
          'Budgetary allocations, Contingent bills, GPF & NPS rules',
        ],
      },
    ],
    keyBooks: ['FHB Vol I & II', 'Postal Manual Vol II', 'FR SR Part I & II'],
    cutoffHint: 'Pass certificate provides immediate eligibility for Accountant allowance and priority postings.',
  },
];

export interface PostalManual {
  id: string;
  code: string;
  title: string;
  fullTitle: string;
  category: string;
  chaptersCount: number;
  description: string;
  importantClauses: string[];
  pdfAvailable: boolean;
}

export const POSTAL_MANUALS: PostalManual[] = [
  {
    id: 'po-guide-1',
    code: 'PO Guide Pt I',
    title: 'Post Office Guide Part I',
    fullTitle: 'Post Office Guide Part I: Rules relating to the Inland Post',
    category: 'Inland Post & Public Regulations',
    chaptersCount: 10,
    description: 'Foundational manual containing general rules relating to Inland Post, Business hours, postage stamps, franking impressions, certificate of posting, registration, insurance, value payable articles, and parcel post.',
    importantClauses: [
      'Clause 1 to 10: Control of Department, Types of Post Offices, Mobile Post Offices, Night Post Offices',
      'Clause 11 to 24: Business Hours, Sunday and Post Office Holidays, Letter Boxes clearance',
      'Clause 25 to 50: Postage Stamps & Stationery, Franking Machines, Pre-payment of postage',
      'Clause 51 to 90: Conditions of Transmission, Packaging, Dimensions, Weight limits',
      'Clause 91 to 140: Delivery of Postal Articles, Window Delivery, Post Boxes and Post Bags',
      'Clause 141 to 200: Undelivered & Refused Mails, Return to Sender, RLO rules',
    ],
    pdfAvailable: true,
  },
  {
    id: 'po-guide-2',
    code: 'PO Guide Pt II',
    title: 'Post Office Guide Part II',
    fullTitle: 'Post Office Guide Part II: Rules relating to the Foreign Post',
    category: 'International Postal Relations',
    chaptersCount: 8,
    description: 'Comprehensive guide dealing with Universal Postal Union (UPU) regulations, international air mail, EMS Speed Post international, customs declaration forms CN22 & CN23, and prohibited international articles.',
    importantClauses: [
      'General Regulations of Universal Postal Union (UPU)',
      'Letter Post items: Priority & Non-priority letters, aerogrammes, postcards, printed papers',
      'Parcel Post: International parcels, custom clearances, insurance limits',
      'Customs Declarations: Form CN 22 (Green label), Form CN 23 (Detailed declaration)',
      'International Reply Coupons (IRC) exchange and redemption rules',
    ],
    pdfAvailable: true,
  },
  {
    id: 'vol-2',
    code: 'Manual Vol II',
    title: 'Postal Manual Volume II',
    fullTitle: 'Postal Manual Volume II: General Regulations & Organization',
    category: 'Administrative & Disciplinary Rules',
    chaptersCount: 12,
    description: 'Governs administration, organization of Postal Circles and Divisions, establishment matters, securities from postal employees, discipline and appeal rules, and official correspondence.',
    importantClauses: [
      'Chapter 1: Organization of India Post Headquarters, Circles, Regions, and Divisions',
      'Chapter 2: Security bonds required from Sub-Postmasters, Treasurers, Postmen',
      'Chapter 3: Disciplinary rules, charge sheets, inquiries, suspension allowances',
      'Chapter 4: Official Correspondence, Preservation and Destruction of Records',
      'Chapter 5: Petitions, memorials, and union representations',
    ],
    pdfAvailable: true,
  },
  {
    id: 'vol-5',
    code: 'Manual Vol V',
    title: 'Postal Manual Volume V',
    fullTitle: 'Postal Manual Volume V: Mails and Railway Mail Service (RMS)',
    category: 'Mail Sorting & Transportation',
    chaptersCount: 7,
    description: 'Key guide for Railway Mail Service (RMS) and mail sorting operations. Details sorting lists, due mail lists, transit bags, registered bags, air mail bags, and station bag sorting.',
    importantClauses: [
      'Rule 1 to 50: Definitions (Head Office, Sub Office, Branch Office, Transit Section, Mail Office, TMO, Record Office)',
      'Rule 51 to 100: Due Mail and Sorting Lists, Preparation and dispatch of Mail Bags',
      'Rule 101 to 150: Duties of Mail Guard, Mail Agent, Head Sorting Assistant',
      'Rule 151 to 200: Irregularities in Mail transmission, Mail Abstract, Verification of bags',
    ],
    pdfAvailable: true,
  },
  {
    id: 'vol-6-pt-1',
    code: 'Manual Vol VI Pt I',
    title: 'Postal Manual Volume VI (Part I)',
    fullTitle: 'Postal Manual Volume VI Part I: Sub Post Office Rules & Internal Routine',
    category: 'Post Office Operations',
    chaptersCount: 9,
    description: 'Defines internal routines of Sub Post Offices and Head Post Offices, receipt and dispatch of mails, sorting counter operations, registered and parcel lists, and delivery management.',
    importantClauses: [
      'Sub Post Office Routine, Duties of Sub Postmaster (SPM) and Postal Assistants',
      'Treatment of Registered and Insured articles, Delivery receipts, Error books',
      'Window delivery and delivery slip procedures',
      'Preparation of Sub Post Office Daily Account (SO Slip / ACG-22)',
    ],
    pdfAvailable: true,
  },
  {
    id: 'vol-6-pt-3',
    code: 'Manual Vol VI Pt III',
    title: 'Postal Manual Volume VI (Part III)',
    fullTitle: 'Postal Manual Volume VI Part III: Postman & Delivery Staff Rules',
    category: 'Postman & Delivery Operations',
    chaptersCount: 6,
    description: 'Every postman examination question is drawn from this manual. Covers beat maps, window delivery, intimation slips, cash on delivery handling, undelivered articles, and street letterbox clearance.',
    importantClauses: [
      'Duties of Postman in office before going out on beat',
      'Delivery of registered, insured, and value payable articles',
      'Intimations to addressee, Notice of arrival of parcel, 7 days retention limit',
      'Return of undelivered articles, Treatment of articles with insufficient address',
      'Postman’s book (MS-27) maintenance and signature verification',
    ],
    pdfAvailable: true,
  },
  {
    id: 'vol-7',
    code: 'Manual Vol VII',
    title: 'Postal Manual Volume VII',
    fullTitle: 'Postal Manual Volume VII: Railway Mail Service (RMS) Offices',
    category: 'RMS & Sorting Operations',
    chaptersCount: 8,
    description: 'Operational manual for Mail Offices, Transit Sections, Sorting Assistants, Mail Guards, and Record Offices in Railway Mail Service divisions.',
    importantClauses: [
      'Duties of Head Sorting Assistant and Mail Sorting crew',
      'Receipt, opening, and closing of Transit Bags and Closed Bags',
      'Checking of Work Papers, Mail List, Registered List, Parcel List',
      'Disposal of missent and redirected mails in transit',
    ],
    pdfAvailable: true,
  },
  {
    id: 'sb-cbs',
    code: 'POSB Manual',
    title: 'Post Office Savings Bank (CBS) Manual',
    fullTitle: 'Post Office Savings Bank Manual (Volume I & II) & CBS Finacle Guide',
    category: 'Financial Services & Banking',
    chaptersCount: 15,
    description: 'Covers Post Office Savings Account, Recurring Deposit (RD), Time Deposit (TD), Monthly Income Scheme (MIS), Senior Citizen Savings Scheme (SCSS), Public Provident Fund (PPF), and Sukanya Samriddhi Yojana (SSY).',
    importantClauses: [
      'Opening of Accounts: KYC requirements, Form 1, Nominations (Form 10), Minor accounts',
      'Deposit and Withdrawal limits: Cash transaction limits, Cheque clearing, CTS operations',
      'Closure of accounts, Premature closure penalties, Deceased claim settlement procedures',
      'Finacle Core Banking menus: CCRC, CPJM, HDA, CSBO, HIARM, HINTTM',
    ],
    pdfAvailable: true,
  },
];

export interface QuizQuestion {
  id: string;
  cadre: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  ruleReference: string;
}

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    cadre: 'MTS / Postman',
    question: 'Under Post Office Guide Part I, what is the maximum weight limit for an Unregistered Book Packet?',
    options: ['2 Kilograms', '4 Kilograms', '5 Kilograms', '10 Kilograms'],
    correctAnswer: 2,
    explanation: 'As per Clause 56 of Post Office Guide Part I, the maximum weight of a Book Packet containing printed periodicals or books is 5 Kilograms.',
    ruleReference: 'PO Guide Part I, Clause 56',
  },
  {
    id: 'q2',
    cadre: 'Postman / PA/SA',
    question: 'How long can an undelivered parcel be detained at the delivery Post Office after the notice of arrival is served on the addressee?',
    options: ['3 days', '7 days', '15 days', '30 days'],
    correctAnswer: 1,
    explanation: 'A parcel is retained in the post office for delivery for 7 days from the date of presentation of the notice to the addressee (Clause 148 of PO Guide Pt I).',
    ruleReference: 'PO Guide Part I, Clause 148',
  },
  {
    id: 'q3',
    cadre: 'PA / SA (LGO)',
    question: 'Which Postal Manual Volume deals with the duties of Mail Guards, Mail Agents and Transit Sections in RMS?',
    options: ['Postal Manual Volume II', 'Postal Manual Volume V', 'Postal Manual Volume VII', 'Postal Manual Volume VIII'],
    correctAnswer: 2,
    explanation: 'Postal Manual Volume VII deals specifically with Railway Mail Service (RMS), Transit Sections and Mail Offices.',
    ruleReference: 'Postal Manual Volume VII, Rule 1',
  },
  {
    id: 'q4',
    cadre: 'Inspector Posts',
    question: 'Under the Government Savings Promotion Act, what is the maximum limit for settlement of a deceased claim without production of legal evidence (Probate/Succession Certificate)?',
    options: ['Rs. 1,00,000', 'Rs. 2,00,000', 'Rs. 5,00,000', 'Rs. 10,00,000'],
    correctAnswer: 2,
    explanation: 'The Directorate vide POSB Order revised the limit to Rs. 5,00,000 for sanction of claims without production of legal evidence where no nomination exists.',
    ruleReference: 'SB Order 07/2023 & POSB Rule 2018',
  },
  {
    id: 'q5',
    cadre: 'General Postal',
    question: 'What is the full form of the acronym DIGIPIN newly introduced by Department of Posts?',
    options: [
      'Digital Integrated Postal Index Network',
      'Digital Postal Index Number',
      'Direct India Geo-Postal Information Node',
      'Dynamic Internet Geotagged Postal Identity Number',
    ],
    correctAnswer: 1,
    explanation: 'DIGIPIN stands for Digital Postal Index Number, developed with IIT Hyderabad to provide a 10-character alphanumeric geo-coded address for every 4x4 meter cell in India.',
    ruleReference: 'DoP DIGIPIN Standard 2024',
  },
];

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'SB Order 09/2026 - Subject: Standard Operating Procedure (SOP) for Accounting & Verification of POSB Accounting at Post Offices after implementation of APT 2.0.',
    link: 'https://www.indiapost.gov.in',
    published: '2026-03-24',
    order: 1,
    active: true,
  },
  {
    id: 'ann-2',
    title: 'LDCE for promotion to the cadre of Inspector Posts (66.66%) Departmental quota for the vacancy year 2026',
    link: 'https://www.indiapost.gov.in',
    published: '2026-03-22',
    order: 2,
    active: true,
  },
  {
    id: 'ann-3',
    title: 'Bi-Monthly Division Council Meeting of AIPEU Group-C & Postmen/MTS Dhenkanal Division scheduled at Divisional Office',
    link: '#circulars',
    published: '2026-03-20',
    order: 3,
    active: true,
  },
];

export const DEFAULT_IMPORTANT_DOCUMENTS: ImportantDocItem[] = [
  {
    id: 'doc-1',
    title: 'APT 2.0 Work Flow',
    url: 'https://www.indiapost.gov.in',
    category: 'APT 2.0',
    order: 1,
    published: '2026-03-15',
  },
  {
    id: 'doc-2',
    title: 'Revision of leave sanctioning authorities of GDS',
    url: 'https://www.indiapost.gov.in',
    category: 'GDS Service',
    order: 2,
    published: '2026-03-10',
  },
  {
    id: 'doc-3',
    title: 'Standard Operating Procedure for POSB CBS Accounting & Error Rectification',
    url: 'https://www.indiapost.gov.in',
    category: 'POSB Manual',
    order: 3,
    published: '2026-03-05',
  },
  {
    id: 'doc-4',
    title: 'GDS Gratuity and Severance Amount Claim Settlement Forms (Form-1 & Annexure-A)',
    url: 'https://www.indiapost.gov.in',
    category: 'GDS Welfare',
    order: 4,
    published: '2026-02-28',
  },
  {
    id: 'doc-5',
    title: 'Guidelines for 8th Central Pay Commission representations by AIPEU',
    url: 'https://www.indiapost.gov.in',
    category: 'Pay & Allowances',
    order: 5,
    published: '2026-02-20',
  },
];

export const DEFAULT_NOTICE_CIRCULARS: NoticeCircularItem[] = [
  {
    id: 'nc-1',
    title: 'Revision of GDS Leave Sanctioning Authority',
    category: 'NOTICE',
    published: '2026-08-16',
    url: 'https://www.indiapost.gov.in',
    order: 1,
  },
  {
    id: 'nc-2',
    title: 'Schedule of Inspector Posts Examination 2026 & Vacancy Details',
    category: 'NOTICE',
    published: '2026-07-28',
    url: 'https://www.indiapost.gov.in',
    order: 2,
  },
  {
    id: 'nc-3',
    title: 'Allotment of Postal Staff Quarters at Dhenkanal Head Post Office Colony',
    category: 'ACCOMMODATION',
    published: '2026-06-15',
    url: 'https://www.indiapost.gov.in',
    order: 1,
  },
  {
    id: 'nc-4',
    title: 'Inspection and repair of departmental staff quarters in Kamakhyanagar and Hindol SOs',
    category: 'ACCOMMODATION',
    published: '2026-05-18',
    url: 'https://www.indiapost.gov.in',
    order: 2,
  },
  {
    id: 'nc-5',
    title: 'Empanelment of Private Hospitals and Diagnostic Labs under CGHS / CS(MA) for Dhenkanal & Angul',
    category: 'CGHS',
    published: '2026-05-20',
    url: 'https://www.indiapost.gov.in',
    order: 1,
  },
  {
    id: 'nc-6',
    title: 'Settlement of medical reimbursement claims for emergency hospital admissions',
    category: 'CGHS',
    published: '2026-04-12',
    url: 'https://www.indiapost.gov.in',
    order: 2,
  },
  {
    id: 'nc-7',
    title: 'Submission of Annual Digital Life Certificate (Jeevan Pramaan) for Postal Pensioners',
    category: 'PENSION/SALARY',
    published: '2026-08-01',
    url: 'https://www.indiapost.gov.in',
    order: 1,
  },
  {
    id: 'nc-8',
    title: 'Implementation of Revised Dearness Allowance (DA) and Dearness Relief (DR) Orders',
    category: 'PENSION/SALARY',
    published: '2026-07-14',
    url: 'https://www.indiapost.gov.in',
    order: 2,
  },
  {
    id: 'nc-9',
    title: 'Dak Sewak Welfare Fund Guidelines and Scholarship Applications 2026 for Children of GDS',
    category: 'MISCELLANEOUS',
    published: '2026-04-10',
    url: 'https://www.indiapost.gov.in',
    order: 1,
  },
  {
    id: 'nc-10',
    title: 'All India Postal Cultural and Sports Meet 2026 Nominations from Dhenkanal Division',
    category: 'MISCELLANEOUS',
    published: '2026-03-01',
    url: 'https://www.indiapost.gov.in',
    order: 2,
  },
];
