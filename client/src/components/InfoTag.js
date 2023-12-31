import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { SCREEN_HEIGHT, colors } from "../global/styles"

const InfoTag = (props) => {
  const { text, style } = props
  return (
    <View style={[styles.infoTag, style]}>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  )
}

export default InfoTag

const styles = StyleSheet.create({
  infoTag: {
    width: "40%",
    backgroundColor: colors.grey10,
    alignSelf: "center",
    borderRadius: 5,
  },
  infoText: {
    fontSize: SCREEN_HEIGHT < 700 ? 24 : 30,
    padding: 5,
    alignSelf: "center",
  },
})
