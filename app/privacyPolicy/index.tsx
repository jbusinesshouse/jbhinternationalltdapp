import { styles } from '@/styles/privacyPolicy'
import { useNavigation } from 'expo-router'
import React from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native'

const PrivacyPolicy = () => {
    const navigation = useNavigation()

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

                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 30 }} />
            </View>


            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* English Content */}
                <Text style={styles.sectionTitle}>Introduction</Text>
                <Text style={styles.paragraph}>
                    Your privacy is important to us. This Privacy Policy explains how
                    we collect, use, and protect your information when you use our app.
                </Text>

                <Text style={styles.sectionTitle}>Information We Collect</Text>
                <Text style={styles.paragraph}>
                    We may collect personal information such as your name, email address,
                    phone number, profile image, store name, store type, and address
                    to provide a personalized and secure experience in the app.
                </Text>

                <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    The information we collect is used to provide and improve the app,
                    communicate with you, and ensure a secure experience.
                </Text>

                <Text style={styles.sectionTitle}>Data Security</Text>
                <Text style={styles.paragraph}>
                    We take reasonable measures to protect your information from
                    unauthorized access, alteration, or disclosure.
                </Text>

                <Text style={styles.sectionTitle}>Third-Party Services</Text>
                <Text style={styles.paragraph}>
                    We may use third-party services that collect information to help
                    improve app functionality. These services follow their own privacy
                    policies.
                </Text>

                <Text style={styles.sectionTitle}>Changes to This Policy</Text>
                <Text style={styles.paragraph}>
                    We may update this Privacy Policy from time to time. Any changes will
                    be reflected on this page.
                </Text>

                <Text style={styles.sectionTitle}>Contact Us</Text>
                <Text style={styles.paragraph}>
                    If you have any questions about this Privacy Policy, please contact
                    our support team.
                </Text>

                {/* Divider between languages */}
                <View style={styles.divider} />

                {/* Bangla Content */}
                <Text style={styles.sectionTitle}>ভূমিকা</Text>
                <Text style={styles.paragraph}>
                    আপনার ব্যক্তিগত তথ্য আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই প্রাইভেসি
                    পলিসিতে ব্যাখ্যা করা হয়েছে আপনি আমাদের অ্যাপ ব্যবহার করার সময় আমরা
                    কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।
                </Text>

                <Text style={styles.sectionTitle}>আমরা যে তথ্য সংগ্রহ করি</Text>
                <Text style={styles.paragraph}>
                    আমরা আপনার নাম, ইমেইল ঠিকানা, ফোন নম্বর, প্রোফাইল ছবি, দোকানের নাম,
                    দোকানের ধরন এবং ঠিকানা ইত্যাদি ব্যক্তিগত তথ্য সংগ্রহ করতে পারি,
                    যাতে আপনাকে একটি নিরাপদ ও ব্যক্তিগত অভিজ্ঞতা প্রদান করা যায়।
                </Text>

                <Text style={styles.sectionTitle}>আপনার তথ্য কীভাবে ব্যবহার করা হয়</Text>
                <Text style={styles.paragraph}>
                    সংগৃহীত তথ্য অ্যাপের সেবা প্রদান ও উন্নত করা, আপনার সাথে যোগাযোগ রাখা
                    এবং একটি নিরাপদ অভিজ্ঞতা নিশ্চিত করার জন্য ব্যবহার করা হয়।
                </Text>

                <Text style={styles.sectionTitle}>ডেটা নিরাপত্তা</Text>
                <Text style={styles.paragraph}>
                    আমরা আপনার তথ্য অননুমোদিত প্রবেশ, পরিবর্তন বা প্রকাশ থেকে রক্ষা করতে
                    যুক্তিসঙ্গত নিরাপত্তা ব্যবস্থা গ্রহণ করি।
                </Text>

                <Text style={styles.sectionTitle}>তৃতীয় পক্ষের সেবা</Text>
                <Text style={styles.paragraph}>
                    অ্যাপের কার্যকারিতা উন্নত করার জন্য আমরা তৃতীয় পক্ষের সেবা ব্যবহার
                    করতে পারি। এসব সেবা তাদের নিজস্ব প্রাইভেসি নীতিমালা অনুসরণ করে।
                </Text>

                <Text style={styles.sectionTitle}>এই নীতিমালার পরিবর্তন</Text>
                <Text style={styles.paragraph}>
                    আমরা সময়ে সময়ে এই প্রাইভেসি পলিসি আপডেট করতে পারি। যেকোনো পরিবর্তন
                    এই পেজে প্রকাশ করা হবে।
                </Text>

                <Text style={styles.sectionTitle}>যোগাযোগ করুন</Text>
                <Text style={styles.paragraph}>
                    এই প্রাইভেসি পলিসি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে অনুগ্রহ করে আমাদের
                    সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                </Text>
            </ScrollView>
        </View>
    )
}

export default PrivacyPolicy
