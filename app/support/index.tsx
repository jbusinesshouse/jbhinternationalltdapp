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
            Alert.alert('তথ্য অসম্পূর্ণ', 'অনুগ্রহ করে সব ঘর পূরণ করুন।')
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
                'অনুরোধ জমা হয়েছে',
                'আমাদের সাপোর্ট টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।',
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
                'সমস্যা',
                err.message || 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।'
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
                <Text style={styles.sectionTitle}>সাহায্য প্রয়োজন?</Text>
                <Text style={styles.paragraph}>
                    নিচে আপনার সমস্যা বা প্রশ্ন লিখে জমা দিন। আমাদের সাপোর্ট টিম
                    যত দ্রুত সম্ভব আপনাকে সাহায্য করবে।
                </Text>

                <Text style={styles.inputLabel}>বিষয়</Text>
                <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="সংক্ষেপে সমস্যাটি লিখুন"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                />

                <Text style={styles.inputLabel}>বার্তা</Text>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="এখানে বিস্তারিত লিখুন..."
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