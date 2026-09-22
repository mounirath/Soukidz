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
import { AppNotification } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';

interface NotificationsScreenProps {
  onBack: () => void;
  onOpenRelated: (notif: AppNotification) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenRelated,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifs = useCallback(async () => {
    if (!currentUser) return;
    try {
      const list = await db.getNotifications(currentUser.id);
      setNotifications(list);
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifs();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await db.markAllNotificationsRead(currentUser.id);
    await loadNotifs();
  };

  const handleNotificationPress = async (notif: AppNotification) => {
    await db.markNotificationRead(notif.id);
    await loadNotifs();
    onOpenRelated(notif);
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'message':
        return { name: 'chatbubble-ellipses', color: '#059669', bg: '#D1FAE5' };
      case 'ad_approved':
        return { name: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' };
      case 'ad_rejected':
        return { name: 'close-circle', color: '#EF4444', bg: '#FEE2E2' };
      case 'price_drop':
        return { name: 'trending-down', color: '#F59E0B', bg: '#FEF3C7' };
      case 'expired':
        return { name: 'timer-outline', color: '#6B7280', bg: '#F3F4F6' };
      case 'admin_alert':
        return { name: 'shield-alert', color: '#7C3AED', bg: '#EDE9FE' };
      default:
        return { name: 'notifications', color: '#3B82F6', bg: '#EFF6FF' };
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={t('notifications')}
        showBack={true}
        onBackPress={onBack}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
              <Text style={[styles.markReadText, { color: theme.primary }]}>
                {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FlatList
        data={notifications}
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
        renderItem={({ item }) => {
          const iconConfig = getNotifIcon(item.type);
          return (
            <TouchableOpacity
              style={[
                styles.notifCard,
                {
                  backgroundColor: item.isRead ? theme.surface : theme.card,
                  borderColor: item.isRead ? theme.border : theme.primary,
                  borderLeftWidth: item.isRead ? 1 : 4,
                  borderLeftColor: item.isRead ? theme.border : theme.primary,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconConfig.bg }]}>
                <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
              </View>

              <View
                style={[
                  styles.contentWrap,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.titleRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text
                  style={[
                    styles.body,
                    {
                      color: theme.textSecondary,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.body}
                </Text>

                <Text style={[styles.timeText, { color: theme.textMuted }]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}>
              <Ionicons name="notifications-off-outline" size={54} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {language === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications'}
            </Text>
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
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  notifCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
  },
  timeText: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
