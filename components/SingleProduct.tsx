import { Link } from 'expo-router';
import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

type ProductProps = {
    productImg: ImageSourcePropType;
    title: string;
    price: string;
    moq: number;
    productId: string;
    /** Shows a "Promoted" badge on advertised products */
    sponsored?: boolean;
}

const SingleProduct = ({
    productImg,
    title,
    price,
    moq,
    productId,
    sponsored = false,
}: ProductProps) => {
    const { width } = useWindowDimensions()
    const calculatedWidth = width * 0.5 - 15

    return (
        <Link
            href={{
                pathname: "/product/[id]",
                params: { id: productId }
            }}
            style={{ ...styles.container, width: calculatedWidth - 5 }}
        >
            <View style={{ ...styles.productImgWrapper, height: calculatedWidth - 5 }}>
                <Image
                    source={productImg}
                    style={styles.productImg}
                />
                {sponsored ? (
                    <View style={styles.promotedBadge}>
                        <View style={styles.promotedDot} />
                        <Text style={styles.promotedText}>Promoted</Text>
                    </View>
                ) : null}
            </View>
            <View style={styles.productTextWrap}>
                {sponsored ? (
                    <Text style={styles.promotedCaption}>Promoted</Text>
                ) : null}
                <Text
                    style={styles.productTitle}
                    numberOfLines={sponsored ? 1 : 2}
                >
                    {title}
                </Text>
                <Text style={styles.productPrice}>
                    BDT {price}
                </Text>
                <Text style={styles.moq}>
                    MOQ {moq}
                </Text>
            </View>
        </Link>
    )
}

export default SingleProduct

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEF0F3',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    productImgWrapper: {
        width: '100%',
        marginBottom: 0,
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    productImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    promotedBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(245, 131, 43, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    promotedDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#ffffff',
    },
    promotedText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    promotedCaption: {
        fontSize: 10,
        fontWeight: '700',
        color: '#f5832b',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    productTextWrap: {
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 10,
    },
    productTitle: {
        fontSize: 13,
        marginBottom: 5,
        color: '#111827',
        fontWeight: '500',
        lineHeight: 17,
        minHeight: 18,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
        color: '#111827',
    },
    moq: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
    },
})
