import ConfirmModal from '@/components/modal/ConfirmModal'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Alert } from 'react-native'

export type AppAlertButton = {
  text: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress?: () => void
}

type AppAlertPayload = {
  title: string
  message?: string
  buttons: AppAlertButton[]
}

type ShowAppAlertFn = (
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
) => void

const AppAlertContext = createContext<ShowAppAlertFn | null>(null)

/** Imperative handle set once the provider mounts. */
let imperativeShow: ShowAppAlertFn | null = null

/**
 * Drop-in replacement for `Alert.alert` that uses the app's ConfirmModal look.
 * Safe to call from hooks/libs; falls back to native Alert if provider isn't ready.
 */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
) {
  if (imperativeShow) {
    imperativeShow(title, message, buttons)
    return
  }
  Alert.alert(title, message, buttons)
}

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (!buttons || buttons.length === 0) {
    return [{ text: 'ঠিক আছে' }]
  }
  return buttons
}

function pickActions(buttons: AppAlertButton[]) {
  if (buttons.length === 1) {
    return {
      cancelText: null as string | null,
      confirm: buttons[0],
      cancel: undefined as AppAlertButton | undefined,
    }
  }

  const cancel =
    buttons.find((b) => b.style === 'cancel') ??
    buttons[0]
  const confirm =
    buttons.find((b) => b !== cancel && b.style === 'destructive') ??
    buttons.find((b) => b !== cancel) ??
    buttons[buttons.length - 1]

  return {
    cancelText: cancel.text,
    confirm,
    cancel,
  }
}

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<AppAlertPayload | null>(null)
  const queueRef = useRef<AppAlertPayload[]>([])

  const show = useCallback<ShowAppAlertFn>((title, message, buttons) => {
    const payload: AppAlertPayload = {
      title,
      message,
      buttons: normalizeButtons(buttons),
    }

    setCurrent((existing) => {
      if (existing) {
        queueRef.current.push(payload)
        return existing
      }
      return payload
    })
  }, [])

  useEffect(() => {
    imperativeShow = show
    return () => {
      if (imperativeShow === show) imperativeShow = null
    }
  }, [show])

  const dismissAndRun = useCallback((fn?: () => void) => {
    setCurrent(null)
    // Let the modal close before showing the next / running side effects
    requestAnimationFrame(() => {
      fn?.()
      setCurrent((existing) => {
        if (existing) return existing
        return queueRef.current.shift() ?? null
      })
    })
  }, [])

  const modalProps = useMemo(() => {
    if (!current) return null
    const { cancelText, confirm, cancel } = pickActions(current.buttons)
    const danger = confirm.style === 'destructive'
    return {
      title: current.title,
      description: current.message,
      confirmText: confirm.text,
      cancelText,
      danger,
      onConfirm: () => dismissAndRun(confirm.onPress),
      // Single-action alerts: omit onCancel so Android back runs onConfirm
      onCancel: cancel
        ? () => dismissAndRun(cancel.onPress)
        : undefined,
    }
  }, [current, dismissAndRun])

  return (
    <AppAlertContext.Provider value={show}>
      {children}
      {modalProps ? (
        <ConfirmModal
          visible
          title={modalProps.title}
          description={modalProps.description}
          confirmText={modalProps.confirmText}
          cancelText={modalProps.cancelText}
          danger={modalProps.danger}
          onConfirm={modalProps.onConfirm}
          onCancel={modalProps.onCancel}
        />
      ) : null}
    </AppAlertContext.Provider>
  )
}

export function useAppAlert() {
  const ctx = useContext(AppAlertContext)
  return ctx ?? showAppAlert
}
