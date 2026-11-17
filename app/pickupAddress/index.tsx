import CourierLocationPickers from '@/components/delivery/CourierLocationPickers'
import { showAppAlert } from '@/context/AppAlertContext'
import {
    CourierLocation,
    emptyCourierLocation,
    fetchPickupStore,
    PICKUP_STATUS_LABEL,
    PickupStore,
    savePickupStore,
} from '@/lib/courier'
import { useNavigation, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'

const LOCKED: PickupStore['status'][] = ['approved', 'awaiting_pathao', 'active']

/** Seller's Pathao pickup address (one per seller, after the first product). */
const PickupAddress = () => {
    const navigation = useNavigation()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [enabled, setEnabled] = useState(false)
    const [eligible, setEligible] = useState(false)
    const [store, setStore] = useState<PickupStore | null>(null)
    const [form, setForm] = useState({
        contact_name: '',
        contact_number: '',
        secondary_contact: '',
        address: '',
    })
    const [location, setLocation] = useState<CourierLocation>(emptyCourierLocation())
    const [saving, setSaving] = useState(false)

    const applyStore = (s: PickupStore | null) => {
        setStore(s)
        if (!s) return
        setForm({
            contact_name: s.contact_name,
            contact_number: s.contact_number,
            secondary_contact: s.secondary_contact ?? '',
            address: s.address,
        })
        setLocation({ city_id: s.city_id, zone_id: s.zone_id, area_id: s.area_id })
    }

    useEffect(() => {
        fetchPickupStore()
            .then((res) => {
                setEnabled(res.enabled)
                setEligible(res.eligible)
                applyStore(res.store)
            })
            .catch((e: any) => showAppAlert('সমস্যা', e?.message || 'লোড করা যায়নি।'))
            .finally(() => setLoading(false))
    }, [])

    const locked = store ? LOCKED.includes(store.status) : false

    const submit = async () => {
        if (!location.city_id || !location.zone_id || !location.area_id) {
            showAppAlert('তথ্য অসম্পূর্ণ', 'শহর, জোন ও এরিয়া বাছাই করুন।')
            return
        }
        if (form.contact_name.trim().length < 3 || !form.contact_number.trim()) {
            showAppAlert('তথ্য অসম্পূর্ণ', 'নাম ও মোবাইল নম্বর দিন।')
            return
        }
        if (form.address.trim().length < 15) {
            showAppAlert('তথ্য অসম্পূর্ণ', 'পূর্ণ ঠিকানা দিন (কমপক্ষে ১৫ অক্ষর)।')
            return
        }
        setSaving(true)
        try {
            const res = await savePickupStore({
                contact_name: form.contact_name.trim(),
                contact_number: form.contact_number.trim(),
                secondary_contact: form.secondary_contact.trim() || null,
                address: form.address.trim(),
                city_id: location.city_id,
                zone_id: location.zone_id,
                area_id: location.area_id,
            })
            applyStore(res.store)
            showAppAlert('জমা হয়েছে', 'অনুমোদন হলে আপনাকে নোটিফিকেশন পাঠানো হবে।')
        } catch (e: any) {
            showAppAlert('সমস্যা', e?.message || 'জমা দেওয়া যায়নি।')
        } finally {
            setSaving(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
            <View style={s.header}>
                <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
                    <Text style={s.back}>‹</Text>
                </Pressable>
                <Text style={s.headerTitle}>কুরিয়ার পিকআপ ঠিকানা</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <ScrollView contentContainerStyle={{ padding: 15 }} keyboardShouldPersistTaps="handled">
                    {!enabled ? (
                        <View style={s.card}>
                            <Text style={s.body}>
                                কুরিয়ার ডেলিভারি এখনো চালু হয়নি। চালু হলে এখানে পিকআপ ঠিকানা দিতে পারবেন।
                            </Text>
                        </View>
                    ) : !eligible ? (
                        <View style={s.card}>
                            <Text style={s.title}>আগে আপনার প্রথম পণ্য আপলোড করুন।</Text>
                            <Pressable style={s.btn} onPress={() => router.push('/productUpload')}>
                                <Text style={s.btnText}>নতুন পণ্য</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={s.card}>
                            {store ? (
                                <View style={s.statusBox}>
                                    <Text style={s.title}>
                                        অবস্থা: {PICKUP_STATUS_LABEL[store.status] ?? store.status}
                                    </Text>
                                    {store.admin_note ? <Text style={s.body}>নোট: {store.admin_note}</Text> : null}
                                    {locked ? (
                                        <Text style={s.body}>ঠিকানা পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন।</Text>
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={[s.body, { marginBottom: 12 }]}>
                                    Pathao এই ঠিকানা থেকে আপনার পার্সেল সংগ্রহ করবে।
                                </Text>
                            )}
                            <TextInput
                                editable={!locked}
                                placeholder="যোগাযোগের ব্যক্তির নাম *"
                                placeholderTextColor="#9CA3AF"
                                value={form.contact_name}
                                onChangeText={(v) => setForm((f) => ({ ...f, contact_name: v }))}
                                style={s.input}
                                maxLength={50}
                            />
                            <TextInput
                                editable={!locked}
                                placeholder="মোবাইল নম্বর * (01XXXXXXXXX)"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={form.contact_number}
                                onChangeText={(v) => setForm((f) => ({ ...f, contact_number: v }))}
                                style={s.input}
                            />
                            <TextInput
                                editable={!locked}
                                placeholder="বিকল্প নম্বর (ঐচ্ছিক)"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={form.secondary_contact}
                                onChangeText={(v) => setForm((f) => ({ ...f, secondary_contact: v }))}
                                style={s.input}
                            />
                            {!locked ? (
                                <CourierLocationPickers
                                    value={location}
                                    onChange={setLocation}
                                    mode="pickup"
                                    requireArea
                                />
                            ) : null}
                            <TextInput
                                editable={!locked}
                                placeholder="পূর্ণ ঠিকানা * (বাড়ি, রোড, এলাকা)"
                                placeholderTextColor="#9CA3AF"
                                value={form.address}
                                onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
                                style={[s.input, { height: 80, textAlignVertical: 'top' }]}
                                multiline
                                maxLength={120}
                            />
                            {!locked ? (
                                <Pressable style={s.btn} onPress={submit} disabled={saving}>
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={s.btnText}>{store ? 'আবার জমা দিন' : 'জমা দিন'}</Text>
                                    )}
                                </Pressable>
                            ) : null}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    )
}

export default PickupAddress

const s = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    back: { fontSize: 28, color: '#111' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#111' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 14 },
    statusBox: { backgroundColor: '#f6f7fb', borderRadius: 10, padding: 12, marginBottom: 12 },
    title: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
    body: { fontSize: 13, color: '#555', lineHeight: 19 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        color: '#111',
    },
    btn: {
        backgroundColor: '#f5832b',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 6,
    },
    btnText: { color: '#fff', fontWeight: '600' },
})
