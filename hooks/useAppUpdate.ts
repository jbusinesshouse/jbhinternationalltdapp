import Constants from 'expo-constants'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Linking, Platform } from 'react-native'

const UPDATE_CHECK_TIMEOUT_MS = 8000
const UPDATE_CHECK_DELAY_MS = 2500
const PLAY_PACKAGE = 'com.jbh.internationallimited'

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

/**
 * Hard update wall: when Google Play has a newer version, `updateRequired`
 * stays true until the user installs it. Check failures (offline, timeout)
 * never block the app.
 */
export default function useAppUpdate() {
  const [updateRequired, setUpdateRequired] = useState(false)
  const checking = useRef(false)

  const runCheck = useCallback(async () => {
    if (!canUseInAppUpdates() || checking.current) return
    checking.current = true

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

      if (!result.updateAvailable) {
        setUpdateRequired(false)
        return
      }

      setUpdateRequired(true)
      if (result.immediateAllowed) {
        await InAppUpdates.startUpdate(true)
      }
    } catch (e) {
      if (__DEV__) {
        console.log('Update check failed:', e)
      }
    } finally {
      checking.current = false
    }
  }, [])

  useEffect(() => {
    if (!canUseInAppUpdates()) return

    const timer = setTimeout(runCheck, UPDATE_CHECK_DELAY_MS)
    // Re-check on resume so dismissing the Play dialog cannot bypass the wall.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void runCheck()
    })

    return () => {
      clearTimeout(timer)
      sub.remove()
    }
  }, [runCheck])

  const openStore = useCallback(async () => {
    try {
      await Linking.openURL(`market://details?id=${PLAY_PACKAGE}`)
    } catch {
      await Linking.openURL(
        `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`
      ).catch(() => {})
    }
  }, [])

  return { updateRequired, retry: runCheck, openStore }
}
