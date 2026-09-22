import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing, ListingStatus } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';
import { ConfirmModal } from '../components/ConfirmModal';

interface MyListingsScreenProps {
  onSelectListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
  onBack?: () => void;
}

export const MyListingsScreen: React.FC<MyListingsScreenProps> = ({
  onSelectListing,
  onEditListing,
  onBack,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ListingStatus>('published');
  const [allMyListings, setAllMyListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    if (!currentUser) return;
    try {
      const all = await db.getListings();
      const mine = all.filter((l) => l.userId === currentUser.id);
      setAllMyListings(mine);
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const filteredListings = allMyListings.filter((l) => l.status === activeTab);

  const handleDeleteListing = async () => {
    if (!deleteTargetId) return;
    await db.deleteListing(deleteTargetId);
    setDeleteTargetId(null);
    await loadListings();
    Alert.alert(t('success'), language === 'ar' ? 'تم حذف الإعلان بنجاح' : 'Ad deleted');
  };

  const handleTogglePause = async (listing: Listing) => {
    const newStatus = listing.status === 'paused' ? 'published' : 'paused';
    await db.updateListing(listing.id, { status: newStatus });
    await loadListings();
  };

  const handleExtendListing = async (listing: Listing) => {
    await db.extendListing(listing.id, 30);
    await loadListings();
    Alert.alert(
      t('success'),
      language === 'ar'
        ? 'تم تمديد صلاحية الإعلان لمدة 30 يوماً إضافية'
        : 'Ad extended by 30 days'
    );
  };

  const tabs: { status: ListingStatus; label: string }[] = [
    { status: 'published', label: t('statusPublished') },
    { status: 'pending', label: t('statusPending') },
    { status: 'expired', label: t('statusExpired') },
    { status: 'draft', label: t('statusDraft') },
    { status: 'paused', label: t('statusPaused') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={t('myAds')}
        showBack={!!onBack}
        onBackPress={onBack}
      />

      {/* Tabs */}
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
          const count = allMyListings.filter((l) => l.status === tab.status).length;
          const isActive = activeTab === tab.status;
          return (
            <TouchableOpacity
              key={tab.status}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab.status)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? theme.primary : theme.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: isActive ? theme.primaryLight : theme.surfaceSecondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isActive ? theme.primaryDark : theme.textSecondary },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Listings list */}
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
              onPress={() => onSelectListing(item)}
              layout="horizontal"
              showStatus={true}
            />

            {/* Actions Row */}
            <View
              style={[
                styles.actionsBar,
                { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onEditListing(item)}
              >
                <Ionicons name="create-outline" size={16} color={theme.primary} />
                <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                  {t('editAd')}
                </Text>
              </TouchableOpacity>

              {item.status === 'expired' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleExtendListing(item)}
                >
                  <Ionicons name="timer-outline" size={16} color={theme.success} />
                  <Text style={[styles.actionBtnText, { color: theme.success }]}>
                    {t('extendAd')}
                  </Text>
                </TouchableOpacity>
              )}

              {(item.status === 'published' || item.status === 'paused') && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleTogglePause(item)}
                >
                  <Ionicons
                    name={item.status === 'paused' ? 'play-outline' : 'pause-outline'}
                    size={16}
                    color={theme.secondary}
                  />
                  <Text style={[styles.actionBtnText, { color: theme.secondary }]}>
                    {item.status === 'paused' ? t('resumeAd') : t('pauseAd')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setDeleteTargetId(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color={theme.error} />
                <Text style={[styles.actionBtnText, { color: theme.error }]}>
                  {t('deleteAd')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={54} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {language === 'ar'
                ? `لا توجد إعلانات في قائمة "${tabs.find((t) => t.status === activeTab)?.label}"`
                : 'No ads found in this tab'}
            </Text>
          </View>
        }
      />

      <ConfirmModal
        visible={!!deleteTargetId}
        title={t('deleteAd')}
        message={t('deleteConfirm')}
        isDestructive={true}
        onConfirm={handleDeleteListing}
        onCancel={() => setDeleteTargetId(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionsBar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
