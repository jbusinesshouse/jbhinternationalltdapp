import { supabase } from '@/lib/supabase'
import { useCallback, useEffect, useState } from 'react'

export const useOrders = () => {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    created_at,
                    full_name,
                    order_items (
                        quantity,
                        price_snapshot,
                        product_name_snapshot
                    )
                `)
                .eq('user_id', user.id)   // ✅ only this buyer's orders
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (err) {
            console.log('Fetch orders error:', err)
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await fetchOrders()
            setLoading(false)
        }
        init()
    }, [])

    const refetch = useCallback(async () => {
        setRefreshing(true)
        await fetchOrders()
        setRefreshing(false)
    }, [])

    return { orders, loading, refreshing, refetch }
}