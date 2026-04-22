import { UserContext } from '@/context/UserContext'
import { useRouter, useSegments } from 'expo-router'
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

    useEffect(() => {
        // 🛑 If we are loading initial state OR busy setting up a new user, STOP.
        if (loading || isSettingUp) return

        const inAuthGroup = segments[0] === '(auth)'

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/signin')
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)')
        }
    }, [isAuthenticated, loading, isSettingUp, segments])

    return { isAuthenticated, loading }
}