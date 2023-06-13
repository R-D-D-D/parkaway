import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React from "react"
import { Image } from "react-native-elements"
import { ViewStyle } from "react-native"
import { colors } from "../global/styles"

interface IProps {
  style: ViewStyle
  onPress: () => void
}
const RecenterBtn = (props: IProps) => {
  const { style, onPress } = props
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Image
        source={require("../../assets/navigation.png")}
        style={styles.img}
      />
    </TouchableOpacity>
  )
}

export default RecenterBtn

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    padding: 16,
    backgroundColor: colors.white,
    borderColor: colors.grey4,
    borderWidth: 1,
  },
  img: {
    width: 20,
    height: 20,
  },
})
