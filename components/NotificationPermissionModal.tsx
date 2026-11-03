import { useUser } from '@/context/UserContext'
import {
  enablePushNotificationsFromSettings,
  getNotificationPermissionStatus,
  openSystemNotificationSettings,
  type NotificationPermissionState,
} from '@/lib/pushNotifications'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native'

/**
 * Shown after sign-in whenever notifications are off, so users do not miss
 * order and chat alerts. "Not now" hides it until the next app launch.
 */
export default function NotificationPermissionModal() {
  const { user, loading } = useUser()
  const [status, setStatus] = useState<NotificationPermissionState>('unavailable')
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setStatus(await getNotificationPermissionStatus())
  }, [])

  useEffect(() => {
    if (loading || !user) return
    void refresh()
    // Re-check on resume so enabling it in system settings closes the modal.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh()
    })
    return () => sub.remove()
  }, [loading, user, refresh])

  const visible =
    !!user && !dismissed && (status === 'undetermined' || status === 'denied')

  const onEnable = async () => {
    if (status === 'denied') {
      await openSystemNotificationSettings()
      return
    }
    setBusy(true)
    try {
      const result = await enablePushNotificationsFromSettings()
      setStatus(result.status)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setDismissed(true)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>নোটিফিকেশন চালু করুন</Text>
          <Text style={styles.body}>
            নতুন অর্ডার, মেসেজ ও গুরুত্বপূর্ণ আপডেট মিস না করতে নোটিফিকেশন চালু রাখুন।
            {status === 'denied' ? '\n\nসেটিংস থেকে নোটিফিকেশন অনুমতি দিন।' : ''}
          </Text>
          <Pressable style={styles.primary} onPress={onEnable} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryText}>
                {status === 'denied' ? 'সেটিংস খুলুন' : 'নোটিফিকেশন চালু করুন'}
              </Text>
            )}
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => setDismissed(true)}>
            <Text style={styles.secondaryText}>এখন নয়</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
  },
  title: { fontSize: 19, fontWeight: '800', color: '#16213e', textAlign: 'center', marginBottom: 10 },
  body: { fontSize: 14, color: '#566176', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  primary: {
    backgroundColor: '#f5832b',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  secondary: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  secondaryText: { color: '#8691a4', fontWeight: '600', fontSize: 14 },
})
