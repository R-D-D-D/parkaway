import { Text, StyleSheet, View } from "react-native"
import React, { Component, useContext } from "react"
import { colors, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../global/styles"
import AllLotsInfo from "./AllLotsInfo"
import SingleLotInfo from "./SingleLotInfo"
import { ParkingLot } from "../../api/parking_lot"
import EditParkingLots from "./EditParkingLots"
import { ParkingAction } from "../../api/parking_action"
import OfficeInfo from "./OfficeInfo"
import { AppContext } from "../../context"

export enum PanelType {
  SINGLE_LOT_INFO = 1,
  ALL_LOTS_INFO,
  EDIT_PARKING_LOT,
  OFFICE_INFO,
}

interface IPanelProps {
  type: PanelType
  handleCreateParkingLot: (lot: Omit<ParkingLot, "id">) => Promise<void>
  newParkingLot: {
    longitude: number
    latitude: number
  }
  isTestMode: boolean
  office: [string, ParkingLot[]] | null
}

const Panel = (props: IPanelProps) => {
  const { type, handleCreateParkingLot, newParkingLot, isTestMode, office } =
    props
  const { parkingLots, parkingActions } = useContext(AppContext)

  const render = () => {
    switch (type) {
      case PanelType.ALL_LOTS_INFO:
        return (
          <AllLotsInfo
            parkingActions={parkingActions}
            parkingLots={parkingLots}
          />
        )
      case PanelType.SINGLE_LOT_INFO:
        return (
          <SingleLotInfo
            parkingLots={parkingLots}
            isTestMode={isTestMode}
            parkingActions={parkingActions}
          />
        )
      case PanelType.OFFICE_INFO:
        return <OfficeInfo office={office} />
      case PanelType.EDIT_PARKING_LOT:
        return (
          <EditParkingLots
            handleCreateParkingLot={handleCreateParkingLot}
            newParkingLot={newParkingLot}
          />
        )
      default:
        return (
          <AllLotsInfo
            parkingActions={parkingActions}
            parkingLots={parkingLots}
          />
        )
    }
  }

  return <View style={styles.container}>{render()}</View>
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
