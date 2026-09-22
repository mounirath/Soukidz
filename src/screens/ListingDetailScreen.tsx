import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ImageGallery } from '../components/ImageGallery';
import { ReportModal } from '../components/ReportModal';
import { ListingCard } from '../components/ListingCard';

interface ListingDetailScreenProps {
  listing: Listing;
  onBack: () => void;
  onStartChat: (listing: Listing) => void;
  onSelectSimilarListing: (listing: Listing) => void;
}

export const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({
  listing,
  onBack,
  onStartChat,
  onSelectSimilarListing,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [isFavorited, setIsFavorited] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      // Increment views
      await db.incrementViews(listing.id);
      // Check favorite
      const isFav = await db.isFavorite(listing.id);
      setIsFavorited(isFav);

      // Load similar
      const all = await db.getListings();
      const similar = all.filter(
        (l) =>
          l.id !== listing.id &&
          l.categoryId === listing.categoryId &&
          l.status === 'published'
      );
      setSimilarListings(similar.slice(0, 4));
    })();
  }, [listing.id, listing.categoryId]);

  const handleToggleFavorite = async () => {
    const newState = await db.toggleFavorite(listing.id);
    setIsFavorited(newState);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: listing.title,
        message: `${listing.title} - ${listing.price} ${listing.currency}\nتطبيق سوق بلس: https://souqplus.app/ad/${listing.id}`,
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const handleCall = () => {
    if (!listing.showPhone || !listing.phone) {
      Alert.alert(
        language === 'ar' ? 'تنبيه' : 'Notice',
        language === 'ar'
          ? 'فضل البائع التواصل عبر المحادثة الفورية داخل التطبيق'
          : 'Seller preferred direct chat inside the app'
      );
      return;
    }
    Linking.openURL(`tel:${listing.phone}`);
  };

  const formattedPrice = new Intl.NumberFormat(
    language === 'ar' ? 'ar-SA' : 'en-US'
  ).format(listing.price);

  const conditionLabels: Record<string, string> = {
    new: t('conditionNew'),
    like_new: t('conditionLikeNew'),
    good: t('conditionGood'),
    fair: t('conditionFair'),
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const isOwner = currentUser?.id === listing.userId;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Floating App Bar */}
      <View
        style={[
          styles.topFloatingBar,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <TouchableOpacity
          style={styles.floatingActionBtn}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View
          style={[
            styles.floatingRightActions,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingActionBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatingActionBtn}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatingActionBtn}
            onPress={() => setReportModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="flag-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Images Gallery */}
        <ImageGallery images={listing.images} />

        <View style={styles.bodyContent}>
          {/* Main Price & Title Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.priceRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.priceWrap,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={[styles.priceNumber, { color: theme.primary }]}>
                  {formattedPrice}
                </Text>
                <Text style={[styles.priceCurrency, { color: theme.primary }]}>
                  {listing.currency || t('currencyUnit')}
                </Text>
              </View>

              <View
                style={[
                  styles.conditionBadge,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text style={[styles.conditionText, { color: theme.primaryDark }]}>
                  {conditionLabels[listing.condition] || listing.condition}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.listingTitle,
                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {listing.title}
            </Text>

            {/* Meta Row: Location, Date, Views */}
            <View
              style={[
                styles.metaRow,
                {
                  borderTopColor: theme.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.metaItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="location-outline" size={15} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {listing.city} • {listing.area}
                </Text>
              </View>

              <View
                style={[
                  styles.metaItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="time-outline" size={15} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {formatDate(listing.createdAt)}
                </Text>
              </View>

              <View
                style={[
                  styles.metaItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="eye-outline" size={15} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {listing.viewsCount || 0} {t('views')}
                </Text>
              </View>
            </View>
          </View>

          {/* Seller Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.cardHeading,
                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('sellerInfo')}
            </Text>

            <View
              style={[
                styles.sellerRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Image
                source={{ uri: listing.user.avatar }}
                style={styles.sellerAvatar}
                contentFit="cover"
              />

              <View
                style={[
                  styles.sellerDetails,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.sellerNameWrap,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.sellerName, { color: theme.text }]}>
                    {listing.user.name}
                  </Text>
                  {listing.user.verified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.primary}
                    />
                  )}
                </View>

                <View
                  style={[
                    styles.sellerRatingRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.ratingNumber, { color: theme.text }]}>
                    {listing.user.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.memberSince, { color: theme.textMuted }]}>
                    • {t('memberSince')} {listing.user.memberSince || '2026'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.cardHeading,
                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('adDescription')}
            </Text>

            <Text
              style={[
                styles.descriptionText,
                {
                  color: theme.textSecondary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              numberOfLines={descExpanded ? undefined : 6}
            >
              {listing.description}
            </Text>

            {listing.description.length > 200 && (
              <TouchableOpacity
                onPress={() => setDescExpanded(!descExpanded)}
                style={styles.expandBtn}
              >
                <Text style={[styles.expandBtnText, { color: theme.primary }]}>
                  {descExpanded
                    ? language === 'ar'
                      ? 'عرض أقل'
                      : 'Show less'
                    : language === 'ar'
                    ? 'قراءة المزيد'
                    : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location Map Preview / Badge Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.locationCardHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="map-outline" size={20} color={theme.primary} />
              <Text style={[styles.cardHeading, { color: theme.text, marginBottom: 0 }]}>
                {language === 'ar' ? 'الموقع الجغرافي التقريبي' : 'Approximate Location'}
              </Text>
            </View>

            <View
              style={[
                styles.mapMockBox,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons name="pin" size={28} color={theme.primary} />
              <Text style={[styles.mapMockCity, { color: theme.text }]}>
                {listing.city} — {listing.area}
              </Text>
              <Text style={[styles.mapMockPrivacy, { color: theme.textMuted }]}>
                {language === 'ar'
                  ? 'يتم عرض المنطقة العامة لحماية خصوصية البائع'
                  : 'Approximate neighborhood shown to protect privacy'}
              </Text>
            </View>
          </View>

          {/* Buyer Safety Tips Card */}
          <View
            style={[
              styles.safetyCard,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.safetyHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
              <Text style={[styles.safetyTitle, { color: theme.text }]}>
                {t('safetyTips')}
              </Text>
            </View>
            <View style={styles.safetyList}>
              <Text
                style={[
                  styles.safetyItem,
                  { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                • {t('safetyTip1')}
              </Text>
              <Text
                style={[
                  styles.safetyItem,
                  { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                • {t('safetyTip2')}
              </Text>
              <Text
                style={[
                  styles.safetyItem,
                  { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                • {t('safetyTip3')}
              </Text>
            </View>
          </View>

          {/* Similar Listings Carousel */}
          {similarListings.length > 0 && (
            <View style={styles.similarSection}>
              <Text
                style={[
                  styles.similarTitle,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('similarAds')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                {similarListings.map((sim) => (
                  <View key={sim.id} style={{ width: 170 }}>
                    <ListingCard
                      listing={sim}
                      onPress={() => onSelectSimilarListing(sim)}
                      layout="grid"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom spacing for sticky bar */}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {listing.showPhone && (
          <TouchableOpacity
            style={[styles.actionBtnCall, { borderColor: theme.primary }]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionBtnCallText, { color: theme.primary }]}>
              {t('callSeller')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionBtnChat,
            { backgroundColor: theme.primary },
            !listing.showPhone && { flex: 1 },
          ]}
          onPress={() => onStartChat(listing)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnChatText}>
            {isOwner
              ? language === 'ar'
                ? 'عرض رسائل الإعلان'
                : 'View Inquiries'
              : t('chatSeller')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        reportedUserId={listing.userId}
        reportedUserName={listing.user.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topFloatingBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingRightActions: {
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bodyContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  priceRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceWrap: {
    alignItems: 'baseline',
    gap: 6,
  },
  priceNumber: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '700',
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 12,
  },
  metaRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  sellerRow: {
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  sellerDetails: {
    flex: 1,
    gap: 4,
  },
  sellerNameWrap: {
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  sellerRatingRow: {
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  memberSince: {
    fontSize: 11,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  expandBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationCardHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  mapMockBox: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 10,
  },
  mapMockCity: {
    fontSize: 14,
    fontWeight: '700',
  },
  mapMockPrivacy: {
    fontSize: 11,
    textAlign: 'center',
  },
  safetyCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  safetyHeader: {
    alignItems: 'center',
    gap: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  safetyList: {
    gap: 4,
  },
  safetyItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  similarSection: {
    gap: 12,
    marginTop: 8,
  },
  similarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 8,
  },
  actionBtnCall: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnCallText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtnChat: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
