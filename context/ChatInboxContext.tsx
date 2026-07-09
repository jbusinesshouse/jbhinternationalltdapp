import { useUser } from '@/context/UserContext';
import {
    ChatMessage,
    ChatRoomListItem,
    fetchChatRoomListItem,
    fetchUserChatRooms,
    getMessagePreviewText,
    sortChatRooms,
} from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

type ChatInboxContextType = {
    rooms: ChatRoomListItem[];
    messagesByRoom: Record<string, ChatMessage[]>;
    initialLoading: boolean;
    refreshing: boolean;
    refresh: () => Promise<void>;
    getMessages: (roomId: string) => ChatMessage[];
    setMessages: (roomId: string, messages: ChatMessage[]) => void;
    appendMessage: (roomId: string, message: ChatMessage) => void;
    upsertRoomPreview: (roomId: string, messageText: string, updatedAt?: string) => void;
};

const ChatInboxContext = createContext<ChatInboxContextType | undefined>(undefined);

export function ChatInboxProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const userId = user?.id ?? null;

    const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
    const [initialLoading, setInitialLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});

    const hasLoadedRef = useRef(false);
    const userIdRef = useRef<string | null>(null);

    const upsertRoomPreview = useCallback((roomId: string, messageText: string, updatedAt?: string) => {
        const preview = getMessagePreviewText(messageText);
        const nextUpdatedAt = updatedAt ?? new Date().toISOString();

        setRooms((prev) => {
            const index = prev.findIndex((room) => room.id === roomId);
            if (index === -1) {
                return prev;
            }

            const updatedRoom = {
                ...prev[index],
                last_message: preview,
                updated_at: nextUpdatedAt,
            };
            const next = [...prev];
            next.splice(index, 1);
            return sortChatRooms([updatedRoom, ...next]);
        });
    }, []);

    const loadRooms = useCallback(async (options?: { silent?: boolean }) => {
        if (!userId) {
            setRooms([]);
            setMessagesByRoom({});
            hasLoadedRef.current = false;
            return;
        }

        if (!options?.silent && !hasLoadedRef.current) {
            setInitialLoading(true);
        }

        const { data, error } = await fetchUserChatRooms(userId);

        if (!options?.silent && !hasLoadedRef.current) {
            setInitialLoading(false);
        }

        if (!error) {
            setRooms(data);
            hasLoadedRef.current = true;
        }
    }, [userId]);

    const refresh = useCallback(async () => {
        if (!userId) return;

        setRefreshing(true);
        await loadRooms({ silent: true });
        setRefreshing(false);
    }, [loadRooms, userId]);

    const getMessages = useCallback(
        (roomId: string) => messagesByRoom[roomId] ?? [],
        [messagesByRoom],
    );

    const setMessages = useCallback((roomId: string, messages: ChatMessage[]) => {
        setMessagesByRoom((prev) => ({
            ...prev,
            [roomId]: messages,
        }));
    }, []);

    const appendMessage = useCallback((roomId: string, message: ChatMessage) => {
        setMessagesByRoom((prev) => {
            const existing = prev[roomId] ?? [];
            if (existing.some((item) => item.id === message.id)) {
                return prev;
            }

            return {
                ...prev,
                [roomId]: [...existing, message],
            };
        });

        upsertRoomPreview(roomId, message.message_text, message.created_at);
    }, [upsertRoomPreview]);

    useEffect(() => {
        if (userIdRef.current === userId) {
            return;
        }

        userIdRef.current = userId;
        hasLoadedRef.current = false;
        setRooms([]);
        setMessagesByRoom({});

        if (!userId) {
            setInitialLoading(false);
            return;
        }

        void loadRooms();
    }, [userId, loadRooms]);

    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`chat-inbox-${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    const message = payload.new as ChatMessage;
                    appendMessage(message.room_id, message);
                },
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_rooms' },
                async (payload) => {
                    const room = payload.new as ChatRoomListItem;
                    if (room.buyer_id !== userId && room.seller_id !== userId) {
                        return;
                    }

                    const enriched = await fetchChatRoomListItem(userId, room.id);
                    if (!enriched) return;

                    setRooms((prev) => {
                        if (prev.some((item) => item.id === enriched.id)) {
                            return sortChatRooms(
                                prev.map((item) => (item.id === enriched.id ? { ...item, ...enriched } : item)),
                            );
                        }
                        return sortChatRooms([enriched, ...prev]);
                    });
                },
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_rooms' },
                (payload) => {
                    const room = payload.new as ChatRoomListItem;
                    if (room.buyer_id !== userId && room.seller_id !== userId) {
                        return;
                    }

                    setRooms((prev) => {
                        const index = prev.findIndex((item) => item.id === room.id);
                        if (index === -1) {
                            return prev;
                        }

                        const next = [...prev];
                        next[index] = { ...next[index], updated_at: room.updated_at };
                        return sortChatRooms(next);
                    });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, appendMessage]);

    const value = useMemo(
        () => ({
            rooms,
            messagesByRoom,
            initialLoading,
            refreshing,
            refresh,
            getMessages,
            setMessages,
            appendMessage,
            upsertRoomPreview,
        }),
        [
            rooms,
            messagesByRoom,
            initialLoading,
            refreshing,
            refresh,
            getMessages,
            setMessages,
            appendMessage,
            upsertRoomPreview,
        ],
    );

    return (
        <ChatInboxContext.Provider value={value}>
            {children}
        </ChatInboxContext.Provider>
    );
}

export function useChatInbox() {
    const context = useContext(ChatInboxContext);
    if (!context) {
        throw new Error('useChatInbox must be used within a ChatInboxProvider');
    }
    return context;
}
