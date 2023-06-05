import { Text, StyleSheet, View } from "react-native"
import React, { Component } from "react"
import { colors, parameters } from "../global/styles"
import InfoTag from "./InfoTag"
import { Divider, ListItem } from "react-native-elements"
import ParkingActionDisplay, { ParkingAction } from "./ParkingActionDisplay"

export default class Panel extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text1}>Available parking lots</Text>
        <InfoTag text={"2 / 10"} style={styles.infoTag} />
        <Divider style={styles.divider} />
        <ListItem containerStyle={styles.parkingActionList}>
          <ListItem.Content>
            <ParkingActionDisplay
              action={ParkingAction.Leave}
              timestamp={new Date()}
              name={"Darren"}
              lot={1}
            />
          </ListItem.Content>
        </ListItem>
        <ListItem containerStyle={styles.parkingActionList}>
          <ListItem.Content>
            <ParkingActionDisplay
              action={ParkingAction.Park}
              timestamp={new Date()}
              name={"Janice"}
              lot={2}
            />
          </ListItem.Content>
        </ListItem>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 0,
  },
  text1: {
    fontSize: 21,
    paddingLeft: 20,
    paddingTop: 20,
  },
  infoTag: {
    marginVertical: 16,
  },
  divider: {
    width: "90%",
    alignSelf: "center",
  },
  parkingActionList: {
    paddingHorizontal: 24,
  },
})
