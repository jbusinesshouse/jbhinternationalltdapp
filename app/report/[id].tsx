import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/support';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const ReportScreen = () => {
    const router = useRouter();
    // Getting both the dynamic ID and the type (product/profile)
    const { id, type } = useLocalSearchParams<{ id: string; type: 'product' | 'profile' }>();

    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Matches your DB Enum values
    const reportReasons = [
        "spam",
        "scam",
        "inappropriate",
        "other",
    ];

    const handleSubmit = async () => {
        if (!reason || !details.trim()) {
            Alert.alert('Missing Information', 'Please select a reason and provide details.');
            return;
        }

        try {
            setSubmitting(true);

            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) throw new Error('User not authenticated');

            // 📩 Insert based on your schema
            const { error: insertError } = await supabase
                .from('reports')
                .insert({
                    reporter_id: userData.user.id,
                    target_type: type === 'product' ? 'product' : 'user',
                    // Map the 'id' to the correct column based on 'type'
                    product_id: type === 'product' ? id : null,
                    profile_id: type === 'profile' ? id : null,
                    reason: reason,
                    details: details.trim(),
                    status: 'pending'
                });

            if (insertError) throw insertError;

            Alert.alert(
                'Report Submitted',
                `This ${type} has been reported. Our team will review it.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Dynamic Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        // Rotate the icon to point left for "Back"
                        style={[styles.backIcon, { transform: [{ rotate: '180deg' }] }]}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>
                    Report {type === 'product' ? 'Product' : 'User'}
                </Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.sectionTitle}>
                    Help us understand
                </Text>
                <Text style={styles.paragraph}>
                    Why are you reporting this {type}? Your feedback helps keep our community safe.
                </Text>

                <Text style={styles.inputLabel}>Reason</Text>
                <View style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    marginBottom: 15,
                    overflow: 'hidden'
                }}>
                    <Picker
                        selectedValue={reason}
                        onValueChange={(value) => setReason(value)}
                        style={{ color: '#111827' }}
                        dropdownIconColor="#111827"
                        mode="dropdown"
                    >
                        <Picker.Item label="Select a reason" value="" color="#9CA3AF" />
                        {reportReasons.map((r) => (
                            <Picker.Item key={r} label={r} value={r} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.inputLabel}>Additional Details</Text>
                <TextInput
                    value={details}
                    onChangeText={setDetails}
                    placeholder={`Tell us more about the issue with this ${type}...`}
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />

                <Pressable
                    style={[
                        styles.submitBtn,
                        { backgroundColor: '#EF4444', marginTop: 10 },
                        submitting && styles.submitBtnDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitBtnText}>
                        {submitting ? 'Submitting...' : `Submit ${type === 'product' ? 'Product' : 'User'} Report`}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ReportScreen;