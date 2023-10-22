import React, { useContext } from "react"
import { AppContext, IUser, NotificationType } from "../context"
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "../firebase"
import { ParkingLot } from "../api/parking_lot"

export default function useNotification() {
  const broadcastLeavingAction = async (
    user: IUser,
    parkingLot: ParkingLot,
    type: NotificationType
  ) => {
    const isLeaving = type === NotificationType.USER_LEAVING
    addDoc(collection(db, "broadcast_notifications"), {
      title: isLeaving ? "A user is leaving soon!" : "A lot is available!",
      description: `User ${user?.username} ${
        isLeaving ? "is leaving" : "has left"
      } lot ${parkingLot.lotName}`,
      originUser: user,
      parkingLotId: parkingLot.id,
      officeName: parkingLot.officeName,
      type,
      createdAt: serverTimestamp(),
    })
  }

  const createSwapRequestNotification = async (
    user: IUser,
    otherUser: IUser
  ) => {
    await addDoc(collection(db, "notifications"), {
      title: "You have a swap request!",
      description: `User ${user?.username} wants to swap parking lot with you, chat with him now'`,
      receiveUser: otherUser,
      originUser: user,
      isChecked: false,
      type: NotificationType.SWAP_REQUEST,
    })
  }

  const markIndividualNotiAsSeen = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { isChecked: true })
  }

  const updateBroadcastReadTime = async (user: IUser) => {
    await updateDoc(doc(db, "broadcast_reads", `${user.id}`), {
      readUntil: serverTimestamp(),
    })
  }

  return {
    broadcastLeavingAction,
    createSwapRequestNotification,
    markIndividualNotiAsSeen,
    updateBroadcastReadTime,
  }
}
