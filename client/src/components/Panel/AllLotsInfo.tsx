import { StyleSheet, Text, View, ScrollView } from "react-native"
import React from "react"
import InfoTag from "../InfoTag"
import { Divider, ListItem } from "react-native-elements"
import ParkingActionDisplay from "../ParkingActionDisplay"
import { ActionInfo, ParkingAction } from "../../api/parking_action"
import { ParkingLot } from "../../api/parking_lot"

interface IProps {
  parkingActions: ActionInfo[]
  parkingLots: ParkingLot[]
}

const AllLotsInfo = (props: IProps) => {
  const { parkingActions, parkingLots } = props
  const calculateFreeLots = (): number => {
    return parkingLots
      .map((lot) => lot.freeLots)
      .reduce((lot, prevLot) => lot + prevLot, 0)
  }

  const calculateTotalLots = (): number => {
    return parkingLots
      .map((lot) => lot.totalLots)
      .reduce((lot, prevLot) => lot + prevLot, 0)
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
              <ParkingActionDisplay action={action} />
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
