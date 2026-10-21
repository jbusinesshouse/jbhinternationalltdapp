import {
    LEGAL_EFFECTIVE_DATE,
    LEGAL_LAST_UPDATED,
    TERMS_AND_CONDITIONS,
} from '@/lib/legalContent'
import { styles } from '@/styles/termsAndConditions'
import { useNavigation } from 'expo-router'
import React from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

const TermsAndConditions = () => {
    const navigation = useNavigation()

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>

                <Text style={styles.headerTitle}>{TERMS_AND_CONDITIONS.title}</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.paragraph, { marginBottom: 16 }]}>
                    Effective: {LEGAL_EFFECTIVE_DATE}
                    {'\n'}
                    Last updated: {LEGAL_LAST_UPDATED}
                </Text>

                {TERMS_AND_CONDITIONS.sectionsEn.map((section) => (
                    <View key={`en-${section.title}`}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.paragraphs.map((p, i) => (
                            <Text key={i} style={styles.paragraph}>
                                {p}
                            </Text>
                        ))}
                    </View>
                ))}

                <View style={styles.divider} />

                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>বাংলা</Text>

                {TERMS_AND_CONDITIONS.sectionsBn.map((section) => (
                    <View key={`bn-${section.title}`}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.paragraphs.map((p, i) => (
                            <Text key={i} style={styles.paragraph}>
                                {p}
                            </Text>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

export default TermsAndConditions
