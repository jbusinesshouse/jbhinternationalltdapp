import { useChatInbox } from '@/context/ChatInboxContext';
import { useUser } from '@/context/UserContext';
import { ChatRoomListItem } from '@/lib/chat';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    LayoutChangeEvent,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type RenderProps = {
    item: ChatRoomListItem;
};

const Messages = () => {
    const { user } = useUser();
    const { rooms, initialLoading, refreshing, refresh } = useChatInbox();
    const [messageWidth, setMessageWidth] = useState<number>(0);

    const handleLayout = (e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        setMessageWidth(width);
    };

    const handleMessageOpen = (room: ChatRoomListItem) => {
        const isBuyer = user?.id === room.buyer_id;
        const otherParty = isBuyer ? room.seller : room.buyer;

        router.push({
            pathname: '/messages/[id]',
            params: {
                id: room.id,
                productName: room.product?.name ?? '',
                productId: room.product_id,
                otherPartyName: otherParty?.store_name ?? 'User',
                otherPartyAvatar: otherParty?.avatar_url ?? '',
                otherPartyId: isBuyer ? room.seller_id : room.buyer_id,
            },
        });
    };

    const renderItem = ({ item }: RenderProps) => {
        const isBuyer = user?.id === item.buyer_id;
        const otherParty = isBuyer ? item.seller : item.buyer;
        const displayName = otherParty?.store_name ?? 'User';
        const preview = item.last_message ?? 'No messages yet';

        return (
            <Pressable
                onPress={() => handleMessageOpen(item)}
                style={styles.messageItem}
                onLayout={handleLayout}
            >
                <Image
                    source={
                        otherParty?.avatar_url
                            ? { uri: otherParty.avatar_url }
                            : require('@/assets/images/store1.jpg')
                    }
                    style={styles.messageImage}
                />
                <View style={{ ...styles.messageInfo, width: messageWidth > 0 ? messageWidth - 60 : undefined }}>
                    <Text numberOfLines={1} style={styles.messageName}>
                        {displayName}
                    </Text>
                    {item.product?.name ? (
                        <Text numberOfLines={1} style={styles.messageProduct}>
                            {item.product.name}
                        </Text>
                    ) : null}
                    <Text numberOfLines={2} style={styles.messagePrev}>
                        {preview}
                    </Text>
                </View>
            </Pressable>
        );
    };

    const flatHeaderSection = () => (
        <Text style={styles.messageMainHead}>All Messages</Text>
    );

    const showInitialLoader = initialLoading && rooms.length === 0;

    return (
        <View style={styles.container}>
            <View style={styles.messageHead}>
                <Text style={styles.messageHeadText}>Messages</Text>
            </View>

            <View style={styles.messageMain}>
                {showInitialLoader ? (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator size="large" color="#f5832b" />
                    </View>
                ) : !user ? (
                    <Text style={styles.noMessageText}>Sign in to view your messages.</Text>
                ) : rooms.length > 0 ? (
                    <FlatList
                        data={rooms}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={flatHeaderSection}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                        }
                    />
                ) : (
                    <Text style={styles.noMessageText}>No messages available!</Text>
                )}
            </View>
        </View>
    );
};

export default Messages;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    messageHead: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
    },
    messageHeadText: {
        fontSize: 20,
        fontWeight: '600',
    },
    messageMain: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 20,
        backgroundColor: '#ffffff',
    },
    messageMainHead: {
        marginBottom: 15,
    },
    messageItem: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        gap: 10,
    },
    messageImage: {
        width: 50,
        height: 50,
        objectFit: 'cover',
        borderRadius: 30,
    },
    messageInfo: {
        flex: 1,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    messageName: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    messageProduct: {
        fontSize: 12,
        color: '#f5832b',
        marginBottom: 6,
    },
    messagePrev: {
        color: '#9b9b9b',
    },
    noMessageText: {
        color: '#9b9b9b',
    },
    loadingWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
});
