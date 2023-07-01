import { StyleSheet, Text, View } from "react-native"
import React, { useContext } from "react"
import { Button, Image } from "react-native-elements"
import { AppContext } from "../context"
import { colors } from "../global/styles"
import { RootStackParamList } from "../navigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import Card from "../components/Card/Card"
import { IconType } from "react-native-dynamic-vector-icons"
import ParkingDurationDisplay from "../components/ParkingDurationDisplay"

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>

const ProfileScreen = () => {
  const { user, setUser } = useContext(AppContext)
  const navigation = useNavigation<HomeScreenNavigationProp>()

  return (
    <View style={styles.container}>
      {user ? (
        <View>
          <View style={styles.basicInfo}>
            <Image
              source={require("../../assets/man.png")}
              style={styles.profileImg}
            />
            <Text style={styles.username}>{user.username}</Text>
          </View>
          <Card
            iconName="parking"
            iconType={IconType.MaterialCommunityIcons}
            title={"12"}
            description={"hey"}
            containerHeight={60}
          />
          <ParkingDurationDisplay />
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
    // height: 100,
  },
})
