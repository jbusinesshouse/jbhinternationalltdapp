import Constants from 'expo-constants'
import { useEffect } from 'react'
import { InteractionManager, Platform } from 'react-native'

const UPDATE_CHECK_TIMEOUT_MS = 8000
const UPDATE_CHECK_DELAY_MS = 2000

export default function useAppUpdate() {
    useEffect(() => {
        let cancelled = false
        let timer: ReturnType<typeof setTimeout> | undefined

        const interaction = InteractionManager.runAfterInteractions(() => {
            timer = setTimeout(async () => {
                if (cancelled) return

                if (Platform.OS !== 'android') return
                if (Constants.appOwnership === 'expo') return

                try {
                    const InAppUpdates = await import('expo-in-app-updates')

                    const result = await Promise.race([
                        InAppUpdates.checkForUpdate(),
                        new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error('Update check timed out')), UPDATE_CHECK_TIMEOUT_MS)
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
        })

        return () => {
            cancelled = true
            if (timer) clearTimeout(timer)
            interaction.cancel()
        }
    }, [])
}
