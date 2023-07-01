import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React from "react"
import { ViewStyle } from "react-native"
import { colors } from "../global/styles"

interface IProps {
  style: ViewStyle
  onPress: () => void
  children: JSX.Element
}
const FloatingMenuBtn = (props: IProps) => {
  const { style, onPress, children } = props
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  )
}

export default FloatingMenuBtn

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
