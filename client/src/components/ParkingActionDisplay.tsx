import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { Image } from "react-native-elements"
import { formatDate } from "../utils/date"
import { colors } from "../global/styles"

interface IProps {
  name: string
  timestamp: Date
  isPark: boolean
  lot: number
}

const ParkingActionDisplay = (props: IProps) => {
  const { name, timestamp, isPark, lot } = props
  return (
    <View style={styles.container}>
      {isPark ? (
        <Image
          source={require("../../assets/park-action.png")}
          style={styles.parkingImg}
        />
      ) : (
        <Image
          source={require("../../assets/leave-action.png")}
          style={styles.parkingImg}
        />
      )}
      <Text style={styles.text}>{formatDate(timestamp, "MM-dd HH:mm")}</Text>
      <Text style={styles.text}>
        {name} {isPark ? "parked at" : "left"} lot {lot}
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
