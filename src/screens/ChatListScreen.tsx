import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Chat } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';

interface ChatListScreenProps {
  onSelectChat: (chat: Chat) => void;
  onExplore: () => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  onSelectChat,
  onExplore,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [chats, setChats] = useState<Chat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userChats = await db.getChatsForUser(currentUser.id);
      setChats(userChats);
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('messages')} />

      <FlatList
        data={chats}
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
          const isMeBuyer = currentUser?.id === item.buyerId;
          const otherName = isMeBuyer ? item.sellerName : item.buyerName;
          const otherAvatar = isMeBuyer ? item.sellerAvatar : item.buyerAvatar;
          const unreadCount = isMeBuyer ? item.unreadCountBuyer : item.unreadCountSeller;

          return (
            <TouchableOpacity
              style={[
                styles.chatItem,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => onSelectChat(item)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: otherAvatar }} style={styles.avatar} contentFit="cover" />
                {unreadCount > 0 && <View style={styles.onlineDot} />}
              </View>

              <View
                style={[
                  styles.chatInfo,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.nameRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                    {otherName}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.textMuted }]}>
                    {formatTime(item.lastMessageTime)}
                  </Text>
                </View>

                {/* Listing Reference Bar */}
                <View
                  style={[
                    styles.listingRef,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Ionicons name="pricetag-outline" size={12} color={theme.primary} />
                  <Text
                    style={[styles.listingRefTitle, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.listingTitle}
                  </Text>
                </View>

                <View
                  style={[
                    styles.msgRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text
                    style={[
                      styles.lastMsgText,
                      {
                        color: unreadCount > 0 ? theme.text : theme.textMuted,
                        fontWeight: unreadCount > 0 ? '700' : '400',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>

                  {unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Listing Thumbnail */}
              {item.listingImage && (
                <Image
                  source={{ uri: item.listingImage }}
                  style={styles.listingThumbnail}
                  contentFit="cover"
                />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSecondary }]}>
              <Ionicons name="chatbubbles-outline" size={54} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {language === 'ar' ? 'لا توجد محادثات نشطة' : 'No active chats'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {language === 'ar'
                ? 'ابدأ محادثة مع أي بائع مباشرة من صفحة تفاصيل الإعلان'
                : 'Start a chat directly from any listing page'}
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: theme.primary }]}
              onPress={onExplore}
            >
              <Text style={styles.exploreBtnText}>
                {language === 'ar' ? 'استعراض الإعلانات' : 'Browse Listings'}
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
    gap: 10,
    paddingBottom: 40,
  },
  chatItem: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '65%',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  listingRef: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  listingRefTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  msgRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  lastMsgText: {
    fontSize: 12,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  listingThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  emptyContainer: {
    paddingTop: 80,
    paddingHorizontal: 30,
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
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
