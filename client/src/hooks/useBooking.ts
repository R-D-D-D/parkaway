import {
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import React from "react"
import { IUser } from "../context"
import { db } from "../firebase"
import { ParkingLot } from "../api/parking_lot"

export interface IBooking {
  createdAt: Timestamp | null
  user: IUser
  parkingLotId: string
  id: string
}

export default function useBooking() {
  const createBooking = async (user: IUser, parkingLot: ParkingLot) => {
    await addDoc(collection(db, "bookings"), {
      createdAt: serverTimestamp(),
      user,
      parkingLotId: parkingLot.id,
      officeName: parkingLot.officeName,
    })
  }

  return {
    createBooking,
  }
}
