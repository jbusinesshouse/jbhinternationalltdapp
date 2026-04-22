import { styles } from '@/styles/termsAndConditions'
import { useNavigation } from 'expo-router'
import React from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native'

const TermsAndConditions = () => {
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

                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* English Content */}
                <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
                <Text style={styles.paragraph}>
                    By accessing or using this app, you agree to be bound by these
                    Terms and Conditions. If you do not agree, please do not use
                    the app.
                </Text>

                <Text style={styles.sectionTitle}>Use of the App</Text>
                <Text style={styles.paragraph}>
                    You agree to use the app only for lawful purposes and in a way
                    that does not infringe the rights of others or restrict their
                    use of the app.
                </Text>

                <Text style={styles.sectionTitle}>User Accounts</Text>
                <Text style={styles.paragraph}>
                    You are responsible for maintaining the confidentiality of
                    your account and for all activities that occur under your
                    account.
                </Text>

                <Text style={styles.sectionTitle}>User Data and Content</Text>
                <Text style={styles.paragraph}>
                    By creating an account and using the app, you agree to provide accurate
                    information such as your name, email, phone number, store information, and
                    address. You are responsible for all content you upload, including product
                    information, images, and descriptions. The app may use this information to
                    provide services, communicate with you, and improve the platform.
                </Text>

                <Text style={styles.sectionTitle}>Prohibited Activities</Text>
                <Text style={styles.paragraph}>
                    You must not misuse the app by introducing malicious code,
                    attempting unauthorized access, or engaging in harmful or
                    abusive behavior.
                </Text>

                <Text style={styles.sectionTitle}>Termination</Text>
                <Text style={styles.paragraph}>
                    We reserve the right to suspend or terminate your access to
                    the app at any time if you violate these Terms and Conditions.
                </Text>

                <Text style={styles.sectionTitle}>Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                    We are not liable for any damages arising from your use or
                    inability to use the app, to the fullest extent permitted by
                    law.
                </Text>

                <Text style={styles.sectionTitle}>Changes to These Terms</Text>
                <Text style={styles.paragraph}>
                    We may update these Terms and Conditions from time to time.
                    Continued use of the app means you accept the updated terms.
                </Text>

                <Text style={styles.sectionTitle}>Contact</Text>
                <Text style={styles.paragraph}>
                    If you have any questions about these Terms and Conditions,
                    please contact our support team.
                </Text>

                {/* Divider between languages */}
                <View style={styles.divider} />

                {/* Bangla Content */}
                <Text style={styles.sectionTitle}>শর্তাবলীর গ্রহণযোগ্যতা</Text>
                <Text style={styles.paragraph}>
                    এই অ্যাপ ব্যবহার বা অ্যাক্সেস করার মাধ্যমে আপনি এই শর্তাবলীর সাথে
                    সম্মত হচ্ছেন। আপনি যদি এই শর্তগুলোতে সম্মত না হন, তাহলে অনুগ্রহ করে
                    অ্যাপটি ব্যবহার করবেন না।
                </Text>

                <Text style={styles.sectionTitle}>অ্যাপ ব্যবহারের নিয়ম</Text>
                <Text style={styles.paragraph}>
                    আপনি শুধুমাত্র বৈধ উদ্দেশ্যে অ্যাপটি ব্যবহার করবেন এবং এমন কোনো কাজ
                    করবেন না যা অন্যদের অধিকার লঙ্ঘন করে বা তাদের অ্যাপ ব্যবহারে বাধা সৃষ্টি করে।
                </Text>

                <Text style={styles.sectionTitle}>ইউজার অ্যাকাউন্ট</Text>
                <Text style={styles.paragraph}>
                    আপনার অ্যাকাউন্টের গোপনীয়তা রক্ষা করা এবং আপনার অ্যাকাউন্টের মাধ্যমে
                    সংঘটিত সকল কার্যকলাপের দায়িত্ব আপনার।
                </Text>

                <Text style={styles.sectionTitle}>ইউজার তথ্য ও কনটেন্ট</Text>
                <Text style={styles.paragraph}>
                    অ্যাকাউন্ট তৈরি ও অ্যাপ ব্যবহারের মাধ্যমে আপনি আপনার নাম, ইমেইল,
                    ফোন নম্বর, দোকানের তথ্য এবং ঠিকানা সহ সঠিক তথ্য প্রদান করতে সম্মত হন।
                    আপনি যে কোনো কনটেন্ট আপলোড করেন—যেমন পণ্যের তথ্য, ছবি ও বর্ণনা—তার সম্পূর্ণ
                    দায়িত্ব আপনার। এই তথ্য অ্যাপের সেবা প্রদান, আপনার সাথে যোগাযোগ এবং
                    প্ল্যাটফর্ম উন্নত করার জন্য ব্যবহার করা হতে পারে।
                </Text>

                <Text style={styles.sectionTitle}>নিষিদ্ধ কার্যকলাপ</Text>
                <Text style={styles.paragraph}>
                    আপনি কোনো ক্ষতিকর কোড যুক্ত করা, অননুমোদিত প্রবেশের চেষ্টা করা অথবা
                    ক্ষতিকর ও অপমানজনক আচরণের মাধ্যমে অ্যাপটির অপব্যবহার করতে পারবেন না।
                </Text>

                <Text style={styles.sectionTitle}>অ্যাকাউন্ট বাতিলকরণ</Text>
                <Text style={styles.paragraph}>
                    আপনি যদি এই শর্তাবলী লঙ্ঘন করেন, তাহলে যেকোনো সময় আপনার অ্যাপ ব্যবহারের
                    অধিকার স্থগিত বা বাতিল করার ক্ষমতা আমরা সংরক্ষণ করি।
                </Text>

                <Text style={styles.sectionTitle}>দায়বদ্ধতার সীমাবদ্ধতা</Text>
                <Text style={styles.paragraph}>
                    আইনে অনুমোদিত সর্বোচ্চ সীমার মধ্যে, অ্যাপ ব্যবহার বা ব্যবহার করতে অক্ষমতার
                    কারণে সৃষ্ট কোনো ক্ষতির জন্য আমরা দায়ী থাকবো না।
                </Text>

                <Text style={styles.sectionTitle}>শর্তাবলীর পরিবর্তন</Text>
                <Text style={styles.paragraph}>
                    আমরা সময়ে সময়ে এই শর্তাবলী পরিবর্তন করতে পারি। অ্যাপ ব্যবহার চালিয়ে যাওয়া
                    মানে আপনি হালনাগাদ শর্তাবলী মেনে নিচ্ছেন।
                </Text>

                <Text style={styles.sectionTitle}>যোগাযোগ</Text>
                <Text style={styles.paragraph}>
                    এই শর্তাবলী সম্পর্কে আপনার কোনো প্রশ্ন থাকলে অনুগ্রহ করে আমাদের
                    সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                </Text>
            </ScrollView>

        </View>
    )
}

export default TermsAndConditions
