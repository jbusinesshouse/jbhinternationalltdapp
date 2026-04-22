import { supabase } from '@/lib/supabase'
import { useCallback, useEffect, useState } from 'react'

export const useSalesOrders = () => {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // ✅ Get all product IDs belonging to this seller
            const { data: products, error: productError } = await supabase
                .from('products')
                .select('id')
                .eq('seller_id', user.id)

            if (productError) throw productError
            if (!products || products.length === 0) {
                setOrders([])
                return
            }

            const productIds = products.map((p) => p.id)

            // ✅ Get orders where product_id is one of seller's products
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
                .in('product_id', productIds)  // ✅ only orders for this seller's products
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (err) {
            console.log('Fetch sales orders error:', err)
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