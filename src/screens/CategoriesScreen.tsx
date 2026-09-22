import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Category, Subcategory } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';

interface CategoriesScreenProps {
  onBack: () => void;
  onSelectCategory: (categoryId: string, subcategoryId?: string) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onBack,
  onSelectCategory,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cats = await db.getCategories();
      setCategories(cats);
      if (cats.length > 0) setExpandedId(cats[0].id);
    })();
  }, []);

  const getCategoryName = (c: Category) => {
    if (language === 'en') return c.nameEn;
    if (language === 'fr') return c.nameFr;
    return c.nameAr;
  };

  const getSubcategoryName = (s: Subcategory) => {
    if (language === 'en') return s.nameEn;
    if (language === 'fr') return s.nameFr;
    return s.nameAr;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('allCategories')} showBack={true} onBackPress={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => {
          const isExpanded = expandedId === cat.id;
          return (
            <View
              key={cat.id}
              style={[
                styles.categoryCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {/* Category Header Row */}
              <TouchableOpacity
                style={[
                  styles.cardHeader,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                onPress={() => setExpandedId(isExpanded ? null : cat.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.headerLeft,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name={cat.icon as any} size={22} color={theme.primary} />
                  </View>
                  <View>
                    <Text style={[styles.categoryTitle, { color: theme.text }]}>
                      {getCategoryName(cat)}
                    </Text>
                    <Text style={[styles.subsCount, { color: theme.textMuted }]}>
                      {cat.subcategories?.length || 0} {t('subcategories')}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.headerRight,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.viewAllBadge, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => onSelectCategory(cat.id)}
                  >
                    <Text style={[styles.viewAllText, { color: theme.primary }]}>
                      {t('viewAll')}
                    </Text>
                  </TouchableOpacity>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.textMuted}
                  />
                </View>
              </TouchableOpacity>

              {/* Subcategories list */}
              {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                <View style={[styles.subsContainer, { borderTopColor: theme.border }]}>
                  {cat.subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.subItem,
                        {
                          borderBottomColor: theme.border,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                      onPress={() => onSelectCategory(cat.id, sub.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.subItemText,
                          { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {getSubcategoryName(sub)}
                      </Text>
                      <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={16}
                        color={theme.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
    padding: 16,
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subsCount: {
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'center',
    gap: 8,
  },
  viewAllBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subsContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
  },
  subItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
