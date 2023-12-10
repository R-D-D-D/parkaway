import {
  collection,
  limit,
  onSnapshot,
  or,
  orderBy,
  query,
  where
} from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { Divider, Image, ListItem, Text } from "react-native-elements"
import { IMessage } from "react-native-gifted-chat"
import Spinner from "../components/Spinner"
import { AppContext } from "../context"
import { db } from "../firebase"
import { formatDate } from "../utils/date"
import { Chatroom } from "./ChatScreen"

const ChatListScreen = ({ navigation }) => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([])
  const { user } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "chatrooms"),
      or(where("userId", "==", user.id), where("otherUserId", "==", user.id)),
      limit(50)
    )

    const unsubscribeChatrooms = onSnapshot(q, (chatroomsSnapshot) => {
      const unsubscribeMessagesMap = new Map()

      const newChatrooms = chatroomsSnapshot.docs.map((docSnapshot) => {
        const chatroom = {
          ...docSnapshot.data(),
          id: docSnapshot.id,
          messages: [],
        }
        const chatroomId = docSnapshot.id

        // If we're already listening to this chatroom, unsubscribe before creating a new listener
        if (unsubscribeMessagesMap.has(chatroomId)) {
          unsubscribeMessagesMap.get(chatroomId)()
          unsubscribeMessagesMap.delete(chatroomId)
        }

        const messageQuery = query(
          collection(db, "chatrooms", chatroomId, "messages"),
          orderBy("createdAt", "desc"),
          limit(50)
        )

        // Listen for messages updates in each chatroom
        const unsubscribeMessages = onSnapshot(
          messageQuery,
          (messagesSnapshot) => {
            const newMessages: IMessage[] = messagesSnapshot.docs.map(
              (docSnapshot) => docSnapshot.data()
            )
            chatroom.messages = newMessages

            setChatrooms((prevChatrooms) =>
              prevChatrooms.map((room) =>
                room.id === chatroomId ? chatroom : room
              )
            )
          }
        )

        unsubscribeMessagesMap.set(chatroomId, unsubscribeMessages)

        return chatroom
      })

      setChatrooms(newChatrooms as Chatroom[])

      // Return a cleanup function that unsubscribes from all listeners
      return () => {
        unsubscribeChatrooms()
        unsubscribeMessagesMap.forEach((unsubscribe) => unsubscribe())
      }
    })
  }, [user])

  if (loading) {
    return <Spinner />
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chatrooms}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <ListItem
            onPress={() => navigation.navigate("Chat", { chatroom: item })}
          >
            <View style={styles.item}>
              <View style={styles.otherUserName}>
                <Image
                  style={styles.iconImg}
                  source={require("../../assets/profile-grey.png")}
                />
                <View>
                  <Text style={styles.itemTitle}>
                    {item.username === user?.username
                      ? item.otherUsername
                      : item.username}
                  </Text>
                  <Text>
                    {item.messages.length > 0
                      ? formatDate(
                          new Date(item.messages[0].createdAt.seconds * 1000),
                          "MM/dd HH:mm"
                        )
                      : ""}
                  </Text>
                </View>
              </View>
              {/* <View style={styles.lastMsg}>
                <Text>
                  {item.messages.length > 0 ? item.messages[0].text : ""}
                </Text>
              </View> */}
            </View>
          </ListItem>
        )}
      />
    </View>
  )
}

export default ChatListScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  iconImg: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  otherUserName: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMsg: {},
})
