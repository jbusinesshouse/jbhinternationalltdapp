import { AppAlertProvider } from '@/context/AppAlertContext'
import { ChatInboxProvider } from '@/context/ChatInboxContext'
import { UserProvider, useUser } from '@/context/UserContext'
import useAppUpdate from '@/hooks/useAppUpdate'
import { useProtectedRoute } from "@/hooks/useAuth"
import { useKeyboardBehavior } from '@/hooks/useKeyboardBehavior'
import usePlatformFeeDueAlert from '@/hooks/usePlatformFeeDueAlert'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Stack } from "expo-router"
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native"
import { GestureHandlerRootView } from 'react-native-gesture-handler'

/**
 * Banner component to show account status warnings
 */
const AccountStatusBanner = ({ status }: { status: string }) => {
  const config = {
    freeze: { color: '#ef4444', text: 'আপনার অ্যাকাউন্ট স্থগিত আছে। সাপোর্টে যোগাযোগ করুন।' },
    restricted: { color: '#f59e0b', text: 'আপনার অ্যাকাউন্ট সীমিত করা হয়েছে। কিছু সুবিধা ব্যবহার করা যাবে না।' }
  }[status as 'freeze' | 'restricted'] || { color: '#6b7280', text: 'অ্যাকাউন্ট সম্পর্কে নোটিশ' };

  return (
    <View style={[styles.banner, { backgroundColor: config.color }]}>
      <Text style={styles.bannerText}>{config.text}</Text>
    </View>
  );
};

function RootLayoutNav() {
  const { profile, loading } = useUser();
  useProtectedRoute();

  useAppUpdate();
  usePlatformFeeDueAlert();
  usePushNotifications();

  // Hide splash as soon as this tree mounts — do NOT call preventAutoHideAsync
  // (that can leave Expo Go stuck on the splash forever if JS stalls).
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) {
    return <View style={styles.boot} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {profile?.status && profile.status !== 'active' && (
        <AccountStatusBanner status={profile.status} />
      )}

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="search/[query]" />
        <Stack.Screen name="messages/[id]" />
      </Stack>
    </View>
  )
}

export default function RootLayout() {
  const behaviour = useKeyboardBehavior()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ChatInboxProvider>
          <AppAlertProvider>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={behaviour}
              keyboardVerticalOffset={0}
            >
              <RootLayoutNav />
            </KeyboardAvoidingView>
          </AppAlertProvider>
        </ChatInboxProvider>
      </UserProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  banner: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  bannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  }
})
