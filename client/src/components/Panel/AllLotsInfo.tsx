import { StyleSheet, Text, View, ScrollView } from "react-native"
import React, { useContext } from "react"
import InfoTag from "../InfoTag"
import { Divider, ListItem } from "react-native-elements"
import ParkingActionDisplay from "../ParkingActionDisplay"
import { ParkingAction } from "../../api/parking_action"
import { ParkingLot } from "../../api/parking_lot"
import { SCREEN_HEIGHT } from "../../global/styles"
import { AppContext } from "../../context"

interface IProps {
  parkingActions: ParkingAction[]
  parkingLots: ParkingLot[]
}

const AllLotsInfo = (props: IProps) => {
  const { parkingActions, parkingLots } = useContext(AppContext)
  const calculateFreeLots = (): number => {
    return parkingLots
      .map((lot) => lot.totalLots - lot.currUsers.length)
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
    fontSize: SCREEN_HEIGHT < 700 ? 18 : 21,
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
