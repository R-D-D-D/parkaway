import React, { useContext, useMemo } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Divider, ListItem } from "react-native-elements"
import { ParkingAction } from "../../api/parking_action"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext } from "../../context"
import { SCREEN_HEIGHT } from "../../global/styles"
import InfoTag from "../InfoTag"
import ParkingActionDisplay from "../ParkingActionDisplay"

interface IProps {
  parkingActions: ParkingAction[]
  parkingLots: ParkingLot[]
}

const AllLotsInfo = (props: IProps) => {
  const { parkingActions, parkingLots } = useContext(AppContext)
  const freeLots = useMemo(
    () =>
      parkingLots
        .map((lot) => lot.totalLots - lot.currUsers.length)
        .reduce((lot, prevLot) => lot + prevLot, 0),
    [parkingLots]
  )

  const totalLots = useMemo(() => {
    return parkingLots
      .map((lot) => lot.totalLots)
      .reduce((lot, prevLot) => lot + prevLot, 0)
  }, [parkingLots])

  const parkingActionDisplay = useMemo(() => {
    return parkingActions.map((action) => (
      <ListItem containerStyle={styles.parkingActionList} key={action.id}>
        <ListItem.Content>
          <ParkingActionDisplay action={action} />
        </ListItem.Content>
      </ListItem>
    ))
  }, [parkingActions])

  return (
    <View>
      <Text style={styles.text1}>Available parking lots</Text>
      <InfoTag text={`${freeLots} / ${totalLots}`} style={styles.infoTag} />
      <Divider style={styles.divider} />
      <ScrollView>{parkingActionDisplay}</ScrollView>
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
