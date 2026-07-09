import { ChatInboxProvider } from '@/context/ChatInboxContext'
import { UserProvider, useUser } from '@/context/UserContext'
import useAppUpdate from '@/hooks/useAppUpdate'
import { useProtectedRoute } from "@/hooks/useAuth"
import { useKeyboardBehavior } from '@/hooks/useKeyboardBehavior'
import { Stack } from "expo-router"
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native"

SplashScreen.preventAutoHideAsync().catch(() => {})

/**
 * Banner component to show account status warnings
 */
const AccountStatusBanner = ({ status }: { status: string }) => {
  // Map styles based on the enum values
  const config = {
    freeze: { color: '#ef4444', text: 'Your account is frozen. Please contact support.' },
    restricted: { color: '#f59e0b', text: 'Your account is restricted. Some features may be limited.' }
  }[status as 'freeze' | 'restricted'] || { color: '#6b7280', text: 'Account notice' };

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

  const onLayoutRootView = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const fallback = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 500);
    return () => clearTimeout(fallback);
  }, []);

  // Don't mount navigation until auth is ready — prevents first-launch router crashes
  if (loading) {
    return <View style={styles.boot} onLayout={onLayoutRootView} />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* ✅ Banner shows above the stack if status is not 'active' */}
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
    <UserProvider>
      <ChatInboxProvider>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={behaviour}
          keyboardVerticalOffset={0}
        >
          <RootLayoutNav />
        </KeyboardAvoidingView>
      </ChatInboxProvider>
    </UserProvider>
  )
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  banner: {
    // Note: If you don't use a SafeAreaView, you need padding for the status bar
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