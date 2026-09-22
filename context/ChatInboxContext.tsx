import { useUser } from "@/context/UserContext";
import {
  ChatMessage,
  ChatRoomListItem,
  fetchUserChatRooms,
  getMessagePreviewText,
  sortChatRooms,
} from "@/lib/chat";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

const INBOX_POLL_MS = 4000;

type ChatInboxContextType = {
  rooms: ChatRoomListItem[];
  messagesByRoom: Record<string, ChatMessage[]>;
  initialLoading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  getMessages: (roomId: string) => ChatMessage[];
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  appendMessage: (roomId: string, message: ChatMessage) => void;
  upsertRoomPreview: (
    roomId: string,
    messageText: string,
    updatedAt?: string
  ) => void;
};

const ChatInboxContext = createContext<ChatInboxContextType | undefined>(
  undefined
);

export function ChatInboxProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messagesByRoom, setMessagesByRoom] = useState<
    Record<string, ChatMessage[]>
  >({});

  const hasLoadedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const upsertRoomPreview = useCallback(
    (roomId: string, messageText: string, updatedAt?: string) => {
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
    },
    []
  );

  const loadRooms = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!userId) {
        setRooms([]);
        setMessagesByRoom({});
        hasLoadedRef.current = false;
        return;
      }

      if (loadingRef.current) return;
      loadingRef.current = true;

      if (!options?.silent && !hasLoadedRef.current) {
        setInitialLoading(true);
      }

      const { data, error } = await fetchUserChatRooms();

      if (!options?.silent && !hasLoadedRef.current) {
        setInitialLoading(false);
      }

      loadingRef.current = false;

      if (!error) {
        setRooms(data);
        hasLoadedRef.current = true;
      }
    },
    [userId]
  );

  const refresh = useCallback(async () => {
    if (!userId) return;

    setRefreshing(true);
    await loadRooms({ silent: true });
    setRefreshing(false);
  }, [loadRooms, userId]);

  const getMessages = useCallback(
    (roomId: string) => messagesByRoom[roomId] ?? [],
    [messagesByRoom]
  );

  const setMessages = useCallback((roomId: string, messages: ChatMessage[]) => {
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: messages,
    }));
  }, []);

  const appendMessage = useCallback(
    (roomId: string, message: ChatMessage) => {
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
    },
    [upsertRoomPreview]
  );

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

  // Poll inbox via Express API (no Supabase Realtime).
  useEffect(() => {
    if (!userId) return;

    const tick = () => {
      if (AppState.currentState !== "active") return;
      void loadRooms({ silent: true });
    };

    const id = setInterval(tick, INBOX_POLL_MS);

    const onAppState = (state: AppStateStatus) => {
      if (state === "active") tick();
    };
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [userId, loadRooms]);

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
    ]
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
    throw new Error("useChatInbox must be used within a ChatInboxProvider");
  }
  return context;
}
