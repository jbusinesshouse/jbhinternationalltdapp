import { UserProvider, useUser } from '@/context/UserContext'
import useAppUpdate from '@/hooks/useAppUpdate'
import { useProtectedRoute } from "@/hooks/useAuth"
import { useKeyboardBehavior } from '@/hooks/useKeyboardBehavior'
import { Stack } from "expo-router"
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { Image, KeyboardAvoidingView, StyleSheet, Text, View } from "react-native"

// ✅ Keep system splash visible until we manually hide it
SplashScreen.preventAutoHideAsync()

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
  const { profile, loading: userLoading } = useUser();
  const { loading: authLoading } = useProtectedRoute();

  useAppUpdate();

  // Combine both loading states to ensure we have auth AND profile data before showing the app
  const isAppReady = !authLoading && !userLoading;

  useEffect(() => {
    const hide = async () => {
      if (isAppReady) {
        // small delay reduces MIUI black flash risk
        await new Promise(res => setTimeout(res, 70));
        await SplashScreen.hideAsync();
      }
    }
    hide();
  }, [isAppReady]);

  // Render Custom Splash if not ready
  if (!isAppReady) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('../assets/images/splash.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={behaviour}
        keyboardVerticalOffset={0}
      >
        <RootLayoutNav />
      </KeyboardAvoidingView>
    </UserProvider>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200
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