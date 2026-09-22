import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppSettings } from '../../types';
import { db } from '../../services/database';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';
import { ConfirmModal } from '../../components/ConfirmModal';

interface AdminSettingsScreenProps {
  onBack: () => void;
}

export const AdminSettingsScreen: React.FC<AdminSettingsScreenProps> = ({ onBack }) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [appName, setAppName] = useState('');
  const [currency, setCurrency] = useState('ر.س');
  const [expiryDays, setExpiryDays] = useState('30');
  const [requireApproval, setRequireApproval] = useState(false);
  const [maxPhotos, setMaxPhotos] = useState('8');
  const [contactEmail, setContactEmail] = useState('');
  const [resetModalVisible, setResetModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await db.getSettings();
      setSettings(s);
      setAppName(s.appName);
      setCurrency(s.currency);
      setExpiryDays(String(s.defaultExpiryDays));
      setRequireApproval(s.requireAdminApproval);
      setMaxPhotos(String(s.maxPhotosPerListing));
      setContactEmail(s.contactEmail);
    })();
  }, []);

  const handleSave = async () => {
    await db.updateSettings({
      appName: appName.trim(),
      currency: currency.trim(),
      defaultExpiryDays: parseInt(expiryDays) || 30,
      requireAdminApproval: requireApproval,
      maxPhotosPerListing: parseInt(maxPhotos) || 8,
      contactEmail: contactEmail.trim(),
    });
    Alert.alert(t('success'), language === 'ar' ? 'تم حفظ إعدادات النظام' : 'Settings saved');
  };

  const handleResetData = async () => {
    await db.resetToDefaults();
    setResetModalVisible(false);
    Alert.alert(
      t('success'),
      language === 'ar'
        ? 'تمت إعادة تعيين قاعدة البيانات واستعادة البيانات التجريبية الأولية بنجاح'
        : 'Database reset to default seeds'
    );
    onBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('systemSettings')} showBack={true} onBackPress={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            اسم التطبيق والمنصة
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            value={appName}
            onChangeText={setAppName}
          />

          <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('currency')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={currency}
                onChangeText={setCurrency}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('adExpiryDays')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                keyboardType="numeric"
                value={expiryDays}
                onChangeText={setExpiryDays}
              />
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('maxPhotosAllowed')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            keyboardType="numeric"
            value={maxPhotos}
            onChangeText={setMaxPhotos}
          />

          <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            بريد الدعم الفني
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                color: theme.text,
                textAlign: 'left',
              },
            ]}
            keyboardType="email-address"
            value={contactEmail}
            onChangeText={setContactEmail}
          />

          {/* Require Approval Toggle */}
          <View
            style={[
              styles.switchRow,
              {
                backgroundColor: theme.surfaceSecondary,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                نظام مراجعة الإعلانات الإلزامي
              </Text>
              <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                {requireApproval
                  ? 'أي إعلان جديد يمر بطابور مراجعة المشرف أولاً'
                  : 'النشر الفوري مفعل تلقائياً'}
              </Text>
            </View>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{t('saveSettings')}</Text>
          </TouchableOpacity>
        </View>

        {/* Database Reset Option */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 14 },
          ]}
        >
          <Text style={[styles.dangerTitle, { color: theme.error }]}>
            {language === 'ar' ? 'إعادة ضبط البيانات الأولية' : 'Database Reset & Seed'}
          </Text>
          <Text style={[styles.dangerText, { color: theme.textSecondary }]}>
            {language === 'ar'
              ? 'يمكنك استعادة البيانات الأولية للتجربة (المستخدمين، الإعلانات، التصنيفات، المحادثات) ومسح أي بيانات معدلة.'
              : 'Restore initial seed data for users, ads, chats and reports.'}
          </Text>
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: theme.error }]}
            onPress={() => setResetModalVisible(true)}
          >
            <Ionicons name="refresh" size={16} color={theme.error} />
            <Text style={[styles.resetBtnText, { color: theme.error }]}>
              {language === 'ar' ? 'إعادة تعيين قاعدة البيانات' : 'Reset Database'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={resetModalVisible}
        title="تأكيد إعادة التعيين"
        message="هل أنت متأكد من رغبتك في استعادة البيانات التجريبية الأولية ومسح أي تغييرات؟"
        confirmText="نعم، أعد التعيين"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setResetModalVisible(false)}
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
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  row: {
    gap: 10,
  },
  switchRow: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
  },
  saveBtn: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  dangerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  resetBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
