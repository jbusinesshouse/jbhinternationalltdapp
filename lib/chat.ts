import { supabase } from '@/lib/supabase';

export const PRODUCT_MESSAGE_PREFIX = '__PRODUCT__';

export type ChatProductPayload = {
    type: 'product';
    productId: string;
    name: string;
    price: string;
    moq: number;
    imageUrl: string | null;
    introText: string;
};

export type ChatMessage = {
    id: string;
    room_id: string;
    sender_id: string;
    message_text: string;
    is_read: boolean;
    created_at: string;
};

export type ChatRoom = {
    id: string;
    buyer_id: string;
    seller_id: string;
    product_id: string;
    created_at: string;
    updated_at: string;
};

export type ChatRoomListItem = ChatRoom & {
    product: { id: string; name: string } | null;
    buyer: { id: string; store_name: string | null; avatar_url: string | null } | null;
    seller: { id: string; store_name: string | null; avatar_url: string | null } | null;
    last_message?: string;
};

type FindOrCreateResult =
    | { roomId: string; isNew: boolean }
    | { error: string };

export function buildProductInterestMessage(product: Omit<ChatProductPayload, 'type' | 'introText'>): string {
    const payload: ChatProductPayload = {
        type: 'product',
        ...product,
        introText: `Hi, I am interested in your product: ${product.name}`,
    };

    return `${PRODUCT_MESSAGE_PREFIX}${JSON.stringify(payload)}`;
}

export function parseChatMessageContent(text: string):
    | { kind: 'product'; product: ChatProductPayload }
    | { kind: 'text'; text: string } {
    if (!text.startsWith(PRODUCT_MESSAGE_PREFIX)) {
        return { kind: 'text', text };
    }

    try {
        const product = JSON.parse(text.slice(PRODUCT_MESSAGE_PREFIX.length)) as ChatProductPayload;
        if (product?.type === 'product' && product.name) {
            return { kind: 'product', product };
        }
    } catch {
        // fall through to plain text
    }

    return { kind: 'text', text };
}

export function getMessagePreviewText(text?: string): string {
    if (!text) return 'No messages yet';

    const parsed = parseChatMessageContent(text);
    if (parsed.kind === 'product') {
        return parsed.product.introText;
    }

    return parsed.text;
}

export type ChatRoomProduct = {
    id: string;
    name: string;
    price: string;
    moq: number;
    product_images: { image_url: string; is_main: boolean }[];
};

export async function fetchChatRoom(roomId: string): Promise<{
    data: {
        id: string;
        buyer_id: string;
        seller_id: string;
        product_id: string;
        product: ChatRoomProduct | null;
    } | null;
    error: string | null;
}> {
    const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
            id,
            buyer_id,
            seller_id,
            product_id,
            product:products (
                id,
                name,
                price,
                moq,
                product_images (
                    image_url,
                    is_main
                )
            )
        `)
        .eq('id', roomId)
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    const product = Array.isArray(data.product) ? data.product[0] : data.product;

    return {
        data: {
            ...data,
            product: product ?? null,
        },
        error: null,
    };
}

export async function findOrCreateChatRoom(
    buyerId: string,
    sellerId: string,
    product: Omit<ChatProductPayload, 'type' | 'introText'>,
): Promise<FindOrCreateResult> {
    const productId = product.productId;
    const { data: existing, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .eq('product_id', productId)
        .maybeSingle();

    if (fetchError) {
        return { error: fetchError.message };
    }

    if (existing) {
        return { roomId: existing.id, isNew: false };
    }

    const { data: newRoom, error: insertError } = await supabase
        .from('chat_rooms')
        .insert({
            buyer_id: buyerId,
            seller_id: sellerId,
            product_id: productId,
        })
        .select('id')
        .single();

    if (insertError || !newRoom) {
        return { error: insertError?.message ?? 'Failed to create chat room' };
    }

    const initialText = buildProductInterestMessage(product);
    const { error: messageError } = await supabase.from('chat_messages').insert({
        room_id: newRoom.id,
        sender_id: buyerId,
        message_text: initialText,
        is_read: false,
    });

    if (messageError) {
        return { error: messageError.message };
    }

    return { roomId: newRoom.id, isNew: true };
}

export async function fetchChatMessages(roomId: string): Promise<{
    data: ChatMessage[];
    error: string | null;
}> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error) {
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}

export async function sendChatMessage(
    roomId: string,
    senderId: string,
    messageText: string,
): Promise<{ data: ChatMessage | null; error: string | null }> {
    const trimmed = messageText.trim();
    if (!trimmed) {
        return { data: null, error: 'Message cannot be empty' };
    }

    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            room_id: roomId,
            sender_id: senderId,
            message_text: trimmed,
            is_read: false,
        })
        .select('*')
        .single();

    if (error) {
        return { data: null, error: error.message };
    }

    await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

    return { data, error: null };
}

export async function fetchLatestMessagesForRooms(
    roomIds: string[],
): Promise<Map<string, string>> {
    const previewByRoom = new Map<string, string>();
    if (roomIds.length === 0) {
        return previewByRoom;
    }

    const results = await Promise.all(
        roomIds.map(async (roomId) => {
            const { data } = await supabase
                .from('chat_messages')
                .select('room_id, message_text')
                .eq('room_id', roomId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            return data;
        }),
    );

    for (const message of results) {
        if (message) {
            previewByRoom.set(
                message.room_id,
                getMessagePreviewText(message.message_text),
            );
        }
    }

    return previewByRoom;
}

export function sortChatRooms(rooms: ChatRoomListItem[]): ChatRoomListItem[] {
    return [...rooms].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
}

async function enrichChatRooms(
    rooms: Omit<ChatRoomListItem, 'buyer' | 'seller' | 'last_message'>[],
): Promise<ChatRoomListItem[]> {
    if (rooms.length === 0) {
        return [];
    }

    const profileIds = Array.from(
        new Set(rooms.flatMap((room) => [room.buyer_id, room.seller_id])),
    );

    const { data: profiles } = profileIds.length
        ? await supabase
            .from('profiles')
            .select('id, store_name, avatar_url')
            .in('id', profileIds)
        : { data: [] as { id: string; store_name: string | null; avatar_url: string | null }[] };

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    const previewByRoom = await fetchLatestMessagesForRooms(rooms.map((room) => room.id));

    return rooms.map((room) => ({
        ...room,
        product: Array.isArray(room.product) ? room.product[0] : room.product,
        buyer: profileById.get(room.buyer_id) ?? null,
        seller: profileById.get(room.seller_id) ?? null,
        last_message: previewByRoom.get(room.id),
    })) as ChatRoomListItem[];
}

export async function fetchChatRoomListItem(
    userId: string,
    roomId: string,
): Promise<ChatRoomListItem | null> {
    const { data: room, error } = await supabase
        .from('chat_rooms')
        .select(`
            id,
            buyer_id,
            seller_id,
            product_id,
            created_at,
            updated_at,
            product:products (
                id,
                name
            )
        `)
        .eq('id', roomId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .maybeSingle();

    if (error || !room) {
        return null;
    }

    const [enriched] = await enrichChatRooms([room as Omit<ChatRoomListItem, 'buyer' | 'seller' | 'last_message'>]);
    return enriched ?? null;
}

export async function fetchUserChatRooms(userId: string): Promise<{
    data: ChatRoomListItem[];
    error: string | null;
}> {
    const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
            id,
            buyer_id,
            seller_id,
            product_id,
            created_at,
            updated_at,
            product:products (
                id,
                name
            )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

    if (error) {
        return { data: [], error: error.message };
    }

    const enriched = await enrichChatRooms(
        (rooms ?? []) as Omit<ChatRoomListItem, 'buyer' | 'seller' | 'last_message'>[],
    );

    return {
        data: sortChatRooms(enriched),
        error: null,
    };
}
