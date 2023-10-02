import * as React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "./screens/HomeScreen"
import LogInScreen from "./screens/LogInScreen"
import ProfileScreen from "./screens/ProfileScreen"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Image } from "react-native-elements"
import { StyleSheet } from "react-native"
import ChatScreen, { Chatroom } from "./screens/ChatScreen"
import { IUser } from "./context"
import ChatListScreen from "./screens/ChatListScreen"

export type RootStackParamList = {
  LogIn: undefined
  Main: { screen: string }
}

export type ChatStackParamList = {
  Chat: {
    otherUserId: string
    chatroom?: Chatroom
  }
  ChatList: undefined
}

export type RootTabParamList = {
  Profile: undefined
  Home: undefined
  ChatStack: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()
const ChatStack = createNativeStackNavigator<ChatStackParamList>()

export const MainTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ tabBarStyle: styles.tabBar }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
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
    <NavigationContainer>
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
    </NavigationContainer>
  )
}

export const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator initialRouteName="ChatList">
      <ChatStack.Screen name="Chat" component={ChatScreen} />
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
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
