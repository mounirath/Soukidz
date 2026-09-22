import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export type LanguageCode = 'ar' | 'en' | 'fr';

export const translations = {
  ar: {
    // App
    appName: 'سوق بلس',
    appTagline: 'منصة الإعلانات المبوبة الاحترافية',
    
    // Navigation & Tabs
    home: 'الرئيسية',
    search: 'بحث',
    postAd: 'أضف إعلان',
    chat: 'المحادثات',
    profile: 'حسابي',
    admin: 'لوحة الإدارة',
    myAds: 'إعلاناتي',
    favorites: 'المفضلة',
    notifications: 'الإشعارات',
    categories: 'التصنيفات',
    settings: 'الإعدادات',
    
    // Home
    searchPlaceholder: 'ابحث عن سيارات، عقارات، هواتف...',
    featuredAds: 'إعلانات مميزة',
    nearbyAds: 'إعلانات قريبة منك',
    recentAds: 'أحدث الإعلانات',
    viewAll: 'عرض الكل',
    noAdsFound: 'لا توجد إعلانات حالياً',
    filter: 'تصفية',
    sort: 'ترتيب',
    
    // Categories
    allCategories: 'جميع التصنيفات',
    subcategories: 'التصنيفات الفرعية',
    selectCategory: 'اختر التصنيف',
    selectSubcategory: 'اختر التصنيف الفرعي',
    
    // Add / Edit Listing
    createNewAd: 'نشر إعلان جديد',
    editAd: 'تعديل الإعلان',
    adTitle: 'عنوان الإعلان',
    adTitlePlaceholder: 'مثال: تويوتا كامري 2023 بحالة ممتازة',
    adDescription: 'وصف الإعلان',
    adDescriptionPlaceholder: 'اكتب وصفاً مفصلاً ودقيقاً للمنتج أو الخدمة...',
    price: 'السعر',
    currency: 'العملة',
    condition: 'الحالة',
    conditionNew: 'جديد بالكامل',
    conditionLikeNew: 'شبه جديد (ممتاز)',
    conditionGood: 'مستعمل بحالة جيدة',
    conditionFair: 'مستعمل بحالة مقبولة',
    city: 'المدينة',
    area: 'المنطقة / الحي',
    phoneNumber: 'رقم الهاتف',
    showPhone: 'إظهار رقم الهاتف للمشترين',
    hidePhone: 'إخفاء رقم الهاتف',
    uploadImages: 'رفع صور الإعلان',
    coverImage: 'صورة الغلاف',
    firstIsCover: 'الصورة الأولى ستكون صورة الغلاف الرئيسية',
    selectPhotos: 'إضافة صور',
    maxPhotosNotice: 'الحد الأقصى هو {max} صور',
    publishAd: 'نشر الإعلان',
    saveDraft: 'حفظ كمسودة',
    previewAd: 'معاينة الإعلان',
    submittedForReview: 'تم إرسال إعلانك للمراجعة بنجاح',
    publishedDirectly: 'تم نشر إعلانك بنجاح',
    
    // Listing Details
    details: 'التفاصيل',
    sellerInfo: 'معلومات البائع',
    callSeller: 'اتصال',
    chatSeller: 'محادثة فورية',
    shareAd: 'مشاركة',
    reportAd: 'إبلاغ عن الإعلان',
    addToFav: 'حفظ بالمفضلة',
    removeFromFav: 'إزالة من المفضلة',
    safetyTips: 'نصائح الأمان للمشتري',
    safetyTip1: 'عاين السلعة شخصياً قبل إتمام عملية الدفع.',
    safetyTip2: 'تجنب تحويل الأموال مسبقاً لأي طرف غير موثوق.',
    safetyTip3: 'التقِ في أماكن عامة وآمنة دائماً.',
    views: 'مشاهدة',
    memberSince: 'عضو منذ',
    similarAds: 'إعلانات مشابهة',
    
    // Statuses
    statusPublished: 'منشور',
    statusPending: 'قيد المراجعة',
    statusDraft: 'مسودة',
    statusRejected: 'مرفوض',
    statusExpired: 'منتهي الصلاحية',
    statusPaused: 'متوقف مؤقتاً',
    
    // My Ads Actions
    republish: 'إعادة نشر',
    pauseAd: 'إيقاف',
    resumeAd: 'تفعيل',
    extendAd: 'تمديد الصلاحية',
    deleteAd: 'حذف',
    deleteConfirm: 'هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع.',
    
    // Chat
    messages: 'الرسائل',
    noMessagesYet: 'لا توجد رسائل سابقة. ابدأ المحادثة الآن!',
    typeMessage: 'اكتب رسالتك هنا...',
    send: 'إرسال',
    quickReplies: 'ردود سريعة:',
    qrAvailable: 'هل المنتج ما زال متوفراً؟',
    qrPrice: 'هل السعر قابل للتفاوض؟',
    qrLocation: 'أين يمكن معاينة المنتج؟',
    blockUser: 'حظر المستخدم',
    reportUser: 'إبلاغ عن المحادثة',
    
    // Auth & Profile
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم الكامل',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة ضبط كلمة المرور',
    enterEmailForReset: 'أدخل بريدك الإلكتروني لاستلام رابط الاستعادة',
    sendResetLink: 'إرسال رابط الاستعادة',
    alreadyHaveAccount: 'لديك حساب بالفعل؟ سجل دخول',
    dontHaveAccount: 'ليس لديك حساب؟ اشترك الآن',
    editProfile: 'تعديل الملف الشخصي',
    saveChanges: 'حفظ التغييرات',
    theme: 'المظهر',
    language: 'اللغة',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    adminPortal: 'لوحة تحكم الإدارة (Admin)',
    
    // Filters & Sort
    sortBy: 'ترتيب حسب',
    newest: 'الأحدث أولاً',
    priceLowHigh: 'السعر: من الأقل للأعلى',
    priceHighLow: 'السعر: من الأعلى للأقل',
    mostViewed: 'الأكثر مشاهدة',
    allCities: 'كل المدن',
    priceRange: 'نطاق السعر',
    minPrice: 'الحد الأدنى',
    maxPrice: 'الحد الأقصى',
    applyFilters: 'تطبيق الفلتر',
    resetFilters: 'إعادة ضبط',
    
    // Report Modal
    reportTitle: 'الإبلاغ عن مخالفة',
    selectReportReason: 'اختر سبب البلاغ',
    reasonScam: 'احتيال أو نصب',
    reasonProhibited: 'سلعة أو خدمة ممنوعة',
    reasonInappropriate: 'محتوى غير لائق أو مسيء',
    reasonWrongInfo: 'معلومات غير دقيقة أو مضللة',
    reasonDuplicate: 'إعلان مكرر أو منتهي',
    reasonOther: 'سبب آخر',
    reportNotes: 'ملاحظات إضافية (اختياري)',
    submitReport: 'إرسال البلاغ',
    reportSuccess: 'شكراً لك، تم استلام بلاغك وسيقوم فريق الإشراف بمراجعته.',
    
    // Admin Panel
    adminDashboard: 'لوحة الإدارة',
    totalUsers: 'إجمالي المستخدمين',
    totalListings: 'إجمالي الإعلانات',
    pendingListings: 'إعلانات قيد المراجعة',
    activeListings: 'إعلانات نشطة',
    reportsCount: 'بلاغات المخالفات',
    totalChats: 'محادثات نشطة',
    manageUsers: 'إدارة المستخدمين',
    manageListings: 'إدارة الإعلانات',
    manageCategories: 'إدارة التصنيفات',
    manageReports: 'إدارة البلاغات',
    systemSettings: 'إعدادات النظام',
    schemaDocs: 'قاعدة البيانات و REST API',
    approve: 'موافقة',
    reject: 'رفض',
    featureAd: 'تمييز الإعلان',
    unfeatureAd: 'إلغاء التمييز',
    banUser: 'حظر المستخدم',
    unbanUser: 'فك الحظر',
    makeAdmin: 'ترقية لمشرف',
    removeAdmin: 'إلغاء الإشراف',
    saveSettings: 'حفظ الإعدادات',
    autoApproveListings: 'الموافقة التلقائية على الإعلانات فور نشرها',
    adExpiryDays: 'صلاحية الإعلان بالـ أيام',
    maxPhotosAllowed: 'الحد الأقصى للصور لكل إعلان',
    
    // Common
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    success: 'نجاح',
    error: 'خطأ',
    loading: 'جاري التحميل...',
    currencyUnit: 'ر.س',
  },
  
  en: {
    appName: 'SouqPlus',
    appTagline: 'Professional Classifieds Marketplace',
    
    home: 'Home',
    search: 'Search',
    postAd: 'Post Ad',
    chat: 'Chats',
    profile: 'Profile',
    admin: 'Admin Panel',
    myAds: 'My Ads',
    favorites: 'Favorites',
    notifications: 'Notifications',
    categories: 'Categories',
    settings: 'Settings',
    
    searchPlaceholder: 'Search cars, real estate, phones...',
    featuredAds: 'Featured Ads',
    nearbyAds: 'Nearby Ads',
    recentAds: 'Recent Ads',
    viewAll: 'View All',
    noAdsFound: 'No ads found currently',
    filter: 'Filter',
    sort: 'Sort',
    
    allCategories: 'All Categories',
    subcategories: 'Subcategories',
    selectCategory: 'Select Category',
    selectSubcategory: 'Select Subcategory',
    
    createNewAd: 'Create New Ad',
    editAd: 'Edit Ad',
    adTitle: 'Ad Title',
    adTitlePlaceholder: 'e.g. Toyota Camry 2023 in mint condition',
    adDescription: 'Ad Description',
    adDescriptionPlaceholder: 'Write a detailed and accurate description of the item...',
    price: 'Price',
    currency: 'Currency',
    condition: 'Condition',
    conditionNew: 'Brand New',
    conditionLikeNew: 'Like New (Mint)',
    conditionGood: 'Good Condition',
    conditionFair: 'Fair / Acceptable',
    city: 'City',
    area: 'Area / District',
    phoneNumber: 'Phone Number',
    showPhone: 'Show phone to buyers',
    hidePhone: 'Hide phone number',
    uploadImages: 'Upload Photos',
    coverImage: 'Cover Photo',
    firstIsCover: 'The first image will be used as the cover',
    selectPhotos: 'Add Photos',
    maxPhotosNotice: 'Maximum allowed is {max} photos',
    publishAd: 'Publish Ad',
    saveDraft: 'Save as Draft',
    previewAd: 'Preview Ad',
    submittedForReview: 'Your ad has been submitted for review successfully',
    publishedDirectly: 'Your ad has been published successfully',
    
    details: 'Details',
    sellerInfo: 'Seller Information',
    callSeller: 'Call',
    chatSeller: 'Direct Chat',
    shareAd: 'Share',
    reportAd: 'Report Ad',
    addToFav: 'Add to Favorites',
    removeFromFav: 'Remove from Favorites',
    safetyTips: 'Buyer Safety Tips',
    safetyTip1: 'Inspect the item thoroughly in person before paying.',
    safetyTip2: 'Never wire money in advance to untrusted parties.',
    safetyTip3: 'Always meet in public, safe locations.',
    views: 'views',
    memberSince: 'Member since',
    similarAds: 'Similar Ads',
    
    statusPublished: 'Published',
    statusPending: 'Under Review',
    statusDraft: 'Draft',
    statusRejected: 'Rejected',
    statusExpired: 'Expired',
    statusPaused: 'Paused',
    
    republish: 'Republish',
    pauseAd: 'Pause',
    resumeAd: 'Activate',
    extendAd: 'Extend Validity',
    deleteAd: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this ad? This action cannot be undone.',
    
    messages: 'Messages',
    noMessagesYet: 'No messages yet. Start the conversation now!',
    typeMessage: 'Type your message...',
    send: 'Send',
    quickReplies: 'Quick Replies:',
    qrAvailable: 'Is this item still available?',
    qrPrice: 'Is the price negotiable?',
    qrLocation: 'Where can I inspect the item?',
    blockUser: 'Block User',
    reportUser: 'Report Chat',
    
    login: 'Login',
    register: 'Create Account',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    enterEmailForReset: 'Enter your email to receive recovery instructions',
    sendResetLink: 'Send Reset Link',
    alreadyHaveAccount: 'Already have an account? Login',
    dontHaveAccount: "Don't have an account? Sign Up",
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    theme: 'Theme',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    adminPortal: 'Admin Portal',
    
    sortBy: 'Sort By',
    newest: 'Newest First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    mostViewed: 'Most Viewed',
    allCities: 'All Cities',
    priceRange: 'Price Range',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    applyFilters: 'Apply Filters',
    resetFilters: 'Reset',
    
    reportTitle: 'Report Listing',
    selectReportReason: 'Select report reason',
    reasonScam: 'Scam or fraud attempt',
    reasonProhibited: 'Prohibited item or service',
    reasonInappropriate: 'Inappropriate or offensive content',
    reasonWrongInfo: 'Misleading or incorrect information',
    reasonDuplicate: 'Duplicate or expired listing',
    reasonOther: 'Other reason',
    reportNotes: 'Additional details (optional)',
    submitReport: 'Submit Report',
    reportSuccess: 'Thank you! Your report has been submitted to the moderation team.',
    
    adminDashboard: 'Admin Dashboard',
    totalUsers: 'Total Users',
    totalListings: 'Total Listings',
    pendingListings: 'Pending Listings',
    activeListings: 'Active Listings',
    reportsCount: 'Reports',
    totalChats: 'Active Chats',
    manageUsers: 'Manage Users',
    manageListings: 'Manage Listings',
    manageCategories: 'Manage Categories',
    manageReports: 'Manage Reports',
    systemSettings: 'System Settings',
    schemaDocs: 'Database & REST API',
    approve: 'Approve',
    reject: 'Reject',
    featureAd: 'Feature',
    unfeatureAd: 'Unfeature',
    banUser: 'Ban User',
    unbanUser: 'Unban User',
    makeAdmin: 'Make Admin',
    removeAdmin: 'Remove Admin',
    saveSettings: 'Save Settings',
    autoApproveListings: 'Automatically approve listings upon submission',
    adExpiryDays: 'Listing Validity (Days)',
    maxPhotosAllowed: 'Max Photos Per Listing',
    
    cancel: 'Cancel',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    currencyUnit: 'SAR',
  },
  
  fr: {
    appName: 'SouqPlus',
    appTagline: 'Plateforme de petites annonces professionnelle',
    
    home: 'Accueil',
    search: 'Recherche',
    postAd: 'Publier',
    chat: 'Messages',
    profile: 'Profil',
    admin: 'Administration',
    myAds: 'Mes Annonces',
    favorites: 'Favoris',
    notifications: 'Notifications',
    categories: 'Catégories',
    settings: 'Paramètres',
    
    searchPlaceholder: 'Rechercher voitures, immobilier, téléphones...',
    featuredAds: 'Annonces en vedette',
    nearbyAds: 'Annonces à proximité',
    recentAds: 'Annonces récentes',
    viewAll: 'Voir tout',
    noAdsFound: 'Aucune annonce trouvée',
    filter: 'Filtrer',
    sort: 'Trier',
    
    allCategories: 'Toutes les catégories',
    subcategories: 'Sous-catégories',
    selectCategory: 'Choisir une catégorie',
    selectSubcategory: 'Choisir une sous-catégorie',
    
    createNewAd: 'Créer une annonce',
    editAd: "Modifier l'annonce",
    adTitle: "Titre de l'annonce",
    adTitlePlaceholder: 'Ex: Toyota Camry 2023 excellent état',
    adDescription: 'Description',
    adDescriptionPlaceholder: 'Rédigez une description claire et détaillée...',
    price: 'Prix',
    currency: 'Devise',
    condition: 'État',
    conditionNew: 'Neuf jamais utilisé',
    conditionLikeNew: 'Comme neuf',
    conditionGood: 'Bon état',
    conditionFair: 'État satisfaisant',
    city: 'Ville',
    area: 'Quartier',
    phoneNumber: 'Numéro de téléphone',
    showPhone: 'Afficher le numéro aux acheteurs',
    hidePhone: 'Masquer le numéro',
    uploadImages: 'Télécharger des photos',
    coverImage: 'Photo de couverture',
    firstIsCover: 'La première image sera la photo principale',
    selectPhotos: 'Ajouter des photos',
    maxPhotosNotice: 'Le maximum est de {max} photos',
    publishAd: 'Publier',
    saveDraft: 'Brouillon',
    previewAd: 'Aperçu',
    submittedForReview: 'Annonce soumise pour validation avec succès',
    publishedDirectly: 'Annonce publiée avec succès',
    
    details: 'Détails',
    sellerInfo: 'Information du vendeur',
    callSeller: 'Appeler',
    chatSeller: 'Discussion directe',
    shareAd: 'Partager',
    reportAd: 'Signaler',
    addToFav: 'Ajouter aux favoris',
    removeFromFav: 'Retirer des favoris',
    safetyTips: 'Conseils de sécurité',
    safetyTip1: "Vérifiez l'article en personne avant de payer.",
    safetyTip2: "N'envoyez jamais d'argent à l'avance.",
    safetyTip3: 'Rencontrez-vous toujours dans des lieux publics.',
    views: 'vues',
    memberSince: 'Membre depuis',
    similarAds: 'Annonces similaires',
    
    statusPublished: 'Publiée',
    statusPending: 'En attente',
    statusDraft: 'Brouillon',
    statusRejected: 'Rejetée',
    statusExpired: 'Expirée',
    statusPaused: 'En pause',
    
    republish: 'Republier',
    pauseAd: 'Suspendre',
    resumeAd: 'Activer',
    extendAd: 'Prolonger',
    deleteAd: 'Supprimer',
    deleteConfirm: 'Voulez-vous vraiment supprimer cette annonce ?',
    
    messages: 'Discussions',
    noMessagesYet: 'Aucun message pour le moment. Démarrez la discussion !',
    typeMessage: 'Écrivez votre message...',
    send: 'Envoyer',
    quickReplies: 'Réponses rapides :',
    qrAvailable: 'Cet article est-il toujours disponible ?',
    qrPrice: 'Le prix est-il négociable ?',
    qrLocation: 'Où peut-on voir le produit ?',
    blockUser: 'Bloquer',
    reportUser: 'Signaler la discussion',
    
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    email: 'E-mail',
    password: 'Mot de passe',
    name: 'Nom complet',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser',
    enterEmailForReset: 'Entrez votre e-mail pour recevoir le lien',
    sendResetLink: 'Envoyer le lien',
    alreadyHaveAccount: 'Déjà un compte ? Connectez-vous',
    dontHaveAccount: "Pas de compte ? Inscrivez-vous",
    editProfile: 'Modifier mon profil',
    saveChanges: 'Enregistrer',
    theme: 'Thème',
    language: 'Langue',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    adminPortal: 'Portail Admin',
    
    sortBy: 'Trier par',
    newest: 'Plus récents',
    priceLowHigh: 'Prix : croissant',
    priceHighLow: 'Prix : décroissant',
    mostViewed: 'Plus consultés',
    allCities: 'Toutes les villes',
    priceRange: 'Fourchette de prix',
    minPrice: 'Prix minimum',
    maxPrice: 'Prix maximum',
    applyFilters: 'Appliquer',
    resetFilters: 'Réinitialiser',
    
    reportTitle: 'Signaler une annonce',
    selectReportReason: 'Sélectionner le motif',
    reasonScam: 'Arnaque ou fraude',
    reasonProhibited: 'Produit ou service interdit',
    reasonInappropriate: 'Contenu inapproprié ou offensant',
    reasonWrongInfo: 'Informations fausses ou trompeuses',
    reasonDuplicate: 'Annonce en double ou expirée',
    reasonOther: 'Autre motif',
    reportNotes: 'Précisions supplémentaires',
    submitReport: 'Envoyer le signalement',
    reportSuccess: 'Merci, votre signalement a été transmis aux modérateurs.',
    
    adminDashboard: "Tableau d'administration",
    totalUsers: 'Total Utilisateurs',
    totalListings: 'Total Annonces',
    pendingListings: 'En attente',
    activeListings: 'Annonces actives',
    reportsCount: 'Signalements',
    totalChats: 'Discussions actives',
    manageUsers: 'Gestion Utilisateurs',
    manageListings: 'Gestion Annonces',
    manageCategories: 'Gestion Catégories',
    manageReports: 'Gestion Signalements',
    systemSettings: 'Configuration',
    schemaDocs: 'Schéma BD & API REST',
    approve: 'Valider',
    reject: 'Refuser',
    featureAd: 'Mettre en avant',
    unfeatureAd: 'Retirer mise en avant',
    banUser: 'Bannir',
    unbanUser: 'Débannir',
    makeAdmin: 'Promouvoir Admin',
    removeAdmin: 'Rétrograder',
    saveSettings: 'Enregistrer',
    autoApproveListings: 'Validation automatique des annonces',
    adExpiryDays: "Durée de validité (jours)",
    maxPhotosAllowed: "Photos max par annonce",
    
    cancel: 'Annuler',
    confirm: 'Confirmer',
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...',
    currencyUnit: 'SAR',
  },
};

type TranslationKey = keyof typeof translations['ar'];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: async () => {},
  t: (key) => key,
  isRTL: true,
});

const LANGUAGE_KEY = '@souqplus_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('ar');

  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLang === 'ar' || savedLang === 'en' || savedLang === 'fr') {
          setLanguageState(savedLang);
        }
      } catch (e) {
        console.warn('Error loading language', e);
      }
    })();
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    try {
      setLanguageState(newLang);
      await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
    } catch (e) {
      console.warn('Error saving language', e);
    }
  };

  const isRTL = language === 'ar';

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.ar;
    let str = dict[key] || translations.ar[key] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        str = str.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
