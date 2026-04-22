import { Link } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

type ProductProps = {
    productImg: ImageSourcePropType;
    title: string;
    price: string;
    moq: number;
    productId: string;
}

const SingleProduct = ({ productImg, title, price, moq, productId }: ProductProps) => {
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
            </View>
            <View style={styles.productTextWrap}>
                <Text
                    style={styles.productTitle}
                    numberOfLines={1}
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
        borderRadius: 8,
        overflow: 'hidden',
    },
    productImgWrapper: {
        width: '100%',
        borderRadius: 5,
        marginBottom: 5,
        backgroundColor: '#ffffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
    },
    productImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    productTextWrap: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    productTitle: {
        fontSize: 13,
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 5,
    },
    moq: {
        fontSize: 10,
        color: '#999999ff'
    },
})
