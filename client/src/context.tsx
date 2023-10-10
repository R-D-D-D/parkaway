import { createContext, useEffect, useState } from "react"
import { ActionInfo, parkingActionApi } from "./api/parking_action"
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
} from "firebase/firestore"
import { db } from "./firebase"
import { useNavigation } from "@react-navigation/native"

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
  parkingActions: ActionInfo[]
  setParkingActions: (actions: ActionInfo[]) => void
  parkingLots: ParkingLot[]
  setParkingLots: (lots: ParkingLot[]) => void
}

type IProps = {
  children: JSX.Element
}

export enum NotificationType {
  SWAP_REQUEST = 1,
}

interface INotification {
  id: string
  title: string
  description: string
  receiveUser: IUser
  originUser: IUser
  isChecked: boolean
  type: NotificationType
}

export const AppContext = createContext<IContext>({
  user: null,
  setUser: (user: IUser | null) => {},
  parkingActions: [],
  setParkingActions: (actions: ActionInfo[]) => {},
  parkingLots: [],
  setParkingLots: (lots: ParkingLot[]) => {},
})

export const AppContextProvider = ({ children }: IProps) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [parkingActions, setParkingActions] = useState<ActionInfo[]>([])
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [notifications, setNotifications] = useState<INotification[]>([])
  const navigation = useNavigation()
  // const [user] = useAuthState(auth)
  const { data } = useQuery({
    queryKey: ["query"],
    queryFn: async () => {
      if (user) {
        const [lots, parkingActions] = await Promise.all([
          parkingApi.listParkingLots(),
          parkingActionApi.listParkingAction(20),
        ])
        // const lots = (await parkingApi.listParkingLots()).data
        // const parkingActions = (await parkingActionApi.listParkingAction(20)).data
        setParkingLots(lots.data)
        setParkingActions(parkingActions.data)
        return [lots, parkingActions]
      } else {
        return null
      }
    },
    refetchInterval: 1000,
  })

  useEffect(() => {
    if (user) {
      const notificationQuery = query(
        collection(db, "notifications"),
        and(
          where("receiveUser.id", "==", user.id),
          where("isChecked", "==", false)
        )
      )

      const unsubscribe = onSnapshot(
        notificationQuery,
        (notificationSnapshot) => {
          const fetchedNotifications: INotification[] = []
          notificationSnapshot.forEach((doc) => {
            if (doc.data().isChecked === false) {
              fetchedNotifications.push({
                ...doc.data(),
                id: doc.id,
              } as INotification)
            }
          })
          console.log(fetchedNotifications, user.id)
          const needReplace = !fetchedNotifications.every((el) => {
            return notifications.map((noti) => noti.id).includes(el.id)
          })
          console.log(needReplace)
          if (needReplace) setNotifications(fetchedNotifications)
        }
      )

      return () => unsubscribe()
    }
  }, [user])

  const markNotiAsSeen = (id: string) => {
    updateDoc(doc(db, "notifications", id), { isChecked: true })
  }

  useEffect(() => {
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
              markNotiAsSeen(noti.id)
            },
            onPress: () => {
              markNotiAsSeen(noti.id)
              navigation.navigate("ChatStack", {
                screen: "Chat",
                params: {
                  otherUser: noti.originUser,
                },
              })
            },
            hideOnPress: true,
            queueMode: "standby",
          })
        }
      }
    }
  }, [notifications])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        parkingActions,
        setParkingActions,
        parkingLots,
        setParkingLots,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
