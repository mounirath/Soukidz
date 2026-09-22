import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Category, FilterOptions, ListingCondition, SortOption } from '../types';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  categories: Category[];
  initialFilters?: FilterOptions;
}

const CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة المكرمة',
  'المدينة المنورة',
  'الخبر',
  'دبي',
  'أبوظبي',
  'الدوحة',
  'الكويت',
  'القاهرة',
  'الدار البيضاء',
  'عمان',
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  categories,
  initialFilters = {},
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(
    initialFilters.categoryId
  );
  const [selectedSubId, setSelectedSubId] = useState<string | undefined>(
    initialFilters.subcategoryId
  );
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    initialFilters.city
  );
  const [selectedCondition, setSelectedCondition] = useState<
    ListingCondition | undefined
  >(initialFilters.condition);
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters.minPrice ? String(initialFilters.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters.maxPrice ? String(initialFilters.maxPrice) : ''
  );
  const [selectedSort, setSelectedSort] = useState<SortOption>(
    initialFilters.sortBy || 'newest'
  );
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(
    initialFilters.onlyFeatured || false
  );

  const selectedCategory = categories.find((c) => c.id === selectedCatId);

  const handleReset = () => {
    setSelectedCatId(undefined);
    setSelectedSubId(undefined);
    setSelectedCity(undefined);
    setSelectedCondition(undefined);
    setMinPrice('');
    setMaxPrice('');
    setSelectedSort('newest');
    setOnlyFeatured(false);
  };

  const handleApply = () => {
    onApply({
      categoryId: selectedCatId,
      subcategoryId: selectedSubId,
      city: selectedCity,
      condition: selectedCondition,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: selectedSort,
      onlyFeatured,
    });
    onClose();
  };

  const conditions: { id: ListingCondition; label: string }[] = [
    { id: 'new', label: t('conditionNew') },
    { id: 'like_new', label: t('conditionLikeNew') },
    { id: 'good', label: t('conditionGood') },
    { id: 'fair', label: t('conditionFair') },
  ];

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'newest', label: t('newest') },
    { id: 'price_asc', label: t('priceLowHigh') },
    { id: 'price_desc', label: t('priceHighLow') },
    { id: 'views_desc', label: t('mostViewed') },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: theme.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {t('filter')}
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={[styles.resetText, { color: theme.primary }]}>
                {t('resetFilters')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Sort By Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('sortBy')}
              </Text>
              <View
                style={[
                  styles.chipsWrap,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {sortOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSelectedSort(opt.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          selectedSort === opt.id
                            ? theme.primary
                            : theme.surfaceSecondary,
                        borderColor:
                          selectedSort === opt.id
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            selectedSort === opt.id
                              ? '#FFFFFF'
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Featured Only Toggle */}
            <TouchableOpacity
              style={[
                styles.toggleRow,
                {
                  backgroundColor: theme.surfaceSecondary,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setOnlyFeatured(!onlyFeatured)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleLabelWrap,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="sparkles" size={18} color="#D97706" />
                <Text style={[styles.toggleLabel, { color: theme.text }]}>
                  {language === 'ar'
                    ? 'إعلانات مميزة فقط'
                    : 'Featured Ads Only'}
                </Text>
              </View>
              <Ionicons
                name={onlyFeatured ? 'checkbox' : 'square-outline'}
                size={24}
                color={onlyFeatured ? theme.primary : theme.textMuted}
              />
            </TouchableOpacity>

            {/* Categories */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('selectCategory')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCatId(undefined);
                    setSelectedSubId(undefined);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        !selectedCatId ? theme.primary : theme.surfaceSecondary,
                      borderColor: !selectedCatId ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: !selectedCatId ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {t('viewAll')}
                  </Text>
                </TouchableOpacity>

                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setSelectedCatId(cat.id);
                      setSelectedSubId(undefined);
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          selectedCatId === cat.id
                            ? theme.primary
                            : theme.surfaceSecondary,
                        borderColor:
                          selectedCatId === cat.id
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={15}
                      color={
                        selectedCatId === cat.id
                          ? '#FFFFFF'
                          : theme.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            selectedCatId === cat.id
                              ? '#FFFFFF'
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {language === 'en'
                        ? cat.nameEn
                        : language === 'fr'
                        ? cat.nameFr
                        : cat.nameAr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Subcategories if category selected */}
            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {t('selectSubcategory')}
                </Text>
                <View
                  style={[
                    styles.chipsWrap,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  {selectedCategory.subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      onPress={() =>
                        setSelectedSubId(
                          selectedSubId === sub.id ? undefined : sub.id
                        )
                      }
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            selectedSubId === sub.id
                              ? theme.primary
                              : theme.surfaceSecondary,
                          borderColor:
                            selectedSubId === sub.id
                              ? theme.primary
                              : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              selectedSubId === sub.id
                                ? '#FFFFFF'
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {language === 'en'
                          ? sub.nameEn
                          : language === 'fr'
                          ? sub.nameFr
                          : sub.nameAr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Price Range */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('priceRange')} ({t('currencyUnit')})
              </Text>
              <View
                style={[
                  styles.priceInputsRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.priceInputWrap}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                    {t('minPrice')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                        color: theme.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>

                <Text style={{ color: theme.textMuted, fontSize: 18 }}>—</Text>

                <View style={styles.priceInputWrap}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                    {t('maxPrice')}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                        color: theme.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    keyboardType="numeric"
                    placeholder="∞"
                    placeholderTextColor={theme.textMuted}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>
            </View>

            {/* City */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('city')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedCity(undefined)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        !selectedCity ? theme.primary : theme.surfaceSecondary,
                      borderColor: !selectedCity ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: !selectedCity ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {t('allCities')}
                  </Text>
                </TouchableOpacity>

                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedCity(c)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          selectedCity === c
                            ? theme.primary
                            : theme.surfaceSecondary,
                        borderColor:
                          selectedCity === c ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            selectedCity === c
                              ? '#FFFFFF'
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Condition */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('condition')}
              </Text>
              <View
                style={[
                  styles.chipsWrap,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {conditions.map((cond) => (
                  <TouchableOpacity
                    key={cond.id}
                    onPress={() =>
                      setSelectedCondition(
                        selectedCondition === cond.id ? undefined : cond.id
                      )
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          selectedCondition === cond.id
                            ? theme.primary
                            : theme.surfaceSecondary,
                        borderColor:
                          selectedCondition === cond.id
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            selectedCondition === cond.id
                              ? '#FFFFFF'
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: theme.primary }]}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>{t('applyFilters')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 18,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipsWrap: {
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabelWrap: {
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceInputsRow: {
    alignItems: 'center',
    gap: 12,
  },
  priceInputWrap: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
