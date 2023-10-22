import {
  FieldValue,
  Timestamp,
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { IUser } from "../context"
import { db } from "../firebase"

export type Subscription = {
  offices: { name: string }[]
}

export const subscriptionApi = {
  updateSubscription: async (
    id: string,
    subscription: Subscription
  ): Promise<void> => {
    await setDoc(doc(db, "subscriptions", id), subscription)
  },
}
