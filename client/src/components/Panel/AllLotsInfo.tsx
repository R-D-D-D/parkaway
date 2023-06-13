import { StyleSheet, Text, View, ScrollView } from "react-native"
import React from "react"
import InfoTag from "../InfoTag"
import { Divider, ListItem } from "react-native-elements"
import ParkingActionDisplay, { ParkingAction } from "../ParkingActionDisplay"
const AllLotsInfo = () => {
  return (
    <View>
      <Text style={styles.text1}>Available parking lots</Text>
      <InfoTag text={"2 / 10"} style={styles.infoTag} />
      <Divider style={styles.divider} />
      <ScrollView>
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
      </ScrollView>
    </View>
  )
}

export default AllLotsInfo

const styles = StyleSheet.create({
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
