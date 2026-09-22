import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Category } from '../../types';
import { db } from '../../services/database';
import { useAppTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

interface AdminCategoriesScreenProps {
  onBack: () => void;
}

export const AdminCategoriesScreen: React.FC<AdminCategoriesScreenProps> = ({ onBack }) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('pricetag-outline');

  const loadCategories = useCallback(async () => {
    const data = await db.getCategories();
    setCategories(data);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      Alert.alert(t('error'), 'يرجى إدخال اسم التصنيف بالعربية والإنجليزية');
      return;
    }

    await db.addCategory({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      nameFr: nameEn.trim(),
      icon,
      slug: nameEn.toLowerCase().replace(/\s+/g, '-'),
      order: categories.length + 1,
      subcategories: [],
    });

    setNameAr('');
    setNameEn('');
    setModalVisible(false);
    await loadCategories();
    Alert.alert(t('success'), 'تمت إضافة التصنيف بنجاح');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'حذف التصنيف',
      `هل أنت متأكد من حذف تصنيف "${name}"؟`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            await db.deleteCategory(id);
            await loadCategories();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={`${t('manageCategories')} (${categories.length})`}
        showBack={true}
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>{language === 'ar' ? 'إضافة تصنيف' : 'Add'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => (
          <View
            key={cat.id}
            style={[
              styles.catCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.catCardHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.catHeaderLeft,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name={cat.icon as any} size={20} color={theme.primary} />
                </View>
                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.catName, { color: theme.text }]}>
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </Text>
                  <Text style={[styles.catSubText, { color: theme.textMuted }]}>
                    {cat.nameEn} • {cat.subcategories?.length || 0} تصنيفات فرعية
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => handleDelete(cat.id, cat.nameAr)}
              >
                <Ionicons name="trash-outline" size={17} color={theme.error} />
              </TouchableOpacity>
            </View>

            {/* Subcategories pills */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <View
                style={[
                  styles.subsWrap,
                  { borderTopColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {cat.subcategories.map((s) => (
                  <View
                    key={s.id}
                    style={[styles.subPill, { backgroundColor: theme.surfaceSecondary }]}
                  >
                    <Text style={[styles.subPillText, { color: theme.textSecondary }]}>
                      {s.nameAr}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {language === 'ar' ? 'إضافة تصنيف جديد' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formBody}>
              <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                الاسم بالعربية *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                    color: theme.text,
                    textAlign: 'right',
                  },
                ]}
                placeholder="مثال: ألعاب وهوايات"
                value={nameAr}
                onChangeText={setNameAr}
              />

              <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                الاسم بالإنجليزية (Name in English) *
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
                placeholder="e.g. Games & Hobbies"
                value={nameEn}
                onChangeText={setNameEn}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddCategory}
              >
                <Text style={styles.submitBtnText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  catCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  catCardHeader: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catHeaderLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catSubText: {
    fontSize: 11,
  },
  delBtn: {
    padding: 6,
  },
  subsWrap: {
    padding: 10,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 6,
  },
  subPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subPillText: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    overflow: 'hidden',
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
  formBody: {
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
