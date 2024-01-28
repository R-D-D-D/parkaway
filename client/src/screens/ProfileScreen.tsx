import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useContext, useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Button, Dialog, Image } from "react-native-elements"
import { Notifier } from "react-native-notifier"
import { ParkingAction } from "../api/parking_action"
import ParkingDurationDisplay from "../components/ParkingDurationDisplay"
import { AppContext } from "../context"
import { SCREEN_HEIGHT, SCREEN_WIDTH, colors } from "../global/styles"
import { RootStackParamList } from "../navigation"
import Icon, { IconType } from "react-native-dynamic-vector-icons"
import { userApi } from "../api/user"

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>

const ProfileScreen = () => {
  const { user, setUser, parkingActions } = useContext(AppContext)
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [filteredParkingActions, setFilteredParkingActions] = useState<
    ParkingAction[][]
  >([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const refreshDisplay = async () => {
      if (user) {
        const userParkingActions = parkingActions.filter(
          (x) => x.user.id === user.id
        )
        if (userParkingActions.length > 0) {
          const result: ParkingAction[][] = []
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
          <View
            style={{
              marginLeft: "auto",
              marginRight: 10,
              marginTop: SCREEN_HEIGHT * 0.07,
            }}
          >
            <Icon
              name={"delete"}
              type={IconType.MaterialCommunityIcons}
              size={30}
              onPress={() => setVisible(true)}
            />
          </View>
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
              filteredParkingActions.map((actions: ParkingAction[]) => {
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
              Notifier.clearQueue(true)
            }}
          />
          <Dialog
            isVisible={visible}
            onBackdropPress={() => setVisible(!visible)}
          >
            <Dialog.Title title="Are you sure to delete your account?" />
            <Dialog.Actions>
              <Dialog.Button
                title="CONFIRM"
                onPress={async () => {
                  await userApi.deleteUser()
                  setVisible(!visible)
                  setUser(null)
                  navigation.navigate("LogIn")
                  Notifier.clearQueue(true)
                }}
              />
              <Dialog.Button
                title="CANCEL"
                onPress={() => setVisible(!visible)}
              />
            </Dialog.Actions>
          </Dialog>
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
