import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';

interface AuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel }) => {
  const { theme } = useAppTheme();
  const { t, isRTL, language } = useLanguage();
  const { login, register, switchUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى إدخال البريد وكلمة المرور' : 'Please fill all fields');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      Alert.alert(t('error'), res.error || 'فشل تسجيل الدخول');
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى تعبئة كافة الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    setLoading(true);
    const res = await register(name, email, phone, city);
    setLoading(false);
    if (res.success) {
      Alert.alert(t('success'), language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created');
      onSuccess();
    } else {
      Alert.alert(t('error'), res.error || 'فشل إنشاء الحساب');
    }
  };

  const handleForgot = () => {
    if (!email.trim()) {
      Alert.alert(t('error'), language === 'ar' ? 'يرجى إدخال بريدك الإلكتروني' : 'Enter your email');
      return;
    }
    Alert.alert(
      t('success'),
      language === 'ar'
        ? `تم إرسال رابط استعادة كلمة المرور إلى ${email}`
        : `Recovery instructions sent to ${email}`
    );
    setMode('login');
  };

  // Quick preset login helper
  const handleFastLogin = async (userId: string) => {
    await switchUser(userId);
    onSuccess();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('forgotPassword')}
        showBack={true}
        onBackPress={onCancel}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand Banner */}
        <View style={styles.brandBox}>
          <View style={[styles.brandLogo, { backgroundColor: theme.primary }]}>
            <Ionicons name="storefront" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>{t('appName')}</Text>
          <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
            {t('appTagline')}
          </Text>
        </View>

        {/* Tab switch */}
        <View
          style={[
            styles.modeSwitch,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.modeBtn,
              mode === 'login' && [styles.modeBtnActive, { backgroundColor: theme.surface }],
            ]}
            onPress={() => setMode('login')}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'login' ? theme.primary : theme.textSecondary },
              ]}
            >
              {t('login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              mode === 'register' && [styles.modeBtnActive, { backgroundColor: theme.surface }],
            ]}
            onPress={() => setMode('register')}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'register' ? theme.primary : theme.textSecondary },
              ]}
            >
              {t('register')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {mode === 'register' && (
            <>
              <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('name')} *
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
                placeholder="محمد عبدالله"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('phoneNumber')} *
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
                placeholder="+966501234567"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('city')}
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
                placeholder="الرياض"
                placeholderTextColor={theme.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </>
          )}

          <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('email')} *
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
            placeholder="user@example.com"
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {mode !== 'forgot' && (
            <>
              <Text style={[styles.label, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('password')} *
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
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          )}

          {mode === 'login' && (
            <TouchableOpacity
              onPress={() => setMode('forgot')}
              style={[styles.forgotBtn, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}
            >
              <Text style={[styles.forgotBtnText, { color: theme.primary }]}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={
              mode === 'login'
                ? handleLogin
                : mode === 'register'
                ? handleRegister
                : handleForgot
            }
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'login'
                  ? t('login')
                  : mode === 'register'
                  ? t('register')
                  : t('sendResetLink')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Demo Logins for Fast Review */}
        <View style={styles.demoBox}>
          <Text style={[styles.demoTitle, { color: theme.textMuted }]}>
            {language === 'ar' ? 'أو سجل الدخول بنقرة واحدة للتجربة:' : 'Or one-tap demo login:'}
          </Text>

          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={[styles.demoPill, { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' }]}
              onPress={() => handleFastLogin('user_admin')}
            >
              <Ionicons name="shield-checkmark" size={14} color="#7C3AED" />
              <Text style={[styles.demoPillText, { color: '#7C3AED' }]}>
                {language === 'ar' ? 'حساب المشرف (Admin)' : 'Admin User'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, { backgroundColor: '#D1FAE5', borderColor: '#059669' }]}
              onPress={() => handleFastLogin('user_1')}
            >
              <Ionicons name="person" size={14} color="#059669" />
              <Text style={[styles.demoPillText, { color: '#059669' }]}>
                {language === 'ar' ? 'حساب بائع (طارق)' : 'Seller (Tariq)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}
              onPress={() => handleFastLogin('user_3')}
            >
              <Ionicons name="person" size={14} color="#3B82F6" />
              <Text style={[styles.demoPillText, { color: '#3B82F6' }]}>
                {language === 'ar' ? 'حساب مشتري (عمر)' : 'Buyer (Omar)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  brandBox: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 13,
  },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  modeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  forgotBtn: {
    paddingVertical: 4,
  },
  forgotBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
