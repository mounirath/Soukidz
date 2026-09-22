import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Report, ReportStatus } from '../../types';
import { db } from '../../services/database';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

interface AdminReportsScreenProps {
  onBack: () => void;
}

export const AdminReportsScreen: React.FC<AdminReportsScreenProps> = ({ onBack }) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const all = await db.getReports();
      setReports(all);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    await db.updateReportStatus(reportId, status);
    await loadReports();
  };

  const handleDeleteListing = async (listingId?: string) => {
    if (!listingId) return;
    Alert.alert(
      language === 'ar' ? 'حذف الإعلان المخالف' : 'Take Down Ad',
      language === 'ar'
        ? 'هل تريد إزالة هذا الإعلان نهائياً من المنصة استجابة للبلاغ؟'
        : 'Remove this listing in response to report?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            await db.deleteListing(listingId);
            Alert.alert(t('success'), language === 'ar' ? 'تم حذف الإعلان المخالف' : 'Listing removed');
          },
        },
      ]
    );
  };

  const statusColors: Record<ReportStatus, { bg: string; text: string; label: string }> = {
    new: { bg: '#FEE2E2', text: '#DC2626', label: 'جديد' },
    under_review: { bg: '#FEF3C7', text: '#D97706', label: 'قيد المراجعة' },
    resolved: { bg: '#D1FAE5', text: '#059669', label: 'تمت المعالجة' },
    dismissed: { bg: '#F1F5F9', text: '#64748B', label: 'مرفوض / مستبعد' },
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={`${t('manageReports')} (${reports.length})`} showBack={true} onBackPress={onBack} />

      <FlatList
        data={reports}
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
          const cfg = statusColors[item.status] || statusColors.new;
          return (
            <View
              style={[
                styles.reportCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.cardHeader,
                  { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View
                  style={[
                    styles.reasonBadgeWrap,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Ionicons name="warning" size={16} color="#DC2626" />
                  <Text style={[styles.reasonText, { color: '#DC2626' }]}>
                    {item.reason}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: cfg.text }]}>
                    {cfg.label}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.cardBody,
                  { alignItems: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              >
                {item.listingTitle && (
                  <View
                    style={[
                      styles.metaLine,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                      {language === 'ar' ? 'الإعلان المُبلّغ عنه:' : 'Listing:'}
                    </Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>
                      {item.listingTitle}
                    </Text>
                  </View>
                )}

                {item.reportedUserName && (
                  <View
                    style={[
                      styles.metaLine,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                      {language === 'ar' ? 'صاحب الإعلان:' : 'Reported User:'}
                    </Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>
                      {item.reportedUserName}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.metaLine,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                    {language === 'ar' ? 'مقدم البلاغ:' : 'Reporter:'}
                  </Text>
                  <Text style={[styles.metaValue, { color: theme.textSecondary }]}>
                    {item.reporterName} • {formatDate(item.createdAt)}
                  </Text>
                </View>

                {item.details ? (
                  <View
                    style={[
                      styles.detailsBox,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <Text style={[styles.detailsText, { color: theme.textSecondary }]}>
                      "{item.details}"
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Actions row */}
              <View
                style={[
                  styles.actionsBar,
                  { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                  onPress={() => handleUpdateStatus(item.id, 'resolved')}
                >
                  <Ionicons name="checkmark-done" size={14} color="#059669" />
                  <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>
                    تمت المعالجة
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => handleUpdateStatus(item.id, 'dismissed')}
                >
                  <Ionicons name="close" size={14} color={theme.textMuted} />
                  <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600' }}>
                    استبعاد
                  </Text>
                </TouchableOpacity>

                {item.listingId && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDeleteListing(item.listingId)}
                  >
                    <Ionicons name="trash" size={14} color="#DC2626" />
                    <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '700' }}>
                      إزالة الإعلان
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={54} color={theme.success} />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
              {language === 'ar' ? 'سجل البلاغات نظيف' : 'No violation reports'}
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
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  reportCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  reasonBadgeWrap: {
    alignItems: 'center',
    gap: 6,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  metaLine: {
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBox: {
    marginTop: 4,
    padding: 8,
    borderRadius: 8,
    width: '100%',
  },
  detailsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionsBar: {
    borderTopWidth: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 12,
  },
});
