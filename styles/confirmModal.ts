import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    cancelText: {
        fontSize: 14,
        color: '#666',
    },
    confirmBtn: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#f5832b',
        borderRadius: 6,
    },
    confirmText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },

    /* danger variant */
    dangerBtn: {
        backgroundColor: '#ff4d4f',
    },
    dangerText: {
        color: '#fff',
    },
})
