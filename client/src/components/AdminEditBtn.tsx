import { StyleSheet, TouchableOpacity } from "react-native"
import React from "react"
import { ViewStyle } from "react-native"
import { colors } from "../global/styles"
import { Image } from "react-native-elements"

interface IProps {
  style: ViewStyle
  onPress: () => void
  isAdminEditing: boolean
}
const AdminEditBtn = (props: IProps) => {
  const { style, onPress, isAdminEditing } = props
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {isAdminEditing ? (
        <Image source={require("../../assets/close.png")} style={styles.img} />
      ) : (
        <Image source={require("../../assets/pencil.png")} style={styles.img} />
      )}
    </TouchableOpacity>
  )
}

export default AdminEditBtn

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
