import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useEffect, useState } from 'react'

type Profile = {
    id: string
    full_name: string | null
    district: string | null
    address?: string | null
    avatar_url?: string | null
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
        // Initial Session Load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            setLoading(false)
        })

        // Listen for Auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
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