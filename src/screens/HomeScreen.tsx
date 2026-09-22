import React, { useState, useEffect, useCallback } from 'react';
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
import { Listing, Category } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';
import { CategoryItem } from '../components/CategoryItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  onSelectListing: (listing: Listing) => void;
  onOpenSearch: (categoryId?: string) => void;
  onOpenNotifications: () => void;
  onOpenAddListing: () => void;
  onOpenAllCategories: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectListing,
  onOpenSearch,
  onOpenNotifications,
  onOpenAddListing,
  onOpenAllCategories,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [nearbyListings, setNearbyListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const banners = [
    {
      id: 'b1',
      title: language === 'ar' ? 'سوق بلس — بوابتك لكل جديد' : 'SouqPlus — Buy & Sell Faster',
      subtitle:
        language === 'ar'
          ? 'انشر إعلانك مجاناً وتواصل مع آلاف المشترين فورياً'
          : 'Post your ad in seconds and reach thousands of buyers',
      tag: language === 'ar' ? 'مميز' : 'Hot',
      bgGradient: ['#059669', '#047857'],
      icon: 'sparkles',
    },
    {
      id: 'b2',
      title: language === 'ar' ? 'سوق السيارات الأكبر' : 'Top Verified Cars',
      subtitle:
        language === 'ar'
          ? 'آلاف السيارات المفحوصة بأسعار منافسة وضمان'
          : 'Browse verified vehicles with direct seller contact',
      tag: language === 'ar' ? 'سيارات' : 'Cars',
      bgGradient: ['#2563EB', '#1D4ED8'],
      icon: 'car-sport',
    },
    {
      id: 'b3',
      title: language === 'ar' ? 'أمان وسهولة في المعاملات' : 'Safe & Direct Deals',
      subtitle:
        language === 'ar'
          ? 'محادثة فورية مشفرة وتحقق كامل من الحسابات'
          : 'Instant chat with buyer safety protections',
      tag: language === 'ar' ? 'أمان' : 'Safe',
      bgGradient: ['#7C3AED', '#6D28D9'],
      icon: 'shield-checkmark',
    },
  ];

  const loadData = useCallback(async () => {
    try {
      const cats = await db.getCategories();
      setCategories(cats);

      const allListings = await db.getListings();
      const published = allListings.filter((l) => l.status === 'published');

      setFeaturedListings(published.filter((l) => l.isFeatured));
      setRecentListings(published);

      // Nearby simulation (same city as user or first city)
      const userCity = currentUser?.city || 'الرياض';
      setNearbyListings(published.filter((l) => l.city === userCity));

      const favs = await db.getFavoriteIds();
      setFavoriteIds(favs);

      if (currentUser) {
        const notifs = await db.getNotifications(currentUser.id);
        const unread = notifs.filter((n) => !n.isRead).length;
        setUnreadNotifs(unread);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (listingId: string) => {
    await db.toggleFavorite(listingId);
    const updated = await db.getFavoriteIds();
    setFavoriteIds(updated);
  };

  const displayedRecent = selectedCatId
    ? recentListings.filter((l) => l.categoryId === selectedCatId)
    : recentListings;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        showSearch={true}
        onSearchFocus={() => onOpenSearch()}
        unreadNotifsCount={unreadNotifs}
        onNotificationsPress={onOpenNotifications}
        onFilterPress={() => onOpenSearch()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            style={[styles.bannerCard, { backgroundColor: banners[bannerIndex].bgGradient[0] }]}
            activeOpacity={0.92}
            onPress={onOpenAddListing}
          >
            <View
              style={[
                styles.bannerInner,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.bannerTextWrap,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View style={styles.bannerTag}>
                  <Text style={styles.bannerTagText}>
                    {banners[bannerIndex].tag}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.bannerTitle,
                    { textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {banners[bannerIndex].title}
                </Text>
                <Text
                  style={[
                    styles.bannerSubtitle,
                    { textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {banners[bannerIndex].subtitle}
                </Text>
              </View>

              <View style={styles.bannerIconWrap}>
                <Ionicons
                  name={banners[bannerIndex].icon as any}
                  size={36}
                  color="#FFFFFF"
                />
              </View>
            </View>

            {/* Dots */}
            <View style={styles.bannerDots}>
              {banners.map((_, i) => (
                <TouchableOpacity
                  key={`dot_${i}`}
                  onPress={() => setBannerIndex(i)}
                  style={[
                    styles.dot,
                    bannerIndex === i ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionWrap}>
          <View
            style={[
              styles.sectionHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('allCategories')}
            </Text>
            <TouchableOpacity onPress={onOpenAllCategories}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                {t('viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.categoriesScroll,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                isSelected={selectedCatId === cat.id}
                onPress={() => {
                  if (selectedCatId === cat.id) {
                    setSelectedCatId(null);
                  } else {
                    setSelectedCatId(cat.id);
                  }
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Listings Section */}
        {featuredListings.length > 0 && !selectedCatId && (
          <View style={styles.sectionWrap}>
            <View
              style={[
                styles.sectionHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.titleWithIcon,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="sparkles" size={18} color="#D97706" />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('featuredAds')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => onOpenSearch()}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  {t('viewAll')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.horizontalListingsScroll,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {featuredListings.map((listing) => (
                <View key={listing.id} style={{ width: 175, marginRight: 12 }}>
                  <ListingCard
                    listing={listing}
                    onPress={() => onSelectListing(listing)}
                    onFavoritePress={() => handleToggleFavorite(listing.id)}
                    isFavorited={favoriteIds.includes(listing.id)}
                    layout="grid"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Nearby Ads Section */}
        {nearbyListings.length > 0 && !selectedCatId && (
          <View style={styles.sectionWrap}>
            <View
              style={[
                styles.sectionHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.titleWithIcon,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="location" size={18} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('nearbyAds')} ({currentUser?.city || 'الرياض'})
                </Text>
              </View>
            </View>

            {nearbyListings.slice(0, 2).map((listing) => (
              <ListingCard
                key={`nearby_${listing.id}`}
                listing={listing}
                onPress={() => onSelectListing(listing)}
                onFavoritePress={() => handleToggleFavorite(listing.id)}
                isFavorited={favoriteIds.includes(listing.id)}
                layout="horizontal"
              />
            ))}
          </View>
        )}

        {/* Recent Listings Section */}
        <View style={styles.sectionWrap}>
          <View
            style={[
              styles.sectionHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedCatId ? t('search') : t('recentAds')}
            </Text>
            {selectedCatId && (
              <TouchableOpacity onPress={() => setSelectedCatId(null)}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  {language === 'ar' ? 'إلغاء التحديد' : 'Clear filter'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {displayedRecent.length === 0 ? (
            <View style={[styles.emptyWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="file-tray-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('noAdsFound')}
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {displayedRecent.map((listing) => (
                <View key={listing.id} style={styles.gridItemWrap}>
                  <ListingCard
                    listing={listing}
                    onPress={() => onSelectListing(listing)}
                    onFavoritePress={() => handleToggleFavorite(listing.id)}
                    isFavorited={favoriteIds.includes(listing.id)}
                    layout="grid"
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacer for bottom navigation */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bannerCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerInner: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTextWrap: {
    flex: 1,
    gap: 4,
  },
  bannerTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  bannerIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  sectionWrap: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoriesScroll: {
    paddingRight: 10,
  },
  horizontalListingsScroll: {
    paddingRight: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemWrap: {
    width: (SCREEN_WIDTH - 32 - 12) / 2,
  },
  emptyWrap: {
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
