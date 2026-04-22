import { router } from 'expo-router'
import React, { useState } from 'react'
import { FlatList, Image, ImageSourcePropType, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native'

const MESSAGEDATA = [
    {
        id: 0,
        messageImg: require('@/assets/images/store1.jpg'),
        messagePerson: 'Shenzhen Hechen Technology Ltd.',
        messageText: `Bro I must need the product by today. My friend is coming home tomorrow so it's very important it's arrived in time.`,
    },
]

type MessageProps = {
    id: number
    messageImg: ImageSourcePropType;
    messagePerson: string;
    messageText: string;
}
type RenderProps = {
    item: MessageProps;
}

const Messages = () => {
    const [messageWidth, setMessageWidth] = useState<number>(0)

    const handleLayout = (e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout
        setMessageWidth(width)
    }
    const handleMessageOpen = (id: number) => {
        router.push({
            pathname: '/messages/[id]',
            params: { id: '1234fff' }
        })
    }

    const renderItem = ({ item }: RenderProps) => (
        <Pressable
            // href={{
            //     pathname: "/messages/[id]",
            //     params: { id: "123sdf" }
            // }}
            onPress={() => handleMessageOpen(item.id)}
            style={styles.messageItem}
            onLayout={handleLayout}
        >
            <Image
                source={item.messageImg}
                style={styles.messageImage}
            />
            <View style={{ ...styles.messageInfo, width: messageWidth - 60 }}>
                <Text numberOfLines={1} style={styles.messageName}>{item.messagePerson}</Text>
                <Text numberOfLines={2} style={styles.messagePrev}>
                    {item.messageText}
                </Text>
            </View>
        </Pressable>
    )
    const flatHeaderSection = () => (
        <Text style={styles.messageMainHead}>All Messages</Text>
    )

    return (
        <View>
            <View style={styles.messageHead}>
                <Text style={styles.messageHeadText}>Messages</Text>
            </View>
            <View style={styles.messageMain}>
                <View>

                    {
                        MESSAGEDATA.length > 0 ?
                            <FlatList
                                data={MESSAGEDATA}
                                renderItem={renderItem}
                                keyExtractor={item => item.id.toString()}
                                ListHeaderComponent={flatHeaderSection}
                                showsVerticalScrollIndicator={false}
                            />
                            :
                            <Text style={styles.noMessageText}>No messages available!</Text>
                    }
                </View>
            </View>
        </View >
    )
}

export default Messages



const styles = StyleSheet.create({
    messageHead: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
    },
    messageHeadText: {
        fontSize: 20,
        fontWeight: 600,
    },
    messageMain: {
        paddingHorizontal: 15,
        paddingVertical: 20,
        backgroundColor: '#ffffff',
    },
    messageMainHead: {
        marginBottom: 15,
    },
    messageItem: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    messageImage: {
        width: 50,
        height: 50,
        objectFit: 'cover',
        borderRadius: 30,
    },
    messageInfo: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    messageName: {
        fontSize: 15,
        fontWeight: 500,
        marginBottom: 10,
    },
    messagePrev: {
        color: '#9b9b9b',
    },
    noMessageText: {
        color: '#9b9b9b'
    },
})