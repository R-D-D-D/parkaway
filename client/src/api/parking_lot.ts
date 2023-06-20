import { IUser } from "../context"
import { ApiResponse, request } from "./common"

export type ParkingLot = {
  id: number
  lotName: string
  officeName: string
  totalLots: number
  latitude: number
  longitude: number
  freeLots: number
  currUsers: IUser[]
}

export const parkingApi = {
  createParkingLot: async (
    params: Omit<ParkingLot, "id">
  ): Promise<ApiResponse<ParkingLot>> => {
    return (
      await request.post<ApiResponse<ParkingLot>>("/parking-lots", params)
    ).data
  },

  listParkingLots: async (): Promise<ApiResponse<ParkingLot[]>> => {
    return (await request.get<ApiResponse<ParkingLot[]>>("/parking-lots")).data
  },
}
