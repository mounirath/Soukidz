import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { User, UserRole } from '../../types';
import { db } from '../../services/database';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

interface AdminUsersScreenProps {
  onBack: () => void;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ onBack }) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const all = await db.getUsers();
      setUsers(all);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleToggleBan = async (user: User) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    await db.updateUser(user.id, { status: newStatus });
    await loadUsers();
    Alert.alert(
      t('success'),
      newStatus === 'suspended'
        ? language === 'ar'
          ? 'تم تعطيل حساب المستخدم'
          : 'User account suspended'
        : language === 'ar'
        ? 'تم تفعيل حساب المستخدم'
        : 'User account activated'
    );
  };

  const handleToggleRole = async (user: User) => {
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    await db.updateUser(user.id, { role: newRole });
    await loadUsers();
    Alert.alert(
      t('success'),
      newRole === 'admin'
        ? language === 'ar'
          ? 'تمت ترقية المستخدم إلى مشرف'
          : 'Promoted to Admin'
        : language === 'ar'
        ? 'تم سحب صلاحيات الإدارة'
        : 'Admin role revoked'
    );
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      language === 'ar' ? 'حذف الحساب' : 'Delete Account',
      language === 'ar'
        ? `هل تريد حذف حساب ${user.name} نهائياً؟`
        : `Delete ${user.name} permanently?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            await db.deleteUser(user.id);
            await loadUsers();
          },
        },
      ]
    );
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={`${t('manageUsers')} (${users.length})`} showBack={true} onBackPress={onBack} />

      {/* Search Bar */}
      <View style={[styles.searchBoxWrap, { backgroundColor: theme.surface }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surfaceSecondary, flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={language === 'ar' ? 'ابحث بالاسم، البريد أو المدينة...' : 'Search user...'}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
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
          const isSuspended = item.status === 'suspended';
          const isAdmin = item.role === 'admin';

          return (
            <View
              style={[
                styles.userCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.userTopRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />

                <View
                  style={[
                    styles.infoCol,
                    { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                  ]}
                >
                  <View
                    style={[
                      styles.nameBadgeRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                    {isAdmin && (
                      <View style={[styles.badge, { backgroundColor: '#EDE9FE' }]}>
                        <Text style={{ color: '#7C3AED', fontSize: 10, fontWeight: '700' }}>Admin</Text>
                      </View>
                    )}
                    {isSuspended && (
                      <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: '700' }}>
                          {language === 'ar' ? 'معطل' : 'Banned'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                    {item.email}
                  </Text>
                  <Text style={[styles.metaText, { color: theme.textMuted }]}>
                    {item.city} • {item.phone} • {item.adsCount || 0} إعلانات
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View
                style={[
                  styles.actionsRow,
                  { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: isSuspended ? '#D1FAE5' : '#FEE2E2' },
                  ]}
                  onPress={() => handleToggleBan(item)}
                >
                  <Ionicons
                    name={isSuspended ? 'shield-checkmark' : 'ban'}
                    size={14}
                    color={isSuspended ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: isSuspended ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {isSuspended ? t('unbanUser') : t('banUser')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => handleToggleRole(item)}
                >
                  <Ionicons name="key-outline" size={14} color={theme.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                    {isAdmin ? t('removeAdmin') : t('makeAdmin')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={14} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBoxWrap: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchBar: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  userCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  userTopRow: {
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  nameBadgeRow: {
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  userEmail: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 11,
  },
  actionsRow: {
    borderTopWidth: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
