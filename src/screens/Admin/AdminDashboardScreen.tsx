import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing, User, Report, Chat } from '../../types';
import { db } from '../../services/database';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdminDashboardScreenProps {
  onBack: () => void;
  onNavigateTab: (tab: 'listings' | 'users' | 'reports' | 'categories' | 'settings' | 'schema') => void;
  onOpenListing: (listing: Listing) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onBack,
  onNavigateTab,
  onOpenListing,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = async () => {
    try {
      const u = await db.getUsers();
      setUsers(u);
      const l = await db.getListings();
      setListings(l);
      const r = await db.getReports();
      setReports(r);
      const c = await db.getChatsForUser('user_admin');
      setChats(c);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const pendingListings = listings.filter((l) => l.status === 'pending');
  const activeListings = listings.filter((l) => l.status === 'published');
  const newReports = reports.filter((r) => r.status === 'new');

  const handleQuickApprove = async (listingId: string) => {
    await db.updateListing(listingId, { status: 'published' });
    await loadAdminData();
  };

  const handleQuickReject = async (listingId: string) => {
    await db.updateListing(listingId, {
      status: 'rejected',
      rejectionReason: 'محتوى مخالف للشروط والأحكام',
    });
    await loadAdminData();
  };

  // Category counts breakdown
  const categoryCounts: Record<string, number> = {};
  listings.forEach((l) => {
    categoryCounts[l.categoryId] = (categoryCounts[l.categoryId] || 0) + 1;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={t('adminDashboard')}
        showBack={true}
        onBackPress={onBack}
        rightAction={
          <View style={styles.adminIndicator}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.adminIndicatorText}>Live Web Portal</Text>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {/* Total Users */}
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => onNavigateTab('users')}
          >
            <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.kpiValue, { color: theme.text }]}>{users.length}</Text>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>{t('totalUsers')}</Text>
          </TouchableOpacity>

          {/* Total Listings */}
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => onNavigateTab('listings')}
          >
            <View style={[styles.kpiIconBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="pricetags" size={20} color="#10B981" />
            </View>
            <Text style={[styles.kpiValue, { color: theme.text }]}>{listings.length}</Text>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>{t('totalListings')}</Text>
          </TouchableOpacity>

          {/* Pending Review */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              { backgroundColor: theme.surface, borderColor: pendingListings.length > 0 ? '#F59E0B' : theme.border },
            ]}
            onPress={() => onNavigateTab('listings')}
          >
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.kpiValue, { color: pendingListings.length > 0 ? '#F59E0B' : theme.text }]}>
              {pendingListings.length}
            </Text>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>{t('pendingListings')}</Text>
          </TouchableOpacity>

          {/* Reports */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              { backgroundColor: theme.surface, borderColor: newReports.length > 0 ? '#EF4444' : theme.border },
            ]}
            onPress={() => onNavigateTab('reports')}
          >
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.kpiValue, { color: newReports.length > 0 ? '#EF4444' : theme.text }]}>
              {newReports.length}
            </Text>
            <Text style={[styles.kpiTitle, { color: theme.textSecondary }]}>{t('reportsCount')}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Shortcuts Horizontal Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.navStrip, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => onNavigateTab('listings')}
          >
            <Ionicons name="albums-outline" size={16} color={theme.primary} />
            <Text style={[styles.navBtnText, { color: theme.text }]}>{t('manageListings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => onNavigateTab('users')}
          >
            <Ionicons name="person-outline" size={16} color={theme.primary} />
            <Text style={[styles.navBtnText, { color: theme.text }]}>{t('manageUsers')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => onNavigateTab('reports')}
          >
            <Ionicons name="warning-outline" size={16} color="#EF4444" />
            <Text style={[styles.navBtnText, { color: theme.text }]}>{t('manageReports')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => onNavigateTab('categories')}
          >
            <Ionicons name="grid-outline" size={16} color={theme.primary} />
            <Text style={[styles.navBtnText, { color: theme.text }]}>{t('manageCategories')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => onNavigateTab('schema')}
          >
            <Ionicons name="server-outline" size={16} color="#7C3AED" />
            <Text style={[styles.navBtnText, { color: theme.text }]}>{t('schemaDocs')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => onNavigateTab('settings')}
          >
            <Ionicons name="settings-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.navBtnText, { color: theme.text }]}>{t('systemSettings')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Pending Moderation Queue Card */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.sectionCardHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.titleIconRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="shield-outline" size={18} color="#D97706" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {language === 'ar' ? 'طابور المراجعة السريعة' : 'Pending Moderation Queue'} ({pendingListings.length})
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateTab('listings')}>
              <Text style={[styles.viewAllLink, { color: theme.primary }]}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {pendingListings.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Ionicons name="checkmark-circle-outline" size={36} color={theme.success} />
              <Text style={[styles.emptyQueueText, { color: theme.textSecondary }]}>
                {language === 'ar'
                  ? 'رائع! لا توجد إعلانات معلقة في انتظار المراجعة'
                  : 'All caught up! No pending listings'}
              </Text>
            </View>
          ) : (
            pendingListings.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.pendingItemRow,
                  { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View
                  style={[
                    styles.pendingItemInfo,
                    { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                  ]}
                >
                  <Text style={[styles.pendingTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.pendingUser, { color: theme.textMuted }]}>
                    بواسطة: {item.user.name} • {item.price} {item.currency}
                  </Text>
                </View>

                <View
                  style={[
                    styles.pendingActionsRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.actionMiniBtn, { backgroundColor: '#D1FAE5' }]}
                    onPress={() => handleQuickApprove(item.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#059669" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionMiniBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleQuickReject(item.id)}
                  >
                    <Ionicons name="close" size={16} color="#DC2626" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionMiniBtn, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => onOpenListing(item)}
                  >
                    <Ionicons name="eye-outline" size={16} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Violation Reports Card */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.sectionCardHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.titleIconRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {language === 'ar' ? 'أحدث البلاغات الواردة' : 'Recent Violation Reports'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateTab('reports')}>
              <Text style={[styles.viewAllLink, { color: theme.primary }]}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {reports.length === 0 ? (
            <Text style={{ color: theme.textMuted, padding: 12, textAlign: 'center' }}>
              لا توجد بلاغات حالياً
            </Text>
          ) : (
            reports.slice(0, 3).map((rep) => (
              <View
                key={rep.id}
                style={[
                  styles.reportItemRow,
                  { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View
                  style={[
                    styles.reportInfo,
                    { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                  ]}
                >
                  <Text style={[styles.reportReason, { color: theme.error }]}>
                    {rep.reason}
                  </Text>
                  <Text style={[styles.reportDetails, { color: theme.text }]} numberOfLines={1}>
                    {rep.listingTitle || rep.details}
                  </Text>
                  <Text style={[styles.reportReporter, { color: theme.textMuted }]}>
                    مُبلّغ: {rep.reporterName}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.statusPillText, { color: '#D97706' }]}>
                    {rep.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adminIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminIndicatorText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 32 - 10) / 2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  navStrip: {
    gap: 8,
    paddingVertical: 4,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  sectionCardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleIconRow: {
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyQueue: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyQueueText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pendingItemRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingItemInfo: {
    flex: 1,
    gap: 2,
    marginRight: 10,
  },
  pendingTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  pendingUser: {
    fontSize: 11,
  },
  pendingActionsRow: {
    alignItems: 'center',
    gap: 6,
  },
  actionMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportItemRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportInfo: {
    flex: 1,
    gap: 2,
  },
  reportReason: {
    fontSize: 12,
    fontWeight: '700',
  },
  reportDetails: {
    fontSize: 13,
  },
  reportReporter: {
    fontSize: 11,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
