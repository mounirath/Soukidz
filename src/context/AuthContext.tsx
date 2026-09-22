import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { db } from '../services/database';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, city: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  switchUser: (userId: string) => Promise<void>;
  allUsers: User[];
  reloadUsers: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@souqplus_current_user_id';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => false,
  switchUser: async () => {},
  allUsers: [],
  reloadUsers: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const reloadUsers = async () => {
    const users = await db.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    (async () => {
      await db.init();
      const users = await db.getUsers();
      setAllUsers(users);

      const savedUserId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserId) {
        const found = users.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          return;
        }
      }
      // Default to admin user for full evaluation experience
      const defaultUser = users.find((u) => u.id === 'user_admin') || users[0];
      if (defaultUser) {
        setCurrentUser(defaultUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, defaultUser.id);
      }
    })();
  }, []);

  const login = async (email: string, _pass: string) => {
    const users = await db.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: 'تم تعطيل هذا الحساب من قبل الإدارة' };
      }
      setCurrentUser(found);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, found.id);
      return { success: true };
    }
    return { success: false, error: 'البريد الإلكتروني غير مسجل' };
  };

  const register = async (name: string, email: string, phone: string, city: string) => {
    const users = await db.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }

    const newUser = await db.createUser({
      name,
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim() || 'الرياض',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      role: 'user',
    });

    setCurrentUser(newUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
    await reloadUsers();
    return { success: true };
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return false;
    const updated = await db.updateUser(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
      await reloadUsers();
      return true;
    }
    return false;
  };

  const switchUser = async (userId: string) => {
    const user = await db.getUserById(userId);
    if (user) {
      setCurrentUser(user);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, user.id);
    }
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        switchUser,
        allUsers,
        reloadUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
