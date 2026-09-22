import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing, ListingStatus } from '../../types';
import { db } from '../../services/database';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { ListingCard } from '../../components/ListingCard';

interface AdminListingsScreenProps {
  onBack: () => void;
  onOpenListing: (listing: Listing) => void;
}

export const AdminListingsScreen: React.FC<AdminListingsScreenProps> = ({
  onBack,
  onOpenListing,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<ListingStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Reject modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [targetListingId, setTargetListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('مخالف لسياسة النشر وشروط الاستخدام');

  const loadListings = useCallback(async () => {
    try {
      const data = await db.getListings();
      setAllListings(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    await db.updateListing(id, { status: 'published' });
    // Notify seller
    const item = allListings.find((l) => l.id === id);
    if (item) {
      await db.createNotification({
        userId: item.userId,
        title: 'تمت الموافقة على إعلانك',
        body: `تمت الموافقة على نشر "${item.title}" وأصبح متاحاً للجميع الآن.`,
        type: 'ad_approved',
        relatedId: item.id,
      });
    }
    await loadListings();
    Alert.alert(t('success'), language === 'ar' ? 'تمت الموافقة ونشر الإعلان' : 'Ad approved');
  };

  const handleOpenReject = (id: string) => {
    setTargetListingId(id);
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!targetListingId) return;
    await db.updateListing(targetListingId, {
      status: 'rejected',
      rejectionReason: rejectReason,
    });

    const item = allListings.find((l) => l.id === targetListingId);
    if (item) {
      await db.createNotification({
        userId: item.userId,
        title: 'تم رفض الإعلان',
        body: `عذراً، تم رفض إعلانك "${item.title}". السبب: ${rejectReason}`,
        type: 'ad_rejected',
        relatedId: item.id,
      });
    }

    setRejectModalVisible(false);
    setTargetListingId(null);
    await loadListings();
    Alert.alert(t('success'), language === 'ar' ? 'تم رفض الإعلان' : 'Ad rejected');
  };

  const handleToggleFeature = async (listing: Listing) => {
    await db.updateListing(listing.id, { isFeatured: !listing.isFeatured });
    await loadListings();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      t('deleteAd'),
      t('deleteConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAd'),
          style: 'destructive',
          onPress: async () => {
            await db.deleteListing(id);
            await loadListings();
          },
        },
      ]
    );
  };

  const filteredListings = allListings.filter((l) => {
    if (activeTab !== 'all' && l.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchSeller = l.user.name.toLowerCase().includes(q);
      const matchCity = l.city.toLowerCase().includes(q);
      if (!matchTitle && !matchSeller && !matchCity) return false;
    }
    return true;
  });

  const tabs: { key: ListingStatus | 'all'; label: string }[] = [
    { key: 'pending', label: t('statusPending') },
    { key: 'published', label: t('statusPublished') },
    { key: 'rejected', label: t('statusRejected') },
    { key: 'expired', label: t('statusExpired') },
    { key: 'all', label: language === 'ar' ? 'الكل' : 'All' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('manageListings')} showBack={true} onBackPress={onBack} />

      {/* Search Input */}
      <View style={[styles.searchBoxWrap, { backgroundColor: theme.surface }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surfaceSecondary, flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={language === 'ar' ? 'ابحث في كل الإعلانات...' : 'Search listings...'}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View
        style={[
          styles.tabsBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {tabs.map((tab) => {
          const count =
            tab.key === 'all'
              ? allListings.length
              : allListings.filter((l) => l.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabBtn,
                isActive && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? theme.primary : theme.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <ListingCard
              listing={item}
              onPress={() => onOpenListing(item)}
              layout="horizontal"
              showStatus={true}
            />

            {/* Moderation Actions Strip */}
            <View
              style={[
                styles.moderationBar,
                { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {item.status !== 'published' && (
                <TouchableOpacity
                  style={[styles.btnApprove, { backgroundColor: '#D1FAE5' }]}
                  onPress={() => handleApprove(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={[styles.btnActionText, { color: '#059669' }]}>
                    {t('approve')}
                  </Text>
                </TouchableOpacity>
              )}

              {item.status !== 'rejected' && (
                <TouchableOpacity
                  style={[styles.btnReject, { backgroundColor: '#FEE2E2' }]}
                  onPress={() => handleOpenReject(item.id)}
                >
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text style={[styles.btnActionText, { color: '#DC2626' }]}>
                    {t('reject')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.btnFeature,
                  { backgroundColor: item.isFeatured ? '#FEF3C7' : theme.surfaceSecondary },
                ]}
                onPress={() => handleToggleFeature(item)}
              >
                <Ionicons
                  name={item.isFeatured ? 'star' : 'star-outline'}
                  size={15}
                  color={item.isFeatured ? '#D97706' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.btnActionText,
                    { color: item.isFeatured ? '#D97706' : theme.textSecondary },
                  ]}
                >
                  {item.isFeatured ? t('unfeatureAd') : t('featureAd')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnDelete, { backgroundColor: theme.surfaceSecondary }]}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={15} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="file-tray-outline" size={50} color={theme.textMuted} />
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
              {language === 'ar' ? 'لا توجد إعلانات مطابقة' : 'No listings matching'}
            </Text>
          </View>
        }
      />

      {/* Reject Reason Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {language === 'ar' ? 'سبب رفض الإعلان' : 'Rejection Reason'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              {language === 'ar'
                ? 'سيتم إشعار صاحب الإعلان بسبب الرفض'
                : 'The seller will receive a notification with this reason'}
            </Text>

            <TextInput
              style={[
                styles.reasonInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />

            <View style={[styles.modalActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[styles.modalCancel, { backgroundColor: theme.surfaceSecondary }]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={{ color: theme.textSecondary }}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.error }]}
                onPress={handleConfirmReject}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('reject')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBoxWrap: {
    padding: 10,
  },
  searchBar: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
  },
  tabsBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 12,
  },
  listContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 40,
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moderationBar: {
    borderTopWidth: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  btnApprove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnReject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnDelete: {
    padding: 6,
    borderRadius: 8,
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
  },
  reasonInput: {
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalActions: {
    gap: 10,
    marginTop: 6,
  },
  modalCancel: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirm: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
