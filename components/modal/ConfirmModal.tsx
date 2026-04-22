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
    cancelText?: string
    danger?: boolean
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmModal = ({
    visible,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
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
                        <Pressable onPress={onCancel} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>
                                {cancelText}
                            </Text>
                        </Pressable>

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
