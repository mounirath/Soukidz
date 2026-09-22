import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { ConfirmModal } from '../components/ConfirmModal';

interface ProfileScreenProps {
  onOpenMyListings: () => void;
  onOpenFavorites: () => void;
  onOpenNotifications: () => void;
  onOpenAdminPortal: () => void;
  onOpenAuth: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenMyListings,
  onOpenFavorites,
  onOpenNotifications,
  onOpenAdminPortal,
  onOpenAuth,
}) => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { currentUser, logout, updateProfile, switchUser, allUsers } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [switcherModalVisible, setSwitcherModalVisible] = useState(false);

  // Edit fields
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), 'الاسم مطلوب');
      return;
    }
    await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      avatar: avatar.trim(),
    });
    setEditModalVisible(false);
    Alert.alert(t('success'), language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Profile updated');
  };

  const handleLogout = async () => {
    await logout();
    setLogoutModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('profile')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        {currentUser ? (
          <View
            style={[
              styles.userCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.userHeaderRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Image
                source={{ uri: currentUser.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />

              <View
                style={[
                  styles.userInfo,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.nameBadgeRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {currentUser.name}
                  </Text>
                  {currentUser.role === 'admin' && (
                    <View style={[styles.roleBadge, { backgroundColor: '#EDE9FE' }]}>
                      <Text style={[styles.roleBadgeText, { color: '#7C3AED' }]}>
                        Admin
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {currentUser.email}
                </Text>

                <View
                  style={[
                    styles.userStatsRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <View
                    style={[
                      styles.statPill,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.statPillText, { color: theme.text }]}>
                      {currentUser.rating.toFixed(1)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statPill,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Ionicons name="location-outline" size={12} color={theme.primary} />
                    <Text style={[styles.statPillText, { color: theme.textSecondary }]}>
                      {currentUser.city}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statPill,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Ionicons name="pricetags-outline" size={12} color={theme.textMuted} />
                    <Text style={[styles.statPillText, { color: theme.textSecondary }]}>
                      {currentUser.adsCount || 0} {t('myAds')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={[
                styles.editProfileBtn,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => {
                setName(currentUser.name);
                setPhone(currentUser.phone);
                setCity(currentUser.city);
                setAvatar(currentUser.avatar);
                setEditModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={16} color={theme.text} />
              <Text style={[styles.editProfileBtnText, { color: theme.text }]}>
                {t('editProfile')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.loginCard, { backgroundColor: theme.primary }]}
            onPress={onOpenAuth}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.loginCardInner,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.loginCardTitle}>{t('login')} / {t('register')}</Text>
                <Text style={styles.loginCardSubtitle}>
                  {language === 'ar'
                    ? 'سجل حسابك الآن لتتمكن من نشر الإعلانات ومراسلة البائعين'
                    : 'Sign in to post listings and chat with buyers'}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={24}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Admin Portal Banner (Always easily accessible to test admin features) */}
        <TouchableOpacity
          style={[
            styles.adminCard,
            {
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          onPress={onOpenAdminPortal}
          activeOpacity={0.88}
        >
          <View style={styles.adminIconBox}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          </View>
          <View
            style={[
              styles.adminTextWrap,
              { alignItems: isRTL ? 'flex-end' : 'flex-start' },
            ]}
          >
            <View
              style={[
                styles.adminTitleRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={styles.adminCardTitle}>{t('adminPortal')}</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin Web Panel</Text>
              </View>
            </View>
            <Text
              style={[
                styles.adminCardDesc,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {language === 'ar'
                ? 'إدارة الإعلانات، مراجعة البلاغات، إدارة المستخدمين، إحصائيات النظام وقاعدة البيانات'
                : 'Moderate listings, users, categories, reports, stats & SQL docs'}
            </Text>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {/* Fast Switch User Helper (Critical for reviewing real two-party chat & roles!) */}
        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          onPress={() => setSwitcherModalVisible(true)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.menuLeft,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people-outline" size={18} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>
                {language === 'ar' ? 'تبديل الحساب التجريبي' : 'Fast Demo User Switcher'}
              </Text>
              <Text style={[styles.menuSublabel, { color: theme.textMuted }]}>
                {language === 'ar'
                  ? `الحساب الحالي: ${currentUser?.name || 'غير مسجل'}`
                  : `Current: ${currentUser?.name || 'None'}`}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        {/* Section: Shortcuts */}
        <View
          style={[
            styles.menuGroup,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.groupItem,
              { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={onOpenMyListings}
          >
            <View
              style={[
                styles.menuLeft,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: theme.surfaceSecondary }]}>
                <Ionicons name="file-tray-full-outline" size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{t('myAds')}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.groupItem,
              { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={onOpenFavorites}
          >
            <View
              style={[
                styles.menuLeft,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="heart-outline" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{t('favorites')}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.groupItem,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={onOpenNotifications}
          >
            <View
              style={[
                styles.menuLeft,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="notifications-outline" size={18} color="#D97706" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{t('notifications')}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Section: Preferences */}
        <View
          style={[
            styles.menuGroup,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Dark Mode Toggle */}
          <View
            style={[
              styles.groupItem,
              { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.menuLeft,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: theme.surfaceSecondary }]}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny-outline'}
                  size={18}
                  color={isDark ? '#F59E0B' : theme.text}
                />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>
                {isDark ? t('darkMode') : t('lightMode')}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          {/* Language Selector */}
          <TouchableOpacity
            style={[
              styles.groupItem,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={() => setLangModalVisible(true)}
          >
            <View
              style={[
                styles.menuLeft,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: theme.surfaceSecondary }]}>
                <Ionicons name="globe-outline" size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{t('language')}</Text>
            </View>
            <View
              style={[
                styles.langValueRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.langValueText, { color: theme.primary }]}>
                {language === 'ar' ? 'العربية (RTL)' : language === 'fr' ? 'Français' : 'English'}
              </Text>
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={theme.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout or Login option */}
        {currentUser && (
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Ionicons name="log-out-outline" size={18} color={theme.error} />
            <Text style={[styles.logoutBtnText, { color: theme.error }]}>{t('logout')}</Text>
          </TouchableOpacity>
        )}

        {/* Version info */}
        <View style={styles.footerVersion}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            {t('appName')} v2.4.0 — Production Build
          </Text>
          <Text style={[styles.versionSub, { color: theme.textMuted }]}>
            PostgreSQL • Supabase • REST API Architecture
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal visible={langModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('language')}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {[
                { code: 'ar' as LanguageCode, label: 'العربية (Arabic - RTL)', flag: '🇸🇦' },
                { code: 'en' as LanguageCode, label: 'English (United States)', flag: '🇺🇸' },
                { code: 'fr' as LanguageCode, label: 'Français (French)', flag: '🇫🇷' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langItem,
                    {
                      backgroundColor:
                        language === item.code ? theme.primaryLight : theme.surfaceSecondary,
                      borderColor:
                        language === item.code ? theme.primary : theme.border,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                  onPress={async () => {
                    await setLanguage(item.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={styles.flagText}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.langItemText,
                      {
                        color: language === item.code ? theme.primaryDark : theme.text,
                        fontWeight: language === item.code ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {language === item.code && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.editForm}>
              <Text style={[styles.inputLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('name')}
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.inputLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('phoneNumber')}
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={[styles.inputLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('city')}
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={city}
                onChangeText={setCity}
              />

              <Text style={[styles.inputLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {language === 'ar' ? 'رابط الصورة الشخصية' : 'Avatar URL'}
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: 'left',
                  },
                ]}
                value={avatar}
                onChangeText={setAvatar}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>{t('saveChanges')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Demo Switcher Modal */}
      <Modal visible={switcherModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {language === 'ar' ? 'تبديل المستخدم التجريبي' : 'Switch Demo User'}
              </Text>
              <TouchableOpacity onPress={() => setSwitcherModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16, gap: 10 }}>
              {allUsers.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.switchUserItem,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.surfaceSecondary,
                        borderColor: isSelected ? theme.primary : theme.border,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                    onPress={async () => {
                      await switchUser(u.id);
                      setSwitcherModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: u.avatar }} style={styles.switchAvatar} contentFit="cover" />
                    <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.switchName, { color: theme.text }]}>{u.name}</Text>
                        {u.role === 'admin' && (
                          <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 6, borderRadius: 4 }}>
                            <Text style={{ color: '#7C3AED', fontSize: 10, fontWeight: '700' }}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: theme.textMuted, fontSize: 11 }}>{u.email}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout confirmation */}
      <ConfirmModal
        visible={logoutModalVisible}
        title={t('logout')}
        message={
          language === 'ar'
            ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟'
            : 'Are you sure you want to log out?'
        }
        confirmText={t('logout')}
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  userCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeaderRow: {
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  nameBadgeRow: {
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
  },
  userStatsRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editProfileBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginCard: {
    borderRadius: 18,
    padding: 18,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  loginCardInner: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  loginCardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  loginCardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  adminCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  adminIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminTextWrap: {
    flex: 1,
    gap: 2,
  },
  adminTitleRow: {
    alignItems: 'center',
    gap: 8,
  },
  adminCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  adminBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  adminCardDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  menuItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSublabel: {
    fontSize: 11,
  },
  menuGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  groupItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  langValueRow: {
    alignItems: 'center',
    gap: 6,
  },
  langValueText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerVersion: {
    alignItems: 'center',
    gap: 2,
    marginTop: 10,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  versionSub: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  langList: {
    padding: 16,
    gap: 10,
  },
  langItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  flagText: {
    fontSize: 20,
  },
  langItemText: {
    fontSize: 14,
    flex: 1,
  },
  editForm: {
    padding: 16,
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  formInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  switchUserItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  switchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  switchName: {
    fontSize: 14,
    fontWeight: '700',
  },
});
