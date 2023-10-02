import { ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useContext, useEffect, useState } from "react"
import { Button, Image } from "react-native-elements"
import { AppContext } from "../context"
import { SCREEN_HEIGHT, SCREEN_WIDTH, colors, title } from "../global/styles"
import { RootStackParamList } from "../navigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import Card from "../components/Card/Card"
import { IconType } from "react-native-dynamic-vector-icons"
import ParkingDurationDisplay from "../components/ParkingDurationDisplay"
import { ActionInfo, parkingActionApi } from "../api/parking_action"

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>

const ProfileScreen = () => {
  const { user, setUser, parkingActions } = useContext(AppContext)
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [filteredParkingActions, setFilteredParkingActions] = useState<
    ActionInfo[][]
  >([])

  useEffect(() => {
    const refreshDisplay = async () => {
      if (user) {
        const userParkingActions = parkingActions.filter(
          (x) => x.userId === user.id
        )
        if (userParkingActions.length > 0) {
          const result: ActionInfo[][] = []
          if (userParkingActions[0].isPark) {
            result.push([userParkingActions.shift()!])
          }
          for (let i = 0; i < userParkingActions.length; i += 2) {
            result.push([userParkingActions[i], userParkingActions[i + 1]])
          }
          setFilteredParkingActions(result)
        }
      }
    }

    refreshDisplay()
  }, [parkingActions])

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.container}>
          <View style={styles.basicInfo}>
            <Image
              source={require("../../assets/man.png")}
              style={styles.profileImg}
            />
            <Text style={styles.username}>{user.username}</Text>
          </View>
          <Text style={styles.subtitle}>Your latest parkings</Text>
          <ScrollView style={{ paddingHorizontal: 30 }}>
            {filteredParkingActions.length > 0 &&
              filteredParkingActions.map((actions: ActionInfo[]) => {
                if (actions.length === 1) {
                  return (
                    <ParkingDurationDisplay
                      parkingAction={actions[0]}
                      key={actions[0].id}
                    />
                  )
                } else if (actions.length === 2) {
                  return (
                    <ParkingDurationDisplay
                      parkingAction={actions[1]}
                      leavingAction={actions[0]}
                      key={actions[0].id}
                    />
                  )
                } else {
                  return null
                }
              })}
          </ScrollView>
          <Button
            title={"Log out"}
            buttonStyle={styles.logoutBtn}
            onPress={() => {
              setUser(null)
              navigation.navigate("LogIn")
            }}
          />
        </View>
      ) : null}
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: SCREEN_WIDTH,
  },
  basicInfo: {
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.1,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  profileImg: {
    width: 100,
    height: 100,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: colors.red,
    // position: "absolute",
    // bottom: 300,
    // left: 100,
    width: 300,
    marginVertical: 8,
    // height: 100,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.grey2,
    alignSelf: "flex-start",
    paddingLeft: 30,
    marginBottom: 10,
  },
})
