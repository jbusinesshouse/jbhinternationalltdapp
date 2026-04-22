import { styles } from '@/styles/aboutApp'
import { useNavigation } from 'expo-router'
import React from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View
} from 'react-native'

const AboutApp = () => {
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

                <Text style={styles.headerTitle}>About App</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>JBH International Limited</Text>
                <Text style={styles.paragraph}>
                    JBH International Limited is a B2B marketplace designed to
                    connect clothing wholesalers with retailers in a simple,
                    efficient, and reliable way.
                </Text>

                <Text style={styles.sectionTitle}>What We Do</Text>
                <Text style={styles.paragraph}>
                    Our platform enables wholesalers to showcase their clothing
                    products while allowing retailers to discover, compare, and
                    purchase items directly from trusted suppliers.
                </Text>

                <Text style={styles.sectionTitle}>Who It’s For</Text>
                <Text style={styles.paragraph}>
                    This app is built for clothing wholesalers and retail
                    businesses looking to streamline sourcing, reduce manual
                    communication, and manage orders more effectively.
                </Text>

                <Text style={styles.sectionTitle}>Our Goal</Text>
                <Text style={styles.paragraph}>
                    Our goal is to simplify the wholesale-to-retail process by
                    providing a transparent, digital-first platform that saves
                    time and helps businesses grow.
                </Text>

                <Text style={styles.sectionTitle}>Commitment</Text>
                <Text style={styles.paragraph}>
                    We are committed to improving the experience for both
                    wholesalers and retailers by continuously enhancing
                    performance, security, and usability.
                </Text>
            </ScrollView>
        </View>
    )
}

export default AboutApp
