import { createContext } from "react"

export interface IUser {
  username: string
  email: string
  userPassword: string
  createdAt: string
  id: number
}

interface IContext {
  user: IUser | null
  setUser: (user: IUser) => void
}

export const AppContext = createContext<IContext>({
  user: null,
  setUser: (user: IUser) => {},
})
