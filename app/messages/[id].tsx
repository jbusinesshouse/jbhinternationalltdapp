import { useNavigation } from 'expo-router'
import React, { useState } from 'react'
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'

const MESSAGEDATA = [
    {
        id: 1,
        from: "other",
        text: "The phone you asked about is a copy. Do you need a copy or the original?"
    },
    {
        id: 2,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
    {
        id: 3,
        from: "other",
        text: "The phone you asked about is a copy. Do you need a copy or the original?"
    },
    {
        id: 4,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
    {
        id: 5,
        from: "other",
        text: "The phone you asked about is a copy. Do you need a copy or the original?"
    },
    {
        id: 6,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
    {
        id: 7,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
    {
        id: 8,
        from: "other",
        text: "The phone you asked about is a copy. Do you need a copy or the original?"
    },
    {
        id: 9,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
    {
        id: 10,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
    {
        id: 11,
        from: "self",
        text: "Can you tell me exactly how much both copy and the original will cost? I also need to know about the shipping cost in my country"
    },
]

type MessageProps = {
    id: number
    from: string;
    text: string;
}
type RenderProps = {
    item: MessageProps;
}

const SingleMessage = () => {
    const navigation = useNavigation()
    const { width, height } = useWindowDimensions()
    const [messageVal, setMessageVal] = useState<string>('')

    const handleBackPress = () => {
        navigation.goBack()
    }
    const calculatedWidth = width
    const calculatedHeight = height - 130

    const renderItem = ({ item }: RenderProps) => (

        item.from === 'other' ?
            <View style={styles.otherMessage}>
                <Image
                    source={require('@/assets/images/store1.jpg')}
                    style={styles.otherMessageImg}
                />
                <View style={styles.otherMessageTextWrapper}>
                    <Text>{item.text}</Text>
                </View>
            </View>
            :
            <View style={styles.selfMessage}>
                <Text>{item.text}</Text>
            </View>
    )

    const handleInp = (text: string) => {
        setMessageVal(text)
    }

    return (
        <View style={styles.container}>
            <View style={styles.messageHead}>
                <Pressable style={styles.backBtn} onPress={handleBackPress}>
                    <Image
                        source={require('@/assets/images/icons/chevron-right.png')}
                        style={styles.backIcon}
                    />
                </Pressable>
                <View style={styles.messageHeadInfo}>
                    <Image
                        source={require('@/assets/images/store1.jpg')}
                        style={styles.messageHeadImg}
                    />
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.messageHeadPerson}>Shenzhen Hechen Technology Ltd. asdfdsf</Text>
                </View>
            </View>
            <View style={{ ...styles.messageMain, height: calculatedHeight }}>
                <FlatList
                    data={MESSAGEDATA}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <View style={styles.messageSendWrapper}>
                <TextInput
                    style={styles.messageInp}
                    placeholder='message For Products'
                    value={messageVal}
                    onChangeText={(text) => handleInp(text)}
                />
                <Pressable style={styles.sendBtn}>
                    <Image
                        source={require('@/assets/images/icons/send.png')}
                        style={styles.sendIcon}
                    />
                </Pressable>
            </View>
        </View>
    )
}

export default SingleMessage


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageHead: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
    },
    backBtn: {
        marginRight: 15,
    },
    backIcon: {
        width: 30,
        height: 30,
        transform: [{ rotate: '180deg' }],
    },
    messageHeadInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    messageHeadImg: {
        width: 45,
        height: 45,
        borderRadius: 30,
        objectFit: 'cover',
    },
    messageHeadPerson: {
        width: '100%',
        fontSize: 15,
        fontWeight: 500,
        flex: 1,
    },
    messageMain: {
        // paddingVertical: 20,
        paddingBottom: 10,
        paddingHorizontal: 15,
        overflow: 'hidden',
    },
    otherMessage: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 8,
    },
    otherMessageImg: {
        width: 35,
        height: 35,
        borderRadius: 20,
        objectFit: 'cover',
    },
    otherMessageTextWrapper: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        backgroundColor: '#ffffff',
    },
    selfMessage: {
        width: '85%',
        backgroundColor: '#ffd49dff',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderBottomRightRadius: 0,
        marginVertical: 8,
        alignSelf: 'flex-end',
    },
    messageSendWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    messageInp: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddddddff',
        paddingHorizontal: 10,
        borderRadius: 30,
        marginRight: 15,
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#ff5200',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendIcon: {
        width: 25,
        height: 25,
        filter: 'invert(1)',
    },
})