import React from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CardSingleProduct from '../CardSingleProduct'

const TopDeals = () => {
  const handleMore = () => {
    Alert.alert('Show more button pressed!')
  }

  return (
    <View style={styles.container}>
      <View style={styles.dealHeadWrapper}>
        <Text style={styles.containerHeading}>Top Deals</Text>
        <TouchableOpacity onPress={handleMore}>
          <Image
            source={require('@/assets/images/icons/chevron-right.png')}
            style={styles.showMoreIcon}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.productWrap}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        <CardSingleProduct />
        <CardSingleProduct />
        <CardSingleProduct />
        <CardSingleProduct />
      </ScrollView>
    </View>
  )
}

export default TopDeals



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 20,
  },
  dealHeadWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  containerHeading: {
    fontSize: 17,
    fontWeight: 600,
  },
  showMoreIcon: {
    width: 30,
    height: 30,
  },
  productWrap: {
    gap: 10
  },
})