import { showAppAlert } from '@/context/AppAlertContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
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
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

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

                {/* <TouchableOpacity style={styles.linkButton}>
                        <Text style={styles.linkText}>Forgot Password?</Text>
                    </TouchableOpacity> */}

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
    linkButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    linkText: {
        color: '#666',
        fontSize: 14,
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