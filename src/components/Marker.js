import { StyleSheet, Text, View, Dimensions, Image } from "react-native"
import { colors, parameters } from "../global/styles"

const Marker = (props) => {
  const { total, free } = props

  const getStyle = () => {
    return {
      backgroundColor: free === 0 ? colors.red : colors.green,
    }
  }

  return (
    <View style={StyleSheet.flatten([styles.container, getStyle()])}>
      <View>
        <Text>
          {free} / {total}
        </Text>
      </View>
    </View>
  )
}
export default Marker
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 50,
    height: 20,
    color: colors.white,
  },
})
