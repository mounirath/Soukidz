import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Listing,
  Category,
  Chat,
  Message,
  AppNotification,
  Report,
  AppSettings,
  FilterOptions,
  ListingStatus,
} from '../types';

const STORAGE_KEYS = {
  USERS: '@souqplus_db_users',
  CATEGORIES: '@souqplus_db_categories',
  LISTINGS: '@souqplus_db_listings',
  FAVORITES: '@souqplus_db_favorites',
  CHATS: '@souqplus_db_chats',
  MESSAGES: '@souqplus_db_messages',
  NOTIFICATIONS: '@souqplus_db_notifications',
  REPORTS: '@souqplus_db_reports',
  SETTINGS: '@souqplus_db_settings',
  INITIALIZED: '@souqplus_db_initialized_v2',
};

// Default Settings
const defaultSettings: AppSettings = {
  appName: 'سوق بلس | SouqPlus',
  currency: 'ر.س',
  defaultExpiryDays: 30,
  requireAdminApproval: false, // Default instant publish, admin can toggle
  maxPhotosPerListing: 8,
  contactEmail: 'support@souqplus.app',
  termsUrl: 'https://souqplus.app/terms',
  privacyUrl: 'https://souqplus.app/privacy',
};

// Seed Users
const seedUsers: User[] = [
  {
    id: 'user_admin',
    email: 'admin@souqplus.com',
    name: 'عبدالله المشرف (مدير النظام)',
    phone: '+966501234567',
    city: 'الرياض',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    rating: 5.0,
    adsCount: 4,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user_1',
    email: 'tariq@gmail.com',
    name: 'طارق المنصور',
    phone: '+966555123987',
    city: 'جدة',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    status: 'active',
    emailVerified: true,
    rating: 4.8,
    adsCount: 5,
    createdAt: '2026-02-15T10:30:00Z',
  },
  {
    id: 'user_2',
    email: 'sarah.ahmed@hotmail.com',
    name: 'سارة أحمد التميمي',
    phone: '+966567890123',
    city: 'الرياض',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    status: 'active',
    emailVerified: true,
    rating: 4.9,
    adsCount: 3,
    createdAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'user_3',
    email: 'omar.k@yahoo.com',
    name: 'عمر خالد الدوسري',
    phone: '+966544987654',
    city: 'الدمام',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    status: 'active',
    emailVerified: true,
    rating: 4.6,
    adsCount: 2,
    createdAt: '2026-04-12T09:15:00Z',
  },
];

// Seed Categories
const seedCategories: Category[] = [
  {
    id: 'cat_cars',
    nameAr: 'سيارات ومركبات',
    nameEn: 'Cars & Vehicles',
    nameFr: 'Véhicules',
    icon: 'car-sport-outline',
    slug: 'cars',
    order: 1,
    subcategories: [
      { id: 'sub_cars_sale', categoryId: 'cat_cars', nameAr: 'سيارات للبيع', nameEn: 'Cars for Sale', nameFr: 'Voitures à vendre' },
      { id: 'sub_cars_suv', categoryId: 'cat_cars', nameAr: 'دفع رباعي وعائلية', nameEn: 'SUVs & 4x4', nameFr: 'SUV & 4x4' },
      { id: 'sub_cars_motorcycles', categoryId: 'cat_cars', nameAr: 'دراجات نارية', nameEn: 'Motorcycles', nameFr: 'Motos' },
      { id: 'sub_cars_parts', categoryId: 'cat_cars', nameAr: 'قطع غيار وإكسسوارات', nameEn: 'Parts & Accessories', nameFr: 'Pièces de rechange' },
      { id: 'sub_cars_plates', categoryId: 'cat_cars', nameAr: 'لوحات مميزة', nameEn: 'Special Plates', nameFr: 'Plaques spéciales' },
    ],
  },
  {
    id: 'cat_realestate',
    nameAr: 'عقارات',
    nameEn: 'Real Estate',
    nameFr: 'Immobilier',
    icon: 'business-outline',
    slug: 'real-estate',
    order: 2,
    subcategories: [
      { id: 'sub_re_apt_rent', categoryId: 'cat_realestate', nameAr: 'شقق للإيجار', nameEn: 'Apartments for Rent', nameFr: 'Appartements à louer' },
      { id: 'sub_re_apt_sale', categoryId: 'cat_realestate', nameAr: 'شقق للبيع', nameEn: 'Apartments for Sale', nameFr: 'Appartements à vendre' },
      { id: 'sub_re_villas', categoryId: 'cat_realestate', nameAr: 'فلل وقصور', nameEn: 'Villas & Mansions', nameFr: 'Villas' },
      { id: 'sub_re_lands', categoryId: 'cat_realestate', nameAr: 'أراضي ومزارع', nameEn: 'Lands & Farms', nameFr: 'Terrains' },
      { id: 'sub_re_commercial', categoryId: 'cat_realestate', nameAr: 'محلات ومكاتب', nameEn: 'Commercial & Offices', nameFr: 'Bureaux & Commerces' },
    ],
  },
  {
    id: 'cat_electronics',
    nameAr: 'أجهزة وهواتف',
    nameEn: 'Electronics & Phones',
    nameFr: 'Électronique & Téléphones',
    icon: 'phone-portrait-outline',
    slug: 'electronics',
    order: 3,
    subcategories: [
      { id: 'sub_elec_phones', categoryId: 'cat_electronics', nameAr: 'هواتف ذكية', nameEn: 'Smartphones', nameFr: 'Smartphones' },
      { id: 'sub_elec_laptops', categoryId: 'cat_electronics', nameAr: 'لابتوب وكمبيوتر', nameEn: 'Laptops & PCs', nameFr: 'Ordinateurs' },
      { id: 'sub_elec_tvs', categoryId: 'cat_electronics', nameAr: 'شاشات وتلفزيونات', nameEn: 'TVs & Screens', nameFr: 'Téléviseurs' },
      { id: 'sub_elec_gaming', categoryId: 'cat_electronics', nameAr: 'ألعاب فيديو وأجهزة', nameEn: 'Gaming Consoles', nameFr: 'Jeux vidéo' },
      { id: 'sub_elec_cameras', categoryId: 'cat_electronics', nameAr: 'كاميرات وتصوير', nameEn: 'Cameras', nameFr: 'Appareils photo' },
    ],
  },
  {
    id: 'cat_furniture',
    nameAr: 'أثاث وديكور',
    nameEn: 'Furniture & Decor',
    nameFr: 'Meubles & Décoration',
    icon: 'bed-outline',
    slug: 'furniture',
    order: 4,
    subcategories: [
      { id: 'sub_fur_living', categoryId: 'cat_furniture', nameAr: 'كنب ومجالس', nameEn: 'Living Room & Sofas', nameFr: 'Salons & Canapés' },
      { id: 'sub_fur_bedroom', categoryId: 'cat_furniture', nameAr: 'غرف نوم وأسرّة', nameEn: 'Bedrooms & Beds', nameFr: 'Chambres à coucher' },
      { id: 'sub_fur_kitchen', categoryId: 'cat_furniture', nameAr: 'أجهزة ومطابخ', nameEn: 'Kitchen & Appliances', nameFr: 'Cuisines & Électroménager' },
      { id: 'sub_fur_decor', categoryId: 'cat_furniture', nameAr: 'سجاد وديكورات', nameEn: 'Rugs & Decor', nameFr: 'Tapis & Décoration' },
    ],
  },
  {
    id: 'cat_fashion',
    nameAr: 'أزياء وموضة',
    nameEn: 'Fashion & Watches',
    nameFr: 'Mode & Montres',
    icon: 'shirt-outline',
    slug: 'fashion',
    order: 5,
    subcategories: [
      { id: 'sub_fash_watches', categoryId: 'cat_fashion', nameAr: 'ساعات فاخرة', nameEn: 'Luxury Watches', nameFr: 'Montres' },
      { id: 'sub_fash_men', categoryId: 'cat_fashion', nameAr: 'ملابس رجالية', nameEn: "Men's Clothing", nameFr: 'Vêtements Homme' },
      { id: 'sub_fash_women', categoryId: 'cat_fashion', nameAr: 'ملابس وحقائب نسائية', nameEn: "Women's Fashion", nameFr: 'Mode Femme' },
      { id: 'sub_fash_perfumes', categoryId: 'cat_fashion', nameAr: 'عطور وبخور', nameEn: 'Perfumes & Oud', nameFr: 'Parfums' },
    ],
  },
  {
    id: 'cat_services',
    nameAr: 'خدمات وأعمال',
    nameEn: 'Services & Work',
    nameFr: 'Services',
    icon: 'briefcase-outline',
    slug: 'services',
    order: 6,
    subcategories: [
      { id: 'sub_serv_moving', categoryId: 'cat_services', nameAr: 'نقل عفش وشحن', nameEn: 'Moving & Transport', nameFr: 'Déménagement' },
      { id: 'sub_serv_maintenance', categoryId: 'cat_services', nameAr: 'صيانة منزلية ومقاولات', nameEn: 'Home Maintenance', nameFr: 'Maintenance' },
      { id: 'sub_serv_tech', categoryId: 'cat_services', nameAr: 'برمجة وتصميم', nameEn: 'Tech & Design', nameFr: 'Tech & Design' },
    ],
  },
  {
    id: 'cat_jobs',
    nameAr: 'وظائف وتوظيف',
    nameEn: 'Jobs & Careers',
    nameFr: 'Emplois',
    icon: 'people-outline',
    slug: 'jobs',
    order: 7,
    subcategories: [
      { id: 'sub_job_tech', categoryId: 'cat_jobs', nameAr: 'تقنية المعلومات', nameEn: 'IT & Software', nameFr: 'Informatique' },
      { id: 'sub_job_sales', categoryId: 'cat_jobs', nameAr: 'مبيعات وتسويق', nameEn: 'Sales & Marketing', nameFr: 'Vente & Marketing' },
      { id: 'sub_job_admin', categoryId: 'cat_jobs', nameAr: 'وظائف إدارية', nameEn: 'Administration', nameFr: 'Administration' },
    ],
  },
  {
    id: 'cat_pets',
    nameAr: 'حيوانات وطيور',
    nameEn: 'Pets & Animals',
    nameFr: 'Animaux',
    icon: 'paw-outline',
    slug: 'pets',
    order: 8,
    subcategories: [
      { id: 'sub_pet_cats', categoryId: 'cat_pets', nameAr: 'قطط منزلية', nameEn: 'Cats & Kittens', nameFr: 'Chats' },
      { id: 'sub_pet_birds', categoryId: 'cat_pets', nameAr: 'طيور وببغاوات', nameEn: 'Birds & Parrots', nameFr: 'Oiseaux' },
      { id: 'sub_pet_horses', categoryId: 'cat_pets', nameAr: 'خيول ومواشي', nameEn: 'Horses & Livestock', nameFr: 'Chevaux' },
    ],
  },
];

// Seed Listings
const seedListings: Listing[] = [
  {
    id: 'listing_1',
    userId: 'user_1',
    user: {
      id: 'user_1',
      name: 'طارق المنصور',
      phone: '+966555123987',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      city: 'جدة',
      verified: true,
      memberSince: '2026-02-15',
    },
    title: 'تويوتا لاندكروزر VXR 2024 فل كامل وارد الساير بحالة الوكالة',
    description: 'سيارة تويوتا لاندكروزر VXR موديل 2024، محرك توين تيربو 3.5 لتر. العداد 12,000 كم فقط. مواصفات كاملة: فتحة سقف، جلد طبيعي، تبريد وتسخين مقاعد، رادار وتحديد مسار، شاشات خلفية، كاميرات 360 درجة. صيانة دورية بالوكالة مع حماية بدي كامل وعازل حراري أصلي.',
    categoryId: 'cat_cars',
    subcategoryId: 'sub_cars_suv',
    price: 365000,
    currency: 'ر.س',
    city: 'الرياض',
    area: 'حي الملقا',
    coordinates: { latitude: 24.8138, longitude: 46.6214 },
    phone: '+966555123987',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'like_new',
    status: 'published',
    isFeatured: true,
    viewsCount: 1420,
    createdAt: '2026-09-18T14:20:00Z',
    expiresAt: '2026-10-18T14:20:00Z',
  },
  {
    id: 'listing_2',
    userId: 'user_2',
    user: {
      id: 'user_2',
      name: 'سارة أحمد التميمي',
      phone: '+966567890123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      city: 'الرياض',
      verified: true,
      memberSince: '2026-03-01',
    },
    title: 'فيلا مودرن فاخرة للبيع في حي الياسمين مع مسبح ومصعد',
    description: 'فيلا مودرن جديدة تشطيب سوبر ديلوكس، مساحة 450 م². تتكون من دورين وملحق: 5 غرف نوم ماستر، مجلس واسع للرجال، صالة عائلية مفتوحة مع إطلالة على المسبح والحديقة، مطبخ داخلي وخارجي مجهز، غرفة خادمة وغرفة سائق، تكييف مركزي ومصعد إيطالي مع ضمانات شاملة على الهيكل والسباكة والكهرباء.',
    categoryId: 'cat_realestate',
    subcategoryId: 'sub_re_villas',
    price: 3200000,
    currency: 'ر.س',
    city: 'الرياض',
    area: 'حي الياسمين',
    coordinates: { latitude: 24.8354, longitude: 46.6578 },
    phone: '+966567890123',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'new',
    status: 'published',
    isFeatured: true,
    viewsCount: 2890,
    createdAt: '2026-09-19T09:10:00Z',
    expiresAt: '2026-10-19T09:10:00Z',
  },
  {
    id: 'listing_3',
    userId: 'user_3',
    user: {
      id: 'user_3',
      name: 'عمر خالد الدوسري',
      phone: '+966544987654',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      rating: 4.6,
      city: 'الدمام',
      verified: true,
      memberSince: '2026-04-12',
    },
    title: 'آيفون 16 برو ماكس سعة 512 جيجابايت تيتانيوم صحراوي جديد بالكرتون',
    description: 'جهاز Apple iPhone 16 Pro Max سعة 512 جيجابايت لون Desert Titanium جديد بتغليف المصنع لم يفتح. نسخة الشرق الأوسط تدعم شريحتين (Nano-SIM + eSIM) وضمان حاسبات العرب سنتين. البيع يد بيد في الخبر أو الدمام.',
    categoryId: 'cat_electronics',
    subcategoryId: 'sub_elec_phones',
    price: 5400,
    currency: 'ر.س',
    city: 'الدمام',
    area: 'حي الشاطئ',
    coordinates: { latitude: 26.4385, longitude: 50.1132 },
    phone: '+966544987654',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'new',
    status: 'published',
    isFeatured: true,
    viewsCount: 840,
    createdAt: '2026-09-20T11:45:00Z',
    expiresAt: '2026-10-20T11:45:00Z',
  },
  {
    id: 'listing_4',
    userId: 'user_admin',
    user: {
      id: 'user_admin',
      name: 'عبدالله المشرف',
      phone: '+966501234567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: 5.0,
      city: 'الرياض',
      verified: true,
      memberSince: '2026-01-10',
    },
    title: 'ساعة رولكس صبمارينر ديت أصلية مع الصندوق والأوراق الرسمية',
    description: 'Rolex Submariner Date سيراميك أسود موديل 126610LN. الحالة ممتازة جداً ونادرة الاستخدام. كاملة بكافة ملحقاتها الأصلية من البوكس الأخضر والبطاقة والكتيبات وفاتورة الشراء. إمكانية الفحص في أي وكيل معتمد.',
    categoryId: 'cat_fashion',
    subcategoryId: 'sub_fash_watches',
    price: 49500,
    currency: 'ر.س',
    city: 'جدة',
    area: 'حي الروضة',
    coordinates: { latitude: 21.5721, longitude: 39.1642 },
    phone: '+966501234567',
    showPhone: false,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'like_new',
    status: 'published',
    isFeatured: false,
    viewsCount: 610,
    createdAt: '2026-09-21T08:30:00Z',
    expiresAt: '2026-10-21T08:30:00Z',
  },
  {
    id: 'listing_5',
    userId: 'user_2',
    user: {
      id: 'user_2',
      name: 'سارة أحمد التميمي',
      phone: '+966567890123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      city: 'الرياض',
      verified: true,
      memberSince: '2026-03-01',
    },
    title: 'طقم كنب تركي فاخر مودرن يتسع لـ 9 أشخاص بحالة الجديد',
    description: 'طقم كنب تركي راقي جداً من معرض مفروشات فخم، قماش مخمل ضد البقع ولون رمادي هادئ مع مخدات مطرزة وطاولة قهوة من خشب الجوز الطبيعي. استخدام بسيط ونظيف جداً في مجلس ضيوف نادر الاستخدام.',
    categoryId: 'cat_furniture',
    subcategoryId: 'sub_fur_living',
    price: 4800,
    currency: 'ر.س',
    city: 'الرياض',
    area: 'حي النرجس',
    coordinates: { latitude: 24.8624, longitude: 46.6892 },
    phone: '+966567890123',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'good',
    status: 'published',
    isFeatured: false,
    viewsCount: 420,
    createdAt: '2026-09-21T16:00:00Z',
    expiresAt: '2026-10-21T16:00:00Z',
  },
  {
    id: 'listing_6',
    userId: 'user_1',
    user: {
      id: 'user_1',
      name: 'طارق المنصور',
      phone: '+966555123987',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      city: 'جدة',
      verified: true,
      memberSince: '2026-02-15',
    },
    title: 'ماك بوك برو 16 إنش شريحة M3 Max ذاكرة 36GB تخزين 1TB',
    description: 'MacBook Pro 16 Inch مع معالج Apple M3 Max الخارق، 36 جيجا رام موحدة وسعة 1 تيرا SSD. كيبورد عربي وإنجليزي إضاءة خلفية، نسبة البطارية 99% مع عدد دورات شحن قليلة جداً. نظيف تماماً وخالي من أي خدوش مع الشاحن الأصلي بقوة 140 واط.',
    categoryId: 'cat_electronics',
    subcategoryId: 'sub_elec_laptops',
    price: 11200,
    currency: 'ر.س',
    city: 'جدة',
    area: 'حي الشاطئ',
    coordinates: { latitude: 21.6035, longitude: 39.1124 },
    phone: '+966555123987',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'like_new',
    status: 'published',
    isFeatured: false,
    viewsCount: 760,
    createdAt: '2026-09-22T05:20:00Z',
    expiresAt: '2026-10-22T05:20:00Z',
  },
  {
    id: 'listing_7',
    userId: 'user_3',
    user: {
      id: 'user_3',
      name: 'عمر خالد الدوسري',
      phone: '+966544987654',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      rating: 4.6,
      city: 'الدمام',
      verified: true,
      memberSince: '2026-04-12',
    },
    title: 'قطة شيرازي بيور هيمالايا عيون زرقاء مطعمة مع دفتر صحي',
    description: 'قطة أنثى هيمالايا بلو بوينت عمر 3 أشهر، شعر كثيف ومطيعة جداً ومدربة على الليتر بوكس. حاصلة على التطعيمات الأساسية بالعيادة البيطرية ومرفق معها جميع مستلزماتها والقفص واللعب.',
    categoryId: 'cat_pets',
    subcategoryId: 'sub_pet_cats',
    price: 1500,
    currency: 'ر.س',
    city: 'الدمام',
    area: 'حي المزروعية',
    coordinates: { latitude: 26.4421, longitude: 50.1012 },
    phone: '+966544987654',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'new',
    status: 'published',
    isFeatured: false,
    viewsCount: 390,
    createdAt: '2026-09-22T07:10:00Z',
    expiresAt: '2026-10-22T07:10:00Z',
  },
  {
    id: 'listing_8',
    userId: 'user_1',
    user: {
      id: 'user_1',
      name: 'طارق المنصور',
      phone: '+966555123987',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      city: 'جدة',
      verified: true,
      memberSince: '2026-02-15',
    },
    title: 'شقة مفروشة راقية للإيجار الشهري والسنوي مطلة على البحر',
    description: 'شقة مؤثثة بالكامل أثاث فندقي حديث في برج سكني راقٍ بكورنيش جدة. غرفتي نوم وصالة واسعة ومطبخ أمريكي مجهز، نادي صحي ومسبح وموقف خاص للسيارة وخدمة حراسة 24 ساعة.',
    categoryId: 'cat_realestate',
    subcategoryId: 'sub_re_apt_rent',
    price: 8500,
    currency: 'ر.س',
    city: 'جدة',
    area: 'حي الكورنيش',
    coordinates: { latitude: 21.5234, longitude: 39.1567 },
    phone: '+966555123987',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'like_new',
    status: 'published',
    isFeatured: false,
    viewsCount: 512,
    createdAt: '2026-09-21T21:00:00Z',
    expiresAt: '2026-10-21T21:00:00Z',
  },
  {
    id: 'listing_pending_demo',
    userId: 'user_2',
    user: {
      id: 'user_2',
      name: 'سارة أحمد التميمي',
      phone: '+966567890123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      city: 'الرياض',
      verified: true,
      memberSince: '2026-03-01',
    },
    title: 'طاولة طعام إيطالية رخام طبيعي تتسع لـ 8 مقاعد',
    description: 'طاولة طعام رخام كركار أبيض مستورد من إيطاليا مع 8 كراسي خشب زان مبطنة بجلد فاخر.',
    categoryId: 'cat_furniture',
    subcategoryId: 'sub_fur_kitchen',
    price: 6500,
    currency: 'ر.س',
    city: 'الرياض',
    area: 'حي حطين',
    coordinates: { latitude: 24.7745, longitude: 46.6023 },
    phone: '+966567890123',
    showPhone: true,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    ],
    condition: 'like_new',
    status: 'pending',
    isFeatured: false,
    viewsCount: 15,
    createdAt: '2026-09-22T08:00:00Z',
    expiresAt: '2026-10-22T08:00:00Z',
  },
];

// Seed Chats & Messages
const seedChats: Chat[] = [
  {
    id: 'chat_1',
    listingId: 'listing_1',
    listingTitle: 'تويوتا لاندكروزر VXR 2024 فل كامل',
    listingPrice: 365000,
    listingCurrency: 'ر.س',
    listingImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    participants: ['user_admin', 'user_1'],
    buyerId: 'user_admin',
    sellerId: 'user_1',
    buyerName: 'عبدالله المشرف',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sellerName: 'طارق المنصور',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'مرحباً، هل السعر قابل للتفاوض البسيط بعد المعاينة؟',
    lastMessageTime: '2026-09-22T08:15:00Z',
    unreadCountBuyer: 0,
    unreadCountSeller: 1,
    updatedAt: '2026-09-22T08:15:00Z',
  },
  {
    id: 'chat_2',
    listingId: 'listing_3',
    listingTitle: 'آيفون 16 برو ماكس سعة 512 جيجابايت',
    listingPrice: 5400,
    listingCurrency: 'ر.س',
    listingImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    participants: ['user_admin', 'user_3'],
    buyerId: 'user_admin',
    sellerId: 'user_3',
    buyerName: 'عبدالله المشرف',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sellerName: 'عمر خالد الدوسري',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'أهلاً بك، الجهاز متوفر ومعه الفاتورة والضمان الأصلي.',
    lastMessageTime: '2026-09-21T19:30:00Z',
    unreadCountBuyer: 1,
    unreadCountSeller: 0,
    updatedAt: '2026-09-21T19:30:00Z',
  },
];

const seedMessages: Message[] = [
  {
    id: 'msg_1',
    chatId: 'chat_1',
    senderId: 'user_admin',
    text: 'السلام عليكم ورحمة الله، بخصوص اللاندكروزر المعروض هل الموتر مفحوص بالكامل؟',
    isRead: true,
    createdAt: '2026-09-22T08:10:00Z',
  },
  {
    id: 'msg_2',
    chatId: 'chat_1',
    senderId: 'user_1',
    text: 'وعليكم السلام ورحمة الله، نعم يا غالي الموتر مشروط بدي ومحركات بالوكالة وجاهز للفحص في أي مكان تفضله.',
    isRead: true,
    createdAt: '2026-09-22T08:12:00Z',
  },
  {
    id: 'msg_3',
    chatId: 'chat_1',
    senderId: 'user_admin',
    text: 'مرحباً، هل السعر قابل للتفاوض البسيط بعد المعاينة؟',
    isRead: false,
    createdAt: '2026-09-22T08:15:00Z',
  },
  {
    id: 'msg_4',
    chatId: 'chat_2',
    senderId: 'user_admin',
    text: 'السلام عليكم، هل الآيفون نسخة رسمية سعودية؟',
    isRead: true,
    createdAt: '2026-09-21T19:25:00Z',
  },
  {
    id: 'msg_5',
    chatId: 'chat_2',
    senderId: 'user_3',
    text: 'أهلاً بك، الجهاز متوفر ومعه الفاتورة والضمان الأصلي.',
    isRead: false,
    createdAt: '2026-09-21T19:30:00Z',
  },
];

// Seed Notifications
const seedNotifications: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_admin',
    title: 'رسالة جديدة',
    body: 'وصلتك رسالة جديدة من عمر خالد الدوسري بخصوص إعلان "آيفون 16 برو ماكس"',
    type: 'message',
    relatedId: 'chat_2',
    isRead: false,
    createdAt: '2026-09-22T08:20:00Z',
  },
  {
    id: 'notif_2',
    userId: 'user_admin',
    title: 'تمت الموافقة على إعلانك',
    body: 'تهانينا! تمت الموافقة ونشر إعلانك "ساعة رولكس صبمارينر ديت" بنجاح.',
    type: 'ad_approved',
    relatedId: 'listing_4',
    isRead: true,
    createdAt: '2026-09-21T09:00:00Z',
  },
  {
    id: 'notif_3',
    userId: 'user_admin',
    title: 'تنبيه النظام الإداري',
    body: 'يوجد إعلان جديد في انتظار المراجعة والموافقة: "طاولة طعام إيطالية رخام"',
    type: 'admin_alert',
    relatedId: 'listing_pending_demo',
    isRead: false,
    createdAt: '2026-09-22T08:02:00Z',
  },
];

// Seed Reports
const seedReports: Report[] = [
  {
    id: 'rep_1',
    listingId: 'listing_pending_demo',
    listingTitle: 'طاولة طعام إيطالية رخام طبيعي',
    reportedUserId: 'user_2',
    reportedUserName: 'سارة أحمد التميمي',
    reporterId: 'user_3',
    reporterName: 'عمر خالد الدوسري',
    reason: 'معلومات غير دقيقة أو مضللة',
    details: 'أرجو التحقق من سعر الشحن والتوصيل المذكور داخل الوصف.',
    status: 'new',
    createdAt: '2026-09-22T08:05:00Z',
  },
];

class DatabaseService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const alreadyInitialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!alreadyInitialized) {
        await this.resetToDefaults();
      }
      this.initialized = true;
    } catch (e) {
      console.error('Failed to init database', e);
    }
  }

  async resetToDefaults(): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USERS, JSON.stringify(seedUsers)],
      [STORAGE_KEYS.CATEGORIES, JSON.stringify(seedCategories)],
      [STORAGE_KEYS.LISTINGS, JSON.stringify(seedListings)],
      [STORAGE_KEYS.FAVORITES, JSON.stringify(['listing_1', 'listing_2'])],
      [STORAGE_KEYS.CHATS, JSON.stringify(seedChats)],
      [STORAGE_KEYS.MESSAGES, JSON.stringify(seedMessages)],
      [STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seedNotifications)],
      [STORAGE_KEYS.REPORTS, JSON.stringify(seedReports)],
      [STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings)],
      [STORAGE_KEYS.INITIALIZED, 'true'],
    ]);
  }

  // --- SETTINGS ---
  async getSettings(): Promise<AppSettings> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : seedUsers;
    } catch {
      return seedUsers;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'status' | 'emailVerified' | 'rating' | 'adsCount'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      status: 'active',
      emailVerified: true,
      rating: 5.0,
      adsCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return true;
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : seedCategories;
    } catch {
      return seedCategories;
    }
  }

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      ...categoryData,
      id: `cat_${Date.now()}`,
      subcategories: categoryData.subcategories || [],
    };
    categories.push(newCategory);
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    return true;
  }

  // --- LISTINGS ---
  async getListings(filters?: FilterOptions): Promise<Listing[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LISTINGS);
      let listings: Listing[] = data ? JSON.parse(data) : seedListings;

      // Check for expired listings and update status
      const now = new Date();
      let hasExpiryChanges = false;
      listings = listings.map((l) => {
        if (l.status === 'published' && new Date(l.expiresAt) < now) {
          hasExpiryChanges = true;
          return { ...l, status: 'expired' as ListingStatus };
        }
        return l;
      });
      if (hasExpiryChanges) {
        await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
      }

      if (!filters) return listings;

      // Filter
      return listings.filter((l) => {
        if (filters.keyword) {
          const kw = filters.keyword.toLowerCase();
          const matchTitle = l.title.toLowerCase().includes(kw);
          const matchDesc = l.description.toLowerCase().includes(kw);
          const matchCity = l.city.toLowerCase().includes(kw);
          const matchArea = l.area.toLowerCase().includes(kw);
          if (!matchTitle && !matchDesc && !matchCity && !matchArea) return false;
        }
        if (filters.categoryId && l.categoryId !== filters.categoryId) {
          return false;
        }
        if (filters.subcategoryId && l.subcategoryId !== filters.subcategoryId) {
          return false;
        }
        if (filters.city && filters.city !== 'all' && l.city !== filters.city) {
          return false;
        }
        if (filters.condition && l.condition !== filters.condition) {
          return false;
        }
        if (filters.minPrice !== undefined && l.price < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined && l.price > filters.maxPrice) {
          return false;
        }
        if (filters.onlyFeatured && !l.isFeatured) {
          return false;
        }
        return true;
      }).sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        if (filters.sortBy === 'views_desc') return b.viewsCount - a.viewsCount;
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch {
      return seedListings;
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    const listings = await this.getListings();
    return listings.find((l) => l.id === id) || null;
  }

  async createListing(listingData: Omit<Listing, 'id' | 'viewsCount' | 'createdAt' | 'expiresAt'>): Promise<Listing> {
    const listings = await this.getListings();
    const settings = await this.getSettings();
    const now = new Date();
    const expiry = new Date(now.getTime() + settings.defaultExpiryDays * 24 * 60 * 60 * 1000);

    const newListing: Listing = {
      ...listingData,
      id: `listing_${Date.now()}`,
      status: settings.requireAdminApproval ? 'pending' : (listingData.status || 'published'),
      viewsCount: 0,
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
    };

    listings.unshift(newListing);
    await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));

    // Increment user ads count
    const user = await this.getUserById(listingData.userId);
    if (user) {
      await this.updateUser(user.id, { adsCount: (user.adsCount || 0) + 1 });
    }

    // If pending, notify admin
    if (newListing.status === 'pending') {
      await this.createNotification({
        userId: 'user_admin',
        title: 'إعلان جديد بانتظار المراجعة',
        body: `قام ${newListing.user.name} بإضافة إعلان "${newListing.title}"`,
        type: 'admin_alert',
        relatedId: newListing.id,
      });
    }

    return newListing;
  }

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    const listings = await this.getListings();
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return null;
    listings[index] = { ...listings[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    return listings[index];
  }

  async deleteListing(id: string): Promise<boolean> {
    const listings = await this.getListings();
    const filtered = listings.filter((l) => l.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(filtered));
    return true;
  }

  async incrementViews(id: string): Promise<void> {
    const listings = await this.getListings();
    const index = listings.findIndex((l) => l.id === id);
    if (index !== -1) {
      listings[index].viewsCount = (listings[index].viewsCount || 0) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    }
  }

  async extendListing(id: string, days = 30): Promise<Listing | null> {
    const listing = await this.getListingById(id);
    if (!listing) return null;
    const baseDate = new Date(listing.expiresAt) > new Date() ? new Date(listing.expiresAt) : new Date();
    const newExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    return this.updateListing(id, { expiresAt: newExpiresAt, status: 'published' });
  }

  // --- FAVORITES ---
  async getFavoriteIds(): Promise<string[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async toggleFavorite(listingId: string): Promise<boolean> {
    const favorites = await this.getFavoriteIds();
    const exists = favorites.includes(listingId);
    let updated: string[];
    if (exists) {
      updated = favorites.filter((id) => id !== listingId);
    } else {
      updated = [...favorites, listingId];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return !exists; // returns true if now favorited
  }

  async isFavorite(listingId: string): Promise<boolean> {
    const favorites = await this.getFavoriteIds();
    return favorites.includes(listingId);
  }

  // --- CHATS & MESSAGES ---
  async getChatsForUser(userId: string): Promise<Chat[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
      const chats: Chat[] = data ? JSON.parse(data) : seedChats;
      return chats.filter((c) => c.participants.includes(userId))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
      const chats: Chat[] = data ? JSON.parse(data) : seedChats;
      return chats.find((c) => c.id === chatId) || null;
    } catch {
      return null;
    }
  }

  async createOrGetChat(
    listing: Listing,
    buyer: User,
  ): Promise<Chat> {
    await this.init();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    const chats: Chat[] = data ? JSON.parse(data) : seedChats;

    // Check if chat already exists for this listing and buyer
    const existing = chats.find(
      (c) => c.listingId === listing.id && c.buyerId === buyer.id
    );
    if (existing) return existing;

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingCurrency: listing.currency,
      listingImage: listing.images[0] || '',
      participants: [buyer.id, listing.userId],
      buyerId: buyer.id,
      sellerId: listing.userId,
      buyerName: buyer.name,
      buyerAvatar: buyer.avatar,
      sellerName: listing.user.name,
      sellerAvatar: listing.user.avatar,
      lastMessage: 'مرحباً، أنا مهتم بهذا الإعلان.',
      lastMessageTime: new Date().toISOString(),
      unreadCountBuyer: 0,
      unreadCountSeller: 1,
      updatedAt: new Date().toISOString(),
    };

    chats.unshift(newChat);
    await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));

    // Create opening message
    await this.sendMessage(newChat.id, buyer.id, 'مرحباً، أنا مهتم بهذا الإعلان.');
    return newChat;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      const messages: Message[] = data ? JSON.parse(data) : seedMessages;
      return messages
        .filter((m) => m.chatId === chatId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch {
      return [];
    }
  }

  async sendMessage(chatId: string, senderId: string, text: string, imageUrl?: string): Promise<Message> {
    await this.init();
    const msgData = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = msgData ? JSON.parse(msgData) : seedMessages;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId,
      text,
      imageUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    // Update Chat last message
    const chatData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    const chats: Chat[] = chatData ? JSON.parse(chatData) : seedChats;
    const chatIndex = chats.findIndex((c) => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = text || 'صورة مرفقة';
      chats[chatIndex].lastMessageTime = newMessage.createdAt;
      chats[chatIndex].updatedAt = newMessage.createdAt;
      if (senderId === chats[chatIndex].buyerId) {
        chats[chatIndex].unreadCountSeller += 1;
      } else {
        chats[chatIndex].unreadCountBuyer += 1;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    }

    return newMessage;
  }

  async markChatRead(chatId: string, userId: string): Promise<void> {
    const chatData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    const chats: Chat[] = chatData ? JSON.parse(chatData) : seedChats;
    const chatIndex = chats.findIndex((c) => c.id === chatId);
    if (chatIndex !== -1) {
      if (userId === chats[chatIndex].buyerId) {
        chats[chatIndex].unreadCountBuyer = 0;
      } else {
        chats[chatIndex].unreadCountSeller = 0;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    }
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<AppNotification[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const notifs: AppNotification[] = data ? JSON.parse(data) : seedNotifications;
      return notifs
        .filter((n) => n.userId === userId || n.userId === 'all')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  async createNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<AppNotification> {
    await this.init();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = data ? JSON.parse(data) : seedNotifications;

    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  }

  async markNotificationRead(id: string): Promise<void> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = data ? JSON.parse(data) : seedNotifications;
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = data ? JSON.parse(data) : seedNotifications;
    notifs.forEach((n) => {
      if (n.userId === userId || n.userId === 'all') n.isRead = true;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // --- REPORTS ---
  async getReports(): Promise<Report[]> {
    await this.init();
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : seedReports;
    } catch {
      return seedReports;
    }
  }

  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> {
    await this.init();
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports: Report[] = data ? JSON.parse(data) : seedReports;

    const newReport: Report = {
      ...reportData,
      id: `rep_${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Alert Admin
    await this.createNotification({
      userId: 'user_admin',
      title: 'بلاغ جديد عن مخالفة',
      body: `تم الإبلاغ عن "${reportData.listingTitle || 'محتوى'}" بواسطة ${reportData.reporterName}`,
      type: 'admin_alert',
      relatedId: newReport.id,
    });

    return newReport;
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<Report | null> {
    const reports = await this.getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;
    reports[index].status = status;
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return reports[index];
  }
}

export const db = new DatabaseService();
