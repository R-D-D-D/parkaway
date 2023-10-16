import { createContext, useEffect, useState } from "react"
import { ParkingAction, parkingActionApi } from "./api/parking_action"
import { SigninInfo, SignupInfo } from "./screens/LogInScreen"
import { ParkingLot, parkingApi } from "./api/parking_lot"
import { auth } from "./firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { GoogleAuthProvider, signInWithRedirect, User } from "firebase/auth"
import { useQuery } from "@tanstack/react-query"
import { Notifier, Easing } from "react-native-notifier"
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  setDoc,
  doc,
  where,
  or,
  getDocs,
  addDoc,
  getDoc,
  and,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { useNavigation } from "@react-navigation/native"
import useNotification from "./hooks/useNotification"
import dayjs from "dayjs"

export interface IUser {
  username: string
  email: string
  userPassword: string
  createdAt: string
  isAdmin: boolean
  id: number
}

interface IContext {
  // user: User | null | undefined
  user: IUser | null
  setUser: (user: IUser | null) => void
  parkingActions: ParkingAction[]
  setParkingActions: (actions: ParkingAction[]) => void
  parkingLots: ParkingLot[]
  setParkingLots: (lots: ParkingLot[]) => void
  calloutShown: number | null
  setCalloutShown: (callout: number | null) => void
}

type IProps = {
  children: JSX.Element
}

export enum NotificationType {
  SWAP_REQUEST = 1,
  LOT_AVAILABLE,
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

export interface IBroadcastRead {
  user: IUser
  readUntil: Timestamp | null
  createdAt: Timestamp | null
}

export const AppContext = createContext<IContext>({
  user: null,
  setUser: (user: IUser | null) => {},
  parkingActions: [],
  setParkingActions: (actions: ParkingAction[]) => {},
  parkingLots: [],
  setParkingLots: (lots: ParkingLot[]) => {},
  calloutShown: null,
  setCalloutShown: (callout: null | number) => {},
})

export const AppContextProvider = ({ children }: IProps) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [parkingActions, setParkingActions] = useState<ParkingAction[]>([])
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [broadcastNotifications, setBroadcastNotifications] = useState<
    IBroadcastNotification[]
  >([])
  const [broadcastRead, setBroadcastRead] = useState<IBroadcastRead | null>(
    null
  )
  const { markIndividualNotiAsSeen, updateBroadcastReadTime } =
    useNotification()
  const [calloutShown, setCalloutShown] = useState<number | null>(null)
  const navigation = useNavigation()

  useEffect(() => {
    if (user) {
      const unsubscribeArr = []

      unsubscribeArr.push(
        onSnapshot(collection(db, "parking_lots"), (querySnapshot) => {
          const parkingLots: ParkingLot[] = []
          querySnapshot.forEach((doc) => {
            parkingLots.push({ ...doc.data(), id: doc.id } as ParkingLot)
          })
          setParkingLots(parkingLots)
        })
      )
      const parkingActionsQuery = query(
        collection(db, "parking_actions"),
        orderBy("createdAt", "desc")
      )
      unsubscribeArr.push(
        onSnapshot(parkingActionsQuery, (querySnapshot) => {
          const parkingActions: ParkingAction[] = []
          querySnapshot.forEach((doc) => {
            parkingActions.push({ ...doc.data(), id: doc.id } as ParkingAction)
          })
          setParkingActions(parkingActions)
        })
      )

      const notificationQuery = query(
        collection(db, "notifications"),
        and(
          where("receiveUser.id", "==", user.id),
          where("isChecked", "==", false)
        )
      )

      unsubscribeArr.push(
        onSnapshot(notificationQuery, (notificationSnapshot) => {
          const fetchedNotifications: INotification[] = []
          notificationSnapshot.forEach((doc) => {
            fetchedNotifications.push({
              ...doc.data(),
              id: doc.id,
            } as INotification)
          })
          const needReplace = !fetchedNotifications.every((el) => {
            return notifications.map((noti) => noti.id).includes(el.id)
          })
          if (needReplace) setNotifications(fetchedNotifications)
        })
      )

      unsubscribeArr.push(
        onSnapshot(
          doc(db, "broadcast_reads", `${user.id}`),
          (querySnapshot) => {
            if (querySnapshot.exists()) {
              setBroadcastRead(querySnapshot.data() as IBroadcastRead)
            } else {
              setDoc(doc(db, "broadcast_reads", `${user.id}`), {
                user,
                readUntil: serverTimestamp(),
                createdAt: serverTimestamp(),
              })
            }
          }
        )
      )

      return () => unsubscribeArr.forEach((unsubscribe) => unsubscribe())
    }
  }, [user])

  useEffect(() => {
    // console.log("broadcastRead1: ", broadcastRead)
    if (broadcastRead && broadcastRead.readUntil) {
      // console.log("broadcastRead2: ", broadcastRead)
      const broadcastNotificationsQuery = query(
        collection(db, "broadcast_notifications"),
        and(
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(broadcastRead.readUntil.toDate())
          ),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(dayjs().subtract(10, "minute").toDate())
          )
        )
      )

      const unsubscribe = onSnapshot(
        broadcastNotificationsQuery,
        (broadcastSnapshot) => {
          let fetchedNotifications: IBroadcastNotification[] = []
          broadcastSnapshot.forEach((doc) => {
            fetchedNotifications.push({
              ...doc.data(),
              id: doc.id,
            } as IBroadcastNotification)
          })
          fetchedNotifications = fetchedNotifications.filter(
            (x) => String(x.originUser.id) !== String(user?.id)
          )
          const needReplace = !fetchedNotifications.every((el) => {
            return broadcastNotifications.map((noti) => noti.id).includes(el.id)
          })
          if (needReplace) setBroadcastNotifications(fetchedNotifications)
        }
      )
      return () => unsubscribe()
    }
  }, [broadcastRead])

  useEffect(() => {
    if (user) {
      if (notifications.length > 0) {
        for (const noti of notifications) {
          if (noti.type === NotificationType.SWAP_REQUEST) {
            Notifier.showNotification({
              title: noti.title,
              description: noti.description,
              duration: 0,
              showAnimationDuration: 800,
              showEasing: Easing.bounce,
              onHidden: () => {
                markIndividualNotiAsSeen(noti.id)
              },
              onPress: () => {
                markIndividualNotiAsSeen(noti.id)
                navigation.navigate("ChatStack", {
                  screen: "Chat",
                  params: {
                    otherUser: noti.originUser,
                    fromMain: true,
                  },
                })
              },
              hideOnPress: true,
              queueMode: "standby",
            })
          }
        }
      }
      if (broadcastNotifications.length > 0) {
        for (const noti of broadcastNotifications) {
          if (noti.type === NotificationType.LOT_AVAILABLE) {
            Notifier.showNotification({
              title: noti.title,
              description: noti.description,
              duration: 5000,
              showAnimationDuration: 800,
              showEasing: Easing.bounce,
              onHidden: () => {
                updateBroadcastReadTime(user)
              },
              onPress: () => {
                updateBroadcastReadTime(user)
                navigation.navigate("Home")
              },
              hideOnPress: true,
              queueMode: "standby",
            })
          }
        }
      }
    }
  }, [notifications, broadcastNotifications])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        parkingActions,
        setParkingActions,
        parkingLots,
        setParkingLots,
        calloutShown,
        setCalloutShown,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
