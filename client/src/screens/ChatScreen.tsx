import { CommonActions } from "@react-navigation/native"
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Bubble, GiftedChat, IMessage, Send } from "react-native-gifted-chat"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { AppContext } from "../context"
import { db } from "../firebase"
import { generateChatroomId } from "../utils/chatroom"

export interface Chatroom {
  id: string
  userId: number
  username: string
  otherUserId: number
  otherUsername: string
  messages: IMessage[]
}

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [chatroom, setChatroom] = useState<Chatroom>()
  const { otherUser, chatroom: routeChatroom, fromMain } = route.params
  const { user } = useContext(AppContext)

  useEffect(() => {
    if (fromMain) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          key: "stack-GwJZvGnfKAN5vZyIwCQUb",
          routeNames: ["ChatList", "Chat"],
          routes: [
            {
              key: "ChatList-8aJHCorMvvCykR-GztjWR",
              name: "ChatList",
              params: undefined,
            },
            {
              key: "Chat-ZMXBqBZe-zvmjDrc5BJP4",
              name: "Chat",
              params: route.params,
              path: undefined,
            },
          ],
          stale: false,
          type: "stack",
        })
      )
    }
    const init = async () => {
      if (!user) return

      const chatroomId = routeChatroom
        ? routeChatroom.id
        : generateChatroomId({
            userId: user?.id,
            otherUserId: otherUser?.id,
          })

      if (routeChatroom) {
        setChatroom(routeChatroom)
      } else {
        const docRef = doc(db, "chatrooms", chatroomId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          // no chatroom has been created
          const chatroomParams = {
            messages: [],
            userId: user.id,
            username: user.username,
            otherUserId: otherUser.id,
            otherUsername: otherUser.username,
          }
          await setDoc(docRef, chatroomParams)
          setChatroom({
            id: chatroomId,
            ...chatroomParams,
          })
        } else {
          const doc = docSnap.data()
          setChatroom({ ...doc, id: doc.id } as Chatroom)
        }
      }

      const messageQuery = query(
        collection(db, "chatrooms", chatroomId, "messages"),
        orderBy("createdAt", "desc"),
        limit(50)
      )

      const unsubscribe = onSnapshot(messageQuery, (QuerySnapshot) => {
        const fetchedMessages: IMessage[] = []
        QuerySnapshot.forEach((doc) => {
          fetchedMessages.push({
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
          })
        })
        setMessages(fetchedMessages)
      })
      return () => unsubscribe()
    }

    init()
  }, [])

  const onSend = async (messages: IMessage[] = []) => {
    if (chatroom) {
      if (messages[0].text.trim() === "") {
        alert("Enter valid message")
        return
      }
      setDoc(
        doc(db, "chatrooms", chatroom.id, "messages", String(messages[0]._id)),
        messages[0]
      )
      setMessages((previousMessages: IMessage[]) => {
        return GiftedChat.append(previousMessages, messages)
      })
    }
  }

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons
            name="send-circle"
            style={{ marginBottom: 5, marginRight: 5 }}
            size={32}
            color="#2e64e5"
          />
        </View>
      </Send>
    )
  }

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#2e64e5",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
        }}
      />
    )
  }

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: user?.id as number,
      }}
      renderBubble={renderBubble}
      alwaysShowSend
      renderSend={renderSend}
      scrollToBottom
      scrollToBottomComponent={scrollToBottomComponent}
    />
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})
