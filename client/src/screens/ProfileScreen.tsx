import { ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useContext, useEffect, useState } from "react"
import { Button, Image } from "react-native-elements"
import { AppContext } from "../context"
import { SCREEN_WIDTH, colors } from "../global/styles"
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
  const { user, setUser } = useContext(AppContext)
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [parkingActions, setParkingActions] = useState<ActionInfo[][]>([])

  useEffect(() => {
    const init = async () => {
      if (user) {
        const parkingActions = (
          await parkingActionApi.listParkingAction(99999999)
        ).data.filter((x) => x.userId === user.id)
        if (parkingActions.length > 0) {
          const result: ActionInfo[][] = []
          if (parkingActions[0].isPark) {
            result.push([parkingActions.shift()!])
          }
          for (let i = 0; i < parkingActions.length; i += 2) {
            result.push([parkingActions[i], parkingActions[i + 1]])
          }
          setParkingActions(result)
        }
      }
    }

    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      init()
    })

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

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
          <ScrollView style={{ padding: 30 }}>
            {parkingActions.length > 0 &&
              parkingActions.map((actions: ActionInfo[]) => {
                if (actions.length === 1) {
                  return <ParkingDurationDisplay parkingAction={actions[0]} />
                } else if (actions.length === 2) {
                  return (
                    <ParkingDurationDisplay
                      parkingAction={actions[1]}
                      leavingAction={actions[0]}
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
    marginTop: 120,
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
})
