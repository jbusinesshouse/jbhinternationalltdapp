import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { useNavigation, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
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
}

const Notifications = () => {
    const navigation = useNavigation()
    const router = useRouter()

    const [storeType, setStoreType] = useState<string | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

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

    /* ================= HANDLE CLICK ================= */

    const handlePress = async (item: Notification) => {
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

export default Notifications