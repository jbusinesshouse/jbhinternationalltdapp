import { apiRequest, ApiError } from "@/lib/api";

export const PRODUCT_MESSAGE_PREFIX = "__PRODUCT__";

export type ChatProductPayload = {
  type: "product";
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

export function buildProductInterestMessage(
  product: Omit<ChatProductPayload, "type" | "introText">
): string {
  const payload: ChatProductPayload = {
    type: "product",
    ...product,
    introText: `Hi, I am interested in your product: ${product.name}`,
  };

  return `${PRODUCT_MESSAGE_PREFIX}${JSON.stringify(payload)}`;
}

export function parseChatMessageContent(
  text: string
):
  | { kind: "product"; product: ChatProductPayload }
  | { kind: "text"; text: string } {
  if (!text.startsWith(PRODUCT_MESSAGE_PREFIX)) {
    return { kind: "text", text };
  }

  try {
    const product = JSON.parse(
      text.slice(PRODUCT_MESSAGE_PREFIX.length)
    ) as ChatProductPayload;
    if (product?.type === "product" && product.name) {
      return { kind: "product", product };
    }
  } catch {
    // fall through
  }

  return { kind: "text", text };
}

export function getMessagePreviewText(text?: string): string {
  if (!text) return "No messages yet";

  const parsed = parseChatMessageContent(text);
  if (parsed.kind === "product") {
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

function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

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
  try {
    const res = await apiRequest<{ room: any }>(`/chat/rooms/${roomId}`);
    const room = res.room;
    const product = Array.isArray(room.product) ? room.product[0] : room.product;
    return {
      data: {
        id: room.id,
        buyer_id: room.buyer_id,
        seller_id: room.seller_id,
        product_id: room.product_id,
        product: product ?? null,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

/** Buyer is always the authenticated user (JWT). */
export async function findOrCreateChatRoom(
  sellerId: string,
  product: Omit<ChatProductPayload, "type" | "introText">
): Promise<FindOrCreateResult> {
  try {
    const res = await apiRequest<{ roomId: string; isNew: boolean }>(
      "/chat/rooms",
      {
        method: "POST",
        body: {
          sellerId,
          product: {
            productId: product.productId,
            name: product.name,
            price: product.price,
            moq: product.moq,
            imageUrl: product.imageUrl,
          },
        },
      }
    );
    return { roomId: res.roomId, isNew: res.isNew };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

export async function fetchChatMessages(roomId: string): Promise<{
  data: ChatMessage[];
  error: string | null;
}> {
  try {
    const res = await apiRequest<{ messages: ChatMessage[] }>(
      `/chat/rooms/${roomId}/messages`
    );
    return { data: res.messages ?? [], error: null };
  } catch (err) {
    return { data: [], error: toErrorMessage(err) };
  }
}

export async function sendChatMessage(
  roomId: string,
  messageText: string
): Promise<{ data: ChatMessage | null; error: string | null }> {
  const trimmed = messageText.trim();
  if (!trimmed) {
    return { data: null, error: "Message cannot be empty" };
  }

  try {
    const res = await apiRequest<{ message: ChatMessage }>(
      `/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        body: { message: trimmed },
      }
    );
    return { data: res.message, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export function sortChatRooms(rooms: ChatRoomListItem[]): ChatRoomListItem[] {
  return [...rooms].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function fetchUserChatRooms(): Promise<{
  data: ChatRoomListItem[];
  error: string | null;
}> {
  try {
    const res = await apiRequest<{ rooms: ChatRoomListItem[] }>("/chat/rooms");
    return {
      data: sortChatRooms(res.rooms ?? []),
      error: null,
    };
  } catch (err) {
    return { data: [], error: toErrorMessage(err) };
  }
}

export async function fetchChatRoomListItem(
  roomId: string
): Promise<ChatRoomListItem | null> {
  const { data, error } = await fetchUserChatRooms();
  if (error) return null;
  return data.find((room) => room.id === roomId) ?? null;
}
