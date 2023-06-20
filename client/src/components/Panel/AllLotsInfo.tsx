import { StyleSheet, Text, View, ScrollView } from "react-native"
import React from "react"
import InfoTag from "../InfoTag"
import { Divider, ListItem } from "react-native-elements"
import ParkingActionDisplay from "../ParkingActionDisplay"
import { ParkingAction } from "../../api/parking_action"
import { ParkingLot } from "../../api/parking_lot"

interface IProps {
  parkingActions: ParkingAction[]
  parkingLots: ParkingLot[]
}
const AllLotsInfo = (props: IProps) => {
  const { parkingActions, parkingLots } = props
  console.log("Parking actions: ======", parkingActions)
  const calculateFreeLots = (): number => {
    return parkingLots
      .map((lot) => lot.freeLots)
      .reduce((lot, prevLot) => lot + prevLot)
  }

  const calculateTotalLots = (): number => {
    return parkingLots
      .map((lot) => lot.totalLots)
      .reduce((lot, prevLot) => lot + prevLot)
  }

  return (
    <View>
      <Text style={styles.text1}>Available parking lots</Text>
      <InfoTag
        text={`${calculateFreeLots()} / ${calculateTotalLots()}`}
        style={styles.infoTag}
      />
      <Divider style={styles.divider} />
      <ScrollView>
        {parkingActions.map((action) => (
          <ListItem containerStyle={styles.parkingActionList} key={action.id}>
            <ListItem.Content>
              <ParkingActionDisplay
                isPark={action.isPark}
                timestamp={new Date(action.createdAt * 1000)}
                name={`${action.userId}`}
                lot={action.parkingLotId}
              />
            </ListItem.Content>
          </ListItem>
        ))}
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
