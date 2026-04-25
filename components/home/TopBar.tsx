import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'

const TopBar = () => {
    const [activeInd, setActiveInd] = useState(0)
    const [searchVal, setSearchVal] = useState('')

    // 🔴 NEW: unread notifications count
    const [unreadCount, setUnreadCount] = useState(0)

    const handleTopMenu = (i: number) => {
        setActiveInd(i)
    }

    const handleInp = (text: string) => {
        setSearchVal(text)
    }

    const handleSearch = () => {
        if (!searchVal?.trim()) return

        router.push({
            pathname: '/search/[query]',
            params: { query: searchVal }
        })
    }

    const fetchUnreadNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false)

            if (error) {
                if (__DEV__) {
                    console.log('Notification fetch error:', error)
                }
                return
            }

            setUnreadCount(count || 0)

        } catch (err) {
            if (__DEV__) {
                console.log('Notification error:', err)
            }
        }
    }

    useEffect(() => {
        fetchUnreadNotifications()

        // optional: refresh every 10s (light real-time effect)
        const interval = setInterval(fetchUnreadNotifications, 10000)

        return () => clearInterval(interval)
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.TopMenuWrapper}>
                <View style={styles.topMenuLeft}>
                    {/* <TouchableOpacity onPress={() => handleTopMenu(0)}>
                        <Text style={{
                            ...styles.buttonText,
                            borderBottomWidth: activeInd === 0 ? 2 : 0
                        }}>
                            All Products
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleTopMenu(1)}>
                        <Text style={{
                            ...styles.buttonText,
                            borderBottomWidth: activeInd === 1 ? 2 : 0
                        }}>
                            Top Sellers
                        </Text>
                    </TouchableOpacity> */}
                    <Text style={styles.headingTitle}>Home</Text>
                </View>

                {/* 🔔 NOTIFICATION ICON + BADGE */}
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <View style={{ position: 'relative' }}>
                        <Image
                            source={require('@/assets/images/icons/bell.png')}
                            style={styles.notiImage}
                        />

                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <TextInput
                    style={styles.searchInp}
                    placeholder='Search For Products'
                    placeholderTextColor="#9CA3AF"
                    value={searchVal}
                    onChangeText={handleInp}
                />

                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                    <Image
                        source={require('@/assets/images/icons/search.png')}
                        style={styles.searchImg}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default TopBar


const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 15,
        backgroundColor: '#000000',
    },
    TopMenuWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    topMenuLeft: {
        display: 'flex',
        flexDirection: 'row',
        gap: 30,
    },
    notiImage: {
        width: 23,
        height: 23,
        filter: 'invert(1)',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 17,
        paddingBottom: 5,
        borderBottomColor: '#ffffff'
    },
    headingTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 600
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'red',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },

    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    searchWrapper: {
        width: '100%',
        position: 'relative',
    },
    searchInp: {
        height: 50,
        borderRadius: 8,
        paddingLeft: 15,
        paddingRight: 75,
        fontSize: 16,
        color: '#000000',
        backgroundColor: '#ffffff',
    },
    searchBtn: {
        width: 55,
        height: 40,
        backgroundColor: '#f5832b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        position: 'absolute',
        top: 5,
        right: 5,
    },
    searchImg: {
        width: 23,
        height: 23,
        filter: 'invert(1)',
    },
})