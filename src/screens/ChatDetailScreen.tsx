import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Chat, Message, Listing } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ReportModal } from '../components/ReportModal';

interface ChatDetailScreenProps {
  chat: Chat;
  onBack: () => void;
  onViewListing?: (listingId: string) => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  chat,
  onBack,
  onViewListing,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isMeBuyer = currentUser?.id === chat.buyerId;
  const otherName = isMeBuyer ? chat.sellerName : chat.buyerName;
  const otherAvatar = isMeBuyer ? chat.sellerAvatar : chat.buyerAvatar;
  const otherId = isMeBuyer ? chat.sellerId : chat.buyerId;

  const loadMessages = async () => {
    const msgs = await db.getMessages(chat.id);
    setMessages(msgs);
    if (currentUser) {
      await db.markChatRead(chat.id, currentUser.id);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [chat.id]);

  const handleSendMessage = async (textToSend?: string, imageUrl?: string) => {
    const content = textToSend !== undefined ? textToSend : inputText;
    if (!content.trim() && !imageUrl) return;
    if (!currentUser) return;

    setInputText('');
    await db.sendMessage(chat.id, currentUser.id, content.trim(), imageUrl);
    await loadMessages();
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleSendQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  const handleSendSampleImage = () => {
    // Send simulated photo attachment
    handleSendMessage(
      '',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    );
  };

  const handleBlockUser = () => {
    Alert.alert(
      t('blockUser'),
      language === 'ar'
        ? `هل تريد حظر ${otherName}؟ لن يتمكن من مراسلتك مجدداً.`
        : `Block ${otherName}? They will no longer be able to message you.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('success'), language === 'ar' ? 'تم حظر المستخدم بنجاح' : 'User blocked');
            onBack();
          },
        },
      ]
    );
  };

  const quickReplies = [
    t('qrAvailable'),
    t('qrPrice'),
    t('qrLocation'),
  ];

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surfaceSecondary }]}
          onPress={onBack}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.headerUserInfo,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Image source={{ uri: otherAvatar }} style={styles.headerAvatar} contentFit="cover" />
          <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={[styles.headerUserName, { color: theme.text }]} numberOfLines={1}>
              {otherName}
            </Text>
            <View
              style={[
                styles.onlineIndicatorRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineStatusText, { color: theme.success }]}>
                {language === 'ar' ? 'نشط الآن' : 'Online'}
              </Text>
            </View>
          </View>
        </View>

        {/* Header Right Actions */}
        <View
          style={[
            styles.headerActions,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={[styles.iconActionBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => setReportModalVisible(true)}
          >
            <Ionicons name="flag-outline" size={17} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconActionBtn, { backgroundColor: theme.surfaceSecondary }]}
            onPress={handleBlockUser}
          >
            <Ionicons name="hand-left-outline" size={17} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Listing Summary Sticky Card */}
      <TouchableOpacity
        style={[
          styles.listingCardBanner,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
        onPress={() => onViewListing && onViewListing(chat.listingId)}
        activeOpacity={0.8}
      >
        {chat.listingImage ? (
          <Image
            source={{ uri: chat.listingImage }}
            style={styles.listingBannerImg}
            contentFit="cover"
          />
        ) : null}

        <View
          style={[
            styles.listingBannerContent,
            { alignItems: isRTL ? 'flex-end' : 'flex-start' },
          ]}
        >
          <Text
            style={[
              styles.listingBannerTitle,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {chat.listingTitle}
          </Text>
          <Text style={[styles.listingBannerPrice, { color: theme.primary }]}>
            {chat.listingPrice} {chat.listingCurrency}
          </Text>
        </View>

        <View style={[styles.viewListingChip, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.viewListingText, { color: theme.primaryDark }]}>
            {language === 'ar' ? 'عرض الإعلان' : 'View Ad'}
          </Text>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={12}
            color={theme.primaryDark}
          />
        </View>
      </TouchableOpacity>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMine = item.senderId === currentUser?.id;
          return (
            <View
              style={[
                styles.messageRow,
                isMine
                  ? { justifyContent: isRTL ? 'flex-start' : 'flex-end' }
                  : { justifyContent: isRTL ? 'flex-end' : 'flex-start' },
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMine
                    ? [styles.myBubble, { backgroundColor: theme.primary }]
                    : [
                        styles.otherBubble,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                      ],
                ]}
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.msgImageAttachment}
                    contentFit="cover"
                  />
                ) : null}

                {item.text ? (
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: isMine ? '#FFFFFF' : theme.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                ) : null}

                <View
                  style={[
                    styles.msgTimeRow,
                    {
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.msgTime,
                      { color: isMine ? 'rgba(255,255,255,0.7)' : theme.textMuted },
                    ]}
                  >
                    {formatMessageTime(item.createdAt)}
                  </Text>
                  {isMine && (
                    <Ionicons
                      name="checkmark-done"
                      size={13}
                      color="rgba(255,255,255,0.85)"
                    />
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Ionicons name="chatbubbles-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyMessagesText, { color: theme.textSecondary }]}>
              {t('noMessagesYet')}
            </Text>
          </View>
        }
      />

      {/* Quick Reply Pills */}
      <View
        style={[
          styles.quickRepliesContainer,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {quickReplies.map((qr, i) => (
          <TouchableOpacity
            key={`qr_${i}`}
            style={[
              styles.quickReplyPill,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
            ]}
            onPress={() => handleSendQuickReply(qr)}
          >
            <Text style={[styles.quickReplyText, { color: theme.textSecondary }]}>
              {qr}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.attachBtn, { backgroundColor: theme.surfaceSecondary }]}
          onPress={handleSendSampleImage}
        >
          <Ionicons name="image-outline" size={20} color={theme.primary} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
              color: theme.text,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder={t('typeMessage')}
          placeholderTextColor={theme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: inputText.trim() ? theme.primary : theme.surfaceSecondary },
          ]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name={isRTL ? 'arrow-back' : 'arrow-forward'}
            size={20}
            color={inputText.trim() ? '#FFFFFF' : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        listingId={chat.listingId}
        listingTitle={chat.listingTitle}
        reportedUserId={otherId}
        reportedUserName={otherName}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUserInfo: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
  },
  headerUserName: {
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 160,
  },
  onlineIndicatorRow: {
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  onlineStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  headerActions: {
    alignItems: 'center',
    gap: 6,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingCardBanner: {
    padding: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  listingBannerImg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  listingBannerContent: {
    flex: 1,
  },
  listingBannerTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  listingBannerPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  viewListingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewListingText: {
    fontSize: 10,
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  msgImageAttachment: {
    width: 200,
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTimeRow: {
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
  },
  emptyMessages: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyMessagesText: {
    fontSize: 13,
  },
  quickRepliesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  quickReplyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
