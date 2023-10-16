import { Text, StyleSheet, View } from "react-native"
import React, { Component } from "react"
import { colors, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../global/styles"
import AllLotsInfo from "./AllLotsInfo"
import SingleLotInfo from "./SingleLotInfo"
import { ParkingLot } from "../../api/parking_lot"
import EditParkingLots from "./EditParkingLots"
import { ParkingAction } from "../../api/parking_action"

export enum PanelType {
  AllLotsInfo = 0,
  SingleLotInfo,
  AdminEdit,
}

interface IPanelProps {
  type: PanelType
  isAdminEditing: boolean
  handleCreateParkingLot: (lot: Omit<ParkingLot, "id">) => Promise<void>
  newParkingLot: {
    longitude: number
    latitude: number
  }
  calloutShown: number | null
  parkingLots: ParkingLot[]
  parkingActions: ParkingAction[]
  isTestMode: boolean
}

const Panel = (props: IPanelProps) => {
  const {
    type,
    isAdminEditing,
    handleCreateParkingLot,
    newParkingLot,
    calloutShown,
    parkingLots,
    parkingActions,
    isTestMode,
  } = props
  const isAllLotsInfo = type === PanelType.AllLotsInfo
  return (
    <View style={styles.container}>
      {isAdminEditing ? (
        <EditParkingLots
          handleCreateParkingLot={handleCreateParkingLot}
          newParkingLot={newParkingLot}
        />
      ) : isAllLotsInfo ? (
        <AllLotsInfo
          parkingActions={parkingActions}
          parkingLots={parkingLots}
        />
      ) : (
        <SingleLotInfo
          calloutShown={calloutShown}
          parkingLots={parkingLots}
          isTestMode={isTestMode}
          parkingActions={parkingActions}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 0,
  },
})

export default Panel
