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

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        Promise.resolve(promise)
            .then((value) => {
                clearTimeout(timer)
                resolve(value)
            })
            .catch((err) => {
                clearTimeout(timer)
                reject(err)
            })
    })
}

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

        const initAuth = async () => {
            try {
                const { data: { session } } = await withTimeout(
                    supabase.auth.getSession(),
                    AUTH_INIT_TIMEOUT_MS,
                    'getSession',
                )
                if (!mounted) return
                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) fetchProfile(session.user.id)
            } catch (err) {
                if (__DEV__) {
                    console.warn('Auth init failed:', err)
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initAuth()

        // Listen for Auth changes — may resolve after getSession times out on cold start
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => {
            mounted = false
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