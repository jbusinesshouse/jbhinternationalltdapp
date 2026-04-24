import { supabase } from '@/lib/supabase'
import { useCallback, useEffect, useState } from 'react'

export const useProfile = () => {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!error) setProfile(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const updateName = async (full_name: string) => {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('No user')

        const { error } = await supabase
            .from('profiles')
            .update({ full_name })
            .eq('id', user.id)

        if (error) throw error

        setProfile((prev: any) => ({ ...prev, full_name }))
    }

    return { profile, loading, updateName, refetch: fetchProfile }
}