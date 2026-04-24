import Constants from 'expo-constants'
import { useEffect } from 'react'
import { Platform } from 'react-native'

export default function useAppUpdate() {
    useEffect(() => {
        checkUpdate()
    }, [])

    const checkUpdate = async () => {
        // 1. Exit early if on Web or iOS (if you only want Android updates)
        if (Platform.OS !== 'android') return

        // 2. Exit early if in Expo Go
        // Constants.appOwnership === 'expo' means you are in the Expo Go app
        if (Constants.appOwnership === 'expo') {
            if (__DEV__) {
                console.log('Skipping update check: Not supported in Expo Go');
            }
            return;
        }

        try {
            // 3. LAZY IMPORT the module here
            // This prevents the "Cannot find native module" error on startup
            const InAppUpdates = await import('expo-in-app-updates');

            const result = await InAppUpdates.checkForUpdate()

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
    }
}