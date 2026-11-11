import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Users,
  FileText,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  Radio,
  Sliders,
  Eye,
  Megaphone,
  Calendar,
  Bookmark,
  LayoutGrid,
  FileCheck,
  ListTodo,
  Briefcase,
  Home,
  ArrowLeft,
  Lock,
  Search,
  Sparkles,
  Menu,
  EyeOff,
  User,
  ShieldCheck,
  LogOut,
  KeyRound,
  Upload,
  Save,
  Play,
  FileCode,
  Globe,
  RotateCcw,
  Maximize2,
  Minimize2,
  Code,
  BookOpen,
  Folder,
  Download,
  Link as LinkIcon,
} from 'lucide-react';
import {
  BlogPost,
  OfficeBearer,
  HeroSlide,
  NewsSliderItem,
  AnnouncementItem,
  ImportantDocItem,
  NoticeCircularItem,
  UnionDocumentRuling,
  CustomPortalApp,
  OrderRulingGuideItem,
} from '../types';
import {
  addCircularToFirestore,
  updateCircularInFirestore,
  getCircularsFromFirestore,
  deleteCircularFromFirestore,
  getExecutiveMembersFromFirestore,
  saveExecutiveMemberToFirestore,
  deleteExecutiveMemberFromFirestore,
  getHeroSlidesFromFirestore,
  saveHeroSlideToFirestore,
  deleteHeroSlideFromFirestore,
  getNewsItemsFromFirestore,
  saveNewsItemToFirestore,
  deleteNewsItemFromFirestore,
  getAnnouncementsFromFirestore,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  getImportantDocumentsFromFirestore,
  saveImportantDocumentToFirestore,
  deleteImportantDocumentFromFirestore,
  getNoticeCircularsFromFirestore,
  saveNoticeCircularToFirestore,
  deleteNoticeCircularFromFirestore,
  getUnionDocumentsAndRulingsFromFirestore,
  saveUnionDocumentRulingToFirestore,
  deleteUnionDocumentRulingFromFirestore,
  getOrdersRulingsGuidesFromFirestore,
  saveOrderRulingGuideToFirestore,
  deleteOrderRulingGuideFromFirestore,
  clearAllAnnouncementsFromFirestore,
  clearAllImportantDocsFromFirestore,
  clearAllNoticeCircularsFromFirestore,
  clearAllOrdersRulingsGuidesFromFirestore,
  clearAllExecutiveMembersFromFirestore,
  isLegacySeedId,
  NewCircularInput,
} from '../services/firebase';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from '../data/dakshikshaData';
import { DEFAULT_MY_APPS, TARGET_CALCULATOR_HTML } from '../data/portalMenuData';
import { sortOfficeBearers } from '../utils/officeBearerSorting';
import { MemberManagementAdmin } from './MemberManagementAdmin';
import { getCardColorPalette } from './OrdersRulingsGuideView';
import { getMyAppCardTheme, getMyAppIcon } from './FullPagePortalViews';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  onCircularAdded: (newPost: BlogPost) => void;
  onCircularDeleted?: (id: string) => void;
  onExecutiveUpdated: () => void;
  onHeroSlidesUpdated?: () => void;
  onNewsItemsUpdated?: () => void;
  onAnnouncementsUpdated?: () => void;
  onDocsUpdated?: () => void;
  onNoticeCircularsUpdated?: () => void;
}

export type AdminMenuTab =
  | 'dashboard'
  | 'members'
  | 'ordersRulingsGuide'
  | 'documents'
  | 'importantDocs'
  | 'notices'
  | 'announcements'
  | 'gallery'
  | 'myApps'
  | 'hero'
  | 'forms'
  | 'employeeSite'
  | 'news'
  | 'executives';

interface GalleryPhoto {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface DownloadableForm {
  id: string;
  title: string;
  formCode: string;
  category: string;
  downloadUrl: string;
}

interface EmployeeResource {
  id: string;
  title: string;
  category: string;
  url: string;
}

const DEFAULT_GALLERY: GalleryPhoto[] = [
  {
    id: 'gal-1',
    title: 'AIPEU Dhenkanal Division General Body Meeting 2025',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    category: 'Union Conference',
    date: '2025-11-14',
  },
  {
    id: 'gal-2',
    title: 'Postal Employees Felicitation & Pensioners Adalat',
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

const DEFAULT_FORMS: DownloadableForm[] = [
  { id: 'form-1', title: 'GDS Gratuity & Severance Claim Settlement', formCode: 'Form-1 & Annexure-A', category: 'GDS Service', downloadUrl: 'https://www.indiapost.gov.in' },
  { id: 'form-2', title: 'Application Proforma for LDCE GDS to Postman/MTS 2026', formCode: 'DoP-LDCE-2026', category: 'Examinations', downloadUrl: 'https://www.indiapost.gov.in' },
  { id: 'form-3', title: 'Child Care Leave (CCL) & Maternity Leave Application', formCode: 'FRSR-Leave-CCL', category: 'Leave Rules', downloadUrl: 'https://www.indiapost.gov.in' },
  { id: 'form-4', title: 'Postal Life Insurance Loan & Revival Application', formCode: 'PLI-Loan-Revival', category: 'PLI / RPLI', downloadUrl: 'https://www.indiapost.gov.in' },
  { id: 'form-5', title: 'AIPEU Membership Enrollment & Monthly Subscription Form', formCode: 'AIPEU-MEMB-01', category: 'Union Affairs', downloadUrl: 'https://www.indiapost.gov.in' },
];

const DEFAULT_EMPLOYEE_RESOURCES: EmployeeResource[] = [
  { id: 'res-1', title: 'Postal Manual Volume IV (Appointments, Promotion, Leave & Discipline)', category: 'Postal Manuals', url: 'https://www.indiapost.gov.in' },
  { id: 'res-2', title: 'Postal Manual Volume VI (Duties of Postmaster & Sub-Postmasters)', category: 'Postal Manuals', url: 'https://www.indiapost.gov.in' },
  { id: 'res-3', title: 'CCS (Conduct) Rules 1964 & CCS (CCA) Rules 1965', category: 'Conduct Rules', url: 'https://www.indiapost.gov.in' },
  { id: 'res-4', title: '7th Central Pay Commission Pay Matrix & DA Orders', category: 'Pay & Allowances', url: 'https://www.indiapost.gov.in' },
  { id: 'res-5', title: 'Seniority Lists & Transfer Policy for Postal Assistants & Postmen', category: 'Establishment', url: 'https://www.indiapost.gov.in' },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  onCircularAdded,
  onCircularDeleted,
  onExecutiveUpdated,
  onHeroSlidesUpdated,
  onNewsItemsUpdated,
  onAnnouncementsUpdated,
  onDocsUpdated,
  onNoticeCircularsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('dashboard');
  const [adminTabHistory, setAdminTabHistory] = useState<AdminMenuTab[]>([]);
  const adminContainerRef = React.useRef<HTMLDivElement>(null);

  const handleSelectAdminTab = (nextTab: AdminMenuTab) => {
    if (nextTab !== activeTab) {
      setAdminTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(nextTab);
    }
    setMobileMenuOpen(false);
    if (adminContainerRef.current) {
      adminContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdminBack = () => {
    if (adminTabHistory.length > 0) {
      const prevTab = adminTabHistory[adminTabHistory.length - 1];
      setAdminTabHistory((prev) => prev.slice(0, -1));
      setActiveTab(prevTab);
      if (adminContainerRef.current) {
        adminContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      if (adminContainerRef.current) {
        adminContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      onClose();
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('aipeu_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In-app deletion confirmation state (replaces window.confirm which is blocked in iframes)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: string;
    id: string;
    title: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // ================= 1. HERO SLIDER STATE (Supports Home & Circular & Feed Pages) =================
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroTag, setHeroTag] = useState('🎓 DAKSHIKSHA PORTAL');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('Explore Syllabus & Materials');
  const [heroCtaLink, setHeroCtaLink] = useState('#departmental-exams');
  const [heroGradient, setHeroGradient] = useState('from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]');
  const [heroTargetPage, setHeroTargetPage] = useState<'home' | 'feed' | 'both'>('home');
  const [heroFilterPage, setHeroFilterPage] = useState<'all' | 'home' | 'feed'>('all');
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);
  const heroFormRef = useRef<HTMLDivElement | null>(null);

  // ================= 2. DOCUMENTS & CIRCULARS STATE =================
  const [circulars, setCirculars] = useState<BlogPost[]>([]);
  const [editingCircular, setEditingCircular] = useState<BlogPost | null>(null);
  const [docPostTitle, setDocPostTitle] = useState('');
  const [docPostCategory, setDocPostCategory] = useState("GROUP - 'C' AGENDA");
  const [docPostSnippet, setDocPostSnippet] = useState('');
  const [docPostFileUrl, setDocPostFileUrl] = useState('');
  const [docPostImageUrl, setDocPostImageUrl] = useState('');
  const [docPostAuthor, setDocPostAuthor] = useState('Divisional Secretary, AIPEU Dhenkanal');
  const [docPostUrgent, setDocPostUrgent] = useState(false);
  const [docPostFileMode, setDocPostFileMode] = useState<'upload' | 'url'>('upload');
  const [docPostFileName, setDocPostFileName] = useState('');
  const [docPostFileSize, setDocPostFileSize] = useState('');
  const [docPostSearchQuery, setDocPostSearchQuery] = useState('');
  const [docPostCategoryFilter, setDocPostCategoryFilter] = useState('All');
  const docPostFileInputRef = useRef<HTMLInputElement | null>(null);
  const docPostFormRef = useRef<HTMLDivElement | null>(null);

  // ================= DOCUMENT VIEWER / PREVIEW MODAL STATE =================
  const [viewingDoc, setViewingDoc] = useState<{
    title: string;
    category?: string;
    url: string;
    published?: string;
    type?: 'Homepage Document' | 'Notice / Circular' | 'Announcement' | 'Order / Ruling' | 'Document' | string;
  } | null>(null);

  // ================= 3. HOMEPAGE DOCS STATE =================
  const [importantDocs, setImportantDocs] = useState<ImportantDocItem[]>(() => {
    try {
      const raw = localStorage.getItem('aipeu_important_documents');
      if (raw) return JSON.parse(raw).filter((d: any) => !isLegacySeedId(d.id));
    } catch {}
    return [];
  });
  const [editingDoc, setEditingDoc] = useState<ImportantDocItem | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docCategory, setDocCategory] = useState('General');
  const [docPublished, setDocPublished] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docFileMode, setDocFileMode] = useState<'upload' | 'url'>('upload');
  const [docFileName, setDocFileName] = useState('');
  const [docFileSize, setDocFileSize] = useState('');
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const docFormRef = useRef<HTMLDivElement | null>(null);

  // ================= 4. NOTICES & CIRCULARS STATE =================
  const [noticeCirculars, setNoticeCirculars] = useState<NoticeCircularItem[]>(() => {
    try {
      const raw = localStorage.getItem('aipeu_notice_circulars');
      if (raw) return JSON.parse(raw).filter((n: any) => !isLegacySeedId(n.id));
    } catch {}
    return [];
  });
  const [editingNotice, setEditingNotice] = useState<NoticeCircularItem | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<string>('NOTICE');
  const [noticePublished, setNoticePublished] = useState('');
  const [noticeUrl, setNoticeUrl] = useState('');
  const [noticeSearchQuery, setNoticeSearchQuery] = useState('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('All');
  const [noticeFileMode, setNoticeFileMode] = useState<'upload' | 'url'>('upload');
  const [noticeFileName, setNoticeFileName] = useState('');
  const [noticeFileSize, setNoticeFileSize] = useState('');
  const noticeFileInputRef = useRef<HTMLInputElement | null>(null);
  const noticeFormRef = useRef<HTMLDivElement | null>(null);

  // ================= 5. ANNOUNCEMENTS STATE =================
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const raw = localStorage.getItem('aipeu_announcements');
      if (raw) return JSON.parse(raw).filter((a: any) => !isLegacySeedId(a.id));
    } catch {}
    return [];
  });
  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annLink, setAnnLink] = useState('');
  const [annPublished, setAnnPublished] = useState('');
  const [annSearchQuery, setAnnSearchQuery] = useState('');
  const [annFileMode, setAnnFileMode] = useState<'upload' | 'url'>('url');
  const [annFileName, setAnnFileName] = useState('');
  const [annFileSize, setAnnFileSize] = useState('');
  const annFileInputRef = useRef<HTMLInputElement | null>(null);
  const annFormRef = useRef<HTMLDivElement | null>(null);

  // ================= 6. PHOTO GALLERY STATE =================
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [galTitle, setGalTitle] = useState('');
  const [galUrl, setGalUrl] = useState('');
  const [galCategory, setGalCategory] = useState('Union Conference');
  const [galDate, setGalDate] = useState(new Date().toISOString().split('T')[0]);

  // ================= 7. MY APPS STATE =================
  const [myApps, setMyApps] = useState<CustomPortalApp[]>(() => {
    try {
      const raw = localStorage.getItem('aipeu_admin_apps');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_MY_APPS;
  });
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<CustomPortalApp | null>(null);
  const [appName, setAppName] = useState('');
  const [appCategory, setAppCategory] = useState('Others');
  const [appSourceType, setAppSourceType] = useState<'code' | 'url'>('code');
  const [appCodeSnippet, setAppCodeSnippet] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [runningApp, setRunningApp] = useState<CustomPortalApp | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [appsCategoryFilter, setAppsCategoryFilter] = useState<string>('all');
  const [appsSearchQuery, setAppsSearchQuery] = useState('');
  const appFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ================= 8. FORMS STATE =================
  const [formsList, setFormsList] = useState<DownloadableForm[]>(DEFAULT_FORMS);
  const [editingForm, setEditingForm] = useState<DownloadableForm | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCat, setFormCat] = useState('Service Matters');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');

  // ================= 9. EMPLOYEE SITE STATE =================
  const [employeeResources, setEmployeeResources] = useState<EmployeeResource[]>(DEFAULT_EMPLOYEE_RESOURCES);
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('Postal Manuals');
  const [resUrl, setResUrl] = useState('');

  // ================= 10. NEWS TICKER STATE =================
  const [newsItems, setNewsItems] = useState<NewsSliderItem[]>([]);
  const [editingNews, setEditingNews] = useState<NewsSliderItem | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('LATEST NEWS');
  const [newsLink, setNewsLink] = useState('');
  const [newsIsUrgent, setNewsIsUrgent] = useState(false);
  const [newsFileMode, setNewsFileMode] = useState<'upload' | 'url'>('url');
  const [newsFileName, setNewsFileName] = useState('');
  const [newsFileSize, setNewsFileSize] = useState('');
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const newsFileInputRef = useRef<HTMLInputElement | null>(null);
  const newsFormRef = useRef<HTMLDivElement | null>(null);

  // ================= 11. EXECUTIVE MEMBERS & DOCUMENTS/RULINGS STATE =================
  const [executiveSubSection, setExecutiveSubSection] = useState<'bearers' | 'rulings'>('bearers');
  const [executives, setExecutives] = useState<(OfficeBearer & { id?: string })[]>([]);
  const [editingMember, setEditingMember] = useState<(OfficeBearer & { id?: string }) | null>(null);
  const [execName, setExecName] = useState('');
  const [execDesignation, setExecDesignation] = useState('');
  const [execBranch, setExecBranch] = useState("AIPEU Group 'C', Dhenkanal Division");
  const [execPhone, setExecPhone] = useState('');
  const [execLocation, setExecLocation] = useState('Dhenkanal Division');
  const [execRoleType, setExecRoleType] = useState<'president' | 'secretary' | 'treasurer' | 'executive'>('executive');
  const [execPhotoUrl, setExecPhotoUrl] = useState('');
  const [execSearchQuery, setExecSearchQuery] = useState('');
  const execFormRef = useRef<HTMLDivElement | null>(null);

  // Documents & Rulings (Executive Body)
  const [unionRulings, setUnionRulings] = useState<UnionDocumentRuling[]>([]);
  const [editingRuling, setEditingRuling] = useState<UnionDocumentRuling | null>(null);
  const [rulingTitle, setRulingTitle] = useState('');
  const [rulingDesc, setRulingDesc] = useState('');
  const [rulingLink, setRulingLink] = useState('');
  const [rulingType, setRulingType] = useState('Constitution');
  const [rulingOrder, setRulingOrder] = useState<number>(1);

  // ================= 10. ORDERS / RULLINGS / GUIDE STATE =================
  const [ordersRulingsGuides, setOrdersRulingsGuides] = useState<OrderRulingGuideItem[]>(() => {
    try {
      const raw = localStorage.getItem('aipeu_orders_rulings_guides');
      if (raw) return JSON.parse(raw).filter((o: any) => !isLegacySeedId(o.id));
    } catch {}
    return [];
  });
  const [editingOrgItem, setEditingOrgItem] = useState<OrderRulingGuideItem | null>(null);
  const [orgFileName, setOrgFileName] = useState('');
  const [orgFolderName, setOrgFolderName] = useState('Postal Manuals');
  const [orgCategory, setOrgCategory] = useState('Orders');
  const [orgDocumentUrl, setOrgDocumentUrl] = useState('');
  const [orgPublished, setOrgPublished] = useState('');
  const [orgNotes, setOrgNotes] = useState('');
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgFolderFilter, setOrgFolderFilter] = useState('All');
  const [orgFileMode, setOrgFileMode] = useState<'upload' | 'url'>('upload');
  const [orgUploadedFileName, setOrgUploadedFileName] = useState('');
  const [orgUploadedFileSize, setOrgUploadedFileSize] = useState('');
  const orgFileInputRef = useRef<HTMLInputElement | null>(null);
  const orgFormRef = useRef<HTMLDivElement | null>(null);

  // Load all data when modal opens
  const loadAllData = async () => {
    try {
      const [slides, news, execs, anns, docs, notcs, posts, rulings, orgs] = await Promise.all([
        getHeroSlidesFromFirestore(),
        getNewsItemsFromFirestore(),
        getExecutiveMembersFromFirestore(),
        getAnnouncementsFromFirestore(),
        getImportantDocumentsFromFirestore(),
        getNoticeCircularsFromFirestore(),
        getCircularsFromFirestore(),
        getUnionDocumentsAndRulingsFromFirestore(),
        getOrdersRulingsGuidesFromFirestore(),
      ]);
      setHeroSlides(slides);
      setNewsItems(news);
      setExecutives(execs);
      setAnnouncements((anns || []).filter((a) => !isLegacySeedId(a.id)));
      setImportantDocs((docs || []).filter((d) => !isLegacySeedId(d.id)));
      setNoticeCirculars((notcs || []).filter((n) => !isLegacySeedId(n.id)));
      setUnionRulings(rulings || []);
      setOrdersRulingsGuides((orgs || []).filter((o) => !isLegacySeedId(o.id)));
      const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('aipeu_deleted_post_ids') || '[]'));
      setCirculars(posts.filter((p) => !deletedIds.has(p.id)));

      // Local storage cache for gallery, forms, resources, apps
      const savedGal = localStorage.getItem('aipeu_admin_gallery');
      if (savedGal) setGalleryPhotos(JSON.parse(savedGal));
      const savedApps = localStorage.getItem('aipeu_admin_apps');
      if (savedApps) setMyApps(JSON.parse(savedApps));
      const savedForms = localStorage.getItem('aipeu_admin_forms');
      if (savedForms) setFormsList(JSON.parse(savedForms));
      const savedRes = localStorage.getItem('aipeu_admin_resources');
      if (savedRes) setEmployeeResources(JSON.parse(savedRes));
    } catch (e) {
      console.error('Error loading data in AdminPortal:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Protected Admin Login (User ID: aipeu, Password: Dop@12345)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = userIdInput.trim().toLowerCase();
    const cleanPass = passwordInput;

    if (cleanUser === 'aipeu' && cleanPass === 'Dop@12345') {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem('aipeu_admin_authenticated', 'true');
      } catch (err) {
        console.warn('SessionStorage unavailable', err);
      }
      showNotification('✅ Successfully logged in as AIPEU Administrator');
    } else {
      setAuthError('Invalid User ID or Password. Access is restricted to authorized union executives.');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserIdInput('');
    setPasswordInput('');
    setAuthError('');
    try {
      sessionStorage.removeItem('aipeu_admin_authenticated');
    } catch (err) {
      console.warn('SessionStorage unavailable', err);
    }
    showNotification('Logged out from Admin Portal');
  };

  const showNotification = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // ================= 1. HERO SLIDER HANDLERS =================
  const handleEditSlideClick = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setHeroTitle(slide.title);
    setHeroSubtitle(slide.subtitle);
    setHeroTag(slide.tag || (slide.targetPage === 'feed' ? '📜 CIRCULAR ARCHIVE' : 'DAKSHIKSHA'));
    setHeroImageUrl(slide.imageUrl);
    setHeroCtaText(slide.ctaText || 'Learn More');
    setHeroCtaLink(slide.ctaLink || '#');
    setHeroGradient(slide.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]');
    setHeroTargetPage(slide.targetPage || 'home');
    setTimeout(() => {
      heroFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditSlide = () => {
    setEditingSlide(null);
    setHeroTitle('');
    setHeroSubtitle('');
    setHeroTag(heroTargetPage === 'feed' ? '📜 CIRCULAR ARCHIVE' : '🎓 DAKSHIKSHA PORTAL');
    setHeroImageUrl('');
    setHeroCtaText('Explore Syllabus & Materials');
    setHeroCtaLink('#departmental-exams');
    setHeroTargetPage(heroFilterPage === 'feed' ? 'feed' : 'home');
    if (heroFileInputRef.current) heroFileInputRef.current.value = '';
  };

  const handleSaveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageUrl.trim()) {
      showNotification('⚠️ Please enter Photo URL or select an image file');
      return;
    }

    setIsSubmitting(true);
    try {
      const slideData: Partial<HeroSlide> & { id?: string } = {
        id: editingSlide ? editingSlide.id : undefined,
        title: heroTitle.trim() || 'Untitled Slide',
        subtitle: heroSubtitle.trim() || 'AIPEU Dhenkanal Division Official Update',
        tag: heroTag.trim() || (heroTargetPage === 'feed' ? '📜 CIRCULAR ARCHIVE' : 'DAKSHIKSHA'),
        imageUrl: heroImageUrl.trim(),
        ctaText: heroCtaText.trim() || 'Explore Now',
        ctaLink: heroCtaLink.trim() || (heroTargetPage === 'feed' ? '#feed-search' : '#circulars'),
        gradient: heroGradient,
        active: editingSlide ? editingSlide.active !== false : true,
        targetPage: heroTargetPage,
        order: editingSlide?.order ?? heroSlides.length + 1,
      };

      await saveHeroSlideToFirestore(slideData);
      const updatedSlides = await getHeroSlidesFromFirestore();
      setHeroSlides(updatedSlides);
      if (onHeroSlidesUpdated) onHeroSlidesUpdated();
      window.dispatchEvent(new CustomEvent('hero-slides-updated'));
      window.dispatchEvent(new CustomEvent('dynamic-content-updated'));

      handleCancelEditSlide();
      const pageName = heroTargetPage === 'feed' ? 'Circular & Feed Page' : heroTargetPage === 'both' ? 'Both Pages' : 'Home Page';
      showNotification(`✅ Slide saved for ${pageName}!`);
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save hero slide to Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSlideActive = async (slide: HeroSlide) => {
    try {
      const newActive = slide.active === false ? true : false;
      await saveHeroSlideToFirestore({ ...slide, active: newActive });
      const updatedSlides = await getHeroSlidesFromFirestore();
      setHeroSlides(updatedSlides);
      if (onHeroSlidesUpdated) onHeroSlidesUpdated();
      window.dispatchEvent(new CustomEvent('hero-slides-updated'));
      window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
      showNotification(newActive ? '✅ Slide activated' : '⏸️ Slide deactivated');
    } catch (e) {
      console.error(e);
      showNotification('❌ Could not update slide status');
    }
  };

  const handleToggleSlideTarget = async (slide: HeroSlide, target: 'home' | 'feed' | 'both') => {
    try {
      await saveHeroSlideToFirestore({ ...slide, targetPage: target });
      const updatedSlides = await getHeroSlidesFromFirestore();
      setHeroSlides(updatedSlides);
      if (onHeroSlidesUpdated) onHeroSlidesUpdated();
      window.dispatchEvent(new CustomEvent('hero-slides-updated'));
      window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
      const pageLabel = target === 'feed' ? 'Circulars & Feed' : target === 'both' ? 'Both Pages' : 'Home Page';
      showNotification(`✅ Assigned to ${pageLabel}`);
    } catch (err) {
      console.error(err);
      showNotification('❌ Could not update slide page');
    }
  };

  const handleDeleteHeroSlide = (id: string) => {
    const slide = heroSlides.find((s) => s.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Hero Banner Slide',
      id,
      title: slide?.title || 'Selected slide',
      onConfirm: async () => {
        try {
          setHeroSlides((prev) => prev.filter((s) => s.id !== id));
          await deleteHeroSlideFromFirestore(id);
          const updatedSlides = await getHeroSlidesFromFirestore();
          setHeroSlides(updatedSlides);
          if (onHeroSlidesUpdated) onHeroSlidesUpdated();
          window.dispatchEvent(new CustomEvent('hero-slides-updated'));
          window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
          showNotification('✅ Hero slide deleted from Firebase.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete slide.');
        }
      },
    });
  };

  // ================= 2. DOCUMENTS / CIRCULAR HANDLERS =================
  const markPostAsDeleted = (id: string) => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem('aipeu_deleted_post_ids') || '[]');
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('aipeu_deleted_post_ids', JSON.stringify(list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditCircularClick = (circ: BlogPost) => {
    setEditingCircular(circ);
    setDocPostTitle(circ.title || '');
    setDocPostCategory(circ.categories?.[0] || "GROUP - 'C' AGENDA");
    setDocPostSnippet(circ.snippet || '');
    const fileUrl = circ.driveLinks?.[0] || circ.url || '';
    setDocPostFileUrl(fileUrl);
    setDocPostImageUrl(circ.images?.[0] || '');
    setDocPostAuthor(circ.author || 'Divisional Secretary, AIPEU Dhenkanal');
    setDocPostUrgent(!!circ.urgent);

    if (fileUrl && fileUrl.startsWith('data:')) {
      setDocPostFileMode('upload');
      setDocPostFileName(circ.title ? `${circ.title.slice(0, 30)}.pdf` : 'attached_document.pdf');
    } else {
      setDocPostFileMode(fileUrl ? 'url' : 'upload');
      setDocPostFileName('');
    }
    setDocPostFileSize('');
    setTimeout(() => {
      docPostFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditCircular = () => {
    setEditingCircular(null);
    setDocPostTitle('');
    setDocPostCategory("GROUP - 'C' AGENDA");
    setDocPostSnippet('');
    setDocPostFileUrl('');
    setDocPostImageUrl('');
    setDocPostAuthor('Divisional Secretary, AIPEU Dhenkanal');
    setDocPostUrgent(false);
    setDocPostFileName('');
    setDocPostFileSize('');
    if (docPostFileInputRef.current) docPostFileInputRef.current.value = '';
  };

  const handleSaveCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docPostTitle.trim() || !docPostSnippet.trim()) {
      showNotification('⚠️ Please provide Title and Summary');
      return;
    }

    setIsSubmitting(true);
    try {
      const circularInput: NewCircularInput = {
        title: docPostTitle.trim(),
        category: docPostCategory,
        snippet: docPostSnippet.trim(),
        contentHtml: `<p>${docPostSnippet.trim()}</p>`,
        fileLinks: docPostFileUrl.trim() ? [docPostFileUrl.trim()] : [],
        imageUrls: docPostImageUrl.trim() ? [docPostImageUrl.trim()] : [],
        author: docPostAuthor.trim() || 'Divisional Secretary, AIPEU Dhenkanal',
        urgent: docPostUrgent,
      };

      if (editingCircular) {
        await updateCircularInFirestore(editingCircular.id, circularInput);
        const updated = await getCircularsFromFirestore();
        setCirculars(updated);
        window.dispatchEvent(new CustomEvent('posts-updated'));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('✅ Document / Circular successfully updated!');
      } else {
        const docId = await addCircularToFirestore(circularInput);
        const updated = await getCircularsFromFirestore();
        setCirculars(updated);

        onCircularAdded({
          id: docId,
          title: circularInput.title,
          published: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: circularInput.author || 'Divisional Secretary, AIPEU Dhenkanal',
          url: '',
          categories: [circularInput.category],
          snippet: circularInput.snippet,
          contentHtml: circularInput.contentHtml || '',
          images: circularInput.imageUrls || [],
          driveLinks: circularInput.fileLinks || [],
        });
        window.dispatchEvent(new CustomEvent('posts-updated'));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('✅ Document / Circular successfully published to Firebase!');
      }

      handleCancelEditCircular();
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCircular = (id: string) => {
    const circ = circulars.find((c) => c.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Document / File',
      id,
      title: circ?.title || 'Selected document file',
      onConfirm: async () => {
        try {
          markPostAsDeleted(id);
          setCirculars((prev) => prev.filter((c) => c.id !== id));
          await deleteCircularFromFirestore(id);
          if (onCircularDeleted) onCircularDeleted(id);
          window.dispatchEvent(new CustomEvent('posts-updated'));
          window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
          showNotification('✅ Document file deleted successfully.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete document.');
        }
      },
    });
  };

  // ================= DOCUMENT DOWNLOAD & FILE UPLOAD HELPERS =================
  const handleDownloadDoc = (url: string, title: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      const isImg = url.startsWith('data:image') || /\.(png|jpe?g|webp|svg)($|\?)/i.test(url);
      const isPdf = url.startsWith('data:application/pdf') || /\.pdf($|\?)/i.test(url);
      const ext = isImg ? '.png' : isPdf ? '.pdf' : '';
      a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to handle file selection for Important Docs
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileName(file.name);
    setDocFileSize(formatFileSize(file.size));
    if (!docTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDocTitle(baseName);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setDocUrl(ev.target.result as string);
        showNotification(`📁 File attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle file selection for Notice / Circular
  const handleNoticeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNoticeFileName(file.name);
    setNoticeFileSize(formatFileSize(file.size));
    if (!noticeTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setNoticeTitle(baseName);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setNoticeUrl(ev.target.result as string);
        showNotification(`📁 Notice file attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle file selection for Announcements
  const handleAnnFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnnFileName(file.name);
    setAnnFileSize(formatFileSize(file.size));
    if (!annTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setAnnTitle(baseName);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAnnLink(ev.target.result as string);
        showNotification(`📁 Announcement file attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle file selection for Documents / Circulars
  const handleDocPostFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocPostFileName(file.name);
    setDocPostFileSize(formatFileSize(file.size));
    if (!docPostTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDocPostTitle(baseName);
    }
    if (!docPostSnippet.trim()) {
      setDocPostSnippet(`Official departmental circular: ${file.name}`);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setDocPostFileUrl(ev.target.result as string);
        showNotification(`📁 Document file attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle file selection for Orders / Rulings / Guide
  const handleOrgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOrgUploadedFileName(file.name);
    setOrgUploadedFileSize(formatFileSize(file.size));
    if (!orgFileName.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setOrgFileName(baseName);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setOrgDocumentUrl(ev.target.result as string);
        showNotification(`📁 Order / Ruling file attached: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle file selection for News Ticker
  const handleNewsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsFileName(file.name);
    setNewsFileSize(formatFileSize(file.size));
    if (!newsTitle.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setNewsTitle(baseName);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setNewsLink(ev.target.result as string);
        showNotification(`📁 News attachment file: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to handle image selection for Hero Slider Banner
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setHeroImageUrl(ev.target.result as string);
        if (!heroTitle.trim()) {
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setHeroTitle(baseName);
        }
        showNotification(`🖼️ Banner image loaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // ================= 3. HOMEPAGE DOCS HANDLERS =================
  const handleEditImportantDocClick = (docItem: ImportantDocItem) => {
    setEditingDoc(docItem);
    setDocTitle(docItem.title || '');
    setDocUrl(docItem.url || '');
    setDocCategory(docItem.category || 'General');
    setDocPublished(docItem.published || new Date().toISOString().split('T')[0]);
    if (docItem.url && docItem.url.startsWith('data:')) {
      setDocFileMode('upload');
      setDocFileName(docItem.title ? `${docItem.title}.pdf` : 'attached_document.pdf');
    } else {
      setDocFileMode('url');
      setDocFileName('');
    }
    setDocFileSize('');
    // Smooth scroll to form
    setTimeout(() => {
      docFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditImportantDoc = () => {
    setEditingDoc(null);
    setDocTitle('');
    setDocUrl('');
    setDocCategory('General');
    setDocPublished('');
    setDocFileName('');
    setDocFileSize('');
    if (docFileInputRef.current) docFileInputRef.current.value = '';
  };

  const handleSaveImportantDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docUrl.trim()) {
      showNotification('⚠️ Title and Document File/URL are required');
      return;
    }

    const targetId = editingDoc ? editingDoc.id : `doc-${Date.now()}`;
    const newItem: ImportantDocItem = {
      id: targetId,
      title: docTitle.trim(),
      url: docUrl.trim(),
      category: docCategory.trim() || 'General',
      published: docPublished.trim() || new Date().toISOString().split('T')[0],
      order: editingDoc?.order ?? importantDocs.length + 1,
    };

    // ⚡ 1. INSTANT LOCAL STATE UPDATE (< 5ms)
    let updatedList: ImportantDocItem[];
    if (editingDoc) {
      updatedList = importantDocs.map((d) => (d.id === editingDoc.id ? newItem : d));
    } else {
      updatedList = [newItem, ...importantDocs];
    }
    setImportantDocs(updatedList);

    // ⚡ 2. INSTANT LOCALSTORAGE UPDATE
    try {
      localStorage.setItem('aipeu_important_documents', JSON.stringify(updatedList));
    } catch {}

    // ⚡ 3. INSTANT SYNCHRONOUS EVENT DISPATCH
    if (onDocsUpdated) onDocsUpdated();
    window.dispatchEvent(new CustomEvent('docs-updated', { detail: updatedList }));
    window.dispatchEvent(new CustomEvent('dynamic-content-updated'));

    // ⚡ 4. RESET FORM & INSTANT NOTIFICATION
    handleCancelEditImportantDoc();
    showNotification(editingDoc ? '✅ Document updated instantly!' : '✅ Document added to Homepage instantly!');

    // ⚡ 5. NON-BLOCKING BACKGROUND FIRESTORE PERSISTENCE
    saveImportantDocumentToFirestore(newItem).catch((err) => {
      console.warn('Background Firestore save doc error:', err);
    });
  };

  const handleDeleteImportantDoc = (id: string) => {
    const docItem = importantDocs.find((d) => d.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Homepage Document',
      id,
      title: docItem?.title || 'Selected document',
      onConfirm: async () => {
        // ⚡ 1. INSTANT LOCAL REMOVAL (< 5ms)
        const updatedList = importantDocs.filter((d) => d.id !== id);
        setImportantDocs(updatedList);
        try {
          localStorage.setItem('aipeu_important_documents', JSON.stringify(updatedList));
        } catch {}

        if (onDocsUpdated) onDocsUpdated();
        window.dispatchEvent(new CustomEvent('docs-updated', { detail: updatedList }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('✅ Document removed instantly from Homepage.');

        // ⚡ 2. NON-BLOCKING BACKGROUND FIRESTORE DELETION
        deleteImportantDocumentFromFirestore(id).catch((err) => {
          console.warn('Background Firestore delete doc error:', err);
        });
      },
    });
  };

  const handleClearAllImportantDocs = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'All Homepage Documents',
      id: 'clear-all-docs',
      title: `All ${importantDocs.length} Homepage Documents`,
      onConfirm: async () => {
        setImportantDocs([]);
        try {
          localStorage.setItem('aipeu_important_documents', '[]');
        } catch {}
        if (onDocsUpdated) onDocsUpdated();
        window.dispatchEvent(new CustomEvent('docs-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('🧹 All Homepage Documents cleared. Repository is ready for fresh files!');
        clearAllImportantDocsFromFirestore().catch((err) => console.warn(err));
      },
    });
  };

  // ================= 4. NOTICES & CIRCULARS HANDLERS =================
  const handleEditNoticeClick = (nc: NoticeCircularItem) => {
    setEditingNotice(nc);
    setNoticeTitle(nc.title || '');
    setNoticeCategory(nc.category || 'NOTICE');
    setNoticePublished(nc.published || new Date().toISOString().split('T')[0]);
    setNoticeUrl(nc.url || '');
    if (nc.url && nc.url.startsWith('data:')) {
      setNoticeFileMode('upload');
      setNoticeFileName(nc.title ? `${nc.title}.pdf` : 'attached_notice.pdf');
    } else {
      setNoticeFileMode('url');
      setNoticeFileName('');
    }
    setNoticeFileSize('');
    // Smooth scroll to form
    setTimeout(() => {
      noticeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditNotice = () => {
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeCategory('NOTICE');
    setNoticePublished('');
    setNoticeUrl('');
    setNoticeFileName('');
    setNoticeFileSize('');
    if (noticeFileInputRef.current) noticeFileInputRef.current.value = '';
  };

  const handleSaveNoticeCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeUrl.trim()) {
      showNotification('⚠️ Notice Title and Document File/Link are required');
      return;
    }

    const targetId = editingNotice ? editingNotice.id : `nc-${Date.now()}`;
    const newItem: NoticeCircularItem = {
      id: targetId,
      title: noticeTitle.trim(),
      category: noticeCategory,
      published: noticePublished || new Date().toISOString().split('T')[0],
      url: noticeUrl.trim(),
      order: editingNotice?.order ?? noticeCirculars.length + 1,
    };

    // ⚡ 1. INSTANT LOCAL STATE UPDATE (< 5ms)
    let updatedList: NoticeCircularItem[];
    if (editingNotice) {
      updatedList = noticeCirculars.map((n) => (n.id === editingNotice.id ? newItem : n));
    } else {
      updatedList = [newItem, ...noticeCirculars];
    }
    setNoticeCirculars(updatedList);

    // ⚡ 2. INSTANT LOCALSTORAGE UPDATE
    try {
      localStorage.setItem('aipeu_notice_circulars', JSON.stringify(updatedList));
    } catch {}

    // ⚡ 3. INSTANT SYNCHRONOUS EVENT DISPATCH
    if (onNoticeCircularsUpdated) onNoticeCircularsUpdated();
    window.dispatchEvent(new CustomEvent('notices-updated', { detail: updatedList }));
    window.dispatchEvent(new CustomEvent('dynamic-content-updated'));

    // ⚡ 4. RESET FORM & INSTANT NOTIFICATION
    handleCancelEditNotice();
    showNotification(editingNotice ? '✅ Notice / Circular updated instantly!' : '✅ Notice / Circular added instantly!');

    // ⚡ 5. NON-BLOCKING BACKGROUND FIRESTORE PERSISTENCE
    saveNoticeCircularToFirestore(newItem).catch((err) => {
      console.warn('Background Firestore save notice error:', err);
    });
  };

  const handleDeleteNoticeCircular = (id: string) => {
    const nc = noticeCirculars.find((n) => n.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Notice / Circular',
      id,
      title: nc?.title || 'Selected notice',
      onConfirm: async () => {
        // ⚡ 1. INSTANT LOCAL REMOVAL (< 5ms)
        const updatedList = noticeCirculars.filter((n) => n.id !== id);
        setNoticeCirculars(updatedList);
        try {
          localStorage.setItem('aipeu_notice_circulars', JSON.stringify(updatedList));
        } catch {}

        if (onNoticeCircularsUpdated) onNoticeCircularsUpdated();
        window.dispatchEvent(new CustomEvent('notices-updated', { detail: updatedList }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('✅ Notice circular removed instantly.');

        // ⚡ 2. NON-BLOCKING BACKGROUND FIRESTORE DELETION
        deleteNoticeCircularFromFirestore(id).catch((err) => {
          console.warn('Background Firestore delete notice error:', err);
        });
      },
    });
  };

  const handleClearAllNoticeCirculars = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'All Notices & Circulars',
      id: 'clear-all-notices',
      title: `All ${noticeCirculars.length} Notices & Circulars`,
      onConfirm: async () => {
        setNoticeCirculars([]);
        try {
          localStorage.setItem('aipeu_notice_circulars', '[]');
        } catch {}
        if (onNoticeCircularsUpdated) onNoticeCircularsUpdated();
        window.dispatchEvent(new CustomEvent('notices-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('🧹 All Notices & Circulars cleared. Repository is ready for fresh files!');
        clearAllNoticeCircularsFromFirestore().catch((err) => console.warn(err));
      },
    });
  };

  // ================= 5. ANNOUNCEMENTS HANDLERS =================
  const handleEditAnnouncementClick = (ann: AnnouncementItem) => {
    setEditingAnn(ann);
    setAnnTitle(ann.title || '');
    setAnnLink(ann.link || '');
    setAnnPublished(ann.published || new Date().toISOString().split('T')[0]);
    if (ann.link && ann.link.startsWith('data:')) {
      setAnnFileMode('upload');
      setAnnFileName(ann.title ? `${ann.title.slice(0, 30)}.pdf` : 'attached_file.pdf');
    } else {
      setAnnFileMode('url');
      setAnnFileName('');
    }
    setAnnFileSize('');
    setTimeout(() => {
      annFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnn(null);
    setAnnTitle('');
    setAnnLink('');
    setAnnPublished('');
    setAnnFileName('');
    setAnnFileSize('');
    if (annFileInputRef.current) annFileInputRef.current.value = '';
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      showNotification('⚠️ Announcement title/text is required');
      return;
    }

    const targetId = editingAnn ? editingAnn.id : `ann-${Date.now()}`;
    const newItem: AnnouncementItem = {
      id: targetId,
      title: annTitle.trim(),
      link: annLink.trim(),
      published: annPublished || new Date().toISOString().split('T')[0],
      order: editingAnn?.order ?? announcements.length + 1,
      active: true,
    };

    // ⚡ 1. INSTANT LOCAL STATE UPDATE (< 5ms)
    let updatedList: AnnouncementItem[];
    if (editingAnn) {
      updatedList = announcements.map((a) => (a.id === editingAnn.id ? newItem : a));
    } else {
      updatedList = [newItem, ...announcements];
    }
    setAnnouncements(updatedList);

    // ⚡ 2. INSTANT LOCALSTORAGE UPDATE
    try {
      localStorage.setItem('aipeu_announcements', JSON.stringify(updatedList));
    } catch {}

    // ⚡ 3. INSTANT SYNCHRONOUS EVENT DISPATCH
    if (onAnnouncementsUpdated) onAnnouncementsUpdated();
    window.dispatchEvent(new CustomEvent('announcements-updated', { detail: updatedList }));
    window.dispatchEvent(new CustomEvent('dynamic-content-updated'));

    // ⚡ 4. RESET FORM & INSTANT NOTIFICATION
    handleCancelEditAnnouncement();
    showNotification(editingAnn ? '✅ Announcement updated instantly!' : '✅ Announcement published instantly to homepage ticker!');

    // ⚡ 5. NON-BLOCKING BACKGROUND FIRESTORE PERSISTENCE
    saveAnnouncementToFirestore(newItem).catch((err) => {
      console.warn('Background Firestore save announcement error:', err);
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Announcement',
      id,
      title: ann?.title || 'Selected announcement',
      onConfirm: async () => {
        // ⚡ 1. INSTANT LOCAL REMOVAL (< 5ms)
        const updatedList = announcements.filter((a) => a.id !== id);
        setAnnouncements(updatedList);
        try {
          localStorage.setItem('aipeu_announcements', JSON.stringify(updatedList));
        } catch {}

        if (onAnnouncementsUpdated) onAnnouncementsUpdated();
        window.dispatchEvent(new CustomEvent('announcements-updated', { detail: updatedList }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('✅ Announcement removed instantly.');

        // ⚡ 2. NON-BLOCKING BACKGROUND FIRESTORE DELETION
        deleteAnnouncementFromFirestore(id).catch((err) => {
          console.warn('Background Firestore delete announcement error:', err);
        });
      },
    });
  };

  const handleClearAllAnnouncements = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'All Announcements',
      id: 'clear-all-announcements',
      title: `All ${announcements.length} Announcements`,
      onConfirm: async () => {
        setAnnouncements([]);
        try {
          localStorage.setItem('aipeu_announcements', '[]');
        } catch {}
        if (onAnnouncementsUpdated) onAnnouncementsUpdated();
        window.dispatchEvent(new CustomEvent('announcements-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('🧹 All Announcements cleared. Banner is ready for fresh posts!');
        clearAllAnnouncementsFromFirestore().catch((err) => console.warn(err));
      },
    });
  };

  // ================= 6. PHOTO GALLERY HANDLERS =================
  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galUrl.trim() || !galTitle.trim()) {
      showNotification('⚠️ Photo URL and Title are required');
      return;
    }
    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      title: galTitle.trim(),
      imageUrl: galUrl.trim(),
      category: galCategory.trim() || 'General Event',
      date: galDate || new Date().toISOString().split('T')[0],
    };
    const updated = [newPhoto, ...galleryPhotos];
    setGalleryPhotos(updated);
    localStorage.setItem('aipeu_admin_gallery', JSON.stringify(updated));
    setGalTitle('');
    setGalUrl('');
    showNotification('✅ Photo added to Union Gallery archive!');
  };

  const handleDeletePhoto = (id: string) => {
    const photo = galleryPhotos.find((p) => p.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Photo Gallery Item',
      id,
      title: photo?.title || 'Selected photo',
      onConfirm: () => {
        const updated = galleryPhotos.filter((p) => p.id !== id);
        setGalleryPhotos(updated);
        localStorage.setItem('aipeu_admin_gallery', JSON.stringify(updated));
        showNotification('✅ Photo deleted.');
      },
    });
  };

  // ================= 7. MY APPS HANDLERS =================
  const handleAppFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto set app title from file name if empty
    if (!appName.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAppName(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setAppCodeSnippet(content);
        showNotification(`✅ Loaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.onerror = () => {
      showNotification('❌ Failed to read HTML file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleEditAppClick = (app: CustomPortalApp) => {
    setEditingApp(app);
    setAppName(app.name);
    setAppCategory(app.category || 'Others');
    setAppSourceType(app.sourceType || (app.codeSnippet ? 'code' : 'url'));
    setAppCodeSnippet(app.codeSnippet || '');
    setAppUrl(app.url || '');
    setAppDescription(app.description || '');
    setShowAddAppModal(true);
  };

  const handleCancelApp = () => {
    setShowAddAppModal(false);
    setEditingApp(null);
    setAppName('');
    setAppCategory('Others');
    setAppSourceType('code');
    setAppCodeSnippet('');
    setAppUrl('');
    setAppDescription('');
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      showNotification('⚠️ App Title is required');
      return;
    }
    if (appSourceType === 'code' && !appCodeSnippet.trim()) {
      showNotification('⚠️ Please paste your HTML code or upload an HTML file');
      return;
    }
    if (appSourceType === 'url' && !appUrl.trim()) {
      showNotification('⚠️ Website Link is required');
      return;
    }

    const sizeInKb = appCodeSnippet.trim()
      ? `${(new Blob([appCodeSnippet]).size / 1024).toFixed(1)} KB`
      : undefined;

    let updated: CustomPortalApp[];
    if (editingApp) {
      updated = myApps.map((a) =>
        a.id === editingApp.id
          ? {
              ...a,
              name: appName.trim(),
              category: appCategory || 'Others',
              sourceType: appSourceType,
              codeSnippet: appSourceType === 'code' ? appCodeSnippet : undefined,
              url: appSourceType === 'url' ? appUrl.trim() : undefined,
              description: appDescription.trim() || (appSourceType === 'code' ? 'Custom HTML Application' : 'Website Link'),
              fileSize: sizeInKb,
            }
          : a
      );
      showNotification('✅ App card updated successfully!');
    } else {
      const newApp: CustomPortalApp = {
        id: `app-${Date.now()}`,
        name: appName.trim(),
        category: appCategory || 'Others',
        sourceType: appSourceType,
        codeSnippet: appSourceType === 'code' ? appCodeSnippet : undefined,
        url: appSourceType === 'url' ? appUrl.trim() : undefined,
        description: appDescription.trim() || (appSourceType === 'code' ? 'Custom HTML Application' : 'Website Link'),
        fileSize: sizeInKb,
        createdAt: new Date().toISOString().split('T')[0],
      };
      // Place newly added card at the very top!
      updated = [newApp, ...myApps];
      showNotification('✅ New HTML App card added!');
    }

    setMyApps(updated);
    try {
      localStorage.setItem('aipeu_admin_apps', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    handleCancelApp();
  };

  const handleDeleteApp = (id: string) => {
    const app = myApps.find((a) => a.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'App Card',
      id,
      title: app?.name || 'Selected app card',
      onConfirm: () => {
        const updated = myApps.filter((a) => a.id !== id);
        setMyApps(updated);
        try {
          localStorage.setItem('aipeu_admin_apps', JSON.stringify(updated));
        } catch (err) {
          console.warn('LocalStorage error:', err);
        }
        showNotification('✅ App card removed.');
      },
    });
  };

  const handleRemoveAllPreviousCards = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'All Previous App Cards',
      id: 'all_apps',
      title: 'Remove all previous cards',
      onConfirm: () => {
        setMyApps([]);
        try {
          localStorage.setItem('aipeu_admin_apps', JSON.stringify([]));
        } catch (err) {
          console.warn('LocalStorage error:', err);
        }
        showNotification('✅ All previous cards removed. You can now add your own HTML files.');
      },
    });
  };

  const handleResetDefaultApps = () => {
    setMyApps(DEFAULT_MY_APPS);
    try {
      localStorage.setItem('aipeu_admin_apps', JSON.stringify(DEFAULT_MY_APPS));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    showNotification('✅ Reset to default portal app cards.');
  };

  // ================= 8. FORMS HANDLERS =================
  const handleEditFormClick = (form: DownloadableForm) => {
    setEditingForm(form);
    setFormName(form.title || '');
    setFormCode(form.formCode || '');
    setFormCat(form.category || 'Service Matters');
    setFormDownloadUrl(form.downloadUrl || '');
  };

  const handleCancelEditForm = () => {
    setEditingForm(null);
    setFormName('');
    setFormCode('');
    setFormCat('Service Matters');
    setFormDownloadUrl('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDownloadUrl.trim()) {
      showNotification('⚠️ Form Name and Download URL are required');
      return;
    }
    let updated: DownloadableForm[];
    if (editingForm) {
      updated = formsList.map((f) =>
        f.id === editingForm.id
          ? {
              ...f,
              title: formName.trim(),
              formCode: formCode.trim() || 'DoP-FORM',
              category: formCat.trim() || 'Service Matters',
              downloadUrl: formDownloadUrl.trim(),
            }
          : f
      );
      showNotification('✅ Downloadable Form updated!');
    } else {
      const newForm: DownloadableForm = {
        id: `form-${Date.now()}`,
        title: formName.trim(),
        formCode: formCode.trim() || 'DoP-FORM',
        category: formCat.trim() || 'Service Matters',
        downloadUrl: formDownloadUrl.trim(),
      };
      updated = [...formsList, newForm];
      showNotification('✅ Downloadable Form added!');
    }
    setFormsList(updated);
    localStorage.setItem('aipeu_admin_forms', JSON.stringify(updated));
    handleCancelEditForm();
  };

  const handleDeleteForm = (id: string) => {
    const f = formsList.find((item) => item.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Downloadable Form',
      id,
      title: f?.title || 'Selected form',
      onConfirm: () => {
        const updated = formsList.filter((item) => item.id !== id);
        setFormsList(updated);
        localStorage.setItem('aipeu_admin_forms', JSON.stringify(updated));
        showNotification('✅ Form removed.');
      },
    });
  };

  // ================= 9. EMPLOYEE SITE HANDLERS =================
  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) {
      showNotification('⚠️ Title and Resource Link are required');
      return;
    }
    const newRes: EmployeeResource = {
      id: `res-${Date.now()}`,
      title: resTitle.trim(),
      category: resCategory.trim() || 'Postal Rules',
      url: resUrl.trim(),
    };
    const updated = [...employeeResources, newRes];
    setEmployeeResources(updated);
    localStorage.setItem('aipeu_admin_resources', JSON.stringify(updated));
    setResTitle('');
    setResUrl('');
    showNotification('✅ Employee Resource added!');
  };

  const handleDeleteResource = (id: string) => {
    const res = employeeResources.find((r) => r.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Employee Resource',
      id,
      title: res?.title || 'Selected resource',
      onConfirm: () => {
        const updated = employeeResources.filter((r) => r.id !== id);
        setEmployeeResources(updated);
        localStorage.setItem('aipeu_admin_resources', JSON.stringify(updated));
        showNotification('✅ Resource removed.');
      },
    });
  };

  // ================= 10. NEWS TICKER HANDLERS =================
  const handleEditNewsClick = (item: NewsSliderItem) => {
    setEditingNews(item);
    setNewsTitle(item.title || '');
    setNewsCategory(item.category || 'LATEST NEWS');
    setNewsLink(item.link || '');
    setNewsIsUrgent(!!item.isUrgent);
    if (item.link && item.link.startsWith('data:')) {
      setNewsFileMode('upload');
      setNewsFileName(item.title ? `${item.title.slice(0, 30)}.pdf` : 'news_attachment.pdf');
    } else {
      setNewsFileMode(item.link ? 'url' : 'upload');
      setNewsFileName('');
    }
    setNewsFileSize('');
    setTimeout(() => {
      newsFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditNews = () => {
    setEditingNews(null);
    setNewsTitle('');
    setNewsCategory('LATEST NEWS');
    setNewsLink('');
    setNewsIsUrgent(false);
    setNewsFileMode('upload');
    setNewsFileName('');
    setNewsFileSize('');
    if (newsFileInputRef.current) newsFileInputRef.current.value = '';
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) {
      showNotification('⚠️ Headline text is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveNewsItemToFirestore({
        id: editingNews ? editingNews.id : undefined,
        title: newsTitle.trim(),
        category: newsCategory,
        link: newsLink.trim(),
        isUrgent: newsIsUrgent,
      });
      const updated = await getNewsItemsFromFirestore();
      setNewsItems(updated);
      if (onNewsItemsUpdated) onNewsItemsUpdated();
      window.dispatchEvent(new CustomEvent('news-items-updated'));
      window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
      handleCancelEditNews();
      showNotification('✅ News headline saved!');
    } catch (e) {
      showNotification('❌ Failed to save news item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = (id: string) => {
    const item = newsItems.find((n) => n.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'News Headline',
      id,
      title: item?.title || 'Selected headline',
      onConfirm: async () => {
        try {
          setNewsItems((prev) => prev.filter((n) => n.id !== id));
          await deleteNewsItemFromFirestore(id);
          const updated = await getNewsItemsFromFirestore();
          setNewsItems(updated);
          if (onNewsItemsUpdated) onNewsItemsUpdated();
          window.dispatchEvent(new CustomEvent('news-items-updated'));
          window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
          showNotification('✅ Headline deleted.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete.');
        }
      },
    });
  };

  // ================= 11. EXECUTIVE BEARERS HANDLERS =================
  const handleEditExecutiveClick = (member: OfficeBearer & { id?: string }) => {
    setEditingMember(member);
    setExecName(member.name || '');
    setExecDesignation(member.designation || '');
    setExecBranch(member.branch || "AIPEU Group 'C', Dhenkanal Division");
    setExecPhone(member.phone || '');
    setExecLocation(member.location || 'Dhenkanal Division');
    setExecRoleType(member.roleType || 'executive');
    setExecPhotoUrl(member.photoUrl || '');
    setTimeout(() => {
      execFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditExecutive = () => {
    setEditingMember(null);
    setExecName('');
    setExecDesignation('');
    setExecBranch("AIPEU Group 'C', Dhenkanal Division");
    setExecPhone('');
    setExecLocation('Dhenkanal Division');
    setExecRoleType('executive');
    setExecPhotoUrl('');
  };

  const handleSaveExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execName.trim() || !execDesignation.trim()) {
      showNotification('⚠️ Name and Designation are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveExecutiveMemberToFirestore({
        id: editingMember?.id,
        name: execName.trim(),
        designation: execDesignation.trim(),
        branch: execBranch.trim() || "AIPEU Group 'C', Dhenkanal Division",
        phone: execPhone.trim(),
        location: execLocation.trim() || 'Dhenkanal Division',
        roleType: execRoleType,
        photoUrl: execPhotoUrl.trim(),
      });
      const updated = await getExecutiveMembersFromFirestore();
      setExecutives(updated);
      onExecutiveUpdated();
      window.dispatchEvent(new CustomEvent('office-bearers-updated'));
      window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
      handleCancelEditExecutive();
      showNotification('✅ Office Bearer & photo saved successfully in Firebase!');
    } catch (e) {
      showNotification('❌ Failed to save bearer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExecutive = (id?: string) => {
    if (!id) return;
    const member = executives.find((ex) => ex.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Office Bearer',
      id,
      title: member ? `${member.name} (${member.designation})` : 'Selected member',
      onConfirm: async () => {
        try {
          setExecutives((prev) => prev.filter((ex) => ex.id !== id));
          await deleteExecutiveMemberFromFirestore(id);
          const updated = await getExecutiveMembersFromFirestore();
          setExecutives(updated);
          onExecutiveUpdated();
          window.dispatchEvent(new CustomEvent('office-bearers-updated'));
          window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
          showNotification('✅ Executive member removed.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete.');
        }
      },
    });
  };

  const handleClearAllExecutives = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'All Executive Bearers / Directory Cards',
      id: 'clear-all-executives',
      title: `All ${executives.length} Office Bearers / Directory Cards`,
      onConfirm: async () => {
        setExecutives([]);
        try {
          localStorage.setItem('aipeu_office_bearers', '[]');
        } catch {}
        onExecutiveUpdated();
        window.dispatchEvent(new CustomEvent('office-bearers-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('🧹 All Directory cards cleared. Directory page is ready for fresh entries!');
        clearAllExecutiveMembersFromFirestore().catch((err) => console.warn(err));
      },
    });
  };

  // ================= 12. DOCUMENTS & RULINGS HANDLERS =================
  const handleEditRulingClick = (ruling: UnionDocumentRuling) => {
    setEditingRuling(ruling);
    setRulingTitle(ruling.title || '');
    setRulingDesc(ruling.desc || '');
    setRulingLink(ruling.link || '');
    setRulingType(ruling.type || 'Constitution');
    setRulingOrder(ruling.order ?? (unionRulings.indexOf(ruling) + 1));
    setExecutiveSubSection('rulings');
  };

  const handleCancelEditRuling = () => {
    setEditingRuling(null);
    setRulingTitle('');
    setRulingDesc('');
    setRulingLink('');
    setRulingType('Constitution');
    setRulingOrder(unionRulings.length + 1);
  };

  const handleSaveRuling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rulingTitle.trim() || !rulingLink.trim()) {
      showNotification('⚠️ Title and Document URL are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const data: Partial<UnionDocumentRuling> & { id?: string } = {
        id: editingRuling ? editingRuling.id : undefined,
        title: rulingTitle.trim(),
        desc: rulingDesc.trim(),
        link: rulingLink.trim(),
        type: rulingType.trim() || 'Legal',
        order: Number(rulingOrder) || (unionRulings.length + 1),
        published: new Date().toISOString().split('T')[0],
      };
      await saveUnionDocumentRulingToFirestore(data);
      const updated = await getUnionDocumentsAndRulingsFromFirestore();
      setUnionRulings(updated);
      handleCancelEditRuling();
      window.dispatchEvent(new CustomEvent('union-rulings-updated'));
      showNotification(editingRuling ? '✅ Document & Ruling updated!' : '✅ New Document & Ruling added!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save Document & Ruling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRuling = (id: string) => {
    const ruling = unionRulings.find((r) => r.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Document & Ruling',
      id,
      title: ruling ? ruling.title : 'Selected document',
      onConfirm: async () => {
        try {
          setUnionRulings((prev) => prev.filter((r) => r.id !== id));
          await deleteUnionDocumentRulingFromFirestore(id);
          const updated = await getUnionDocumentsAndRulingsFromFirestore();
          setUnionRulings(updated);
          window.dispatchEvent(new CustomEvent('union-rulings-updated'));
          showNotification('✅ Document & Ruling deleted.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete.');
        }
      },
    });
  };

  // ================= ORDERS/RULLINGS/GUIDE HANDLERS =================
  const handleEditOrgClick = (item: OrderRulingGuideItem) => {
    setEditingOrgItem(item);
    setOrgFileName(item.fileName);
    setOrgFolderName(item.folderName || 'Postal Manuals');
    setOrgCategory(item.category || 'Orders');
    setOrgDocumentUrl(item.documentUrl || '');
    setOrgPublished(item.published || '');
    setOrgNotes(item.notes || '');
    if (item.documentUrl && item.documentUrl.startsWith('data:')) {
      setOrgFileMode('upload');
      setOrgUploadedFileName(item.fileName ? `${item.fileName}.pdf` : 'attached_order.pdf');
    } else {
      setOrgFileMode(item.documentUrl ? 'url' : 'upload');
      setOrgUploadedFileName('');
    }
    setOrgUploadedFileSize('');
    setTimeout(() => {
      orgFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCancelEditOrg = () => {
    setEditingOrgItem(null);
    setOrgFileName('');
    setOrgFolderName('Postal Manuals');
    setOrgCategory('Orders');
    setOrgDocumentUrl('');
    setOrgPublished('');
    setOrgNotes('');
    setOrgFileMode('upload');
    setOrgUploadedFileName('');
    setOrgUploadedFileSize('');
    if (orgFileInputRef.current) orgFileInputRef.current.value = '';
  };

  const handleSaveOrgDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgFileName.trim()) {
      showNotification('⚠️ Please fill File name');
      return;
    }
    if (!orgFolderName.trim()) {
      showNotification('⚠️ Please fill folder name');
      return;
    }
    if (!orgCategory.trim()) {
      showNotification('⚠️ Please fill category');
      return;
    }
    if (!orgDocumentUrl.trim()) {
      showNotification('⚠️ Please provide Document URL or attach a file');
      return;
    }

    const targetId = editingOrgItem ? editingOrgItem.id : `org-${Date.now()}`;
    const newItem: OrderRulingGuideItem = {
      id: targetId,
      fileName: orgFileName.trim(),
      folderName: orgFolderName.trim(),
      category: orgCategory.trim(),
      documentUrl: orgDocumentUrl.trim(),
      published: orgPublished.trim() || new Date().toISOString().split('T')[0],
      notes: orgNotes.trim(),
      order: editingOrgItem?.order ?? ordersRulingsGuides.length + 1,
    };

    // ⚡ 1. INSTANT LOCAL STATE UPDATE (< 5ms)
    let updatedList: OrderRulingGuideItem[];
    if (editingOrgItem) {
      updatedList = ordersRulingsGuides.map((o) => (o.id === editingOrgItem.id ? newItem : o));
    } else {
      updatedList = [newItem, ...ordersRulingsGuides];
    }
    setOrdersRulingsGuides(updatedList);

    // ⚡ 2. INSTANT LOCALSTORAGE UPDATE
    try {
      localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(updatedList));
    } catch {}

    // ⚡ 3. INSTANT SYNCHRONOUS EVENT DISPATCH
    window.dispatchEvent(new CustomEvent('orders-rulings-guide-updated', { detail: updatedList }));
    window.dispatchEvent(new CustomEvent('dynamic-content-updated'));

    // ⚡ 4. RESET FORM & INSTANT NOTIFICATION
    handleCancelEditOrg();
    showNotification(editingOrgItem ? '✅ Document updated in Orders/Rullings/Guide instantly!' : '✅ Document saved! Card is now visible in Orders/Rullings/Guide.');

    // ⚡ 5. NON-BLOCKING BACKGROUND FIRESTORE PERSISTENCE
    saveOrderRulingGuideToFirestore(newItem).catch((err) => {
      console.warn('Background Firestore save org error:', err);
    });
  };

  const handleDeleteOrgItem = (id: string) => {
    const item = ordersRulingsGuides.find((r) => r.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Orders/Rullings/Guide',
      id,
      title: item ? item.fileName : 'Selected document',
      onConfirm: async () => {
        // ⚡ 1. INSTANT LOCAL REMOVAL (< 5ms)
        const updatedList = ordersRulingsGuides.filter((r) => r.id !== id);
        setOrdersRulingsGuides(updatedList);
        try {
          localStorage.setItem('aipeu_orders_rulings_guides', JSON.stringify(updatedList));
        } catch {}

        window.dispatchEvent(new CustomEvent('orders-rulings-guide-updated', { detail: updatedList }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('✅ Document removed instantly from Orders/Rullings/Guide.');

        // ⚡ 2. NON-BLOCKING BACKGROUND FIRESTORE DELETION
        deleteOrderRulingGuideFromFirestore(id).catch((err) => {
          console.warn('Background Firestore delete org error:', err);
        });
      },
    });
  };

  const handleClearAllOrdersRulingsGuides = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'All Orders / Rulings / Guides',
      id: 'clear-all-orgs',
      title: `All ${ordersRulingsGuides.length} Documents in Orders/Rullings/Guide`,
      onConfirm: async () => {
        setOrdersRulingsGuides([]);
        try {
          localStorage.setItem('aipeu_orders_rulings_guides', '[]');
        } catch {}
        window.dispatchEvent(new CustomEvent('orders-rulings-guide-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('dynamic-content-updated'));
        showNotification('🧹 All Orders / Rulings / Guide documents cleared. Repository is ready for fresh files!');
        clearAllOrdersRulingsGuidesFromFirestore().catch((err) => console.warn(err));
      },
    });
  };
  // Navigation menu items matching the screenshot
  const menuItems: { id: AdminMenuTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'members', label: 'Member Management', icon: ShieldCheck },
    { id: 'ordersRulingsGuide', label: 'Orders/Rullings/Guide', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'importantDocs', label: 'Homepage Docs', icon: FileCheck },
    { id: 'notices', label: 'Notices & Circulars', icon: Bookmark },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon },
    { id: 'myApps', label: 'My Apps', icon: LayoutGrid },
    { id: 'hero', label: 'Hero Slider', icon: Sliders },
    { id: 'forms', label: 'Forms', icon: ListTodo },
    { id: 'employeeSite', label: 'Employee Site', icon: Briefcase },
    { id: 'news', label: 'News Ticker', icon: Radio },
    { id: 'executives', label: 'Executive Bearers', icon: Users },
  ];

  // Filtered list of custom apps & HTML tools for card display
  const filteredMyApps = myApps.filter((app) => {
    const matchesCat =
      appsCategoryFilter === 'all' ||
      app.category.toLowerCase() === appsCategoryFilter.toLowerCase();
    const q = appsSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      (app.description && app.description.toLowerCase().includes(q)) ||
      (app.category && app.category.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div
      ref={adminContainerRef}
      className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col overflow-y-auto overflow-x-hidden selection:bg-red-500 selection:text-white"
    >
      {/* 1. Thin Red Accent Line at the very top edge */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 w-full shrink-0 sticky top-0 z-40" />

      {/* 2. Top Navigation & Breadcrumb Bar with Back & Home Controls */}
      <header className="bg-white/95 backdrop-blur-md px-3 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-2 border-b border-slate-200/80 sticky top-1 z-30 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* ← Back Button */}
          <button
            onClick={handleAdminBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Return to previous section or page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-red-600" />
            <span>← Back</span>
          </button>

          {/* ⌂ Home Button (Direct to Website Home Page) */}
          <button
            onClick={() => {
              if (onGoHome) onGoHome();
              else onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#022A61] hover:bg-blue-900 text-white font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Go directly to main Website Home Page"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>⌂ Home</span>
          </button>

          {isAuthenticated && activeTab !== 'dashboard' && (
            <button
              onClick={() => handleSelectAdminTab('dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition-all cursor-pointer"
              title="Open Admin Dashboard"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold pl-1">
            <span className="text-slate-300 font-normal">›</span>
            <span className="text-red-600 font-black uppercase tracking-wider">ADMIN PORTAL</span>
            {isAuthenticated && (
              <>
                <span className="text-slate-300 font-normal">›</span>
                <span className="text-slate-700 font-bold uppercase tracking-wider truncate">
                  {menuItems.find((m) => m.id === activeTab)?.label || 'Dashboard'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile hamburger menu toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle Admin Menu"
            >
              <Menu className="w-4 h-4" />
              <span>Sections</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              title="Sign Out from Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Quick-Switch Tab Strip (Visible on phones/tablets when authenticated) */}
      {isAuthenticated && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none sticky top-[53px] z-20 shadow-2xs">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectAdminTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Status toast message */}
      {statusMsg && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-md bg-slate-900 text-white text-xs font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Container */}
      {!isAuthenticated ? (
        /* Password-Protected Official Admin Login Screen */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-100/70">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 text-center relative overflow-hidden">
            {/* Red & Gold Postal Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-red-100/50">
              <ShieldCheck className="w-8 h-8 text-red-600" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-black uppercase tracking-widest mb-1.5">
              <Lock className="w-3 h-3 text-red-600" />
              <span>OFFICIAL EXECUTIVE ACCESS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              AIPEU Admin Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
              Dhenkanal Postal Division. Restricted access for authorized union office bearers and division administrators.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  User ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => {
                      setUserIdInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter User ID (e.g. aipeu)"
                    autoComplete="username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all shadow-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter Password"
                    autoComplete="current-password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to Admin Portal</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center transition-colors cursor-pointer"
              >
                Return to Website
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Portal with clean sidebar & single-scroll responsive layout */
        <div className="flex-1 flex relative">
          {/* Mobile Drawer Backdrop */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Left Sidebar */}
          <aside
            className={`w-64 xl:w-72 bg-white border-r border-slate-200/80 p-4 sm:p-5 flex flex-col shrink-0 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] fixed inset-y-0 left-0 z-40 transition-transform lg:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Admin Profile Widget */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                    alt="Administrator Kalandi Charan Sahoo"
                    className="w-11 h-11 rounded-full object-cover border-2 border-red-500/80 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                    ADMINISTRATOR
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    Kalandi Charan Sahoo
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Divisional Secretary
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Back & Home Quick Controls */}
            <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-slate-100">
              <button
                onClick={handleAdminBack}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-red-600" />
                <span>← Back</span>
              </button>
              <button
                onClick={() => {
                  if (onGoHome) onGoHome();
                  else onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#022A61] hover:bg-blue-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>⌂ Home</span>
              </button>
            </div>

            {/* Navigation Menu List */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectAdminTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                        : 'text-slate-600 hover:text-red-600 hover:bg-red-50/60'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer info */}
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-tight">
              NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division
            </div>
          </aside>

          {/* Main Content Area (No nested overflow-y-auto so the page scrolls naturally) */}
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full min-w-0">
            {/* Top Section Header with quick Back / Dashboard button */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                    AIPEU ADMIN CONSOLE
                  </span>
                  {activeTab !== 'dashboard' && (
                    <button
                      onClick={() => handleSelectAdminTab('dashboard')}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      ← Back to Dashboard Overview
                    </button>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">
                  {activeTab === 'hero' && 'HERO SLIDER MANAGEMENT'}
                  {activeTab === 'dashboard' && 'EXECUTIVE ADMIN DASHBOARD'}
                  {activeTab === 'members' && 'MEMBER MANAGEMENT'}
                  {activeTab === 'ordersRulingsGuide' && 'ORDERS / RULINGS / GUIDE'}
                  {activeTab === 'documents' && 'DOCUMENTS & CIRCULARS'}
                  {activeTab === 'importantDocs' && 'HOMEPAGE IMPORTANT DOCS'}
                  {activeTab === 'notices' && 'NOTICES & CIRCULARS'}
                  {activeTab === 'announcements' && 'ANNOUNCEMENTS'}
                  {activeTab === 'gallery' && 'PHOTO GALLERY'}
                  {activeTab === 'myApps' && 'MY APPS & TOOLS'}
                  {activeTab === 'forms' && 'DOWNLOADABLE FORMS'}
                  {activeTab === 'employeeSite' && 'EMPLOYEE SITE RESOURCES'}
                  {activeTab === 'news' && 'BREAKING NEWS TICKER'}
                  {activeTab === 'executives' && 'EXECUTIVE OFFICE BEARERS'}
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {activeTab === 'hero' && 'Upload and organize banners for the Homepage and Circulars & Feed slider.'}
                  {activeTab === 'dashboard' && 'Complete overview, live statistics, and quick access to all union portal modules.'}
                  {activeTab === 'members' && 'Manage union members, verification, digital ID cards, and profile updates.'}
                  {activeTab === 'ordersRulingsGuide' && 'Upload and manage official documents displayed in color-coded card view.'}
                  {activeTab === 'documents' && 'Upload divisional circulars, meeting minutes, and union orders.'}
                  {activeTab === 'importantDocs' && 'Pin crucial documents to the Homepage Important Documents section.'}
                  {activeTab === 'notices' && 'Manage Notice Board, CGHS, and pension circulars on the Homepage.'}
                  {activeTab === 'announcements' && 'Update Homepage announcements and important flash alerts.'}
                  {activeTab === 'gallery' && 'Upload and organize event photos for the full-page Union Photo Gallery.'}
                  {activeTab === 'myApps' && 'Manage quick-access web portals and interactive HTML utilities.'}
                  {activeTab === 'forms' && 'Manage downloadable departmental examination, leave, and service forms.'}
                  {activeTab === 'employeeSite' && 'Manage postal manuals, conduct rules, and establishment links.'}
                  {activeTab === 'news' && 'Manage real-time moving news ticker headlines.'}
                  {activeTab === 'executives' && 'Manage Union Office Bearers and Divisional Representatives.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAdminBack}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-red-600" />
                  <span>← Back</span>
                </button>
                <button
                  onClick={() => {
                    if (onGoHome) onGoHome();
                    else onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#022A61] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  <span>⌂ Home</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: HERO SLIDER (matching screenshot layout + Circular & Feed management) */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                {/* Information Header Banner */}
                <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        Dual Hero Slider Management
                      </h3>
                      <p className="text-xs text-slate-600">
                        Manage slides for <strong className="text-blue-700">Home Page</strong> and{' '}
                        <strong className="text-rose-700">Circular &amp; Feed Page</strong>. Add, edit, modify, pause, or delete in real time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      Total: {heroSlides.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Add/Edit Slide Card */}
                  <div
                    ref={heroFormRef}
                    className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-24"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                        {editingSlide ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {editingSlide ? 'EDIT SLIDE' : 'ADD NEW SLIDE'}
                      </h2>
                      {editingSlide && (
                        <button
                          type="button"
                          onClick={handleCancelEditSlide}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase"
                        >
                          ✕ Cancel
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveHeroSlide} className="space-y-4">
                      {/* Target Page Selector */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>DISPLAY LOCATION / TARGET PAGE *</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setHeroTargetPage('home')}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                              heroTargetPage === 'home'
                                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>🏠</span>
                            <span className="truncate">Home</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroTargetPage('feed')}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                              heroTargetPage === 'feed'
                                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>📜</span>
                            <span className="truncate">Feed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroTargetPage('both')}
                            className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                              heroTargetPage === 'both'
                                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>🌐</span>
                            <span className="truncate">Both</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          {heroTargetPage === 'feed' && '📌 Slide will appear on the Circulars & Feed page header.'}
                          {heroTargetPage === 'home' && '📌 Slide will appear on the main Home Page hero banner.'}
                          {heroTargetPage === 'both' && '📌 Slide will appear on both Home and Circular & Feed pages.'}
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>PHOTO / BANNER IMAGE *</span>
                          <span className="text-[10px] text-blue-600 font-semibold">Web URL or Device Upload</span>
                        </label>
                        <div className="space-y-2">
                          <input
                            type="url"
                            value={heroImageUrl}
                            onChange={(e) => setHeroImageUrl(e.target.value)}
                            placeholder="https://... or upload below"
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder-slate-400"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>📁 Choose Image File</span>
                              <input
                                ref={heroFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleHeroImageUpload}
                                className="hidden"
                              />
                            </label>
                            {heroImageUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingDoc({
                                  title: heroTitle || 'Hero Slide Banner',
                                  category: heroTag || 'Hero Banner',
                                  url: heroImageUrl,
                                  type: 'Homepage Document'
                                })}
                                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>Preview</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          TITLE (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                          placeholder={heroTargetPage === 'feed' ? 'e.g. Directorate Orders & Postal Guidelines' : 'Enter slide title...'}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder-slate-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          SUBTITLE (OPTIONAL)
                        </label>
                        <textarea
                          value={heroSubtitle}
                          onChange={(e) => setHeroSubtitle(e.target.value)}
                          placeholder={heroTargetPage === 'feed' ? 'e.g. Stay updated with gazette notifications and circle resolutions.' : 'Enter slide subtitle...'}
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder-slate-400 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            TAG / BADGE
                          </label>
                          <input
                            type="text"
                            value={heroTag}
                            onChange={(e) => setHeroTag(e.target.value)}
                            placeholder={heroTargetPage === 'feed' ? '📜 CIRCULAR' : '🎓 DAKSHIKSHA'}
                            className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-slate-800 placeholder-slate-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            CTA BUTTON TEXT
                          </label>
                          <input
                            type="text"
                            value={heroCtaText}
                            onChange={(e) => setHeroCtaText(e.target.value)}
                            placeholder={heroTargetPage === 'feed' ? 'Download Circular' : 'Learn More'}
                            className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-slate-800 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{editingSlide ? 'Update Slide' : '+ Add Slide'}</span>
                        </button>

                        {editingSlide && (
                          <button
                            type="button"
                            onClick={handleCancelEditSlide}
                            className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center transition-colors"
                          >
                            Cancel Editing
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Current Slides List with Filter Tabs */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHeroFilterPage('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            heroFilterPage === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          All ({heroSlides.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroFilterPage('home')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            heroFilterPage === 'home'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100/70'
                          }`}
                        >
                          <span>🏠 Home</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                            {heroSlides.filter((s) => s.targetPage === 'home' || s.targetPage === 'both' || !s.targetPage).length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroFilterPage('feed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            heroFilterPage === 'feed'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100/70'
                          }`}
                        >
                          <span>📜 Circular &amp; Feed</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                            {heroSlides.filter((s) => s.targetPage === 'feed' || s.targetPage === 'both').length}
                          </span>
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        Click badges to switch page
                      </span>
                    </div>

                    {/* Slides List */}
                    <div className="space-y-3">
                      {heroSlides
                        .filter((slide) => {
                          if (heroFilterPage === 'all') return true;
                          if (heroFilterPage === 'home') {
                            return slide.targetPage === 'home' || slide.targetPage === 'both' || !slide.targetPage;
                          }
                          if (heroFilterPage === 'feed') {
                            return slide.targetPage === 'feed' || slide.targetPage === 'both';
                          }
                          return true;
                        })
                        .map((slide) => {
                          const target = slide.targetPage || 'home';
                          const isActive = slide.active !== false;

                          return (
                            <div
                              key={slide.id}
                              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                                editingSlide?.id === slide.id
                                  ? 'border-red-500 ring-2 ring-red-100'
                                  : 'border-slate-200/80 hover:border-slate-300'
                              } ${!isActive ? 'opacity-70 bg-slate-50/60' : ''}`}
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                  <div className="relative shrink-0">
                                    <img
                                      src={slide.imageUrl}
                                      alt={slide.title || 'Slide photo'}
                                      className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-slate-100 bg-slate-100 shadow-2xs"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80';
                                      }}
                                    />
                                    {!isActive && (
                                      <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex items-center justify-center text-white text-[10px] font-bold">
                                        PAUSED
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    {/* Location Badges & Status */}
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                      {target === 'feed' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                          📜 Circular &amp; Feed
                                        </span>
                                      )}
                                      {target === 'home' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                          🏠 Home Page
                                        </span>
                                      )}
                                      {target === 'both' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          🌐 Both Pages
                                        </span>
                                      )}

                                      {slide.tag && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                          {slide.tag}
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleToggleSlideActive(slide)}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                          isActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                        }`}
                                        title="Click to toggle active status"
                                      >
                                        {isActive ? '● Active' : '○ Inactive'}
                                      </button>
                                    </div>

                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                      {slide.title || 'Untitled Slide'}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                      {slide.subtitle || 'AIPEU Dhenkanal Division Official Update'}
                                    </p>

                                    {/* Target switch quick controls */}
                                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                      <span className="text-[10px] font-semibold text-slate-400">Target:</span>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSlideTarget(slide, 'home')}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                          target === 'home'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                        }`}
                                      >
                                        Home
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSlideTarget(slide, 'feed')}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                          target === 'feed'
                                            ? 'bg-rose-600 text-white'
                                            : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                        }`}
                                      >
                                        Feed
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSlideTarget(slide, 'both')}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                          target === 'both'
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                        }`}
                                      >
                                        Both
                                      </button>

                                      <a
                                        href={slide.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-red-600 hover:text-red-700 text-xs font-semibold ml-auto flex items-center gap-1"
                                      >
                                        <span>🔗 View</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                 <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                                   <button
                                     type="button"
                                     onClick={() => setViewingDoc({
                                       title: slide.title || 'Hero Slide Banner',
                                       category: `${slide.tag || 'Hero'} • ${target.toUpperCase()}`,
                                       url: slide.imageUrl,
                                       type: 'Homepage Document'
                                     })}
                                     className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                     title="View Banner in Modal"
                                   >
                                     <Eye className="w-3.5 h-3.5 text-blue-600" />
                                     <span>View</span>
                                   </button>
                                   <button
                                     type="button"
                                     onClick={() => handleDownloadDoc(slide.imageUrl, slide.title || 'hero_banner')}
                                     className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                     title="Download Image"
                                   >
                                     <Download className="w-3.5 h-3.5 text-emerald-600" />
                                     <span>Download</span>
                                   </button>
                                   <button
                                     onClick={() => handleEditSlideClick(slide)}
                                     className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                     title="Edit Slide"
                                   >
                                     <Edit2 className="w-3.5 h-3.5" />
                                     <span>Edit</span>
                                   </button>
                                   <button
                                     onClick={() => handleDeleteHeroSlide(slide.id)}
                                     className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                                     title="Delete Slide"
                                   >
                                     <Trash2 className="w-3.5 h-3.5" />
                                     <span>Delete</span>
                                   </button>
                                 </div>
                               </div>
                             </div>
                          );
                        })}

                      {heroSlides.length === 0 && (
                        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm">
                          No hero slides configured. Add your first photo using the left form.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DASHBOARD (MODERNIZED UI/UX) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* 1. Executive Welcome & Quick Action Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-[#022A61] via-[#0A3D80] to-[#B91C1C] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>DIVISIONAL EXECUTIVE COMMAND CENTER</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        Welcome, Divisional Secretary · AIPEU Dhenkanal Portal
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                        Manage union members, publish departmental orders & rulings, update homepage documents, and control all 14 portal modules from one unified dashboard.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleSelectAdminTab('ordersRulingsGuide')}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Upload Order / Ruling</span>
                      </button>
                      <button
                        onClick={() => handleSelectAdminTab('notices')}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-amber-300" />
                        <span>Post Notice</span>
                      </button>
                      <button
                        onClick={() => handleSelectAdminTab('members')}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Member Directory</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Attractive Color-Coded Summary Statistics Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      <span>Portal Content & Asset Summary</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Click any card to open management module
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[
                      {
                        label: 'Orders / Rulings / Guide',
                        count: ordersRulingsGuides.length,
                        tab: 'ordersRulingsGuide' as AdminMenuTab,
                        icon: BookOpen,
                        bg: 'bg-gradient-to-br from-sky-50 to-blue-100/70 border-sky-200 hover:border-sky-400',
                        iconBox: 'bg-sky-600 text-white',
                        text: 'text-sky-900',
                      },
                      {
                        label: 'Homepage Docs',
                        count: importantDocs.length,
                        tab: 'importantDocs' as AdminMenuTab,
                        icon: FileCheck,
                        bg: 'bg-gradient-to-br from-emerald-50 to-green-100/70 border-emerald-200 hover:border-emerald-400',
                        iconBox: 'bg-emerald-600 text-white',
                        text: 'text-emerald-900',
                      },
                      {
                        label: 'Notices & Circulars',
                        count: noticeCirculars.length,
                        tab: 'notices' as AdminMenuTab,
                        icon: Bookmark,
                        bg: 'bg-gradient-to-br from-amber-50 to-yellow-100/70 border-amber-200 hover:border-amber-400',
                        iconBox: 'bg-amber-600 text-white',
                        text: 'text-amber-900',
                      },
                      {
                        label: 'Announcements',
                        count: announcements.length,
                        tab: 'announcements' as AdminMenuTab,
                        icon: Megaphone,
                        bg: 'bg-gradient-to-br from-rose-50 to-pink-100/70 border-rose-200 hover:border-rose-400',
                        iconBox: 'bg-rose-600 text-white',
                        text: 'text-rose-900',
                      },
                      {
                        label: 'Member Management',
                        count: 'Active',
                        tab: 'members' as AdminMenuTab,
                        icon: ShieldCheck,
                        bg: 'bg-gradient-to-br from-indigo-50 to-violet-100/70 border-indigo-200 hover:border-indigo-400',
                        iconBox: 'bg-indigo-600 text-white',
                        text: 'text-indigo-900',
                      },
                      {
                        label: 'Circulars & Feed',
                        count: circulars.length,
                        tab: 'documents' as AdminMenuTab,
                        icon: FileText,
                        bg: 'bg-gradient-to-br from-orange-50 to-amber-100/70 border-orange-200 hover:border-orange-400',
                        iconBox: 'bg-orange-600 text-white',
                        text: 'text-orange-900',
                      },
                      {
                        label: 'Hero Slider Banners',
                        count: heroSlides.length,
                        tab: 'hero' as AdminMenuTab,
                        icon: Sliders,
                        bg: 'bg-gradient-to-br from-teal-50 to-cyan-100/70 border-teal-200 hover:border-teal-400',
                        iconBox: 'bg-teal-600 text-white',
                        text: 'text-teal-900',
                      },
                      {
                        label: 'Photo Gallery',
                        count: galleryPhotos.length,
                        tab: 'gallery' as AdminMenuTab,
                        icon: ImageIcon,
                        bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-100/70 border-purple-200 hover:border-purple-400',
                        iconBox: 'bg-purple-600 text-white',
                        text: 'text-purple-900',
                      },
                      {
                        label: 'My Apps & Tools',
                        count: myApps.length,
                        tab: 'myApps' as AdminMenuTab,
                        icon: LayoutGrid,
                        bg: 'bg-gradient-to-br from-blue-50 to-indigo-100/70 border-blue-200 hover:border-blue-400',
                        iconBox: 'bg-blue-600 text-white',
                        text: 'text-blue-900',
                      },
                      {
                        label: 'Executive Bearers',
                        count: executives.length,
                        tab: 'executives' as AdminMenuTab,
                        icon: Users,
                        bg: 'bg-gradient-to-br from-emerald-50 to-teal-100/70 border-emerald-200 hover:border-emerald-400',
                        iconBox: 'bg-emerald-700 text-white',
                        text: 'text-emerald-950',
                      },
                    ].map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAdminTab(stat.tab)}
                          className={`rounded-3xl p-4 sm:p-5 border-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between cursor-pointer ${stat.bg}`}
                        >
                          <div className="flex items-start justify-between w-full gap-2 mb-3">
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider leading-snug">
                              {stat.label}
                            </span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${stat.iconBox}`}>
                              <StatIcon className="w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <div className={`text-2xl sm:text-3xl font-black ${stat.text}`}>{stat.count}</div>
                            <span className="text-[11px] text-slate-600 font-bold mt-1.5 inline-flex items-center gap-1">
                              <span>Open Module</span>
                              <span>→</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Categorized Administrative Sections for 1-Click Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Category A: Homepage Sections (6-Document Scrollable Columns) */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase">Homepage Live Sections</h4>
                        <p className="text-[11px] text-slate-500">Manage 6-row scrollable home columns & sliders</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'announcements' as AdminMenuTab, title: 'Announcements Column', sub: `${announcements.length} items published`, icon: Megaphone },
                        { id: 'importantDocs' as AdminMenuTab, title: 'Important Documents (Homepage)', sub: `${importantDocs.length} pinned PDFs`, icon: FileCheck },
                        { id: 'notices' as AdminMenuTab, title: 'Notice / Circular Column', sub: `${noticeCirculars.length} official notices`, icon: Bookmark },
                        { id: 'hero' as AdminMenuTab, title: 'Hero Banner Slider', sub: `${heroSlides.length} active slides`, icon: Sliders },
                        { id: 'news' as AdminMenuTab, title: 'Moving News Ticker', sub: `${newsItems.length} flash headlines`, icon: Radio },
                      ].map((m) => {
                        const MIcon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectAdminTab(m.id)}
                            className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-red-50/70 border border-slate-200/70 hover:border-red-200 flex items-center justify-between gap-3 transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <MIcon className="w-4 h-4 text-red-600 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 group-hover:text-red-700 truncate">{m.title}</div>
                                <div className="text-[10px] text-slate-500">{m.sub}</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-red-600">Manage →</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category B: Union Repository, Orders & Forms */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase">Repository & Resources</h4>
                        <p className="text-[11px] text-slate-500">Orders, Rulings, Guides, Forms & Employee Site</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'ordersRulingsGuide' as AdminMenuTab, title: 'Orders / Rulings / Guide Cards', sub: `${ordersRulingsGuides.length} color-coded cards`, icon: BookOpen },
                        { id: 'documents' as AdminMenuTab, title: 'Circulars & Feed Posts', sub: `${circulars.length} full articles`, icon: FileText },
                        { id: 'forms' as AdminMenuTab, title: 'Downloadable Service Forms', sub: `${formsList.length} official forms`, icon: ListTodo },
                        { id: 'employeeSite' as AdminMenuTab, title: 'Employee Site Manuals & Rules', sub: `${employeeResources.length} reference links`, icon: Briefcase },
                      ].map((m) => {
                        const MIcon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectAdminTab(m.id)}
                            className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-200 flex items-center justify-between gap-3 transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <MIcon className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">{m.title}</div>
                                <div className="text-[10px] text-slate-500">{m.sub}</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">Manage →</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category C: Members, Bearers, Apps & Gallery */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase">Members, Bearers & Apps</h4>
                        <p className="text-[11px] text-slate-500">Union directory, ID cards, apps & photo gallery</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'members' as AdminMenuTab, title: 'Member Management & ID Cards', sub: 'Approve members & verify QR cards', icon: ShieldCheck },
                        { id: 'executives' as AdminMenuTab, title: 'Executive Office Bearers', sub: `${executives.length} union representatives`, icon: Users },
                        { id: 'myApps' as AdminMenuTab, title: 'My Apps & HTML Calculators', sub: `${myApps.length} web & HTML apps`, icon: LayoutGrid },
                        { id: 'gallery' as AdminMenuTab, title: 'Union Photo Gallery', sub: `${galleryPhotos.length} event photos`, icon: ImageIcon },
                      ].map((m) => {
                        const MIcon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectAdminTab(m.id)}
                            className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 flex items-center justify-between gap-3 transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <MIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">{m.title}</div>
                                <div className="text-[10px] text-slate-500">{m.sub}</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">Manage →</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. System & Firestore Status */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-4">
                    SYSTEM STATUS & CLOUD FIREBASE DATABASE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-400 block mb-1">Firestore Database ID</span>
                      <span className="font-mono font-bold text-slate-800 break-all">
                        ai-studio-aipeudhenkanalmo-92311c29-3d61-4e4b-8c3f-8172b17c3855
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60">
                      <span className="text-emerald-700 font-medium block mb-1">Connection State</span>
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active & Synchronized with Firestore
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MEMBER MANAGEMENT (ADMINISTRATION) */}
            {activeTab === 'members' && (
              <MemberManagementAdmin onNotify={showNotification} />
            )}

            {/* TAB CONTENT: ORDERS / RULINGS / GUIDE (UPLOAD & PASTEL COLOR-CODED CARD MANAGEMENT) */}
            {activeTab === 'ordersRulingsGuide' && (
              <div className="space-y-6">
                {/* Information Header Banner */}
                <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-100 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Orders / Rulings / Guide Management
                      </h3>
                      <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
                        Upload official documents with <strong>File name</strong>, <strong>Folder name</strong>, <strong>Category</strong>, and <strong>Document URL</strong>. Each card is automatically styled with a distinct pastel color combination.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <span className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                      {ordersRulingsGuides.length} Total Cards
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Upload / Fill-up Form matching user request */}
                  <div
                    ref={orgFormRef}
                    className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 lg:sticky lg:top-24"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                        {editingOrgItem ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {editingOrgItem ? 'EDIT DOCUMENT' : 'UPLOAD DOCUMENT'}
                      </h2>
                      {editingOrgItem && (
                        <button
                          type="button"
                          onClick={handleCancelEditOrg}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase"
                        >
                          ✕ Cancel
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveOrgDocument} className="space-y-4">
                      {/* 1. File Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                          FILE NAME *
                        </label>
                        <input
                          type="text"
                          value={orgFileName}
                          onChange={(e) => setOrgFileName(e.target.value)}
                          placeholder="e.g. Rule 38 Transfer Guidelines & Waiting List 2026"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Main document title displayed on the front of the card.
                        </span>
                      </div>

                      {/* 2. Folder Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                          FOLDER NAME *
                        </label>
                        <input
                          type="text"
                          value={orgFolderName}
                          onChange={(e) => setOrgFolderName(e.target.value)}
                          placeholder="e.g. Postal Manuals, Rule 38 Transfers, Pay Fixation"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                        {/* Quick suggestions pills */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['Postal Manuals', 'Rule 38 Transfers', 'Conduct & Service Rules', 'Pay & Allowances', 'Union Affairs', 'GDS Regulations'].map(
                            (f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => setOrgFolderName(f)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                  orgFolderName === f
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                                }`}
                              >
                                {f}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* 3. Category */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                          CATEGORY *
                        </label>
                        <input
                          type="text"
                          value={orgCategory}
                          onChange={(e) => setOrgCategory(e.target.value)}
                          placeholder="e.g. Orders, Rulings, Guide, Manuals, Circular"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                        {/* Quick category pills */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['Orders', 'Rulings', 'Guide', 'Manuals', 'Circular', 'Welfare'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setOrgCategory(c)}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border transition-all ${
                                orgCategory === c
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Document Source: Upload vs Web Link Toggle */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            DOCUMENT FILE / SOURCE *
                          </label>
                          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setOrgFileMode('upload')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                                orgFileMode === 'upload'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload File</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrgFileMode('url')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                                orgFileMode === 'url'
                                  ? 'bg-white text-blue-600 shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>Web Link</span>
                            </button>
                          </div>
                        </div>

                        {orgFileMode === 'upload' ? (
                          <div className="space-y-2">
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-red-300 hover:border-red-500 bg-red-50/40 hover:bg-red-50/70 p-4 rounded-2xl cursor-pointer transition-all group">
                              <Upload className="w-6 h-6 text-red-500 mb-1.5 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-bold text-slate-800">Choose PDF / Document file</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">Supports PDF, DOC, Images (up to 15MB)</span>
                              <input
                                ref={orgFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleOrgFileUpload}
                                className="hidden"
                              />
                            </label>

                            {orgUploadedFileName && (
                              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-emerald-900 block truncate">
                                      {orgUploadedFileName}
                                    </span>
                                    {orgUploadedFileSize && (
                                      <span className="text-[10px] text-emerald-600">
                                        {orgUploadedFileSize} • Attached
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {orgDocumentUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setViewingDoc({
                                        title: orgFileName || orgUploadedFileName,
                                        category: `${orgCategory} • ${orgFolderName}`,
                                        url: orgDocumentUrl,
                                        type: 'Order / Ruling'
                                      })}
                                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200 transition-colors"
                                    >
                                      Preview
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOrgUploadedFileName('');
                                      setOrgUploadedFileSize('');
                                      setOrgDocumentUrl('');
                                      if (orgFileInputRef.current) orgFileInputRef.current.value = '';
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                                    title="Remove attachment"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="url"
                              value={orgDocumentUrl}
                              onChange={(e) => setOrgDocumentUrl(e.target.value)}
                              placeholder="https://drive.google.com/... or https://indiapost.gov.in/..."
                              required={orgFileMode === 'url'}
                              className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-mono text-xs"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Direct web link or Google Drive PDF download link.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Optional: Brief Note / Summary */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                          BRIEF DESCRIPTION / NOTE (OPTIONAL)
                        </label>
                        <textarea
                          rows={2}
                          value={orgNotes}
                          onChange={(e) => setOrgNotes(e.target.value)}
                          placeholder="Short summary or important order reference number..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>

                      {/* 5. Save Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingOrgItem ? 'Update Document' : 'Save'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Uploaded Documents in Distinct Pastel Color-Coded Card View */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {/* Search and Folder Filter in Admin */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={orgSearchQuery}
                          onChange={(e) => setOrgSearchQuery(e.target.value)}
                          placeholder="Search uploaded cards by file, folder, or category..."
                          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-red-500"
                        />
                        {orgSearchQuery && (
                          <button
                            onClick={() => setOrgSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={orgFolderFilter}
                          onChange={(e) => setOrgFolderFilter(e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="All">All Folders</option>
                          {Array.from(new Set(ordersRulingsGuides.map((i) => i.folderName))).map((f) => (
                            <option key={f} value={f}>
                              📁 {f}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ordersRulingsGuides
                        .filter((item) => {
                          const q = orgSearchQuery.toLowerCase().trim();
                          const matchesQ =
                            !q ||
                            item.fileName.toLowerCase().includes(q) ||
                            item.folderName.toLowerCase().includes(q) ||
                            item.category.toLowerCase().includes(q) ||
                            (item.notes && item.notes.toLowerCase().includes(q));
                          const matchesF =
                            orgFolderFilter === 'All' ||
                            item.folderName.toLowerCase() === orgFolderFilter.toLowerCase();
                          return matchesQ && matchesF;
                        })
                        .map((item, idx) => {
                          const stableIndex = ordersRulingsGuides.findIndex((x) => x.id === item.id);
                          const palette = getCardColorPalette(stableIndex >= 0 ? stableIndex : idx);
                          return (
                            <div
                              key={item.id}
                              className={`relative overflow-hidden p-5 rounded-3xl border-2 ${palette.cardBg} ${palette.cardBorder} ${palette.cardHoverBorder} shadow-xs hover:shadow-md transition-all flex flex-col justify-between group`}
                            >
                              <div className={`absolute top-0 left-0 right-0 h-1.5 ${palette.accentBar}`} />

                              <div className="space-y-2.5 pt-1">
                                {/* Badges */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${palette.badgeBg}`}>
                                    {item.category}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${palette.folderBadge}`}>
                                    <Folder className="w-3 h-3" />
                                    <span>{item.folderName}</span>
                                  </span>
                                </div>

                                {/* File Name */}
                                <h4 className={`font-black text-sm leading-snug line-clamp-2 ${palette.titleColor}`}>
                                  {item.fileName}
                                </h4>

                                {item.notes && (
                                  <p className={`text-xs line-clamp-2 ${palette.notesColor}`}>
                                    {item.notes}
                                  </p>
                                )}

                                {/* Link Preview */}
                                <div className="pt-1">
                                  <a
                                    href={item.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-mono text-blue-700 hover:underline truncate block"
                                  >
                                    {item.documentUrl}
                                  </a>
                                </div>
                              </div>

                              {/* Actions bar */}
                              <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setViewingDoc({
                                      title: item.fileName,
                                      category: `${item.category} • ${item.folderName}`,
                                      url: item.documentUrl,
                                      published: item.published,
                                      type: 'Order / Ruling'
                                    })}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 bg-white/90 hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                    title="View Document in Portal"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                    <span>View File</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDoc(item.documentUrl, item.fileName)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 bg-white/90 hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Download</span>
                                  </button>

                                  <a
                                    href={item.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
                                    title="Open External URL"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditOrgClick(item)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-800 bg-white/90 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Edit Document"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrgItem(item.id)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 bg-white/90 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Delete Document"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {ordersRulingsGuides.length === 0 && (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm">
                        No orders, rulings or guides uploaded yet. Use the form on the left to upload your first document.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTS (CIRCULARS) */}
            {activeTab === 'documents' && (() => {
              const categories = ['All', ...Array.from(new Set(circulars.map((c) => c.categories?.[0] || 'General')))];
              const filteredCirculars = circulars.filter((circ) => {
                const matchesCategory = docPostCategoryFilter === 'All' || circ.categories?.includes(docPostCategoryFilter);
                const q = docPostSearchQuery.trim().toLowerCase();
                const matchesSearch =
                  !q ||
                  (circ.title && circ.title.toLowerCase().includes(q)) ||
                  (circ.snippet && circ.snippet.toLowerCase().includes(q)) ||
                  (circ.author && circ.author.toLowerCase().includes(q));
                return matchesCategory && matchesSearch;
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div
                    ref={docPostFormRef}
                    className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-20"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                          {editingCircular ? 'EDIT DOCUMENT / CIRCULAR' : 'ADD NEW DOCUMENT'}
                        </h2>
                      </div>
                      {editingCircular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          Editing Mode
                        </span>
                      )}
                    </div>

                    {editingCircular && (
                      <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-center justify-between gap-2">
                        <div className="text-xs text-blue-900 font-medium truncate">
                          Editing: <span className="font-bold">{editingCircular.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEditCircular}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline shrink-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSaveCircular} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          DOCUMENT TITLE *
                        </label>
                        <input
                          type="text"
                          value={docPostTitle}
                          onChange={(e) => setDocPostTitle(e.target.value)}
                          placeholder="e.g. Minutes of Bi-Monthly Council Meeting"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          CATEGORY
                        </label>
                        <select
                          value={docPostCategory}
                          onChange={(e) => setDocPostCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-900"
                        >
                          <option value="GROUP - 'C' AGENDA">GROUP - 'C' AGENDA</option>
                          <option value="DIVISION ORDERS">DIVISION ORDERS</option>
                          <option value="DEPARTMENTAL EXAMS">DEPARTMENTAL EXAMS</option>
                          <option value="POSTMEN / MTS">POSTMEN / MTS</option>
                          <option value="PENSION & WELFARE">PENSION & WELFARE</option>
                          <option value="GENERAL">GENERAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          SUMMARY / SNIPPET *
                        </label>
                        <textarea
                          value={docPostSnippet}
                          onChange={(e) => setDocPostSnippet(e.target.value)}
                          placeholder="Enter concise document description or order brief..."
                          rows={3}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none font-normal text-slate-800"
                        />
                      </div>

                      {/* File Source: Upload File vs Web Link */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            ATTACHED FILE / DOCUMENT (OPTIONAL)
                          </label>
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setDocPostFileMode('upload')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                docPostFileMode === 'upload'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📁 Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocPostFileMode('url')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                docPostFileMode === 'url'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              🔗 Web Link
                            </button>
                          </div>
                        </div>

                        {docPostFileMode === 'upload' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={docPostFileInputRef}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                              onChange={handleDocPostFileUpload}
                              className="hidden"
                            />
                            {docPostFileUrl && (docPostFileUrl.startsWith('data:') || docPostFileName) ? (
                              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {docPostFileName || 'Attached Document File'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                                      {docPostFileSize && <span>{docPostFileSize}</span>}
                                      <span className="text-emerald-600 font-bold">Ready to Save</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: docPostTitle || 'Document File',
                                        category: docPostCategory,
                                        url: docPostFileUrl,
                                        type: 'Notice / Circular',
                                      })
                                    }
                                    className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                                    title="Preview file"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => docPostFileInputRef.current?.click()}
                                    className="px-2 py-1 rounded-lg bg-white text-slate-700 hover:text-red-600 border border-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => docPostFileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                              >
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-red-600 mx-auto mb-1 transition-colors" />
                                <div className="text-xs font-bold text-slate-700 group-hover:text-red-700">
                                  Click to Select PDF or Document
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Supports PDF, DOCX, Scanned Circulars, Images
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="url"
                            value={docPostFileUrl}
                            onChange={(e) => setDocPostFileUrl(e.target.value)}
                            placeholder="https://drive.google.com/... or https://..."
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-slate-900"
                          />
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          PHOTO / BANNER URL (OPTIONAL)
                        </label>
                        <input
                          type="url"
                          value={docPostImageUrl}
                          onChange={(e) => setDocPostImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="docUrgent"
                          checked={docPostUrgent}
                          onChange={(e) => setDocPostUrgent(e.target.checked)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="docUrgent" className="text-xs font-medium text-slate-700 cursor-pointer">
                          Mark as Urgent / Red Flash
                        </label>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer transition-all active:scale-[0.99]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{editingCircular ? 'Update Document' : '+ Add Document'}</span>
                        </button>
                        {editingCircular && (
                          <button
                            type="button"
                            onClick={handleCancelEditCircular}
                            className="px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {/* Header + Search & Filter */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <span>PUBLIC PORTAL DOCUMENTS ({circulars.length})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            Feed &amp; Circulars
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Shown on the Circulars &amp; Feed public portal view
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={docPostSearchQuery}
                            onChange={(e) => setDocPostSearchQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                          />
                        </div>

                        {categories.length > 2 && (
                          <select
                            value={docPostCategoryFilter}
                            onChange={(e) => setDocPostCategoryFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredCirculars.map((circ) => {
                        const fileUrl = circ.driveLinks?.[0] || circ.url || '';
                        return (
                          <div
                            key={circ.id}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between group space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 uppercase border border-red-100">
                                    {circ.categories?.[0] || 'CIRCULAR'}
                                  </span>
                                  {circ.published && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(circ.published).toLocaleDateString()}
                                    </span>
                                  )}
                                  {circ.urgent && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                                      URGENT
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-600 transition-colors">
                                  {circ.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {circ.snippet}
                                </p>
                              </div>

                              {circ.images?.[0] && (
                                <img
                                  src={circ.images[0]}
                                  alt={circ.title}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              {fileUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: circ.title,
                                        category: circ.categories?.[0] || 'Document',
                                        url: fileUrl,
                                        published: circ.published,
                                        type: 'Notice / Circular',
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                    title="View / Preview File in Portal"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View File</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDoc(fileUrl, circ.title)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  {!fileUrl.startsWith('data:') && (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                      title="Open in New Tab"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No file attached</span>
                              )}

                              <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => handleEditCircularClick(circ)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Edit Document"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCircular(circ.id)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredCirculars.length === 0 && (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm">
                        No documents found matching your search.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: HOMEPAGE DOCS */}
            {activeTab === 'importantDocs' && (() => {
              const docCategories = ['All', ...Array.from(new Set(importantDocs.map((d) => d.category || 'General').filter(Boolean)))];
              const filteredImportantDocs = importantDocs.filter((docItem) => {
                const q = docSearchQuery.trim().toLowerCase();
                const matchesSearch =
                  !q ||
                  (docItem.title && docItem.title.toLowerCase().includes(q)) ||
                  (docItem.category && docItem.category.toLowerCase().includes(q)) ||
                  (docItem.url && docItem.url.toLowerCase().includes(q));
                const matchesCat =
                  docCategoryFilter === 'All' ||
                  (docItem.category && docItem.category.toLowerCase() === docCategoryFilter.toLowerCase());
                return matchesSearch && matchesCat;
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Add / Edit Form */}
                  <div
                    ref={docFormRef}
                    className={`lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border transition-all sticky top-16 ${
                      editingDoc ? 'border-blue-400 ring-2 ring-blue-200 shadow-md' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-red-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                          {editingDoc ? 'EDIT HOMEPAGE DOCUMENT' : 'ADD HOMEPAGE DOCUMENT'}
                        </h2>
                      </div>
                      {editingDoc && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Editing Mode
                        </span>
                      )}
                    </div>

                    {editingDoc && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase text-blue-600">Modifying Document</div>
                          <div className="text-xs text-blue-950 font-bold truncate">
                            {editingDoc.title}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEditImportantDoc}
                          className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-[11px] font-bold text-blue-700 hover:bg-blue-100 shrink-0 cursor-pointer shadow-2xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSaveImportantDoc} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          DOCUMENT TITLE *
                        </label>
                        <input
                          type="text"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          placeholder="e.g. Death Claim Settlement : With Nomination"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          CATEGORY
                        </label>
                        <input
                          type="text"
                          list="homepage-doc-categories"
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value)}
                          placeholder="e.g. POSB / Aadhaar / Service Matters / Manuals / General"
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                        />
                        <datalist id="homepage-doc-categories">
                          <option value="POSB" />
                          <option value="Aadhaar" />
                          <option value="Service Matters" />
                          <option value="Manuals & Guides" />
                          <option value="Welfare" />
                          <option value="General" />
                        </datalist>
                      </div>

                      {/* File Source Selector: Upload File vs Enter URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            DOCUMENT FILE / ATTACHMENT *
                          </label>
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setDocFileMode('upload')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                docFileMode === 'upload'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📁 Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocFileMode('url')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                docFileMode === 'url'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              🔗 Web Link
                            </button>
                          </div>
                        </div>

                        {docFileMode === 'upload' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={docFileInputRef}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                              onChange={handleDocFileUpload}
                              className="hidden"
                            />
                            {docUrl && (docUrl.startsWith('data:') || docFileName) ? (
                              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {docFileName || 'Attached File'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                                      {docFileSize && <span>{docFileSize}</span>}
                                      <span className="text-emerald-600 font-bold">Ready to Save</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: docTitle || 'Attached Document',
                                        category: docCategory,
                                        url: docUrl,
                                        published: docPublished,
                                        type: 'Homepage Document',
                                      })
                                    }
                                    className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                                    title="Preview file"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => docFileInputRef.current?.click()}
                                    className="px-2 py-1 rounded-lg bg-white text-slate-700 hover:text-red-600 border border-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => docFileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                              >
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-red-600 mx-auto mb-1 transition-colors" />
                                <div className="text-xs font-bold text-slate-700 group-hover:text-red-700">
                                  Click to Select Document / PDF
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Supports PDF, DOCX, Images, Scanned documents
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="url"
                              value={docUrl}
                              onChange={(e) => setDocUrl(e.target.value)}
                              placeholder="https://drive.google.com/... or https://..."
                              required
                              className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Paste direct PDF URL, Google Drive share link, or departmental portal link.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          PUBLISHED DATE (OPTIONAL)
                        </label>
                        <input
                          type="date"
                          value={docPublished}
                          onChange={(e) => setDocPublished(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer transition-all active:scale-[0.99]"
                        >
                          {editingDoc ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          <span>{editingDoc ? 'Update & Save Document' : '+ Add Document'}</span>
                        </button>
                        {editingDoc && (
                          <button
                            type="button"
                            onClick={handleCancelEditImportantDoc}
                            className="px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Cards Grid */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {/* Header + Search & Filter */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <span>HOMEPAGE DOCUMENTS ({importantDocs.length})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Public Home Area
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Shown under Important Documents on the Public Homepage
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={docSearchQuery}
                            onChange={(e) => setDocSearchQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                          />
                        </div>

                        {docCategories.length > 2 && (
                          <select
                            value={docCategoryFilter}
                            onChange={(e) => setDocCategoryFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                          >
                            {docCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat === 'All' ? 'All Categories' : cat}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredImportantDocs.map((docItem) => {
                        const isUploaded = docItem.url?.startsWith('data:');
                        return (
                          <div
                            key={docItem.id}
                            className={`p-5 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                              editingDoc?.id === docItem.id
                                ? 'border-blue-500 ring-2 ring-blue-100'
                                : 'border-slate-200/80 hover:border-red-400'
                            }`}
                          >
                            <div className="space-y-2.5">
                              {/* Badges */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                  {docItem.category || 'General'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {isUploaded ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Attached File
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                      Web Link
                                    </span>
                                  )}
                                  {docItem.published && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                      <Calendar className="w-3 h-3" />
                                      <span>{docItem.published}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Document Title */}
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                                {docItem.title}
                              </h4>

                              {/* Link Preview */}
                              <div className="pt-0.5">
                                <span className="text-[11px] font-mono text-slate-500 truncate block">
                                  {isUploaded ? '📎 Stored document file ready for view/download' : docItem.url}
                                </span>
                              </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              {/* View / Preview Modal Trigger */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingDoc({
                                      title: docItem.title,
                                      category: docItem.category,
                                      url: docItem.url,
                                      published: docItem.published,
                                      type: 'Homepage Document',
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 transition-colors px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                                  title="View / Preview File in Portal"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View File</span>
                                </button>
                                <a
                                  href={docItem.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                  title="Open in New Tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              {/* Edit & Delete Controls */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditImportantDocClick(docItem)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer border border-blue-200/60"
                                  title="Edit / Modify Document"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImportantDoc(docItem.id)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer border border-red-200/60"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredImportantDocs.length === 0 && (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm space-y-2">
                        <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">No homepage documents found</p>
                        <p className="text-xs text-slate-400">
                          {docSearchQuery || docCategoryFilter !== 'All'
                            ? 'No documents match your search criteria.'
                            : 'Upload your first homepage document using the form on the left.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: NOTICES & CIRCULARS */}
            {activeTab === 'notices' && (() => {
              const noticeCategories = ['All', 'NOTICE', 'CIRCULAR', 'ACCOMMODATION', 'CGHS', 'PENSION', 'ORDERS', 'MISC'];
              const filteredNotices = noticeCirculars.filter((nc) => {
                const q = noticeSearchQuery.trim().toLowerCase();
                const matchesSearch =
                  !q ||
                  (nc.title && nc.title.toLowerCase().includes(q)) ||
                  (nc.category && nc.category.toLowerCase().includes(q)) ||
                  (nc.url && nc.url.toLowerCase().includes(q));
                const matchesCat =
                  noticeCategoryFilter === 'All' ||
                  (nc.category && nc.category.toLowerCase() === noticeCategoryFilter.toLowerCase());
                return matchesSearch && matchesCat;
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Add / Edit Form */}
                  <div
                    ref={noticeFormRef}
                    className={`lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border transition-all sticky top-16 ${
                      editingNotice ? 'border-amber-400 ring-2 ring-amber-200 shadow-md' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-red-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                          {editingNotice ? 'EDIT NOTICE / CIRCULAR' : 'ADD NOTICE / CIRCULAR'}
                        </h2>
                      </div>
                      {editingNotice && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Editing Mode
                        </span>
                      )}
                    </div>

                    {editingNotice && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase text-amber-700">Modifying Notice</div>
                          <div className="text-xs text-amber-950 font-bold truncate">
                            {editingNotice.title}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEditNotice}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-bold text-amber-800 hover:bg-amber-100 shrink-0 cursor-pointer shadow-2xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSaveNoticeCircular} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          NOTICE TITLE *
                        </label>
                        <input
                          type="text"
                          value={noticeTitle}
                          onChange={(e) => setNoticeTitle(e.target.value)}
                          placeholder="e.g. Schedule of Departmental Examinations 2026"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          CATEGORY
                        </label>
                        <select
                          value={noticeCategory}
                          onChange={(e) => setNoticeCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                        >
                          <option value="NOTICE">NOTICE</option>
                          <option value="CIRCULAR">CIRCULAR</option>
                          <option value="ACCOMMODATION">ACCOMMODATION</option>
                          <option value="CGHS">CGHS</option>
                          <option value="PENSION">PENSION</option>
                          <option value="ORDERS">ORDERS</option>
                          <option value="MISC">MISC</option>
                        </select>
                      </div>

                      {/* File Source Selector: Upload File vs Enter URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            NOTICE FILE / DOCUMENT *
                          </label>
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setNoticeFileMode('upload')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                noticeFileMode === 'upload'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📁 Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoticeFileMode('url')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                noticeFileMode === 'url'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              🔗 Web Link
                            </button>
                          </div>
                        </div>

                        {noticeFileMode === 'upload' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={noticeFileInputRef}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                              onChange={handleNoticeFileUpload}
                              className="hidden"
                            />
                            {noticeUrl && (noticeUrl.startsWith('data:') || noticeFileName) ? (
                              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {noticeFileName || 'Attached Notice File'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                                      {noticeFileSize && <span>{noticeFileSize}</span>}
                                      <span className="text-emerald-600 font-bold">Ready to Save</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: noticeTitle || 'Attached Notice',
                                        category: noticeCategory,
                                        url: noticeUrl,
                                        published: noticePublished,
                                        type: 'Notice / Circular',
                                      })
                                    }
                                    className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-amber-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                                    title="Preview file"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => noticeFileInputRef.current?.click()}
                                    className="px-2 py-1 rounded-lg bg-white text-slate-700 hover:text-red-600 border border-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => noticeFileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                              >
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-600 mx-auto mb-1 transition-colors" />
                                <div className="text-xs font-bold text-slate-700 group-hover:text-amber-800">
                                  Click to Select Notice File / PDF
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Supports PDF, DOCX, Official Circular Images
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="url"
                              value={noticeUrl}
                              onChange={(e) => setNoticeUrl(e.target.value)}
                              placeholder="https://drive.google.com/... or https://..."
                              required
                              className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Paste direct notice PDF URL, Google Drive share link, or circular link.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          PUBLISHED DATE (OPTIONAL)
                        </label>
                        <input
                          type="date"
                          value={noticePublished}
                          onChange={(e) => setNoticePublished(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer transition-all active:scale-[0.99]"
                        >
                          {editingNotice ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          <span>{editingNotice ? 'Update & Save Notice' : '+ Add Notice'}</span>
                        </button>
                        {editingNotice && (
                          <button
                            type="button"
                            onClick={handleCancelEditNotice}
                            className="px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Cards Grid */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {/* Header + Search & Filter */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <span>NOTICES & CIRCULARS ({noticeCirculars.length})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Public Home Area
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Shown under Notices & Circulars on the Public Homepage
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={noticeSearchQuery}
                            onChange={(e) => setNoticeSearchQuery(e.target.value)}
                            placeholder="Search notices..."
                            className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                          />
                        </div>

                        <select
                          value={noticeCategoryFilter}
                          onChange={(e) => setNoticeCategoryFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                        >
                          {noticeCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat === 'All' ? 'All Categories' : cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredNotices.map((nc) => {
                        const isUploaded = nc.url?.startsWith('data:');
                        return (
                          <div
                            key={nc.id}
                            className={`p-5 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                              editingNotice?.id === nc.id
                                ? 'border-amber-500 ring-2 ring-amber-100'
                                : 'border-slate-200/80 hover:border-amber-400'
                            }`}
                          >
                            <div className="space-y-2.5">
                              {/* Badges */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                  {nc.category || 'NOTICE'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {isUploaded ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      Attached File
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                      Web Link
                                    </span>
                                  )}
                                  {nc.published && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                      <Calendar className="w-3 h-3" />
                                      <span>{nc.published}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Notice Title */}
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                                {nc.title}
                              </h4>

                              {/* Link Preview */}
                              <div className="pt-0.5">
                                <span className="text-[11px] font-mono text-slate-500 truncate block">
                                  {isUploaded ? '📎 Stored circular file ready for view/download' : nc.url}
                                </span>
                              </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              {/* View / Preview */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingDoc({
                                      title: nc.title,
                                      category: nc.category,
                                      url: nc.url || '',
                                      published: nc.published,
                                      type: 'Notice / Circular',
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-amber-50 transition-colors px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                                  title="View / Preview File in Portal"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View File</span>
                                </button>
                                <a
                                  href={nc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                  title="Open in New Tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              {/* Edit & Delete Controls */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditNoticeClick(nc)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer border border-blue-200/60"
                                  title="Edit / Modify Notice"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNoticeCircular(nc.id)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer border border-red-200/60"
                                  title="Delete Notice"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredNotices.length === 0 && (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm space-y-2">
                        <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">No notices or circulars found</p>
                        <p className="text-xs text-slate-400">
                          {noticeSearchQuery || noticeCategoryFilter !== 'All'
                            ? 'No notices match your search criteria.'
                            : 'Upload your first notice or circular using the form on the left.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (() => {
              const filteredAnnouncements = announcements.filter((ann) => {
                const q = annSearchQuery.trim().toLowerCase();
                return (
                  !q ||
                  (ann.title && ann.title.toLowerCase().includes(q)) ||
                  (ann.link && ann.link.toLowerCase().includes(q))
                );
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Add / Edit Form */}
                  <div
                    ref={annFormRef}
                    className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-16"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-red-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                          {editingAnn ? 'EDIT ANNOUNCEMENT' : 'ADD ANNOUNCEMENT'}
                        </h2>
                      </div>
                      {editingAnn && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          Editing Mode
                        </span>
                      )}
                    </div>

                    {editingAnn && (
                      <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-center justify-between gap-2">
                        <div className="text-xs text-blue-900 font-medium truncate">
                          Editing: <span className="font-bold">{editingAnn.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEditAnnouncement}
                          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline shrink-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          ANNOUNCEMENT TEXT / HEADLINE *
                        </label>
                        <textarea
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="e.g. Submission of Agenda Items for Coming Monthly Meeting on 03.11.2026"
                          rows={3}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all font-medium text-slate-900"
                        />
                      </div>

                      {/* File Upload vs URL Toggle */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            ATTACHED FILE OR WEB LINK (OPTIONAL)
                          </label>
                          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setAnnFileMode('upload')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                annFileMode === 'upload'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📁 Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnnFileMode('url')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                annFileMode === 'url'
                                  ? 'bg-white text-red-600 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              🔗 Web Link
                            </button>
                          </div>
                        </div>

                        {annFileMode === 'upload' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={annFileInputRef}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                              onChange={handleAnnFileUpload}
                              className="hidden"
                            />
                            {annLink && (annLink.startsWith('data:') || annFileName) ? (
                              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {annFileName || 'Attached Announcement File'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                                      {annFileSize && <span>{annFileSize}</span>}
                                      <span className="text-emerald-600 font-bold">Ready to Save</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        title: annTitle || annFileName || 'Announcement Attachment',
                                        category: 'Announcement',
                                        url: annLink,
                                        published: annPublished,
                                        type: 'Announcement',
                                      })
                                    }
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                    title="Preview Uploaded File"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAnnLink('');
                                      setAnnFileName('');
                                      setAnnFileSize('');
                                      if (annFileInputRef.current) annFileInputRef.current.value = '';
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Attached File"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => annFileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-300 hover:border-red-400 bg-slate-50/70 hover:bg-red-50/30 text-slate-600 rounded-xl p-4 text-center transition-all cursor-pointer group"
                              >
                                <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400 group-hover:text-red-600 transition-colors" />
                                <span className="text-xs font-bold text-slate-700 block">
                                  Choose PDF, Notice Scan, or Image
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5 block">
                                  Supports PDF, Word, JPEG, PNG (stores directly for instant preview)
                                </span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="url"
                              value={annLink}
                              onChange={(e) => setAnnLink(e.target.value)}
                              placeholder="https://drive.google.com/... or circular link"
                              className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-slate-900 transition-all font-mono text-xs"
                            />
                            <p className="text-[10px] text-slate-400">
                              Paste an external link or Google Drive URL
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          PUBLISHED DATE (OPTIONAL)
                        </label>
                        <input
                          type="date"
                          value={annPublished}
                          onChange={(e) => setAnnPublished(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-slate-800"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                        >
                          {editingAnn ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          <span>{editingAnn ? 'Update Announcement' : '+ Add Announcement'}</span>
                        </button>
                        {editingAnn && (
                          <button
                            type="button"
                            onClick={handleCancelEditAnnouncement}
                            className="px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Cards Grid */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    {/* Header + Search */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          ANNOUNCEMENTS ({announcements.length})
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Displayed on the Homepage Announcements section
                        </p>
                      </div>

                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={annSearchQuery}
                          onChange={(e) => setAnnSearchQuery(e.target.value)}
                          placeholder="Search announcements..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:bg-white focus:ring-1 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAnnouncements.map((ann) => (
                        <div
                          key={ann.id}
                          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-red-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-2.5">
                            {/* Badges */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>ANNOUNCEMENT</span>
                              </span>
                              {ann.published && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                  <Calendar className="w-3 h-3" />
                                  <span>{ann.published}</span>
                                </span>
                              )}
                            </div>

                            {/* Headline */}
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-3">
                              {ann.title}
                            </h4>

                            {/* Link / File Preview Badge */}
                            {ann.link && (
                              <div className="pt-1">
                                {ann.link.startsWith('data:') ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Uploaded Document Attached</span>
                                  </span>
                                ) : (
                                  <a
                                    href={ann.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-mono text-blue-600 hover:underline truncate block"
                                  >
                                    {ann.link}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions Bar */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                            {/* View / Open Document */}
                            {ann.link ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingDoc({
                                      title: ann.title,
                                      category: 'Announcement',
                                      url: ann.link || '',
                                      published: ann.published,
                                      type: 'Announcement',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                  title="View / Preview File in Portal"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View File</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadDoc(ann.link || '', ann.title)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Download File"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                {!ann.link.startsWith('data:') && (
                                  <a
                                    href={ann.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Open Link in New Tab"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No document</span>
                            )}

                            {/* Edit & Delete */}
                            <div className="flex items-center gap-1.5 ml-auto">
                              <button
                                type="button"
                                onClick={() => handleEditAnnouncementClick(ann)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit / Modify Announcement"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete Announcement"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredAnnouncements.length === 0 && (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm space-y-2">
                        <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">No announcements found</p>
                        <p className="text-xs text-slate-400">
                          {annSearchQuery
                            ? 'No announcements match your search.'
                            : 'Post your first announcement using the form on the left.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: PHOTO GALLERY */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    ADD GALLERY PHOTO
                  </h2>
                  <form onSubmit={handleSavePhoto} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        PHOTO URL *
                      </label>
                      <input
                        type="url"
                        value={galUrl}
                        onChange={(e) => setGalUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        TITLE / EVENT CAPTION *
                      </label>
                      <input
                        type="text"
                        value={galTitle}
                        onChange={(e) => setGalTitle(e.target.value)}
                        placeholder="e.g. Divisional Conference 2026"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        CATEGORY
                      </label>
                      <input
                        type="text"
                        value={galCategory}
                        onChange={(e) => setGalCategory(e.target.value)}
                        placeholder="e.g. Union Conference / Philately"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Photo</span>
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT PHOTOS ({galleryPhotos.length})
                  </div>
                  <div className="space-y-4">
                    {galleryPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                              {photo.category}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                              {photo.title}
                            </h3>
                            <a
                              href={photo.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                            >
                              <span>🔗 View Image</span>
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MY APPS */}
            {activeTab === 'myApps' && (
              <div className="space-y-6">
                {/* 1. Header matching user screenshot */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Apps</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage custom HTML applications</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showAddAppModal) {
                        handleCancelApp();
                      } else {
                        setShowAddAppModal(true);
                      }
                    }}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-xs text-sm transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add App</span>
                  </button>
                </div>

                {/* 2. Add New App Card / Form matching the screenshot exactly */}
                {showAddAppModal && (
                  <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/90 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-5">
                      <h2 className="text-base font-bold text-slate-900">
                        {editingApp ? 'Edit App' : 'Add New App'}
                      </h2>
                      <button
                        type="button"
                        onClick={handleCancelApp}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveApp} className="space-y-5">
                      {/* App Title */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          App Title
                        </label>
                        <input
                          type="text"
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          placeholder="e.g., Target Calculator"
                          required
                          className="w-full bg-slate-50/70 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Category
                        </label>
                        <select
                          value={appCategory}
                          onChange={(e) => setAppCategory(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-sm px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-800"
                        >
                          <option value="Others">Others</option>
                          <option value="Calculators">Calculators</option>
                          <option value="Departmental Tools">Departmental Tools</option>
                          <option value="Leave & Pension">Leave & Pension</option>
                          <option value="Operations">Operations</option>
                          <option value="Banking & CBS">Banking & CBS</option>
                          <option value="PLI / RPLI">PLI / RPLI</option>
                          <option value="Official Portal">Official Portal</option>
                        </select>
                      </div>

                      {/* App Source Radio Buttons */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          App Source
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input
                              type="radio"
                              name="appSource"
                              checked={appSourceType === 'code'}
                              onChange={() => setAppSourceType('code')}
                              className="w-4 h-4 text-red-600 focus:ring-red-500 accent-red-600"
                            />
                            <span className="flex items-center gap-1.5">
                              📄 Code/File
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                            <input
                              type="radio"
                              name="appSource"
                              checked={appSourceType === 'url'}
                              onChange={() => setAppSourceType('url')}
                              className="w-4 h-4 text-red-600 focus:ring-red-500 accent-red-600"
                            />
                            <span className="flex items-center gap-1.5">
                              🔗 Website Link
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Code Snippet (if Code/File) */}
                      {appSourceType === 'code' ? (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              Code Snippet
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                ref={appFileInputRef}
                                accept=".html,.htm,.txt,.js,.svg"
                                onChange={handleAppFileUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => appFileInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                              </button>
                            </div>
                          </div>

                          <textarea
                            value={appCodeSnippet}
                            onChange={(e) => setAppCodeSnippet(e.target.value)}
                            placeholder="Paste your code here or upload a file..."
                            rows={12}
                            className="w-full font-mono text-xs bg-white border border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500 rounded-xl p-4 outline-none resize-y placeholder:text-slate-400"
                          />
                          {appCodeSnippet && (
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Ready to save ({(new Blob([appCodeSnippet]).size / 1024).toFixed(1)} KB)
                              </span>
                              <button
                                type="button"
                                onClick={() => setAppCodeSnippet('')}
                                className="text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                Clear code
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Website / Portal URL *
                          </label>
                          <input
                            type="url"
                            value={appUrl}
                            onChange={(e) => setAppUrl(e.target.value)}
                            placeholder="https://example.com/app"
                            required={appSourceType === 'url'}
                            className="w-full bg-slate-50/70 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleCancelApp}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-xs text-sm transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save App</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 3. Cards Section ("The files will show card type. Previous cards may be removed.") */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        APP CARDS ({filteredMyApps.length})
                      </div>
                      {myApps.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                          {myApps.filter((a) => a.sourceType === 'code' || a.codeSnippet).length} HTML Tools
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                        {['all', 'Calculators', 'Operations', 'Others'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setAppsCategoryFilter(cat)}
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                              appsCategoryFilter === cat
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat === 'all' ? 'All' : cat}
                          </button>
                        ))}
                      </div>

                      {/* Previous cards removal options */}
                      {myApps.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRemoveAllPreviousCards}
                          className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors ml-auto flex items-center gap-1 cursor-pointer"
                          title="Remove all previous cards"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove All Previous Cards</span>
                        </button>
                      )}

                      {myApps.length === 0 && (
                        <button
                          type="button"
                          onClick={handleResetDefaultApps}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Reset Default Cards
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid of Cards */}
                  {filteredMyApps.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                      <FileCode className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-base font-bold text-slate-700 mb-1">No app cards found</p>
                      <p className="text-xs text-slate-500 mb-4">Click "+ Add App" above to upload HTML files or add custom tool cards.</p>
                      <button
                        type="button"
                        onClick={() => setShowAddAppModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add HTML Application</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredMyApps.map((app, idx) => {
                        const isCodeApp = app.sourceType === 'code' || !!app.codeSnippet;
                        const stableIndex = myApps.findIndex((item) => item.id === app.id);
                        const colorTheme = getMyAppCardTheme(stableIndex >= 0 ? stableIndex : idx);
                        const AppIcon = getMyAppIcon(app);

                        return (
                          <div
                            key={app.id}
                            className={`relative overflow-hidden rounded-2xl border-2 ${colorTheme.cardBg} ${colorTheme.cardBorder} ${colorTheme.cardHoverBorder} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
                          >
                            {/* Top Gradient Accent Bar */}
                            <div className={`h-2 w-full ${colorTheme.accentBar}`} />

                            {/* Subtle Decorative Glow */}
                            <div
                              className={`pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full ${colorTheme.glowBg} blur-xl transition-transform duration-500 group-hover:scale-125`}
                            />

                            <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
                              <div>
                                {/* Header Row: 3D Icon + Badges & Edit/Delete */}
                                <div className="flex items-start justify-between gap-2 mb-3.5">
                                  <div
                                    className={`w-12 h-12 rounded-2xl ${colorTheme.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3`}
                                  >
                                    <AppIcon className="w-6 h-6" />
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5">
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleEditAppClick(app)}
                                        className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-blue-600 border border-white/90 shadow-2xs transition-colors cursor-pointer"
                                        title="Edit App"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteApp(app.id)}
                                        className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-red-600 border border-white/90 shadow-2xs transition-colors cursor-pointer"
                                        title="Remove this card"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap justify-end">
                                      <span
                                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${colorTheme.categoryBadge} uppercase tracking-wider`}
                                      >
                                        {app.category || 'Utility'}
                                      </span>
                                      {isCodeApp ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                          <FileCode className="w-3 h-3 text-amber-600" /> HTML App
                                        </span>
                                      ) : (
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorTheme.typeBadge} flex items-center gap-1 shadow-2xs`}
                                        >
                                          <Globe className="w-3 h-3" /> Web Link
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* App Title */}
                                <h3
                                  className={`font-extrabold text-slate-900 ${colorTheme.titleHover} text-base sm:text-lg leading-snug transition-colors line-clamp-1`}
                                >
                                  {app.name}
                                </h3>

                                {/* Meta / Description */}
                                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                                  {app.description || (isCodeApp ? 'Interactive custom HTML tool' : app.url)}
                                </p>

                                {/* Snippet / Size badge */}
                                {isCodeApp ? (
                                  <div
                                    className={`mt-3.5 flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-xl border ${colorTheme.metaBg}`}
                                  >
                                    <Code className="w-3.5 h-3.5 shrink-0" />
                                    <span className="font-semibold">{app.fileSize || 'HTML/JS App'}</span>
                                    {app.createdAt && (
                                      <span className="ml-auto text-[10px] opacity-75">{app.createdAt}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    className={`mt-3.5 flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl border truncate ${colorTheme.metaBg}`}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate font-medium">{app.url}</span>
                                  </div>
                                )}
                              </div>

                              {/* Card Action Button & Remove Card option */}
                              <div className="mt-4 pt-3.5 border-t border-slate-200/60 flex items-center gap-2">
                                {isCodeApp ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRunningApp(app);
                                      setIframeKey((k) => k + 1);
                                    }}
                                    className={`flex-1 ${colorTheme.buttonBg} font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer active:scale-[0.99]`}
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Launch / Run App</span>
                                  </button>
                                ) : (
                                  <a
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 ${colorTheme.buttonBg} font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.99]`}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open Website</span>
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteApp(app.id)}
                                  className="px-3 py-2.5 rounded-xl bg-white/85 hover:bg-red-50 border border-white/90 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                  title="Remove this card"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FORMS */}
            {activeTab === 'forms' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      {editingForm ? 'EDIT DOWNLOADABLE FORM' : 'ADD DOWNLOADABLE FORM'}
                    </h2>
                    {editingForm && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Editing Mode
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSaveForm} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        FORM TITLE *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. GDS Gratuity & Severance Settlement"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        FORM CODE / NUMBER
                      </label>
                      <input
                        type="text"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                        placeholder="e.g. Form-1 / Annexure-A"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        DOWNLOAD URL / PDF LINK *
                      </label>
                      <input
                        type="url"
                        value={formDownloadUrl}
                        onChange={(e) => setFormDownloadUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingForm ? 'Update Form' : '+ Add Form'}</span>
                      </button>
                      {editingForm && (
                        <button
                          type="button"
                          onClick={handleCancelEditForm}
                          className="px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT FORMS ({formsList.length})
                  </div>
                  <div className="space-y-4">
                    {formsList.map((f) => (
                      <div
                        key={f.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 uppercase">
                            {f.formCode}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                            {f.title}
                          </h3>
                          <a
                            href={f.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                          >
                            <span>🔗 Download Form</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditFormClick(f)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Form"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteForm(f.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EMPLOYEE SITE */}
            {activeTab === 'employeeSite' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    ADD EMPLOYEE RESOURCE
                  </h2>
                  <form onSubmit={handleSaveResource} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        RESOURCE TITLE *
                      </label>
                      <input
                        type="text"
                        value={resTitle}
                        onChange={(e) => setResTitle(e.target.value)}
                        placeholder="e.g. Postal Manual Volume IV"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        CATEGORY
                      </label>
                      <input
                        type="text"
                        value={resCategory}
                        onChange={(e) => setResCategory(e.target.value)}
                        placeholder="e.g. Postal Manuals / Conduct Rules"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        DOCUMENT URL *
                      </label>
                      <input
                        type="url"
                        value={resUrl}
                        onChange={(e) => setResUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Resource</span>
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT RESOURCES ({employeeResources.length})
                  </div>
                  <div className="space-y-4">
                    {employeeResources.map((res) => (
                      <div
                        key={res.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {res.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                            {res.title}
                          </h3>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                          >
                            <span>🔗 View Resource</span>
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NEWS TICKER */}
            {activeTab === 'news' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div
                  ref={newsFormRef}
                  className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-24"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                      {editingNews ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{editingNews ? 'EDIT HEADLINE' : 'ADD NEWS TICKER ITEM'}</span>
                    </h2>
                    {editingNews && (
                      <button
                        type="button"
                        onClick={handleCancelEditNews}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase"
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSaveNews} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                        HEADLINE TITLE *
                      </label>
                      <textarea
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        placeholder="Enter breaking news item..."
                        rows={3}
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                        CATEGORY
                      </label>
                      <input
                        type="text"
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        placeholder="e.g. EXAM NOTIFICATION, NOTICE, BREAKING"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    {/* Attachment / Link Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          ATTACHED DOCUMENT / LINK (OPTIONAL)
                        </label>
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setNewsFileMode('upload')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                              newsFileMode === 'upload' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-500'
                            }`}
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewsFileMode('url')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                              newsFileMode === 'url' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                            }`}
                          >
                            Web Link
                          </button>
                        </div>
                      </div>

                      {newsFileMode === 'upload' ? (
                        <div className="space-y-2">
                          <label className="flex items-center justify-center gap-2 border border-dashed border-red-300 hover:border-red-500 bg-red-50/40 hover:bg-red-50/70 p-3 rounded-xl cursor-pointer transition-all">
                            <Upload className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-bold text-slate-800">Attach Document / Notice</span>
                            <input
                              ref={newsFileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleNewsFileUpload}
                              className="hidden"
                            />
                          </label>

                          {newsFileName && (
                            <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                              <span className="font-bold text-emerald-900 truncate">{newsFileName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewsFileName('');
                                  setNewsFileSize('');
                                  setNewsLink('');
                                  if (newsFileInputRef.current) newsFileInputRef.current.value = '';
                                }}
                                className="text-slate-400 hover:text-red-600 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={newsLink}
                          onChange={(e) => setNewsLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="newsUrgent"
                        checked={newsIsUrgent}
                        onChange={(e) => setNewsIsUrgent(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="newsUrgent" className="text-xs font-medium text-slate-700">
                        Mark as Urgent / Red Flash
                      </label>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingNews ? 'Update Headline' : '+ Add Headline'}</span>
                      </button>
                      {editingNews && (
                        <button
                          type="button"
                          onClick={handleCancelEditNews}
                          className="px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  {/* News Search bar */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={newsSearchQuery}
                        onChange={(e) => setNewsSearchQuery(e.target.value)}
                        placeholder="Search news ticker items..."
                        className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-red-500"
                      />
                      {newsSearchQuery && (
                        <button
                          onClick={() => setNewsSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      Total: {newsItems.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {newsItems
                      .filter((n) => {
                        const q = newsSearchQuery.trim().toLowerCase();
                        return !q || n.title.toLowerCase().includes(q) || (n.category && n.category.toLowerCase().includes(q));
                      })
                      .map((n) => (
                        <div
                          key={n.id}
                          className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                            editingNews?.id === n.id ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  n.isUrgent ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {n.category}
                              </span>
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 line-clamp-2">
                                {n.title}
                              </h3>
                              {n.link && (
                                <p className="text-[11px] font-mono text-blue-600 truncate mt-1">
                                  {n.link.startsWith('data:') ? '📁 Attached Document File' : n.link}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                              {n.link && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setViewingDoc({
                                      title: n.title,
                                      category: n.category || 'NEWS TICKER',
                                      url: n.link || '',
                                      type: 'Notice / Circular'
                                    })}
                                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="View Attached File"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadDoc(n.link || '', n.title)}
                                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Download</span>
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleEditNewsClick(n)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit Headline"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNews(n.id)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete Headline"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXECUTIVE BEARER & DOCUMENTS/RULINGS PAGE */}
            {activeTab === 'executives' && (
              <div className="space-y-6">
                {/* Dual Sub-tab Switcher Bar */}
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExecutiveSubSection('bearers')}
                      className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        executiveSubSection === 'bearers'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>1. Office Bearers ({executives.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExecutiveSubSection('rulings')}
                      className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        executiveSubSection === 'rulings'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-blue-700 bg-blue-50/80 hover:bg-blue-100'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>2. Documents &amp; Rulings ({unionRulings.length})</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 text-center sm:text-right">
                    {executiveSubSection === 'bearers'
                      ? '👥 Group C, Postman/MTS & GDS Leadership Team'
                      : '📜 Constitution, Form B, Grievances, Demands & Resolutions'}
                  </span>
                </div>

                {/* Sub-Section 1: Office Bearers */}
                {executiveSubSection === 'bearers' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div
                      ref={execFormRef}
                      className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-24"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                          {editingMember ? 'EDIT OFFICE BEARER & PHOTO' : 'ADD OFFICE BEARER & PHOTO'}
                        </h2>
                        {editingMember && (
                          <button
                            type="button"
                            onClick={handleCancelEditExecutive}
                            className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSaveExecutive} className="space-y-4">
                        {/* Photo Upload & Preview Section */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>OFFICE BEARER PHOTO</span>
                            <span className="text-[10px] text-blue-600 font-semibold">URL or Device Upload</span>
                          </label>

                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              {execPhotoUrl ? (
                                <img
                                  src={execPhotoUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                type="url"
                                value={execPhotoUrl}
                                onChange={(e) => setExecPhotoUrl(e.target.value)}
                                placeholder="Paste photo URL here..."
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                              />
                              <div className="mt-1.5 flex items-center gap-3">
                                <label className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer underline flex items-center gap-1">
                                  <span>📁 Choose Image File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                          if (ev.target?.result) {
                                            setExecPhotoUrl(ev.target.result as string);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                {execPhotoUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setExecPhotoUrl('')}
                                    className="text-[10px] text-slate-400 hover:text-red-600"
                                  >
                                    Clear Photo
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick preset avatar selection */}
                          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Quick Presets:
                            </span>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {[
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
                                'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
                              ].map((url, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setExecPhotoUrl(url)}
                                  className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border-2 border-slate-200 hover:border-red-500 active:scale-95 transition-all shadow-xs"
                                  title="Click to apply photo"
                                >
                                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            COMRADE NAME *
                          </label>
                          <input
                            type="text"
                            value={execName}
                            onChange={(e) => setExecName(e.target.value)}
                            placeholder="e.g. Com. Ramesh Chandra Sahoo"
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            DESIGNATION / POST *
                          </label>
                          <input
                            type="text"
                            value={execDesignation}
                            onChange={(e) => setExecDesignation(e.target.value)}
                            placeholder="e.g. Divisional President / Divisional Secretary"
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                              ROLE TYPE
                            </label>
                            <select
                              value={execRoleType}
                              onChange={(e) => setExecRoleType(e.target.value as any)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold text-slate-800"
                            >
                              <option value="secretary">1. Divisional Secretary (Royal Blue)</option>
                              <option value="president">2. Divisional President (Gold / Amber)</option>
                              <option value="treasurer">3. Financial Secretary (Emerald)</option>
                              <option value="executive">4. Assistant / Executive Member</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                              POSTING LOCATION
                            </label>
                            <input
                              type="text"
                              value={execLocation}
                              onChange={(e) => setExecLocation(e.target.value)}
                              placeholder="e.g. Dhenkanal Division"
                              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            BRANCH / CADRE WING
                          </label>
                          <input
                            type="text"
                            value={execBranch}
                            onChange={(e) => setExecBranch(e.target.value)}
                            placeholder="e.g. AIPEU Group 'C', Dhenkanal Division"
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {[
                              "AIPEU Group 'C', Dhenkanal Division",
                              "AIPEU Postmen, MTS & Group 'D'",
                              'AIGDSU Dhenkanal Division',
                              'Divisional Women Sub-Committee',
                            ].map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setExecBranch(b)}
                                className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all truncate max-w-[200px]"
                              >
                                {b.split(',')[0]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            PHONE / CONTACT NUMBER
                          </label>
                          <input
                            type="tel"
                            value={execPhone}
                            onChange={(e) => setExecPhone(e.target.value)}
                            placeholder="+91 94371 XXXXX"
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{editingMember ? 'Save & Update Bearer' : '+ Add Office Bearer'}</span>
                        </button>
                      </form>
                    </div>

                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                      {/* Search & Header */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={execSearchQuery}
                            onChange={(e) => setExecSearchQuery(e.target.value)}
                            placeholder="Search office bearers by name, post, or branch..."
                            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-red-500"
                          />
                          {execSearchQuery && (
                            <button
                              onClick={() => setExecSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-center sm:text-left">
                            Total: {executives.length} Bearers
                          </span>
                          {executives.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearAllExecutives}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Clear all cards from Directory page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Clear All</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sortOfficeBearers(
                          executives.filter((ex) => {
                            const q = execSearchQuery.trim().toLowerCase();
                            return (
                              !q ||
                              ex.name.toLowerCase().includes(q) ||
                              ex.designation.toLowerCase().includes(q) ||
                              (ex.branch && ex.branch.toLowerCase().includes(q)) ||
                              (ex.location && ex.location.toLowerCase().includes(q))
                            );
                          })
                        ).map((ex) => (
                          <div
                            key={ex.id || ex.name}
                            className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex flex-col justify-between ${
                              editingMember?.id === ex.id
                                ? 'border-red-500 ring-2 ring-red-500/20'
                                : 'border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Photo Avatar Thumbnail */}
                              <div
                                onClick={() => {
                                  if (ex.photoUrl) {
                                    setViewingDoc({
                                      title: `${ex.name} (${ex.designation})`,
                                      category: ex.branch || "AIPEU Dhenkanal Division",
                                      url: ex.photoUrl,
                                      published: `Location: ${ex.location} • Tel: ${ex.phone || 'N/A'}`,
                                      type: 'Homepage Document'
                                    });
                                  }
                                }}
                                className={`relative shrink-0 ${ex.photoUrl ? 'cursor-pointer hover:opacity-90' : ''}`}
                                title={ex.photoUrl ? 'Click to view photo' : ''}
                              >
                                {ex.photoUrl ? (
                                  <img
                                    src={ex.photoUrl}
                                    alt={ex.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                <div
                                  style={{ display: ex.photoUrl ? 'none' : 'flex' }}
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white items-center justify-center font-bold text-xs shadow-sm"
                                >
                                  {ex.name.replace(/^(Com\.|Shri|Sri|Smt\.)\s*/i, '').slice(0, 2).toUpperCase()}
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-red-600 uppercase block truncate">
                                  {ex.branch}
                                </span>
                                <h3 className="font-bold text-slate-900 text-sm truncate">
                                  {ex.name}
                                </h3>
                                <p className="text-xs text-slate-600 font-medium truncate">
                                  {ex.designation}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1 truncate">
                                  📍 {ex.location} {ex.phone && `· 📞 ${ex.phone}`}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons: View Photo, Edit and Delete */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              {ex.photoUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setViewingDoc({
                                    title: `${ex.name} (${ex.designation})`,
                                    category: ex.branch || "AIPEU Dhenkanal Division",
                                    url: ex.photoUrl!,
                                    published: `Location: ${ex.location} • Tel: ${ex.phone || 'N/A'}`,
                                    type: 'Homepage Document'
                                  })}
                                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Photo</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No Photo</span>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditExecutiveClick(ex)}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Edit Member & Photo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExecutive(ex.id)}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Delete Bearer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Section 2: Documents & Rulings (Add, Edit, Modify, Delete) */}
                {executiveSubSection === 'rulings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Add / Edit Document & Ruling Form */}
                    <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-24">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{editingRuling ? 'EDIT DOCUMENT & RULING' : 'ADD DOCUMENT & RULING'}</span>
                        </h2>
                        {editingRuling && (
                          <button
                            type="button"
                            onClick={handleCancelEditRuling}
                            className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSaveRuling} className="space-y-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            DOCUMENT / RULING TITLE *
                          </label>
                          <input
                            type="text"
                            value={rulingTitle}
                            onChange={(e) => setRulingTitle(e.target.value)}
                            placeholder="e.g. AIPEU Constitution & Trade Union Rulings"
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            DESCRIPTION / SUMMARY
                          </label>
                          <textarea
                            value={rulingDesc}
                            onChange={(e) => setRulingDesc(e.target.value)}
                            placeholder="Briefly describe what this ruling or statutory document covers..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            DOCUMENT / DRIVE LINK URL *
                          </label>
                          <input
                            type="url"
                            value={rulingLink}
                            onChange={(e) => setRulingLink(e.target.value)}
                            placeholder="https://drive.google.com/... or blog link"
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                              DOCUMENT TYPE
                            </label>
                            <input
                              type="text"
                              value={rulingType}
                              onChange={(e) => setRulingType(e.target.value)}
                              placeholder="e.g. Constitution"
                              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                            />
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['Constitution', 'Legal', 'Grievance', 'Resolution', 'Letter Pad'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setRulingType(t)}
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all ${
                                    rulingType === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                              PRIORITY ORDER
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={rulingOrder}
                              onChange={(e) => setRulingOrder(parseInt(e.target.value) || 1)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">1 = Top of list</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm active:scale-95 transition-all mt-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{editingRuling ? 'Update Document & Ruling' : '+ Add Document & Ruling'}</span>
                        </button>
                      </form>
                    </div>

                    {/* Right Column: Current Documents & Rulings List */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          CURRENT DOCUMENTS &amp; RULINGS ({unionRulings.length})
                        </div>
                        <span className="text-xs text-slate-400">
                          Appears on Union Directory page
                        </span>
                      </div>

                      <div className="space-y-3">
                        {unionRulings.map((ruling, idx) => (
                          <div
                            key={ruling.id || idx}
                            className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                              editingRuling?.id === ruling.id
                                ? 'border-blue-500 ring-2 ring-blue-500/20'
                                : 'border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                                      {ruling.type || 'Legal'}
                                    </span>
                                    {ruling.order && (
                                      <span className="text-[10px] font-bold text-slate-400">
                                        #{ruling.order}
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                    {ruling.title}
                                  </h3>
                                  {ruling.desc && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {ruling.desc}
                                    </p>
                                  )}

                                  <div className="mt-2.5 flex items-center gap-3">
                                    <a
                                      href={ruling.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 w-fit"
                                    >
                                      <span>🔗 Open Document / Form</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditRulingClick(ruling)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1"
                                  title="Edit Document"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRuling(ruling.id)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {unionRulings.length === 0 && (
                          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm">
                            No documents &amp; rulings added yet. Use the form on the left to add your first entry.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Floating Bottom Right Action Buttons matching reference screenshot */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            {/* Top button: White circular button with red back arrow */}
            <button
              onClick={() => {
                if (activeTab !== 'dashboard') {
                  setActiveTab('dashboard');
                } else {
                  onClose();
                }
              }}
              className="w-12 h-12 bg-white text-red-600 hover:bg-slate-50 rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Bottom button: Red circular button with white home icon */}
            <button
              onClick={onClose}
              className="w-12 h-12 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Return to Website Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
          {/* Full View HTML Application Runner matching reference screenshot */}
          {runningApp && (
            <div className="fixed inset-0 z-[120] bg-[#f1f3f6] flex flex-col overflow-hidden animate-fade-in">
              {/* Floating Top Left Back Button matching screenshot */}
              <div className="fixed top-3.5 left-4 z-50">
                <button
                  type="button"
                  onClick={() => setRunningApp(null)}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2 rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 text-sm"
                  title="Back to My Apps"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-700" />
                  <span>Back</span>
                </button>
              </div>

              {/* Floating Top Right Controls */}
              <div className="fixed top-3.5 right-4 z-50 flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate max-w-[200px]">{runningApp.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  title="Reload Tool"
                  className="bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {runningApp.codeSnippet && (
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([runningApp.codeSnippet || ''], { type: 'text/html' });
                      const blobUrl = URL.createObjectURL(blob);
                      window.open(blobUrl, '_blank');
                    }}
                    title="Open in Full Browser Tab"
                    className="bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRunningApp(null)}
                  title="Close Full View"
                  className="bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 p-2 rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sandboxed Full View iframe */}
              <div className="flex-1 w-full h-full bg-[#f1f3f6] overflow-auto">
                {runningApp.codeSnippet ? (
                  <iframe
                    key={iframeKey}
                    title={runningApp.name}
                    sandbox="allow-scripts allow-forms allow-modals"
                    srcDoc={runningApp.codeSnippet}
                    className="w-full h-full min-h-screen border-0 bg-[#f1f3f6]"
                  />
                ) : (
                  <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm font-semibold text-slate-700 mb-3">This card points to an external website URL.</p>
                    <a
                      href={runningApp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open External Website</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* In-Portal Document & File Preview Modal */}
          {viewingDoc && (
            <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {viewingDoc.type}
                        </span>
                        {viewingDoc.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {viewingDoc.category}
                          </span>
                        )}
                        {viewingDoc.published && (
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{viewingDoc.published}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {viewingDoc.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(viewingDoc.url, viewingDoc.title)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="Download Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    {!viewingDoc.url.startsWith('data:') && (
                      <a
                        href={viewingDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="Open in Browser Tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Open in Tab</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewingDoc(null)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Close Preview"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content Body */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/50 flex flex-col items-center justify-center min-h-[350px]">
                  {viewingDoc.url.startsWith('data:image/') || viewingDoc.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                    <div className="w-full flex items-center justify-center p-2">
                      <img
                        src={viewingDoc.url}
                        alt={viewingDoc.title}
                        className="max-h-[68vh] max-w-full rounded-2xl shadow-md object-contain border border-slate-200 bg-white"
                      />
                    </div>
                  ) : viewingDoc.url.startsWith('data:application/pdf') || viewingDoc.url.toLowerCase().includes('.pdf') ? (
                    <iframe
                      src={viewingDoc.url}
                      title={viewingDoc.title}
                      className="w-full h-[65vh] rounded-2xl border border-slate-200 bg-white shadow-sm"
                    />
                  ) : (
                    <div className="w-full max-w-lg bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-4 my-auto">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                        <FileText className="w-8 h-8 stroke-[1.8]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-base text-slate-900">{viewingDoc.title}</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto truncate font-mono">
                          {viewingDoc.url}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        This document is hosted on an external service or Google Drive. You can open it in a full tab or download directly.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(viewingDoc.url, viewingDoc.title)}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download File</span>
                        </button>
                        <a
                          href={viewingDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in External Tab</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-700">AIPEU Dhenkanal Division Document Portal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingDoc(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* In-App Deletion Confirmation Modal Dialog (immune to iframe sandbox restrictions) */}
          {deleteConfirm?.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-sm">
                  <Trash2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Delete {deleteConfirm.type}?
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1 mb-2 line-clamp-2">
                  "{deleteConfirm.title}"
                </p>
                <p className="text-xs text-red-600 font-medium mb-6">
                  Are you sure? This will be permanently removed from the website and Firebase database.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const action = deleteConfirm.onConfirm;
                      setDeleteConfirm(null);
                      await action();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                  >
                    Yes, Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
