import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export type TabKey = 'home' | 'search' | 'add' | 'chat' | 'profile';

interface BottomNavigationProps {
  currentTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  unreadChatsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabPress,
  unreadChatsCount = 0,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();

  const tabs: { key: TabKey; label: string; icon: any; activeIcon: any }[] = [
    {
      key: 'home',
      label: t('home'),
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      key: 'search',
      label: t('search'),
      icon: 'search-outline',
      activeIcon: 'search',
    },
    {
      key: 'add',
      label: t('postAd'),
      icon: 'add',
      activeIcon: 'add',
    },
    {
      key: 'chat',
      label: t('chat'),
      icon: 'chatbubbles-outline',
      activeIcon: 'chatbubbles',
    },
    {
      key: 'profile',
      label: t('profile'),
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;

        // Post Ad central action button
        if (tab.key === 'add') {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.centerAddWrap}
              onPress={() => onTabPress('add')}
              activeOpacity={0.85}
            >
              <View style={[styles.centerAddButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.primary : theme.textSecondary, marginTop: 4 },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={23}
                color={isActive ? theme.primary : theme.textMuted}
              />
              {tab.key === 'chat' && unreadChatsCount > 0 && (
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>
                    {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? theme.primary : theme.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrap: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  centerAddWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerAddButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
