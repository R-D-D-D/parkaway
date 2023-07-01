import { StyleSheet, Text, View } from "react-native"
import React from "react"

const ParkingDurationDisplay = () => {
  return (
    <View style={styles.container}>
      <View></View>
      <View style={styles.innerCircle}></View>
      <View>
        <View style={styles.verticalLine} />
      </View>
    </View>
  )
}

export default ParkingDurationDisplay

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginBottom: 40,
    width: 40,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "red",
    backgroundColor: "rgba(0, 0, 0, 0)",
    // position: absolute;
    // top:0;
    // left:0;
    // pointer-events:none;
  },
  verticalLine: {
    borderLeftWidth: 2,
    borderStyle: "solid",
    borderColor: "red",
    height: 6,
    position: "absolute",
    left: "50%",
    marginLeft: 1,
    // top: 0;
  },
})
