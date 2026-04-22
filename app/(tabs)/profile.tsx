import ConfirmModal from '@/components/modal/ConfirmModal'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { styles } from '@/styles/profile'
import { type Href, useNavigation, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native'

const APPEAL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScGFD5Rbyao72nTABzxEuQd8UVU97W5CP2eHwnQEeBsG_oLrw/viewform?usp=dialog'

const Profile = () => {
    const navigation = useNavigation()
    const router = useRouter()

    const { profile, loading, updateName } = useProfile()
    const { signOut } = useAuth()

    const [editMode, setEditMode] = useState(false)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState('')

    const [showCloseModal, setShowCloseModal] = useState(false)
    const [showSignoutModal, setShowSignoutModal] = useState(false)

    // 🔹 LOADING STATE
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    // 🔹 SAFETY CHECK
    if (!profile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Failed to load profile</Text>
            </View>
        )
    }

    const isSeller = profile.store_type === 'wholesale'
    const isBuyer = profile.store_type === 'retail'

    const handleSave = async () => {
        if (!name.trim() || saving) return
        try {
            setSaving(true)
            await updateName(name)
            setEditMode(false)
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        if (saving) return
        setName(profile.full_name)
        setEditMode(false)
    }

    const handleSignout = async () => {
        await signOut()
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

                <Text style={styles.headerTitle}>Profile</Text>

                <View style={{ width: 30 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 🔹 USER CARD */}
                <View style={styles.userCard}>
                    <Image
                        source={{ uri: profile.avatar_url }}
                        style={styles.avatar}
                    />

                    {!editMode ? (
                        <>
                            <Text style={styles.name}>
                                {profile.full_name}
                            </Text>

                            <Text style={styles.email}>
                                {profile.email}
                            </Text>

                            <Pressable
                                style={styles.editBtn}
                                onPress={() => {
                                    setName(profile.full_name)
                                    setEditMode(true)
                                }}
                            >
                                <Text style={styles.editText}>Edit Name</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                placeholder="Your name"
                            />

                            <View style={styles.editActions}>
                                <Pressable
                                    style={styles.cancelEditBtn}
                                    onPress={handleCancelEdit}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelEditText}>
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.saveBtn,
                                        saving && styles.saveBtnDisabled
                                    ]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveText}>
                                            Save
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>

                {/* 🔹 MAIN ACTIONS */}
                <View style={styles.section}>
                    <ProfileLink title="My Account" link="/account" />
                </View>

                <View style={styles.section}>
                    {/* Seller only */}
                    {isSeller && (
                        <ProductUpComp title="Upload Product" />
                    )}

                    {/* Role-based Orders */}
                    {isSeller && (
                        <ProfileLink title="Sales Orders" link="/sales" />
                    )}

                    {isBuyer && (
                        <ProfileLink title="My Orders" link="/orders" />
                    )}
                </View>

                {/* 🔹 GENERAL SETTINGS */}
                <View style={styles.section}>
                    <ProfileLink title="Privacy Policy" link="/privacyPolicy" />
                    <ProfileLink title="Terms & Conditions" link="/termsAndConditions" />
                    <ProfileLink title="About App" link="/aboutApp" />
                    <ProfileLink title="Support" link="/support" />

                    <Pressable
                        style={styles.linkRow}
                        onPress={() => setShowSignoutModal(true)}
                    >
                        <Text style={styles.linkText}>Logout</Text>
                        <Image
                            source={require('@/assets/images/icons/chevron-right.png')}
                            style={styles.linkIcon}
                        />
                    </Pressable>
                </View>

                {/* 🔹 CLOSE ACCOUNT */}
                <View style={styles.section}>
                    <Pressable
                        style={styles.dangerBtn}
                        onPress={() => setShowCloseModal(true)}
                    >
                        <Text style={styles.dangerText}>
                            Request Account Deletion
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* 🔹 MODALS */}
            <ConfirmModal
                visible={showCloseModal}
                title="Close Account"
                description="Are you sure you want to close your account? You will be redirected to submit an appeal request."
                confirmText="Proceed"
                cancelText="Cancel"
                danger
                onCancel={() => setShowCloseModal(false)}
                onConfirm={() => {
                    setShowCloseModal(false)
                    Linking.openURL(APPEAL_URL)
                }}
            />

            <ConfirmModal
                visible={showSignoutModal}
                title="Sign out"
                description="Are you sure you want to sign out of your account?"
                confirmText="Sign out"
                cancelText="Cancel"
                onCancel={() => setShowSignoutModal(false)}
                onConfirm={() => {
                    setShowSignoutModal(false)
                    handleSignout()
                }}
            />
        </View>
    )
}

/**
 * Upload Product button
 */
const ProductUpComp = ({ title }: { title: string }) => {
    const router = useRouter()

    return (
        <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/productUpload')}
        >
            <Text style={styles.linkText}>{title}</Text>
            <Image
                source={require('@/assets/images/icons/plus.png')}
                style={styles.linkIcon}
            />
        </Pressable>
    )
}

/**
 * Reusable link row
 */
const ProfileLink = ({
    title,
    link
}: {
    title: string
    link: Href
}) => {
    const router = useRouter()

    return (
        <Pressable
            style={styles.linkRow}
            onPress={() => router.push(link)}
        >
            <Text style={styles.linkText}>{title}</Text>
            <Image
                source={require('@/assets/images/icons/chevron-right.png')}
                style={styles.linkIcon}
            />
        </Pressable>
    )
}

export default Profile