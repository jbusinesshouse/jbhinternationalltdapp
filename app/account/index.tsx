import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { router, useNavigation } from 'expo-router'
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

type Product = {
    id: string
    name: string
    price: number
    product_images?: {
        image_url: string
        is_main: boolean
    }[]
}

const Account = () => {
    const navigation = useNavigation()
    const { profile, loading } = useProfile()

    const [products, setProducts] = useState<Product[]>([])
    const [actionProduct, setActionProduct] = useState<Product | null>(null)
    const [actionType, setActionType] = useState<'delete' | 'edit' | null>(null)
    const [modalVisible, setModalVisible] = useState(false)

    // ---------------- FETCH ----------------
    const fetchProducts = async (sellerId: string) => {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                price,
                product_images (
                    image_url,
                    is_main
                )
            `)
            .eq('seller_id', sellerId)
            .eq('is_deleted', false)

        if (error) {
            console.log('PRODUCT ERROR:', error)
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
                console.log('DELETE ERROR:', error)
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

                {/* PRODUCTS */}
                {profile.store_type === 'wholesale' && (
                    <View style={s.productSection}>

                        <Text style={s.sectionTitle}>Your Products</Text>

                        {products.map((item) => (
                            <View key={item.id} style={s.productCard}>

                                <Image
                                    source={{
                                        uri:
                                            item.product_images?.find(i => i.is_main)?.image_url
                                            ?? item.product_images?.[0]?.image_url
                                    }}
                                    style={s.productImage}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text style={s.productName}>{item.name}</Text>
                                    <Text style={s.productPrice}>৳{item.price}</Text>

                                    <View style={s.btnRow}>
                                        <Pressable
                                            style={s.editBtn}
                                            onPress={() => {
                                                setActionProduct(item)
                                                setActionType('edit')
                                                setModalVisible(true)
                                            }}
                                        >
                                            <Text style={s.btnText}>Edit</Text>
                                        </Pressable>

                                        <Pressable
                                            style={s.deleteBtn}
                                            onPress={() => {
                                                setActionProduct(item)
                                                setActionType('delete')
                                                setModalVisible(true)
                                            }}
                                        >
                                            <Text style={s.btnText}>Delete</Text>
                                        </Pressable>
                                    </View>
                                </View>

                            </View>
                        ))}

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
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10
    },

    productCard: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12
    },

    productImage: {
        width: 80,
        height: 80,
        borderRadius: 10
    },

    productName: {
        fontSize: 14
    },

    productPrice: {
        fontSize: 12,
        color: '#666'
    },

    btnRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6
    },

    editBtn: {
        backgroundColor: '#3b82f6',
        padding: 6,
        borderRadius: 6
    },

    deleteBtn: {
        backgroundColor: '#ef4444',
        padding: 6,
        borderRadius: 6
    },

    btnText: {
        color: '#fff'
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