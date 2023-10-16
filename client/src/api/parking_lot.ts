import {
  FieldValue,
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import { IUser } from "../context"
import { ApiResponse, request } from "./common"
import { db } from "../firebase"

export type ParkingLot = {
  id: string
  lotName: string
  officeName: string
  totalLots: number
  latitude: number
  longitude: number
  currUsers: IUser[]
  createdAt: Timestamp | null
}

export const parkingApi = {
  createParkingLot: async (params: Omit<ParkingLot, "id">): Promise<void> => {
    await addDoc(collection(db, "parking_lots"), params)
  },
}
