import * as React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "./screens/HomeScreen"
import LogInScreen from "./screens/LogInScreen"
import ProfileScreen from "./screens/ProfileScreen"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Image } from "react-native-elements"
import { StyleSheet } from "react-native"

export type RootStackParamList = {
  LogIn: undefined
  Main: { screen: string }
}

export type RootTabParamList = {
  Profile: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

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
