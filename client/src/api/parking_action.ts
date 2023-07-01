import { IUser } from "../context"
import { ApiResponse, request } from "./common"
import { ParkingLot } from "./parking_lot"

export type ParkingAction = {
  id: number
  isPark: boolean
  userId: number
  parkingLotId: number
  createdAt: number
}

export type ActionInfo = ParkingAction & ParkingLot & IUser

export const parkingActionApi = {
  createParkingAction: async (
    params: Omit<ParkingAction, "id" | "createdAt">
  ): Promise<ApiResponse<void>> => {
    return (await request.post<ApiResponse<void>>("/parking-actions", params))
      .data
  },

  listParkingAction: async (
    limit: number
  ): Promise<ApiResponse<ActionInfo[]>> => {
    return (
      await request.get<ApiResponse<ActionInfo[]>>("/parking-actions", {
        params: {
          limit,
        },
      })
    ).data
  },
}
