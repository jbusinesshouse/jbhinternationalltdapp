import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
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
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        try {
            setLoading(true)

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            console.log('Signin response:', { data, error })

            if (error) throw error

            // Navigation happens automatically via useProtectedRoute
            Alert.alert('Success', 'Welcome back!')
        } catch (err: any) {
            console.error('Signin error:', err)
            Alert.alert('Sign in failed', err.message || 'Invalid credentials')
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
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
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