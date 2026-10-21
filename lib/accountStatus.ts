export type AccountStatus = 'active' | 'freeze' | 'restricted'

/** Treat null/unknown as active (matches backend). */
export function normalizeAccountStatus(
  status: string | null | undefined
): AccountStatus {
  if (status === 'freeze' || status === 'restricted') return status
  return 'active'
}

export function canSell(status: string | null | undefined): boolean {
  return normalizeAccountStatus(status) === 'active'
}

/** Any account type may buy unless frozen. App checkout still requires sign-in. */
export function canBuy(status: string | null | undefined): boolean {
  return normalizeAccountStatus(status) !== 'freeze'
}

export function canChat(status: string | null | undefined): boolean {
  return normalizeAccountStatus(status) !== 'freeze'
}

export function sellBlockMessage(status: string | null | undefined): string {
  const normalized = normalizeAccountStatus(status)
  if (normalized === 'freeze') {
    return 'Your account is frozen. Product actions are disabled.'
  }
  if (normalized === 'restricted') {
    return 'Your account is restricted. Product upload is disabled until verified.'
  }
  return 'Account action not allowed.'
}

export function buyBlockMessage(status: string | null | undefined): string | null {
  if (normalizeAccountStatus(status) !== 'freeze') return null
  return 'Your account is frozen. You cannot place orders right now.'
}

export function chatBlockMessage(status: string | null | undefined): string | null {
  if (normalizeAccountStatus(status) !== 'freeze') return null
  return 'Your account is frozen. Messaging is disabled.'
}
