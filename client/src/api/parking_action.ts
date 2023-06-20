import { ApiResponse, request } from "./common"

export type ParkingAction = {
  id: number
  isPark: boolean
  userId: number
  parkingLotId: number
  createdAt: number
}

export const parkingActionApi = {
  createParkingAction: async (
    params: Omit<ParkingAction, "id" | "createdAt">
  ): Promise<ApiResponse<void>> => {
    return (await request.post<ApiResponse<void>>("/parking-actions", params))
      .data
  },
}
