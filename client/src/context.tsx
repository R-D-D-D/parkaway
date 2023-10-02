import { createContext, useState } from "react"
import { ActionInfo } from "./api/parking_action"
import { SigninInfo, SignupInfo } from "./screens/LogInScreen"
import { ParkingLot } from "./api/parking_lot"
import { auth } from "./firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { GoogleAuthProvider, signInWithRedirect, User } from "firebase/auth"

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
  setUser: (user: IUser) => void
  parkingActions: ActionInfo[]
  setParkingActions: (actions: ActionInfo[]) => void
  parkingLots: ParkingLot[]
  setParkingLots: (lots: ParkingLot[]) => void
}

type IProps = {
  children: JSX.Element
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
  // const [user] = useAuthState(auth)

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
