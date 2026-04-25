import { supabase } from '@/lib/supabase'; // 👈 make sure path is correct
import { styles } from '@/styles/support';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';

const Support = () => {
    const navigation = useNavigation()

    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Missing Information', 'Please fill in all fields.')
            return
        }

        try {
            setSubmitting(true)

            // 🔐 Get logged-in user
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError || !userData.user) {
                throw new Error('User not authenticated')
            }

            const userId = userData.user.id

            // 📩 Insert support request
            const { error: insertError } = await supabase
                .from('support_requests')
                .insert({
                    user_id: userId,
                    subject: subject.trim(),
                    message: message.trim(),
                    // is_read & status handled by default in DB
                })

            if (insertError) {
                if (__DEV__) {
                    console.error('Insert error:', insertError)
                }
                throw insertError
            }

            Alert.alert(
                'Request Submitted',
                'Our support team will get back to you soon.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSubject('')
                            setMessage('')
                            navigation.goBack() // 👈 go back here
                        }
                    }
                ]
            )
        } catch (err: any) {
            if (__DEV__) {
                console.error('Support error:', err)
            }
            Alert.alert(
                'Error',
                err.message || 'Something went wrong. Please try again.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>

                <Text style={styles.headerTitle}>Support</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Need Help?</Text>
                <Text style={styles.paragraph}>
                    Submit your issue or question below and our support team will
                    assist you as soon as possible.
                </Text>

                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Briefly describe your issue"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                />

                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Write your message here..."
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />

                <Pressable
                    style={[
                        styles.submitBtn,
                        submitting && styles.submitBtnDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitBtnText}>
                        {submitting ? 'Submitting...' : 'Submit Request'}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default Support