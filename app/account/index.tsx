import DeliveryAddressSection from '@/components/delivery/DeliveryAddressSection'
import StoreProductSearch, {
    useStoreProductSearch,
} from '@/components/StoreProductSearch'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { router, useNavigation } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
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

type Product = {
    id: string
    name: string
    price: number | string
    moq?: number | null
    status?: string | null
    product_images?: {
        image_url: string
        is_main: boolean
    }[]
}

const Account = () => {
    const navigation = useNavigation()
    const { profile, loading, refetch } = useProfile()

    const [products, setProducts] = useState<Product[]>([])
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'other'>(
        'all'
    )
    const [actionProduct, setActionProduct] = useState<Product | null>(null)
    const [actionType, setActionType] = useState<'delete' | 'edit' | null>(null)
    const [modalVisible, setModalVisible] = useState(false)

    const statusFiltered = useMemo(() => {
        if (statusFilter === 'all') return products
        if (statusFilter === 'active') {
            return products.filter((p) => p.status === 'active')
        }
        return products.filter((p) => p.status !== 'active')
    }, [products, statusFilter])

    const { query, setQuery, filtered: filteredProducts } =
        useStoreProductSearch(statusFiltered)

    // ---------------- FETCH ----------------
    const fetchProducts = async (sellerId: string) => {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                price,
                moq,
                status,
                product_images (
                    image_url,
                    is_main
                )
            `)
            .eq('seller_id', sellerId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })

        if (error) {
            if (__DEV__) {
                console.log('PRODUCT ERROR:', error)
            }
            return
        }

        setProducts(data || [])
    }

    useEffect(() => {
        if (profile?.id && profile?.store_type === 'wholesale') {
            fetchProducts(profile.id)
        }
    }, [profile?.id, profile?.store_type])

    // ---------------- ACTION ----------------
    const confirmAction = async () => {
        if (!actionProduct || !actionType) return

        if (actionType === 'delete') {
            const { error } = await supabase
                .from('products')
                .update({ is_deleted: true })
                .eq('id', actionProduct.id)

            if (!error) {
                setProducts(prev =>
                    prev.filter(p => p.id !== actionProduct.id)
                )
            } else {
                if (__DEV__) {
                    console.log('DELETE ERROR:', error)
                }
            }
        }

        if (actionType === 'edit') {
            router.push({
                pathname: '/editProduct/[id]',
                params: { id: actionProduct.id }
            })
        }

        setModalVisible(false)
        setActionProduct(null)
        setActionType(null)
    }

    // ---------------- LOADING ----------------
    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    if (!profile) {
        return (
            <View style={s.center}>
                <Text>Failed to load account data</Text>
            </View>
        )
    }

    return (
        <View style={s.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>

                <Text style={s.headerTitle}>My Account</Text>

                <View style={{ width: 22 }} />
            </View>

            <ScrollView>

                {/* PROFILE */}
                <View style={s.profileCard}>
                    <Image source={{ uri: profile.avatar_url }} style={s.avatar} />

                    <Text style={s.name}>{profile.full_name}</Text>
                    <Text style={s.sub}>{profile.store_name}</Text>

                    <View style={s.badge}>
                        <Text style={s.badgeText}>{profile.store_type}</Text>
                    </View>
                </View>

                {/* INFO */}
                <View style={s.infoCard}>
                    <InfoRow label="Store Name" value={profile.store_name} />
                    <InfoRow label="Phone" value={profile.phone} />
                    <InfoRow label="District" value={profile.district} />
                    <InfoRow label="Upazila" value={profile.upazila} />
                    <InfoRow label="Address" value={profile.address} />
                    <InfoRow label="Store Type" value={profile.store_type} />
                </View>

                <DeliveryAddressSection
                    profile={profile}
                    onProfileDefaultChange={() => {
                        refetch()
                    }}
                />

                {/* PRODUCTS */}
                {profile.store_type === 'wholesale' && (
                    <View style={s.productSection}>
                        <View style={s.productSectionHead}>
                            <Text style={s.sectionTitle}>Your Products</Text>
                            <Text style={s.productCount}>
                                {filteredProducts.length}
                                {query.trim() || statusFilter !== 'all'
                                    ? ` / ${products.length}`
                                    : ''}{' '}
                                {filteredProducts.length === 1 ? 'item' : 'items'}
                            </Text>
                        </View>

                        {products.length > 0 ? (
                            <>
                                <StoreProductSearch
                                    value={query}
                                    onChangeText={setQuery}
                                    placeholder="Search your products"
                                    resultCount={filteredProducts.length}
                                    totalCount={statusFiltered.length}
                                />

                                <View style={s.filterRow}>
                                    {(
                                        [
                                            { key: 'all', label: 'All' },
                                            { key: 'active', label: 'Active' },
                                            { key: 'other', label: 'Other' },
                                        ] as const
                                    ).map((chip) => {
                                        const active = statusFilter === chip.key
                                        return (
                                            <Pressable
                                                key={chip.key}
                                                onPress={() => setStatusFilter(chip.key)}
                                                style={[
                                                    s.filterChip,
                                                    active && s.filterChipActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        s.filterChipText,
                                                        active && s.filterChipTextActive,
                                                    ]}
                                                >
                                                    {chip.label}
                                                </Text>
                                            </Pressable>
                                        )
                                    })}
                                </View>
                            </>
                        ) : null}

                        {products.length === 0 ? (
                            <View style={s.emptyProducts}>
                                <Text style={s.emptyProductsTitle}>No products yet</Text>
                                <Text style={s.emptyProductsBody}>
                                    Upload a product from your profile to start selling.
                                </Text>
                            </View>
                        ) : filteredProducts.length === 0 ? (
                            <View style={s.emptyProducts}>
                                <Text style={s.emptyProductsTitle}>No matches</Text>
                                <Text style={s.emptyProductsBody}>
                                    Try a different search or filter.
                                </Text>
                            </View>
                        ) : (
                            filteredProducts.map((item, index) => {
                                const imageUri =
                                    item.product_images?.find((i) => i.is_main)?.image_url
                                    ?? item.product_images?.[0]?.image_url
                                const statusLabel = formatProductStatus(item.status)

                                return (
                                    <View
                                        key={item.id}
                                        style={[
                                            s.productCard,
                                            index === filteredProducts.length - 1 && s.productCardLast,
                                        ]}
                                    >
                                        <Pressable
                                            style={s.productMain}
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/product/[id]',
                                                    params: { id: item.id },
                                                })
                                            }
                                        >
                                            <Image
                                                source={
                                                    imageUri
                                                        ? { uri: imageUri }
                                                        : require('@/assets/images/product1.png')
                                                }
                                                style={s.productImage}
                                            />

                                            <View style={s.productInfo}>
                                                <Text style={s.productName} numberOfLines={2}>
                                                    {item.name}
                                                </Text>
                                                <Text style={s.productPrice}>
                                                    BDT {item.price}
                                                </Text>
                                                <View style={s.productMetaRow}>
                                                    {item.moq != null ? (
                                                        <Text style={s.productMeta}>
                                                            MOQ {item.moq}
                                                        </Text>
                                                    ) : null}
                                                    {statusLabel ? (
                                                        <View
                                                            style={[
                                                                s.statusPill,
                                                                item.status === 'active'
                                                                    ? s.statusActive
                                                                    : s.statusMuted,
                                                            ]}
                                                        >
                                                            <Text style={s.statusPillText}>
                                                                {statusLabel}
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            </View>
                                        </Pressable>

                                        <View style={s.btnRow}>
                                            <Pressable
                                                style={s.editBtn}
                                                onPress={() => {
                                                    setActionProduct(item)
                                                    setActionType('edit')
                                                    setModalVisible(true)
                                                }}
                                            >
                                                <Text style={s.editBtnText}>Edit</Text>
                                            </Pressable>

                                            <Pressable
                                                style={s.deleteBtn}
                                                onPress={() => {
                                                    setActionProduct(item)
                                                    setActionType('delete')
                                                    setModalVisible(true)
                                                }}
                                            >
                                                <Text style={s.deleteBtnText}>Delete</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                )
                            })
                        )}
                    </View>
                )}

            </ScrollView>

            {/* MODAL */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={s.modalBg}>
                    <View style={s.modalBox}>

                        <Text style={s.modalTitle}>Confirm {actionType}</Text>

                        <Text style={s.modalText}>
                            Are you sure you want to {actionType} this product?
                        </Text>

                        <View style={s.modalRow}>
                            <Pressable style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </Pressable>

                            <Pressable style={s.confirmBtn} onPress={confirmAction}>
                                <Text style={{ color: '#fff' }}>Confirm</Text>
                            </Pressable>
                        </View>

                    </View>
                </View>
            </Modal>

        </View>
    )
}

/* ---------------- INFO ROW ---------------- */

const InfoRow = ({ label, value }: any) => (
    <View style={s.row}>
        <Text style={{ color: '#777' }}>{label}</Text>
        <Text style={{ fontWeight: '600' }}>{value || 'N/A'}</Text>
    </View>
)

const formatProductStatus = (status?: string | null) => {
    if (!status) return null
    return status.charAt(0).toUpperCase() + status.slice(1)
}

/* ---------------- STYLESHEET ---------------- */

const s = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f6f7fb'
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600'
    },

    profileCard: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        margin: 15,
        borderRadius: 16
    },

    avatar: {
        width: 85,
        height: 85,
        borderRadius: 999
    },

    name: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 10
    },

    sub: {
        fontSize: 13,
        color: '#666'
    },

    badge: {
        marginTop: 10,
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600'
    },

    infoCard: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        borderRadius: 12,
        overflow: 'hidden'
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },

    productSection: {
        margin: 15,
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 6,
    },

    productSectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e5e7eb',
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },

    productCount: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },

    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    filterChipActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },

    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },

    filterChipTextActive: {
        color: '#ffffff',
    },

    emptyProducts: {
        paddingVertical: 28,
        paddingHorizontal: 8,
        alignItems: 'center',
    },

    emptyProductsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },

    emptyProductsBody: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 19,
    },

    productCard: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },

    productCardLast: {
        borderBottomWidth: 0,
    },

    productMain: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },

    productImage: {
        width: 88,
        height: 88,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
    },

    productInfo: {
        flex: 1,
        minWidth: 0,
        paddingTop: 2,
    },

    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        lineHeight: 20,
        marginBottom: 4,
    },

    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },

    productMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },

    productMeta: {
        fontSize: 12,
        color: '#6b7280',
    },

    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },

    statusActive: {
        backgroundColor: '#ecfdf5',
    },

    statusMuted: {
        backgroundColor: '#f3f4f6',
    },

    statusPillText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#374151',
    },

    btnRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 12,
    },

    editBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5832b',
        backgroundColor: '#fff7ed',
    },

    editBtnText: {
        color: '#f5832b',
        fontSize: 13,
        fontWeight: '600',
    },

    deleteBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fecaca',
        backgroundColor: '#fff',
    },

    deleteBtnText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '600',
    },

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

    modalTitle: {
        fontSize: 16,
        fontWeight: '600'
    },

    modalText: {
        marginTop: 10,
        color: '#555'
    },

    modalRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 10
    },

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
    }
})

export default Account