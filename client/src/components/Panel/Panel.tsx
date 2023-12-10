import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, {
  useContext
} from "react"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext } from "../../context"
import AllLotsInfo from "./AllLotsInfo"
import EditParkingLots from "./EditParkingLots"
import OfficeInfo from "./OfficeInfo"
import SingleLotInfo from "./SingleLotInfo"

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
  bottomSheetRef: React.RefObject<BottomSheetMethods>
}

const Panel = (props: IPanelProps) => {
  const {
    type,
    handleCreateParkingLot,
    newParkingLot,
    isTestMode,
    office,
    bottomSheetRef,
  } = props
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
            bottomSheetRef={bottomSheetRef}
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

  return <>{render()}</>
}

export default Panel
