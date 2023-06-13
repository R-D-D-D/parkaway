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
    <View style={styles.container}>
      <Text>
        {free} / {total}
      </Text>
    </View>
  )
}
export default Marker
const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    fontSize: 24,
    backgroundColor: colors.white,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderColor: colors.grey4,
    borderWidth: 1,
  },
})
