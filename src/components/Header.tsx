import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchFocus?: () => void;
  onSubmitSearch?: () => void;
  unreadNotifsCount?: number;
  onNotificationsPress?: () => void;
  onFilterPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showSearch = false,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  onSearchFocus,
  onSubmitSearch,
  unreadNotifsCount = 0,
  onNotificationsPress,
  onFilterPress,
  showBack = false,
  onBackPress,
  rightAction,
}) => {
  const { theme, isDark } = useAppTheme();
  const { t, isRTL } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      {/* Top row */}
      <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.brandWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="storefront" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.appName, { color: theme.text }]}>
                {t('appName')}
              </Text>
              <Text style={[styles.appTagline, { color: theme.textMuted }]}>
                {t('appTagline')}
              </Text>
            </View>
          </View>
        )}

        {title && !showSearch && (
          <Text style={[styles.screenTitle, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
        )}

        {/* Right actions */}
        <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {rightAction}

          {onNotificationsPress && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={onNotificationsPress}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
              {unreadNotifsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar row if enabled */}
      {showSearch && (
        <View style={[styles.searchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.textMuted}
              style={{ marginHorizontal: 8 }}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
              placeholder={searchPlaceholder || t('searchPlaceholder')}
              placeholderTextColor={theme.textMuted}
              value={searchValue}
              onChangeText={onSearchChange}
              onFocus={onSearchFocus}
              onSubmitEditing={onSubmitSearch}
              returnKeyType="search"
            />
            {searchValue.length > 0 && onSearchChange && (
              <TouchableOpacity onPress={() => onSearchChange('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {onFilterPress && (
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: theme.primaryLight }]}
              onPress={onFilterPress}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={20} color={theme.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  brandWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  appTagline: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: -2,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  actionsRow: {
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  searchRow: {
    marginTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
