import { showAppAlert } from '@/context/AppAlertContext'
import { setPendingReturnTo } from '@/lib/guestAuth'
import { supabase } from '@/lib/supabase'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'

export default function Signin() {
    const router = useRouter()
    const { returnTo } = useLocalSearchParams<{ returnTo?: string }>()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (typeof returnTo === 'string' && returnTo.trim()) {
            setPendingReturnTo(returnTo)
        }
    }, [returnTo])

    const handleSignin = async () => {
        if (!email || !password) {
            showAppAlert('তথ্য অসম্পূর্ণ', 'অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড দিন।')
            return
        }

        try {
            setLoading(true)

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (__DEV__) {
                console.log('Signin response:', { data, error })
            }

            if (error) throw error

            // Navigation happens automatically via useProtectedRoute
            showAppAlert('সফল', 'স্বাগতম ফিরে এসেছেন!')
        } catch (err: any) {
            if (__DEV__) {
                console.error('Signin error:', err)
            }
            showAppAlert('সাইন ইন হয়নি', err.message || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।')
        } finally {
            setLoading(false)
        }
    }

    const handleContinueAsGuest = () => {
        setPendingReturnTo(null)
        router.replace('/(tabs)')
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleSignin}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.guestButton}
                    onPress={handleContinueAsGuest}
                >
                    <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/(auth)/signup')}
                >
                    <Text style={styles.secondaryButtonText}>
                        Don't have an account? <Text style={styles.bold}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 80,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        fontSize: 15,
        color: '#000000',
        backgroundColor: '#ffffff',
    },
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    guestButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 12,
    },
    guestButtonText: {
        color: '#f5832b',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 32,
    },
    secondaryButton: {
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 15,
    },
    bold: {
        fontWeight: '600',
        color: '#000',
    },
})
