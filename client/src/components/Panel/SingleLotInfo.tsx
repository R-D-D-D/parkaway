import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { Image, Button } from "react-native-elements"
import { colors } from "../../global/styles"

const SingleLotInfo = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text1}>Available parking lots</Text>
      <View style={styles.avatarRowContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../../assets/man.png")}
            style={styles.avatar}
          />
          <Text>Mark</Text>
          <Text style={styles.timeText}>Here since 16:45</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../../assets/woman.png")}
            style={styles.avatar}
          />
          <Text>Jean</Text>
          <Text style={styles.timeText}>Here since 13:45</Text>
        </View>
      </View>
      <Button
        title="Park"
        buttonStyle={{ backgroundColor: colors.red }}
        containerStyle={{
          width: 200,
          alignSelf: "center",
        }}
        titleStyle={{ color: "white", marginHorizontal: 20 }}
      />
    </View>
  )
}

export default SingleLotInfo

const styles = StyleSheet.create({
  container: {},
  text1: {
    fontSize: 21,
    paddingLeft: 20,
    paddingTop: 20,
  },
  avatarRowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 36,
  },
  avatarContainer: {
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: colors.grey4,
  },
  avatar: {
    width: 80,
    height: 80,
  },
})
