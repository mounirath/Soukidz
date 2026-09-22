import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing } from '../types';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
  layout?: 'grid' | 'horizontal' | 'compact';
  showStatus?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  onFavoritePress,
  isFavorited = false,
  layout = 'grid',
  showStatus = false,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const formattedPrice = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(
    listing.price
  );

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return language === 'ar' ? 'الآن' : 'Just now';
      if (diffHours < 24) {
        return language === 'ar' ? `منذ ${diffHours} س` : `${diffHours}h ago`;
      }
      const diffDays = Math.floor(diffHours / 24);
      return language === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const conditionLabels: Record<string, string> = {
    new: t('conditionNew'),
    like_new: t('conditionLikeNew'),
    good: t('conditionGood'),
    fair: t('conditionFair'),
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    published: { bg: '#D1FAE5', text: '#059669', label: t('statusPublished') },
    pending: { bg: '#FEF3C7', text: '#D97706', label: t('statusPending') },
    draft: { bg: '#F1F5F9', text: '#64748B', label: t('statusDraft') },
    rejected: { bg: '#FEE2E2', text: '#DC2626', label: t('statusRejected') },
    expired: { bg: '#F3F4F6', text: '#9CA3AF', label: t('statusExpired') },
    paused: { bg: '#EDE9FE', text: '#7C3AED', label: t('statusPaused') },
  };

  const currentStatus = statusColors[listing.status] || statusColors.published;
  const coverImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

  if (layout === 'horizontal') {
    return (
      <TouchableOpacity
        style={[
          styles.horizontalContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <View style={styles.horizontalImageWrap}>
          <Image
            source={{ uri: coverImage }}
            style={styles.horizontalImage}
            contentFit="cover"
            transition={300}
          />
          {listing.isFeatured && (
            <View style={[styles.featuredTag, isRTL ? { right: 6 } : { left: 6 }]}>
              <Ionicons name="sparkles" size={11} color="#FFFFFF" />
              <Text style={styles.featuredTagText}>{language === 'ar' ? 'مميز' : 'Featured'}</Text>
            </View>
          )}
        </View>

        <View style={[styles.horizontalContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {showStatus && (
            <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
              <Text style={[styles.statusBadgeText, { color: currentStatus.text }]}>
                {currentStatus.label}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.horizontalTitle,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={2}
          >
            {listing.title}
          </Text>

          <View style={[styles.priceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.priceNumber, { color: theme.primary }]}>
              {formattedPrice}
            </Text>
            <Text style={[styles.priceCurrency, { color: theme.primary }]}>
              {listing.currency || t('currencyUnit')}
            </Text>
          </View>

          <View style={[styles.horizontalFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.locationWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="location-outline" size={13} color={theme.textMuted} />
              <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
                {listing.city} • {listing.area}
              </Text>
            </View>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>
              {formatTime(listing.createdAt)}
            </Text>
          </View>
        </View>

        {onFavoritePress && (
          <TouchableOpacity
            style={[styles.favoriteBtn, isRTL ? { left: 10 } : { right: 10 }]}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#EF4444' : theme.textMuted}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Grid layout (Default)
  return (
    <TouchableOpacity
      style={[
        styles.gridContainer,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.gridImageWrap}>
        <Image
          source={{ uri: coverImage }}
          style={styles.gridImage}
          contentFit="cover"
          transition={300}
        />

        {/* Badges Overlay */}
        <View style={[styles.topBadgesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {listing.isFeatured ? (
            <View style={styles.featuredTag}>
              <Ionicons name="sparkles" size={10} color="#FFFFFF" />
              <Text style={styles.featuredTagText}>{language === 'ar' ? 'مميز' : 'Featured'}</Text>
            </View>
          ) : <View />}

          {onFavoritePress && (
            <TouchableOpacity
              style={styles.gridFavoriteBtn}
              onPress={(e) => {
                e.stopPropagation();
                onFavoritePress();
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorited ? '#EF4444' : '#1E293B'}
              />
            </TouchableOpacity>
          )}
        </View>

        {showStatus && (
          <View style={[styles.gridStatusBadge, { backgroundColor: currentStatus.bg }]}>
            <Text style={[styles.statusBadgeText, { color: currentStatus.text }]}>
              {currentStatus.label}
            </Text>
          </View>
        )}

        {listing.images && listing.images.length > 1 && (
          <View style={[styles.photoCountBadge, isRTL ? { left: 8 } : { right: 8 }]}>
            <Ionicons name="camera" size={11} color="#FFFFFF" />
            <Text style={styles.photoCountText}>{listing.images.length}</Text>
          </View>
        )}
      </View>

      <View style={[styles.gridContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.priceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.priceNumber, { color: theme.primary }]}>
            {formattedPrice}
          </Text>
          <Text style={[styles.priceCurrency, { color: theme.primary }]}>
            {listing.currency || t('currencyUnit')}
          </Text>
        </View>

        <Text
          style={[
            styles.gridTitle,
            { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={2}
        >
          {listing.title}
        </Text>

        <View style={[styles.gridFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.locationWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="location-outline" size={12} color={theme.textMuted} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
              {listing.city}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: theme.textMuted }]}>
            {formatTime(listing.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Styles
  gridContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  gridImageWrap: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  featuredTag: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  gridFavoriteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gridStatusBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  gridContent: {
    padding: 10,
  },
  priceRow: {
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  priceNumber: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  priceCurrency: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
    marginBottom: 6,
  },
  gridFooter: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 6,
  },
  locationWrap: {
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Horizontal styles
  horizontalContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
    padding: 10,
    gap: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalImageWrap: {
    width: 105,
    height: 105,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  horizontalTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  horizontalFooter: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    padding: 6,
  },
});
