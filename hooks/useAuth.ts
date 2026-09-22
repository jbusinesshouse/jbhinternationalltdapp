import { UserContext } from '@/context/UserContext'
import { consumePendingReturnTo, isPublicRoute, setPendingReturnTo } from '@/lib/guestAuth'
import { type Href, useRootNavigationState, useRouter, useSegments } from 'expo-router'
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
        const canBrowseAsGuest = isPublicRoute(segments)

        if (!isAuthenticated && !canBrowseAsGuest) {
            const path = `/${segments.join('/')}`
            if (path !== '/' && !path.includes('[')) {
                setPendingReturnTo(path)
            }
            router.replace('/(auth)/signin')
        } else if (isAuthenticated && inAuthGroup) {
            const returnTo = consumePendingReturnTo()
            router.replace((returnTo || '/(tabs)') as Href)
        }
    }, [navigationReady, isAuthenticated, loading, isSettingUp, segments, router])

    return { isAuthenticated, loading }
}
