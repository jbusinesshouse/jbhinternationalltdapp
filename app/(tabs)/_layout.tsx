import { IconSymbol, IconSymbolSecond } from '@/components/ui/icon-symbol'
import { Tabs } from 'expo-router'
import React from 'react'

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
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="info.circle.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconSymbolSecond size={28} name="user" color={color} />,
                }}
            />
            {/* <Tabs.Screen
                name="privacyPolicy"
                options={{
                    href: null,
                    title: 'Privacy Policy',
                    tabBarIcon: ({ color }) => <IconSymbolSecond size={28} name="user" color={color} />,
                }}
            /> */}
        </Tabs>
    )
}

export default TabLayout