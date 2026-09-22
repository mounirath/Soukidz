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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Listing, Category, ListingCondition, ListingStatus } from '../types';
import { db } from '../services/database';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';

interface AddListingScreenProps {
  existingListing?: Listing;
  onSuccess: () => void;
  onCancel: () => void;
}

const CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة المكرمة',
  'المدينة المنورة',
  'الخبر',
  'دبي',
  'أبوظبي',
  'الدوحة',
  'الكويت',
  'القاهرة',
  'الدار البيضاء',
  'عمان',
];

// Curated high quality sample photos library for fast multi-image selection
const SAMPLE_MARKETPLACE_PHOTOS = [
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80',
];

export const AddListingScreen: React.FC<AddListingScreenProps> = ({
  existingListing,
  onSuccess,
  onCancel,
}) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { currentUser } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(existingListing?.title || '');
  const [description, setDescription] = useState(existingListing?.description || '');
  const [selectedCatId, setSelectedCatId] = useState(existingListing?.categoryId || '');
  const [selectedSubId, setSelectedSubId] = useState(existingListing?.subcategoryId || '');
  const [price, setPrice] = useState(existingListing ? String(existingListing.price) : '');
  const [currency, setCurrency] = useState(existingListing?.currency || 'ر.س');
  const [condition, setCondition] = useState<ListingCondition>(existingListing?.condition || 'like_new');
  const [city, setCity] = useState(existingListing?.city || currentUser?.city || 'الرياض');
  const [area, setArea] = useState(existingListing?.area || 'حي النرجس');
  const [phone, setPhone] = useState(existingListing?.phone || currentUser?.phone || '+966501234567');
  const [showPhone, setShowPhone] = useState(existingListing ? existingListing.showPhone : true);
  const [images, setImages] = useState<string[]>(
    existingListing?.images || [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    ]
  );
  const [hasLocationCoords, setHasLocationCoords] = useState(!!existingListing?.coordinates);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const cats = await db.getCategories();
      setCategories(cats);
      if (!selectedCatId && cats.length > 0) {
        setSelectedCatId(cats[0].id);
        if (cats[0].subcategories && cats[0].subcategories.length > 0) {
          setSelectedSubId(cats[0].subcategories[0].id);
        }
      }
    })();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCatId);

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.subcategories && cat.subcategories.length > 0) {
      setSelectedSubId(cat.subcategories[0].id);
    } else {
      setSelectedSubId('');
    }
  };

  const handleAddPhoto = (url: string) => {
    if (images.includes(url)) {
      setImages(images.filter((img) => img !== url));
    } else {
      if (images.length >= 8) {
        Alert.alert(language === 'ar' ? 'تنبيه' : 'Notice', t('maxPhotosNotice', { max: 8 }));
        return;
      }
      setImages([...images, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setImages(updated);
  };

  const handleFetchCurrentLocation = () => {
    setHasLocationCoords(true);
    setArea(language === 'ar' ? 'موقعي الحالي (تم التحديد بالـ GPS)' : 'Current Location (GPS Verified)');
    Alert.alert(
      language === 'ar' ? 'تم تحديد الموقع' : 'Location Set',
      language === 'ar'
        ? 'تم تحديد إحداثيات الموقع بنجاح. سيتم إظهار الحي التقريبي حفاظاً على الخصوصية.'
        : 'GPS coordinates retrieved successfully.'
    );
  };

  const validate = () => {
    if (!title.trim() || title.length < 5) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى إدخال عنوان واضح للإعلان' : 'Please enter a valid title');
      return false;
    }
    if (!description.trim() || description.length < 10) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى كتابة وصف مفصل لا يقل عن 10 أحرف' : 'Please write a detailed description');
      return false;
    }
    if (!price || isNaN(parseFloat(price))) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى إدخال سعر صالح' : 'Please enter a valid price');
      return false;
    }
    if (images.length === 0) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى إضافة صورة واحدة على الأقل للإعلان' : 'Please add at least one photo');
      return false;
    }
    return true;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft && !validate()) return;

    if (!currentUser) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    setSubmitting(true);
    try {
      const listingData = {
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone,
          avatar: currentUser.avatar,
          rating: currentUser.rating,
          city: currentUser.city,
          verified: currentUser.emailVerified,
          memberSince: currentUser.createdAt.split('T')[0],
        },
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCatId,
        subcategoryId: selectedSubId,
        price: parseFloat(price) || 0,
        currency,
        city,
        area: area.trim(),
        coordinates: hasLocationCoords
          ? { latitude: 24.7136, longitude: 46.6753 }
          : undefined,
        phone: phone.trim(),
        showPhone,
        images,
        condition,
        status: asDraft ? ('draft' as ListingStatus) : ('published' as ListingStatus),
        isFeatured: false,
      };

      if (existingListing) {
        await db.updateListing(existingListing.id, listingData);
        Alert.alert(t('success'), language === 'ar' ? 'تم تحديث الإعلان بنجاح' : 'Ad updated successfully');
      } else {
        const created = await db.createListing(listingData);
        const msg =
          created.status === 'pending'
            ? t('submittedForReview')
            : t('publishedDirectly');
        Alert.alert(t('success'), msg);
      }

      onSuccess();
    } catch (e) {
      console.error(e);
      Alert.alert(t('error'), 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  const conditions: { id: ListingCondition; label: string }[] = [
    { id: 'new', label: t('conditionNew') },
    { id: 'like_new', label: t('conditionLikeNew') },
    { id: 'good', label: t('conditionGood') },
    { id: 'fair', label: t('conditionFair') },
  ];

  // Dummy mock listing for preview modal
  const previewListingMock: Listing = {
    id: 'preview_mock',
    userId: currentUser?.id || 'guest',
    user: {
      id: currentUser?.id || 'guest',
      name: currentUser?.name || 'مستخدم',
      phone: phone || '',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      rating: 5.0,
      city: city || 'الرياض',
      verified: true,
      memberSince: '2026',
    },
    title: title || 'عنوان الإعلان التجريبي',
    description: description || 'وصف تفصيلي للمنتج...',
    categoryId: selectedCatId,
    subcategoryId: selectedSubId,
    price: parseFloat(price) || 0,
    currency,
    city,
    area,
    phone,
    showPhone,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'],
    condition,
    status: 'published',
    isFeatured: false,
    viewsCount: 1,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={existingListing ? t('editAd') : t('createNewAd')}
        showBack={true}
        onBackPress={onCancel}
        rightAction={
          <TouchableOpacity
            style={[styles.previewHeaderBtn, { backgroundColor: theme.primaryLight }]}
            onPress={() => setPreviewVisible(true)}
          >
            <Ionicons name="eye-outline" size={17} color={theme.primaryDark} />
            <Text style={[styles.previewHeaderText, { color: theme.primaryDark }]}>
              {t('previewAd')}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photos Section */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.sectionHeadingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="images-outline" size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {t('uploadImages')} ({images.length}/8)
            </Text>
          </View>
          <Text style={[styles.firstIsCoverNotice, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('firstIsCover')}
          </Text>

          {/* Photos Grid / Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.photosRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {/* Add Photo Button */}
            <TouchableOpacity
              style={[
                styles.addPhotoSlot,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.primary },
              ]}
              onPress={() => setPhotoPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={26} color={theme.primary} />
              <Text style={[styles.addPhotoSlotText, { color: theme.primary }]}>
                {t('selectPhotos')}
              </Text>
            </TouchableOpacity>

            {images.map((imgUri, index) => (
              <View key={`img_${index}`} style={styles.photoThumbWrap}>
                <Image source={{ uri: imgUri }} style={styles.photoThumb} contentFit="cover" />
                {index === 0 && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>{t('coverImage')}</Text>
                  </View>
                )}
                {index !== 0 && (
                  <TouchableOpacity
                    style={styles.makeCoverBtn}
                    onPress={() => handleSetCover(index)}
                  >
                    <Ionicons name="star" size={11} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="trash" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Basic Info: Title & Description */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('adTitle')} *
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
            placeholder={t('adTitlePlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text
            style={[
              styles.fieldLabel,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left', marginTop: 12 },
            ]}
          >
            {t('adDescription')} *
          </Text>
          <TextInput
            style={[
              styles.textarea,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                color: theme.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            placeholder={t('adDescriptionPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category & Subcategory */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('selectCategory')} *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipsScroll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleSelectCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.catChipText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {language === 'en' ? cat.nameEn : language === 'fr' ? cat.nameFr : cat.nameAr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.text, textAlign: isRTL ? 'right' : 'left', marginTop: 14 },
                ]}
              >
                {t('selectSubcategory')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.chipsScroll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              >
                {selectedCategory.subcategories.map((sub) => {
                  const isSelected = selectedSubId === sub.id;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedSubId(sub.id)}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {language === 'en' ? sub.nameEn : language === 'fr' ? sub.nameFr : sub.nameAr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>

        {/* Pricing & Condition */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.rowTwo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 2 }}>
              <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('price')} *
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
                placeholder="1000"
                placeholderTextColor={theme.textMuted}
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('currency')}
              </Text>
              <View
                style={[
                  styles.currencyBox,
                  { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.currencyBoxText, { color: theme.text }]}>
                  {currency}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.fieldLabel,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left', marginTop: 14 },
            ]}
          >
            {t('condition')}
          </Text>
          <View style={[styles.conditionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {conditions.map((cond) => {
              const isSelected = condition === cond.id;
              return (
                <TouchableOpacity
                  key={cond.id}
                  style={[
                    styles.conditionBtn,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : theme.surfaceSecondary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setCondition(cond.id)}
                >
                  <Text
                    style={[
                      styles.conditionBtnText,
                      { color: isSelected ? theme.primaryDark : theme.textSecondary },
                    ]}
                  >
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location & Contact */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.fieldLabel, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('city')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipsScroll, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {CITIES.map((c) => {
              const isSelected = city === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setCity(c)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text
            style={[
              styles.fieldLabel,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left', marginTop: 12 },
            ]}
          >
            {t('area')}
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
            placeholder="مثال: حي العليا أو حي الروضة"
            placeholderTextColor={theme.textMuted}
            value={area}
            onChangeText={setArea}
          />

          <TouchableOpacity
            style={[
              styles.gpsBtn,
              {
                backgroundColor: hasLocationCoords ? theme.successLight : theme.surfaceSecondary,
                borderColor: hasLocationCoords ? theme.success : theme.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={handleFetchCurrentLocation}
          >
            <Ionicons
              name={hasLocationCoords ? 'checkmark-circle' : 'locate-outline'}
              size={18}
              color={hasLocationCoords ? theme.success : theme.primary}
            />
            <Text
              style={[
                styles.gpsBtnText,
                { color: hasLocationCoords ? theme.success : theme.primary },
              ]}
            >
              {hasLocationCoords
                ? language === 'ar'
                  ? 'تم ربط الإحداثيات GPS بنجاح'
                  : 'GPS Coordinates Verified'
                : language === 'ar'
                ? 'استخدام موقعي الجغرافي الحالي (GPS)'
                : 'Use Current GPS Location'}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.fieldLabel,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left', marginTop: 14 },
            ]}
          >
            {t('phoneNumber')}
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
            keyboardType="phone-pad"
            placeholder="+966 5X XXX XXXX"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
          />

          <View
            style={[
              styles.switchRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              {showPhone ? t('showPhone') : t('hidePhone')}
            </Text>
            <Switch
              value={showPhone}
              onValueChange={setShowPhone}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={showPhone ? theme.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsCol}>
          <TouchableOpacity
            style={[styles.publishBtn, { backgroundColor: theme.primary }]}
            onPress={() => handleSubmit(false)}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.publishBtnText}>
                  {existingListing ? t('saveChanges') : t('publishAd')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!existingListing && (
            <TouchableOpacity
              style={[
                styles.draftBtn,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
              onPress={() => handleSubmit(true)}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Ionicons name="save-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.draftBtnText, { color: theme.textSecondary }]}>
                {t('saveDraft')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Preset Photo Library Picker Modal */}
      <Modal visible={photoPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerCard, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.pickerHeader,
                { borderBottomColor: theme.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.pickerTitle, { color: theme.text }]}>
                {language === 'ar' ? 'اختر صوراً لإعلانك' : 'Select Photos for Listing'}
              </Text>
              <TouchableOpacity onPress={() => setPhotoPickerVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.pickerGrid}>
              {SAMPLE_MARKETPLACE_PHOTOS.map((uri, idx) => {
                const isSelected = images.includes(uri);
                return (
                  <TouchableOpacity
                    key={`sample_${idx}`}
                    style={[
                      styles.pickerGridItem,
                      isSelected && { borderColor: theme.primary, borderWidth: 3 },
                    ]}
                    onPress={() => handleAddPhoto(uri)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri }} style={styles.pickerImage} contentFit="cover" />
                    {isSelected && (
                      <View style={[styles.selectedCheck, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.pickerFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.donePickerBtn, { backgroundColor: theme.primary }]}
                onPress={() => setPhotoPickerVisible(false)}
              >
                <Text style={styles.donePickerText}>
                  {language === 'ar'
                    ? `تم الاختيار (${images.length} صور)`
                    : `Done (${images.length} Photos)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={previewVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.previewModalCard, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.previewModalHeader,
                {
                  backgroundColor: theme.surface,
                  borderBottomColor: theme.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.previewModalTitle, { color: theme.text }]}>
                {t('previewAd')}
              </Text>
              <View style={{ width: 30 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <ListingCard listing={previewListingMock} onPress={() => {}} layout="grid" />
              <View
                style={[
                  styles.previewDescCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.previewDescTitle, { color: theme.text }]}>
                  {t('adDescription')}
                </Text>
                <Text style={[styles.previewDescContent, { color: theme.textSecondary }]}>
                  {description || 'لا يوجد وصف مدخل بعد'}
                </Text>
              </View>
            </ScrollView>

            <View
              style={[
                styles.previewModalFooter,
                { backgroundColor: theme.surface, borderTopColor: theme.border },
              ]}
            >
              <TouchableOpacity
                style={[styles.publishBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setPreviewVisible(false);
                  handleSubmit(false);
                }}
              >
                <Text style={styles.publishBtnText}>{t('publishAd')}</Text>
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
  previewHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  previewHeaderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeadingRow: {
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  firstIsCoverNotice: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  photosRow: {
    gap: 10,
    paddingVertical: 4,
  },
  addPhotoSlot: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoSlotText: {
    fontSize: 10,
    fontWeight: '700',
  },
  photoThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#059669',
    paddingVertical: 2,
    alignItems: 'center',
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  makeCoverBtn: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  textarea: {
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowTwo: {
    alignItems: 'center',
    gap: 10,
  },
  currencyBox: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyBoxText: {
    fontSize: 14,
    fontWeight: '700',
  },
  conditionsRow: {
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  conditionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gpsBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonsCol: {
    gap: 10,
    marginTop: 6,
  },
  publishBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  draftBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  draftBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  pickerGrid: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  pickerGridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  pickerImage: {
    width: '100%',
    height: '100%',
  },
  selectedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
  donePickerBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donePickerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  previewModalCard: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  previewModalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewDescCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
    gap: 6,
  },
  previewDescTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewDescContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  previewModalFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
});
