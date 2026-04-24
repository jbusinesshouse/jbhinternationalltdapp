import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native'

type OrderItem = {
    quantity: number
    price_snapshot: number
    product_name_snapshot: string
    product_variants?: { color: string } | null
    product_sizes?: { size: string } | null
}

type Seller = {
    full_name: string
    phone: string
    store_name: string
}

type Order = {
    id: string
    status: string
    created_at: string
    full_name: string
    phone: string
    email: string
    city: string
    delivery_address: string
    product_id: string
    user_id: string
    order_items?: OrderItem[]
    products?: {
        product_images?: { image_url: string; is_main: boolean }[]
    } | null
}

const OrderDetails = () => {
    const navigation = useNavigation()
    const { id } = useLocalSearchParams<{ id: string }>()

    const [order, setOrder] = useState<Order | null>(null)
    const [seller, setSeller] = useState<Seller | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchOrder = async () => {
        if (!id) return
        try {
            setLoading(true)

            // 1. Fetch order
            const { data, error } = await supabase
                .from('orders')
                .select(`
                        *,
                        order_items (
                        quantity,
                        price_snapshot,
                        product_name_snapshot,
                        product_variants (
                            color
                        ),
                        product_sizes (
                            size
                        )
                ),
                        products (
                            product_images (
                                image_url,
                                is_main
                            )
                        )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setOrder(data as any)

            // 2. Fetch seller separately
            if (data?.user_id) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name, phone, store_name')
                    .eq('id', data.user_id)
                    .single()

                if (profileError) {
                    if (__DEV__) {
                        console.log('Profile fetch error:', profileError)
                    }
                }
                else setSeller(profileData)
            }

        } catch (err) {
            console.log('Fetch order error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrder()
    }, [id])

    if (loading) {
        return <View style={center}><ActivityIndicator size="large" /></View>
    }

    if (!order) {
        return <View style={center}><Text>Order not found</Text></View>
    }

    const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const totalPrice = order.order_items?.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0) || 0

    const mainImage = order.products?.product_images?.find(img => img.is_main)?.image_url
        ?? order.products?.product_images?.[0]?.image_url

    const getStatusColor = () => {
        switch (order.status?.toLowerCase()) {
            case 'completed': return '#16a34a'
            case 'pending': return '#f59e0b'
            case 'cancelled': return '#ef4444'
            default: return '#6b7280'
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>

                {/* PRODUCT CARD */}
                <Card>
                    <SectionTitle>Product</SectionTitle>
                    <View style={productRow}>
                        {mainImage ? (
                            <Image
                                source={{ uri: mainImage }}
                                style={productImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[productImage, imagePlaceholder]}>
                                <Text style={{ fontSize: 10, color: '#aaa' }}>No Image</Text>
                            </View>
                        )}

                        <View style={{ flex: 1 }}>
                            {/* Product name once at the top */}
                            {order.order_items?.[0]?.product_name_snapshot && (
                                <Text style={titleText}>
                                    {order.order_items[0].product_name_snapshot}
                                </Text>
                            )}

                            {/* Each variant/size row */}
                            {order.order_items?.map((item, index) => (
                                <View key={index} style={variantRow}>
                                    <View style={variantBadgeRow}>
                                        {item.product_variants?.color && (
                                            <View style={badge}>
                                                <Text style={badgeText}>{item.product_variants.color}</Text>
                                            </View>
                                        )}
                                        {item.product_sizes?.size && (
                                            <View style={badge}>
                                                <Text style={badgeText}>{item.product_sizes.size}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={subText}>
                                        ৳{item.price_snapshot} × {item.quantity}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </Card>

                {/* SELLER CARD */}
                {seller && (
                    <Card>
                        <SectionTitle>Seller Info</SectionTitle>
                        {seller.store_name && (
                            <Info label="Store" value={seller.store_name} />
                        )}
                        <Info label="Name" value={seller.full_name} />
                        {seller.phone && (
                            <Pressable onPress={() => Linking.openURL(`tel:${seller.phone}`)}>
                                <Text style={phoneText}>📞 {seller.phone}</Text>
                            </Pressable>
                        )}
                    </Card>
                )}

                {/* SUMMARY CARD */}
                <Card>
                    <SectionTitle>Order Summary</SectionTitle>
                    <Text style={titleText}>Items: {totalItems}</Text>
                    <Text style={subText}>Total: ৳{totalPrice.toFixed(2)}</Text>
                </Card>

                {/* STATUS */}
                <Card>
                    <SectionTitle>Status</SectionTitle>
                    <Text style={[titleText, { color: getStatusColor() }]}>{order.status}</Text>
                </Card>

                {/* CUSTOMER */}
                <Card>
                    <SectionTitle>Customer Info</SectionTitle>
                    <Info label="Name" value={order.full_name} />
                    <Info label="Phone" value={order.phone} />
                    <Info label="Email" value={order.email || 'N/A'} />
                </Card>

                {/* DELIVERY */}
                <Card>
                    <SectionTitle>Delivery Info</SectionTitle>
                    <Info label="City" value={order.city} />
                    <Info label="Address" value={order.delivery_address} />
                </Card>

                {/* DATE */}
                <Card>
                    <SectionTitle>Created At</SectionTitle>
                    <Text style={titleText}>{new Date(order.created_at).toLocaleString()}</Text>
                </Card>

            </ScrollView>
        </View>
    )
}

/* ================= UI COMPONENTS ================= */

const Card = ({ children }: { children: React.ReactNode }) => (
    <View style={card}>{children}</View>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={sectionTitle}>{children}</Text>
)

const Info = ({ label, value }: { label: string; value: string }) => (
    <View style={{ marginBottom: 8 }}>
        <Text style={labelText}>{label}</Text>
        <Text style={valueText}>{value}</Text>
    </View>
)

/* ================= STYLES ================= */

const center = { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f7fb' } as const
const card = { backgroundColor: '#fff', padding: 15, borderRadius: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 } as const
const sectionTitle = { fontSize: 12, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' } as const
const titleText = { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 6 } as const
const subText = { fontSize: 13, opacity: 0.6, marginTop: 2 } as const
const labelText = { fontSize: 11, opacity: 0.5 } as const
const valueText = { fontSize: 14, color: '#111', fontWeight: '500' } as const
const productRow = { flexDirection: 'row', gap: 12, alignItems: 'flex-start' } as const
const productImage = { width: 80, height: 80, borderRadius: 10 } as const
const imagePlaceholder = { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' } as const
const phoneText = { fontSize: 14, color: '#2563eb', fontWeight: '600', marginTop: 4 } as const
const variantRow = { marginTop: 6 } as const
const variantBadgeRow = { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 2 } as const
const badge = { backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 } as const
const badgeText = { fontSize: 12, color: '#444', fontWeight: '500' } as const

export default OrderDetails