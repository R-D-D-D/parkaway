import React, { useState, useEffect, useCallback, useContext } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  setDoc,
  doc,
  where,
  or,
  getDocs,
  addDoc,
  getDoc,
  and,
} from "firebase/firestore"
import { db } from "../firebase"
import { AppContext } from "../context"
import { Chatroom } from "./ChatScreen"
import Spinner from "../components/Spinner"
import { Divider, ListItem, Image } from "react-native-elements"
import { IMessage } from "react-native-gifted-chat"
import { formatDate } from "../utils/date"

const ChatListScreen = ({ navigation }) => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([])
  const { user } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // const init = async () => {
    //   if (user) {
    //     const chatroomQuery = query(
    //       collection(db, "chatrooms"),
    //       or(
    //         where("userId", "==", user.id),
    //         where("otherUserId", "==", user.id)
    //       )
    //     )
    //     const querySnapshot = await getDocs(chatroomQuery)
    //     const fetchedChatrooms: Chatroom[] = []
    //     if (querySnapshot.size > 0) {
    //       querySnapshot.forEach((doc) => {
    //         // doc.data() is never undefined for query doc snapshots
    //         fetchedChatrooms.push({ ...doc.data(), id: doc.id } as Chatroom)
    //       })
    //     }
    //     setChatrooms(fetchedChatrooms)
    //     setLoading(false)
    //   }
    // }

    // init()
    if (user) {
      const q = query(
        collection(db, "chatrooms"),
        or(where("userId", "==", user.id), where("otherUserId", "==", user.id)),
        limit(50)
      )

      // const messageQ = (chatroomId: string) => {
      //   query(collection(db, "chatrooms", chatroomId, "messages"), limit(1))
      // }

      // const unsubscribeChatrooms = onSnapshot(q, (chatroomsSnapshot) => {
      //   const unsubscribeMessagesMap = new Map();
      //   const fetchedChatrooms: Chatroom[] = []
      //   QuerySnapshot.forEach((doc) => {

      //     fetchedChatrooms.push({
      //       ...doc.data(),
      //       id: doc.id,
      //     } as Chatroom)
      //   })
      //   console.log("reactive fetchedChatrooms:", fetchedChatrooms)
      //   setChatrooms(fetchedChatrooms)
      // })
      // return () => unsubscribeChatrooms()
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

          const messagesRef = collection(
            doc(db, "chatrooms", chatroomId),
            "messages"
          )

          // Listen for messages updates in each chatroom
          const unsubscribeMessages = onSnapshot(
            messagesRef,
            (messagesSnapshot) => {
              const newMessages: IMessage[] = messagesSnapshot.docs.map(
                (docSnapshot) => docSnapshot.data()
              )
              chatroom.messages = newMessages
              console.log("message changed")

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
    }
  }, [])

  // useEffect(() => {
  //   console.log("chatrooms asdf", chatrooms[0]?.messages[0]?.createdAt)
  // }, [chatrooms])

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
            <ListItem.Content>
              <View style={styles.item}>
                <Image
                  style={styles.iconImg}
                  source={require("../../assets/profile-grey.png")}
                />
                <ListItem.Title>
                  {item.username === user?.username
                    ? item.otherUsername
                    : item.username}
                </ListItem.Title>
              </View>
              <ListItem.Subtitle>
                {item.messages.length > 0
                  ? formatDate(
                      new Date(item.messages[0].createdAt.seconds * 1000),
                      "MM/dd HH:mm"
                    )
                  : ""}
              </ListItem.Subtitle>
            </ListItem.Content>
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
    marginTop: 20,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
})
