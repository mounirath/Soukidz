import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/database';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  listingId?: string;
  listingTitle?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  listingId,
  listingTitle,
  reportedUserId,
  reportedUserName,
  onSuccess,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedReason, setSelectedReason] = useState<string>('reasonScam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'reasonScam', label: t('reasonScam') },
    { id: 'reasonProhibited', label: t('reasonProhibited') },
    { id: 'reasonInappropriate', label: t('reasonInappropriate') },
    { id: 'reasonWrongInfo', label: t('reasonWrongInfo') },
    { id: 'reasonDuplicate', label: t('reasonDuplicate') },
    { id: 'reasonOther', label: t('reasonOther') },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    const chosenReasonLabel =
      reasons.find((r) => r.id === selectedReason)?.label || 'مخالفة';
    try {
      await db.createReport({
        listingId,
        listingTitle,
        reportedUserId,
        reportedUserName,
        reporterId: currentUser?.id || 'guest',
        reporterName: currentUser?.name || 'زائر',
        reason: chosenReasonLabel,
        details: details.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1400);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('reportTitle')}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          {submitted ? (
            <View style={styles.successWrap}>
              <Ionicons name="checkmark-circle" size={54} color={theme.success} />
              <Text style={[styles.successText, { color: theme.text }]}>
                {t('reportSuccess')}
              </Text>
            </View>
          ) : (
            <View style={styles.body}>
              <Text
                style={[
                  styles.label,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('selectReportReason')}:
              </Text>

              {reasons.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setSelectedReason(r.id)}
                    style={[
                      styles.reasonRow,
                      {
                        backgroundColor: isSelected
                          ? theme.primaryLight
                          : theme.surfaceSecondary,
                        borderColor: isSelected ? theme.primary : theme.border,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? theme.primary : theme.textMuted}
                    />
                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color: isSelected ? theme.primaryDark : theme.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TextInput
                style={[
                  styles.detailsInput,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={t('reportNotes')}
                placeholderTextColor={theme.textMuted}
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.error }]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>{t('submitReport')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  reasonRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  reasonLabel: {
    fontSize: 13,
    flex: 1,
  },
  detailsInput: {
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    marginTop: 4,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successWrap: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
