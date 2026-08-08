import { styles } from '@/styles/confirmModal'
import React from 'react'
import {
    Modal,
    Pressable,
    Text,
    View
} from 'react-native'

type ConfirmModalProps = {
    visible: boolean
    title: string
    description?: string
    confirmText?: string
    /** Pass `null` to hide the cancel button (single-action modals). */
    cancelText?: string | null
    danger?: boolean
    onConfirm: () => void
    onCancel?: () => void
}

const ConfirmModal = ({
    visible,
    title,
    description,
    confirmText = 'নিশ্চিত',
    cancelText = 'বাতিল',
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    const showCancel = cancelText != null && cancelText.length > 0
    const handleDismiss = onCancel ?? onConfirm

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>

                    {description ? (
                        <Text style={styles.description}>
                            {description}
                        </Text>
                    ) : null}

                    <View style={styles.actions}>
                        {showCancel ? (
                            <Pressable onPress={handleDismiss} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>
                                    {cancelText}
                                </Text>
                            </Pressable>
                        ) : null}

                        <Pressable
                            onPress={onConfirm}
                            style={[
                                styles.confirmBtn,
                                danger && styles.dangerBtn
                            ]}
                        >
                            <Text
                                style={[
                                    styles.confirmText,
                                    danger && styles.dangerText
                                ]}
                            >
                                {confirmText}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ConfirmModal
