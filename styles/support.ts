import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    /* ===============================
       HEADER (already used everywhere)
       =============================== */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff'
    },
    backIcon: {
        width: 30,
        height: 30,
        transform: 'rotate(180deg)'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600'
    },

    /* ===============================
       SUPPORT FORM
       =============================== */
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        color: '#111'
    },

    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        color: '#444'
    },
    inputLabel: {
        marginTop: 16,
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '500',
        color: '#111'
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000000',
        backgroundColor: '#ffffff',
    },

    textArea: {
        height: 120,
    },

    submitBtn: {
        marginTop: 24,
        backgroundColor: '#111',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center'
    },

    submitBtnDisabled: {
        opacity: 0.6
    },

    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600'
    }

})
