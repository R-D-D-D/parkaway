import React, { useContext } from "react"
import { AppContext, IUser } from "../context"
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "../firebase"
import { ParkingLot } from "../api/parking_lot"

export enum NotificationType {
  SWAP_REQUEST = 1,
  USER_LEFT,
  USER_LEAVING,
}

export interface INotification {
  id: string
  title: string
  description: string
  receiveUser: IUser
  originUser: IUser
  isChecked: boolean
  type: NotificationType
}

export interface IBroadcastNotification {
  id: string
  title: string
  description: string
  originUser: IUser
  type: NotificationType
  parkingLotId: string
  createdAt: Timestamp | null
}

export interface IBottomsheetNotification {
  id: string
  title: string
  description: string
  onConfirm?: () => void
  onCancel?: () => void
}

export interface IBroadcastRead {
  user: IUser
  readUntil: Timestamp | null
  createdAt: Timestamp | null
}

export default function useNotification() {
  const broadcastLeavingAction = async (
    user: IUser,
    parkingLot: ParkingLot,
    type: NotificationType
  ) => {
    const isLeaving = type === NotificationType.USER_LEAVING
    addDoc(collection(db, "broadcast_notifications"), {
      title: isLeaving
        ? `${user.username} is leaving soon!`
        : "A lot is available!",
      description: `User ${user?.username} ${
        isLeaving ? "is leaving" : "has left"
      } lot ${
        parkingLot.lotName
      }, tap on the button below to book/park at the lot`,
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
