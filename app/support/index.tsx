import { styles } from '@/styles/support'
import { useNavigation } from 'expo-router'
import React, { useState } from 'react'
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
} from 'react-native'

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

            // TODO: replace with API call
            await new Promise(resolve => setTimeout(resolve, 800))

            Alert.alert(
                'Request Submitted',
                'Our support team will get back to you soon.'
            )

            setSubject('')
            setMessage('')
        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.')
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
                    style={styles.input}
                />

                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Write your message here..."
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
