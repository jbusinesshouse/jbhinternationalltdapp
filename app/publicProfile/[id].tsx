import ConfirmModal from '@/components/modal/ConfirmModal'
import { supabase } from '@/lib/supabase'
import { styles } from '@/styles/profile'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'

type Profile = {
    id: string
    full_name: string
    avatar_url: string
    store_name: string
    store_type: string
    phone: string
    district: string
    upazila: string
    address: string
}

type Product = {
    id: string
    name: string
    price: number
    product_images?: {
        image_url: string
        is_main: boolean
    }[]
}

const PublicProfile = () => {
    const { id } = useLocalSearchParams()
    const navigation = useNavigation()

    const [profile, setProfile] = useState<Profile | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // ---------------- MENU STATE ----------------
    const [menuVisible, setMenuVisible] = useState(false)
    const [showBlockModal, setShowBlockModal] = useState(false);

    // ---------------- HANDLERS ----------------
    const handleBlockUser = () => {
        setMenuVisible(false); // Close the small dots menu
        setShowBlockModal(true); // Open the big confirmation modal
    };

    const handleReportUser = () => {
        setMenuVisible(false)
        router.push({
            pathname: "/report/[id]",
            params: { id: id as string, type: 'profile' }
        })
    }

    // ---------------- FETCH PROFILE ----------------
    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (__DEV__) console.log('PROFILE ERROR:', error)
        } else {
            setProfile(data)
            if (data?.store_type === 'wholesale') {
                fetchProducts(data.id)
            }
        }
        setLoading(false)
    }

    // ---------------- FETCH PRODUCTS ----------------
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
            if (__DEV__) console.log('PRODUCT ERROR:', error)
            return
        }
        setProducts(data || [])
    }

    useEffect(() => {
        if (id) fetchProfile()
    }, [id])

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
                <Text>Profile not found</Text>
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
                <Text style={s.headerTitle}>Store Profile</Text>
                <View style={{ width: 22 }} />
            </View>

            <ScrollView>

                {/* PROFILE */}
                <View style={s.profileCard}>
                    <Pressable style={s.moreOption} onPress={() => setMenuVisible(true)}>
                        <Image
                            source={(require('@/assets/images/icons/dots.png'))}
                            style={{ width: 20, height: 20, }}
                        />
                    </Pressable>

                    {/* DROPDOWN MENU */}
                    <Modal
                        transparent={true}
                        visible={menuVisible}
                        animationType="fade"
                        onRequestClose={() => setMenuVisible(false)}
                    >
                        <Pressable style={s.modalOverlay} onPress={() => setMenuVisible(false)}>
                            <View style={s.menuContainer}>
                                <Pressable style={s.menuItem} onPress={handleBlockUser}>
                                    <Text style={{ color: 'red', fontWeight: '500' }}>Block User</Text>
                                </Pressable>
                                <View style={{ height: 1, backgroundColor: '#eee' }} />
                                <Pressable style={s.menuItem} onPress={handleReportUser}>
                                    <Text style={{ fontWeight: '500' }}>Report User</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Modal>

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
                </View>

                {/* PRODUCTS */}
                {profile.store_type === 'wholesale' ? (
                    <View style={s.productSection}>
                        <Text style={s.sectionTitle}>Products</Text>

                        {products.length === 0 && (
                            <Text style={{ color: '#777' }}>No products found</Text>
                        )}

                        {products.map((item) => (
                            <Pressable
                                onPress={() => {
                                    router.push({
                                        pathname: "/product/[id]",
                                        params: { id: item.id }
                                    })
                                }}
                                key={item.id} style={s.productCard}>

                                <Image
                                    source={{
                                        uri: item.product_images?.find(i => i.is_main)?.image_url
                                            ?? item.product_images?.[0]?.image_url
                                    }}
                                    style={s.productImage}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text style={s.productName}>{item.name}</Text>
                                    <Text style={s.productPrice}>৳{item.price}</Text>
                                </View>

                            </Pressable>
                        ))}
                    </View>
                ) : (
                    <Text style={{ margin: 15, color: '#777' }}>
                        This seller does not list wholesale products
                    </Text>
                )}

            </ScrollView >


            <ConfirmModal
                visible={showBlockModal}
                title="Block User"
                description={`Are you sure you want to block ${profile?.full_name}?`}
                confirmText="Block"
                cancelText="Cancel"
                danger
                onCancel={() => setShowBlockModal(false)}
                onConfirm={async () => {
                    setShowBlockModal(false); // Close the custom modal first

                    try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                            Alert.alert("Error", "You must be logged in to block users.");
                            return;
                        }

                        const { error } = await supabase
                            .from('blocks')
                            .insert({
                                blocker_id: user.id,
                                blocked_id: id
                            });

                        if (error) {
                            // Handle "Already Blocked" case (Postgres unique constraint error)
                            if (error.code === '23505') {
                                Alert.alert("Already Blocked", "You have already blocked this user.");
                            } else {
                                throw error;
                            }
                        } else {
                            // Success feedback
                            Alert.alert(
                                "User Blocked",
                                "Successfully blocked. You will no longer see this user's products.",
                                [{ text: "OK", onPress: () => navigation.goBack() }]
                            );
                        }
                    } catch (err: any) {
                        Alert.alert("Error", "Something went wrong. Please try again.");
                    }
                }}
            />
        </View >
    )
}

const InfoRow = ({ label, value }: any) => (
    <View style={s.row}>
        <Text style={{ color: '#777' }}>{label}</Text>
        <Text style={{ fontWeight: '600' }}>{value || 'N/A'}</Text>
    </View>
)

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7fb' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },
    profileCard: { alignItems: 'center', padding: 20, backgroundColor: '#fff', margin: 15, borderRadius: 16, position: 'relative' },
    moreOption: { position: 'absolute', right: 15, top: 20 },
    avatar: { width: 85, height: 85, borderRadius: 999 },
    name: { fontSize: 20, fontWeight: '700', marginTop: 10 },
    sub: { fontSize: 13, color: '#666' },
    badge: { marginTop: 10, backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    infoCard: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 12, overflow: 'hidden' },
    row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderColor: '#eee' },
    productSection: { margin: 15, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
    productCard: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    productImage: { width: 80, height: 80, borderRadius: 10 },
    productName: { fontSize: 14 },
    productPrice: { fontSize: 12, color: '#666' },

    // Menu Functionality Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'flex-start', alignItems: 'flex-end' },
    menuContainer: { marginTop: 110, marginRight: 20, backgroundColor: '#fff', borderRadius: 8, width: 150, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    menuItem: { padding: 12 }
})

export default PublicProfile;