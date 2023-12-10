import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as React from "react"
import { StyleSheet } from "react-native"
import { Image } from "react-native-elements"
import { IUser } from "./context"
import ChatListScreen from "./screens/ChatListScreen"
import ChatScreen, { Chatroom } from "./screens/ChatScreen"
import HomeScreen from "./screens/HomeScreen"
import LogInScreen from "./screens/LogInScreen"
import ProfileScreen from "./screens/ProfileScreen"
import SearchScreen from "./screens/SearchScreen"

export type RootStackParamList = {
  LogIn: undefined
  Main: { screen: string }
}

export type ChatStackParamList = {
  Chat: {
    otherUser?: IUser
    chatroom?: Chatroom
    fromMain?: boolean
  }
  ChatList: undefined
}

export type HomeStackParamList = {
  Home: undefined
  Search: undefined
}

export type RootTabParamList = {
  Profile: undefined
  Home: undefined
  ChatStack: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()
const ChatStack = createNativeStackNavigator<ChatStackParamList>()
const HomeStack = createNativeStackNavigator<HomeStackParamList>()

export const MainTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ tabBarStyle: styles.tabBar }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              style={styles.iconImg}
              source={
                focused
                  ? require("../assets/home.png")
                  : require("../assets/home-grey.png")
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tab.Screen
        name="ChatStack"
        component={ChatStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              style={styles.iconImg}
              source={
                focused
                  ? require("../assets/chat.png")
                  : require("../assets/chat-grey.png")
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              style={styles.iconImg}
              source={
                focused
                  ? require("../assets/profile.png")
                  : require("../assets/profile-grey.png")
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />
    </Tab.Navigator>
  )
}

export const RootStack = () => {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        component={MainTab}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="LogIn"
        component={LogInScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator initialRouteName="Home">
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  )
}

export const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator initialRouteName="ChatList">
      <ChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Chats" }}
      />
      <ChatStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.otherUser?.username,
          headerBackTitle: "Chats",
        })}
      />
    </ChatStack.Navigator>
  )
}

const styles = StyleSheet.create({
  iconImg: {
    width: 26,
    height: 26,
    marginTop: 20,
  },
  tabBar: {
    height: 60,
  },
})
