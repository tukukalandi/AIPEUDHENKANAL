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
} from 'lucide-react';
import {
  BlogPost,
  OfficeBearer,
  HeroSlide,
  NewsSliderItem,
  AnnouncementItem,
  ImportantDocItem,
  NoticeCircularItem,
} from '../types';
import {
  addCircularToFirestore,
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
  NewCircularInput,
} from '../services/firebase';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_IMPORTANT_DOCUMENTS,
  DEFAULT_NOTICE_CIRCULARS,
} from '../data/dakshikshaData';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onCircularAdded: (newPost: BlogPost) => void;
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
  onExecutiveUpdated,
  onHeroSlidesUpdated,
  onNewsItemsUpdated,
  onAnnouncementsUpdated,
  onDocsUpdated,
  onNoticeCircularsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('hero');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ================= 1. HERO SLIDER STATE =================
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroTag, setHeroTag] = useState('🎓 DAKSHIKSHA PORTAL');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('Explore Syllabus & Materials');
  const [heroCtaLink, setHeroCtaLink] = useState('#departmental-exams');
  const [heroGradient, setHeroGradient] = useState('from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]');

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

  // ================= 11. EXECUTIVE MEMBERS STATE =================
  const [executives, setExecutives] = useState<(OfficeBearer & { id?: string })[]>([]);
  const [editingMember, setEditingMember] = useState<(OfficeBearer & { id?: string }) | null>(null);
  const [execName, setExecName] = useState('');
  const [execDesignation, setExecDesignation] = useState('');
  const [execBranch, setExecBranch] = useState("AIPEU Group 'C', Dhenkanal Division");
  const [execPhone, setExecPhone] = useState('');
  const [execLocation, setExecLocation] = useState('Dhenkanal HO');
  const [execRoleType, setExecRoleType] = useState<'president' | 'secretary' | 'treasurer' | 'executive'>('executive');

  // Load all data when modal opens
  const loadAllData = async () => {
    try {
      const [slides, news, execs, anns, docs, notcs, posts] = await Promise.all([
        getHeroSlidesFromFirestore(),
        getNewsItemsFromFirestore(),
        getExecutiveMembersFromFirestore(),
        getAnnouncementsFromFirestore(),
        getImportantDocumentsFromFirestore(),
        getNoticeCircularsFromFirestore(),
        getCircularsFromFirestore(),
      ]);
      setHeroSlides(slides);
      setNewsItems(news);
      setExecutives(execs);
      setAnnouncements(anns);
      setImportantDocs(docs);
      setNoticeCirculars(notcs);
      setCirculars(posts);

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

  // PIN check (1234 or empty/demo)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.toLowerCase() === 'admin' || pinInput === '') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
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
    setHeroTag(slide.tag || 'DAKSHIKSHA');
    setHeroImageUrl(slide.imageUrl);
    setHeroCtaText(slide.ctaText || 'Learn More');
    setHeroCtaLink(slide.ctaLink || '#');
    setHeroGradient(slide.gradient || 'from-[#0A2540] via-[#1E3A8A] to-[#B91C1C]');
  };

  const handleCancelEditSlide = () => {
    setEditingSlide(null);
    setHeroTitle('');
    setHeroSubtitle('');
    setHeroTag('🎓 DAKSHIKSHA PORTAL');
    setHeroImageUrl('');
    setHeroCtaText('Explore Syllabus & Materials');
    setHeroCtaLink('#departmental-exams');
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
        tag: heroTag.trim() || 'DAKSHIKSHA',
        imageUrl: heroImageUrl.trim(),
        ctaText: heroCtaText.trim() || 'Explore Now',
        ctaLink: heroCtaLink.trim() || '#circulars',
        gradient: heroGradient,
        active: true,
        order: editingSlide?.order ?? heroSlides.length + 1,
      };

      await saveHeroSlideToFirestore(slideData);
      const updatedSlides = await getHeroSlidesFromFirestore();
      setHeroSlides(updatedSlides);
      if (onHeroSlidesUpdated) onHeroSlidesUpdated();

      handleCancelEditSlide();
      showNotification('✅ Hero slider photo successfully saved to Firebase!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save hero slide to Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    if (window.confirm('Delete this hero slide from the home page?')) {
      try {
        await deleteHeroSlideFromFirestore(id);
        const updatedSlides = await getHeroSlidesFromFirestore();
        setHeroSlides(updatedSlides);
        if (onHeroSlidesUpdated) onHeroSlidesUpdated();
        showNotification('✅ Hero slide deleted from Firebase.');
      } catch (e) {
        showNotification('❌ Could not delete slide.');
      }
    }
  };

  // ================= 2. DOCUMENTS / CIRCULAR HANDLERS =================
  const handleSaveCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docPostTitle.trim() || !docPostSnippet.trim()) {
      showNotification('⚠️ Please provide Title and Summary');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCircular: NewCircularInput = {
        title: docPostTitle.trim(),
        category: docPostCategory,
        snippet: docPostSnippet.trim(),
        contentHtml: `<p>${docPostSnippet.trim()}</p>`,
        fileLinks: docPostFileUrl.trim() ? [docPostFileUrl.trim()] : [],
        imageUrls: docPostImageUrl.trim() ? [docPostImageUrl.trim()] : [],
        author: docPostAuthor.trim() || 'Divisional Secretary, AIPEU Dhenkanal',
        urgent: docPostUrgent,
      };

      const docId = await addCircularToFirestore(newCircular);
      const updated = await getCircularsFromFirestore();
      setCirculars(updated);

      onCircularAdded({
        id: docId,
        title: newCircular.title,
        published: new Date().toISOString(),
        updated: new Date().toISOString(),
        author: newCircular.author || 'Divisional Secretary, AIPEU Dhenkanal',
        url: '',
        categories: [newCircular.category],
        snippet: newCircular.snippet,
        contentHtml: newCircular.contentHtml || '',
        images: newCircular.imageUrls || [],
        driveLinks: newCircular.fileLinks || [],
      });

      setDocPostTitle('');
      setDocPostSnippet('');
      setDocPostFileUrl('');
      setDocPostImageUrl('');
      showNotification('✅ Document / Circular successfully published to Firebase!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to publish document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCircular = async (id: string) => {
    if (window.confirm('Delete this circular from website?')) {
      try {
        await deleteCircularFromFirestore(id);
        const updated = await getCircularsFromFirestore();
        setCirculars(updated);
        showNotification('✅ Circular deleted.');
      } catch (e) {
        showNotification('❌ Could not delete circular.');
      }
    }
  };

  // ================= 3. HOMEPAGE DOCS HANDLERS =================
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

      setEditingDoc(null);
      setDocTitle('');
      setDocUrl('');
      setDocCategory('General');
      showNotification('✅ Homepage Document saved successfully!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save Homepage Document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImportantDoc = async (id: string) => {
    if (window.confirm('Delete this homepage document?')) {
      try {
        await deleteImportantDocumentFromFirestore(id);
        const updated = await getImportantDocumentsFromFirestore();
        setImportantDocs(updated);
        if (onDocsUpdated) onDocsUpdated();
        showNotification('✅ Document removed from Homepage.');
      } catch (e) {
        showNotification('❌ Could not delete document.');
      }
    }
  };

  // ================= 4. NOTICES & CIRCULARS HANDLERS =================
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

      setEditingNotice(null);
      setNoticeTitle('');
      setNoticeUrl('');
      setNoticePublished('');
      showNotification('✅ Notice / Circular updated successfully in Firebase!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save Notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNoticeCircular = async (id: string) => {
    if (window.confirm('Delete this notice circular?')) {
      try {
        await deleteNoticeCircularFromFirestore(id);
        const updated = await getNoticeCircularsFromFirestore();
        setNoticeCirculars(updated);
        if (onNoticeCircularsUpdated) onNoticeCircularsUpdated();
        showNotification('✅ Notice circular deleted.');
      } catch (e) {
        showNotification('❌ Could not delete notice.');
      }
    }
  };

  // ================= 5. ANNOUNCEMENTS HANDLERS =================
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

      setEditingAnn(null);
      setAnnTitle('');
      setAnnLink('');
      setAnnPublished('');
      showNotification('✅ Announcement published to banner ticker!');
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await deleteAnnouncementFromFirestore(id);
        const updated = await getAnnouncementsFromFirestore();
        setAnnouncements(updated);
        if (onAnnouncementsUpdated) onAnnouncementsUpdated();
        showNotification('✅ Announcement removed.');
      } catch (e) {
        showNotification('❌ Could not delete announcement.');
      }
    }
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
    const updated = galleryPhotos.filter((p) => p.id !== id);
    setGalleryPhotos(updated);
    localStorage.setItem('aipeu_admin_gallery', JSON.stringify(updated));
    showNotification('✅ Photo deleted.');
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
    const updated = myApps.filter((a) => a.id !== id);
    setMyApps(updated);
    localStorage.setItem('aipeu_admin_apps', JSON.stringify(updated));
    showNotification('✅ App shortcut removed.');
  };

  // ================= 8. FORMS HANDLERS =================
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDownloadUrl.trim()) {
      showNotification('⚠️ Form Name and Download URL are required');
      return;
    }
    const newForm: DownloadableForm = {
      id: `form-${Date.now()}`,
      title: formName.trim(),
      formCode: formCode.trim() || 'DoP-FORM',
      category: formCat.trim() || 'Service Matters',
      downloadUrl: formDownloadUrl.trim(),
    };
    const updated = [...formsList, newForm];
    setFormsList(updated);
    localStorage.setItem('aipeu_admin_forms', JSON.stringify(updated));
    setFormName('');
    setFormCode('');
    setFormDownloadUrl('');
    showNotification('✅ Downloadable Form added!');
  };

  const handleDeleteForm = (id: string) => {
    const updated = formsList.filter((f) => f.id !== id);
    setFormsList(updated);
    localStorage.setItem('aipeu_admin_forms', JSON.stringify(updated));
    showNotification('✅ Form removed.');
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
    const updated = employeeResources.filter((r) => r.id !== id);
    setEmployeeResources(updated);
    localStorage.setItem('aipeu_admin_resources', JSON.stringify(updated));
    showNotification('✅ Resource removed.');
  };

  // ================= 10. NEWS TICKER HANDLERS =================
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
      setEditingNews(null);
      setNewsTitle('');
      setNewsLink('');
      showNotification('✅ News headline saved!');
    } catch (e) {
      showNotification('❌ Failed to save news item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (window.confirm('Delete this headline?')) {
      try {
        await deleteNewsItemFromFirestore(id);
        const updated = await getNewsItemsFromFirestore();
        setNewsItems(updated);
        if (onNewsItemsUpdated) onNewsItemsUpdated();
        showNotification('✅ Headline deleted.');
      } catch (e) {
        showNotification('❌ Could not delete.');
      }
    }
  };

  // ================= 11. EXECUTIVE BEARERS HANDLERS =================
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
        branch: execBranch.trim(),
        phone: execPhone.trim(),
        location: execLocation.trim(),
        roleType: execRoleType,
      });
      const updated = await getExecutiveMembersFromFirestore();
      setExecutives(updated);
      onExecutiveUpdated();
      setEditingMember(null);
      setExecName('');
      setExecDesignation('');
      setExecPhone('');
      showNotification('✅ Office Bearer updated in Firebase!');
    } catch (e) {
      showNotification('❌ Failed to save bearer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExecutive = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Remove this office bearer?')) {
      try {
        await deleteExecutiveMemberFromFirestore(id);
        const updated = await getExecutiveMembersFromFirestore();
        setExecutives(updated);
        onExecutiveUpdated();
        showNotification('✅ Executive member removed.');
      } catch (e) {
        showNotification('❌ Could not delete.');
      }
    }
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

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200"
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
        /* PIN Verification Screen */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest block mb-1">
              ADMINISTRATIVE SECURITY
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              AIPEU Admin Login
            </h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Enter authorized administrator PIN to manage hero slides, circulars, and divisional content.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  SECURITY PIN (DEFAULT: 1234)
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter 4-digit PIN..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center text-lg tracking-widest font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-xs text-red-600 font-semibold text-center">
                  ⚠️ Invalid PIN. Please use 1234 for demo administrator access.
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Unlock Admin Portal</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center transition-colors"
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
            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              AIPEU Dhenkanal Division · v2.6
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

            {/* TAB CONTENT: HERO SLIDER (matching screenshot layout) */}
            {activeTab === 'hero' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Add/Edit Slide Card */}
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    {editingSlide ? 'EDIT SLIDE' : 'ADD NEW SLIDE'}
                  </h2>

                  <form onSubmit={handleSaveHeroSlide} className="space-y-4">
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
                        placeholder="Enter slide title..."
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
                        placeholder="Enter slide subtitle..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder-slate-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        TAG / BADGE (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={heroTag}
                        onChange={(e) => setHeroTag(e.target.value)}
                        placeholder="e.g. 🎓 DAKSHIKSHA PORTAL"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
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

                {/* Right Column: Current Slides List */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT SLIDES ({heroSlides.length})
                  </div>

                  <div className="space-y-4">
                    {heroSlides.map((slide) => (
                      <div
                        key={slide.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={slide.imageUrl}
                            alt={slide.title || 'Slide photo'}
                            className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                              {slide.title || 'Untitled Slide'}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {slide.subtitle || 'Hero slider photograph'}
                            </p>
                            <a
                              href={slide.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 mt-2 w-fit"
                            >
                              <span>🔗 View Image</span>
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditSlideClick(slide)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Slide"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHeroSlide(slide.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {heroSlides.length === 0 && (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-400 text-sm">
                        No hero slides configured. Add your first photo using the left form.
                      </div>
                    )}
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    ADD NEW DOCUMENT
                  </h2>
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Document</span>
                    </button>
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
                        <button
                          onClick={() => handleDeleteCircular(circ.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    {editingDoc ? 'EDIT HOMEPAGE DOC' : 'ADD HOMEPAGE DOC'}
                  </h2>
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingDoc ? 'Update Document' : '+ Add Document'}</span>
                    </button>
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
                        <button
                          onClick={() => handleDeleteImportantDoc(docItem.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Doc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    {editingNotice ? 'EDIT NOTICE' : 'ADD NOTICE / CIRCULAR'}
                  </h2>
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingNotice ? 'Update Notice' : '+ Add Notice'}</span>
                    </button>
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
                        <button
                          onClick={() => handleDeleteNoticeCircular(nc.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    {editingAnn ? 'EDIT ANNOUNCEMENT' : 'ADD ANNOUNCEMENT'}
                  </h2>
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingAnn ? 'Update Announcement' : '+ Add Announcement'}</span>
                    </button>
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
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    ADD DOWNLOADABLE FORM
                  </h2>
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
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Form</span>
                    </button>
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
                        <button
                          onClick={() => handleDeleteForm(f.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Form"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    {editingNews ? 'EDIT HEADLINE' : 'ADD NEWS TICKER ITEM'}
                  </h2>
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
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingNews ? 'Update Headline' : '+ Add Headline'}</span>
                    </button>
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
                        <button
                          onClick={() => handleDeleteNews(n.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Headline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXECUTIVE MEMBERS */}
            {activeTab === 'executives' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-600 pb-3 border-b border-slate-100 mb-6">
                    {editingMember ? 'EDIT OFFICE BEARER' : 'ADD OFFICE BEARER'}
                  </h2>
                  <form onSubmit={handleSaveExecutive} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        NAME *
                      </label>
                      <input
                        type="text"
                        value={execName}
                        onChange={(e) => setExecName(e.target.value)}
                        placeholder="e.g. Kalandi Charan Sahoo"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        DESIGNATION *
                      </label>
                      <input
                        type="text"
                        value={execDesignation}
                        onChange={(e) => setExecDesignation(e.target.value)}
                        placeholder="e.g. Divisional Secretary"
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        PHONE / CONTACT
                      </label>
                      <input
                        type="tel"
                        value={execPhone}
                        onChange={(e) => setExecPhone(e.target.value)}
                        placeholder="+91 94371 XXXXX"
                        className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingMember ? 'Update Bearer' : '+ Add Bearer'}</span>
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    CURRENT EXECUTIVE MEMBERS ({executives.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {executives.map((ex) => (
                      <div
                        key={ex.id || ex.name}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-start justify-between gap-3 hover:border-slate-300 transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-red-600 uppercase block">
                            {ex.branch}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                            {ex.name}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">{ex.designation}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            📍 {ex.location} {ex.phone && `· 📞 ${ex.phone}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteExecutive(ex.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Bearer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
        </div>
      )}
    </div>
  );
};
