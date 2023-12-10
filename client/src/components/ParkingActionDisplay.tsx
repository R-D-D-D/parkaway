import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Image } from "react-native-elements"
import { ParkingAction } from "../api/parking_action"
import { formatDate } from "../utils/date"

interface IProps {
  action: ParkingAction
}

const ParkingActionDisplay = (props: IProps) => {
  const {
    action: { isPark, createdAt, user, parkingLot },
  } = props
  if (props.action) {
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
          {createdAt && formatDate(createdAt.toDate(), "HH:mm")}
        </Text>
        <Text style={styles.text} numberOfLines={1}>
          {user.username} {isPark ? "parked at" : "left"}{" "}
          {parkingLot.officeName}, {parkingLot.lotName}
        </Text>
      </View>
    )
  }
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
