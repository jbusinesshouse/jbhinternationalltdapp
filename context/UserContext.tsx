import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type Profile = {
    id: string
    full_name: string | null
    district: string | null
    address?: string | null
    avatar_url?: string | null
    status: 'active' | 'freeze' | 'restricted'
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

    // Fetch profile data
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (!error) {
            setProfile(data)
        } else {
            if (__DEV__) {
                console.warn('Profile not found or error:', error.message)
            }
            setProfile(null)
        }
    }

    useEffect(() => {
        let mounted = true
        let authReady = false

        const markReady = () => {
            if (!mounted || authReady) return
            authReady = true
            setLoading(false)
        }

        const timeout = setTimeout(markReady, AUTH_INIT_TIMEOUT_MS)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            setSession(session)
            setUser(session?.user ?? null)

            if (event === 'INITIAL_SESSION') {
                markReady()
            }

            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
        })

        return () => {
            mounted = false
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, [])

    const signOut = async () => {
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
                refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
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