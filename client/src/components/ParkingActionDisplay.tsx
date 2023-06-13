import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { Image } from "react-native-elements"
import { formatDate } from "../utils/date"
import { colors } from "../global/styles"

export enum ParkingAction {
  Leave = 0,
  Park,
}

interface IProps {
  name: string
  timestamp: Date
  action: ParkingAction
  lot: number
}

const ParkingActionDisplay = (props: IProps) => {
  const { name, timestamp, action, lot } = props
  const isLeave = action === ParkingAction.Leave
  return (
    <View style={styles.container}>
      {isLeave ? (
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
      <Text style={styles.text}>{formatDate(timestamp, "MM-dd HH:mm")}</Text>
      <Text style={styles.text}>
        {name} {isLeave ? "left" : "parked at"} lot {lot}
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
