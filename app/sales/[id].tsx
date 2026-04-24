import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'

type Order = {
    id: string
    status: string
    created_at: string
    full_name: string
    phone: string
    email: string
    city: string
    delivery_address: string
    order_items?: any[]
}

const SalesDetails = () => {
    const navigation = useNavigation()
    const { id } = useLocalSearchParams<{ id: string }>()

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    const [modalVisible, setModalVisible] = useState(false)
    const [pendingStatus, setPendingStatus] = useState<string | null>(null)

    const fetchOrder = async () => {
        if (!id) return

        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        quantity,
                        price_snapshot,
                        product_name_snapshot,
                        product_variants (color),
                        product_sizes (size)
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setOrder(data as any)

        } catch (err) {
            if (__DEV__) {
                console.log(err)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrder()
    }, [id])

    const askUpdateStatus = (status: string) => {
        setPendingStatus(status)
        setModalVisible(true)
    }

    const confirmUpdate = async (statusToApply: string) => {
        if (!order || !statusToApply) return

        const oldStatus = order.status

        try {
            setUpdating(true)

            setOrder(prev =>
                prev ? { ...prev, status: statusToApply } : prev
            )

            const { error } = await supabase
                .from('orders')
                .update({ status: statusToApply })
                .eq('id', order.id)

            if (error) throw error

        } catch (err) {
            if (__DEV__) {
                console.log(err)
            }
            setOrder(prev =>
                prev ? { ...prev, status: oldStatus } : prev
            )
        } finally {
            setUpdating(false)
            setModalVisible(false)
            setPendingStatus(null)
        }
    }

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    if (!order) {
        return (
            <View style={s.center}>
                <Text>Order not found</Text>
            </View>
        )
    }

    const totalItems =
        order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

    const totalPrice =
        order.order_items?.reduce(
            (sum: number, item: any) => sum + item.price_snapshot * item.quantity,
            0
        ) || 0

    const getStatusColor = () => {
        switch (order.status) {
            case 'completed': return '#16a34a'
            case 'pending': return '#f59e0b'
            case 'processing': return '#3b82f6'
            case 'shipped': return '#8b5cf6'
            case 'cancelled': return '#ef4444'
            default: return '#6b7280'
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>

            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>

                <Text style={styles.headerTitle}>Sales Details</Text>

                <View style={{ width: 30 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll}>

                {/* ORDER */}
                <Card>
                    <SectionTitle>Order</SectionTitle>

                    <Text style={s.titleText}>
                        {order.order_items?.[0]?.product_name_snapshot || 'Order'}
                    </Text>

                    <Text style={s.subText}>
                        {totalItems} items • ৳{totalPrice.toFixed(2)}
                    </Text>

                    <View style={{ marginTop: 10 }}>
                        {order.order_items?.map((item: any, index: number) => (
                            <View key={index} style={{ marginBottom: 8 }}>

                                <View style={s.badgeRow}>
                                    {item.product_variants?.color && (
                                        <View style={s.badge}>
                                            <Text style={s.badgeText}>
                                                {item.product_variants.color}
                                            </Text>
                                        </View>
                                    )}

                                    {item.product_sizes?.size && (
                                        <View style={s.badge}>
                                            <Text style={s.badgeText}>
                                                {item.product_sizes.size}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={s.subText}>
                                    ৳{item.price_snapshot} × {item.quantity}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* STATUS */}
                <Card>
                    <SectionTitle>Status</SectionTitle>

                    <Text style={[s.titleText, { color: getStatusColor() }]}>
                        {order.status}
                    </Text>

                    <View style={s.btnRow}>
                        <StatusBtn label="Processing" onPress={() => askUpdateStatus('processing')} active={order.status === 'processing'} disabled={updating} />
                        <StatusBtn label="Shipped" onPress={() => askUpdateStatus('shipped')} active={order.status === 'shipped'} disabled={updating} />
                        <StatusBtn label="Completed" onPress={() => askUpdateStatus('completed')} active={order.status === 'completed'} disabled={updating} />
                        <StatusBtn label="Cancelled" onPress={() => askUpdateStatus('cancelled')} active={order.status === 'cancelled'} danger disabled={updating} />
                    </View>
                </Card>

                {/* CUSTOMER */}
                <Card>
                    <SectionTitle>Customer</SectionTitle>
                    <Info label="Name" value={order.full_name} />
                    <Info label="Phone" value={order.phone} />
                    <Info label="Email" value={order.email || 'N/A'} />
                </Card>

                {/* DELIVERY */}
                <Card>
                    <SectionTitle>Delivery</SectionTitle>
                    <Info label="City" value={order.city} />
                    <Info label="Address" value={order.delivery_address} />
                </Card>

            </ScrollView>

            {/* MODAL */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={s.modalBg}>
                    <View style={s.modalBox}>
                        <Text style={s.titleText}>Confirm Status Update</Text>

                        <Text style={s.subText}>
                            Change status to "{pendingStatus}"?
                        </Text>

                        <View style={s.modalBtnRow}>
                            <Pressable style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </Pressable>

                            <Pressable
                                style={s.confirmBtn}
                                onPress={() => confirmUpdate(pendingStatus!)}
                                disabled={updating}
                            >
                                <Text style={{ color: '#fff' }}>
                                    {updating ? 'Updating...' : 'Confirm'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

/* ================= COMPONENTS ================= */

const Card = ({ children }: any) => <View style={s.card}>{children}</View>

const SectionTitle = ({ children }: any) => (
    <Text style={s.sectionTitle}>{children}</Text>
)

const Info = ({ label, value }: any) => (
    <View style={{ marginBottom: 8 }}>
        <Text style={s.labelText}>{label}</Text>
        <Text style={s.valueText}>{value}</Text>
    </View>
)

const StatusBtn = ({ label, onPress, active, danger, disabled }: any) => (
    <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
            s.statusBtn,
            active && (danger ? s.dangerBtn : s.activeBtn),
            disabled && { opacity: 0.5 }
        ]}
    >
        <Text style={{ color: active ? '#fff' : '#111', fontSize: 12 }}>
            {label}
        </Text>
    </Pressable>
)

/* ================= STYLES ================= */

const s = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 15 },

    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 14,
        marginBottom: 12
    },

    sectionTitle: { fontSize: 12, opacity: 0.5, marginBottom: 8 },

    titleText: { fontSize: 16, fontWeight: '600' },

    subText: { fontSize: 13, opacity: 0.6 },

    badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

    badge: {
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3
    },

    badgeText: { fontSize: 12, color: '#444', fontWeight: '500' },

    btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

    statusBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0'
    },

    activeBtn: { backgroundColor: '#111' },

    dangerBtn: { backgroundColor: '#ef4444' },

    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20
    },

    modalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12
    },

    modalBtnRow: { flexDirection: 'row', marginTop: 20, gap: 10 },

    cancelBtn: {
        flex: 1,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 8,
        alignItems: 'center'
    },

    confirmBtn: {
        flex: 1,
        padding: 10,
        backgroundColor: '#111',
        borderRadius: 8,
        alignItems: 'center'
    },

    labelText: { fontSize: 11, opacity: 0.5 },

    valueText: { fontSize: 14, fontWeight: '500' }
})

export default SalesDetails