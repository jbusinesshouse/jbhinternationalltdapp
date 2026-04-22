import { Link } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

const CardSingleProduct = () => {
  return (
    <Link
      href={{
        pathname: "/product/[id]",
        params: { id: "123sdf" }
      }}
      style={styles.container}
    >
      <View style={styles.productImgWrapper}>
        <Image
          source={require('@/assets/images/product1.png')}
          style={styles.productImg}
        />
      </View>
      <View>
        <Text
          style={styles.productTitle}
          numberOfLines={1}
        >
          Raspberry pi 5 4gb/8gb
        </Text>
        <Text style={styles.productPrice}>
          BDT 12,000
        </Text>
        <Text style={styles.moq}>
          MOQ 10
        </Text>
      </View>
    </Link>
  )
}

export default CardSingleProduct


const styles = StyleSheet.create({
  container: {
    width: 130,
  },
  productImgWrapper: {
    width: '100%',
    height: 130,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: '#f1f1f1ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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