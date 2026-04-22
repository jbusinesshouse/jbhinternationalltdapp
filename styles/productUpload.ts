import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    /* ===== HEADER (same as product/profile) ===== */
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

    /* ===== PAGE ===== */
    page: {
        flex: 1,
        backgroundColor: '#f1f1f1ff'
    },

    /* ===== SECTION CARD ===== */
    section: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginBottom: 10
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10
    },

    /* ===== IMAGE PICKER ===== */
    mainImageBox: {
        width: '100%',
        height: 220,
        backgroundColor: '#f1f1f1ff',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 10
    },

    addImageText: {
        fontSize: 13,
        color: '#555'
    },
    addImageTextPlus: {
        fontSize: 25,
        color: '#555',
    },

    imageRow: {
        flexDirection: 'row',
        marginTop: 10
    },
    thumb: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#f1f1f1ff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* === CATEGORY === */
    categoryRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    activeCat: {
        backgroundColor: '#111827', // dark slate
        borderColor: '#111827',
    },
    tarCatText: {
        fontSize: 12,
    },
    tarCatTextAct: {
        color: '#fff'
    },

    /* ---------- PICKER ---------- */
    parentCatWrapper: {
        marginTop: 15,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginBottom: 16,
    },

    picker: {
        height: 50,
        color: '#111827',
    },

    /* ===== INPUT ===== */
    input: {
        height: 42,
        backgroundColor: '#f1f1f1ff',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        marginBottom: 10
    },

    textarea: {
        height: 140,
        backgroundColor: '#f1f1f1ff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingTop: 10,
        fontSize: 14,
        textAlignVertical: 'top'
    },

    /* ===== CATEGORY ===== */
    selectBox: {
        height: 42,
        backgroundColor: '#f1f1f1ff',
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: 'center',
        marginBottom: 10,
    },
    selectText: {
        fontSize: 14,
        color: '#444'
    },

    /* ===== COLOR + SIZE ===== */
    variantBox: {
        backgroundColor: '#f1f1f1ff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10
    },

    sizesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8
    },

    sizeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8
    },
    sizeText: {
        fontSize: 13
    },

    /* ===== ADD BUTTON ===== */
    addBtn: {
        marginTop: 10,
        backgroundColor: '#f1f1f1ff',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center'
    },
    addBtnText: {
        fontSize: 13,
        fontWeight: '500'
    },

    /* ===== SUBMIT ===== */
    submitWrapper: {
        padding: 15,
        backgroundColor: '#ffffff'
    },
    submitBtn: {
        backgroundColor: '#f5832b',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center'
    },
    submitText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600'
    }
})
