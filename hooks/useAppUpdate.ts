import Constants from 'expo-constants'
import { useEffect } from 'react'
import { Platform } from 'react-native'

const UPDATE_CHECK_TIMEOUT_MS = 8000
const UPDATE_CHECK_DELAY_MS = 2500

/**
 * In-app updates require a custom native build.
 * Never load `expo-in-app-updates` in Expo Go — requiring the native
 * module throws a fatal error that can freeze the app on splash.
 */
function canUseInAppUpdates() {
  if (Platform.OS !== 'android') return false
  if (__DEV__) return false

  const env = String(Constants.executionEnvironment ?? '')
  const ownership = String(Constants.appOwnership ?? '')
  if (env === 'storeClient' || ownership === 'expo') return false

  return true
}

export default function useAppUpdate() {
  useEffect(() => {
    if (!canUseInAppUpdates()) return

    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return

      try {
        const InAppUpdates = await import('expo-in-app-updates')

        const result = await Promise.race([
          InAppUpdates.checkForUpdate(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('Update check timed out')),
              UPDATE_CHECK_TIMEOUT_MS
            )
          ),
        ])

        if (cancelled) return

        if (result.updateAvailable) {
          if (result.immediateAllowed) {
            await InAppUpdates.startUpdate(true)
          } else if (result.flexibleAllowed) {
            await InAppUpdates.startUpdate(false)
          }
        }
      } catch (e) {
        if (__DEV__) {
          console.log('Update check failed:', e)
        }
      }
    }, UPDATE_CHECK_DELAY_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])
}
