import { IconSymbol, IconSymbolSecond } from '@/components/ui/icon-symbol'
import { usePlatformFeeDueBadge } from '@/hooks/usePlatformFeeDueBadge'
import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

function HubTabIcon({ color }: { color: string }) {
    const needsAction = usePlatformFeeDueBadge()

    return (
        <View style={styles.iconWrap}>
            <IconSymbol size={28} name="info.circle.fill" color={color} />
            {needsAction ? (
                <View style={styles.badge} accessibilityLabel="পেমেন্ট বকেয়া">
                    <Text style={styles.badgeText}>!</Text>
                </View>
            ) : null}
        </View>
    )
}

const TabLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            {/* Category browse moved to Home — hide tab for now */}
            <Tabs.Screen
                name="categories"
                options={{
                    href: null,
                    title: 'Categories',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="message" color={color} />,
                }}
            />
            <Tabs.Screen
                name="hub"
                options={{
                    title: 'Hub',
                    tabBarIcon: ({ color }) => <HubTabIcon color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconSymbolSecond size={28} name="user" color={color} />,
                }}
            />
        </Tabs>
    )
}

export default TabLayout

const styles = StyleSheet.create({
    iconWrap: {
        width: 32,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -4,
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '800',
        lineHeight: 11,
    },
})
