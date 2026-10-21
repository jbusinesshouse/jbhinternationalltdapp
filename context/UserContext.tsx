import { fetchMyProfile } from '@/lib/catalogApi'
import { unregisterPushTokenFromBackend } from '@/lib/pushNotifications'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type Profile = {
    id: string
    full_name: string | null
    district: string | null
    address?: string | null
    avatar_url?: string | null
    status: 'active' | 'freeze' | 'restricted'
    store_type?: string | null
    store_name?: string | null
    phone?: string | null
    [key: string]: unknown
}

type UserContextType = {
    user: User | null
    session: Session | null
    profile: Profile | null
    loading: boolean
    isSettingUp: boolean
    setIsSettingUp: (val: boolean) => void
    refreshProfile: () => Promise<void>
    signOut: () => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

const AUTH_INIT_TIMEOUT_MS = 4000

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSettingUp, setIsSettingUp] = useState(false)
    const fetchGen = useRef(0)

    const fetchProfile = useCallback(async () => {
        const gen = ++fetchGen.current
        try {
            const res = await fetchMyProfile()
            if (gen !== fetchGen.current) return
            setProfile(res.profile)
        } catch (err) {
            if (gen !== fetchGen.current) return
            if (__DEV__) {
                console.warn('fetchProfile failed:', err)
            }
            setProfile(null)
        }
    }, [])

    // Reads the live session, not React state, so signup can refresh
    // immediately after the profile row is written.
    const refreshProfile = useCallback(async () => {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
            fetchGen.current += 1
            setProfile(null)
            return
        }
        await fetchProfile()
    }, [fetchProfile])

    useEffect(() => {
        let mounted = true
        let authReady = false

        const markReady = () => {
            if (!mounted || authReady) return
            authReady = true
            setLoading(false)
        }

        const safetyTimeout = setTimeout(markReady, AUTH_INIT_TIMEOUT_MS)

        // Sync callback only — never await Supabase inside (deadlocks auth on cold start)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return

            setSession(session)
            setUser(session?.user ?? null)
            markReady()

            if (session?.user) {
                void fetchProfile()
            } else {
                fetchGen.current += 1
                setProfile(null)
            }
        })

        return () => {
            mounted = false
            clearTimeout(safetyTimeout)
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    const signOut = async () => {
        await unregisterPushTokenFromBackend()
        await supabase.auth.signOut()
    }

    return (
        <UserContext.Provider
            value={{
                user,
                session,
                profile,
                loading,
                isSettingUp,
                setIsSettingUp,
                refreshProfile,
                signOut,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}


export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
