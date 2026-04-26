import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    productHead: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
    },
    backIcon: {
        width: 30,
        height: 30,
        transform: 'rotate(180deg)',
    },
    searchWrapper: {
        position: 'relative',
    },
    searchInp: {
        height: 40,
        borderRadius: 20,
        paddingLeft: 15,
        paddingRight: 75,
        fontSize: 14,
        color: '#000000',
        backgroundColor: '#ffffff',
    },
    searchBtn: {
        width: 55,
        height: 30,
        backgroundColor: '#f5832b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        position: 'absolute',
        top: 5,
        right: 5,
    },
    searchImg: {
        width: 18,
        height: 18,
        filter: 'invert(1)',
    },
    imageWrapper: {
        width: '100%',
        height: 350,
        backgroundColor: '#ffffff',
    },
    productImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    productInfo: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    productPriceWrapper: {
        backgroundColor: '#f1f1f1ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 4,
    },
    moq: {
        fontSize: 13,
    },
    productTitle: {
        fontSize: 14,
        marginBottom: 5,
    },
    ratingWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#9c9c9cff',
        marginRight: 4,
    },
    ratingStar: {
        width: 13,
        height: 13,
    },



    storeWrapper: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    storeImgWrapper: {
        width: 45,
        height: 45,
        borderRadius: 4,
        borderColor: '#f1f1f1ff',
        borderWidth: 1,
        overflow: 'hidden',
        marginRight: 10,
    },
    storeImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    storeTitle: {
        fontWeight: 600,
        marginBottom: 5,
    },
    visitWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    visitText: {
        fontSize: 12,
        color: '#126de4ff',
    },
    visitIcon: {
        width: 15,
        height: 15,
        marginLeft: 5,
    },



    sizeWrapper: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    sizeHeading: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sizeText: {
        fontSize: 15,
        fontWeight: 600,
    },
    sizeToggleIcon: {
        width: 25,
        height: 25,
    },
    sizeConent: {
        paddingVertical: 15,
    },
    sizeColorHeading: {
        fontWeight: 500,
        marginBottom: 15,
    },
    sizeColorWrapper: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    sizeColorItem: {
        width: 110,
        backgroundColor: '#f1f1f1ff',
        borderRadius: 6,
        padding: 1,
        borderColor: '#929292ff',
    },
    sizeColorImg: {
        width: '100%',
        height: 110,
        objectFit: 'cover',
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
        backgroundColor: '#ffffff',
    },
    sizeColorTitle: {
        paddingVertical: 10,
        paddingHorizontal: 3,
        fontSize: 13,
        textAlign: 'center',
    },
    sizeItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sizeItemIndic: {
        fontSize: 15,
    },
    sizeController: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 25,
    },
    sizeConBtn: {
        width: 35,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f1f1ff',
        borderRadius: 25,
    },
    sizeDec: {
        fontSize: 25,
        lineHeight: 30,
    },
    sizeCount: {
        width: 60,
        fontSize: 14,
        textAlign: 'center',
        color: '#000000',
        backgroundColor: '#ffffff',
    },
    sizeInc: {
        fontSize: 20,
        lineHeight: 30,
    },



    deliveryWrapper: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    deliveryHeadingText: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 10,
    },
    deliveryDetails: {
        padding: 15,
        backgroundColor: '#f1f1f1ff',
        borderRadius: 8,
    },
    deliveryTimeHeading: {
        fontSize: 12,
        color: '#838383',
        marginBottom: 8,
    },
    deliveryTime: {
        fontSize: 15,
        fontWeight: 600,
    },


    sellerDes: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    sellerHeadingText: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 10,
    },
    sellerDesDetails: {
        padding: 15,
        // backgroundColor: '#f1f1f1ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f1f1',
    },
    sellerDesText: {
        fontSize: 14,
    },


    reportBtn: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 6,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 4,
    },



    productAct: {
        width: '100%',
        backgroundColor: '#ffffff',
        // position: 'absolute',
        // left: 0,
        // bottom: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5'
    },
    productActAddCart: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#cccccc',
        paddingVertical: 12,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 30,
    },
    productActOrder: {
        width: '100%',
        paddingVertical: 12,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: '#f5832b',
    },
    productActOrderText: {
        color: '#ffffff',
    },
})