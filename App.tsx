import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  Text,
  BackHandler,
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BottomNavigation, TabKey } from './src/components/BottomNavigation';
import { Listing, Chat, AppNotification } from './src/types';
import { db } from './src/services/database';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { ListingDetailScreen } from './src/screens/ListingDetailScreen';
import { AddListingScreen } from './src/screens/AddListingScreen';
import { MyListingsScreen } from './src/screens/MyListingsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { AuthScreen } from './src/screens/AuthScreen';

// Admin Screens
import { AdminDashboardScreen } from './src/screens/Admin/AdminDashboardScreen';
import { AdminListingsScreen } from './src/screens/Admin/AdminListingsScreen';
import { AdminUsersScreen } from './src/screens/Admin/AdminUsersScreen';
import { AdminReportsScreen } from './src/screens/Admin/AdminReportsScreen';
import { AdminCategoriesScreen } from './src/screens/Admin/AdminCategoriesScreen';
import { AdminSettingsScreen } from './src/screens/Admin/AdminSettingsScreen';
import { AdminSchemaDocScreen } from './src/screens/Admin/AdminSchemaDocScreen';

type ScreenName =
  | 'tab'
  | 'listing_detail'
  | 'add_listing'
  | 'edit_listing'
  | 'chat_detail'
  | 'my_listings'
  | 'favorites'
  | 'notifications'
  | 'categories'
  | 'auth'
  | 'admin_dashboard'
  | 'admin_listings'
  | 'admin_users'
  | 'admin_reports'
  | 'admin_categories'
  | 'admin_settings'
  | 'admin_schema';

function MainApp() {
  const { theme, isDark } = useAppTheme();
  const { isRTL } = useLanguage();
  const { currentUser } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [screenStack, setScreenStack] = useState<
    { name: ScreenName; params?: any }[]
  >([{ name: 'tab' }]);
  const [unreadChats, setUnreadChats] = useState(0);

  const currentScreen = screenStack[screenStack.length - 1];

  // Refresh unread counters
  useEffect(() => {
    const updateCounters = async () => {
      if (currentUser) {
        const chats = await db.getChatsForUser(currentUser.id);
        const count = chats.reduce((acc, c) => {
          const isBuyer = currentUser.id === c.buyerId;
          return acc + (isBuyer ? c.unreadCountBuyer : c.unreadCountSeller);
        }, 0);
        setUnreadChats(count);
      }
    };
    updateCounters();
    const interval = setInterval(updateCounters, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle hardware back on Android
  useEffect(() => {
    const onBackPress = () => {
      if (screenStack.length > 1) {
        setScreenStack((prev) => prev.slice(0, prev.length - 1));
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [screenStack]);

  const navigateTo = (name: ScreenName, params?: any) => {
    setScreenStack((prev) => [...prev, { name, params }]);
  };

  const goBack = () => {
    setScreenStack((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      return prev;
    });
  };

  const handleStartChatWithListing = async (listing: Listing) => {
    if (!currentUser) {
      navigateTo('auth');
      return;
    }
    const chat = await db.createOrGetChat(listing, currentUser);
    navigateTo('chat_detail', { chat });
  };

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'listing_detail':
        return (
          <ListingDetailScreen
            listing={currentScreen.params?.listing}
            onBack={goBack}
            onStartChat={handleStartChatWithListing}
            onSelectSimilarListing={(l) => {
              setScreenStack((prev) => [
                ...prev.slice(0, prev.length - 1),
                { name: 'listing_detail', params: { listing: l } },
              ]);
            }}
          />
        );

      case 'add_listing':
        return (
          <AddListingScreen
            onSuccess={() => {
              goBack();
              setCurrentTab('home');
            }}
            onCancel={goBack}
          />
        );

      case 'edit_listing':
        return (
          <AddListingScreen
            existingListing={currentScreen.params?.listing}
            onSuccess={() => {
              goBack();
            }}
            onCancel={goBack}
          />
        );

      case 'chat_detail':
        return (
          <ChatDetailScreen
            chat={currentScreen.params?.chat}
            onBack={goBack}
            onViewListing={async (id) => {
              const l = await db.getListingById(id);
              if (l) navigateTo('listing_detail', { listing: l });
            }}
          />
        );

      case 'my_listings':
        return (
          <MyListingsScreen
            onSelectListing={(listing) => navigateTo('listing_detail', { listing })}
            onEditListing={(listing) => navigateTo('edit_listing', { listing })}
            onBack={goBack}
          />
        );

      case 'favorites':
        return (
          <FavoritesScreen
            onSelectListing={(listing) => navigateTo('listing_detail', { listing })}
            onExplore={() => {
              goBack();
              setCurrentTab('home');
            }}
            onBack={goBack}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            onBack={goBack}
            onOpenRelated={async (notif) => {
              if (notif.type === 'message' && notif.relatedId) {
                const c = await db.getChatById(notif.relatedId);
                if (c) navigateTo('chat_detail', { chat: c });
              } else if (notif.relatedId) {
                const l = await db.getListingById(notif.relatedId);
                if (l) navigateTo('listing_detail', { listing: l });
              }
            }}
          />
        );

      case 'categories':
        return (
          <CategoriesScreen
            onBack={goBack}
            onSelectCategory={(categoryId) => {
              goBack();
              setCurrentTab('search');
            }}
          />
        );

      case 'auth':
        return (
          <AuthScreen
            onSuccess={() => goBack()}
            onCancel={goBack}
          />
        );

      // Admin Portal Screens
      case 'admin_dashboard':
        return (
          <AdminDashboardScreen
            onBack={goBack}
            onNavigateTab={(tab) => {
              if (tab === 'listings') navigateTo('admin_listings');
              if (tab === 'users') navigateTo('admin_users');
              if (tab === 'reports') navigateTo('admin_reports');
              if (tab === 'categories') navigateTo('admin_categories');
              if (tab === 'settings') navigateTo('admin_settings');
              if (tab === 'schema') navigateTo('admin_schema');
            }}
            onOpenListing={(listing) => navigateTo('listing_detail', { listing })}
          />
        );

      case 'admin_listings':
        return (
          <AdminListingsScreen
            onBack={goBack}
            onOpenListing={(listing) => navigateTo('listing_detail', { listing })}
          />
        );

      case 'admin_users':
        return <AdminUsersScreen onBack={goBack} />;

      case 'admin_reports':
        return <AdminReportsScreen onBack={goBack} />;

      case 'admin_categories':
        return <AdminCategoriesScreen onBack={goBack} />;

      case 'admin_settings':
        return <AdminSettingsScreen onBack={goBack} />;

      case 'admin_schema':
        return <AdminSchemaDocScreen onBack={goBack} />;

      // Default: Bottom Tab Navigator Screens
      case 'tab':
      default:
        switch (currentTab) {
          case 'home':
            return (
              <HomeScreen
                onSelectListing={(listing) => navigateTo('listing_detail', { listing })}
                onOpenSearch={(catId) => {
                  setCurrentTab('search');
                }}
                onOpenNotifications={() => navigateTo('notifications')}
                onOpenAddListing={() => {
                  if (!currentUser) navigateTo('auth');
                  else navigateTo('add_listing');
                }}
                onOpenAllCategories={() => navigateTo('categories')}
              />
            );

          case 'search':
            return (
              <SearchScreen
                onSelectListing={(listing) => navigateTo('listing_detail', { listing })}
              />
            );

          case 'add':
            // Handled via onTabPress or redirected
            return (
              <AddListingScreen
                onSuccess={() => setCurrentTab('home')}
                onCancel={() => setCurrentTab('home')}
              />
            );

          case 'chat':
            return (
              <ChatListScreen
                onSelectChat={(chat) => navigateTo('chat_detail', { chat })}
                onExplore={() => setCurrentTab('home')}
              />
            );

          case 'profile':
            return (
              <ProfileScreen
                onOpenMyListings={() => navigateTo('my_listings')}
                onOpenFavorites={() => navigateTo('favorites')}
                onOpenNotifications={() => navigateTo('notifications')}
                onOpenAdminPortal={() => navigateTo('admin_dashboard')}
                onOpenAuth={() => navigateTo('auth')}
              />
            );
        }
    }
  };

  const showBottomNav = currentScreen.name === 'tab';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      <View style={styles.screenContainer}>{renderScreen()}</View>

      {showBottomNav && (
        <BottomNavigation
          currentTab={currentTab}
          onTabPress={(tab) => {
            if (tab === 'add' && !currentUser) {
              navigateTo('auth');
              return;
            }
            setCurrentTab(tab);
          }}
          unreadChatsCount={unreadChats}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  screenContainer: {
    flex: 1,
  },
});
