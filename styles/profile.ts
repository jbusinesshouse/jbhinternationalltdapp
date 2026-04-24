import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    backIcon: {
        width: 30,
        height: 30,
        transform: 'rotate(180deg)',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },

    userCard: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 25,
        marginBottom: 10,
    },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: '#e2e2e2',
        marginBottom: 10,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    email: {
        fontSize: 13,
        color: '#666',
        marginBottom: 10,
    },

    editBtn: {
        paddingVertical: 6,
    },
    editText: {
        color: '#f5832b',
        fontWeight: '500',
    },

    input: {
        width: '100%',
        height: 42,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
    },

    editActions: {
        flexDirection: 'row',
        marginTop: 10,
    },

    cancelEditBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 10,
    },

    cancelEditText: {
        fontSize: 14,
        color: '#666',
    },
    saveBtn: {
        backgroundColor: '#f5832b',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
    },

    section: {
        backgroundColor: '#fff',
        marginBottom: 10,
    },

    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    linkText: {
        fontSize: 14,
    },
    linkIcon: {
        width: 18,
        height: 18,
        opacity: 0.4,
    },

    dangerBtn: {
        padding: 15,
        alignItems: 'center',
    },
    dangerText: {
        color: '#ff4d4f',
        fontWeight: '600',
    },



    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
    },
    modalActions: {
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
        backgroundColor: '#ff4d4f',
        borderRadius: 6,
    },
    confirmText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },

})
