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
       STATIC PAGES (Privacy / Terms)
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
    }
})
