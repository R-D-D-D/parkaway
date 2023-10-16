import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore"
import { IUser } from "../context"
import { ParkingLot } from "./parking_lot"
import { db } from "../firebase"

export type ParkingAction = {
  id: string
  isPark: boolean
  user: IUser
  parkingLot: ParkingLot
  createdAt: Timestamp | null
}

export const parkingActionApi = {
  createParkingAction: async (
    params: Omit<ParkingAction, "id">
  ): Promise<void> => {
    const parkingLotDocRef = doc(db, "parking_lots", params.parkingLot.id)
    const parkingLotDoc = await getDoc(parkingLotDocRef)
    if (!parkingLotDoc.exists()) {
      throw "Document does not exist!"
    }
    let newCurrUsers: IUser[]
    if (params.isPark) {
      newCurrUsers = [...parkingLotDoc.data().currUsers, params.user]
    } else {
      newCurrUsers = (parkingLotDoc.data().currUsers as IUser[]).filter(
        (x) => x.id !== params.user.id
      )
    }
    await updateDoc(parkingLotDocRef, { currUsers: newCurrUsers })
    await addDoc(collection(db, "parking_actions"), params)
  },
}
