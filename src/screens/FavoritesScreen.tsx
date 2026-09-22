import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';

interface FavoritesScreenProps {
  onSelectListing: (listing: Listing) => void;
  onExplore: () => void;
  onBack?: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onSelectListing,
  onExplore,
  onBack,
}) => {
  const { theme } = useAppTheme();
  const { t, language } = useLanguage();

  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const ids = await db.getFavoriteIds();
      setFavoriteIds(ids);
      const all = await db.getListings();
      const favs = all.filter((l) => ids.includes(l.id));
      setFavoriteListings(favs);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (id: string) => {
    await db.toggleFavorite(id);
    await loadFavorites();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={`${t('favorites')} (${favoriteListings.length})`}
        showBack={!!onBack}
        onBackPress={onBack}
      />

      <FlatList
        data={favoriteListings}
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
          <ListingCard
            listing={item}
            onPress={() => onSelectListing(item)}
            onFavoritePress={() => handleToggleFavorite(item.id)}
            isFavorited={true}
            layout="horizontal"
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}>
              <Ionicons name="heart-outline" size={54} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {language === 'ar' ? 'قائمة المفضلة فارغة' : 'Your favorites list is empty'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {language === 'ar'
                ? 'اضغط على رمز القلب في أي إعلان لحفظه والرجوع إليه لاحقاً'
                : 'Tap the heart icon on any ad to save it here'}
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: theme.primary }]}
              onPress={onExplore}
            >
              <Text style={styles.exploreBtnText}>
                {language === 'ar' ? 'تصفح الإعلانات الآن' : 'Browse Ads Now'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
