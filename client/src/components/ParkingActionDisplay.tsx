import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { Image } from "react-native-elements"
import { formatDate } from "../utils/date"
import { colors } from "../global/styles"
import { ActionInfo } from "../api/parking_action"

interface IProps {
  action: ActionInfo
}

const ParkingActionDisplay = (props: IProps) => {
  const {
    action: { isPark, createdAt, username, lotName, officeName },
  } = props
  return (
    <View style={styles.container}>
      {isPark ? (
        <Image
          source={require("../../assets/leave-action.png")}
          style={styles.parkingImg}
        />
      ) : (
        <Image
          source={require("../../assets/park-action.png")}
          style={styles.parkingImg}
        />
      )}
      <Text style={styles.text}>
        {formatDate(new Date(createdAt * 1000), "HH:mm")}
      </Text>
      <Text style={styles.text} numberOfLines={1}>
        {username} {isPark ? "parked at" : "left"} {officeName} office, lot{" "}
        {lotName}
      </Text>
    </View>
  )
}

export default ParkingActionDisplay

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  parkingImg: {
    width: 30,
    height: 30,
  },
  text: {
    marginLeft: 8,
  },
})
