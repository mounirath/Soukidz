import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Category } from '../types';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface CategoryItemProps {
  category: Category;
  isSelected?: boolean;
  onPress: () => void;
  layout?: 'chip' | 'card' | 'circle';
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isSelected = false,
  onPress,
  layout = 'card',
}) => {
  const { theme } = useAppTheme();
  const { language } = useLanguage();

  const getCategoryName = (c: Category) => {
    if (language === 'en') return c.nameEn;
    if (language === 'fr') return c.nameFr;
    return c.nameAr;
  };

  if (layout === 'chip') {
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
            borderColor: isSelected ? theme.primary : theme.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={category.icon as any}
          size={16}
          color={isSelected ? '#FFFFFF' : theme.textSecondary}
        />
        <Text
          style={[
            styles.chipText,
            { color: isSelected ? '#FFFFFF' : theme.text },
          ]}
        >
          {getCategoryName(category)}
        </Text>
      </TouchableOpacity>
    );
  }

  // Card or Circle default
  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          backgroundColor: isSelected ? theme.primaryLight : theme.card,
          borderColor: isSelected ? theme.primary : theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
          },
        ]}
      >
        <Ionicons
          name={category.icon as any}
          size={24}
          color={isSelected ? '#FFFFFF' : theme.primary}
        />
      </View>
      <Text
        style={[
          styles.cardTitle,
          {
            color: isSelected ? theme.primaryDark : theme.text,
            fontWeight: isSelected ? '700' : '600',
          },
        ]}
        numberOfLines={2}
      >
        {getCategoryName(category)}
      </Text>
      {category.subcategories && category.subcategories.length > 0 && (
        <Text style={[styles.subCount, { color: theme.textMuted }]}>
          {category.subcategories.length} {language === 'ar' ? 'فروع' : 'types'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardContainer: {
    width: 100,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },
  subCount: {
    fontSize: 9,
    marginTop: 2,
  },
});
