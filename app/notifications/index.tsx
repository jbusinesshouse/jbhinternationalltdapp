import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { useNavigation, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native'

type Notification = {
    id: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    order_id?: string | null
    type?: string | null
    action_completed?: boolean | null
}

const Notifications = () => {
    const navigation = useNavigation()
    const router = useRouter()

    const [storeType, setStoreType] = useState<string | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [actingId, setActingId] = useState<string | null>(null)

    /* ================= FETCH ================= */

    const fetchNotifications = async () => {
        try {
            setLoading(true)

            const {
                data: { user }
            } = await supabase.auth.getUser()

            if (!user) return

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setNotifications(data || [])
        } catch (err) {
            if (__DEV__) {
                console.log('Fetch notifications error:', err)
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('store_type')
            .eq('id', user.id)
            .single()

        setStoreType(data?.store_type || null)
    }

    useEffect(() => {
        fetchProfile()
        fetchNotifications()
    }, [])

    /* ================= MARK AS READ ================= */

    const markAsRead = async (id: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)

            setNotifications(prev =>
                prev.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            )
        } catch (err) {
            if (__DEV__) {
                console.log('Mark read error:', err)
            }
        }
    }

    /* ================= CANCEL REQUEST ACTIONS ================= */

    const handleCancelAction = async (
        item: Notification,
        decision: 'accept' | 'reject'
    ) => {
        if (!item.order_id || item.action_completed) return

        try {
            setActingId(item.id)

            const newStatus = decision === 'accept' ? 'cancelled' : 'hold'

            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', item.order_id)

            if (orderError) throw orderError

            const { error: notifError } = await supabase
                .from('notifications')
                .update({
                    action_completed: true,
                    is_read: true,
                })
                .eq('id', item.id)

            if (notifError) throw notifError

            setNotifications(prev =>
                prev.map(n =>
                    n.id === item.id
                        ? { ...n, action_completed: true, is_read: true }
                        : n
                )
            )
        } catch (err) {
            if (__DEV__) {
                console.log('Cancel action error:', err)
            }
            Alert.alert('Error', 'Failed to update cancellation request.')
        } finally {
            setActingId(null)
        }
    }

    /* ================= HANDLE CLICK ================= */

    const handlePress = async (item: Notification) => {
        if (
            item.type === 'order_cancel_request' &&
            !item.action_completed
        ) {
            if (!item.is_read) {
                await markAsRead(item.id)
            }
            return
        }

        if (!item.is_read) {
            await markAsRead(item.id)
        }

        if (!item.order_id) return

        // 🧠 ROUTING BASED ON STORE TYPE
        if (storeType === 'wholesale') {
            router.push(`/sales/${item.order_id}`)
        } else {
            router.push(`/orders/${item.order_id}`)
        }
    }

    /* ================= UI ================= */

    if (loading) {
        return (
            <View style={center}>
                <ActivityIndicator size="large" />
            </View>
        )
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

                <Text style={styles.headerTitle}>
                    Notifications
                </Text>

                <View style={{ width: 30 }} />
            </View>

            {/* LIST */}
            <ScrollView contentContainerStyle={{ padding: 15 }}>

                {notifications.length === 0 ? (
                    <View style={emptyBox}>
                        <Text style={emptyText}>
                            No notifications yet
                        </Text>
                    </View>
                ) : (
                    notifications.map(item => (
                        <Pressable
                            key={item.id}
                            onPress={() => handlePress(item)}
                            style={[
                                card,
                                !item.is_read && unreadCard
                            ]}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={title}>
                                    {item.title}
                                </Text>

                                <Text style={message}>
                                    {item.message}
                                </Text>

                                <Text style={time}>
                                    {new Date(item.created_at).toLocaleString()}
                                </Text>

                                {item.type === 'order_cancel_request' && (
                                    item.action_completed ? (
                                        <Text style={completedText}>
                                            Completed
                                        </Text>
                                    ) : (
                                        <View style={actionRow}>
                                            <Pressable
                                                style={[actionBtn, acceptBtn]}
                                                disabled={actingId === item.id}
                                                onPress={() =>
                                                    handleCancelAction(item, 'accept')
                                                }
                                            >
                                                <Text style={actionBtnText}>
                                                    {actingId === item.id
                                                        ? '...'
                                                        : 'Accept cancellation'}
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={[actionBtn, rejectBtn]}
                                                disabled={actingId === item.id}
                                                onPress={() =>
                                                    handleCancelAction(item, 'reject')
                                                }
                                            >
                                                <Text style={actionBtnText}>
                                                    {actingId === item.id
                                                        ? '...'
                                                        : 'Reject cancellation'}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )
                                )}
                            </View>

                            {!item.is_read && (
                                <View style={dot} />
                            )}
                        </Pressable>
                    ))
                )}

            </ScrollView>
        </View>
    )
}

/* ================= STYLES ================= */

const center = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
} as const

const card = {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center'
} as const

const unreadCard = {
    borderLeftWidth: 4,
    borderLeftColor: '#f5832b'
} as const

const title = {
    fontSize: 14,
    fontWeight: '700',
    color: '#111'
} as const

const message = {
    fontSize: 12,
    color: '#666',
    marginTop: 3
} as const

const time = {
    fontSize: 10,
    color: '#999',
    marginTop: 6
} as const

const dot = {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f5832b',
    marginLeft: 10
} as const

const emptyBox = {
    marginTop: 50,
    alignItems: 'center'
} as const

const emptyText = {
    color: '#888',
    fontSize: 14
} as const

const actionRow = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
} as const

const actionBtn = {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
} as const

const acceptBtn = {
    backgroundColor: '#16a34a'
} as const

const rejectBtn = {
    backgroundColor: '#ef4444'
} as const

const actionBtnText = {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
} as const

const completedText = {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a'
} as const

export default Notifications
