import { useChatInbox } from '@/context/ChatInboxContext';
import { useUser } from '@/context/UserContext';
import {
    ChatMessage,
    ChatProductPayload,
    fetchChatMessages,
    fetchChatRoom,
    parseChatMessageContent,
    sendChatMessage,
} from '@/lib/chat';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RenderProps = {
    item: ChatMessage;
};

type ProductCardProps = {
    product: ChatProductPayload;
    isSelf: boolean;
    onPress: () => void;
};

const ProductCardBubble = ({ product, isSelf, onPress }: ProductCardProps) => (
    <Pressable
        onPress={onPress}
        style={[styles.productCard, isSelf ? styles.productCardSelf : styles.productCardOther]}
    >
        <Image
            source={
                product.imageUrl
                    ? { uri: product.imageUrl }
                    : require('@/assets/images/product1.png')
            }
            style={styles.productCardImage}
        />
        <View style={styles.productCardInfo}>
            <Text numberOfLines={2} style={styles.productCardName}>
                {product.name}
            </Text>
            <Text style={styles.productCardPrice}>BDT {product.price}</Text>
            <Text style={styles.productCardMoq}>Min. order {product.moq} pieces</Text>
            <Text style={styles.productCardIntro}>{product.introText}</Text>
            <Text style={styles.productCardLink}>View product</Text>
        </View>
    </Pressable>
);

const SingleMessage = () => {
    const navigation = useNavigation();
    const { user } = useUser();
    const { messagesByRoom, setMessages, appendMessage, upsertRoomPreview } = useChatInbox();
    const insets = useSafeAreaInsets();
    const listRef = useRef<FlatList<ChatMessage>>(null);
    const messagesByRoomRef = useRef(messagesByRoom);
    messagesByRoomRef.current = messagesByRoom;

    const {
        id: roomId,
        otherPartyName,
        otherPartyAvatar,
        productName,
    } = useLocalSearchParams<{
        id: string;
        otherPartyName?: string;
        otherPartyAvatar?: string;
        productName?: string;
        productId?: string;
        otherPartyId?: string;
    }>();

    const messages = roomId ? (messagesByRoom[roomId] ?? []) : [];
    const [messageVal, setMessageVal] = useState('');
    const [hydrating, setHydrating] = useState(false);
    const [sending, setSending] = useState(false);
    const [roomProductName, setRoomProductName] = useState(productName ?? '');

    const headerTitle = otherPartyName || 'Chat';
    const avatarUri = otherPartyAvatar || undefined;
    const inputBottomPadding = Math.max(insets.bottom, 15);

    const scrollToEnd = useCallback((animated = true) => {
        requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({ animated });
        });
    }, []);

    useEffect(() => {
        if (!roomId) return;

        let cancelled = false;
        const hasCachedMessages = (messagesByRoomRef.current[roomId]?.length ?? 0) > 0;
        setHydrating(!hasCachedMessages);

        void (async () => {
            const [messagesResult, roomResult] = await Promise.all([
                fetchChatMessages(roomId),
                fetchChatRoom(roomId),
            ]);

            if (cancelled) return;

            if (!messagesResult.error) {
                setMessages(roomId, messagesResult.data);
            } else {
                Alert.alert('Error', messagesResult.error);
            }

            if (roomResult.data?.product?.name) {
                setRoomProductName(roomResult.data.product.name);
            }

            setHydrating(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [roomId, setMessages]);

    useEffect(() => {
        if (messages.length === 0) return;
        scrollToEnd();
    }, [messages.length, scrollToEnd]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleSend = async () => {
        if (!roomId || !user || sending) return;

        const trimmed = messageVal.trim();
        if (!trimmed) return;

        setSending(true);
        setMessageVal('');
        Keyboard.dismiss();

        const { data, error } = await sendChatMessage(roomId, user.id, trimmed);
        setSending(false);

        if (error) {
            setMessageVal(trimmed);
            Alert.alert('Send failed', error);
            return;
        }

        if (data) {
            appendMessage(roomId, data);
        } else {
            upsertRoomPreview(roomId, trimmed);
        }
    };

    const openProduct = (productId: string) => {
        router.push({
            pathname: '/product/[id]',
            params: { id: productId },
        });
    };

    const renderItem = ({ item }: RenderProps) => {
        const isSelf = item.sender_id === user?.id;
        const parsed = parseChatMessageContent(item.message_text);

        if (parsed.kind === 'product') {
            return (
                <View style={[styles.messageRow, isSelf ? styles.messageRowSelf : styles.messageRowOther]}>
                    {!isSelf ? (
                        <Image
                            source={
                                avatarUri
                                    ? { uri: avatarUri }
                                    : require('@/assets/images/store1.jpg')
                            }
                            style={styles.otherMessageImg}
                        />
                    ) : null}
                    <ProductCardBubble
                        product={parsed.product}
                        isSelf={isSelf}
                        onPress={() => openProduct(parsed.product.productId)}
                    />
                </View>
            );
        }

        if (!isSelf) {
            return (
                <View style={styles.otherMessage}>
                    <Image
                        source={
                            avatarUri
                                ? { uri: avatarUri }
                                : require('@/assets/images/store1.jpg')
                        }
                        style={styles.otherMessageImg}
                    />
                    <View style={styles.otherMessageTextWrapper}>
                        <Text style={styles.messageText}>{parsed.text}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.selfMessage}>
                <Text style={styles.selfMessageText}>{parsed.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.messageHead}>
                <Pressable style={styles.backBtn} onPress={handleBackPress}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>
                <View style={styles.messageHeadInfo}>
                    <Image
                        source={
                            avatarUri
                                ? { uri: avatarUri }
                                : require('@/assets/images/store1.jpg')
                        }
                        style={styles.messageHeadImg}
                    />
                    <View style={styles.messageHeadTextBlock}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.messageHeadPerson}>
                            {headerTitle}
                        </Text>
                        {roomProductName ? (
                            <Text numberOfLines={1} style={styles.messageHeadProduct}>
                                {roomProductName}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </View>

            <View style={styles.messageMain}>
                {hydrating && messages.length === 0 ? (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator size="large" color="#f5832b" />
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.messageListContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                        onContentSizeChange={() => scrollToEnd(false)}
                    />
                )}
            </View>

            <View style={[styles.messageSendWrapper, { paddingBottom: inputBottomPadding }]}>
                <TextInput
                    style={styles.messageInp}
                    placeholder="Message about this product"
                    placeholderTextColor="#9CA3AF"
                    value={messageVal}
                    onChangeText={setMessageVal}
                    editable={!sending}
                    multiline
                />
                <Pressable
                    style={[styles.sendBtn, sending && { opacity: 0.7 }]}
                    onPress={handleSend}
                    disabled={sending || !messageVal.trim()}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Image
                            source={require('@/assets/images/icons/send.png')}
                            style={styles.sendIcon}
                        />
                    )}
                </Pressable>
            </View>
        </View>
    );
};

export default SingleMessage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    messageHead: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
    },
    backBtn: {
        marginRight: 15,
    },
    backIcon: {
        width: 30,
        height: 30,
        transform: [{ rotate: '180deg' }],
    },
    messageHeadInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    messageHeadImg: {
        width: 45,
        height: 45,
        borderRadius: 30,
        objectFit: 'cover',
    },
    messageHeadTextBlock: {
        flex: 1,
    },
    messageHeadPerson: {
        fontSize: 15,
        fontWeight: '500',
    },
    messageHeadProduct: {
        fontSize: 12,
        color: '#9b9b9b',
        marginTop: 2,
    },
    messageMain: {
        flex: 1,
        paddingBottom: 10,
        paddingHorizontal: 15,
    },
    messageListContent: {
        paddingVertical: 12,
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    loadingWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageRow: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 8,
        maxWidth: '92%',
    },
    messageRowSelf: {
        alignSelf: 'flex-end',
    },
    messageRowOther: {
        alignSelf: 'flex-start',
    },
    otherMessage: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 8,
        maxWidth: '85%',
    },
    otherMessageImg: {
        width: 35,
        height: 35,
        borderRadius: 20,
        objectFit: 'cover',
    },
    otherMessageTextWrapper: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        backgroundColor: '#ffffff',
    },
    messageText: {
        color: '#111827',
    },
    selfMessage: {
        maxWidth: '85%',
        backgroundColor: '#ffd49dff',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderBottomRightRadius: 0,
        marginVertical: 8,
        alignSelf: 'flex-end',
    },
    selfMessageText: {
        color: '#111827',
    },
    productCard: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        backgroundColor: '#ffffff',
    },
    productCardSelf: {
        backgroundColor: '#fff8ef',
        borderColor: '#f5d9b8',
    },
    productCardOther: {
        backgroundColor: '#ffffff',
    },
    productCardImage: {
        width: 88,
        height: 110,
        objectFit: 'cover',
    },
    productCardInfo: {
        flex: 1,
        padding: 10,
        gap: 2,
    },
    productCardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    productCardPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#f5832b',
        marginTop: 2,
    },
    productCardMoq: {
        fontSize: 12,
        color: '#6b7280',
    },
    productCardIntro: {
        fontSize: 12,
        color: '#374151',
        marginTop: 6,
    },
    productCardLink: {
        fontSize: 12,
        color: '#f5832b',
        fontWeight: '600',
        marginTop: 4,
    },
    messageSendWrapper: {
        backgroundColor: '#ffffff',
        paddingTop: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
    },
    messageInp: {
        flex: 1,
        minHeight: 50,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: '#ddddddff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 30,
        marginRight: 15,
        color: '#000000',
        backgroundColor: '#ffffff',
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#ff5200',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendIcon: {
        width: 25,
        height: 25,
        filter: 'invert(1)',
    },
});
