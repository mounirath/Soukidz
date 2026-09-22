import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing, Category, FilterOptions } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';
import { FilterModal } from '../components/FilterModal';

interface SearchScreenProps {
  initialCategoryId?: string;
  onSelectListing: (listing: Listing) => void;
  onBack?: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  initialCategoryId,
  onSelectListing,
  onBack,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categoryId: initialCategoryId,
    sortBy: 'newest',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadData = useCallback(async () => {
    try {
      const cats = await db.getCategories();
      setCategories(cats);

      const combinedFilters: FilterOptions = {
        ...filters,
        keyword: keyword.trim() || undefined,
      };

      const results = await db.getListings(combinedFilters);
      // only show published listings in normal search
      setListings(results.filter((l) => l.status === 'published'));

      const favs = await db.getFavoriteIds();
      setFavoriteIds(favs);
    } catch (e) {
      console.error(e);
    }
  }, [filters, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (id: string) => {
    await db.toggleFavorite(id);
    const updated = await db.getFavoriteIds();
    setFavoriteIds(updated);
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.subcategoryId) count++;
    if (filters.city) count++;
    if (filters.condition) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.onlyFeatured) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  const activeCategory = categories.find((c) => c.id === filters.categoryId);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        showSearch={true}
        showBack={!!onBack}
        onBackPress={onBack}
        searchValue={keyword}
        onSearchChange={setKeyword}
        onSubmitSearch={loadData}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      {/* Quick category chips row */}
      <View style={[styles.categoriesBar, { backgroundColor: theme.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.chipsScroll,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.quickChip,
              {
                backgroundColor: !filters.categoryId ? theme.primary : theme.surfaceSecondary,
                borderColor: !filters.categoryId ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilters((prev) => ({ ...prev, categoryId: undefined, subcategoryId: undefined }))}
          >
            <Text
              style={[
                styles.quickChipText,
                { color: !filters.categoryId ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    categoryId: isSelected ? undefined : cat.id,
                    subcategoryId: undefined,
                  }))
                }
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.quickChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {language === 'en' ? cat.nameEn : language === 'fr' ? cat.nameFr : cat.nameAr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active filters pill bar & Result counts */}
      <View
        style={[
          styles.resultsMetaBar,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
          {language === 'ar'
            ? `نتائج البحث: ${listings.length} إعلان`
            : `${listings.length} items found`}
        </Text>

        <View style={[styles.metaActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[
              styles.filterPillBtn,
              {
                backgroundColor: activeFiltersCount > 0 ? theme.primaryLight : theme.surfaceSecondary,
                borderColor: activeFiltersCount > 0 ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="filter"
              size={13}
              color={activeFiltersCount > 0 ? theme.primaryDark : theme.textSecondary}
            />
            <Text
              style={[
                styles.filterPillText,
                { color: activeFiltersCount > 0 ? theme.primaryDark : theme.textSecondary },
              ]}
            >
              {t('filter')} {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Toggle View Mode */}
          <TouchableOpacity
            style={[styles.viewModeBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
              size={17}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Listings List */}
      <FlatList
        data={listings}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={
          viewMode === 'grid'
            ? { justifyContent: 'space-between', paddingHorizontal: 16 }
            : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          viewMode === 'list' && { paddingHorizontal: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (viewMode === 'list') {
            return (
              <ListingCard
                listing={item}
                onPress={() => onSelectListing(item)}
                onFavoritePress={() => handleToggleFavorite(item.id)}
                isFavorited={favoriteIds.includes(item.id)}
                layout="horizontal"
              />
            );
          }
          return (
            <View style={styles.gridItem}>
              <ListingCard
                listing={item}
                onPress={() => onSelectListing(item)}
                onFavoritePress={() => handleToggleFavorite(item.id)}
                isFavorited={favoriteIds.includes(item.id)}
                layout="grid"
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}>
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t('noAdsFound')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {language === 'ar'
                ? 'جرب البحث بكلمات أخرى أو قم بإزالة بعض الفلاتر'
                : 'Try different keywords or adjust your filters'}
            </Text>
            <TouchableOpacity
              style={[styles.resetSearchBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setKeyword('');
                setFilters({ sortBy: 'newest' });
              }}
            >
              <Text style={styles.resetSearchText}>{t('resetFilters')}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        categories={categories}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  chipsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsMetaBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaActions: {
    alignItems: 'center',
    gap: 8,
  },
  filterPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewModeBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  gridItem: {
    width: '48.5%',
  },
  emptyContainer: {
    paddingTop: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
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
  resetSearchBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetSearchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
