import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import SingleProduct from '../SingleProduct';


const PRODUCTDATA = [
    {
        id: 0,
        productImg: '@/assets/images/product1.png',
        title: 'Raspberry pi 5 4gb/8gb',
        price: '12,000',
        moq: 10,
    },
]

type ProductProps = {
    id: number
    productImg: string;
    title: string;
    price: string;
    moq: number;
}
type RenderProps = {
    item: ProductProps
}

const RecommendedProducts = () => {
    // const renderItem = ({ item }: RenderProps) => {
    //     return (
    //         <View style={styles.productWrap}>
    //             <SingleProduct />
    //         </View>
    //     )
    // }
    const renderItem = ({ item }: RenderProps) => (
        <View style={styles.productWrap}>
            <SingleProduct />
            <SingleProduct />
            <SingleProduct />
            <SingleProduct />
            <SingleProduct />
            <SingleProduct />
        </View>
    )


    return (
        <View>
            <Text style={styles.recommendedHeading}>Recommended For You</Text>
            <FlatList
                data={PRODUCTDATA}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    )
}

export default RecommendedProducts

const styles = StyleSheet.create({
    recommendedHeading: {
        fontSize: 17,
        fontWeight: 600,
        marginBottom: 15,
    },
    productWrap: {
        height: 250,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 10,
    },
})