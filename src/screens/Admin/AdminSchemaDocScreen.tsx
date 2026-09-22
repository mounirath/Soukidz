import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

interface AdminSchemaDocScreenProps {
  onBack: () => void;
}

export const AdminSchemaDocScreen: React.FC<AdminSchemaDocScreenProps> = ({ onBack }) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sql' | 'api' | 'deploy'>('sql');

  const sqlSchemaCode = `-- ==========================================
-- SOUQ PLUS | POSTGRESQL & SUPABASE SCHEMA
-- ==========================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  city VARCHAR(100) DEFAULT 'الرياض',
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  rating NUMERIC(3,2) DEFAULT 5.00,
  ads_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100),
  icon VARCHAR(50) DEFAULT 'grid-outline',
  slug VARCHAR(100) UNIQUE NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100),
  sort_order INT DEFAULT 0
);

-- 3. LISTINGS (CLASSIFIED ADS)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(250) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.subcategories(id),
  price NUMERIC(14,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SAR',
  city VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone VARCHAR(30),
  show_phone BOOLEAN DEFAULT TRUE,
  condition VARCHAR(20) DEFAULT 'like_new' CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'pending', 'draft', 'rejected', 'expired', 'paused')),
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for Fast Classifieds Search
CREATE INDEX idx_listings_search ON public.listings USING GIN (to_tsvector('arabic', title || ' ' || description));
CREATE INDEX idx_listings_category ON public.listings (category_id, status);
CREATE INDEX idx_listings_city ON public.listings (city);
CREATE INDEX idx_listings_price ON public.listings (price);

-- 4. LISTING IMAGES
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE
);

-- 5. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- 6. REALTIME CHATS & MESSAGES
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  related_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VIOLATION REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const apiEndpoints = [
    { method: 'POST', path: '/api/v1/auth/register', desc: 'تسجيل مستخدم جديد مع تشفير كلمة المرور' },
    { method: 'POST', path: '/api/v1/auth/login', desc: 'تسجيل الدخول وإصدار JWT Access Token' },
    { method: 'GET', path: '/api/v1/listings', desc: 'استعلام الإعلانات مع فلاتر البحث والترتيب والترقيم Pagination' },
    { method: 'POST', path: '/api/v1/listings', desc: 'نشر إعلان جديد مع معالجة الصور والموقع' },
    { method: 'PUT', path: '/api/v1/listings/:id', desc: 'تحديث بيانات إعلان المستخدم أو الإدارة' },
    { method: 'DELETE', path: '/api/v1/listings/:id', desc: 'حذف الإعلان والملفات المرتبطة به' },
    { method: 'POST', path: '/api/v1/upload/images', desc: 'رفع وضغط الصور متعددة وتوليد صور مصغرة Thumbnails' },
    { method: 'GET', path: '/api/v1/chats', desc: 'جلب قائمة المحادثات النشطة للمستخدم' },
    { method: 'POST', path: '/api/v1/chats/:id/messages', desc: 'إرسال رسالة نصية أو صورة عبر WebSockets/Realtime' },
    { method: 'POST', path: '/api/v1/reports', desc: 'إنشاء بلاغ مخالفة موجه للمشرفين' },
    { method: 'GET', path: '/api/v1/admin/dashboard/stats', desc: 'إحصائيات ومؤشرات لوحة التحكم الإدارية' },
    { method: 'PATCH', path: '/api/v1/admin/listings/:id/moderate', desc: 'موافقة أو رفض إعلان مع ذكر السبب' },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'SouqPlus DB Schema & API Spec',
        message: sqlSchemaCode,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={t('schemaDocs')}
        showBack={true}
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View
        style={[
          styles.tabsBar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'sql' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('sql')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'sql' ? theme.primary : theme.textSecondary, fontWeight: activeTab === 'sql' ? '700' : '500' },
            ]}
          >
            PostgreSQL Schema (DDL)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'api' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('api')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'api' ? theme.primary : theme.textSecondary, fontWeight: activeTab === 'api' ? '700' : '500' },
            ]}
          >
            REST API Endpoints
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'deploy' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('deploy')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'deploy' ? theme.primary : theme.textSecondary, fontWeight: activeTab === 'deploy' ? '700' : '500' },
            ]}
          >
            Build & Deployment
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'sql' && (
          <View style={[styles.codeBox, { backgroundColor: '#0F172A' }]}>
            <Text style={styles.codeText}>{sqlSchemaCode}</Text>
          </View>
        )}

        {activeTab === 'api' && (
          <View style={styles.apiList}>
            {apiEndpoints.map((ep, idx) => (
              <View
                key={`ep_${idx}`}
                style={[
                  styles.apiCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.apiHeaderRow}>
                  <View
                    style={[
                      styles.methodBadge,
                      {
                        backgroundColor:
                          ep.method === 'GET'
                            ? '#D1FAE5'
                            : ep.method === 'POST'
                            ? '#DBEAFE'
                            : ep.method === 'PUT' || ep.method === 'PATCH'
                            ? '#FEF3C7'
                            : '#FEE2E2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodText,
                        {
                          color:
                            ep.method === 'GET'
                              ? '#059669'
                              : ep.method === 'POST'
                              ? '#2563EB'
                              : ep.method === 'PUT' || ep.method === 'PATCH'
                              ? '#D97706'
                              : '#DC2626',
                        },
                      ]}
                    >
                      {ep.method}
                    </Text>
                  </View>
                  <Text style={[styles.apiPath, { color: theme.text }]}>{ep.path}</Text>
                </View>
                <Text style={[styles.apiDesc, { color: theme.textSecondary }]}>{ep.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'deploy' && (
          <View style={{ gap: 14 }}>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>
                1. بناء وتصدير التطبيق لنظام Android (APK / AAB)
              </Text>
              <Text style={[styles.infoCardBody, { color: theme.textSecondary }]}>
                لإنشاء ملف APK للتجربة المباشرة أو ملف AAB للنشر على متجر Google Play:
              </Text>
              <View style={[styles.codeSnippet, { backgroundColor: '#0F172A' }]}>
                <Text style={styles.codeSnippetText}>eas build -p android --profile preview</Text>
                <Text style={styles.codeSnippetText}>eas build -p android --profile production</Text>
              </View>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>
                2. بناء وتصدير تطبيق iOS (IPA / App Store)
              </Text>
              <Text style={[styles.infoCardBody, { color: theme.textSecondary }]}>
                لتصدير تطبيق iOS عبر EAS وتوقيعه بشهادة Apple Developer:
              </Text>
              <View style={[styles.codeSnippet, { backgroundColor: '#0F172A' }]}>
                <Text style={styles.codeSnippetText}>eas build -p ios --profile production</Text>
              </View>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.infoCardTitle, { color: theme.text }]}>
                3. تهيئة قاعدة البيانات والتخزين السحابي (Supabase / AWS S3)
              </Text>
              <Text style={[styles.infoCardBody, { color: theme.textSecondary }]}>
                انسخ مخطط SQL المرفق في تبويب PostgreSQL Schema إلى محرر الاستعلامات في Supabase Dashboard وقم بتفعيل Realtime على جدولي chats و messages.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shareBtn: {
    padding: 6,
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 11,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  codeBox: {
    borderRadius: 12,
    padding: 14,
  },
  codeText: {
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  apiList: {
    gap: 10,
  },
  apiCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
  },
  apiPath: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  apiDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoCardBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  codeSnippet: {
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  codeSnippetText: {
    color: '#60A5FA',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
