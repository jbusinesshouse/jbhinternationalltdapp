import { useOrders } from '@/hooks/useOrders'
import { styles } from '@/styles/profile'
import { useNavigation, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native'

const Orders = () => {
    const navigation = useNavigation()
    const router = useRouter()

    const { orders, loading, refetch } = useOrders()

    // 🔥 local refresh state
    const [refreshing, setRefreshing] = useState(false)

    // ---------------- REFRESH ----------------
    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        try {
            await refetch() // 🔥 REAL DB REFRESH
        } catch (err) {
            console.log('Refresh error:', err)
        } finally {
            setRefreshing(false)
        }
    }, [refetch])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>

                <Text style={styles.headerTitle}>Orders</Text>

                <View style={{ width: 30 }} />
            </View>

            {/* SCROLL + REFRESH */}
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.section}>

                    {/* EMPTY STATE */}
                    {orders.length === 0 ? (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>
                            No orders found
                        </Text>
                    ) : (
                        orders.map((order: any) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onPress={() => router.push(`/orders/${order.id}`)}
                            />
                        ))
                    )}

                </View>
            </ScrollView>
        </View>
    )
}

/* ================= CARD ================= */

const OrderCard = ({ order, onPress }: any) => {

    const getStatusColor = () => {
        switch (order.status?.toLowerCase()) {
            case 'completed':
                return 'green'
            case 'pending':
                return 'orange'
            case 'cancelled':
                return 'red'
            default:
                return 'gray'
        }
    }

    const totalItems =
        order.order_items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
        ) || 0

    const totalPrice =
        order.order_items?.reduce(
            (sum: number, item: any) =>
                sum + item.price_snapshot * item.quantity,
            0
        ) || 0

    return (
        <Pressable style={styles.linkRow} onPress={onPress}>
            <View style={{ flex: 1 }}>

                <Text style={styles.linkText}>
                    {order.order_items?.[0]?.product_name_snapshot || 'Order'}
                </Text>

                <Text style={{ fontSize: 12, opacity: 0.6 }}>
                    {totalItems} items • ৳{totalPrice.toFixed(2)} •{' '}
                    <Text style={{ color: getStatusColor() }}>
                        {order.status}
                    </Text>
                </Text>
            </View>

            <Image
                source={require('@/assets/images/icons/chevron-right.png')}
                style={styles.linkIcon}
            />
        </Pressable>
    )
}

export default Orders