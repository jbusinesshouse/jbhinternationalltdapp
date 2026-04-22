import { useSalesOrders } from '@/hooks/useSalesOrders'
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

const Sales = () => {
    const navigation = useNavigation()
    const router = useRouter()

    const { orders, loading, refetch } = useSalesOrders()

    // 🔥 ONLY ONE refreshing state (local UI state)
    const [refreshing, setRefreshing] = useState(false)

    // ---------------- REFRESH ----------------
    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        try {
            await refetch() // ✅ REAL DATABASE REFRESH
        } catch (err) {
            console.log('Refresh error:', err)
        } finally {
            setRefreshing(false)
        }
    }, [refetch])

    // 🔹 LOADING STATE
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

                <Text style={styles.headerTitle}>Sales Orders</Text>

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
                        <View style={{ marginTop: 40, alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#444' }}>
                                No sales yet
                            </Text>

                            <Text style={{ marginTop: 6, fontSize: 12, color: '#888', textAlign: 'center' }}>
                                When customers place orders, they will appear here
                            </Text>
                        </View>
                    ) : (
                        orders.map((order: any) => (
                            <SalesCard
                                key={order.id}
                                order={order}
                                onPress={() =>
                                    router.push(`/sales/${order.id}`)
                                }
                            />
                        ))
                    )}

                </View>
            </ScrollView>
        </View>
    )
}

/* ================= CARD ================= */

const SalesCard = ({ order, onPress }: any) => {
    const getStatusColor = () => {
        switch (order.status?.toLowerCase()) {
            case 'completed':
                return '#16a34a'
            case 'pending':
                return '#f59e0b'
            case 'cancelled':
                return '#ef4444'
            default:
                return '#6b7280'
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

    const customerName = order.full_name || 'Customer'

    return (
        <Pressable
            onPress={onPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                backgroundColor: '#fff',
                borderRadius: 10,
                marginBottom: 10
            }}
        >
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111' }}>
                    {customerName}
                </Text>

                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {totalItems} items • ৳{totalPrice.toFixed(2)}
                </Text>

                <Text style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: getStatusColor(),
                    fontWeight: '600',
                    textTransform: 'capitalize'
                }}>
                    {order.status}
                </Text>
            </View>

            <Image
                source={require('@/assets/images/icons/chevron-right.png')}
                style={styles.linkIcon}
            />
        </Pressable>
    )
}

export default Sales