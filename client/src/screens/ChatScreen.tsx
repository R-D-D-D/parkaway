import React, { useState, useEffect, useCallback, useContext } from "react"
import { View, ScrollView, Text, Button, StyleSheet } from "react-native"
import { Bubble, GiftedChat, Send, IMessage } from "react-native-gifted-chat"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
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
import { userApi } from "../api/user"

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
  const { otherUser, chatroom: routeChatroom } = route.params
  const { user } = useContext(AppContext)

  // useEffect(() => {
  //   setMessages([
  //     {
  //       _id: 1,
  //       text: "Hello developer",
  //       createdAt: new Date(),
  //       user: {
  //         _id: 2,
  //         name: "React Native",
  //         avatar: "https://placeimg.com/140/140/any",
  //       },
  //     },
  //     {
  //       _id: 2,
  //       text: "Hello world",
  //       createdAt: new Date(),
  //       user: {
  //         _id: 1,
  //         name: "React Native",
  //         avatar: "https://placeimg.com/140/140/any",
  //       },
  //     },
  //   ])
  // }, [])

  useEffect(() => {
    const init = async () => {
      if (user) {
        let chatroomId = ""
        if (routeChatroom) {
          chatroomId = routeChatroom.id
          setChatroom(routeChatroom)
        } else {
          const chatroomQuery = query(
            collection(db, "chatrooms"),
            or(
              and(
                where("userId", "==", user.id),
                where("otherUserId", "==", otherUser.id)
              ),
              and(
                where("userId", "==", otherUser.id),
                where("otherUserId", "==", user.id)
              )
            )
          )
          const querySnapshot = await getDocs(chatroomQuery)

          if (querySnapshot.size === 0) {
            // no chatroom has been created
            const chatroomParams = {
              messages: [],
              userId: user.id,
              username: user.username,
              otherUserId: otherUser.id,
              otherUsername: otherUser.username,
            }
            const docRef = await addDoc(
              collection(db, "chatrooms"),
              chatroomParams
            )
            chatroomId = docRef.id
            setChatroom({
              id: docRef.id,
              ...chatroomParams,
            })
          } else if (querySnapshot.size === 1) {
            querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              setChatroom({ ...doc.data(), id: doc.id } as Chatroom)
              chatroomId = doc.id
            })
          } else {
            throw new Error("more than one chatroom found for the same person")
          }
        }

        if (chatroomId !== "") {
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
      }
    }

    init()
  }, [otherUser])

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
