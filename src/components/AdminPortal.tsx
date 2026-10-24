import React, { useState, useEffect } from 'react';
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
  NewCircularInput,
} from '../services/firebase';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from '../data/dakshikshaData';
import { sortOfficeBearers } from '../utils/officeBearerSorting';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
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

interface CustomPortalApp {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
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

const DEFAULT_MY_APPS: CustomPortalApp[] = [
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
  onCircularAdded,
  onCircularDeleted,
  onExecutiveUpdated,
  onHeroSlidesUpdated,
  onNewsItemsUpdated,
  onAnnouncementsUpdated,
  onDocsUpdated,
  onNoticeCircularsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('hero');
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

  // ================= 3. HOMEPAGE DOCS STATE =================
  const [importantDocs, setImportantDocs] = useState<ImportantDocItem[]>([]);
  const [editingDoc, setEditingDoc] = useState<ImportantDocItem | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docCategory, setDocCategory] = useState('General');

  // ================= 4. NOTICES & CIRCULARS STATE =================
  const [noticeCirculars, setNoticeCirculars] = useState<NoticeCircularItem[]>([]);
  const [editingNotice, setEditingNotice] = useState<NoticeCircularItem | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<string>('NOTICE');
  const [noticePublished, setNoticePublished] = useState('');
  const [noticeUrl, setNoticeUrl] = useState('');

  // ================= 5. ANNOUNCEMENTS STATE =================
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annLink, setAnnLink] = useState('');
  const [annPublished, setAnnPublished] = useState('');

  // ================= 6. PHOTO GALLERY STATE =================
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [galTitle, setGalTitle] = useState('');
  const [galUrl, setGalUrl] = useState('');
  const [galCategory, setGalCategory] = useState('Union Conference');
  const [galDate, setGalDate] = useState(new Date().toISOString().split('T')[0]);

  // ================= 7. MY APPS STATE =================
  const [myApps, setMyApps] = useState<CustomPortalApp[]>(DEFAULT_MY_APPS);
  const [appName, setAppName] = useState('');
  const [appCategory, setAppCategory] = useState('Operations');
  const [appUrl, setAppUrl] = useState('');
  const [appDescription, setAppDescription] = useState('');

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

  // ================= 11. EXECUTIVE MEMBERS & DOCUMENTS/RULINGS STATE =================
  const [executiveSubSection, setExecutiveSubSection] = useState<'bearers' | 'rulings'>('bearers');
  const [executives, setExecutives] = useState<(OfficeBearer & { id?: string })[]>([]);
  const [editingMember, setEditingMember] = useState<(OfficeBearer & { id?: string }) | null>(null);
  const [execName, setExecName] = useState('');
  const [execDesignation, setExecDesignation] = useState('');
  const [execBranch, setExecBranch] = useState("AIPEU Group 'C', Dhenkanal Division");
  const [execPhone, setExecPhone] = useState('');
  const [execLocation, setExecLocation] = useState('Dhenkanal HO');
  const [execRoleType, setExecRoleType] = useState<'president' | 'secretary' | 'treasurer' | 'executive'>('executive');
  const [execPhotoUrl, setExecPhotoUrl] = useState('');

  // Documents & Rulings (Executive Body)
  const [unionRulings, setUnionRulings] = useState<UnionDocumentRuling[]>([]);
  const [editingRuling, setEditingRuling] = useState<UnionDocumentRuling | null>(null);
  const [rulingTitle, setRulingTitle] = useState('');
  const [rulingDesc, setRulingDesc] = useState('');
  const [rulingLink, setRulingLink] = useState('');
  const [rulingType, setRulingType] = useState('Constitution');
  const [rulingOrder, setRulingOrder] = useState<number>(1);

  // Load all data when modal opens
  const loadAllData = async () => {
    try {
      const [slides, news, execs, anns, docs, notcs, posts, rulings] = await Promise.all([
        getHeroSlidesFromFirestore(),
        getNewsItemsFromFirestore(),
        getExecutiveMembersFromFirestore(),
        getAnnouncementsFromFirestore(),
        getImportantDocumentsFromFirestore(),
        getNoticeCircularsFromFirestore(),
        getCircularsFromFirestore(),
        getUnionDocumentsAndRulingsFromFirestore(),
      ]);
      setHeroSlides(slides);
      setNewsItems(news);
      setExecutives(execs);
      setAnnouncements(anns);
      setImportantDocs(docs);
      setUnionRulings(rulings);
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
  };

  const handleSaveHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageUrl.trim()) {
      showNotification('⚠️ Please enter Photo URL');
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
    setDocPostFileUrl(circ.driveLinks?.[0] || '');
    setDocPostImageUrl(circ.images?.[0] || '');
    setDocPostAuthor(circ.author || 'Divisional Secretary, AIPEU Dhenkanal');
    setDocPostUrgent(!!circ.urgent);
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
          showNotification('✅ Document file deleted successfully.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete document.');
        }
      },
    });
  };

  // ================= 3. HOMEPAGE DOCS HANDLERS =================
  const handleEditImportantDocClick = (docItem: ImportantDocItem) => {
    setEditingDoc(docItem);
    setDocTitle(docItem.title || '');
    setDocUrl(docItem.url || '');
    setDocCategory(docItem.category || 'General');
  };

  const handleCancelEditImportantDoc = () => {
    setEditingDoc(null);
    setDocTitle('');
    setDocUrl('');
    setDocCategory('General');
  };

  const handleSaveImportantDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docUrl.trim()) {
      showNotification('⚠️ Title and Document URL are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveImportantDocumentToFirestore({
        id: editingDoc ? editingDoc.id : undefined,
        title: docTitle.trim(),
        url: docUrl.trim(),
        category: docCategory.trim() || 'General',
        order: editingDoc?.order ?? importantDocs.length + 1,
      });

      const updated = await getImportantDocumentsFromFirestore();
      setImportantDocs(updated);
      if (onDocsUpdated) onDocsUpdated();

      handleCancelEditImportantDoc();
      showNotification('✅ Homepage Document saved successfully!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save Homepage Document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImportantDoc = (id: string) => {
    const docItem = importantDocs.find((d) => d.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Homepage Document',
      id,
      title: docItem?.title || 'Selected document',
      onConfirm: async () => {
        try {
          setImportantDocs((prev) => prev.filter((d) => d.id !== id));
          await deleteImportantDocumentFromFirestore(id);
          const updated = await getImportantDocumentsFromFirestore();
          setImportantDocs(updated);
          if (onDocsUpdated) onDocsUpdated();
          showNotification('✅ Document removed from Homepage.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete document.');
        }
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
  };

  const handleCancelEditNotice = () => {
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeCategory('NOTICE');
    setNoticePublished('');
    setNoticeUrl('');
  };

  const handleSaveNoticeCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeUrl.trim()) {
      showNotification('⚠️ Notice Title and Document Link are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveNoticeCircularToFirestore({
        id: editingNotice ? editingNotice.id : undefined,
        title: noticeTitle.trim(),
        category: noticeCategory,
        published: noticePublished || new Date().toISOString().split('T')[0],
        url: noticeUrl.trim(),
        order: editingNotice?.order ?? noticeCirculars.length + 1,
      });

      const updated = await getNoticeCircularsFromFirestore();
      setNoticeCirculars(updated);
      if (onNoticeCircularsUpdated) onNoticeCircularsUpdated();

      handleCancelEditNotice();
      showNotification('✅ Notice / Circular updated successfully in Firebase!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save Notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNoticeCircular = (id: string) => {
    const nc = noticeCirculars.find((n) => n.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Notice / Circular',
      id,
      title: nc?.title || 'Selected notice',
      onConfirm: async () => {
        try {
          setNoticeCirculars((prev) => prev.filter((n) => n.id !== id));
          await deleteNoticeCircularFromFirestore(id);
          const updated = await getNoticeCircularsFromFirestore();
          setNoticeCirculars(updated);
          if (onNoticeCircularsUpdated) onNoticeCircularsUpdated();
          showNotification('✅ Notice circular deleted.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete notice.');
        }
      },
    });
  };

  // ================= 5. ANNOUNCEMENTS HANDLERS =================
  const handleEditAnnouncementClick = (ann: AnnouncementItem) => {
    setEditingAnn(ann);
    setAnnTitle(ann.title || '');
    setAnnLink(ann.link || '');
    setAnnPublished(ann.published || new Date().toISOString().split('T')[0]);
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnn(null);
    setAnnTitle('');
    setAnnLink('');
    setAnnPublished('');
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      showNotification('⚠️ Announcement title/text is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveAnnouncementToFirestore({
        id: editingAnn ? editingAnn.id : undefined,
        title: annTitle.trim(),
        link: annLink.trim(),
        published: annPublished || new Date().toISOString().split('T')[0],
        order: editingAnn?.order ?? announcements.length + 1,
        active: true,
      });

      const updated = await getAnnouncementsFromFirestore();
      setAnnouncements(updated);
      if (onAnnouncementsUpdated) onAnnouncementsUpdated();

      handleCancelEditAnnouncement();
      showNotification('✅ Announcement published to banner ticker!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Announcement',
      id,
      title: ann?.title || 'Selected announcement',
      onConfirm: async () => {
        try {
          setAnnouncements((prev) => prev.filter((a) => a.id !== id));
          await deleteAnnouncementFromFirestore(id);
          const updated = await getAnnouncementsFromFirestore();
          setAnnouncements(updated);
          if (onAnnouncementsUpdated) onAnnouncementsUpdated();
          showNotification('✅ Announcement removed.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete announcement.');
        }
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
  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !appUrl.trim()) {
      showNotification('⚠️ App Name and URL are required');
      return;
    }
    const newApp: CustomPortalApp = {
      id: `app-${Date.now()}`,
      name: appName.trim(),
      category: appCategory.trim() || 'Operations',
      url: appUrl.trim(),
      description: appDescription.trim() || 'Official postal employee quick access portal',
    };
    const updated = [...myApps, newApp];
    setMyApps(updated);
    localStorage.setItem('aipeu_admin_apps', JSON.stringify(updated));
    setAppName('');
    setAppUrl('');
    setAppDescription('');
    showNotification('✅ Portal App shortcut added!');
  };

  const handleDeleteApp = (id: string) => {
    const app = myApps.find((a) => a.id !== id);
    setDeleteConfirm({
      isOpen: true,
      type: 'Portal App Shortcut',
      id,
      title: app?.name || 'Selected app',
      onConfirm: () => {
        const updated = myApps.filter((a) => a.id !== id);
        setMyApps(updated);
        localStorage.setItem('aipeu_admin_apps', JSON.stringify(updated));
        showNotification('✅ App shortcut removed.');
      },
    });
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
  };

  const handleCancelEditNews = () => {
    setEditingNews(null);
    setNewsTitle('');
    setNewsCategory('LATEST NEWS');
    setNewsLink('');
    setNewsIsUrgent(false);
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
    setExecLocation(member.location || 'Dhenkanal HO');
    setExecRoleType(member.roleType || 'executive');
    setExecPhotoUrl(member.photoUrl || '');
  };

  const handleCancelEditExecutive = () => {
    setEditingMember(null);
    setExecName('');
    setExecDesignation('');
    setExecBranch("AIPEU Group 'C', Dhenkanal Division");
    setExecPhone('');
    setExecLocation('Dhenkanal HO');
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
        location: execLocation.trim() || 'Dhenkanal HO',
        roleType: execRoleType,
        photoUrl: execPhotoUrl.trim(),
      });
      const updated = await getExecutiveMembersFromFirestore();
      setExecutives(updated);
      onExecutiveUpdated();
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
          showNotification('✅ Executive member removed.');
        } catch (e) {
          console.error(e);
          showNotification('❌ Could not delete.');
        }
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
  // Navigation menu items matching the screenshot
  const menuItems: { id: AdminMenuTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
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

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col overflow-y-auto selection:bg-red-500 selection:text-white">
      {/* 1. Thin Red Accent Line at the very top edge */}
      <div className="h-1 bg-red-600 w-full shrink-0 sticky top-0 z-40" />

      {/* 2. Top Breadcrumb Bar */}
      <header className="bg-white/90 backdrop-blur-md px-6 lg:px-10 py-3.5 flex items-center justify-between border-b border-slate-200/80 sticky top-1 z-30">
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>HOME</span>
          </button>
          <span className="text-slate-300 font-normal">›</span>
          <span className="text-red-600 font-bold uppercase tracking-wider">ADMIN PORTAL</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

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
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Portal</span>
          </button>
        </div>
      </header>

      {/* Status toast message */}
      {statusMsg && (
        <div className="fixed top-14 right-6 z-50 max-w-md bg-slate-900 text-white text-xs font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
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
        /* Authenticated Admin Portal with matching layout from reference screenshot */
        <div className="flex-1 flex min-h-[calc(100vh-50px)] relative">
          {/* Left Sidebar */}
          <aside
            className={`w-64 xl:w-72 bg-white border-r border-slate-200/80 p-4 sm:p-5 flex flex-col shrink-0 lg:static fixed inset-y-0 left-0 z-40 transition-transform lg:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Admin Profile Widget */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 mb-4">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                  alt="Administrator Kalandi Charan Sahoo"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500/80 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                  ADMINISTRATOR
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  Kalandi Charan Sahoo
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  Divisional Secretary
                </p>
              </div>
            </div>

            {/* Navigation Menu List */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-red-600 hover:bg-slate-100/80'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer info */}
            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-tight">
              NFPE AIPEU Unions AIGDSU AIPRPA AIPCPCCWF - Dhenkanal Division
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Top Section Header matching screenshot */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                {activeTab === 'hero' && 'HERO SLIDER'}
                {activeTab === 'dashboard' && 'DASHBOARD'}
                {activeTab === 'documents' && 'DOCUMENTS'}
                {activeTab === 'importantDocs' && 'HOMEPAGE DOCS'}
                {activeTab === 'notices' && 'NOTICES & CIRCULARS'}
                {activeTab === 'announcements' && 'ANNOUNCEMENTS'}
                {activeTab === 'gallery' && 'PHOTO GALLERY'}
                {activeTab === 'myApps' && 'MY APPS'}
                {activeTab === 'forms' && 'FORMS'}
                {activeTab === 'employeeSite' && 'EMPLOYEE SITE'}
                {activeTab === 'news' && 'NEWS TICKER'}
                {activeTab === 'executives' && 'EXECUTIVE BEARERS'}
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
                {activeTab === 'hero' && 'UPLOAD PHOTOS FOR THE HOMEPAGE HERO SLIDER.'}
                {activeTab === 'dashboard' && 'OVERVIEW AND STATISTICS OF WEBSITE ASSETS.'}
                {activeTab === 'documents' && 'UPLOAD DIVISIONAL CIRCULARS AND ORDERS.'}
                {activeTab === 'importantDocs' && 'PIN CRUCIAL DOCUMENTS TO HOMEPAGE.'}
                {activeTab === 'notices' && 'MANAGE NOTICE BOARD, CGHS & PENSION CIRCULARS.'}
                {activeTab === 'announcements' && 'UPDATE HOMEPAGE SCROLLING TICKER & FLASHES.'}
                {activeTab === 'gallery' && 'UPLOAD EVENT PHOTOS FOR UNION ARCHIVE.'}
                {activeTab === 'myApps' && 'MANAGE 15 QUICK ACCESS SERVICE PORTALS.'}
                {activeTab === 'forms' && 'MANAGE DOWNLOADABLE EXAM & SERVICE FORMS.'}
                {activeTab === 'employeeSite' && 'MANAGE POSTAL MANUALS & CS REGULATIONS.'}
                {activeTab === 'news' && 'MANAGE REAL-TIME BREAKING NEWS HEADLINES.'}
                {activeTab === 'executives' && 'MANAGE UNION OFFICE BEARERS & REPRESENTATIVES.'}
              </p>
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
                  <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-24">
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
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          PHOTO URL *
                        </label>
                        <input
                          type="url"
                          value={heroImageUrl}
                          onChange={(e) => setHeroImageUrl(e.target.value)}
                          placeholder="https://..."
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder-slate-400"
                        />
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

                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                                  <button
                                    onClick={() => handleEditSlideClick(slide)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1"
                                    title="Edit Slide"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHeroSlide(slide.id)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
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

            {/* TAB CONTENT: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Hero Slides', count: heroSlides.length, tab: 'hero' as AdminMenuTab, icon: Sliders },
                    { label: 'Documents', count: circulars.length, tab: 'documents' as AdminMenuTab, icon: FileText },
                    { label: 'Homepage Docs', count: importantDocs.length, tab: 'importantDocs' as AdminMenuTab, icon: FileCheck },
                    { label: 'Notices / Circulars', count: noticeCirculars.length, tab: 'notices' as AdminMenuTab, icon: Bookmark },
                    { label: 'Announcements', count: announcements.length, tab: 'announcements' as AdminMenuTab, icon: Megaphone },
                    { label: 'Photo Gallery', count: galleryPhotos.length, tab: 'gallery' as AdminMenuTab, icon: ImageIcon },
                    { label: 'Quick Apps', count: myApps.length, tab: 'myApps' as AdminMenuTab, icon: LayoutGrid },
                    { label: 'Executive Bearers', count: executives.length, tab: 'executives' as AdminMenuTab, icon: Users },
                  ].map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveTab(stat.tab)}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-red-300 hover:shadow-md transition-all text-left flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {stat.label}
                          </span>
                          <StatIcon className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-3xl font-black text-slate-900">{stat.count}</div>
                        <span className="text-[10px] text-red-600 font-semibold mt-2 block">
                          Manage Section →
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* System & Firestore Status */}
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

            {/* TAB CONTENT: DOCUMENTS (CIRCULARS) */}
            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      {editingCircular ? 'EDIT DOCUMENT / CIRCULAR' : 'ADD NEW DOCUMENT'}
                    </h2>
                    {editingCircular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Editing Mode
                      </span>
                    )}
                  </div>
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
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        CATEGORY
                      </label>
                      <select
                        value={docPostCategory}
                        onChange={(e) => setDocPostCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        <option value="GROUP - 'C' AGENDA">GROUP - 'C' AGENDA</option>
                        <option value="DIVISION ORDERS">DIVISION ORDERS</option>
                        <option value="DEPARTMENTAL EXAMS">DEPARTMENTAL EXAMS</option>
                        <option value="POSTMEN / MTS">POSTMEN / MTS</option>
                        <option value="PENSION & WELFARE">PENSION & WELFARE</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        SUMMARY / SNIPPET *
                      </label>
                      <textarea
                        value={docPostSnippet}
                        onChange={(e) => setDocPostSnippet(e.target.value)}
                        placeholder="Enter concise document description..."
                        rows={3}
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        PDF / DOCUMENT LINK (OPTIONAL)
                      </label>
                      <input
                        type="url"
                        value={docPostFileUrl}
                        onChange={(e) => setDocPostFileUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
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
                      <label htmlFor="docUrgent" className="text-xs font-medium text-slate-700">
                        Mark as Urgent / Red Flash
                      </label>
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingCircular ? 'Update Document' : '+ Add Document'}</span>
                      </button>
                      {editingCircular && (
                        <button
                          type="button"
                          onClick={handleCancelEditCircular}
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
                    CURRENT DOCUMENTS ({circulars.length})
                  </div>
                  <div className="space-y-4">
                    {circulars.map((circ) => (
                      <div
                        key={circ.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 uppercase">
                            {circ.categories[0] || 'CIRCULAR'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                            {circ.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{circ.snippet}</p>
                          {circ.driveLinks && circ.driveLinks.length > 0 && (
                            <a
                              href={circ.driveLinks[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                            >
                              <span>🔗 View Document</span>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditCircularClick(circ)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Document"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCircular(circ.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Document"
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

            {/* TAB CONTENT: HOMEPAGE DOCS */}
            {activeTab === 'importantDocs' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      {editingDoc ? 'EDIT HOMEPAGE DOC' : 'ADD HOMEPAGE DOC'}
                    </h2>
                    {editingDoc && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Editing Mode
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSaveImportantDoc} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        DOCUMENT TITLE *
                      </label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="e.g. APT 2.0 Work Flow Manual"
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
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value)}
                        placeholder="e.g. APT 2.0 / GDS Service / POSB"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        DOCUMENT URL / PDF LINK *
                      </label>
                      <input
                        type="url"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingDoc ? 'Update Document' : '+ Add Document'}</span>
                      </button>
                      {editingDoc && (
                        <button
                          type="button"
                          onClick={handleCancelEditImportantDoc}
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
                    CURRENT HOMEPAGE DOCS ({importantDocs.length})
                  </div>
                  <div className="space-y-4">
                    {importantDocs.map((docItem) => (
                      <div
                        key={docItem.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {docItem.category || 'General'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                            {docItem.title}
                          </h3>
                          <a
                            href={docItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                          >
                            <span>🔗 View Document</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditImportantDocClick(docItem)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Document"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImportantDoc(docItem.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete Doc"
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

            {/* TAB CONTENT: NOTICES & CIRCULARS */}
            {activeTab === 'notices' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      {editingNotice ? 'EDIT NOTICE' : 'ADD NOTICE / CIRCULAR'}
                    </h2>
                    {editingNotice && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Editing Mode
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSaveNoticeCircular} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        TITLE *
                      </label>
                      <input
                        type="text"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="e.g. Allotment of Departmental Quarters"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        CATEGORY
                      </label>
                      <select
                        value={noticeCategory}
                        onChange={(e) => setNoticeCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      >
                        <option value="NOTICE">NOTICE</option>
                        <option value="ACCOMMODATION">ACCOMMODATION</option>
                        <option value="CGHS">CGHS</option>
                        <option value="PENSION">PENSION</option>
                        <option value="MISC">MISC</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        DOCUMENT / PDF URL *
                      </label>
                      <input
                        type="url"
                        value={noticeUrl}
                        onChange={(e) => setNoticeUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingNotice ? 'Update Notice' : '+ Add Notice'}</span>
                      </button>
                      {editingNotice && (
                        <button
                          type="button"
                          onClick={handleCancelEditNotice}
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
                    CURRENT NOTICES ({noticeCirculars.length})
                  </div>
                  <div className="space-y-4">
                    {noticeCirculars.map((nc) => (
                      <div
                        key={nc.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase">
                            {nc.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                            {nc.title}
                          </h3>
                          <a
                            href={nc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                          >
                            <span>🔗 View Document</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditNoticeClick(nc)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Notice"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNoticeCircular(nc.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete Notice"
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

            {/* TAB CONTENT: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      {editingAnn ? 'EDIT ANNOUNCEMENT' : 'ADD ANNOUNCEMENT'}
                    </h2>
                    {editingAnn && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Editing Mode
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        ANNOUNCEMENT TEXT *
                      </label>
                      <textarea
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Enter scrolling announcement text..."
                        rows={3}
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        TARGET LINK (OPTIONAL)
                      </label>
                      <input
                        type="url"
                        value={annLink}
                        onChange={(e) => setAnnLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingAnn ? 'Update Announcement' : '+ Add Announcement'}</span>
                      </button>
                      {editingAnn && (
                        <button
                          type="button"
                          onClick={handleCancelEditAnnouncement}
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
                    CURRENT ANNOUNCEMENTS ({announcements.length})
                  </div>
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2">
                            {ann.title}
                          </h3>
                          {ann.link && (
                            <a
                              href={ann.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                            >
                              <span>🔗 View Link</span>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditAnnouncementClick(ann)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete Announcement"
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    ADD QUICK APP SHORTCUT
                  </h2>
                  <form onSubmit={handleSaveApp} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        APP / PORTAL NAME *
                      </label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        placeholder="e.g. India Post Central Portal"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        PORTAL URL *
                      </label>
                      <input
                        type="url"
                        value={appUrl}
                        onChange={(e) => setAppUrl(e.target.value)}
                        placeholder="https://..."
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
                        value={appCategory}
                        onChange={(e) => setAppCategory(e.target.value)}
                        placeholder="e.g. Operations / Banking / Training"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add App</span>
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT APPS ({myApps.length})
                  </div>
                  <div className="space-y-4">
                    {myApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
                            {app.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate">
                            {app.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{app.description}</p>
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                          >
                            <span>🔗 Open Portal</span>
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete App"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      {editingNews ? 'EDIT HEADLINE' : 'ADD NEWS TICKER ITEM'}
                    </h2>
                    {editingNews && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Editing Mode
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSaveNews} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
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
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        CATEGORY
                      </label>
                      <input
                        type="text"
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        placeholder="e.g. EXAM NOTIFICATION"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
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
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
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

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT NEWS HEADLINES ({newsItems.length})
                  </div>
                  <div className="space-y-4">
                    {newsItems.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              n.isUrgent ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {n.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 line-clamp-2">
                            {n.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditNewsClick(n)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Headline"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNews(n.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            title="Delete Headline"
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
                    <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
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
                              placeholder="e.g. Dhenkanal HO"
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

                    <div className="lg:col-span-7 xl:col-span-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          CURRENT EXECUTIVE MEMBERS ({executives.length})
                        </div>
                        <span className="text-xs text-slate-400">
                          Ordered: Group C ➔ Postman/MTS ➔ GDS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sortOfficeBearers(executives).map((ex) => (
                          <div
                            key={ex.id || ex.name}
                            className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                              editingMember?.id === ex.id
                                ? 'border-red-500 ring-2 ring-red-500/20'
                                : 'border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Photo Avatar Thumbnail */}
                              <div className="relative shrink-0">
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

                              {/* Action Buttons: Edit and Delete */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditExecutiveClick(ex)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit Member & Photo"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExecutive(ex.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete Bearer"
                                >
                                  <Trash2 className="w-4 h-4" />
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
