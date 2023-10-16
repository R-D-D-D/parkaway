import {
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import React from "react"
import { IUser } from "../context"
import { db } from "../firebase"

export interface IBooking {
  createdAt: Timestamp | null
  user: IUser
  parkingLotId: string
  id: string
}

export default function useBooking() {
  const createBooking = async (user: IUser, parkingLotId: string) => {
    await addDoc(collection(db, "bookings"), {
      createdAt: serverTimestamp(),
      user,
      parkingLotId,
    })
  }

  return {
    createBooking,
  }
}
