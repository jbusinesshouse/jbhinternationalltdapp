import { UserContext } from '@/context/UserContext'
import { useRootNavigationState, useRouter, useSegments } from 'expo-router'
import { useContext, useEffect } from 'react'

export const useAuth = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error('useAuth must be used within UserProvider')

    return {
        ...context,
        isAuthenticated: !!context.session,
    }
}

export const useProtectedRoute = () => {
    const { isAuthenticated, loading, isSettingUp } = useAuth()
    const segments = useSegments()
    const router = useRouter()
    const rootNavigationState = useRootNavigationState()
    const navigationReady = rootNavigationState?.key != null

    useEffect(() => {
        if (!navigationReady) return
        if (loading || isSettingUp) return

        const inAuthGroup = segments[0] === '(auth)'

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/signin')
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)')
        }
    }, [navigationReady, isAuthenticated, loading, isSettingUp, segments, router])

    return { isAuthenticated, loading }
}