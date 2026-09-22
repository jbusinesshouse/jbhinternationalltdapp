import { showAppAlert } from '@/context/AppAlertContext'
import { type Href, router } from 'expo-router'

/** Top-level route segments guests may open without a session. */
const PUBLIC_ROOT_SEGMENTS = new Set([
  '(auth)',
  '(tabs)',
  'product',
  'search',
  'categoryProducts',
  'publicProfile',
  'privacyPolicy',
  'termsAndConditions',
  'aboutApp',
])

let pendingReturnTo: string | null = null

export function isPublicRoute(segments: readonly string[]): boolean {
  if (segments.length === 0) return true
  return PUBLIC_ROOT_SEGMENTS.has(segments[0] ?? '')
}

export function setPendingReturnTo(path?: string | null) {
  pendingReturnTo = path?.trim() ? path : null
}

export function consumePendingReturnTo(): string | null {
  const next = pendingReturnTo
  pendingReturnTo = null
  return next
}

export function goToSignIn(returnTo?: string) {
  setPendingReturnTo(returnTo)
  if (returnTo) {
    router.push({
      pathname: '/(auth)/signin',
      params: { returnTo },
    } as Href)
    return
  }
  router.push('/(auth)/signin')
}

export function promptLoginRequired(
  message = 'এই কাজটি করতে সাইন ইন করুন।',
  returnTo?: string
) {
  showAppAlert('সাইন ইন প্রয়োজন', message, [
    { text: 'বাতিল', style: 'cancel' },
    {
      text: 'সাইন ইন',
      onPress: () => goToSignIn(returnTo),
    },
  ])
}
