export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  rating: number;
  adsCount: number;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  city: string;
  verified: boolean;
  memberSince: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  icon: string;
  slug: string;
  order: number;
  subcategories: Subcategory[];
}

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ListingStatus = 'published' | 'pending' | 'draft' | 'rejected' | 'expired' | 'paused';

export interface Listing {
  id: string;
  userId: string;
  user: UserSummary;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  price: number;
  currency: string;
  city: string;
  area: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  showPhone: boolean;
  images: string[];
  condition: ListingCondition;
  status: ListingStatus;
  isFeatured: boolean;
  viewsCount: number;
  rejectionReason?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingCurrency: string;
  listingImage: string;
  participants: string[]; // [buyerId, sellerId]
  buyerId: string;
  sellerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'message'
  | 'ad_approved'
  | 'ad_rejected'
  | 'price_drop'
  | 'expired'
  | 'admin_alert';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  relatedId?: string; // listingId or chatId
  isRead: boolean;
  createdAt: string;
}

export type ReportStatus = 'new' | 'under_review' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  listingId?: string;
  listingTitle?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  currency: string;
  defaultExpiryDays: number;
  requireAdminApproval: boolean;
  maxPhotosPerListing: number;
  contactEmail: string;
  termsUrl: string;
  privacyUrl: string;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'views_desc';

export interface FilterOptions {
  keyword?: string;
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  condition?: ListingCondition;
  sortBy?: SortOption;
  onlyFeatured?: boolean;
}
