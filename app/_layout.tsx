import { UserProvider } from '@/context/UserContext'
import useAppUpdate from '@/hooks/useAppUpdate'
import { useProtectedRoute } from "@/hooks/useAuth"
import { useKeyboardBehavior } from '@/hooks/useKeyboardBehavior'
import { Stack } from "expo-router"
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { Image, KeyboardAvoidingView, StyleSheet, View } from "react-native"

// ✅ Keep system splash visible until we manually hide it
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { loading } = useProtectedRoute()
  useAppUpdate()

  // ✅ Hide splash only when app is ready
  useEffect(() => {
    const hide = async () => {
      if (!loading) {
        // small delay reduces MIUI black flash risk
        await new Promise(res => setTimeout(res, 70))
        await SplashScreen.hideAsync()
      }
    }

    hide()
  }, [loading])

  // ✅ Custom splash (MATCHES your contain-style native splash)
  if (loading) {
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
      <Stack.Screen name="messages/[id]" options={{ headerShown: false }} />
    </Stack>
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

  // ✅ matches your expo splash config (imageWidth: 200 + contain)
  logo: {
    width: 200,
    height: 200
  }
})